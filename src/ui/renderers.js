import { dict } from "../i18n/translations.js";
import { localeMap } from "../utils/locale.js";
import { prettyIconUrl } from "../utils/icons.js";
import { capitalize, escapeHtml } from "../utils/strings.js";

export function renderLoading(weatherBox) {
  weatherBox.innerHTML = `
    <div class="card loading">
      <div class="row big skeleton"></div>
      <div class="row skeleton"></div>
      <div class="row skeleton"></div>
      <div class="row skeleton"></div>
    </div>`;
  document.querySelector(".forecast")?.remove();
  document.querySelector(".hourly")?.remove();
}

export function renderError(weatherBox, msg) {
  weatherBox.innerHTML = `<div class="card error">${escapeHtml(msg)}</div>`;
  document.querySelector(".forecast")?.remove();
  document.querySelector(".hourly")?.remove();
}

export function renderWeather(weatherBox, state, d, onSave) {
  const t = dict[state.lang] || dict.en;
  const name = `${d.name || ""}${d.sys?.country ? ", " + d.sys.country : ""}`;
  const icon = d.weather?.[0]?.icon || "01d";
  const desc = capitalize(d.weather?.[0]?.description || "");
  const temp = Math.round(d.main?.temp ?? 0);
  const feels = Math.round(d.main?.feels_like ?? 0);
  const hum = d.main?.humidity ?? "-";
  const pres = d.main?.pressure ?? "-";
  const wind = d.wind?.speed ?? "-";
  const iconUrl = prettyIconUrl(icon);

  weatherBox.innerHTML = `
    <article class="card weather">
      <header class="weather__head">
        <h2 class="city">${escapeHtml(name)}</h2>
        <div class="weather__main">
          <img class="icon" src="${iconUrl}" alt="${escapeHtml(desc)}" />
          <div class="values">
            <div class="temp">${temp}°C</div>
            <div class="desc">${escapeHtml(desc)}</div>
          </div>
        </div>
      </header>

      <ul class="weather__grid">
        <li><strong>${t.feels}:</strong> ${feels}°C</li>
        <li><strong>${t.hum}:</strong> ${hum}%</li>
        <li><strong>${t.wind}:</strong> ${wind} ${t.mps}</li>
        <li><strong>${t.pres}:</strong> ${pres} ${t.hpa}</li>
      </ul>

      <div style="margin-top:12px">
        <button id="save-city-btn">${t.save}</button>
      </div>
    </article>
  `;

  document.querySelector("#save-city-btn")?.addEventListener("click", onSave);
}

export function renderForecast(weatherBox, state, forecastData, onSelectDay) {
  const t = dict[state.lang] || dict.en;
  if (!forecastData?.list?.length) return;

  const byDay = new Map();
  for (const item of forecastData.list) {
    const dt = new Date(item.dt * 1000);
    const dayKey = dt.toISOString().slice(0, 10);
    const entry = byDay.get(dayKey) || {
      temps: [],
      icons: [],
      descs: [],
      atNoon: null,
      date: new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()),
    };
    const ic = item.weather?.[0]?.icon || "01d";
    const ds = item.weather?.[0]?.description || "";
    entry.temps.push(item.main.temp);
    entry.icons.push(ic);
    entry.descs.push(ds);
    const hour = dt.getHours();
    const diff = Math.abs(12 - hour);
    if (!entry.atNoon || diff < entry.atNoon.diff)
      entry.atNoon = { icon: ic, desc: ds, diff };
    byDay.set(dayKey, entry);
  }

  const locale = localeMap[state.lang] || "en";
  const weekday = (d) => d.toLocaleDateString(locale, { weekday: "short" });

  const cards = [...byDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([k, v]) => {
      const min = Math.round(Math.min(...v.temps));
      const max = Math.round(Math.max(...v.temps));
      const icon = v.atNoon?.icon || v.icons[0];
      const desc = capitalize(v.atNoon?.desc || v.descs[0] || "");
      const iconUrl = prettyIconUrl(icon);
      return `
        <li class="fcard" data-day="${k}">
          <div class="fcard__day">${escapeHtml(weekday(v.date))}</div>
          <img class="fcard__icon" src="${iconUrl}" alt="${escapeHtml(desc)}" />
          <div class="fcard__desc">${escapeHtml(desc)}</div>
          <div class="fcard__temps">
            <span class="min">${t.min}: ${min}°</span>
            <span class="max">${t.max}: ${max}°</span>
          </div>
        </li>
      `;
    })
    .join("");

  const section = `
    <section class="card forecast">
      <h3 class="forecast__title">${t.fiveDays}</h3>
      <ul class="forecast__grid">${cards}</ul>
    </section>
  `;

  const old = document.querySelector(".forecast");
  if (old) old.outerHTML = section;
  else weatherBox.insertAdjacentHTML("beforeend", section);

  document
    .querySelector(".forecast__grid")
    ?.addEventListener("click", onSelectDay);
}

