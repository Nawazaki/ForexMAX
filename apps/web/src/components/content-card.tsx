import Link from "next/link";
import { ContentDates } from "@/components/content-dates";
import type { PublicContent } from "@/lib/public-content";

export function ContentCard({ record }: { record: Pick<PublicContent, "kind" | "title" | "route" | "description" | "publishedAt" | "lastReviewedAt" | "updatedAt"> }) {
  return <article className="content-card">
    <p className="eyebrow">{record.kind}</p>
    <h2><Link href={record.route}>{record.title}</Link></h2>
    <p>{record.description}</p>
    <ContentDates publishedAt={record.publishedAt} lastReviewedAt={record.lastReviewedAt} updatedAt={record.updatedAt} />
    <Link className="text-link" href={record.route}>Read research <span aria-hidden>→</span></Link>
  </article>;
}
