// Shared behaviour for every page (nav, menu, scroll reveal, sub-nav, map, form redirect).
(function () {
  var root = document.documentElement.getAttribute('data-root') || '';
  // --vh: set on load + orientationchange only (never on resize) - see dev standards
  function setVh() { document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px'); }
  setVh();
  window.addEventListener('orientationchange', function () { setTimeout(setVh, 400); }, { passive: true });

  // one rAF-throttled scroll handler drives both nav states
  var nav = document.getElementById('nav'), ticking = false;
  function apply() {
    ticking = false;
    var y = window.scrollY;
    document.body.classList.toggle('nav-scrolled', y > 0);
    if (nav) nav.classList.toggle('scrolled', y > 60);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true });
  apply();

  // scroll reveal
  var els = document.querySelectorAll('.reveal, .img-reveal, .photo-reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('visible'); }); }

  // contact form: send people back to our own thank-you page
  document.querySelectorAll('input[data-next]').forEach(function (i) {
    i.value = new URL(root + i.getAttribute('data-next'), location.href).href;
  });

  // deep links such as /gallery/#gallery-pool (native anchor jumps are unreliable with body{overflow-x:hidden})
  function jumpToHash() {
    var id = decodeURIComponent(location.hash.replace('#', ''));
    var el = id && document.getElementById(id);
    if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'auto', block: 'start' }); }, 60);
  }
  window.addEventListener('load', jumpToHash);
})();

// ── SUB-NAV JUMP (Gallery, Location, Todo) ──
function scrollToGalleryPanel(link, id) {
  var el = document.getElementById(id);
  if (!el) return;
  var bar = link.closest('.gallery-subnav');
  (bar || document).querySelectorAll('.gallery-subnav a').forEach(function (a) { a.classList.remove('active'); });
  link.classList.add('active');
  el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  try { history.replaceState(null, '', '#' + id); } catch (e) {}
}

// ── NAV DROPDOWNS ──
function toggleNavDropdown(trigger) {
  var li = trigger.closest('.nav-dropdown-li');
  var wasOpen = li.classList.contains('open');
  document.querySelectorAll('.nav-dropdown-li.open').forEach(function (el) {
    el.classList.remove('open');
    var t = el.querySelector('.has-dropdown'); if (t) t.setAttribute('aria-expanded', 'false');
  });
  if (!wasOpen) { li.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); }
  return false;
}
document.addEventListener('click', function (e) {
  if (!e.target.closest('.nav-dropdown-li') || e.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown-li.open').forEach(function (el) {
      el.classList.remove('open');
      var t = el.querySelector('.has-dropdown'); if (t) t.setAttribute('aria-expanded', 'false');
    });
  }
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.nav-dropdown-li.open').forEach(function (el) { el.classList.remove('open'); });
    closeMobileMenu();
  }
});

// ── MOBILE MENU ──
function toggleMobileMenu() {
  var menu = document.getElementById('mobile-menu'), ham = document.getElementById('hamburger');
  menu.classList.toggle('open'); ham.classList.toggle('open');
  var open = menu.classList.contains('open');
  ham.setAttribute('aria-expanded', open ? 'true' : 'false');
  ham.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeMobileMenu() {
  var menu = document.getElementById('mobile-menu'), ham = document.getElementById('hamburger');
  if (!menu || !ham) return;
  menu.classList.remove('open'); ham.classList.remove('open');
  ham.setAttribute('aria-expanded', 'false'); ham.setAttribute('aria-label', 'Open menu');
  document.body.style.overflow = '';
}

// ── GOOGLE MAP (loads automatically once the visitor has accepted cookies) ──
function loadMap() {
  var box = document.getElementById('map-embed');
  if (!box) return;
  var f = document.createElement('iframe');
  f.src = box.getAttribute('data-map-src');
  f.title = "Map showing Chitova's Guesthouse in Victoria Falls";
  f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  f.setAttribute('allowfullscreen', '');
  f.setAttribute('loading', 'lazy');
  box.innerHTML = ''; box.appendChild(f);
}


// ── COOKIE CONSENT + GOOGLE ANALYTICS (analytics loads only after the visitor presses Accept) ──
(function () {
  var GA_ID = 'G-4WJ4EY7W2W', KEY = 'chitova-consent', loaded = false, bar = null, hideT = 0;
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function loadGA() {
    if (loaded) return; loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  function loadMapIfPresent() {
    var box = document.getElementById('map-embed');
    if (box && !box.querySelector('iframe') && typeof loadMap === 'function') loadMap();
  }
  function clearGA() {
    var past = 'expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    var host = location.hostname, apex = '.' + host.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n === '_ga' || n.indexOf('_ga_') === 0) {
        document.cookie = n + '=;' + past;
        document.cookie = n + '=;' + past + ';domain=' + host;
        document.cookie = n + '=;' + past + ';domain=' + apex;
      }
    });
  }
  function build() {
    bar = document.createElement('div');
    bar.className = 'cookie-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Cookie consent'); bar.hidden = true;
    bar.innerHTML = '<p>Help us improve this website by allowing analytics and map cookies. <a href="/privacy-policy/">Privacy Policy</a></p>' +
      '<div class="cookie-actions"><button type="button" class="cookie-btn" data-c="denied">Decline</button><button type="button" class="cookie-btn accept" data-c="granted">Accept</button></div>';
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]'); if (b) choose(b.getAttribute('data-c'));
    });
    document.body.appendChild(bar);
  }
  function show(focus) {
    if (!bar) build();
    clearTimeout(hideT); bar.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.add('show'); }); });
    if (focus) { var b = bar.querySelector('.accept'); if (b) b.focus(); }
  }
  function hide() { if (!bar) return; bar.classList.remove('show'); hideT = setTimeout(function () { bar.hidden = true; }, 260); }
  function choose(v) {
    var prev = get(); set(v); hide();
    if (v === 'granted') { loadGA(); loadMapIfPresent(); }
    else if (loaded || prev === 'granted') { clearGA(); location.reload(); }
  }
  function addFooterLink() {
    var box = document.querySelector('.footer-legal'); if (!box) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'cookie-settings-link'; b.textContent = 'Cookie settings';
    b.addEventListener('click', function () { show(true); });
    box.appendChild(b);
  }
  addFooterLink();
  window.showCookieSettings = function () { show(true); return false; };
  var c = get();
  if (c === 'granted') { loadGA(); loadMapIfPresent(); }
  else if (c !== 'denied') {
    if (document.readyState === 'complete') show(false);
    else window.addEventListener('load', function () { setTimeout(function () { show(false); }, 600); });
  }
})();
