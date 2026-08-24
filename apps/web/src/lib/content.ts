import legacyContent from "@/content/legacy-content.json";

export type LegacyKind = "article" | "audit" | "page";
export type LegacyRecord = {
  kind: LegacyKind;
  slug: string;
  route: string;
  legacyUrl: string;
  title: string;
  description: string;
  canonical: string;
  ogImage?: string | null;
  contentHtml: string;
  sourceFile: string;
  migratedAt: string;
};

export const legacyRecords = legacyContent as LegacyRecord[];

export function getLegacyRecord(kind: LegacyKind, slug: string) {
  return legacyRecords.find((record) => record.kind === kind && record.slug === slug);
}

export function getLegacyPage(slug: string) {
  return legacyRecords.find((record) => record.kind === "page" && record.slug === slug);
}

export function getLegacyArticles() {
  return legacyRecords.filter((record) => record.kind === "article");
}

export function getLegacyAudits() {
  return legacyRecords.filter((record) => record.kind === "audit");
}
