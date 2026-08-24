"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(formData: FormData) {
    setSubmitting(true); setError("");
    const result = await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), callbackUrl: "/admin", redirect: false });
    if (result?.error) { setError("Sign-in was not accepted. Verify the account exists and has an approved role."); setSubmitting(false); return; }
    window.location.assign(result?.url ?? "/admin");
  }
  return <main className="admin-login"><form action={handleSubmit} className="admin-card"><p className="eyebrow">FOREXMAX CMS</p><h1>Secure editorial access.</h1><p>Only provisioned editorial accounts can enter the workspace.</p><label>Email<input required name="email" type="email" autoComplete="email" /></label><label>Password<input required name="password" type="password" minLength={10} autoComplete="current-password" /></label>{error && <p role="alert" className="admin-error">{error}</p>}<button className="button button-primary" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button></form></main>;
}
