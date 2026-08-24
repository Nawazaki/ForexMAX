"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MediaUploadForm() {
  const router = useRouter(); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(formData: FormData) { setBusy(true); setMessage(""); const response = await fetch("/api/media", { method: "POST", body: formData }); const body = await response.json().catch(() => ({})); if (!response.ok) { setMessage(body.error ?? "Upload failed."); setBusy(false); return; } setMessage("Image uploaded to the media library."); setBusy(false); router.refresh(); }
  return <form action={submit} className="admin-upload"><label>Image file<input required name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label><label>Meaningful Alt text<input required name="altText" minLength={3} maxLength={220} /></label><button className="button button-primary" disabled={busy}>{busy ? "Uploading…" : "Upload image"}</button>{message && <p role="status">{message}</p>}</form>;
}
