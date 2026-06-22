/**
 * neiki-page-editor.js — public entry point.
 *
 * Exposes NeikiPageEditor class.
 * CDN build sets window.NeikiPageEditor via build.js footer.
 *
 * Usage:
 *   const editor = new NeikiPageEditor('#my-editor', { language: 'cs' });
 */

import { Editor } from './core/Editor.js';
import { normalizeOptions, VALID_THEMES } from './core/Options.js';
import { addTranslation } from './i18n/i18n.js';

// The embedded CSS string is injected by the esbuild embedCssPlugin.
// The plugin rewrites this import to:  export const EDITOR_CSS = "<css string>";
// so that all build formats receive the string. Consumers who load the ESM build
// can ignore the auto-inject and load dist/neiki-page-editor.css manually.
import { EDITOR_CSS } from './neiki-page-editor.css';

/** @type {import('./core/Options').Plugin[]} */
const _plugins = [];

/** @type {boolean} */
let _cssInjected = false;

/**
 * Inject editor CSS into the host document's <head> once.
 * Only runs in the CDN / CJS builds where EDITOR_CSS is a non-empty string.
 */
function _injectCss() {
  if (_cssInjected || typeof document === 'undefined') return;
  if (!EDITOR_CSS) return;
  _cssInjected = true;
  const style = document.createElement('style');
  style.id = 'npe-editor-css';
  style.textContent = EDITOR_CSS;
  document.head.appendChild(style);
}

/**
 * Resolve target element from a CSS selector string or Element reference.
 * @param {string|Element} target
 * @returns {Element}
 */
function _resolveTarget(target) {
  if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (!el) throw new Error(`NeikiPageEditor: target element not found for selector "${target}"`);
    return el;
  }
  if (target instanceof Element) return target;
  throw new Error('NeikiPageEditor: target must be a CSS selector string or an Element');
}

/**
 * NeikiPageEditor — the public class.
 *
 * @example
 *   // CDN
 *   const editor = new NeikiPageEditor('#editor');
 *
 *   // ESM
 *   import NeikiPageEditor from 'neiki-page-editor';
 *   const editor = new NeikiPageEditor('#editor', { theme: 'dark', language: 'cs' });
 */
class NeikiPageEditor {
  /**
   * @param {string|Element} selector — CSS selector or Element
   * @param {Partial<import('./core/Options').EditorOptions>} [options]
   */
  constructor(selector, options = {}) {
    _injectCss();

    const target = _resolveTarget(selector);
    const opts = normalizeOptions(options);

    /** @type {Editor} */
    this._editor = new Editor(target, opts);

    // Apply registered plugins
    for (const plugin of _plugins) {
      try {
        plugin.init(this);
      } catch (e) {
        // Plugin init errors must not prevent the editor from starting
      }
    }

    // Wire onReady: fires once the async load completes (via editor:ready bus event)
    if (typeof opts.onReady === 'function') {
      const publicEditor = this;
      const off = this._editor.getBus().on('editor:ready', () => {
        off(); // one-shot
        if (typeof opts.onReady === 'function') {
          opts.onReady(publicEditor);
        }
      });
    }
  }

  // ─── Delegating public API ───────────────────────────────────────────────────

  /** @returns {string} Sanitized HTML of current canvas content */
  getContent() { return this._editor.getContent(); }

  /** @param {string} html */
  setContent(html) { this._editor.setContent(html); }

  /** @returns {import('./core/Options').PagePayload} */
  getPage() { return this._editor.getPage(); }

  /** @param {import('./core/Options').PagePayload} payload */
  setPage(payload) { this._editor.setPage(payload); }

  /** @returns {string} Current page CSS string */
  getStyles() { return this._editor.getStyles(); }

  /** @param {string} css */
  setStyles(css) { this._editor.setStyles(css); }

  /** @returns {string} Plain text of canvas content */
  getText() { return this._editor.getText(); }

  /** @returns {boolean} */
  isEmpty() { return this._editor.isEmpty(); }

  focus() { this._editor.focus(); }
  blur() { this._editor.blur(); }
  enable() { this._editor.enable(); }
  disable() { this._editor.disable(); }

  /** @returns {Promise<void>} */
  triggerSave() { return this._editor.triggerSave(); }

  toggleFullscreen() { this._editor.toggleFullscreen(); }

  /** @param {string} name */
  setTheme(name) { this._editor.setTheme(name); }

  toggleTheme() { this._editor.toggleTheme(); }

  /** @returns {string} */
  getTheme() { return this._editor.getTheme(); }

  /**
   * Destroy this editor instance.
   * Removes all DOM, listeners, and iframe references. Idempotent.
   */
  destroy() {
    // Notify plugins
    for (const plugin of _plugins) {
      if (typeof plugin.destroy === 'function') {
        try { plugin.destroy(); } catch (e) {}
      }
    }
    this._editor.destroy();
  }

  // ─── Static API ─────────────────────────────────────────────────────────────

  /**
   * Register a plugin for all future and existing editor instances.
   * @param {{ id: string, init(editor: NeikiPageEditor): void, destroy?(): void }} plugin
   */
  static registerPlugin(plugin) {
    if (!plugin || typeof plugin.id !== 'string' || typeof plugin.init !== 'function') {
      throw new Error('NeikiPageEditor.registerPlugin: plugin must have an id string and init function');
    }
    if (_plugins.find(p => p.id === plugin.id)) return; // no duplicate IDs
    _plugins.push(plugin);
  }

  /**
   * Get all registered plugins.
   * @returns {Array<{ id: string }>}
   */
  static getPlugins() {
    return _plugins.slice();
  }

  /**
   * Add or extend a language translation map.
   * @param {string} lang — language code, e.g. 'de'
   * @param {Record<string, string>} keys — translation key/value pairs
   */
  static addTranslation(lang, keys) {
    addTranslation(lang, keys);
  }
}

export default NeikiPageEditor;
export { NeikiPageEditor };
