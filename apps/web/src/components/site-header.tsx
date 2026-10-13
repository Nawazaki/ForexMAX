import Link from "next/link";

const primaryLinks = [["Research", "/research"], ["Comparisons", "/prop-firm-comparison"], ["Risk", "/risk-intelligence"], ["Tools", "/tools"], ["Education", "/education"], ["Search", "/search"]] as const;

export function SiteHeader() {
  return <header className="product-header"><div className="site-shell product-nav"><Link href="/" className="brand" aria-label="ForexMax home">FOREX<span>MAX</span></Link><nav className="nav-links" aria-label="Primary navigation">{primaryLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav></div></header>;
}
