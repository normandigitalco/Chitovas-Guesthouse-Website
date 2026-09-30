var ROOT = document.documentElement.getAttribute('data-root') || '';
// ── LIGHTBOX ──
const galleries = {
  pool:[ROOT + 'images/pool-wide-view-c929d1.webp',ROOT + 'images/pool-rock-waterfall-35001c.webp',ROOT + 'images/pool-through-trees-50d4ed.webp',ROOT + 'images/house-exterior-pool-courtyard-4fae53.webp',ROOT + 'images/pool-loungers-dusk-975415.webp'],
  living:[ROOT + 'images/living-room-c916ee.webp',ROOT + 'images/living-area-11b4e4.webp',ROOT + 'images/kitchen-fb6663.webp',ROOT + 'images/living-area-window-0b6ea4.webp'],
  bedrooms:[ROOT + 'images/bedroom-one-f3a3cf.webp',ROOT + 'images/bedroom-two-e75dec.webp',ROOT + 'images/bedroom-detail-6cb44c.webp'],
  exterior:[ROOT + 'images/guesthouse-exterior-59a75f.webp',ROOT + 'images/entrance-gate-1c5898.webp',ROOT + 'images/team-at-entrance-ecf405.webp',ROOT + 'images/house-exterior-pool-courtyard-4fae53.webp',ROOT + 'images/house-exterior-street-45ec27.webp',ROOT + 'images/solar-panels-roof-f78d2e.webp']
};
let curGallery = null, curIdx = 0, lastFocus = null;
function openLightbox(gallery, idx) {
  curGallery = gallery; curIdx = idx; lastFocus = document.activeElement;
  const el = document.getElementById('lightbox-img');
  el.classList.add('fading');
  el.src = galleries[gallery][idx];
  el.alt = 'Photo ' + (idx + 1) + ' of ' + galleries[gallery].length;
  el.onload = function() { el.classList.remove('fading'); };
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  var cb = document.querySelector('.lightbox-close'); if (cb) cb.focus();
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
function lightboxNav(dir) {
  const imgs = galleries[curGallery];
  curIdx = (curIdx + dir + imgs.length) % imgs.length;
  const el = document.getElementById('lightbox-img');
  el.classList.add('fading');
  setTimeout(function() {
    el.src = imgs[curIdx];
    el.onload = function() { el.classList.remove('fading'); };
  }, 200);
}
document.getElementById('lightbox').addEventListener('click', function(e){if(e.target===this)closeLightbox();});
document.addEventListener('keydown', function(e){
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
});


// tiles are keyboard-operable
document.querySelectorAll('.full-gallery-grid>div[role="button"]').forEach(function (d) {
  d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); d.click(); } });
});
// hover captions come from each photo's alt text
document.querySelectorAll('.full-gallery-grid>div').forEach(function (d) {
  var i = d.querySelector('img');
  if (i && i.alt) d.setAttribute('data-cap', i.alt);
});

// ── JUSTIFIED GALLERY ROWS (same height, variable width, packed to fill the row) ──
// Ratios come from each <img>'s width/height attributes, so rows lay out immediately and
// lazy-loaded photos (which haven't downloaded yet) still get their final size - no layout jump.
function justifyGalleryGrid(grid) {
  if (window.innerWidth <= 600) {
    grid.querySelectorAll(':scope > div').forEach(function (div) { div.style.width = ''; div.style.height = ''; });
    return;
  }
  var targetHeight = window.innerWidth <= 900 ? 300 : 460;
  var gap = window.innerWidth <= 900 ? 8 : 12;
  var containerWidth = grid.clientWidth;
  var items = Array.from(grid.children).map(function (div) {
    var img = div.querySelector('img');
    var w = img && parseFloat(img.getAttribute('width')), h = img && parseFloat(img.getAttribute('height'));
    return { div: div, ratio: (w && h) ? w / h : 1.5 };
  });
  var row = [], rowWidth = 0;
  function flushRow(isLast) {
    if (!row.length) return;
    var scale = (containerWidth - gap * (row.length - 1)) / rowWidth;
    if (scale > 1.2) scale = 1.2;
    if (scale < 0.62) scale = 0.62;
    if (isLast && scale > 1) scale = 1;
    var rowHeight = targetHeight * scale;
    row.forEach(function (entry) {
      entry.div.style.height = rowHeight + 'px';
      entry.div.style.width = (entry.ratio * rowHeight) + 'px';
    });
    row = []; rowWidth = 0;
  }
  items.forEach(function (entry) {
    var widthAtTarget = entry.ratio * targetHeight;
    if (row.length > 0 && rowWidth + gap * row.length + widthAtTarget > containerWidth) flushRow(false);
    row.push(entry); rowWidth += widthAtTarget;
  });
  flushRow(true);
}
function justifyAllGalleries() { document.querySelectorAll('.full-gallery-grid').forEach(justifyGalleryGrid); }
justifyAllGalleries();
window.addEventListener('load', justifyAllGalleries);
var galleryResizeTimer;
window.addEventListener('resize', function () { clearTimeout(galleryResizeTimer); galleryResizeTimer = setTimeout(justifyAllGalleries, 150); });
