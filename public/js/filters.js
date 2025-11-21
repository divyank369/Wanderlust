// Filters UI behavior (extracted from views/listings/index.ejs)
(function () {
  const btn = document.getElementById('filters-seeall-btn');
  const filters = document.getElementById('filters');

  if (!btn || !filters) return;

  function toggleExpand() {
    const expanded = filters.classList.toggle('expanded');

    if (expanded) {
      btn.textContent = 'Close';
      filters.classList.add('opening');
      setTimeout(() => filters.classList.remove('opening'), 220);
      setTimeout(() => { filters.scrollLeft = 0; }, 60);
    } else {
      btn.textContent = 'See all';
      filters.scrollLeft = 0;
    }
  }

  function updateVisibility() {
    if (window.innerWidth <= 576) {
      btn.style.display = 'inline-block';
    } else {
      btn.style.display = 'none';
      filters.classList.remove('expanded');
      filters.scrollLeft = 0;
      btn.textContent = 'See all';
    }
  }

  btn.addEventListener('click', (e) => { e.preventDefault(); toggleExpand(); });

  // wire filter clicks to update query param and reload
  const filterEls = document.querySelectorAll('#filters .filter');
  filterEls.forEach(el => {
    el.addEventListener('click', () => {
      const f = el.getAttribute('data-filter');
      const params = new URLSearchParams(window.location.search);
      if (f) params.set('filter', f);
      else params.delete('filter');
      window.location = window.location.pathname + '?' + params.toString();
    });
  });

  // tax toggle behavior
  const taxSwitch = document.getElementById('switchCheckDefault');
  if (taxSwitch) {
    taxSwitch.addEventListener('click', function () {
      let taxInfo = document.getElementsByClassName('tax-info');
      for (info of taxInfo) {
        info.style.display = taxSwitch.checked ? 'inline' : 'none';
      }
    });
  }

  window.addEventListener('resize', updateVisibility);
  updateVisibility();
})();
