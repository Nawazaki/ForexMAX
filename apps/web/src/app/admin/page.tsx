import Link from "next/link";
import { requireDatabase, requireEditor } from "@/lib/admin";

export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  await requireEditor(); const db = requireDatabase();
  const [articles, audits, firms, media] = await Promise.all([db.article.count(), db.audit.count(), db.propFirm.count(), db.media.count()]);
  return <main className="admin-shell"><header className="admin-header"><div><p className="eyebrow">FOREXMAX CMS</p><h1>Editorial workspace</h1></div><Link className="button button-quiet" href="/">View site</Link></header><nav className="admin-nav"><Link href="/admin">Overview</Link><Link href="/admin/articles">Articles</Link><Link href="/admin/audits">Audits</Link><Link href="/admin/prop-firms">Prop firms</Link><Link href="/admin/media">Media</Link><Link href="/admin/categories">Categories</Link><Link href="/admin/authors">Authors</Link><Link href="/admin/tags">Tags</Link></nav><section className="admin-stats"><article><span>Articles</span><strong>{articles}</strong></article><article><span>Audits</span><strong>{audits}</strong></article><article><span>Prop firms</span><strong>{firms}</strong></article><article><span>Media</span><strong>{media}</strong></article></section><section className="admin-card"><h2>Publishing controls</h2><p>Newly imported legacy records retain their existing public visibility. New publications require a source URL and a last-reviewed date before the status may be set to Published.</p></section></main>;
}
