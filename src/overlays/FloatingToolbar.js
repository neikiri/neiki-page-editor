/**
 * FloatingToolbar — floating selection toolbar that appears above a text
 * selection after a short delay.
 *
 * Contains:
 *  - Inline formatting shortcuts: bold, italic, underline, link
 *  - Block actions: move block up, move block down
 *
 * Hides on:
 *  - Selection collapse (no text selected)
 *  - Click outside the toolbar
 *  - Escape key
 *
 * Coordinate system:
 *   Toolbar is rendered in the host document, positioned using the selection
 *   range getBoundingClientRect() translated via the iframe offset.
 */

const SHOW_DELAY_MS = 400;

export class FloatingToolbar {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.hostEl
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   * @param {import('../core/EventBus').EventBus} [opts.bus]
   * @param {import('../i18n/i18n').I18nInstance} [opts.i18n]
   */
  constructor(opts = {}) {
    this._hostEl = opts.hostEl || document.body;
    this._canvas = opts.canvasManager || null;
    this._bus    = opts.bus || null;
    this._i18n   = opts.i18n || { t: k => k };

    /** @type {HTMLElement|null} */
    this._el = null;

    /** @type {ReturnType<typeof setTimeout>|null} */
    this._showTimer = null;

    /** @type {boolean} */
    this._visible = false;

    /** @type {boolean} */
    this._destroyed = false;

    /** @type {Function|null} */
    this._onSelectionChange = null;
    /** @type {Function|null} */
    this._onMouseDown = null;
    /** @type {Function|null} */
    this._onDocClick = null;
    /** @type {Function|null} */
    this._onKeyDown = null;

    this._buildEl();
    this._attachIframeListeners();
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  /**
   * Attach or re-attach to a canvas manager.
   * @param {import('../canvas/CanvasManager').CanvasManager} canvasManager
   */
  attachCanvas(canvasManager) {
    this._detachIframeListeners();
    this._canvas = canvasManager;
    this._attachIframeListeners();
  }

  /**
   * Show the toolbar at the top of the given selection rect.
   * @param {DOMRect} selectionRect — in host document coordinates
   */
  show(selectionRect) {
    if (!this._el || this._destroyed) return;
    this._visible = true;
    this._el.style.display = 'flex';
    this._positionAboveRect(selectionRect);
  }

  /**
   * Hide the toolbar.
   */
  hide() {
    this._cancelShowTimer();
    if (!this._el) return;
    this._visible = false;
    this._el.style.display = 'none';
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    this._cancelShowTimer();
    this._detachIframeListeners();

    if (this._onDocClick) {
      document.removeEventListener('click', this._onDocClick, { capture: true });
      this._onDocClick = null;
    }
    if (this._onKeyDown) {
      document.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }

    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
  }

  // ─── Build DOM ───────────────────────────────────────────────────────────────

  _buildEl() {
    const t = (k) => this._i18n.t(k);

    const el = document.createElement('div');
    el.className = 'npe-floating-toolbar';
    el.setAttribute('role', 'toolbar');
    el.setAttribute('aria-label', t('floatingToolbar.label'));
    el.style.display = 'none';

    const buttons = [
      { id: 'moveUp',    icon: '<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>', title: t('floatingToolbar.moveBlockUp'),   action: () => this._moveBlockUp() },
      { id: 'moveDown',  icon: '<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>',  title: t('floatingToolbar.moveBlockDown'), action: () => this._moveBlockDown() },
      { separator: true },
      { id: 'bold',      icon: '<svg viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>', title: t('toolbar.bold'),      action: () => this._execCommand('bold') },
      { id: 'italic',    icon: '<svg viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>', title: t('toolbar.italic'),    action: () => this._execCommand('italic') },
      { id: 'underline', icon: '<svg viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>', title: t('toolbar.underline'), action: () => this._execCommand('underline') },
      { id: 'link',      icon: '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>', title: t('floatingToolbar.link'), action: () => this._insertLink() },
    ];

    for (const item of buttons) {
      if (item.separator) {
        const sep = document.createElement('span');
        sep.className = 'npe-floating-toolbar-sep';
        el.appendChild(sep);
        continue;
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'npe-floating-toolbar-btn';
      btn.title = item.title;
      btn.setAttribute('aria-label', item.title);
      btn.innerHTML = item.icon;
      btn.addEventListener('mousedown', (e) => {
        // Prevent mousedown from collapsing the selection
        e.preventDefault();
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        item.action();
      });
      el.appendChild(btn);
    }

    this._hostEl.appendChild(el);
    this._el = el;

    // Hide on click outside
    this._onDocClick = (e) => {
      if (this._el && this._el.contains(e.target)) return;
      this.hide();
    };
    document.addEventListener('click', this._onDocClick, { capture: true });

    // Hide on Escape
    this._onKeyDown = (e) => {
      if (e.key === 'Escape') this.hide();
    };
    document.addEventListener('keydown', this._onKeyDown);
  }

  // ─── Position ────────────────────────────────────────────────────────────────

  /**
   * Position the toolbar above the given rect.
   * @param {DOMRect} rect
   */
  _positionAboveRect(rect) {
    if (!this._el) return;
    // Temporarily show to measure
    this._el.style.visibility = 'hidden';
    this._el.style.display    = 'flex';
    const tbRect = this._el.getBoundingClientRect();
    this._el.style.visibility = '';

    const gap = 6;
    let top  = rect.top - tbRect.height - gap;
    let left = rect.left + (rect.width / 2) - (tbRect.width / 2);

    // Keep inside viewport
    if (top < 4) top = rect.bottom + gap;
    if (left < 4) left = 4;
    if (left + tbRect.width > window.innerWidth - 4) {
      left = window.innerWidth - tbRect.width - 4;
    }

    this._el.style.left = left + 'px';
    this._el.style.top  = top  + 'px';
  }

  // ─── Iframe listeners ─────────────────────────────────────────────────────────

  _attachIframeListeners() {
    const doc = this._getIframeDoc();
    if (!doc) return;

    this._onSelectionChange = () => this._handleSelectionChange();
    this._onMouseDown       = () => { this._cancelShowTimer(); this.hide(); };

    try {
      doc.addEventListener('selectionchange', this._onSelectionChange);
      doc.addEventListener('mousedown',       this._onMouseDown);
    } catch { /* guard */ }
  }

  _detachIframeListeners() {
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      if (this._onSelectionChange) doc.removeEventListener('selectionchange', this._onSelectionChange);
      if (this._onMouseDown)       doc.removeEventListener('mousedown',       this._onMouseDown);
    } catch { /* guard */ }
    this._onSelectionChange = null;
    this._onMouseDown       = null;
  }

  // ─── Selection handling ───────────────────────────────────────────────────────

  _handleSelectionChange() {
    this._cancelShowTimer();

    const sel = this._getIframeSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      this.hide();
      return;
    }

    // Delay appearance to avoid flickering during selection drag
    this._showTimer = setTimeout(() => {
      this._showTimer = null;
      const selNow = this._getIframeSelection();
      if (!selNow || selNow.isCollapsed) { this.hide(); return; }

      const rect = this._getSelectionHostRect(selNow);
      if (rect) this.show(rect);
    }, SHOW_DELAY_MS);
  }

