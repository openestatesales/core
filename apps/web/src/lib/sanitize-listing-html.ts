import sanitizeHtml from "sanitize-html";

/** Tags TipTap StarterKit may emit in listing copy. */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "pre",
  "code",
  "a",
] as const;

/**
 * Sanitize operator-authored listing HTML (TipTap) before `dangerouslySetInnerHTML`.
 * Uses sanitize-html (no jsdom) so SSR works on Vercel/serverless.
 */
export function sanitizeListingHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });
}
