(() => {
  const root = document.documentElement;
  const current = location.pathname.replace(/\/index\.html$/, '/') || '/';
  const nav = [
    ['index.html', 'Research', ['/','/index.html']],
    ['risk-intelligence.html', 'Risk intelligence', ['/risk-intelligence.html']],
    ['prop-firm-comparison.html', 'Prop firms', ['/prop-firm-comparison.html']],
    ['tools.html', 'Tools', ['/tools.html']],
    ['education.html', 'Education', ['/education.html']],
    ['search.html', 'Search', ['/search.html']]
  ];
  const base = document.body.dataset.pathBase || (/\/(articles|audits)\//.test(location.pathname) ? '../' : '');
  const href = (path) => base + path;
  const links = nav.map(([path, label, matches]) => `<a href="${href(path)}"${matches.includes(current) ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const header = document.createElement('header');
  header.className = 'fm-globalbar';
  header.innerHTML = `<div class="fm-globalbar__inner"><a class="fm-brand" href="${href('index.html')}"><i class="fm-brand__mark">FM</i><span class="fm-brand__name">FOREX<span>MAX</span></span></a><button class="fm-menu" type="button" aria-expanded="false" aria-controls="fm-globalnav">MENU</button><nav class="fm-globalnav" id="fm-globalnav" aria-label="Primary navigation">${links}<a class="fm-globalnav__cta" href="${href('methodology.html')}">How we research</a></nav></div>`;
  document.body.prepend(header);
  document.body.classList.add('fm-redesign');
  document.querySelectorAll('body > nav, body > header:not(.fm-globalbar)').forEach((el) => el.classList.add('fm-legacy-top'));
  document.querySelectorAll('body > footer').forEach((el) => el.classList.add('fm-legacy-footer'));
  const footer = document.createElement('footer');
  footer.className = 'fm-site-footer';
  footer.innerHTML = `<div class="fm-site-footer__inner"><section><p class="fm-site-footer__label">FOREXMAX RESEARCH</p><h2>Evidence before interpretation.</h2><p>Independent financial research and educational analysis. ForexMax is not a broker, investment manager, custodian, fund, or regulatory authority.</p></section><section><p class="fm-site-footer__label">EXPLORE</p><div class="fm-site-footer__links"><a href="${href('index.html')}">Market intelligence</a><a href="${href('prop-firm-comparison.html')}">Prop firm research</a><a href="${href('tools.html')}">Trading tools</a><a href="${href('education.html')}">Education hub</a><a href="${href('search.html')}">Search the archive</a></div></section><section><p class="fm-site-footer__label">TRANSPARENCY</p><div class="fm-site-footer__links"><a href="${href('methodology.html')}">Research methodology</a><a href="${href('editorial-policy.html')}">Editorial policy</a><a href="${href('affiliate-disclosure.html')}">Affiliate disclosure</a><a href="${href('risk-disclosure.html')}">Risk disclosure</a><a href="${href('privacy-policy.html')}">Privacy and terms</a></div></section></div><div class="fm-site-footer__bottom"><p>Source-aware research · Human review boundary · Updated 2026</p><p>Educational information only. Not financial advice.</p></div>`;
  document.body.append(footer);
  header.querySelector('.fm-menu').addEventListener('click', () => { const menu = header.querySelector('.fm-globalnav'); const open = menu.classList.toggle('is-open'); header.querySelector('.fm-menu').setAttribute('aria-expanded', String(open)); });
})();
