export type ArticleFormErrorCode = "slug-taken" | "publish-requires-source" | "invalid-input";

export function articleFormErrorCode(error: unknown): ArticleFormErrorCode | null {
  if (error instanceof Error) {
    if (error.message === "PUBLISHED_CONTENT_REQUIRES_SOURCE_AND_REVIEW_DATE") return "publish-requires-source";
    if (error.name === "ZodError") return "invalid-input";
  }

  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return "slug-taken";
  return null;
}

export function articleFormErrorMessage(code?: string | null) {
  switch (code) {
    case "slug-taken":
      return "This slug is already used by another article. Choose a unique URL slug and save again.";
    case "publish-requires-source":
      return "Published articles require a source name, source URL, and a last-reviewed date.";
    case "invalid-input":
      return "Review the required fields and URL formats, then try again.";
    default:
      return null;
  }
}
