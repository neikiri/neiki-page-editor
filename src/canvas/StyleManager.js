/**
 * StyleManager — owns all CSS injected into the iframe.
 *
 * CSS injection order (deterministic, must not be changed):
 *  1. #npe-base  — minimal editing reset
 *  2. Validated <link> stylesheet URLs from cssUrls
 *  3. #npe-page  — page CSS string from load payload or setStyles()
 *  4. Extracted <style> blocks from full-page input
 *  5. #npe-helper — non-invasive editing helpers
 */

/** Minimal base CSS injected into every iframe canvas. */
const BASE_CSS = `
/* npe-base: minimal editing reset — must not override page layout */
[contenteditable]:focus { outline: none; }
`.trim();

/** Helper CSS for editing UX — caret visibility, etc. */
const HELPER_CSS = `
/* npe-helper: non-invasive editing helpers */
`.trim();

export class StyleManager {
  /**
   * @param {import('./CanvasManager').CanvasManager} [canvasManager]
   * @param {import('../core/Options').EditorOptions} [opts]
   */
  constructor(canvasManager, opts) {
    /** @type {import('./CanvasManager').CanvasManager|null} */
    this._canvas = canvasManager || null;

    /** @type {import('../core/Options').EditorOptions} */
    this._opts = opts || {};

    /** @type {Document|null} — set by init() */
    this._doc = null;

    /** @type {boolean} */
    this._initialized = false;

    /** @type {HTMLStyleElement[]} — extracted style block <style> elements */
    this._extractedStyleEls = [];
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  /**
   * Initialize the StyleManager with the iframe document.
   * Injects all style elements in the correct order.
   *
   * @param {Document} iframeDocument
   * @param {import('../core/Options').EditorOptions} [options]
   */
  init(iframeDocument, options) {
    this._doc = iframeDocument;
    if (options) this._opts = options;
    this._initialized = true;

    this._applyBaseStyles();
    this._applyExternalLinks();
    this._applyPageStyles();
    this._applyHelperStyles();
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  /** @returns {HTMLHeadElement|null} */
  _getHead() {
    return this._doc ? this._doc.head : null;
  }

  /** @returns {HTMLStyleElement|null} */
  _getStyleEl(id) {
    return this._doc ? this._doc.getElementById(id) : null;
  }

  /**
   * Inject base CSS into #npe-base.
   */
  _applyBaseStyles() {
    const el = this._getStyleEl('npe-base');
    if (el) {
      el.textContent = BASE_CSS;
    }
  }

  /**
   * Inject validated external stylesheet links.
   * Links are inserted after #npe-base and before #npe-page.
   */
  _applyExternalLinks() {
    const urls = Array.isArray(this._opts.cssUrls) ? this._opts.cssUrls : [];
    this.setExternalLinks(urls);
  }

  /**
   * Inject initial page CSS into #npe-page.
   */
  _applyPageStyles() {
    const css = typeof this._opts.pageStyles === 'string' ? this._opts.pageStyles : '';
    this.setStyles(css);
  }

  /**
   * Inject helper CSS into #npe-helper.
   */
  _applyHelperStyles() {
    const el = this._getStyleEl('npe-helper');
    if (el) {
      el.textContent = HELPER_CSS;
    }
  }

  /**
   * Ensure extracted style block elements appear in the correct position:
   * after #npe-page, before #npe-helper.
   */
  _repositionExtractedStyles() {
    const head = this._getHead();
    const helperEl = this._getStyleEl('npe-helper');
    if (!head || !helperEl) return;

    for (const styleEl of this._extractedStyleEls) {
      // Insert before #npe-helper so order is: page → extracted → helper
      head.insertBefore(styleEl, helperEl);
    }
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Get the current page CSS string (contents of #npe-page).
   * @returns {string}
   */
  getStyles() {
    const el = this._getStyleEl('npe-page');
    return el ? (el.textContent || '') : '';
  }

  /**
   * Update #npe-page with the given CSS string.
   * @param {string} css
   */
  setStyles(css) {
    const el = this._getStyleEl('npe-page');
    if (el) {
      el.textContent = typeof css === 'string' ? css : '';
    }
  }

  /**
   * Insert extracted style blocks (from FullHtmlParser) after #npe-page.
   * Removes any previously injected extracted style blocks first.
   *
   * @param {string[]} blocks — array of CSS text strings
   */
  addExtractedStyleBlocks(blocks) {
    const head = this._getHead();
    if (!head) return;

    // Remove old extracted style elements
    for (const el of this._extractedStyleEls) {
      if (el.parentNode) el.parentNode.removeChild(el);
    }
    this._extractedStyleEls = [];

    if (!Array.isArray(blocks) || blocks.length === 0) return;

    const helperEl = this._getStyleEl('npe-helper');

    for (const block of blocks) {
      if (typeof block !== 'string' || !block.trim()) continue;
      const styleEl = this._doc.createElement('style');
      styleEl.setAttribute('data-npe-extracted', '');
      styleEl.textContent = block;
      this._extractedStyleEls.push(styleEl);

      // Insert before #npe-helper to maintain CSS order
      if (helperEl) {
        head.insertBefore(styleEl, helperEl);
      } else {
        head.appendChild(styleEl);
      }
    }
  }

  /**
   * Inject validated external stylesheet <link> elements.
   * Replaces any previously injected external links.
   * Links are inserted between #npe-base and #npe-page.
   *
   * @param {string[]} urls — array of validated stylesheet URLs
   */
  setExternalLinks(urls) {
    const head = this._getHead();
    if (!head) return;

    // Remove previously injected external links
    const existing = Array.from(head.querySelectorAll('link[data-npe-external]'));
    for (const el of existing) {
      el.parentNode && el.parentNode.removeChild(el);
    }

    if (!Array.isArray(urls) || urls.length === 0) return;

    const validator = typeof this._opts.stylesheetUrlValidator === 'function'
      ? this._opts.stylesheetUrlValidator
      : _defaultStylesheetUrlValidator;

    const pageStyleEl = this._getStyleEl('npe-page');

    for (const url of urls) {
      if (typeof url !== 'string' || !validator(url)) continue;

      const link = this._doc.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', url);
      link.setAttribute('data-npe-external', '');

      // Insert before #npe-page to maintain CSS order
      if (pageStyleEl) {
        head.insertBefore(link, pageStyleEl);
      } else {
        head.appendChild(link);
      }
    }
  }

  /**
   * Destroy: remove all injected style elements.
   * Idempotent.
   */
  destroy() {
    this._doc = null;
    this._extractedStyleEls = [];
    this._initialized = false;
  }
}

// ─── Default validator ────────────────────────────────────────────────────────

/**
 * Default stylesheet URL validator.
 * @param {string} url
 * @returns {boolean}
 */
function _defaultStylesheetUrlValidator(url) {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  if (/^data:/i.test(trimmed)) return false;

  const protocolMatch = trimmed.match(/^([a-z][a-z0-9+\-.]*):\/\//i);
  if (protocolMatch) {
    const protocol = protocolMatch[1].toLowerCase();
    if (protocol !== 'http' && protocol !== 'https') return false;
  }

  // Strip query and hash to check extension
  let path = trimmed;
  const hashIdx = path.indexOf('#');
  if (hashIdx !== -1) path = path.slice(0, hashIdx);
  const queryIdx = path.indexOf('?');
  if (queryIdx !== -1) path = path.slice(0, queryIdx);

  return path.endsWith('.css');
}

export default StyleManager;