export function renderHourly(weatherBox, state, forecast, dayKey) {
  const t = dict[state.lang] || dict.en;
  if (!forecast?.list?.length) return;

  const locale = localeMap[state.lang] || "en";

  const now = new Date();
  const currentTime = now.getTime();

  const items = forecast.list.filter((it) => {
    const itemTime = it.dt * 1000;
    return itemTime >= currentTime;
  });
  if (!items.length) return;

  const sorted = [...items].sort((a, b) => a.dt - b.dt);
  const startTs = sorted[0].dt * 1000;
  const endTs = sorted[sorted.length - 1].dt * 1000;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  const hourly = [];

  const tempSmoothing = (temps) => {
    if (temps.length < 3) return temps;
    const smoothed = [...temps];
    for (let i = 1; i < temps.length - 1; i++) {
      smoothed[i] = Math.round((temps[i - 1] + temps[i] + temps[i + 1]) / 3);
    }
    return smoothed;
  };

  const currentHour = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours()
  );

  const startTime = currentHour.getTime();

  const maxHours = 12;
  const endTime = Math.min(startTime + maxHours * 60 * 60 * 1000, endTs);

  for (let ts = startTime; ts <= endTime; ts += 60 * 60 * 1000) {
    let prev = null,
      next = null;
    for (const it of sorted) {
      const tms = it.dt * 1000;
      if (tms <= ts) prev = it;
      if (tms >= ts) {
        next = it;
        break;
      }
    }
    if (!prev) prev = sorted[0];
    if (!next) next = sorted[sorted.length - 1];

    const span = (next.dt - prev.dt) * 1000 || 1;
    const ratio = Math.min(1, Math.max(0, (ts - prev.dt * 1000) / span));
    const temp = Math.round(lerp(prev.main.temp, next.main.temp, ratio));
    let icon, desc;
    if (ratio < 0.3) {
      icon = prev.weather?.[0]?.icon || "01d";
      desc = prev.weather?.[0]?.description || "";
    } else if (ratio > 0.7) {
      icon = next.weather?.[0]?.icon || "01d";
      desc = next.weather?.[0]?.description || "";
    } else {
      icon = prev.weather?.[0]?.icon || "01d";
      desc = prev.weather?.[0]?.description || "";
    }

    const hr = new Date(ts).getHours();
    if (hr >= 6 && hr < 18 && icon.endsWith("n")) {
      icon = icon.replace("n", "d");
    } else if ((hr < 6 || hr >= 18) && icon.endsWith("d")) {
      icon = icon.replace("d", "n");
    }

    hourly.push({ ts, temp, desc: capitalize(desc), icon });
  }

  const temps = hourly.map((h) => h.temp);
  const smoothedTemps = tempSmoothing(temps);
  hourly.forEach((h, i) => {
    h.temp = smoothedTemps[i];
  });

  for (let i = 1; i < hourly.length - 1; i++) {
    const prev = hourly[i - 1];
    const curr = hourly[i];
    const next = hourly[i + 1];

    if (curr.desc !== prev.desc && curr.desc !== next.desc) {
      curr.desc = prev.desc;
      curr.icon = prev.icon;
    }
  }

  const rows = hourly
    .map((h) => {
      const time = new Date(h.ts).toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      });
      const iconUrl = prettyIconUrl(h.icon);
      return `
      <li class="hrow">
        <span class="hrow__time">${time}</span>
        <img class="hrow__icon" src="${iconUrl}" alt="${escapeHtml(h.desc)}" />
        <span class="hrow__temp">${h.temp}°C</span>
        <span class="hrow__desc">${escapeHtml(h.desc)}</span>
      </li>`;
    })
    .join("");

  const hourlySection = `
    <section class="card hourly">
      <div class="hourly__head">
        <button class="hourly__back">${t.back}</button>
        <h3 class="hourly__title">${t.hourlyTitle}</h3>
      </div>
      <ul class="hourly__grid">${rows}</ul>
    </section>
  `;

  const old = document.querySelector(".hourly");
  if (old) old.outerHTML = hourlySection;
  else weatherBox.insertAdjacentHTML("beforeend", hourlySection);
}
