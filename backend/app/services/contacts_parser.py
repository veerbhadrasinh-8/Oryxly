"""Parse uploaded contact files (CSV/XLSX/XLS) into structured rows."""

from __future__ import annotations

import csv
import io
import re
from dataclasses import dataclass, field
from typing import Iterable

import openpyxl
import xlrd
from email_validator import EmailNotValidError, validate_email

# Header aliases — we look these up case-insensitively, trimmed.
EMAIL_KEYS = {
    "email",
    "e-mail",
    "mail",
    "email address",
    "email_address",
    "emailaddress",
    "work email",
    "business email",
    "contact email",
    "primary email",
    "personal email",
}

# Pull the first email-looking token out of a cell that may contain extra junk.
# Examples handled: "info@example.com sites.google", "<info@example.com>",
# "name <a@b.com>", "a@b.com; c@d.com" (picks first), trailing punctuation.
_EMAIL_TOKEN = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
NAME_KEYS = {
    "name",
    "full name",
    "full_name",
    "contact",
    "contact name",
    "first name",
    "person",
    "owner",
    "owner name",
}
COMPANY_KEYS = {
    "company",
    "organisation",
    "organization",
    "org",
    "company name",
    "business",
    "business name",
    "firm",
    "agency",
}
PHONE_KEYS = {
    "phone",
    "mobile",
    "contact number",
    "phone number",
    "tel",
    "telephone",
    "whatsapp",
}

KNOWN_KEYS = EMAIL_KEYS | NAME_KEYS | COMPANY_KEYS | PHONE_KEYS

# Header detection: scan the first N rows; pick the one with the most
# cells that match known header keywords. Handles files that have a title
# row (or blank rows) before the actual column headers.
_MAX_HEADER_SCAN = 6


def _score_row_as_header(cells: list[str]) -> int:
    return sum(1 for c in cells if c.strip().lower() in KNOWN_KEYS)


class ParseError(ValueError):
    """Raised when the uploaded file can't be parsed at all."""


# Per DB schema (VARCHAR(255) / VARCHAR(50)). The parser truncates so a single
# pathological row doesn't crash an entire upload at INSERT time.
MAX_NAME_LEN = 255
MAX_COMPANY_LEN = 255
MAX_EMAIL_LEN = 255
MAX_PHONE_LEN = 50
MAX_CUSTOM_VALUE_LEN = 1_000  # custom_data is JSONB, but cap to keep rows reasonable


@dataclass
class ParsedRow:
    email: str
    name: str | None = None
    company: str | None = None
    phone: str | None = None
    custom: dict[str, str] = field(default_factory=dict)


def _truncate(value: str | None, limit: int) -> str | None:
    if value is None:
        return None
    s = value.strip()
    if not s:
        return None
    return s[:limit]


@dataclass
class InvalidRow:
    row_number: int
    raw: dict[str, str]
    reason: str


@dataclass
class ParseResult:
    valid: list[ParsedRow]
    invalid: list[InvalidRow]
    duplicates_in_file: int  # rows skipped because their email already appeared earlier in the same upload

    @property
    def total(self) -> int:
        return len(self.valid) + len(self.invalid) + self.duplicates_in_file


# ---------- file format dispatch ---------------------------------------------


def parse_upload(filename: str, content: bytes) -> ParseResult:
    suffix = (filename.rsplit(".", 1)[-1] if "." in filename else "").lower()
    if suffix == "csv":
        rows = _read_csv(content)
    elif suffix == "xlsx":
        rows = _read_xlsx(content)
    elif suffix == "xls":
        rows = _read_xls(content)
    else:
        raise ParseError(f"unsupported file type: .{suffix or 'unknown'}")
    return _normalize_and_validate(rows)


# ---------- per-format readers -----------------------------------------------


def _decode_csv_bytes(content: bytes) -> str:
    for enc in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            return content.decode(enc)
        except UnicodeDecodeError:
            continue
    raise ParseError("could not decode CSV — please save as UTF-8")


def _read_csv(content: bytes) -> list[dict[str, str]]:
    text = _decode_csv_bytes(content)
    try:
        reader = csv.DictReader(io.StringIO(text))
        if not reader.fieldnames:
            raise ParseError("CSV has no header row")
        rows = [{(k or ""): (v or "") for k, v in row.items()} for row in reader]
    except csv.Error as exc:
        raise ParseError(f"malformed CSV: {exc}") from exc
    return rows


