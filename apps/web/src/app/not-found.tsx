import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export default function NotFound() { return <PageShell><section className="shell page-intro"><p className="eyebrow">404</p><h1>This page is not available.</h1><p>The route may have moved during the migration. Use the research archive or return home.</p><Link className="button button-primary" href="/">Return home</Link></section></PageShell>; }
