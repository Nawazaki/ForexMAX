import { z } from "zod";

export const publicationStatusSchema = z.enum(["DRAFT", "REVIEW", "PUBLISHED", "UNPUBLISHED"]);
const relationIdSchema = z.string().trim().refine((value) => z.string().cuid().safeParse(value).success || z.string().uuid().safeParse(value).success, "Expected a CUID or UUID");
export const isRelationId = (value: string) => relationIdSchema.safeParse(value).success;

export const articleInputSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().trim().max(500).optional().nullable(),
  contentMarkdown: z.string().trim().min(1),
  categoryId: relationIdSchema.optional().nullable(),
  authorId: relationIdSchema.optional().nullable(),
  featuredMediaId: relationIdSchema.optional().nullable(),
  status: publicationStatusSchema,
  seoTitle: z.string().trim().max(180).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
  canonical: z.string().url().optional().nullable(),
  ogImage: z.string().url().optional().nullable(),
});

export const auditInputSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  entity: z.string().trim().min(2).max(160),
  auditType: z.enum(["TECHNICAL", "RESEARCH", "RISK"]),
  riskLevel: z.string().trim().max(80).optional().nullable(),
  summary: z.string().trim().max(1000).optional().nullable(),
  evidence: z.string().trim().max(8000).optional().nullable(),
  contentMarkdown: z.string().trim().min(1),
  status: publicationStatusSchema,
  seoTitle: z.string().trim().max(180).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
  canonical: z.string().url().optional().nullable(),
  ogImage: z.string().url().optional().nullable(),
});

export const propFirmInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  country: z.string().trim().max(100).optional().nullable(),
  challengeFee: z.string().trim().max(100).optional().nullable(),
  profitTarget: z.string().trim().max(100).optional().nullable(),
  profitSplit: z.string().trim().max(100).optional().nullable(),
  dailyDrawdown: z.string().trim().max(100).optional().nullable(),
  maximumDrawdown: z.string().trim().max(100).optional().nullable(),
  payout: z.string().trim().max(160).optional().nullable(),
  newsTrading: z.string().trim().max(160).optional().nullable(),
  weekendHolding: z.string().trim().max(160).optional().nullable(),
  expertAdvisor: z.string().trim().max(160).optional().nullable(),
  consistency: z.string().trim().max(160).optional().nullable(),
  scaling: z.string().trim().max(160).optional().nullable(),
  platform: z.string().trim().max(200).optional().nullable(),
  evaluationType: z.string().trim().max(160).optional().nullable(),
  assessment: z.string().trim().max(4000).optional().nullable(),
  lastReviewedAt: z.coerce.date().optional().nullable(),
});

export const imageUploadSchema = z.object({
  altText: z.string().trim().min(3).max(220),
});

export const categoryInputSchema = z.object({ name: z.string().trim().min(2).max(100), slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().trim().max(1000).optional().nullable(), seoTitle: z.string().trim().max(180).optional().nullable(), seoDescription: z.string().trim().max(320).optional().nullable() });
export const tagInputSchema = z.object({ name: z.string().trim().min(2).max(80), slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });
export const authorInputSchema = z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), bio: z.string().trim().max(3000).optional().nullable(), role: z.string().trim().max(120).optional().nullable(), socialLinks: z.record(z.string(), z.string().url()).optional().nullable() });
