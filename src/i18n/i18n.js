/**
 * i18n — internationalization module for Neiki's Page Editor.
 *
 * Lookup chain: custom translations → active language → English → key
 *
 * Usage:
 *   import { createI18n } from './i18n.js';
 *   const i18n = createI18n('cs', { 'toolbar.bold': 'Tučné' });
 *   i18n.t('toolbar.bold'); // → 'Tučné'
 *
 * Static:
 *   i18n.addTranslation('de', { 'toolbar.bold': 'Fett' });
 */

import { en } from './en.js';
import { cs } from './cs.js';
import { es } from './es.js';
import { zh } from './zh.js';
import { de } from './de.js';
import { fr } from './fr.js';
import { ja } from './ja.js';

/** @type {Map<string, Record<string, string>>} */
const _builtinMaps = new Map([
  ['en', en],
  ['cs', cs],
  ['es', es],
  ['zh', zh],
  ['de', de],
  ['fr', fr],
  ['ja', ja],
]);

/** @type {Map<string, Record<string, string>>} */
const _customMaps = new Map();

/**
 * Register or extend a language map.
 * Does not overwrite built-in keys for built-in languages —
 * use instance-level `translations` option for per-instance overrides.
 *
 * @param {string} lang
 * @param {Record<string, string>} keys
 */
export function addTranslation(lang, keys) {
  if (!lang || typeof lang !== 'string') return;
  const existing = _customMaps.get(lang) || {};
  _customMaps.set(lang, Object.assign({}, existing, keys));
}

/**
 * Get all registered language codes (builtin + custom).
 * @returns {string[]}
 */
export function getAvailableLanguages() {
  return Array.from(new Set([..._builtinMaps.keys(), ..._customMaps.keys()]));
}

/**
 * Create a scoped i18n instance for a single editor.
 *
 * @param {string} language — active language code, e.g. 'en' or 'cs'
 * @param {Record<string, string>} [customTranslations] — per-instance overrides
 * @returns {{ t(key: string, vars?: Record<string, string>): string }}
 */
export function createI18n(language = 'en', customTranslations = {}) {
  /**
   * Translate a key.
   * Supports simple variable interpolation: `i18n.t('error.uploadFailed', { file: 'photo.jpg' })`
   * replaces `{file}` in the string with `photo.jpg`.
   *
   * @param {string} key
   * @param {Record<string, string>} [vars]
   * @returns {string}
   */
  function t(key, vars) {
    let value =
      customTranslations[key] ??                   // 1. per-instance overrides
      _customMaps.get(language)?.[key] ??           // 2. custom registered language
      _builtinMaps.get(language)?.[key] ??          // 3. builtin active language
      _customMaps.get('en')?.[key] ??               // 4. custom English
      _builtinMaps.get('en')?.[key] ??              // 5. builtin English
      key;                                          // 6. fallback: the key itself

    if (vars && typeof value === 'string') {
      value = value.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
    }

    return value;
  }

  return { t };
}

export default createI18n;
