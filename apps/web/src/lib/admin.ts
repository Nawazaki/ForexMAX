import { getPrisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function requireEditor() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims.sub === "string" ? data.claims.sub : null;
  if (error || !userId) throw new Error("UNAUTHORIZED");
  const db = requireDatabase();
  const profile = await db.user.findUnique({ where: { id: userId } });
  if (!profile || !["ADMIN", "EDITOR"].includes(profile.role)) throw new Error("UNAUTHORIZED");
  return { user: { id: profile.id, email: profile.email, name: profile.name, role: profile.role } };
}

export function requireDatabase() {
  const db = getPrisma();
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");
  return db;
}
