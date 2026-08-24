import { ContentCard } from "@/components/content-card";
import { PageShell } from "@/components/page-shell";
import { getPublishedAudits } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Technical Audits", description: "ForexMax research audits and evidence-led provider assessments.", path: "/audits" });
export const dynamic = "force-dynamic";
export default async function AuditsPage() { const audits = await getPublishedAudits(); return <PageShell><section className="shell page-intro"><p className="eyebrow">RESEARCH ASSESSMENTS</p><h1>Technical audits without a regulatory claim.</h1><p>These pages document research observations and sources. They are not official certifications or investment recommendations.</p></section><section className="shell section"><div className="card-grid">{audits.map((record) => <ContentCard key={record.slug} record={record} />)}</div></section></PageShell>; }
