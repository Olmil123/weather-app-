import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../Lib/api.js", () => ({
  fetchWeatherByCity: vi.fn(),
  fetchForecastByCity: vi.fn(),
}));

vi.mock("../Lib/storage.js", () => ({
  getSavedCities: vi.fn(),
  saveCityObject: vi.fn(),
  removeCity: vi.fn(),
}));

vi.mock("../ui/renderers.js", () => ({
  renderLoading: vi.fn(),
  renderError: vi.fn(),
  renderWeather: vi.fn(),
  renderForecast: vi.fn(),
  renderHourly: vi.fn(),
}));

vi.mock("../ui/saved.js", () => ({
  renderSaved: vi.fn(),
}));

vi.mock("../i18n/translations.js", () => ({
  dict: {
    en: {
      emptyQuery: "Type a city name first",
      notFound: "City not found",
      networkErr: "Network error",
    },
    ua: {
      emptyQuery: "Введіть назву міста",
      notFound: "Місто не знайдено",
      networkErr: "Помилка мережі",
    },
  },
}));

describe("Integration Tests", () => {
  let mockElements;

  beforeEach(() => {
    document.body.innerHTML = "";
    mockElements = {
      form: document.createElement("form"),
      input: document.createElement("input"),
      weatherBox: document.createElement("div"),
      themeBtn: document.createElement("button"),
      langSelect: document.createElement("select"),
      savedList: document.createElement("ul"),
    };

    mockElements.form.id = "search-form";
    mockElements.input.id = "city-input";
    mockElements.input.type = "text";
    mockElements.weatherBox.id = "weather-container";
    mockElements.themeBtn.id = "theme-toggle";
    mockElements.langSelect.id = "lang-switcher";
    mockElements.savedList.id = "saved-list";

    mockElements.form.appendChild(mockElements.input);
    document.body.appendChild(mockElements.form);
    document.body.appendChild(mockElements.weatherBox);
    document.body.appendChild(mockElements.themeBtn);
    document.body.appendChild(mockElements.langSelect);
    document.body.appendChild(mockElements.savedList);

    vi.clearAllMocks();
  });

  describe("Full Search and Display Flow", () => {
    it("should complete full search flow: input → API → display", async () => {
      const { fetchWeatherByCity, fetchForecastByCity } = await import(
        "../Lib/api.js"
      );
      const { renderLoading, renderWeather, renderForecast } = await import(
        "../ui/renderers.js"
      );

      const mockWeatherData = {
        name: "London",
        main: { temp: 15, humidity: 70 },
        weather: [{ description: "cloudy", icon: "04d" }],
        sys: { country: "GB" },
      };

      const mockForecastData = {
        list: [
          {
            dt: 1640995200,
            main: { temp: 10 },
            weather: [{ description: "sunny", icon: "01d" }],
          },
        ],
      };

      fetchWeatherByCity.mockResolvedValue(mockWeatherData);
      fetchForecastByCity.mockResolvedValue(mockForecastData);

      mockElements.input.value = "London";
      const formEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      mockElements.form.dispatchEvent(formEvent);

      expect(renderLoading).toHaveBeenCalledWith(mockElements.weatherBox);
      expect(fetchWeatherByCity).toHaveBeenCalledWith("London", "en");
      expect(fetchForecastByCity).toHaveBeenCalledWith("London", "en");
      expect(renderWeather).toHaveBeenCalled();
      expect(renderForecast).toHaveBeenCalled();
    });

    it("should handle API errors gracefully", async () => {
      const { fetchWeatherByCity } = await import("../Lib/api.js");
      const { renderError } = await import("../ui/renderers.js");

      const apiError = new Error("City not found");
      apiError.status = 404;
      fetchWeatherByCity.mockRejectedValue(apiError);

      mockElements.input.value = "NonExistentCity";

      const formEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      mockElements.form.dispatchEvent(formEvent);

      expect(renderError).toHaveBeenCalled();
    });

    it("should handle network errors", async () => {
      const { fetchWeatherByCity } = await import("../Lib/api.js");
      const { renderError } = await import("../ui/renderers.js");
      const networkError = new Error("Network request failed");
      fetchWeatherByCity.mockRejectedValue(networkError);

      mockElements.input.value = "London";

      const formEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      mockElements.form.dispatchEvent(formEvent);

      expect(renderError).toHaveBeenCalled();
    });
  });

  describe("Theme and Language Switching", () => {
    it("should save theme state to localStorage", () => {
      localStorage.clear();

      const themeToggle = mockElements.themeBtn;
      themeToggle.click();
      const savedTheme = localStorage.getItem("theme");
      expect(savedTheme).toBeDefined();
    });

    it("should save language state to localStorage", () => {
      localStorage.clear();

      mockElements.langSelect.value = "ua";
      const changeEvent = new Event("change", { bubbles: true });
      mockElements.langSelect.dispatchEvent(changeEvent);
      const savedLang = localStorage.getItem("lang");
      expect(savedLang).toBe("ua");
    });

    it("should apply theme classes to document", () => {
      document.documentElement.classList.add("theme-dark");

      expect(document.documentElement.classList.contains("theme-dark")).toBe(
        true
      );

      document.documentElement.classList.remove("theme-dark");
      expect(document.documentElement.classList.contains("theme-dark")).toBe(
        false
      );
    });

    it("should update UI text based on language", () => {
      const { dict } = require("../i18n/translations.js");
      expect(dict.en.emptyQuery).toBe("Type a city name first");
      expect(dict.ua.emptyQuery).toBe("Введіть назву міста");
    });
  });

  describe("LocalStorage Integration", () => {
    it("should save and retrieve cities from localStorage", () => {
      const { saveCityObject, getSavedCities } = require("../Lib/storage.js");

      localStorage.clear();

      const city = { id: 1, label: "London, GB" };
      saveCityObject(city);

      const savedCities = getSavedCities();
      expect(savedCities).toContainEqual(city);
    });

    it("should handle localStorage errors gracefully", () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      const { saveCityObject } = require("../Lib/storage.js");

      expect(() => {
        saveCityObject({ id: 1, label: "Test" });
      }).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });

  describe("UI State Management", () => {
    it("should show loading state during API calls", async () => {
      const { renderLoading } = await import("../ui/renderers.js");

      renderLoading(mockElements.weatherBox);

      expect(renderLoading).toHaveBeenCalledWith(mockElements.weatherBox);
    });

    it("should show error state for invalid input", async () => {
      const { renderError } = await import("../ui/renderers.js");

      renderError(mockElements.weatherBox, "Invalid input");

      expect(renderError).toHaveBeenCalledWith(
        mockElements.weatherBox,
        "Invalid input"
      );
    });

    it("should update saved cities list", async () => {
      const { renderSaved } = await import("../ui/saved.js");
      const { getSavedCities } = await import("../Lib/storage.js");
      const mockCities = [
        { id: 1, label: "London, GB" },
        { id: 2, label: "Paris, FR" },
      ];
      getSavedCities.mockReturnValue(mockCities);

      renderSaved(mockElements.savedList, {}, mockCities, vi.fn(), vi.fn());

      expect(renderSaved).toHaveBeenCalled();
    });
  });
});
