(() => {
  const queryInput = document.querySelector('#search-query');
  const categorySelect = document.querySelector('#search-category');
  const results = document.querySelector('#search-results');
  const count = document.querySelector('#search-count');
  if (!queryInput || !categorySelect || !results) return;

  const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  let items = [];

  const render = () => {
    const q = queryInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    const filtered = items.filter((item) => {
      const haystack = `${item.title} ${item.category} ${item.description}`.toLowerCase();
      return (!q || haystack.includes(q)) && (!category || item.category === category);
    });
    count.textContent = `${filtered.length} result${filtered.length === 1 ? '' : 's'}`;
    results.innerHTML = filtered.length ? filtered.map((item) => `
      <a class="search-result" href="${esc(item.url)}">
        <span class="badge gold">${esc(item.category)}</span>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.description)}</p>
      </a>`).join('') : '<p class="empty">No matching research found. Try a broader term or reset the filter.</p>';
  };

  fetch('assets/content-index.json')
    .then((response) => response.json())
    .then((data) => {
      items = Array.isArray(data) ? data : [];
      [...new Set(items.map((item) => item.category))].sort().forEach((category) => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
      render();
    })
    .catch(() => {
      count.textContent = 'Search index unavailable';
      results.innerHTML = '<p class="empty">The static index could not be loaded. Use the Research Hub navigation instead.</p>';
    });
  queryInput.addEventListener('input', render);
  categorySelect.addEventListener('change', render);
})();
