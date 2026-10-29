import { z } from "zod";
/** HTTPS, simple mailto addresses, and local anchors only. Email headers and percent escapes are unsupported. */
export const safeUrl = z
  .string()
  .max(2048)
  .refine((value) => {
    if (/[\s\u0000-\u001f\u007f]/u.test(value)) return false;
    if (/^#[a-z][a-z0-9-]*$/.test(value)) return true;
    if (/^mailto:[a-zA-Z0-9.!#$&'*+/=^_`{|}~-]+@[a-zA-Z0-9.-]+$/.test(value))
      return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" && !url.username && !url.password;
    } catch {
      return false;
    }
  }, "Use an https:// link, email address with mailto:, or a section anchor.");
const span = z.strictObject({
  text: z.string().max(30000),
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
  href: safeUrl.optional(),
});
const spans = z.array(span).max(1000);
export const richTextSchema = z
  .array(
    z.discriminatedUnion("type", [
      z.strictObject({ type: z.literal("paragraph"), spans }),
      z.strictObject({
        type: z.literal("heading"),
        level: z.union([z.literal(2), z.literal(3)]),
        spans,
      }),
      z.strictObject({
        type: z.literal("list"),
        ordered: z.boolean(),
        items: z.array(spans).max(100),
      }),
    ]),
  )
  .max(500)
  .refine(
    (doc) => JSON.stringify(doc).length <= 200000,
    "Text is too large. Shorten it before saving.",
  );
export type RichDocument = z.infer<typeof richTextSchema>;
type Span = z.infer<typeof span>;
function Spans({ value }: { value: Span[] }) {
  return (
    <>
      {value.map((s, i) => {
        let text = <>{s.text}</>;
        if (s.bold) text = <strong>{text}</strong>;
        if (s.italic) text = <em>{text}</em>;
        if (s.href)
          text = (
            <a href={s.href} rel="noopener noreferrer">
              {text}
            </a>
          );
        return <span key={i}>{text}</span>;
      })}
    </>
  );
}
export function RichText({
  value,
  headingLevel = 2,
}: {
  value: RichDocument;
  headingLevel?: 2 | 3;
}) {
  return (
    <>
      {value.map((b, i) => {
        if (b.type === "paragraph")
          return (
            <p key={i}>
              <Spans value={b.spans} />
            </p>
          );
        if (b.type === "heading") {
          const Heading =
            b.level === 2
              ? headingLevel === 2
                ? "h2"
                : "h3"
              : headingLevel === 2
                ? "h3"
                : "h4";
          return (
            <Heading
              key={i}
              className={
                b.level === 3
                  ? "rich-heading rich-heading-detail"
                  : "rich-heading"
              }
            >
              <Spans value={b.spans} />
            </Heading>
          );
        }
        const items = b.items.map((item, j) => (
          <li key={j}>
            <Spans value={item} />
          </li>
        ));
        return b.ordered ? <ol key={i}>{items}</ol> : <ul key={i}>{items}</ul>;
      })}
    </>
  );
}
