import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2).max(100),
  type: z.enum(["all", "article", "audit", "prop-firm"]).default("all"),
  category: z.string().trim().min(1).max(120).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(12),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

export type SearchParams = z.infer<typeof searchQuerySchema>;
export function getSearchPlan(params: SearchParams) {
  const type = params.category && params.type === "all" ? "article" : params.type;
  return { type, skip: (params.page - 1) * params.limit, take: params.limit + 1, outputLimit: params.limit };
}
