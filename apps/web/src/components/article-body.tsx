import { sanitizeRichHtml } from "@/lib/sanitize";

export function ArticleBody({ html }: { html: string }) {
  return <div className="legacy-body" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(html) }} />;
}
