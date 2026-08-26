import Link from "next/link";

const primaryLinks = [["Markets", "/markets"], ["Macro", "/macro"], ["Research", "/research"], ["Backtest", "/backtest"], ["Risk", "/risk-intelligence"], ["Prop Firms", "/prop-firm-comparison"], ["Tools", "/tools"], ["Education", "/education"], ["Sources", "/sources"]] as const;
const marketLinks = [["FX", "/markets/forex"], ["Gold & commodities", "/markets/commodities"], ["Indices", "/markets/indices"], ["Crypto", "/markets/crypto"], ["Rates", "/macro"], ["Economy", "/macro"], ["Central Banks", "/sources"]] as const;

export function SiteHeader() {
  return <header className="site-header"><div className="shell masthead"><Link href="/" className="brand" aria-label="ForexMax home"><span className="brand-mark">FM</span><span>Forex<span>Max</span></span></Link><p className="brand-statement">Market Intelligence &amp; Financial Research</p><div className="masthead-actions"><Link href="/methodology">Methodology</Link><Link href="/search" className="nav-search">Search</Link></div></div><div className="market-nav"><div className="shell market-nav-wrap"><nav aria-label="Primary navigation">{primaryLinks.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><nav aria-label="Market coverage navigation" className="market-taxonomy">{marketLinks.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav></div></div></header>;
}
