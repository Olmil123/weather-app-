export const localeMap = { en: "en", ua: "uk", cs: "cs", cz: "cs", ru: "ru" };

export function resolveInitialLang() {
  const saved = localStorage.getItem("lang");
  if (saved) return saved;
  const nav = navigator.language || navigator.userLanguage || "en";
  if (nav.startsWith("uk")) return "ua";
  if (nav.startsWith("cs")) return "cs";
  if (nav.startsWith("ru")) return "ru";
  return "en";
}
