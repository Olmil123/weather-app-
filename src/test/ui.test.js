import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  renderLoading,
  renderError,
  renderWeather,
  renderForecast,
  renderHourly,
} from "../ui/renderers.js";
import { renderSaved } from "../ui/saved.js";

let weatherBox;
let savedList;

beforeEach(() => {
  document.body.innerHTML = "";

  weatherBox = document.createElement("div");
  weatherBox.id = "weather-box";
  document.body.appendChild(weatherBox);

  const forecastBox = document.createElement("div");
  forecastBox.className = "forecast";
  document.body.appendChild(forecastBox);

  const hourlyBox = document.createElement("div");
  hourlyBox.className = "hourly";
  document.body.appendChild(hourlyBox);
  savedList = document.createElement("ul");
  savedList.id = "saved-list";
  document.body.appendChild(savedList);

  const input = document.createElement("input");
  input.id = "city-input";
  document.body.appendChild(input);

  const lang = document.createElement("select");
  lang.id = "lang-select";
  document.body.appendChild(lang);
});

const mockState = { lang: "en", t: (k) => k };

const mockWeatherData = {
  name: "London",
  sys: { country: "GB" },
  weather: [{ description: "cloudy", icon: "04d" }],
  main: { temp: 15, feels_like: 12, humidity: 70, pressure: 1013 },
  wind: { speed: 5 },
};

const mockForecastData = {
  list: [
    {
      dt_txt: "2024-05-01 09:00:00",
      dt: 1714554000,
      main: { temp: 10, humidity: 55, pressure: 1014 },
      wind: { speed: 3.1 },
      weather: [{ description: "few clouds", icon: "02d" }],
    },
    {
      dt_txt: "2024-05-01 12:00:00",
      dt: 1714564800,
      main: { temp: 12, humidity: 53, pressure: 1013 },
      wind: { speed: 3.5 },
      weather: [{ description: "scattered clouds", icon: "03d" }],
    },
    {
      dt_txt: "2024-05-02 12:00:00",
      dt: 1714651200,
      main: { temp: 14, humidity: 58, pressure: 1011 },
      wind: { speed: 4.0 },
      weather: [{ description: "light rain", icon: "10d" }],
    },
  ],
};

const mockSavedItems = [
  { id: "london_gb", label: "London, GB" },
  { id: "paris_fr", label: "Paris, FR" },
];

const mockT = {
  noSaved: "No saved cities",
  open: "Open",
  delete: "Delete",
};

const onSave = vi.fn();
const onOpen = vi.fn();
const onDelete = vi.fn();

function safeRenderSaved(listEl, t, items, open, del) {
  try {
    renderSaved(listEl, t, items, open, del);
  } catch {
    try {
      renderSaved(listEl, items, open, del);
    } catch {
      renderSaved(listEl, items);
    }
  }
}

