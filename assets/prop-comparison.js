(() => {
  const tableBody = document.querySelector('#comparison-rows');
  const query = document.querySelector('#firm-query');
  const type = document.querySelector('#firm-type');
  const sort = document.querySelector('#firm-sort');
  const count = document.querySelector('#firm-count');
  if (!tableBody || !query || !type || !sort) return;

  const firms = [
    {name:'Earn2Trade', type:'Futures', program:'Gauntlet Mini', fee:'From $150/month', split:'80%', drawdown:'End-of-Day', daily:'See rules', max:'See rules', payout:'See provider terms', news:'Verify current terms', weekend:'Verify current terms', ea:'Verify current terms', consistency:'Evaluation rules apply', scaling:'Program-dependent', platform:'NinjaTrader; Tradovate', evaluation:'Evaluation', assessment:'Pending evidence', score:null, source:'audits/earn2trade-gauntlet-mini.html', reviewed:'2026-06'},
    {name:'Funded Trading Plus', type:'Futures / Forex', program:'Third-party program', fee:'From $199', split:'80%', drawdown:'Scaling / program-dependent', daily:'Verify current terms', max:'Verify current terms', payout:'Verify current terms', news:'Verify current terms', weekend:'Verify current terms', ea:'Verify current terms', consistency:'Verify current terms', scaling:'Available by plan', platform:'MT4/5; cTrader', evaluation:'Challenge', assessment:'Pending evidence', score:null, source:'prop-firm-comparison.html#comparison', reviewed:'2026-06'},
    {name:'Topstep', type:'Futures', program:'Express Funding', fee:'From $165/month', split:'90%', drawdown:'Trailing', daily:'Verify current terms', max:'Verify current terms', payout:'Verify current terms', news:'Verify current terms', weekend:'Verify current terms', ea:'Verify current terms', consistency:'Verify current terms', scaling:'Program-dependent', platform:'NinjaTrader; Tradovate', evaluation:'Evaluation / funding', assessment:'Pending evidence', score:null, source:'prop-firm-comparison.html#comparison', reviewed:'2026-06'},
    {name:'FTMO', type:'Forex / CFD', program:'Challenge', fee:'From €155', split:'90%', drawdown:'Relative / plan-dependent', daily:'Verify current terms', max:'Verify current terms', payout:'Verify current terms', news:'Verify current terms', weekend:'Verify current terms', ea:'Verify current terms', consistency:'Verify current terms', scaling:'Available by plan', platform:'MT4/5; cTrader', evaluation:'Challenge', assessment:'Pending evidence', score:null, source:'prop-firm-comparison.html#comparison', reviewed:'2026-06'},
    {name:'The Funded Trader', type:'Forex / CFD', program:'Rapid Challenge', fee:'From $129', split:'90%', drawdown:'Absolute / plan-dependent', daily:'Verify current terms', max:'Verify current terms', payout:'Verify current terms', news:'Verify current terms', weekend:'Verify current terms', ea:'Verify current terms', consistency:'Verify current terms', scaling:'Available by plan', platform:'MT4/5; DXtrade', evaluation:'Challenge', assessment:'Pending evidence', score:null, source:'prop-firm-comparison.html#comparison', reviewed:'2026-06'},
    {name:'MyForexFunds', type:'Forex / CFD', program:'Evaluation', fee:'From $49', split:'80%', drawdown:'Scaling / plan-dependent', daily:'Verify current terms', max:'Verify current terms', payout:'Verify current terms', news:'Verify current terms', weekend:'Verify current terms', ea:'Verify current terms', consistency:'Verify current terms', scaling:'Available by plan', platform:'MT4/5; cTrader', evaluation:'Evaluation', assessment:'Requires current verification', score:null, source:'prop-firm-comparison.html#comparison', reviewed:'2026-06'}
  ];
  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const render = () => {
    const q = query.value.trim().toLowerCase();
    const selected = type.value;
    const key = sort.value;
    const visible = firms.filter((firm) => (!q || `${firm.name} ${firm.type} ${firm.program} ${firm.platform}`.toLowerCase().includes(q)) && (!selected || firm.type.includes(selected)));
    visible.sort((a,b) => String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, {numeric:true}));
    count.textContent = `${visible.length} firms shown · research assessment, not regulatory rating`;
    tableBody.innerHTML = visible.map((firm) => `<tr>
      <td><strong>${esc(firm.name)}</strong><br><span class="small muted">${esc(firm.program)}</span></td>
      <td>${esc(firm.type)}</td><td>${esc(firm.fee)}</td><td>${esc(firm.split)}</td>
      <td>${esc(firm.drawdown)}<br><span class="small muted">Daily: ${esc(firm.daily)}<br>Max: ${esc(firm.max)}</span></td>
      <td>${esc(firm.payout)}<br><span class="small muted">News: ${esc(firm.news)}<br>Weekend: ${esc(firm.weekend)}</span></td>
      <td>${esc(firm.ea)}<br><span class="small muted">Consistency: ${esc(firm.consistency)}<br>Scaling: ${esc(firm.scaling)}</span></td>
      <td>${esc(firm.platform)}<br><span class="small muted">${esc(firm.evaluation)}</span></td>
      <td><span class="badge gold">${esc(firm.assessment)}</span><br><span class="small muted">Score: ${firm.score === null ? 'Not published' : esc(firm.score + '/100')}</span><br><a class="small" href="${esc(firm.source)}">Source / review</a><br><span class="small muted">Reviewed: ${esc(firm.reviewed)}</span></td>
    </tr>`).join('') || '<tr><td colspan="9" class="empty">No firms match the selected filters.</td></tr>';
  };
  query.addEventListener('input', render); type.addEventListener('change', render); sort.addEventListener('change', render); render();
})();
