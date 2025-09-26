// Mapping OpenWeather icon codes to nicer SVG icons
export function prettyIconUrl(code) {
  const style = "fill"; // possible values: "fill" | "line"
  const base = `https://basmilius.github.io/weather-icons/production/${style}/all/`;
  const map = {
    "01d": "clear-day",
    "01n": "clear-night",
    "02d": "partly-cloudy-day",
    "02n": "partly-cloudy-night",
    "03d": "cloudy",
    "03n": "cloudy",
    "04d": "overcast",
    "04n": "overcast",
    "09d": "showers-day",
    "09n": "showers-night",
    "10d": "rain",
    "10n": "rain",
    "11d": "thunderstorms",
    "11n": "thunderstorms",
    "13d": "snow",
    "13n": "snow",
    "50d": "mist",
    "50n": "mist",
  };
  const name = map[code] || "cloudy";
  return `${base}${name}.svg`;
}
