import { describe, it, expect, beforeEach, vi } from "vitest";
import { prettyIconUrl } from "../utils/icons.js";
import { resolveInitialLang, localeMap } from "../utils/locale.js";
import { capitalize, escapeHtml } from "../utils/strings.js";

describe("Utility Functions", () => {
  describe("prettyIconUrl", () => {
    it("should return correct URL for known icon codes", () => {
      expect(prettyIconUrl("01d")).toBe(
        "https://basmilius.github.io/weather-icons/production/fill/all/clear-day.svg"
      );
      expect(prettyIconUrl("01n")).toBe(
        "https://basmilius.github.io/weather-icons/production/fill/all/clear-night.svg"
      );
      expect(prettyIconUrl("10d")).toBe(
        "https://basmilius.github.io/weather-icons/production/fill/all/rain.svg"
      );
      expect(prettyIconUrl("11n")).toBe(
        "https://basmilius.github.io/weather-icons/production/fill/all/thunderstorms.svg"
      );
    });

    it("should return cloudy icon for unknown codes", () => {
      expect(prettyIconUrl("unknown")).toBe(
        "https://basmilius.github.io/weather-icons/production/fill/all/cloudy.svg"
      );
      expect(prettyIconUrl("")).toBe(
        "https://basmilius.github.io/weather-icons/production/fill/all/cloudy.svg"
      );
    });

    it("should handle all weather conditions", () => {
      const testCases = [
        ["02d", "partly-cloudy-day"],
        ["02n", "partly-cloudy-night"],
        ["03d", "cloudy"],
        ["04d", "overcast"],
        ["09d", "showers-day"],
        ["13d", "snow"],
        ["50d", "mist"],
      ];

      testCases.forEach(([code, expectedName]) => {
        const url = prettyIconUrl(code);
        expect(url).toContain(expectedName);
      });
    });
  });

  describe("resolveInitialLang", () => {
    beforeEach(() => {
      localStorage.clear();
      Object.defineProperty(navigator, "language", {
        value: "en-US",
        writable: true,
      });
    });

    it("should return saved language from localStorage", () => {
      localStorage.setItem("lang", "ua");

      const result = resolveInitialLang();
      expect(result).toBe("ua");
    });

    it("should detect Ukrainian from navigator.language", () => {
      Object.defineProperty(navigator, "language", {
        value: "uk-UA",
        writable: true,
      });

      const result = resolveInitialLang();
      expect(result).toBe("ua");
    });

    it("should detect Czech from navigator.language", () => {
      Object.defineProperty(navigator, "language", {
        value: "cs-CZ",
        writable: true,
      });

      const result = resolveInitialLang();
      expect(result).toBe("cs");
    });

    it("should detect Russian from navigator.language", () => {
      Object.defineProperty(navigator, "language", {
        value: "ru-RU",
        writable: true,
      });

      const result = resolveInitialLang();
      expect(result).toBe("ru");
    });

    it("should default to English for unknown languages", () => {
      Object.defineProperty(navigator, "language", {
        value: "fr-FR",
        writable: true,
      });

      const result = resolveInitialLang();
      expect(result).toBe("en");
    });

    it("should handle missing navigator.language", () => {
      Object.defineProperty(navigator, "language", {
        value: undefined,
        writable: true,
      });

      const result = resolveInitialLang();
      expect(result).toBe("en");
    });
  });

  describe("localeMap", () => {
    it("should have correct language mappings", () => {
      expect(localeMap.en).toBe("en");
      expect(localeMap.ua).toBe("uk");
      expect(localeMap.cs).toBe("cs");
      expect(localeMap.cz).toBe("cs");
      expect(localeMap.ru).toBe("ru");
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("world")).toBe("World");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });

    it("should handle single character", () => {
      expect(capitalize("a")).toBe("A");
    });

    it("should handle already capitalized string", () => {
      expect(capitalize("Hello")).toBe("Hello");
    });

    it("should handle non-string input", () => {
      expect(capitalize(123)).toBe("123");
      expect(capitalize(null)).toBe("Null");
      expect(capitalize(undefined)).toBe("Undefined");
    });
  });

  describe("escapeHtml", () => {
    it("should escape HTML special characters", () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
      );
    });

    it("should escape ampersands", () => {
      expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    it("should escape quotes", () => {
      expect(escapeHtml('He said "Hello"')).toBe("He said &quot;Hello&quot;");
      expect(escapeHtml("It's working")).toBe("It&#039;s working");
    });

    it("should handle empty string", () => {
      expect(escapeHtml("")).toBe("");
    });

    it("should handle non-string input", () => {
      expect(escapeHtml(123)).toBe("123");
      expect(escapeHtml(null)).toBe("null");
    });

    it("should handle complex HTML", () => {
      const input = '<div class="test">Content with "quotes" & symbols</div>';
      const expected =
        "&lt;div class=&quot;test&quot;&gt;Content with &quot;quotes&quot; &amp; symbols&lt;/div&gt;";
      expect(escapeHtml(input)).toBe(expected);
    });
  });
});
