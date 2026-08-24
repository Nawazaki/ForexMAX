"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(formData: FormData) {
    setSubmitting(true); setError("");
    const supabase = createClient(); const { error: signInError } = await supabase.auth.signInWithPassword({ email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") });
    if (signInError) { setError("Sign-in was not accepted. Verify the account exists and has an approved role."); setSubmitting(false); return; }
    router.replace("/admin"); router.refresh();
  }
  return <main className="admin-login"><form action={handleSubmit} className="admin-card"><p className="eyebrow">FOREXMAX CMS</p><h1>Secure editorial access.</h1><p>Only provisioned editorial accounts can enter the workspace.</p><label>Email<input required name="email" type="email" autoComplete="email" /></label><label>Password<input required name="password" type="password" minLength={10} autoComplete="current-password" /></label>{error && <p role="alert" className="admin-error">{error}</p>}<button className="button button-primary" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button></form></main>;
}
