var ROOT = document.documentElement.getAttribute('data-root') || '';
// ── REVIEWS DATA - add all 80+ here ──
const REVIEWS = [
  {stars:5,text:"Very well maintained property. Reliable fast WiFi. No issues with electricity and has solar backup. Host was very helpful. Breakfast was tasty and lovely. Pool was lovely.",author:"Mel",country:"United Kingdom",source:"Booking.com · 10/10",link:"https://www.booking.com/hotel/zw/chitovas-guesthouse.html#tab-reviews"},
  {stars:5,text:"What an excellent host! Friendly and so professional. He even went shopping for us as we arrived straight from the airport. A taxi had been booked for our entire stay.",author:"Barbara",country:"South Africa",source:"Booking.com · 9.0/10",link:"https://www.booking.com/hotel/zw/chitovas-guesthouse.html#tab-reviews"},
  {stars:5,text:"The staff were so helpful in getting us tickets to events, doing our laundry, running errands since we were without a vehicle. The perfect place to recover and still have a great holiday.",author:"Beth Stuebing Adams",country:"",source:"Google Reviews · 5/5",link:"https://www.google.com/maps/place/Chitova%27s+Guesthouse/@-17.9288042,25.8259834,17z"},
  {stars:5,text:"A wonderful place to stay. The house is spacious, clean and comfortable. The pool is a great place to relax after a day exploring. Highly recommend.",author:"James",country:"Australia",source:"Booking.com · 10/10",link:"https://www.booking.com/hotel/zw/chitovas-guesthouse.html#tab-reviews"},
  {stars:5,text:"Perfect location, stunning property. Norman and his team went above and beyond. The breakfast every morning was a highlight - fresh and generous.",author:"Lena",country:"Germany",source:"Booking.com · 9.6/10",link:"https://www.booking.com/hotel/zw/chitovas-guesthouse.html#tab-reviews"},
  {stars:5,text:"We had the most amazing stay. The house is exactly as described. Private, peaceful and so close to all the activities. Will definitely return.",author:"Sarah",country:"United States",source:"Airbnb · 5/5",link:"https://www.airbnb.com/rooms/24730551"},
];

// ── REVIEW CAROUSEL ──
// Round 251: three smaller flat cards per page on desktop (two on tablet, one on mobile)
// instead of one dominant floating card - see the .review-quote-card CSS comment.
let revIdx = 0;
const revPerPage = () => window.innerWidth <= 600 ? 1 : (window.innerWidth <= 900 ? 2 : 3);

function platformInfo(source) {
  var parts = source.split(' · ');
  var name = parts[0], score = parts[1] || '';
  var logo = ROOT + 'images/logo-booking.webp';
  var label = name;
  var key = 'booking';
  if (/google/i.test(name)) { logo = ROOT + 'images/logo-google.webp'; label = 'Google'; key = 'google'; }
  else if (/airbnb/i.test(name)) { logo = ROOT + 'images/logo-airbnb.webp'; label = 'Airbnb'; key = 'airbnb'; }
  else { logo = ROOT + 'images/logo-booking.webp'; label = 'Booking.com'; key = 'booking'; }
  var dims = {booking:[400,67], google:[116,46], airbnb:[360,112]}[key];
  return {logo: logo, label: label, score: score, key: key, w: dims[0], h: dims[1]};
}

var STAR_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.7 1.5 6.9-6.1-3.6-6.1 3.6 1.5-6.9-5.2-4.7 6.9-.7z"/></svg>';

function buildReviews() {
  const track = document.getElementById('reviews-track');
  if (!track) return;
  track.innerHTML = REVIEWS.map(function(r) {
    var p = platformInfo(r.source);
    return '<div class="review-quote">'
      + '<div class="review-quote-card">'
        + '<div class="review-quote-top">'
          + '<div class="review-quote-stars">' + STAR_SVG.repeat(r.stars || 5) + '</div>'
          + '<img src="' + p.logo + '" width="' + p.w + '" height="' + p.h + '" alt="' + p.label + '" class="review-quote-platform-logo logo-' + p.key + '" loading="lazy" decoding="async"/>'
        + '</div>'
        + '<p class="review-quote-text">' + r.text + '</p>'
        + '<div class="review-quote-footer">'
          + '<div class="review-quote-attr">' + r.author + (r.country ? ' &middot; ' + r.country : '') + '</div>'
          + '<a href="' + r.link + '" target="_blank" class="review-quote-link">View review &rsaquo;</a>'
        + '</div>'
      + '</div>'
      + '</div>';
  }).join('');
  buildDots();
  positionTrack();
}

function buildDots() {
  const dotsEl = document.getElementById('rev-dots');
  if (!dotsEl) return;
  const total = Math.ceil(REVIEWS.length / revPerPage());
  dotsEl.innerHTML = Array.from({length: total}, function(_, i) {
    return '<button type="button" class="reviews-dot' + (i === 0 ? ' active' : '') + '" aria-label="Show reviews page ' + (i + 1) + '" onclick="goReview(' + i + ')"></button>';
  }).join('');
}

function positionTrack() {
  const track = document.getElementById('reviews-track');
  if (!track) return;
  const pp = revPerPage();
  const maxIdx = Math.max(0, REVIEWS.length - pp);
  revIdx = Math.min(revIdx, maxIdx);
  const cardW = track.parentElement.offsetWidth;
  const gap = 22.4; // 1.4rem approx
  const shift = revIdx * ((cardW + gap) / pp);
  track.style.transform = 'translateX(-' + shift + 'px)';
  document.querySelectorAll('.reviews-dot').forEach(function(d, i) {
    d.classList.toggle('active', i === Math.floor(revIdx / pp));
  });
}

function reviewNav(dir) {
  const pp = revPerPage();
  revIdx = Math.max(0, Math.min(revIdx + dir, REVIEWS.length - pp));
  positionTrack();
}

function goReview(pageIdx) {
  revIdx = pageIdx * revPerPage();
  positionTrack();
}

window.addEventListener('resize', function() { buildDots(); positionTrack(); }, {passive:true});

// ── REVIEW CAROUSEL TOUCH/SWIPE ──
// Client wants finger-swipe through review cards on mobile, not just the arrow buttons.
(function() {
  var outer = document.querySelector('.reviews-track-outer');
  if (!outer) return;
  var startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;
  outer.addEventListener('touchstart', function(e) {
    var t = e.touches[0];
    startX = t.clientX; startY = t.clientY; dx = 0; dy = 0; dragging = true;
  }, {passive:true});
  outer.addEventListener('touchmove', function(e) {
    if (!dragging) return;
    var t = e.touches[0];
    dx = t.clientX - startX;
    dy = t.clientY - startY;
    // Only hijack the gesture (block page scroll) once it's clearly a horizontal swipe.
    if (Math.abs(dx) > Math.abs(dy) && e.cancelable) e.preventDefault();
  }, {passive:false});
  outer.addEventListener('touchend', function() {
    if (!dragging) return;
    dragging = false;
    var threshold = 40;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -threshold) reviewNav(1);
      else if (dx > threshold) reviewNav(-1);
    }
    dx = 0; dy = 0;
  }, {passive:true});
})();


buildReviews();
