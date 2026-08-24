export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const allowedImages: Record<string, string[]> = { "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"], "image/webp": ["webp"], "image/avif": ["avif"] };

export function validateImageUpload(file: { type: string; size: number; name: string }) {
  const extensions = allowedImages[file.type];
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extensions || !extension || !extensions.includes(extension) || file.size <= 0 || file.size > MAX_IMAGE_BYTES) return null;
  return extension === "jpeg" ? "jpg" : extension;
}
