/**
 * ImageResize — image and video selection overlay with:
 *  - 8 resize handles (corners + edges)
 *  - Aspect-ratio lock on by default; Shift toggles free resize
 *  - Live size label during drag
 *  - Contextual mini-toolbar: drag handle, replace, delete
 *
 * Coordinate system:
 *   All handles and overlays are rendered in the host document, positioned
 *   using the coordinate translation formula:
 *     hostTop  = iframeRect.top  + elementRect.top  - iframeScrollTop
 *     hostLeft = iframeRect.left + elementRect.left - iframeScrollLeft
 */

/** @type {string[]} — handle positions, clockwise from top-left */
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

const MIN_SIZE = 20; // px

export class ImageResize {
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

    /** @type {HTMLElement|null} — currently selected image/video element in the iframe */
    this._selectedEl = null;

    /** @type {HTMLElement|null} — the selection border overlay */
    this._border = null;

    /** @type {HTMLElement[]} — the 8 resize handle elements */
    this._handles = [];

    /** @type {HTMLElement|null} — the live size label */
    this._sizeLabel = null;

    /** @type {HTMLElement|null} — the mini-toolbar */
    this._toolbar = null;

    /** @type {boolean} */
    this._dragging = false;

    /** @type {string} — which handle is being dragged ('nw', 'n', …) */
    this._dragHandle = '';

    /** @type {number} */
    this._dragStartX = 0;
    /** @type {number} */
    this._dragStartY = 0;
    /** @type {number} */
    this._startW = 0;
    /** @type {number} */
    this._startH = 0;
    /** @type {number} */
    this._startLeft = 0;
    /** @type {number} */
    this._startTop = 0;
    /** @type {number} */
    this._aspectRatio = 1;

    /** @type {HTMLElement|null} — transparent drag cover during resize */
    this._dragCover = null;

    /** @type {Function|null} */
    this._onMouseMove = null;
    /** @type {Function|null} */
    this._onMouseUp = null;

    /** @type {Function|null} */
    this._onIframeClick = null;
    /** @type {Function|null} */
    this._onIframeScroll = null;
    /** @type {Function|null} */
    this._onDocClick = null;
    /** @type {Function|null} */
    this._onWindowResize = null;

    /** @type {boolean} */
    this._destroyed = false;

    this._createOverlayElements();
    this._attachIframeListeners();

    this._onWindowResize = () => this._updatePosition();
    window.addEventListener('resize', this._onWindowResize);
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
   * Programmatically select an image/video element.
   * @param {HTMLElement} el
   */
  select(el) {
    this._selectElement(el);
  }

  /**
   * Deselect and hide all overlays.
   */
  deselect() {
    this._deselectElement();
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    // Clean up any in-progress resize
    if (this._dragCover && this._dragCover.parentNode) {
      this._dragCover.parentNode.removeChild(this._dragCover);
      this._dragCover = null;
    }
    if (this._onMouseMove) {
      document.removeEventListener('mousemove', this._onMouseMove);
      this._onMouseMove = null;
    }
    if (this._onMouseUp) {
      document.removeEventListener('mouseup', this._onMouseUp);
      this._onMouseUp = null;
    }

    this._deselectElement();
    this._detachIframeListeners();

    if (this._onWindowResize) {
      window.removeEventListener('resize', this._onWindowResize);
      this._onWindowResize = null;
    }

    this._removeAllOverlayElements();
  }

  // ─── Overlay DOM creation ─────────────────────────────────────────────────────

