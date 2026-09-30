// ── FAQ ──
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(function(i){
    i.classList.remove('open');
    var b = i.querySelector('.faq-question'); if (b) b.setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
}

function filterFaqs(query) {
  const q = query.trim().toLowerCase();
  let anyVisible = false;
  document.querySelectorAll('.faq-list').forEach(function(list) {
    let listHasVisible = false;
    list.querySelectorAll('.faq-item').forEach(function(item) {
      const text = item.textContent.toLowerCase();
      const match = !q || text.includes(q);
      item.style.display = match ? '' : 'none';
      if (match) { listHasVisible = true; anyVisible = true; }
    });
    const cat = list.previousElementSibling;
    if (cat && cat.classList.contains('faq-cat')) cat.style.display = listHasVisible ? '' : 'none';
  });
  const noResults = document.getElementById('faq-no-results');
  const hintText = document.getElementById('faq-hint-text');
  if (noResults) noResults.style.display = (!anyVisible && q) ? 'block' : 'none';
  if (hintText) hintText.style.display = (!anyVisible && q) ? 'none' : 'block';
}

