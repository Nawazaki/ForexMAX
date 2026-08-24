import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getPrisma } from "@/lib/prisma";

export async function requireEditor() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "EDITOR"].includes(session.user.role)) throw new Error("UNAUTHORIZED");
  return session;
}

export function requireDatabase() {
  const db = getPrisma();
  if (!db) throw new Error("DATABASE_NOT_CONFIGURED");
  return db;
}
