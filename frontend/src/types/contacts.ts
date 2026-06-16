export type ContactListSummary = {
  id: string;
  name: string;
  total_contacts: number;
  valid_contacts: number;
  invalid_contacts: number;
  created_at: string;
};

export type Contact = {
  id: string;
  name: string | null;
  company: string | null;
  email: string;
  phone: string | null;
  custom_data: Record<string, string> | null;
  created_at: string;
};

export type ContactListDetail = ContactListSummary & {
  contacts: Contact[];
};

export type UploadInvalidRow = {
  row_number: number;
  reason: string;
  raw: Record<string, string>;
};

export type UploadResponse = {
  success: true;
  data: {
    list_id: string;
    name: string;
    stats: { total: number; valid: number; invalid: number; duplicates: number };
    invalid_preview: UploadInvalidRow[];
  };
};