  _createOverlayElements() {
    // Selection border
    const border = document.createElement('div');
    border.className = 'npe-img-select-border';
    border.style.display = 'none';
    this._hostEl.appendChild(border);
    this._border = border;

    // 8 resize handles
    for (const pos of HANDLES) {
      const handle = document.createElement('div');
      handle.className = `npe-img-resize-handle npe-img-handle-${pos}`;
      handle.setAttribute('data-pos', pos);
      handle.style.display = 'none';
      this._hostEl.appendChild(handle);
      this._handles.push(handle);

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._startResize(e, pos);
      });
    }

    // Size label
    const label = document.createElement('div');
    label.className = 'npe-img-size-label';
    label.style.display = 'none';
    this._hostEl.appendChild(label);
    this._sizeLabel = label;

    // Mini-toolbar
    const tb = document.createElement('div');
    tb.className = 'npe-img-toolbar';
    tb.style.display = 'none';
    tb.setAttribute('aria-label', this._i18n.t('overlay.media.toolbar'));

    const dragBtn = document.createElement('div');
    dragBtn.className = 'npe-img-toolbar-btn npe-img-drag-handle';
    dragBtn.title = this._i18n.t('overlay.media.drag');
    dragBtn.setAttribute('aria-label', this._i18n.t('overlay.media.drag'));
    dragBtn.innerHTML = '⠿';
    dragBtn.addEventListener('mousedown', (e) => this._startDragMove(e));

    const replaceBtn = document.createElement('button');
    replaceBtn.type = 'button';
    replaceBtn.className = 'npe-img-toolbar-btn';
    replaceBtn.title = this._i18n.t('overlay.media.replace');
    replaceBtn.setAttribute('aria-label', this._i18n.t('overlay.media.replace'));
    replaceBtn.innerHTML = '↺';
    replaceBtn.addEventListener('click', () => this._replaceMedia());

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'npe-img-toolbar-btn npe-img-delete-btn';
    deleteBtn.title = this._i18n.t('overlay.media.delete');
    deleteBtn.setAttribute('aria-label', this._i18n.t('overlay.media.delete'));
    deleteBtn.innerHTML = '✕';
    deleteBtn.addEventListener('click', () => this._deleteMedia());

    tb.appendChild(dragBtn);
    tb.appendChild(replaceBtn);
    tb.appendChild(deleteBtn);
    this._hostEl.appendChild(tb);
    this._toolbar = tb;
  }

  _removeAllOverlayElements() {
    const toRemove = [this._border, this._sizeLabel, this._toolbar, ...this._handles];
    for (const el of toRemove) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }
    this._border = null;
    this._sizeLabel = null;
    this._toolbar = null;
    this._handles = [];
  }

  // ─── Iframe event listeners ───────────────────────────────────────────────────

  _attachIframeListeners() {
    const doc = this._getIframeDoc();
    if (!doc) return;

    this._onIframeClick = (e) => {
      const target = e.target;
      if (!target) return;
      if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
        e.preventDefault();
        this._selectElement(target);
      } else {
        this._deselectElement();
      }
    };

    this._onIframeScroll = () => this._updatePosition();

    try {
      doc.addEventListener('click', this._onIframeClick);
      doc.addEventListener('scroll', this._onIframeScroll, { capture: true });
    } catch { /* guard */ }

    // Also listen to host scroll
    this._onDocScroll = () => this._updatePosition();
    document.addEventListener('scroll', this._onDocScroll, { capture: true, passive: true });
  }

  _detachIframeListeners() {
    const doc = this._getIframeDoc();
    if (doc) {
      try {
        if (this._onIframeClick)  doc.removeEventListener('click', this._onIframeClick);
        if (this._onIframeScroll) doc.removeEventListener('scroll', this._onIframeScroll, { capture: true });
      } catch { /* guard */ }
    }
    if (this._onDocScroll) {
      document.removeEventListener('scroll', this._onDocScroll, { capture: true });
    }
    this._onIframeClick  = null;
    this._onIframeScroll = null;
    this._onDocScroll    = null;
  }

  // ─── Element selection ────────────────────────────────────────────────────────

  /**
   * @param {HTMLElement} el — img or video in the iframe
   */
  _selectElement(el) {
    this._selectedEl = el;
    this._showOverlays();
    this._updatePosition();

    // Listen for clicks outside on the host document to deselect
    if (!this._onDocClick) {
      this._onDocClick = (e) => {
        // If the click target is inside our overlay elements, ignore
        const allOverlay = [this._border, this._toolbar, ...this._handles];
        if (allOverlay.some(o => o && o.contains(e.target))) return;
        this._deselectElement();
      };
      // Deferred to avoid triggering on the same click that selected
      setTimeout(() => {
        document.addEventListener('click', this._onDocClick, { capture: true });
      }, 0);
    }
  }

  _deselectElement() {
    this._selectedEl = null;
    this._hideOverlays();

    if (this._onDocClick) {
      document.removeEventListener('click', this._onDocClick, { capture: true });
      this._onDocClick = null;
    }
  }

  // ─── Show / hide overlays ────────────────────────────────────────────────────

  _showOverlays() {
    if (this._border)  this._border.style.display  = 'block';
    if (this._toolbar) this._toolbar.style.display = 'flex';
    for (const h of this._handles) h.style.display = 'block';
  }

  _hideOverlays() {
    if (this._border)    this._border.style.display    = 'none';
    if (this._toolbar)   this._toolbar.style.display   = 'none';
    if (this._sizeLabel) this._sizeLabel.style.display = 'none';
    for (const h of this._handles) h.style.display = 'none';
  }

  // ─── Position update (translates iframe element rect → host coords) ──────────

  _updatePosition() {
    if (!this._selectedEl || !this._border) return;

    const iframeRect = this._getIframeRect();
    if (!iframeRect) return;

    const doc = this._getIframeDoc();
    const scrollTop  = doc ? (doc.documentElement.scrollTop  || doc.body.scrollTop  || 0) : 0;
    const scrollLeft = doc ? (doc.documentElement.scrollLeft || doc.body.scrollLeft || 0) : 0;

    let elRect;
    try {
      elRect = this._selectedEl.getBoundingClientRect();
    } catch {
      return;
    }

    const top    = iframeRect.top  + elRect.top  - scrollTop;
    const left   = iframeRect.left + elRect.left - scrollLeft;
    const width  = elRect.width;
    const height = elRect.height;

    // Position the selection border
    _positionEl(this._border, left, top, width, height);

    // Position the 8 handles
    this._positionHandles(left, top, width, height);

    // Position the mini-toolbar above the element
    if (this._toolbar) {
      const tbRect = this._toolbar.getBoundingClientRect();
      const tbLeft = left + (width / 2) - (tbRect.width / 2);
      this._toolbar.style.left = Math.max(4, tbLeft) + 'px';
      this._toolbar.style.top  = (top - tbRect.height - 6) + 'px';
    }
  }

  /**
   * Place the 8 handles at corners and edge midpoints.
   */
  _positionHandles(left, top, width, height) {
    const hSize = 8; // handle size in px (must match CSS)
    const half  = hSize / 2;

    const positions = {
      nw: { x: left - half,              y: top - half               },
      n:  { x: left + width / 2 - half,  y: top - half               },
      ne: { x: left + width - half,      y: top - half               },
      e:  { x: left + width - half,      y: top + height / 2 - half  },
      se: { x: left + width - half,      y: top + height - half      },
      s:  { x: left + width / 2 - half,  y: top + height - half      },
      sw: { x: left - half,              y: top + height - half      },
      w:  { x: left - half,              y: top + height / 2 - half  },
    };

    for (const h of this._handles) {
      const pos = h.getAttribute('data-pos');
      const p = positions[pos];
      if (!p) continue;
      h.style.left = p.x + 'px';
      h.style.top  = p.y + 'px';
    }
  }

  // ─── Resize drag ─────────────────────────────────────────────────────────────

  /**
   * @param {MouseEvent} e
   * @param {string} handlePos
   */
  _startResize(e, handlePos) {
    if (!this._selectedEl) return;

    const el = this._selectedEl;
    this._dragging    = true;
    this._dragHandle  = handlePos;
    this._dragStartX  = e.clientX;
    this._dragStartY  = e.clientY;
    this._startW      = el.offsetWidth  || el.naturalWidth  || 100;
    this._startH      = el.offsetHeight || el.naturalHeight || 100;
    this._aspectRatio = this._startH > 0 ? this._startW / this._startH : 1;

    this._showSizeLabel(this._startW, this._startH);

    // Cover the entire viewport with a transparent overlay so the cursor
    // never enters the iframe during drag (which would steal mousemove events).
    this._dragCover = document.createElement('div');
    this._dragCover.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:99999',
      'cursor:' + _handleCursor(handlePos),
    ].join(';');
    document.body.appendChild(this._dragCover);

    this._onMouseMove = (ev) => this._doResize(ev);
    this._onMouseUp   = (ev) => this._endResize(ev);
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup',   this._onMouseUp);
  }

  /**
   * @param {MouseEvent} e
   */
  _doResize(e) {
    if (!this._dragging || !this._selectedEl) return;

    const dx = e.clientX - this._dragStartX;
    const dy = e.clientY - this._dragStartY;
    const pos = this._dragHandle;

    let newW = this._startW;
    let newH = this._startH;

    // Determine new dimensions based on which handle is dragged
    if (pos.includes('e'))  newW = this._startW + dx;
    if (pos.includes('w'))  newW = this._startW - dx;
    if (pos.includes('s'))  newH = this._startH + dy;
    if (pos.includes('n'))  newH = this._startH - dy;

    newW = Math.max(MIN_SIZE, newW);
    newH = Math.max(MIN_SIZE, newH);

    // Aspect-ratio lock (default on; Shift disables)
    const lockAspect = !e.shiftKey;
    if (lockAspect && this._aspectRatio > 0) {
      if (pos === 'n' || pos === 's') {
        newW = newH * this._aspectRatio;
      } else if (pos === 'e' || pos === 'w') {
        newH = newW / this._aspectRatio;
      } else {
        // Corner: pick the dominant axis
        if (Math.abs(dx) >= Math.abs(dy)) {
          newH = newW / this._aspectRatio;
        } else {
          newW = newH * this._aspectRatio;
        }
      }
    }

    newW = Math.round(Math.max(MIN_SIZE, newW));
    newH = Math.round(Math.max(MIN_SIZE, newH));

    // Apply to the iframe element's style
    try {
      this._selectedEl.style.width  = newW + 'px';
      this._selectedEl.style.height = newH + 'px';
    } catch { /* guard */ }

    this._updatePosition();
    this._showSizeLabel(newW, newH);
  }

  /**
   * @param {MouseEvent} e
   */
  _endResize(e) {
    this._dragging = false;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup',   this._onMouseUp);
    this._onMouseMove = null;
    this._onMouseUp   = null;

    // Remove the drag cover
    if (this._dragCover) {
      if (this._dragCover.parentNode) this._dragCover.parentNode.removeChild(this._dragCover);
      this._dragCover = null;
    }

    if (this._sizeLabel) this._sizeLabel.style.display = 'none';

    this._updatePosition();
    this._notifyChange();
  }

  // ─── Drag-move (translate element to new position) ───────────────────────────

  /**
   * @param {MouseEvent} e — mousedown on the drag handle
   */
  _startDragMove(e) {
    if (!this._selectedEl) return;
    e.preventDefault();
    e.stopPropagation();

    const el = this._selectedEl;
    const startX    = e.clientX;
    const startY    = e.clientY;
    const startLeft = parseInt(el.style.marginLeft || '0', 10);
    const startTop  = parseInt(el.style.marginTop  || '0', 10);

    // Cover viewport to intercept all mouse events during drag
    const cover = document.createElement('div');
    cover.style.cssText = 'position:fixed;inset:0;z-index:99999;cursor:grab;';
    document.body.appendChild(cover);

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      try {
        el.style.marginLeft = (startLeft + dx) + 'px';
        el.style.marginTop  = (startTop  + dy) + 'px';
      } catch { /* guard */ }
      this._updatePosition();
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      if (cover.parentNode) cover.parentNode.removeChild(cover);
      this._notifyChange();
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  }

  // ─── Mini-toolbar actions ─────────────────────────────────────────────────────

  _replaceMedia() {
    if (!this._selectedEl || !this._bus) return;
    const tag = this._selectedEl.tagName.toLowerCase();
    // Emit an event so the host can open the appropriate modal
    this._bus.emit('overlay:replaceMedia', { element: this._selectedEl, type: tag });
  }

  _deleteMedia() {
    if (!this._selectedEl) return;
    const el = this._selectedEl;
    this._deselectElement();
    try {
      if (el.parentNode) el.parentNode.removeChild(el);
    } catch { /* guard */ }
    this._notifyChange();
  }

  // ─── Size label ──────────────────────────────────────────────────────────────

  /**
   * @param {number} w
   * @param {number} h
   */
  _showSizeLabel(w, h) {
    if (!this._sizeLabel || !this._border) return;
    this._sizeLabel.textContent = `${w} × ${h}`;
    this._sizeLabel.style.display = 'block';

    // Position below the selection border
    const borderRect = this._border.getBoundingClientRect();
    this._sizeLabel.style.left = borderRect.left + 'px';
    this._sizeLabel.style.top  = (borderRect.bottom + 4) + 'px';
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  _notifyChange() {
    if (!this._bus) return;
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      this._bus.emit('content:change', { html: body.innerHTML });
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Set position and size on a fixed-position overlay element.
 */
function _positionEl(el, left, top, width, height) {
  el.style.position = 'fixed';
  el.style.left     = left   + 'px';
  el.style.top      = top    + 'px';
  el.style.width    = width  + 'px';
  el.style.height   = height + 'px';
}

/**
 * Return the appropriate CSS cursor for a resize handle position.
 * @param {string} pos
 * @returns {string}
 */
function _handleCursor(pos) {
  const map = {
    nw: 'nw-resize', n: 'n-resize',  ne: 'ne-resize',
    e:  'e-resize',  se: 'se-resize', s: 's-resize',
    sw: 'sw-resize', w: 'w-resize',
  };
  return map[pos] || 'default';
}

export default ImageResize;
