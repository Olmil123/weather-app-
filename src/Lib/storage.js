const KEY = "savedCities";

export function getSavedCities() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return arr.map((x) => (typeof x === "string" ? { id: null, label: x } : x));
  } catch {
    return [];
  }
}

export function saveCityObject(obj) {
  const all = getSavedCities();
  const exists = all.some(
    (c) =>
      (obj.id != null && c.id === obj.id) ||
      (obj.id == null &&
        c.label.trim().toLowerCase() === (obj.label || "").trim().toLowerCase())
  );
  if (!exists) {
    all.push({ id: obj.id ?? null, label: (obj.label || "").trim() });
    localStorage.setItem(KEY, JSON.stringify(all));
  }
}

export function removeCity(labelOrId) {
  const all = getSavedCities().filter(
    (c) => !(c.id === labelOrId || c.label === labelOrId)
  );
  localStorage.setItem(KEY, JSON.stringify(all));
}
