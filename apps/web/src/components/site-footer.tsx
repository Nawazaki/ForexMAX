import Link from "next/link";

export function SiteFooter() {
  return <footer className="site-footer"><div className="site-shell"><div className="footer-links"><Link href="/about">About</Link><Link href="/methodology">Methodology</Link><Link href="/editorial-policy">Editorial Policy</Link><Link href="/affiliate-disclosure">Affiliate Disclosure</Link><Link href="/risk-disclosure">Risk Disclosure</Link><Link href="/privacy-policy">Privacy</Link><Link href="/terms-of-service">Terms</Link></div><p>ForexMax Research is editorial research, not regulatory supervision or investment advice.</p></div></footer>;
}
