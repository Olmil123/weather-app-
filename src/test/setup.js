import { vi, afterEach } from "vitest";

global.fetch = vi.fn();

class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(k) {
    return this.store[k] ?? null;
  }
  setItem(k, v) {
    this.store[k] = String(v);
  }
  removeItem(k) {
    delete this.store[k];
  }
  clear() {
    this.store = {};
  }
}
global.localStorage = new LocalStorageMock();

afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  if (typeof document !== "undefined") {
    if (document.body) document.body.innerHTML = "";
    if (document.head) document.head.innerHTML = "";
  }
});
