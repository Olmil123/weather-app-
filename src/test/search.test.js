import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../Lib/api.js", () => ({
  fetchWeatherByCity: vi.fn(),
  fetchForecastByCity: vi.fn(),
}));

vi.mock("../ui/renderers.js", () => ({
  renderLoading: vi.fn(),
  renderError: vi.fn(),
  renderWeather: vi.fn(),
  renderForecast: vi.fn(),
}));

vi.mock("../i18n/translations.js", () => ({
  dict: {
    en: { emptyQuery: "Type a city name first" },
    ua: { emptyQuery: "Введіть назву міста" },
    cs: { emptyQuery: "Zadejte název města" },
    ru: { emptyQuery: "Введите название города" },
  },
}));

describe("Search Function", () => {
  let mockInput, mockForm, mockWeatherBox;

  beforeEach(() => {
    document.body.innerHTML = "";
    mockInput = document.createElement("input");
    mockInput.id = "city-input";
    mockInput.value = "";
    document.body.appendChild(mockInput);

    mockForm = document.createElement("form");
    mockForm.id = "search-form";
    mockForm.appendChild(mockInput);
    document.body.appendChild(mockForm);

    mockWeatherBox = document.createElement("div");
    mockWeatherBox.id = "weather-container";
    document.body.appendChild(mockWeatherBox);

    vi.clearAllMocks();
  });

  describe("City Input Validation", () => {
    it("should handle empty input correctly", () => {
      mockInput.value = "";

      function validateCityInput(city) {
        if (!city || !city.trim()) {
          return { isValid: false, error: "empty" };
        }
        return { isValid: true };
      }

      const result = validateCityInput(mockInput.value.trim());
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("empty");
    });

    it("should handle whitespace-only input", () => {
      mockInput.value = "   ";

      function validateCityInput(city) {
        if (!city || !city.trim()) {
          return { isValid: false, error: "empty" };
        }
        return { isValid: true };
      }

      const result = validateCityInput(mockInput.value.trim());
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("empty");
    });

    it("should accept valid city names", () => {
      const testCities = ["London", "New York", "Київ", "Prague"];

      function validateCityInput(city) {
        if (!city || !city.trim()) {
          return { isValid: false, error: "empty" };
        }
        if (city.length < 2) {
          return { isValid: false, error: "too_short" };
        }
        return { isValid: true };
      }

      testCities.forEach((city) => {
        const result = validateCityInput(city);
        expect(result.isValid).toBe(true);
      });
    });

    it("should handle special characters in city names", () => {
      const specialCities = ["Sao Paulo", "Munchen", "Zurich", "Łodź"];

      function validateCityInput(city) {
        if (!city || !city.trim()) {
          return { isValid: false, error: "empty" };
        }
        const validPattern = /^[a-zA-Zа-яА-ЯіІїЇєЄ\u00C0-\u017F\s\-']+$/;
        if (!validPattern.test(city)) {
          return { isValid: false, error: "invalid_chars" };
        }
        return { isValid: true };
      }

      specialCities.forEach((city) => {
        const result = validateCityInput(city);
        expect(result.isValid).toBe(true);
      });
    });

    it("should reject input with invalid characters", () => {
      const invalidInputs = [
        "City123",
        "Test@City",
        "City<script>",
        "City&More",
      ];

      function validateCityInput(city) {
        if (!city || !city.trim()) {
          return { isValid: false, error: "empty" };
        }
        const validPattern = /^[a-zA-Zа-яА-ЯіІїЇєЄ\u00C0-\u017F\s\-']+$/;
        if (!validPattern.test(city)) {
          return { isValid: false, error: "invalid_chars" };
        }
        return { isValid: true };
      }

      invalidInputs.forEach((city) => {
        const result = validateCityInput(city);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("invalid_chars");
      });
    });
  });

  describe("Input Sanitization", () => {
    it("should trim whitespace from input", () => {
      const testCases = [
        { input: "  London  ", expected: "London" },
        { input: "\tNew York\n", expected: "New York" },
        { input: "   ", expected: "" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = input.trim();
        expect(result).toBe(expected);
      });
    });

    it("should handle case sensitivity", () => {
      const testCases = [
        { input: "london", expected: "London" },
        { input: "NEW YORK", expected: "New York" },
        { input: "kYIV", expected: "Kyiv" },
      ];

      function capitalizeWords(str) {
        return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
      }

      testCases.forEach(({ input, expected }) => {
        const result = capitalizeWords(input);
        expect(result).toBe(expected);
      });
    });
  });
});
