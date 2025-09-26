import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchWeatherByCity,
  fetchForecastByCity,
  fetchCityLocalNameByCoords,
} from "../Lib/api.js";

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
});

describe("API Functions", () => {
  describe("fetchWeatherByCity", () => {
    it("success: returns weather json and calls correct URL/params", async () => {
      const mockWeather = {
        name: "London",
        main: { temp: 15, humidity: 70 },
        weather: [{ description: "cloudy", icon: "04d" }],
        sys: { country: "GB" },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => mockWeather,
      });

      const data = await fetchWeatherByCity("London", "en");

      expect(fetch).toHaveBeenCalledTimes(1);
      const calledUrl = String(fetch.mock.calls[0][0]);
      expect(calledUrl).toContain("api.openweathermap.org/data/2.5/weather");
      expect(calledUrl).toContain("q=London");
      expect(calledUrl).toContain("units=metric");
      expect(calledUrl).toContain("lang=en");
      expect(calledUrl).toMatch(/appid=[^&]+/);
      expect(data).toEqual(mockWeather);
    });

    it("maps 'cs' to 'cz' for OWM lang", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => ({ name: "Prague" }),
      });
      await fetchWeatherByCity("Prague", "cs");
      const calledUrl = String(fetch.mock.calls[0][0]);
      expect(calledUrl).toContain("lang=cz");
    });

    it("error: city not found -> throws API message", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: "city not found", cod: "404" }),
      });
      await expect(fetchWeatherByCity("NoCity", "en")).rejects.toThrow(
        /HTTP 404/
      );
    });
  });

  describe("fetchForecastByCity", () => {
    it("success: returns forecast json and hits correct endpoint", async () => {
      const mockForecast = {
        list: [
          {
            dt: 1640995200,
            main: { temp: 10 },
            weather: [{ description: "sunny", icon: "01d" }],
          },
        ],
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => mockForecast,
      });

      const data = await fetchForecastByCity("London", "en");
      expect(fetch).toHaveBeenCalledTimes(1);
      const calledUrl = String(fetch.mock.calls[0][0]);
      expect(calledUrl).toContain("api.openweathermap.org/data/2.5/forecast");
      expect(calledUrl).toContain("q=London");
      expect(calledUrl).toContain("lang=en");
      expect(data).toEqual(mockForecast);
    });

    it("error: server error -> throws message", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Server error", cod: "500" }),
      });
      await expect(fetchForecastByCity("London", "en")).rejects.toThrow(
        /HTTP 500/
      );
    });
  });

  describe("fetchCityLocalNameByCoords", () => {
    it("should return localized city name", async () => {
      const mockGeocodingData = [
        {
          name: "London",
          local_names: {
            en: "London",
            uk: "Лондон",
            cs: "Londýn",
            ru: "Лондон",
          },
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => mockGeocodingData,
      });

      const result = await fetchCityLocalNameByCoords(51.5074, -0.1278, "ua");

      expect(fetch).toHaveBeenCalledTimes(1);
      const calledUrl = String(fetch.mock.calls[0][0]);
      expect(calledUrl).toContain("api.openweathermap.org/geo/1.0/reverse");
      expect(calledUrl).toContain("lat=51.5074");
      expect(calledUrl).toContain("lon=-0.1278");
      expect(calledUrl).toContain("lang=uk");
      expect(result).toBe("Лондон");
    });

    it("should fallback to default name if localized not available", async () => {
      const mockGeocodingData = [
        {
          name: "London",
          local_names: {
            en: "London",
          },
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        headers: { get: () => "application/json" },
        json: async () => mockGeocodingData,
      });

      const result = await fetchCityLocalNameByCoords(51.5074, -0.1278, "ua");

      expect(result).toBe("London");
    });

    it("should handle API errors", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "Server error" }),
      });

      await expect(
        fetchCityLocalNameByCoords(51.5074, -0.1278, "en")
      ).rejects.toThrow(/HTTP 500/);
    });
  });
});
