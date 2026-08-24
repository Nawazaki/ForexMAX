import Link from "next/link";
import { deletePropFirmAction, updatePropFirmAction } from "@/app/admin/prop-firms/actions";
import { PropFirmForm } from "@/app/admin/prop-firms/prop-firm-form";
import { requireDatabase, requireEditor } from "@/lib/admin";

export const dynamic = "force-dynamic";
export default async function EditPropFirmPage({ params }: { params: Promise<{ id: string }> }) { await requireEditor(); const { id } = await params; const db = requireDatabase(); const firm = await db.propFirm.findUnique({ where: { id }, include: { sources: { include: { source: true } } } }); if (!firm) return <main className="admin-shell"><p>Prop firm not found.</p></main>; return <main className="admin-shell"><header className="admin-header"><div><p className="eyebrow">COMPARISON DATA</p><h1>Edit Prop Firm</h1></div><Link href="/admin/prop-firms" className="button button-quiet">Back to firms</Link></header><PropFirmForm firm={firm} action={updatePropFirmAction.bind(null, id)} /><form action={deletePropFirmAction.bind(null, id)}><button className="button admin-danger" type="submit">Delete Prop Firm</button></form></main>; }