  /**
   * Translate the iframe selection range bounding rect to host coordinates.
   * @param {Selection} sel
   * @returns {DOMRect|null}
   */
  _getSelectionHostRect(sel) {
    try {
      const range = sel.getRangeAt(0);
      const iframeSelRect = range.getBoundingClientRect();
      const iframeRect    = this._getIframeRect();
      if (!iframeRect) return null;
      const doc = this._getIframeDoc();
      const scrollTop  = doc ? (doc.documentElement.scrollTop  || doc.body.scrollTop  || 0) : 0;
      const scrollLeft = doc ? (doc.documentElement.scrollLeft || doc.body.scrollLeft || 0) : 0;

      return new DOMRect(
        iframeRect.left + iframeSelRect.left - scrollLeft,
        iframeRect.top  + iframeSelRect.top  - scrollTop,
        iframeSelRect.width,
        iframeSelRect.height,
      );
    } catch {
      return null;
    }
  }

  _cancelShowTimer() {
    if (this._showTimer !== null) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }
  }

  // ─── Commands ────────────────────────────────────────────────────────────────

  /**
   * Execute a document.execCommand on the iframe.
   * @param {string} cmd
   */
  _execCommand(cmd) {
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      doc.execCommand(cmd, false, null);
    } catch { /* guard */ }
    this._notifyChange();
  }

  _insertLink() {
    // Emit event so the host can open the link modal
    if (this._bus) {
      this._bus.emit('toolbar:insert', 'link');
    }
    this.hide();
  }

  /**
   * Move the block containing the current selection one position up.
   */
  _moveBlockUp() {
    const block = this._getAnchorBlock();
    if (!block) return;
    const prev = block.previousElementSibling;
    if (!prev) return;
    try {
      block.parentNode.insertBefore(block, prev);
    } catch { /* guard */ }
    this._notifyChange();
    this.hide();
  }

  /**
   * Move the block containing the current selection one position down.
   */
  _moveBlockDown() {
    const block = this._getAnchorBlock();
    if (!block) return;
    const next = block.nextElementSibling;
    if (!next) return;
    try {
      block.parentNode.insertBefore(next, block);
    } catch { /* guard */ }
    this._notifyChange();
    this.hide();
  }

  /**
   * Find the top-level block element inside the iframe body that contains the
   * current selection anchor.
   * @returns {Element|null}
   */
  _getAnchorBlock() {
    const doc  = this._getIframeDoc();
    const body = this._canvas ? this._canvas.getBody() : null;
    if (!doc || !body) return null;

    const sel = this._getIframeSelection();
    if (!sel || sel.rangeCount === 0) return null;

    let node = sel.anchorNode;
    if (!node) return null;

    // Walk up to find a direct child of body
    while (node && node.parentNode !== body) {
      node = node.parentNode;
    }
    return (node && node !== body) ? node : null;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  _notifyChange() {
    if (!this._bus) return;
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      this._bus.emit('content:change', { html: body.innerHTML });
    }
  }

  /** @returns {Selection|null} */
  _getIframeSelection() {
    const doc = this._getIframeDoc();
    if (!doc) return null;
    try {
      return doc.getSelection ? doc.getSelection() : null;
    } catch {
      return null;
    }
  }

  /** @returns {DOMRect|null} */
  _getIframeRect() {
    if (!this._canvas || !this._canvas.iframe) return null;
    try {
      return this._canvas.iframe.getBoundingClientRect();
    } catch {
      return null;
    }
  }

  /** @returns {Document|null} */
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch {
      return null;
    }
  }
}

export default FloatingToolbar;
