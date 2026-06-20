/**
 * Renders a JSON-LD structured-data block for rich results in search and
 * AI answer surfaces. The payload is trusted, app-authored data - not user
 * input - so injecting it via dangerouslySetInnerHTML is safe here.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
