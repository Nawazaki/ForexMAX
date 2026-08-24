import Link from "next/link";

export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-grid"><div><p className="eyebrow">FOREXMAX RESEARCH</p><h2>Evidence before interpretation.</h2><p>Independent financial research and educational analysis. ForexMax is not a broker, investment manager or regulatory authority. Public research is subject to source and editorial review controls.</p></div><div className="footer-links"><Link href="/markets">Market coverage</Link><Link href="/sources">Source directory</Link><Link href="/articles">Research archive</Link><Link href="/methodology">Methodology</Link><Link href="/editorial-policy">Editorial policy</Link><Link href="/affiliate-disclosure">Affiliate disclosure</Link><Link href="/risk-disclosure">Risk disclosure</Link><Link href="/privacy-policy">Privacy</Link><Link href="/terms-of-service">Terms</Link></div></div></footer>;
}
