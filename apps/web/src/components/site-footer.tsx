import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div><p className="eyebrow">FOREXMAX RESEARCH</p><p>Independent financial research and educational analysis. Not a broker, investment manager, or regulatory authority.</p></div>
        <div className="footer-links"><Link href="/methodology">Methodology</Link><Link href="/editorial-policy">Editorial policy</Link><Link href="/affiliate-disclosure">Affiliate disclosure</Link><Link href="/risk-disclosure">Risk disclosure</Link><Link href="/privacy-policy">Privacy</Link><Link href="/terms-of-service">Terms</Link></div>
      </div>
    </footer>
  );
}
