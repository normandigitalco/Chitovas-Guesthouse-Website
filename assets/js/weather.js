// ── LIVE WEATHER - Victoria Falls, via Open-Meteo (free, no API key). Fails silently
// to a plain text fallback so a slow or blocked network never shows a broken widget. ──
(function() {
  const WX_LAT = -17.9243, WX_LON = 25.8572;
  const WX_CODES = {
    0:"Clear sky",1:"Mostly clear",2:"Partly cloudy",3:"Overcast",
    45:"Foggy",48:"Foggy",
    51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",
    61:"Light rain",63:"Rain",65:"Heavy rain",
    80:"Rain showers",81:"Rain showers",82:"Heavy showers",
    95:"Thunderstorms",96:"Thunderstorms",99:"Thunderstorms"
  };
  function describe(code) { return WX_CODES[code] || "Fair conditions"; }
  async function loadWeather() {
    const el = document.getElementById('weather-widget');
    if (!el) return;
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${WX_LAT}&longitude=${WX_LON}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Africa%2FHarare`;
      const ctl = new AbortController(); const to = setTimeout(function(){ ctl.abort(); }, 7000);
      const res = await fetch(url, {signal: ctl.signal}); clearTimeout(to);
      if (!res.ok) throw new Error('weather request failed');
      const data = await res.json();
      const c = data.current;
      const tempC = Math.round(c.temperature_2m);
      const tempF = Math.round(tempC * 9/5 + 32);
      const humidity = Math.round(c.relative_humidity_2m);
      el.innerHTML = '<span class="weather-now-temp">' + tempC + '&deg;C</span>' +
        '<span class="weather-now-desc"><strong>' + describe(c.weather_code) + '</strong>' +
        tempF + '&deg;F &middot; ' + humidity + '% humidity</span>';
    } catch (e) {
      el.innerHTML = '<span class="weather-now-error">Live conditions unavailable right now - check back before you pack.</span>';
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWeather);
  } else {
    loadWeather();
  }
})();
