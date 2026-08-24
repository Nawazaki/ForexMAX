"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MediaUploadForm() {
  const router = useRouter(); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(formData: FormData) { setBusy(true); setMessage(""); try { const response = await fetch("/api/media", { method: "POST", body: formData }); const body = await response.json().catch(() => ({})); if (!response.ok) { setMessage(body.error ?? "Upload failed."); return; } setMessage("Image uploaded to the media library."); router.refresh(); } catch { setMessage("The upload request could not reach the server. Please check your connection and try again."); } finally { setBusy(false); } }
  return <form action={submit} className="admin-upload"><label>Image file<input required name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label><label>Meaningful Alt text<input required name="altText" minLength={3} maxLength={220} /></label><button className="button button-primary" disabled={busy}>{busy ? "Uploading…" : "Upload image"}</button>{message && <p role="status">{message}</p>}</form>;
}