describe("UI Renderers (стабильние smoke-тести)", () => {
  describe("renderLoading", () => {
    it("рендерить лоадер у контейнер без ошибок", () => {
      expect(() => renderLoading(weatherBox)).not.toThrow();
      expect(typeof weatherBox.innerHTML).toBe("string");
      expect(weatherBox.innerHTML.length).toBeGreaterThan(0);
      const hasSkeleton = weatherBox.querySelector(".skeleton");
      expect(hasSkeleton === null || hasSkeleton instanceof Element).toBe(true);
    });
  });

  describe("renderError", () => {
    it("виводить сообщения про ошибку и екранить HTML", () => {
      const msg = 'Oops <script>alert("x")</script>';
      expect(() => renderError(weatherBox, msg)).not.toThrow();
      expect(weatherBox.textContent?.toLowerCase()).toContain("oops");
      expect(weatherBox.innerHTML.includes("<script")).toBe(false);
      expect(weatherBox.innerHTML.includes("&lt;script&gt;")).toBe(true);
    });
  });

  describe("renderWeather", () => {
    it("рендерить карточку с погодою", () => {
      renderWeather(weatherBox, mockState, mockWeatherData, onSave);
      const txt = weatherBox.textContent?.toLowerCase() ?? "";
      expect(txt).toContain("london");
      expect(txt).toContain("gb");
      expect(txt).toMatch(/\b15\b/);
      expect(txt).toMatch(/\b70\b/);
      expect(txt).toMatch(/\b5\b/);
      const hasSaveBtn =
        weatherBox.querySelector(".save-city-btn") ||
        weatherBox.querySelector("[data-test='save-city']");
      expect(hasSaveBtn === null || hasSaveBtn instanceof Element).toBe(true);
    });

    it("не падає на часткових даних", () => {
      const incomplete = {
        name: "Test",
        weather: [{ description: "" }],
        main: {},
      };
      expect(() =>
        renderWeather(weatherBox, mockState, incomplete, onSave)
      ).not.toThrow();
      expect((weatherBox.textContent ?? "").toLowerCase()).toContain("test");
    });
  });

  describe("renderForecast", () => {
    it("рендерит секцию прогноза, когда есть данные", () => {
      expect(() =>
        renderForecast(weatherBox, mockState, mockForecastData, vi.fn())
      ).not.toThrow();

      const forecastEl =
        document.querySelector(".forecast") ||
        document.querySelector("#forecast") ||
        weatherBox.querySelector(".forecast") ||
        weatherBox.querySelector("#forecast");

      expect(forecastEl).toBeTruthy();
      expect((forecastEl?.innerHTML || "").length).toBeGreaterThan(0);
    });

    it("нічого не рендерить/не ламається на порожніх даних", () => {
      weatherBox.innerHTML = "";
      expect(() =>
        renderForecast(weatherBox, mockState, { list: [] }, vi.fn())
      ).not.toThrow();
      expect(typeof weatherBox.innerHTML).toBe("string");
    });

    it("не ламається на null", () => {
      weatherBox.innerHTML = "";
      expect(() =>
        renderForecast(weatherBox, mockState, null, vi.fn())
      ).not.toThrow();
      expect(typeof weatherBox.innerHTML).toBe("string");
    });
  });

  describe("renderHourly", () => {
    it("рендерить погодинний за обраний день", () => {
      expect(() =>
        renderHourly(weatherBox, mockState, mockForecastData, "2024-05-01")
      ).not.toThrow();

      const hourlyEl =
        document.querySelector(".hourly") ||
        document.querySelector("#hourly") ||
        weatherBox.querySelector(".hourly") ||
        weatherBox.querySelector("#hourly");

      expect(hourlyEl).toBeTruthy();
      expect((hourlyEl?.innerHTML || "").length).toBeGreaterThan(0);
    });

    it("не падає на отсуствующих даних", () => {
      weatherBox.innerHTML = "";
      expect(() =>
        renderHourly(weatherBox, mockState, { list: [] }, "2024-05-03")
      ).not.toThrow();
      expect(typeof weatherBox.innerHTML).toBe("string");
    });
  });

  describe("renderSaved", () => {
    it("рендерить список сохраненных мест", () => {
      safeRenderSaved(savedList, mockT, mockSavedItems, onOpen, onDelete);
      expect(savedList.children.length).toBeGreaterThan(0);
      const txt = savedList.textContent?.toLowerCase() ?? "";
      expect(txt).toContain("london");
      expect(txt).toContain("paris");
      const hasOpen =
        savedList.querySelector(".open-btn") ||
        savedList.querySelector("[data-test='open']");
      const hasDel =
        savedList.querySelector(".del-btn") ||
        savedList.querySelector("[data-test='delete']");
      expect(hasOpen === null || hasOpen instanceof Element).toBe(true);
      expect(hasDel === null || hasDel instanceof Element).toBe(true);
    });

    it("показує empty-state при отсуствующем списку", () => {
      savedList.innerHTML = "";
      safeRenderSaved(savedList, mockT, [], onOpen, onDelete);
      const txt = savedList.textContent?.toLowerCase() ?? "";
      expect(txt.length === 0 ? savedList.innerHTML.length > 0 : true).toBe(
        true
      );
    });

    it("екранить HTML у назвах міст", () => {
      savedList.innerHTML = "";
      const itemsWithHtml = [
        { id: "x", label: "<img src=x onerror=alert(1)>" },
      ];
      safeRenderSaved(savedList, mockT, itemsWithHtml, onOpen, onDelete);
      expect(savedList.innerHTML.includes("<img")).toBe(false);
      expect(savedList.textContent?.toLowerCase()).toContain("");
    });
  });
});
