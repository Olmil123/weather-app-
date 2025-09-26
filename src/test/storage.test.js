import { describe, it, expect, beforeEach, vi } from "vitest";
import { getSavedCities, saveCityObject, removeCity } from "../Lib/storage.js";

describe("Storage Functions", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("getSavedCities", () => {
    it("should return empty array when localStorage is empty", () => {
      const result = getSavedCities();
      expect(result).toEqual([]);
    });

    it("should return saved cities from localStorage", () => {
      const testCities = [
        { id: 1, label: "London, GB" },
        { id: 2, label: "Paris, FR" },
      ];
      localStorage.setItem("savedCities", JSON.stringify(testCities));

      const result = getSavedCities();
      expect(result).toEqual(testCities);
    });

    it("should handle old string format and convert to new format", () => {
      const oldFormat = ["London", "Paris"];
      localStorage.setItem("savedCities", JSON.stringify(oldFormat));

      const result = getSavedCities();
      expect(result).toEqual([
        { id: null, label: "London" },
        { id: null, label: "Paris" },
      ]);
    });

    it("should handle corrupted JSON gracefully", () => {
      localStorage.setItem("savedCities", "invalid json");

      const result = getSavedCities();
      expect(result).toEqual([]);
    });
  });

  describe("saveCityObject", () => {
    it("should save new city to localStorage", () => {
      const city = { id: 1, label: "London, GB" };

      saveCityObject(city);

      const saved = JSON.parse(localStorage.getItem("savedCities"));
      expect(saved).toContainEqual(city);
    });

    it("should not save duplicate city by id", () => {
      const city1 = { id: 1, label: "London, GB" };
      const city2 = { id: 1, label: "London, UK" };

      saveCityObject(city1);
      saveCityObject(city2);

      const saved = JSON.parse(localStorage.getItem("savedCities"));
      expect(saved).toHaveLength(1);
      expect(saved[0]).toEqual(city1);
    });

    it("should not save duplicate city by label (when id is null)", () => {
      const city1 = { id: null, label: "London" };
      const city2 = { id: null, label: "London" };

      saveCityObject(city1);
      saveCityObject(city2);

      const saved = JSON.parse(localStorage.getItem("savedCities"));
      expect(saved).toHaveLength(1);
    });

    it("should handle case-insensitive duplicate checking", () => {
      const city1 = { id: null, label: "London" };
      const city2 = { id: null, label: "LONDON" };

      saveCityObject(city1);
      saveCityObject(city2);

      const saved = JSON.parse(localStorage.getItem("savedCities"));
      expect(saved).toHaveLength(1);
    });

    it("should trim whitespace from label", () => {
      const city = { id: 1, label: "  London, GB  " };

      saveCityObject(city);

      const saved = JSON.parse(localStorage.getItem("savedCities"));
      expect(saved[0].label).toBe("London, GB");
    });
  });

  describe("removeCity", () => {
    beforeEach(() => {
      // Підготовлюємо тестові дані
      const testCities = [
        { id: 1, label: "London, GB" },
        { id: 2, label: "Paris, FR" },
        { id: null, label: "Berlin" },
      ];
      localStorage.setItem("savedCities", JSON.stringify(testCities));
    });

    it("should remove city by id", () => {
      removeCity(1);

      const saved = JSON.parse(localStorage.getItem("savedCities"));
      expect(saved).toHaveLength(2);
      expect(saved.find((c) => c.id === 1)).toBeUndefined();
    });

    it("should remove city by label", () => {
      removeCity("Paris, FR");

      const saved = JSON.parse(localStorage.getItem("savedCities"));
      expect(saved).toHaveLength(2);
      expect(saved.find((c) => c.label === "Paris, FR")).toBeUndefined();
    });

    it("should handle non-existent city gracefully", () => {
      const initialLength = JSON.parse(
        localStorage.getItem("savedCities")
      ).length;

      removeCity("NonExistentCity");

      const saved = JSON.parse(localStorage.getItem("savedCities"));
      expect(saved).toHaveLength(initialLength);
    });

    it("should remove city with null id by label", () => {
      removeCity("Berlin");

      const saved = JSON.parse(localStorage.getItem("savedCities"));
      expect(saved).toHaveLength(2);
      expect(saved.find((c) => c.label === "Berlin")).toBeUndefined();
    });
  });
});
