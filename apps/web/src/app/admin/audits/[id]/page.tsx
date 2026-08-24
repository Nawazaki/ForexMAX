import Link from "next/link";
import { deleteAuditAction, updateAuditAction } from "@/app/admin/audits/actions";
import { AuditForm } from "@/app/admin/audits/audit-form";
import { requireDatabase, requireEditor } from "@/lib/admin";

export const dynamic = "force-dynamic";
export default async function EditAuditPage({ params }: { params: Promise<{ id: string }> }) { await requireEditor(); const { id } = await params; const db = requireDatabase(); const audit = await db.audit.findUnique({ where: { id }, include: { sources: { include: { source: true } } } }); if (!audit) return <main className="admin-shell"><p>Audit not found.</p></main>; return <main className="admin-shell"><header className="admin-header"><div><p className="eyebrow">RESEARCH</p><h1>Edit audit</h1></div><Link href="/admin/audits" className="button button-quiet">Back to audits</Link></header><AuditForm audit={audit} action={updateAuditAction.bind(null, id)} /><form action={deleteAuditAction.bind(null, id)}><button className="button admin-danger" type="submit">Delete audit</button></form></main>; }
