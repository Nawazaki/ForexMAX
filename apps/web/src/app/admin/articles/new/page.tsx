import Link from "next/link";
import { ArticleForm } from "@/app/admin/articles/article-form";
import { createArticleAction } from "@/app/admin/articles/actions";
import { requireDatabase, requireEditor } from "@/lib/admin";

export const dynamic = "force-dynamic";
export default async function NewArticlePage() { await requireEditor(); const db = requireDatabase(); const [categories, authors, tags, media] = await Promise.all([db.category.findMany({ orderBy: { name: "asc" } }), db.author.findMany({ orderBy: { name: "asc" } }), db.tag.findMany({ orderBy: { name: "asc" } }), db.media.findMany({ orderBy: { filename: "asc" }, take: 200 })]); return <main className="admin-shell"><header className="admin-header"><div><p className="eyebrow">CONTENT</p><h1>New article</h1></div><Link href="/admin/articles" className="button button-quiet">Back to articles</Link></header><ArticleForm action={createArticleAction} options={{ categories, authors, tags, media }} /></main>; }
