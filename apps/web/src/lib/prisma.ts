import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !/^postgres(?:ql)?:\/\//i.test(connectionString)) return null;

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  return globalForPrisma.prisma;
}
