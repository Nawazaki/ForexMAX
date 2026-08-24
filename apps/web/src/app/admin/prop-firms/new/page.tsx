import Link from "next/link";
import { createPropFirmAction } from "@/app/admin/prop-firms/actions";
import { PropFirmForm } from "@/app/admin/prop-firms/prop-firm-form";
import { requireEditor } from "@/lib/admin";

export const dynamic = "force-dynamic";
export default async function NewPropFirmPage() { await requireEditor(); return <main className="admin-shell"><header className="admin-header"><div><p className="eyebrow">COMPARISON DATA</p><h1>New Prop Firm</h1></div><Link href="/admin/prop-firms" className="button button-quiet">Back to firms</Link></header><PropFirmForm action={createPropFirmAction} /></main>; }
