/**
 * CanvasManager — creates and controls the sandboxed iframe canvas.
 *
 * Responsibilities:
 *  - Create <iframe sandbox="allow-same-origin"> inside .npe-canvas-wrapper
 *  - Write the full iframe document (head/body template) via contentDocument
 *  - Attach input, selectionchange, focus, blur listeners and wire to EventBus
 *  - Expose iframe, getDocument(), getBody(), destroy()
 */
export class CanvasManager {
  /**
   * @param {HTMLElement} canvasWrapper — the .npe-canvas-wrapper element
   * @param {import('../core/Options').EditorOptions} opts
   * @param {import('../core/EventBus').EventBus} bus
   */
  constructor(canvasWrapper, opts, bus) {
    /** @type {HTMLElement} */
    this._wrapper = canvasWrapper;

    /** @type {import('../core/Options').EditorOptions} */
    this._opts = opts;

    /** @type {import('../core/EventBus').EventBus} */
    this._bus = bus;

    /** @type {HTMLIFrameElement|null} */
    this._iframe = null;

    /** @type {boolean} */
    this._destroyed = false;

    /** @type {Function|null} — reference for removeEventListener */
    this._onInput = null;
    /** @type {Function|null} */
    this._onSelectionChange = null;
    /** @type {Function|null} */
    this._onFocus = null;
    /** @type {Function|null} */
    this._onBlur = null;
    /** @type {Function|null} */
    this._onWrapperClick = null;

    this._create();
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  _create() {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-same-origin');
    iframe.className = 'npe-canvas';
    iframe.setAttribute('title', 'Page editor canvas');
    iframe.setAttribute('aria-label', 'Page editor canvas');
    // Prevent iframe from navigating away
    iframe.setAttribute('referrerpolicy', 'no-referrer');

    this._wrapper.appendChild(iframe);
    this._iframe = iframe;

    // Sync iframe min-height from wrapper so flex child fills the container
    const wrapperMinH = this._wrapper.style.minHeight;
    if (wrapperMinH) {
      iframe.style.minHeight = wrapperMinH;
    }

    this._writeDocument();
    this._attachListeners();
  }

  /**
   * Build and write the initial iframe document using the canonical template.
   */
  _writeDocument() {
    const doc = this._getDoc();
    if (!doc) return;

    const baseHref = this._opts.assetsBaseUrl
      ? `<base href="${_escapeAttr(this._opts.assetsBaseUrl)}">`
      : '';

    const spellcheck = this._opts.spellcheck !== false ? 'true' : 'false';

    const template = `<!DOCTYPE html>
<html style="height:100%">
<head>
  <meta charset="UTF-8">
  ${baseHref}
  <style id="npe-base">
    html { height: 100%; }
    body {
      min-height: 100%;
      margin: 0;
      padding: 16px 20px;
      box-sizing: border-box;
      outline: none;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    body:focus { outline: none; }
    /* Prevent table layout from jumping during editing */
    table {
      border-collapse: collapse;
      table-layout: fixed;
    }
    td, th {
      min-width: 40px;
      vertical-align: top;
    }
  </style>
  <style id="npe-page"></style>
  <style id="npe-helper"></style>
</head>
<body contenteditable="true" spellcheck="${spellcheck}">
</body>
</html>`;

    doc.open();
    doc.write(template);
    doc.close();
  }

  /**
   * Attach event listeners to the iframe document and wire them to the bus.
   */
  _attachListeners() {
    const doc = this._getDoc();
    if (!doc) return;

    this._onInput = () => {
      if (this._destroyed) return;
      const body = this.getBody();
      this._bus.emit('content:change', {
        html: body ? body.innerHTML : '',
      });
    };

    this._onSelectionChange = () => {
      if (this._destroyed) return;
      this._bus.emit('selection:change', {
        selection: doc.getSelection ? doc.getSelection() : null,
      });
    };

    this._onFocus = () => {
      if (this._destroyed) return;
      this._bus.emit('canvas:focus');
    };

    this._onBlur = () => {
      if (this._destroyed) return;
      this._bus.emit('canvas:blur');
    };

    doc.addEventListener('input', this._onInput);
    doc.addEventListener('selectionchange', this._onSelectionChange);

    const body = this.getBody();
    if (body) {
      body.addEventListener('focus', this._onFocus);
      body.addEventListener('blur', this._onBlur);
    }

    // When user clicks anywhere in the iframe wrapper (the host-side element),
    // focus the iframe body — this handles clicks on padding/empty space
    this._onWrapperClick = (e) => {
      if (this._destroyed) return;
      const body = this.getBody();
      if (body && document.activeElement !== this._iframe) {
        this._iframe.focus();
        // Place cursor at end of body if nothing is selected
        try {
          const doc = this._getDoc();
          if (doc) {
            const sel = doc.getSelection();
            if (!sel || sel.rangeCount === 0) {
              const range = doc.createRange();
              range.selectNodeContents(body);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        } catch (err) {
          // guard
        }
      }
    };
    this._wrapper.addEventListener('click', this._onWrapperClick);
  }

  _removeListeners() {
    const doc = this._getDoc();
    if (doc && this._onInput) {
      doc.removeEventListener('input', this._onInput);
      doc.removeEventListener('selectionchange', this._onSelectionChange);
    }
    const body = this.getBody();
    if (body) {
      if (this._onFocus) body.removeEventListener('focus', this._onFocus);
      if (this._onBlur) body.removeEventListener('blur', this._onBlur);
    }
    this._onInput = null;
    this._onSelectionChange = null;
    this._onFocus = null;
    this._onBlur = null;
    if (this._wrapper && this._onWrapperClick) {
      this._wrapper.removeEventListener('click', this._onWrapperClick);
      this._onWrapperClick = null;
    }
  }

  /** @returns {Document|null} */
  _getDoc() {
    try {
      return this._iframe ? this._iframe.contentDocument : null;
    } catch {
      return null;
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** @returns {HTMLIFrameElement|null} */
  get iframe() {
    return this._iframe;
  }

  /** @returns {HTMLIFrameElement|null} */
  getIframe() {
    return this._iframe;
  }

  /** @returns {Document|null} */
  getDocument() {
    return this._getDoc();
  }

  /** @returns {HTMLBodyElement|null} */
  getBody() {
    const doc = this._getDoc();
    return doc ? doc.body : null;
  }

  /**
   * Destroy the canvas: remove listeners and the iframe element.
   * Idempotent.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    this._removeListeners();

    if (this._iframe && this._iframe.parentNode) {
      this._iframe.parentNode.removeChild(this._iframe);
    }
    this._iframe = null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Escape a string for use as an HTML attribute value.
 * @param {string} str
 * @returns {string}
 */
function _escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default CanvasManager;
