/**
 * BlockDragDrop — two responsibilities:
 *
 * 1. Block reordering — drag top-level blocks within the iframe body to reorder them.
 *    Uses HTML5 drag API inside the same-origin iframe.
 *
 * 2. File drop — handle image/video files dragged from the OS onto the canvas.
 *    File drag events are attached to the <iframe> element in the HOST document
 *    because external (OS) file drags cross through the host document first.
 *    The drop itself is also handled on the iframe element so we get reliable
 *    coordinates for cursor placement.
 */

export class BlockDragDrop {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.hostEl
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   * @param {import('../core/EventBus').EventBus} [opts.bus]
   * @param {import('../core/Options').EditorOptions} [opts.options]
   */
  constructor(opts = {}) {
    this._hostEl = opts.hostEl || document.body;
    this._canvas = opts.canvasManager || null;
    this._bus    = opts.bus || null;
    this._opts   = opts.options || {};

    // ── Block drag state ──────────────────────────────────────────────────────
    /** @type {Element|null} */
    this._dragSrc    = null;
    /** @type {HTMLElement|null} */
    this._ghost      = null;
    /** @type {HTMLElement|null} */
    this._placeholder = null;
    /** @type {Element|null} */
    this._dropTarget  = null;
    /** @type {boolean} */
    this._dropBefore  = true;

    // ── File drag state (on iframe element in host document) ──────────────────
    /** @type {number} — dragenter counter to handle child-element flickering */
    this._fileDragCount = 0;

    // ── Listener references ───────────────────────────────────────────────────
    // Iframe-document listeners (block drag)
    this._onIframeDragStart = null;
    this._onIframeDragOver  = null;
    this._onIframeDragEnd   = null;

    // Host-document listeners on the <iframe> element (file drag)
    this._onIframeElDragEnter = null;
    this._onIframeElDragOver  = null;
    this._onIframeElDragLeave = null;
    this._onIframeElDrop      = null;

    /** @type {boolean} */
    this._destroyed = false;

    this._attachListeners();
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  attachCanvas(canvasManager) {
    this._detachListeners();
    this._canvas = canvasManager;
    this._attachListeners();
  }

  attachOptions(options) {
    this._opts = options || {};
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._cleanupBlockDrag();
    this._detachListeners();
    this._removeDraggableFromBlocks();
  }

  // ─── Attach / detach ─────────────────────────────────────────────────────────

  _attachListeners() {
    const iframeEl = this._canvas ? this._canvas.iframe : null;
    const doc      = this._getIframeDoc();

    // ── Block-drag listeners on iframe document ───────────────────────────────
    if (doc) {
      this._onIframeDragStart = (e) => this._handleBlockDragStart(e);
      this._onIframeDragOver  = (e) => this._handleBlockDragOver(e);
      this._onIframeDragEnd   = (e) => this._handleBlockDragEnd(e);

      try {
        doc.addEventListener('dragstart', this._onIframeDragStart);
        doc.addEventListener('dragover',  this._onIframeDragOver);
        doc.addEventListener('dragend',   this._onIframeDragEnd);
      } catch { /* guard */ }

      this._addDraggableToBlocks();
    }

    // ── File-drag listeners on the <iframe> element (host document) ───────────
    if (iframeEl && typeof iframeEl.addEventListener === 'function') {
      this._onIframeElDragEnter = (e) => this._handleFileDragEnter(e);
      this._onIframeElDragOver  = (e) => this._handleFileDragOver(e);
      this._onIframeElDragLeave = (e) => this._handleFileDragLeave(e);
      this._onIframeElDrop      = (e) => this._handleFileDrop(e);

      iframeEl.addEventListener('dragenter', this._onIframeElDragEnter);
      iframeEl.addEventListener('dragover',  this._onIframeElDragOver);
      iframeEl.addEventListener('dragleave', this._onIframeElDragLeave);
      iframeEl.addEventListener('drop',      this._onIframeElDrop);
    }
  }

  _detachListeners() {
    const iframeEl = this._canvas ? this._canvas.iframe : null;
    const doc      = this._getIframeDoc();

    if (doc) {
      try {
        if (this._onIframeDragStart) doc.removeEventListener('dragstart', this._onIframeDragStart);
        if (this._onIframeDragOver)  doc.removeEventListener('dragover',  this._onIframeDragOver);
        if (this._onIframeDragEnd)   doc.removeEventListener('dragend',   this._onIframeDragEnd);
      } catch { /* guard */ }
      this._onIframeDragStart = null;
      this._onIframeDragOver  = null;
      this._onIframeDragEnd   = null;
    }

    if (iframeEl && typeof iframeEl.removeEventListener === 'function') {
      iframeEl.removeEventListener('dragenter', this._onIframeElDragEnter);
      iframeEl.removeEventListener('dragover',  this._onIframeElDragOver);
      iframeEl.removeEventListener('dragleave', this._onIframeElDragLeave);
      iframeEl.removeEventListener('drop',      this._onIframeElDrop);
      this._onIframeElDragEnter = null;
      this._onIframeElDragOver  = null;
      this._onIframeElDragLeave = null;
      this._onIframeElDrop      = null;
    }
  }

  // ─── Draggable attribute management ──────────────────────────────────────────

  _addDraggableToBlocks() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (!body) return;
    try {
      for (const child of Array.from(body.children)) {
        child.setAttribute('draggable', 'true');
      }
    } catch { /* guard */ }
  }

