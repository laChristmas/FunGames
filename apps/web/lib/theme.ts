export const THEME_STORAGE_KEY = "fungames-theme";

export const themeInitScript = `(function(){
  try {
    var key = "${THEME_STORAGE_KEY}";
    var pref = localStorage.getItem(key) || "system";
    if (pref !== "light" && pref !== "dark" && pref !== "system") pref = "system";
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = pref === "dark" || (pref === "system" && systemDark);
    var root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
    root.dataset.theme = pref;
  } catch (e) {}
})();`;
