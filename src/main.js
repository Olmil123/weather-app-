import "./styles/main.scss";
import {
  fetchWeatherByCity,
  fetchForecastByCity,
  fetchCityLocalNameByCoords,
} from "./Lib/api.js";
import { getSavedCities, saveCityObject, removeCity } from "./Lib/storage.js";
import { dict } from "./i18n/translations.js";
import { resolveInitialLang } from "./utils/locale.js";
import { capitalize } from "./utils/strings.js";
import {
  renderLoading as uiRenderLoading,
  renderError as uiRenderError,
  renderWeather as uiRenderWeather,
  renderForecast as uiRenderForecast,
  renderHourly as uiRenderHourly,
} from "./ui/renderers.js";
import { renderSaved as uiRenderSaved } from "./ui/saved.js";

const $ = (s, r = document) => r.querySelector(s);
const form = $("#search-form");
const input = $("#city-input");
const weatherBox = $("#weather-container");
const themeBtn = $("#theme-toggle");
const langSelect = $("#lang-switcher");
const savedList = document.querySelector("#saved-list");

let state = {
  lang: resolveInitialLang(),
  theme: localStorage.getItem("theme") || "light",
  lastData: null,
  lastCity: null,
  lastForecast: null,
};

let isLoading = false;

applyLang(state.lang);
applyTheme(state.theme);
renderSaved();

form?.addEventListener("submit", onSearch);
themeBtn?.addEventListener("click", toggleTheme);
langSelect?.addEventListener("change", onLangChange);

async function loadWeatherData(city, lang) {
  if (isLoading) return;
  isLoading = true;
  uiRenderLoading(weatherBox);

  try {
    const data = await fetchWeatherByCity(city, lang);
    state.lastData = data;
    renderWeather(data);

    const forecast = await fetchForecastByCity(city, lang);
    state.lastForecast = forecast;
    renderForecast(forecast);
  } catch (err) {
    renderFriendlyError(err);
  } finally {
    isLoading = false;
  }
}

async function onSearch(e) {
  e.preventDefault();
  const city = input.value.trim();

  if (!city) {
    renderError((dict[state.lang] || dict.en).emptyQuery);
    return;
  }

  if (!isValidCityName(city)) {
    const t = dict[state.lang] || dict.en;
    renderError(t.invalidCity || "Please enter a valid city name");
    return;
  }

  state.lastCity = city;
  await loadWeatherData(city, state.lang);
}

function isValidCityName(city) {
  const cleanCity = city.trim();

  if (cleanCity.length < 3) return false;
  if (cleanCity.length > 50) return false;
  if (/^\d+$/.test(cleanCity)) return false;
  if (/^[^a-zA-Zа-яА-ЯіІїЇєЄ\u00C0-\u017F]+$/.test(cleanCity)) return false;
  if (!/[a-zA-Zа-яА-ЯіІїЇєЄ\u00C0-\u017F]/.test(cleanCity)) return false;
  if (
    cleanCity.length === 3 &&
    !/^[A-Z][a-z]{2}$|^[А-Я][а-я]{2}$/.test(cleanCity)
  ) {
    return false;
  }

  const generalWords = [
    "китай",
    "россия",
    "украина",
    "америка",
    "европа",
    "азия",
    "африка",
  ];
  if (generalWords.includes(cleanCity.toLowerCase())) return false;

  return true;
}

function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  localStorage.setItem("theme", state.theme);
  applyTheme(state.theme);
}

async function onLangChange() {
  state.lang = langSelect.value;
  localStorage.setItem("lang", state.lang);
  applyLang(state.lang);
  renderSaved();

  if (!state.lastCity) return;
  await loadWeatherData(state.lastCity, state.lang);
}

function renderFriendlyError(err) {
  const t = dict[state.lang] || dict.en;

  const notFound =
    err?.status === 404 ||
    err?.code === "404" ||
    /city not found/i.test(err?.message || "");

  const apiKeyError =
    err?.status === 401 ||
    err?.code === "401" ||
    /invalid.*api.*key/i.test(err?.message || "") ||
    /api.*key.*required/i.test(err?.message || "");

  const invalidFormat =
    err?.code === "INVALID_FORMAT" ||
    /invalid.*response.*format/i.test(err?.message || "");

  let msg;
  if (notFound) {
    msg = t.notFound;
  } else if (apiKeyError) {
    msg = "API key is missing or invalid. Please check your configuration.";
  } else if (invalidFormat) {
    msg = "Server returned invalid data format. Please try again later.";
  } else if (/Network|Failed|fetch/i.test(err?.message || "")) {
    msg = t.networkErr;
  } else {
    msg = capitalize(err?.message || "Error");
  }

  renderError(msg);
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("theme-dark", theme === "dark");
  if (themeBtn) themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function applyLang(lang) {
  if (langSelect) langSelect.value = lang;
  const t = dict[lang] || dict.en;

  document.title = t.appTitle || "Weather App";
  const h1 = document.querySelector(".app__title");
  if (h1) h1.textContent = t.appTitle || "Weather App";
  if (input) input.placeholder = t.placeholder;
  const btn = form?.querySelector("button[type='submit']");
  if (btn) btn.textContent = t.search;
  const savedTitle = document.querySelector("[data-i18n='savedTitle']");
  if (savedTitle) savedTitle.textContent = t.savedTitle || "Saved cities";
}

function renderError(msg) {
  uiRenderError(weatherBox, msg);
}

function renderWeather(d) {
  const t = dict[state.lang] || dict.en;
  let name = `${d.name || ""}${d.sys?.country ? ", " + d.sys.country : ""}`;

  if (d.coord?.lat != null && d.coord?.lon != null) {
    fetchCityLocalNameByCoords(d.coord.lat, d.coord.lon, state.lang)
      .then((local) => {
        if (!local) return;
        const localized = `${local}${
          d.sys?.country ? ", " + d.sys.country : ""
        }`;
        const h = document.querySelector(".weather .city");
        if (h) h.textContent = localized;
      })
      .catch(() => {});
  }
  uiRenderWeather(weatherBox, state, d, () => {
    const label = `${d.name || ""}${
      d.sys?.country ? ", " + d.sys.country : ""
    }`.trim();
    saveCityObject({ id: d.id ?? null, label });
    renderSaved();
  });
}

function renderForecast(forecastData) {
  const t = dict[state.lang] || dict.en;
  if (!forecastData?.list?.length) return;

  uiRenderForecast(weatherBox, state, { list: forecastData.list }, (e) => {
    const card = e.target.closest(".fcard");
    if (!card) return;
    const dayKey = card.getAttribute("data-day");
    renderHourly(dayKey);
  });
}

function renderHourly(dayKey) {
  const forecast = state.lastForecast;
  if (!forecast?.list?.length) return;
  uiRenderHourly(weatherBox, state, forecast, dayKey);
  document.querySelector(".hourly__back")?.addEventListener("click", () => {
    document.querySelector(".hourly")?.remove();
  });
}

function renderSaved() {
  const t = dict[state.lang] || dict.en;
  const items = getSavedCities();
  uiRenderSaved(
    savedList,
    t,
    items,
    (label) => {
      input.value = label;
      form.dispatchEvent(new Event("submit"));
    },
    (labelOrId) => {
      removeCity(labelOrId);
      renderSaved();
    }
  );
}
