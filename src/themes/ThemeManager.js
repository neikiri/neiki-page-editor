/**
 * ThemeManager — applies theme classes to the editor shell and handles persistence.
 * Stub for Task 1. Full implementation in Task 9.
 */
import { VALID_THEMES } from '../core/Options.js';

const THEME_CLASS_MAP = {
  'light': null,
  'dark': 'npe-dark',
  'blue': 'npe-theme-blue',
  'dark-blue': 'npe-theme-dark-blue',
  'midnight': 'npe-theme-midnight',
  'void': 'npe-theme-void',
  'autumn': 'npe-theme-autumn',
  'dracula': 'npe-theme-dracula',
};

const STORAGE_KEY = 'npe-theme';

export class ThemeManager {
  /**
   * @param {HTMLElement} shell — the .npe-editor element
   * @param {string} initialTheme
   * @param {boolean} persist — whether to persist across page loads
   */
  constructor(shell, initialTheme = 'light', persist = false) {
    this._shell = shell;
    this._persist = persist;
    this._current = VALID_THEMES.includes(initialTheme) ? initialTheme : 'light';

    if (this._persist) {
      const stored = this._readStorage();
      if (stored) this._current = stored;
    }

    this._apply(this._current);
  }

  /**
   * @param {string} name
   */
  setTheme(name) {
    if (!VALID_THEMES.includes(name)) return;
    this._current = name;
    this._apply(name);
    if (this._persist) this._writeStorage(name);
  }

  toggleTheme() {
    const idx = VALID_THEMES.indexOf(this._current);
    const next = VALID_THEMES[(idx + 1) % VALID_THEMES.length];
    this.setTheme(next);
  }

  getTheme() {
    return this._current;
  }

  destroy() {
    // Remove any applied theme class
    for (const cls of Object.values(THEME_CLASS_MAP)) {
      if (cls) this._shell.classList.remove(cls);
    }
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  _apply(theme) {
    // Remove all theme classes first
    for (const cls of Object.values(THEME_CLASS_MAP)) {
      if (cls) this._shell.classList.remove(cls);
    }
    const cls = THEME_CLASS_MAP[theme];
    if (cls) this._shell.classList.add(cls);
  }

  _readStorage() {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  }

  _writeStorage(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }
}

export default ThemeManager;
