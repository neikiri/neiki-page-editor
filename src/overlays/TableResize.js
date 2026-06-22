/**
 * TableResize — drag-to-resize table columns inside the iframe.
 *
 * A drag handle appears over column borders on hover.
 * Minimum column width: 40 px.
 *
 * Coordinate system:
 *   The handle is a thin div rendered in the host document, positioned above
 *   the iframe using iframeRect + cell border coordinates.
 */

const MIN_COL_WIDTH = 40;

export class TableResize {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.hostEl
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   * @param {import('../core/EventBus').EventBus} [opts.bus]
   */
  constructor(opts = {}) {
    this._hostEl = opts.hostEl || document.body;
    this._canvas = opts.canvasManager || null;
    this._bus    = opts.bus || null;

    /** @type {HTMLElement|null} — the visible drag handle */
    this._handle = null;

    /** @type {boolean} */
    this._dragging = false;

    /** @type {number} */
    this._startX = 0;

    /** @type {number} */
    this._startWidth = 0;

    /** @type {HTMLTableCellElement|null} */
    this._resizeCell = null;

    /** @type {boolean} */
    this._destroyed = false;

    this._onMouseMove = null;
    this._onMouseUp   = null;
    this._iframeMouseMove = null;
    this._iframeMouseLeave = null;

    this._createHandle();
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

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._detachIframeListeners();
    this._removeHandle();
  }

  // ─── Handle DOM ──────────────────────────────────────────────────────────────

  _createHandle() {
    const handle = document.createElement('div');
    handle.className = 'npe-col-resize-handle';
    handle.style.position = 'fixed';
    handle.style.width    = '6px';
    handle.style.cursor   = 'col-resize';
    handle.style.zIndex   = '10001';
    handle.style.display  = 'none';
    handle.style.top      = '0';
    handle.style.height   = '0';
    this._hostEl.appendChild(handle);
    this._handle = handle;

    handle.addEventListener('mousedown', (e) => this._startDrag(e));
  }

  _removeHandle() {
    if (this._handle && this._handle.parentNode) {
      this._handle.parentNode.removeChild(this._handle);
    }
    this._handle = null;
  }

  // ─── Iframe listeners ─────────────────────────────────────────────────────────

  _attachIframeListeners() {
    const doc = this._getIframeDoc();
    if (!doc) return;

    this._iframeMouseMove = (e) => this._onIframeMouseMove(e);
    this._iframeMouseLeave = () => this._hideHandle();

    try {
      doc.addEventListener('mousemove', this._iframeMouseMove);
      doc.addEventListener('mouseleave', this._iframeMouseLeave);
    } catch { /* guard */ }
  }

  _detachIframeListeners() {
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      if (this._iframeMouseMove)  doc.removeEventListener('mousemove', this._iframeMouseMove);
      if (this._iframeMouseLeave) doc.removeEventListener('mouseleave', this._iframeMouseLeave);
    } catch { /* guard */ }
    this._iframeMouseMove  = null;
    this._iframeMouseLeave = null;
  }

  // ─── Mouse move inside iframe: show handle near column borders ───────────────

  /**
   * @param {MouseEvent} e — event from the iframe document
   */
  _onIframeMouseMove(e) {
    if (this._dragging) return;

    const target = e.target;
    if (!target || !target.closest) { this._hideHandle(); return; }

    const cell = target.closest('td, th');
    if (!cell) { this._hideHandle(); return; }

    const iframeRect = this._getIframeRect();
    if (!iframeRect) { this._hideHandle(); return; }

    // Get cell bounding rect in iframe coordinate space
    const cellRect = cell.getBoundingClientRect();

    // Translate to host document coordinates (iframe scrolling not considered;
    // iframe uses allow-same-origin so getBoundingClientRect is in iframe viewport)
    const hostLeft = iframeRect.left + cellRect.left;
    const hostTop  = iframeRect.top  + cellRect.top;
    const hostRight = hostLeft + cellRect.width;
    const hostBottom = hostTop + cellRect.height;

    // Check if mouse is near the right edge of the cell
    const mouseHostX = iframeRect.left + e.clientX;
    const THRESHOLD = 6; // px from right edge to show handle

    if (mouseHostX >= hostRight - THRESHOLD && mouseHostX <= hostRight + THRESHOLD) {
      this._showHandle(hostRight - 3, hostTop, cellRect.height, cell);
    } else {
      this._hideHandle();
    }
  }

  _showHandle(x, y, height, cell) {
    if (!this._handle) return;
    this._handle.style.display = 'block';
    this._handle.style.left    = x + 'px';
    this._handle.style.top     = y + 'px';
    this._handle.style.height  = height + 'px';
    this._resizeCell = cell;
  }

  _hideHandle() {
    if (this._handle) {
      this._handle.style.display = 'none';
    }
    if (!this._dragging) {
      this._resizeCell = null;
    }
  }

  // ─── Drag ─────────────────────────────────────────────────────────────────────

  /**
   * @param {MouseEvent} e
   */
  _startDrag(e) {
    if (!this._resizeCell) return;
    e.preventDefault();

    this._dragging   = true;
    this._startX     = e.clientX;
    this._startWidth = this._resizeCell.offsetWidth;

    this._onMouseMove = (ev) => this._doDrag(ev);
    this._onMouseUp   = (ev) => this._endDrag(ev);

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup',   this._onMouseUp);
  }

  /**
   * @param {MouseEvent} e
   */
  _doDrag(e) {
    if (!this._dragging || !this._resizeCell) return;
    const delta    = e.clientX - this._startX;
    const newWidth = Math.max(MIN_COL_WIDTH, this._startWidth + delta);
    this._resizeCell.style.width = newWidth + 'px';

    // Update handle position
    if (this._handle && this._resizeCell) {
      const iframeRect = this._getIframeRect();
      if (iframeRect) {
        const cellRect = this._resizeCell.getBoundingClientRect();
        const hostRight = iframeRect.left + cellRect.left + cellRect.width;
        this._handle.style.left = hostRight - 3 + 'px';
      }
    }
  }

  /**
   * @param {MouseEvent} e
   */
  _endDrag(e) {
    this._dragging = false;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup',   this._onMouseUp);
    this._onMouseMove = null;
    this._onMouseUp   = null;
    this._notifyChange();
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

export default TableResize;
