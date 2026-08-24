import Link from "next/link";
import type { PublicContent } from "@/lib/public-content";

export function ContentCard({ record }: { record: Pick<PublicContent, "kind" | "title" | "route" | "description"> }) {
  return <article className="content-card">
    <p className="eyebrow">{record.kind}</p>
    <h2><Link href={record.route}>{record.title}</Link></h2>
    <p>{record.description}</p>
    <Link className="text-link" href={record.route}>Read research <span aria-hidden>→</span></Link>
  </article>;
}