def _read_xlsx(content: bytes) -> list[dict[str, str]]:
    try:
        wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
    except Exception as exc:
        raise ParseError(f"could not open XLSX: {exc}") from exc
    ws = wb.active
    if ws is None:
        raise ParseError("XLSX has no sheets")

    # Read all rows eagerly (ws is read-only, can't seek back)
    all_rows = list(ws.iter_rows(values_only=True))
    if not all_rows:
        raise ParseError("XLSX has no rows")

    # Find the header row — the row with most cells matching known column names
    candidate_rows = all_rows[:_MAX_HEADER_SCAN]
    str_candidates = [[str(c).strip() if c is not None else "" for c in row] for row in candidate_rows]
    header_idx = max(range(len(str_candidates)), key=lambda i: _score_row_as_header(str_candidates[i]))
    headers = str_candidates[header_idx]

    out: list[dict[str, str]] = []
    for row in all_rows[header_idx + 1:]:
        rec: dict[str, str] = {}
        for i, cell in enumerate(row):
            if i >= len(headers) or not headers[i]:
                continue
            rec[headers[i]] = "" if cell is None else str(cell).strip()
        if any(v for v in rec.values()):
            out.append(rec)
    return out


def _read_xls(content: bytes) -> list[dict[str, str]]:
    try:
        wb = xlrd.open_workbook(file_contents=content)
    except xlrd.XLRDError as exc:
        raise ParseError(f"could not open XLS: {exc}") from exc
    sheet = wb.sheet_by_index(0)
    if sheet.nrows < 1:
        raise ParseError("XLS has no rows")

    # Find the header row — the row with most cells matching known column names
    scan_end = min(_MAX_HEADER_SCAN, sheet.nrows)
    str_rows = [
        [str(sheet.cell_value(r, c)).strip() for c in range(sheet.ncols)]
        for r in range(scan_end)
    ]
    header_idx = max(range(len(str_rows)), key=lambda i: _score_row_as_header(str_rows[i]))
    headers = str_rows[header_idx]

    out: list[dict[str, str]] = []
    for r in range(header_idx + 1, sheet.nrows):
        rec: dict[str, str] = {}
        for c in range(sheet.ncols):
            if not headers[c]:
                continue
            val = sheet.cell_value(r, c)
            rec[headers[c]] = "" if val == "" else str(val).strip()
        if any(v for v in rec.values()):
            out.append(rec)
    return out


# ---------- normalize + validate ---------------------------------------------


def _pick(row: dict[str, str], keys: set[str]) -> tuple[str | None, str | None]:
    """Return (matched_header, value) for the first header that matches one of `keys`."""
    for header, value in row.items():
        if header.strip().lower() in keys and value:
            return header, value
    return None, None


def _normalize_and_validate(rows: Iterable[dict[str, str]]) -> ParseResult:
    valid: list[ParsedRow] = []
    invalid: list[InvalidRow] = []
    seen_emails: set[str] = set()
    duplicates = 0

    for idx, row in enumerate(rows, start=2):  # row 1 is the header
        clean = {k.strip(): v.strip() if isinstance(v, str) else v for k, v in row.items() if k}

        _, raw_email = _pick(clean, EMAIL_KEYS)
        if not raw_email:
            invalid.append(InvalidRow(row_number=idx, raw=clean, reason="missing email"))
            continue
        # Extract the first email token from the cell; tolerates junk like
        # "info@example.com sites.google" or "<name@x.com>".
        match = _EMAIL_TOKEN.search(raw_email)
        if not match:
            invalid.append(
                InvalidRow(row_number=idx, raw=clean, reason=f"no email found in cell: {raw_email!r}")
            )
            continue
        try:
            email = validate_email(match.group(0), check_deliverability=False).normalized.lower()
        except EmailNotValidError as exc:
            invalid.append(InvalidRow(row_number=idx, raw=clean, reason=str(exc)))
            continue

        if email in seen_emails:
            duplicates += 1
            continue
        seen_emails.add(email)

        _, name = _pick(clean, NAME_KEYS)
        _, company = _pick(clean, COMPANY_KEYS)
        _, phone = _pick(clean, PHONE_KEYS)

        custom = {
            k.strip()[:MAX_NAME_LEN]: v[:MAX_CUSTOM_VALUE_LEN]
            for k, v in clean.items()
            if v and k.strip().lower() not in KNOWN_KEYS
        }

        valid.append(
            ParsedRow(
                email=email[:MAX_EMAIL_LEN],
                name=_truncate(name, MAX_NAME_LEN),
                company=_truncate(company, MAX_COMPANY_LEN),
                phone=_truncate(phone, MAX_PHONE_LEN),
                custom=custom,
            )
        )

    return ParseResult(valid=valid, invalid=invalid, duplicates_in_file=duplicates)
