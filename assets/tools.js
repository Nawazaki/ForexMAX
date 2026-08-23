(() => {
  const number = (id) => Number.parseFloat(document.querySelector(`#${id}`)?.value);
  const money = (value) => Number.isFinite(value) ? value.toLocaleString(undefined,{maximumFractionDigits:2}) : '—';
  const show = (id, html) => { const el = document.querySelector(`#${id}`); if (el) el.innerHTML = html; };

  const positionForm = document.querySelector('#position-form');
  if (positionForm) positionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const balance = number('account-balance'), risk = number('risk-percent'), stop = number('stop-pips'), pip = number('pip-value');
    if (![balance,risk,stop,pip].every((v) => Number.isFinite(v) && v > 0)) return show('position-result','<strong>Enter positive numbers in every field.</strong>');
    const riskCash = balance * risk / 100;
    const units = riskCash / (stop * pip);
    show('position-result',`Maximum planned risk: <strong>${money(riskCash)}</strong><br>Approximate position units: <strong>${money(units)}</strong><br><span class="small muted">This is an educational estimate. Pip value changes by pair, quote currency, and position size.</span>`);
  });

  const rrForm = document.querySelector('#rr-form');
  if (rrForm) rrForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const entry = number('entry-price'), stop = number('stop-price'), target = number('target-price');
    if (![entry,stop,target].every((v) => Number.isFinite(v)) || entry === stop || target === entry) return show('rr-result','<strong>Enter a valid entry, stop, and target.</strong>');
    const risk = Math.abs(entry-stop), reward = Math.abs(target-entry), ratio = reward/risk, breakeven = 1/(1+ratio)*100;
    show('rr-result',`Risk distance: <strong>${money(risk)}</strong><br>Reward distance: <strong>${money(reward)}</strong><br>Risk/reward: <strong>1:${ratio.toFixed(2)}</strong><br>Approximate break-even win rate before fees: <strong>${breakeven.toFixed(1)}%</strong>`);
  });

  const clock = document.querySelector('#session-clock');
  const timeZone = document.querySelector('#session-timezone');
  const sessionName = document.querySelector('#session-name');
  const updateClock = () => {
    if (!clock || !timeZone || !sessionName) return;
    const zone = timeZone.value;
    const now = new Date();
    clock.textContent = new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:zone}).format(now);
    const hour = Number(new Intl.DateTimeFormat('en-US',{hour:'numeric',hour12:false,timeZone:zone}).format(now));
    sessionName.textContent = hour >= 13 && hour < 22 ? 'New York overlap / US session' : hour >= 7 && hour < 16 ? 'London session' : hour >= 0 && hour < 9 ? 'Asia-Pacific session' : 'Transition / lower-liquidity window';
  };
  if (clock) { updateClock(); window.setInterval(updateClock,1000); timeZone.addEventListener('change',updateClock); }
})();
