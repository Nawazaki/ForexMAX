import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES, validateImageUpload } from "@/lib/media";

describe("media validation", () => {
  it("accepts supported images inside the strict size limit", () => expect(validateImageUpload({ type: "image/webp", size: 1200, name: "chart.webp" })).toBe("webp"));
  it("rejects unsupported MIME types, mismatched extensions, empty files and oversized files", () => { expect(validateImageUpload({ type: "image/svg+xml", size: 1200, name: "vector.svg" })).toBeNull(); expect(validateImageUpload({ type: "image/png", size: 1200, name: "malware.exe" })).toBeNull(); expect(validateImageUpload({ type: "image/png", size: 0, name: "chart.png" })).toBeNull(); expect(validateImageUpload({ type: "image/jpeg", size: MAX_IMAGE_BYTES + 1, name: "photo.jpg" })).toBeNull(); });
});
