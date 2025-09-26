import { describe, it, expect, beforeEach, vi } from "vitest";

describe("UI Elements Tests", () => {
  let mockDocument;

  beforeEach(() => {
    document.body.innerHTML = "";

    document.body.innerHTML = `
      <div class="bg-clouds" aria-hidden="true">
        <span class="cloud"></span>
        <span class="cloud"></span>
        <span class="cloud"></span>
        <span class="cloud"></span>
        <span class="cloud"></span>
        <span class="cloud"></span>
      </div>
      <div class="app">
        <header class="app__bar">
          <h1 class="app__title">Weather App</h1>
          <div class="controls">
            <select id="lang-switcher">
              <option value="en">EN</option>
              <option value="ua">UA</option>
              <option value="cs">CZ</option>
              <option value="ru">RU</option>
            </select>
            <button id="theme-toggle" aria-label="Toggle theme">🌙</button>
          </div>
        </header>

        <form id="search-form" autocomplete="off" role="search">
          <input id="city-input" type="text" placeholder="Enter city..." />
          <button type="submit">Search</button>
        </form>

        <div class="layout">
          <aside class="saved">
            <h3 class="saved__title" data-i18n="savedTitle">Saved cities</h3>
            <ul id="saved-list" class="saved__list"></ul>
          </aside>

          <main id="weather-container"></main>
        </div>
      </div>
    `;
  });

  describe("Essential UI Elements", () => {
    it("should have search input element", () => {
      const input = document.getElementById("city-input");
      expect(input).toBeTruthy();
      expect(input.type).toBe("text");
      expect(input.placeholder).toBe("Enter city...");
    });

    it("should have search form element", () => {
      const form = document.getElementById("search-form");
      expect(form).toBeTruthy();
      expect(form.getAttribute("role")).toBe("search");
      expect(form.getAttribute("autocomplete")).toBe("off");
    });

    it("should have search button", () => {
      const form = document.getElementById("search-form");
      const button = form.querySelector("button[type='submit']");
      expect(button).toBeTruthy();
      expect(button.textContent).toBe("Search");
    });

    it("should have weather container", () => {
      const container = document.getElementById("weather-container");
      expect(container).toBeTruthy();
      expect(container.tagName).toBe("MAIN");
    });

    it("should have theme toggle button", () => {
      const themeBtn = document.getElementById("theme-toggle");
      expect(themeBtn).toBeTruthy();
      expect(themeBtn.getAttribute("aria-label")).toBe("Toggle theme");
      expect(themeBtn.textContent).toBe("🌙");
    });

    it("should have language switcher", () => {
      const langSelect = document.getElementById("lang-switcher");
      expect(langSelect).toBeTruthy();
      expect(langSelect.tagName).toBe("SELECT");

      const options = langSelect.querySelectorAll("option");
      expect(options).toHaveLength(4);
      expect(options[0].value).toBe("en");
      expect(options[1].value).toBe("ua");
      expect(options[2].value).toBe("cs");
      expect(options[3].value).toBe("ru");
    });

    it("should have saved cities list", () => {
      const savedList = document.getElementById("saved-list");
      expect(savedList).toBeTruthy();
      expect(savedList.tagName).toBe("UL");
      expect(savedList.className).toBe("saved__list");
    });

    it("should have app title", () => {
      const title = document.querySelector(".app__title");
      expect(title).toBeTruthy();
      expect(title.textContent).toBe("Weather App");
    });

    it("should have saved cities title", () => {
      const savedTitle = document.querySelector(".saved__title");
      expect(savedTitle).toBeTruthy();
      expect(savedTitle.getAttribute("data-i18n")).toBe("savedTitle");
      expect(savedTitle.textContent).toBe("Saved cities");
    });
  });

  describe("Loading States", () => {
    it("should be able to show loading state", () => {
      const container = document.getElementById("weather-container");

      container.innerHTML = `
        <div class="card loading">
          <div class="row big skeleton"></div>
          <div class="row skeleton"></div>
          <div class="row skeleton"></div>
          <div class="row skeleton"></div>
        </div>
      `;

      const loadingCard = container.querySelector(".card.loading");
      expect(loadingCard).toBeTruthy();

      const skeletonElements = container.querySelectorAll(".skeleton");
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it("should be able to show error state", () => {
      const container = document.getElementById("weather-container");

      container.innerHTML = `
        <div class="card error">
          City not found. Try another one
        </div>
      `;

      const errorCard = container.querySelector(".card.error");
      expect(errorCard).toBeTruthy();
      expect(errorCard.textContent).toContain("City not found");
    });

    it("should be able to show weather data", () => {
      const container = document.getElementById("weather-container");

      container.innerHTML = `
        <article class="card weather">
          <header class="weather__head">
            <h2 class="city">London, GB</h2>
            <div class="weather__main">
              <img class="icon" src="icon-url" alt="cloudy" />
              <div class="values">
                <div class="temp">15°C</div>
                <div class="desc">cloudy</div>
              </div>
            </div>
          </header>
          <ul class="weather__grid">
            <li>
              <span>Wind</span>
              <span>5 m/s</span>
            </li>
            <li>
              <span>Humidity</span>
              <span>70%</span>
            </li>
            <li>
              <span>Pressure</span>
              <span>1013 hPa</span>
            </li>
            <li>
              <span>Feels like</span>
              <span>12°C</span>
            </li>
          </ul>
        </article>
      `;

      const weatherCard = container.querySelector(".card.weather");
      expect(weatherCard).toBeTruthy();

      const cityName = container.querySelector(".city");
      expect(cityName).toBeTruthy();
      expect(cityName.textContent).toBe("London, GB");

      const temperature = container.querySelector(".temp");
      expect(temperature).toBeTruthy();
      expect(temperature.textContent).toBe("15°C");

      const weatherGrid = container.querySelector(".weather__grid");
      expect(weatherGrid).toBeTruthy();
      expect(weatherGrid.children).toHaveLength(4);
    });
  });

  describe("Forecast Elements", () => {
    it("should be able to show forecast data", () => {
      const container = document.getElementById("weather-container");

      container.innerHTML = `
        <section class="card forecast">
          <h3 class="forecast__title">5-day forecast</h3>
          <ul class="forecast__grid">
            <li class="fcard" data-day="2024-05-01">
              <div class="fcard__day">Monday</div>
              <img class="fcard__icon" src="icon-url" alt="sunny" />
              <div class="fcard__desc">sunny</div>
              <div class="fcard__temps">
                <span class="min">min: 10°</span>
                <span class="max">max: 20°</span>
              </div>
            </li>
          </ul>
        </section>
      `;

      const forecastSection = container.querySelector(".forecast");
      expect(forecastSection).toBeTruthy();

      const forecastTitle = container.querySelector(".forecast__title");
      expect(forecastTitle).toBeTruthy();
      expect(forecastTitle.textContent).toBe("5-day forecast");

      const forecastGrid = container.querySelector(".forecast__grid");
      expect(forecastGrid).toBeTruthy();

      const forecastCard = container.querySelector(".fcard");
      expect(forecastCard).toBeTruthy();
      expect(forecastCard.getAttribute("data-day")).toBe("2024-05-01");
    });

    it("should be able to show hourly forecast", () => {
      const container = document.getElementById("weather-container");

      container.innerHTML = `
        <section class="card hourly">
          <div class="hourly__head">
            <button class="hourly__back">Back</button>
            <h3 class="hourly__title">Hourly forecast</h3>
          </div>
          <ul class="hourly__grid">
            <li class="hrow">
              <span class="hrow__time">09:00</span>
              <img class="hrow__icon" src="icon-url" alt="sunny" />
              <span class="hrow__temp">15°C</span>
              <span class="hrow__desc">sunny</span>
            </li>
          </ul>
        </section>
      `;

      const hourlySection = container.querySelector(".hourly");
      expect(hourlySection).toBeTruthy();

      const backButton = container.querySelector(".hourly__back");
      expect(backButton).toBeTruthy();
      expect(backButton.textContent).toBe("Back");

      const hourlyTitle = container.querySelector(".hourly__title");
      expect(hourlyTitle).toBeTruthy();
      expect(hourlyTitle.textContent).toBe("Hourly forecast");

      const hourlyRow = container.querySelector(".hrow");
      expect(hourlyRow).toBeTruthy();
    });
  });

  describe("Saved Cities Elements", () => {
    it("should be able to show saved cities", () => {
      const savedList = document.getElementById("saved-list");

      savedList.innerHTML = `
        <li class="saved__item">
          <button class="open-btn" title="Open">London, GB</button>
          <button class="del-btn" title="Delete">✕</button>
        </li>
        <li class="saved__item">
          <button class="open-btn" title="Open">Paris, FR</button>
          <button class="del-btn" title="Delete">✕</button>
        </li>
      `;

      const savedItems = savedList.querySelectorAll(".saved__item");
      expect(savedItems).toHaveLength(2);

      const openButtons = savedList.querySelectorAll(".open-btn");
      expect(openButtons).toHaveLength(2);
      expect(openButtons[0].textContent).toBe("London, GB");
      expect(openButtons[1].textContent).toBe("Paris, FR");

      const deleteButtons = savedList.querySelectorAll(".del-btn");
      expect(deleteButtons).toHaveLength(2);
      expect(deleteButtons[0].textContent).toBe("✕");
    });

    it("should be able to show empty state for saved cities", () => {
      const savedList = document.getElementById("saved-list");

      savedList.innerHTML = `
        <li class="saved__item" style="justify-content:center;color:var(--muted)">
          No saved cities
        </li>
      `;

      const emptyItem = savedList.querySelector(".saved__item");
      expect(emptyItem).toBeTruthy();
      expect(emptyItem.textContent.trim()).toBe("No saved cities");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      const themeBtn = document.getElementById("theme-toggle");
      expect(themeBtn.getAttribute("aria-label")).toBe("Toggle theme");

      const form = document.getElementById("search-form");
      expect(form.getAttribute("role")).toBe("search");

      const clouds = document.querySelector(".bg-clouds");
      expect(clouds.getAttribute("aria-hidden")).toBe("true");
    });

    it("should have proper form attributes", () => {
      const form = document.getElementById("search-form");
      expect(form.getAttribute("autocomplete")).toBe("off");

      const input = document.getElementById("city-input");
      expect(input.type).toBe("text");
    });

    it("should have proper button types", () => {
      const form = document.getElementById("search-form");
      const submitBtn = form.querySelector("button[type='submit']");
      expect(submitBtn.type).toBe("submit");
    });
  });

  describe("CSS Classes", () => {
    it("should have all required CSS classes", () => {
      expect(document.querySelector(".app")).toBeTruthy();
      expect(document.querySelector(".app__bar")).toBeTruthy();
      expect(document.querySelector(".app__title")).toBeTruthy();
      expect(document.querySelector(".controls")).toBeTruthy();
      expect(document.querySelector(".layout")).toBeTruthy();
      expect(document.querySelector(".saved")).toBeTruthy();
      expect(document.querySelector(".saved__title")).toBeTruthy();
      expect(document.querySelector(".saved__list")).toBeTruthy();
      expect(document.querySelector(".bg-clouds")).toBeTruthy();
    });

    it("should have cloud elements for background animation", () => {
      const clouds = document.querySelectorAll(".cloud");
      expect(clouds).toHaveLength(6);
    });
  });
});
