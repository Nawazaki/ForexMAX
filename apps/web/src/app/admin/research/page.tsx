import Link from "next/link";
import { getResearchControlSnapshot } from "@/lib/research-control";
import styles from "./research-control.module.css";

export const dynamic = "force-dynamic";

const lifecycle = ["Ingested", "Processing", "Requires review", "Verified", "Published"];

export default function ResearchControlCenter() {
  const snapshot = getResearchControlSnapshot();

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">FOREXMAX / RESEARCH CONTROL</p>
          <h1>Evidence before publication.</h1>
        </div>
        <Link className="button button-quiet" href="/research">View research desk</Link>
      </header>

      <nav className="admin-nav" aria-label="Research Control navigation">
        <Link href="/admin">Editorial CMS</Link>
        <Link href="/admin/research">Research control</Link>
        <Link href="/sources">Public source registry</Link>
        <Link href="/macro">Macro desk</Link>
      </nav>

      <aside className={styles.blocker} aria-label="Preview database status">
        <div><span>ENVIRONMENT STATUS</span><strong>{snapshot.persistence.label}</strong></div>
        <p>{snapshot.persistence.detail}</p>
      </aside>

      <section className={styles.controlStats} aria-label="Research database counts">
        {[
          ["Official source contracts", snapshot.sourceContracts.length],
          ["Persisted events", snapshot.persistedRecords.events],
          ["Verified evidence", snapshot.persistedRecords.evidence],
          ["Editorial reviews", snapshot.persistedRecords.assessments],
        ].map(([label, value]) => <article key={String(label)}><span>{label}</span><strong>{value}</strong><small>{Number(value) === 0 ? "No Preview recordset" : "Persisted Preview records"}</small></article>)}
      </section>

      <section className={styles.section} aria-labelledby="source-manager-heading">
        <div className={styles.sectionHeading}>
          <div><p className="eyebrow">SOURCE MANAGER</p><h2 id="source-manager-heading">Official source contracts</h2></div>
          <button type="button" disabled>Create source</button>
        </div>
        <p className={styles.sectionNote}>These are documented official endpoints and portals, not stored source records. A source becomes operational only after a Preview database, approved contract, and per-source validation rule are available.</p>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>Source</th><th>Jurisdiction</th><th>Access</th><th>Activation gate</th></tr></thead>
            <tbody>{snapshot.sourceContracts.map((source) => <tr key={source.id}><th scope="row"><a href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a><small>{source.organization}</small></th><td>{source.jurisdiction}</td><td><span className={styles.mode}>{source.accessMode.replaceAll("_", " ")}</span></td><td>{source.activationRequirement}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="queue-heading">
        <div className={styles.sectionHeading}><div><p className="eyebrow">RESEARCH QUEUE</p><h2 id="queue-heading">A governed path, not an autopilot.</h2></div><button type="button" disabled>Create event</button></div>
        <ol className={styles.lifecycle}>{lifecycle.map((step, index) => <li key={step}><span>0{index + 1}</span><strong>{step}</strong>{index === 4 ? <small>Human decision only</small> : <small>Preview records required</small>}</li>)}</ol>
        <div className={styles.emptyRecord}><strong>No research events are persisted.</strong><p>Event creation is blocked until the isolated Preview database is connected. No placeholder event has been created to fill the queue.</p></div>
      </section>

      <section className={styles.split}>
        <article className={styles.section} aria-labelledby="evidence-heading">
          <div className={styles.sectionHeading}><div><p className="eyebrow">EVIDENCE RECORDS</p><h2 id="evidence-heading">Claim-level proof.</h2></div><button type="button" disabled>Add evidence</button></div>
          <p className={styles.sectionNote}>Each future evidence record must preserve a source document URL, a verbatim or bounded statement, verification state, verifier, and timestamps. None may be used for public facts while unverified.</p>
          <dl className={styles.schemaList}><div><dt>UNVERIFIED</dt><dd>May be a lead; cannot support a public claim.</dd></div><div><dt>VERIFYING</dt><dd>Under reviewer examination; still non-public.</dd></div><div><dt>VERIFIED</dt><dd>May support an eligible review decision.</dd></div><div><dt>CONFLICTED / REJECTED</dt><dd>Requires resolution or exclusion.</dd></div></dl>
        </article>
        <article className={styles.section} aria-labelledby="review-heading">
          <div className={styles.sectionHeading}><div><p className="eyebrow">EDITORIAL REVIEW</p><h2 id="review-heading">The final gate stays human.</h2></div><button type="button" disabled>Record decision</button></div>
          <p className={styles.sectionNote}>A research assessment cannot move to Published without verified evidence, an approved assessment, and an explicit editorial approval. This policy is enforced in the service contract and will be enforced by the Preview database workflow.</p>
          <div className={styles.decisionGrid}><span>APPROVE<small>Eligible only after evidence verification</small></span><span>CHANGES REQUESTED<small>Returns assessment to evidence work</small></span><span>REJECT<small>Preserves rationale; never auto-publishes</small></span></div>
        </article>
      </section>

      <section className={styles.section} aria-labelledby="quality-heading">
        <div className={styles.sectionHeading}><div><p className="eyebrow">DATA QUALITY</p><h2 id="quality-heading">Availability is not a fact.</h2></div></div>
        <div className={styles.qualityGrid}><article><strong>Verified</strong><p>Source, timestamp and verification record exist.</p></article><article><strong>Delayed / stale</strong><p>May be visible with a limitation; never substituted with an inferred value.</p></article><article><strong>Unavailable / review required</strong><p>Remains absent from public market claims.</p></article></div>
      </section>
    </main>
  );
}
