import Link from "next/link";

const links = [
  ["Research", "/articles"],
  ["Compare", "/prop-firm-comparison"],
  ["Risk", "/risk-intelligence"],
  ["Tools", "/tools"],
  ["Education", "/education"],
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell nav-wrap">
        <Link href="/" className="brand" aria-label="ForexMax home">
          <span className="brand-mark">FM</span>
          <span>Forex<span>Max</span></span>
        </Link>
        <nav aria-label="Primary navigation">
          {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <Link href="/search" className="nav-search">Search</Link>
      </div>
    </header>
  );
}
