// src/utils/theme.js
export const THEME_KEYS = ["light", "dark", "bokhyun", "baduk"];

export function applyTheme(theme) {
  try {
    // 'light' 또는 'default' 선택 시 data-theme 제거 → :root(기본 라이트) 적용
    if (theme === "light" || theme === "default") {
      document.documentElement.removeAttribute("data-theme");
      return;
    }
    const key = THEME_KEYS.includes(theme) ? theme : "light";
    document.documentElement.setAttribute("data-theme", key);
  } catch (e) {
    console.warn("applyTheme skipped:", e?.message);
  }
}

/** 로컬에서 테마 읽기(없으면 'light') */
export function loadTheme() {
  try {
    const stored = localStorage.getItem("lastTheme");
    if (!stored) return "light";
    // 예전 값 'default' 저장된 경우 호환
    return THEME_KEYS.includes(stored) ? stored : "light";
  } catch {
    return "light";
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem("lastTheme", theme);
  } catch {}
}

/** 초기 테마 결정: localStorage → 기본값(light) */
export function initTheme() {
  const theme = loadTheme();
  applyTheme(theme);
  return theme;
}
