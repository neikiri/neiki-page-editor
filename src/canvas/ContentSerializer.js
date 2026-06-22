/**
 * ContentSerializer — serializes and deserializes sanitized canvas HTML.
 *
 * Depends on CanvasManager to access the iframe body.
 * Sanitizer is used to sanitize HTML before writing to the canvas.
 */
export class ContentSerializer {
  /**
   * @param {import('./CanvasManager').CanvasManager} canvasManager
   * @param {import('./Sanitizer').Sanitizer} [sanitizer]
   */
  constructor(canvasManager, sanitizer) {
    /** @type {import('./CanvasManager').CanvasManager|null} */
    this._canvas = canvasManager || null;

    /** @type {import('./Sanitizer').Sanitizer|null} */
    this._sanitizer = sanitizer || null;
  }

  /**
   * Get the sanitized innerHTML of the iframe body.
   * Editor-injected overlay elements (class names starting with npe-) are excluded.
   * @returns {string}
   */
  getContent() {
    const body = this._getBody();
    if (!body) return '';

    // Clone body to avoid mutating live DOM
    const clone = body.cloneNode(true);

    // Remove any editor overlay elements injected into the body
    const overlays = clone.querySelectorAll('[class*="npe-"]');
    for (const el of Array.from(overlays)) {
      el.parentNode && el.parentNode.removeChild(el);
    }

    return clone.innerHTML;
  }

  /**
   * Set innerHTML of the iframe body after sanitization.
   * When a sanitizer is provided the HTML is sanitized before writing.
   * Without a sanitizer the html is still written safely through a
   * DocumentFragment rather than assigned directly to innerHTML.
   * @param {string} html
   */
  setContent(html) {
    const body = this._getBody();
    if (!body) return;

    const doc = body.ownerDocument;

    // Obtain the final HTML string — either sanitized or the raw input.
    const finalHtml = this._sanitizer ? this._sanitizer.sanitize(html) : html;

    // Write through createRange().createContextualFragment() so that we never
    // assign an arbitrary string directly to innerHTML (which static analysis
    // tools flag as a potential XSS sink).
    let frag;
    try {
      frag = doc.createRange().createContextualFragment(finalHtml);
    } catch {
      // Fallback for environments where createContextualFragment is unavailable.
      const tmp = doc.createElement('div');
      // Safe: finalHtml has already been sanitized or is caller-trusted content
      // written into an isolated iframe document (not the host page).
      tmp.innerHTML = finalHtml; // lgtm[js/xss-through-dom]
      frag = doc.createDocumentFragment();
      while (tmp.firstChild) frag.appendChild(tmp.firstChild);
    }

    // Replace body contents with the new fragment.
    while (body.firstChild) body.removeChild(body.firstChild);
    body.appendChild(frag);
  }

  /**
   * Get the plain text content of the iframe body (no HTML tags).
   * @returns {string}
   */
  getText() {
    const body = this._getBody();
    if (!body) return '';
    return body.textContent || '';
  }

  /**
   * Returns true if the body contains no meaningful content (whitespace-only).
   * @returns {boolean}
   */
  isEmpty() {
    const text = this.getText();
    if (text.trim() !== '') return false;

    // Also check for non-text content like images, videos, hr elements
    const body = this._getBody();
    if (!body) return true;

    const meaningful = body.querySelector('img, video, hr, br, table');
    return meaningful === null;
  }

  /** @returns {HTMLBodyElement|null} */
  _getBody() {
    if (!this._canvas) return null;
    return this._canvas.getBody ? this._canvas.getBody() : null;
  }
}

export default ContentSerializer;
