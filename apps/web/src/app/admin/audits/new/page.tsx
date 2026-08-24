import Link from "next/link";
import { createAuditAction } from "@/app/admin/audits/actions";
import { AuditForm } from "@/app/admin/audits/audit-form";
import { requireEditor } from "@/lib/admin";

export const dynamic = "force-dynamic";
export default async function NewAuditPage() { await requireEditor(); return <main className="admin-shell"><header className="admin-header"><div><p className="eyebrow">RESEARCH</p><h1>New audit</h1></div><Link href="/admin/audits" className="button button-quiet">Back to audits</Link></header><AuditForm action={createAuditAction} /></main>; }
