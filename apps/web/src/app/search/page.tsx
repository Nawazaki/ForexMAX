import { PageShell } from "@/components/page-shell";
import { SearchExperience } from "@/components/search-experience";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Search ForexMax Research", description: "Search ForexMax research, audits, comparisons, education and tools.", path: "/search", noIndex: true });
export default function SearchPage() { return <PageShell><section className="shell page-intro"><p className="eyebrow">SITE SEARCH</p><h1>Find research across ForexMax.</h1><p>Search results remain excluded from public search-engine indexing to avoid thin query URLs.</p></section><section className="shell section"><SearchExperience /></section></PageShell>; }