  _removeDraggableFromBlocks() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (!body) return;
    try {
      for (const child of Array.from(body.children)) {
        child.removeAttribute('draggable');
      }
    } catch { /* guard */ }
  }

  // ─── Block drag handlers (inside iframe document) ─────────────────────────────

  _handleBlockDragStart(e) {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (!body) return;

    const block = this._getDirectBodyChild(e.target, body);
    if (!block) return;

    this._dragSrc = block;

    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    } catch { /* guard */ }

    this._createGhost(block);

    // Transparent drag image so our ghost is the only visual
    try {
      const transparent = document.createElement('div');
      transparent.style.cssText = 'position:fixed;top:-9999px';
      document.body.appendChild(transparent);
      e.dataTransfer.setDragImage(transparent, 0, 0);
      setTimeout(() => { if (transparent.parentNode) transparent.parentNode.removeChild(transparent); }, 0);
    } catch { /* guard */ }

    try { block.style.opacity = '0.4'; } catch { /* guard */ }
  }

  _handleBlockDragOver(e) {
    // Only handle block reordering here — file drags are handled on the iframe element
    if (!this._dragSrc) {
      // Allow other drag types (e.g. file) to pass through without blocking
      return;
    }

    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';

    const body = this._canvas ? this._canvas.getBody() : null;
    if (!body) return;

    const block = this._getDirectBodyChild(e.target, body);
    if (!block || block === this._dragSrc) {
      this._hidePlaceholder();
      this._dropTarget = null;
      return;
    }

    let insertBefore = true;
    try {
      const rect = block.getBoundingClientRect();
      insertBefore = (e.clientY - rect.top) < (rect.height / 2);
    } catch { /* guard */ }

    if (block !== this._dropTarget || insertBefore !== this._dropBefore) {
      this._dropTarget = block;
      this._dropBefore = insertBefore;
      this._showPlaceholder(block, insertBefore);
    }

    this._moveGhost(e);
  }

  _handleBlockDragEnd(e) {
    // If a block drag was in progress, perform the drop at the last known target
    if (this._dragSrc && this._dropTarget) {
      const parent = this._dropTarget.parentNode;
      if (parent) {
        try {
          if (this._dropBefore) {
            parent.insertBefore(this._dragSrc, this._dropTarget);
          } else {
            const ref = this._dropTarget.nextSibling;
            ref ? parent.insertBefore(this._dragSrc, ref) : parent.appendChild(this._dragSrc);
          }
        } catch { /* guard */ }
        this._notifyChange();
      }
    }
    this._cleanupBlockDrag();
  }

  // ─── File drag handlers (on <iframe> element in host document) ────────────────
  //
  // By attaching to the iframe ELEMENT (not the iframe document), we reliably
  // receive drag events for files coming from the OS or host page, which always
  // cross the host document boundary before entering the iframe content.

  _handleFileDragEnter(e) {
    if (!this._hasFiles(e)) return;
    e.preventDefault();
    this._fileDragCount++;
    this._showFileDragStyle();
  }

  _handleFileDragOver(e) {
    if (!this._hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  _handleFileDragLeave(e) {
    if (!this._hasFiles(e)) return;
    // relatedTarget null means leaving the iframe element entirely
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
    this._fileDragCount = 0;
    this._hideFileDragStyle();
  }

  _handleFileDrop(e) {
    e.preventDefault();
    this._fileDragCount = 0;
    this._hideFileDragStyle();

    const files = e.dataTransfer ? Array.from(e.dataTransfer.files) : [];
    if (files.length === 0) return;

    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const videoFiles = files.filter(f => f.type.startsWith('video/'));
    if (imageFiles.length === 0 && videoFiles.length === 0) return;

    // Translate host-document drop coordinates to iframe-document coordinates
    const iframeEl  = this._canvas ? this._canvas.iframe : null;
    const iframeDoc = this._getIframeDoc();
    if (!iframeEl || !iframeDoc) return;

    const iframeRect = iframeEl.getBoundingClientRect();
    const iframeScrollTop  = iframeDoc.documentElement.scrollTop  || iframeDoc.body.scrollTop  || 0;
    const iframeScrollLeft = iframeDoc.documentElement.scrollLeft || iframeDoc.body.scrollLeft || 0;

    // Coordinates inside the iframe document (used for cursor placement logic)
    // dropX / dropY are computed for future use; cursor placement uses viewport coords below
    void (e.clientX - iframeRect.left + iframeScrollLeft);  // dropX
    void (e.clientY - iframeRect.top  + iframeScrollTop);   // dropY

    const setCursorAtDrop = () => {
      if (!iframeDoc) return;
      try {
        let range = null;
        if (iframeDoc.caretRangeFromPoint) {
          // Chrome/Safari/Edge — takes viewport coordinates (not scrolled)
          const vpX = e.clientX - iframeRect.left;
          const vpY = e.clientY - iframeRect.top;
          range = iframeDoc.caretRangeFromPoint(vpX, vpY);
        } else if (iframeDoc.caretPositionFromPoint) {
          // Firefox
          const vpX = e.clientX - iframeRect.left;
          const vpY = e.clientY - iframeRect.top;
          const pos = iframeDoc.caretPositionFromPoint(vpX, vpY);
          if (pos) {
            range = iframeDoc.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.collapse(true);
          }
        }
        if (range) {
          const sel = iframeDoc.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      } catch { /* guard */ }
    };

    const _esc = (s) => String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const insertHtml = (html) => {
      setCursorAtDrop();
      // Insert via execCommand on the iframe document so it respects cursor position
      try {
        iframeDoc.execCommand('insertHTML', false, html);
      } catch {
        // Fallback: emit bus event for Editor to handle
        if (this._bus) this._bus.emit('canvas:insert', { html });
        return;
      }
      this._notifyChange();
    };

    const processFile = async (file, type) => {
      const isImage = type === 'image';
      const handler = isImage
        ? (this._opts && this._opts.imageUploadHandler)
        : (this._opts && this._opts.videoUploadHandler);

      if (typeof handler === 'function') {
        try {
          const url = await handler(file);
          if (url) {
            const html = isImage
              ? `<img src="${_esc(url)}" alt="${_esc(file.name)}">`
              : `<video src="${_esc(url)}" controls style="max-width:100%"></video>`;
            insertHtml(html);
          }
        } catch { /* guard */ }
        return;
      }

      // No handler: read as base64
      await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const src = /** @type {string} */ (ev.target.result);
          const html = isImage
            ? `<img src="${_esc(src)}" alt="${_esc(file.name)}">`
            : `<video src="${_esc(src)}" controls style="max-width:100%"></video>`;
          insertHtml(html);
          resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsDataURL(file);
      });
    };

    (async () => {
      for (const file of imageFiles) {
        await processFile(file, 'image');
      }
      for (const file of videoFiles) {
        await processFile(file, 'video');
      }
    })();
  }

  // ─── File drag visual feedback ────────────────────────────────────────────────

  _hasFiles(e) {
    if (!e.dataTransfer) return false;
    // types is a DOMStringList or array; .includes works on arrays, .contains on DOMStringList
    const types = e.dataTransfer.types;
    if (!types) return false;
    return typeof types.includes === 'function'
      ? types.includes('Files')
      : typeof types.contains === 'function' && types.contains('Files');
  }

  _showFileDragStyle() {
    const iframeEl = this._canvas ? this._canvas.iframe : null;
    if (iframeEl) iframeEl.style.outline = '3px dashed #0057cc';
  }

  _hideFileDragStyle() {
    const iframeEl = this._canvas ? this._canvas.iframe : null;
    if (iframeEl) iframeEl.style.outline = '';
  }

  // ─── Ghost preview ────────────────────────────────────────────────────────────

  _createGhost(block) {
    const iframeRect = this._getIframeRect();
    if (!iframeRect) return;

    let blockRect;
    try { blockRect = block.getBoundingClientRect(); } catch { return; }

    const ghost = document.createElement('div');
    ghost.className = 'npe-block-drag-ghost';
    ghost.style.cssText = [
      'position:fixed',
      `left:${iframeRect.left + blockRect.left}px`,
      `top:${iframeRect.top + blockRect.top}px`,
      `width:${blockRect.width}px`,
      `height:${blockRect.height}px`,
      'pointer-events:none',
      'z-index:20000',
      'background:rgba(0,87,204,0.08)',
      'border:2px dashed #0057cc',
      'border-radius:3px',
    ].join(';');

    document.body.appendChild(ghost);
    this._ghost = ghost;
  }

  _moveGhost(e) {
    if (!this._ghost) return;
    this._ghost.style.left = (e.clientX + 12) + 'px';
    this._ghost.style.top  = (e.clientY + 12) + 'px';
  }

  _removeGhost() {
    if (this._ghost && this._ghost.parentNode) {
      this._ghost.parentNode.removeChild(this._ghost);
    }
    this._ghost = null;
  }

  // ─── Drop placeholder ─────────────────────────────────────────────────────────

  _showPlaceholder(refBlock, insertBefore) {
    const doc = this._getIframeDoc();
    if (!doc) return;

    this._removePlaceholder();

    const ph = doc.createElement('div');
    ph.style.cssText = [
      'height:3px',
      'margin:2px 0',
      'background:#0057cc',
      'border-radius:2px',
      'pointer-events:none',
      'opacity:0.85',
    ].join(';');

    try {
      if (insertBefore) {
        refBlock.parentNode.insertBefore(ph, refBlock);
      } else {
        const ref = refBlock.nextSibling;
        ref ? refBlock.parentNode.insertBefore(ph, ref) : refBlock.parentNode.appendChild(ph);
      }
    } catch { /* guard */ }

    this._placeholder = ph;
  }

  _hidePlaceholder() { this._removePlaceholder(); }

  _removePlaceholder() {
    if (this._placeholder && this._placeholder.parentNode) {
      this._placeholder.parentNode.removeChild(this._placeholder);
    }
    this._placeholder = null;
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────────

  _cleanupBlockDrag() {
    if (this._dragSrc) {
      try { this._dragSrc.style.opacity = ''; } catch { /* guard */ }
    }
    this._removeGhost();
    this._removePlaceholder();
    this._dragSrc    = null;
    this._dropTarget = null;
    this._dropBefore = true;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  _getDirectBodyChild(node, body) {
    if (!node) return null;
    let el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el.parentNode !== body) {
      el = el.parentElement;
    }
    return (el && el !== body) ? el : null;
  }

  _notifyChange() {
    if (!this._bus) return;
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) this._bus.emit('content:change', { html: body.innerHTML });
  }

  _getIframeRect() {
    if (!this._canvas || !this._canvas.iframe) return null;
    try { return this._canvas.iframe.getBoundingClientRect(); } catch { return null; }
  }

  _getIframeDoc() {
    if (!this._canvas) return null;
    try { return this._canvas.getDocument ? this._canvas.getDocument() : null; } catch { return null; }
  }
}

export default BlockDragDrop;
