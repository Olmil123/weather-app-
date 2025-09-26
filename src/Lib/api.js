export async function fetchWeatherByCity(city, lang = "en") {
  const key = import.meta.env.VITE_OWM_KEY;
  if (!key) throw new Error("Missing OpenWeatherMap API key (VITE_OWM_KEY).");

  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  const apiLang = lang === "cs" ? "cz" : lang;
  url.search = new URLSearchParams({
    q: city.trim(),
    appid: key,
    units: "metric",
    lang: apiLang,
  });

  const res = await fetch(url);

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}: ${res.statusText}`);
    err.status = res.status;
    err.code = res.status;
    throw err;
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    const err = new Error(
      `Invalid response format. Expected JSON, got: ${text.substring(
        0,
        100
      )}...`
    );
    err.status = res.status;
    err.code = "INVALID_FORMAT";
    throw err;
  }

  const data = await res.json();
  return data;
}

export async function fetchForecastByCity(city, lang = "en") {
  const key = import.meta.env.VITE_OWM_KEY;
  if (!key) throw new Error("Missing OpenWeatherMap API key (VITE_OWM_KEY).");

  const url = new URL("https://api.openweathermap.org/data/2.5/forecast");
  const apiLang = lang === "cs" ? "cz" : lang;
  url.search = new URLSearchParams({
    q: city.trim(),
    appid: key,
    units: "metric",
    lang: apiLang,
  });

  const res = await fetch(url);

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}: ${res.statusText}`);
    err.status = res.status;
    err.code = res.status;
    throw err;
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    const err = new Error(
      `Invalid response format. Expected JSON, got: ${text.substring(
        0,
        100
      )}...`
    );
    err.status = res.status;
    err.code = "INVALID_FORMAT";
    throw err;
  }

  const data = await res.json();
  return data;
}

export async function fetchCityLocalNameByCoords(lat, lon, lang = "en") {
  const key = import.meta.env.VITE_OWM_KEY;
  if (!key) throw new Error("Missing OpenWeatherMap API key (VITE_OWM_KEY).");

  const url = new URL("https://api.openweathermap.org/geo/1.0/reverse");
  const localeMap = { en: "en", ua: "uk", cs: "cs", cz: "cs", ru: "ru" };
  const apiLang = localeMap[lang] || "en";
  url.search = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    limit: "1",
    appid: key,
    lang: apiLang,
  });

  const res = await fetch(url);

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}: ${res.statusText}`);
    err.status = res.status;
    err.code = res.status;
    throw err;
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    const err = new Error(
      `Invalid response format. Expected JSON, got: ${text.substring(
        0,
        100
      )}...`
    );
    err.status = res.status;
    err.code = "INVALID_FORMAT";
    throw err;
  }

  const data = await res.json();

  const obj = Array.isArray(data) ? data[0] : null;
  const local = obj?.local_names?.[apiLang];
  return local || obj?.name || null;
}
