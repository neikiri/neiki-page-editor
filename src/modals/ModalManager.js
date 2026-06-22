/**
 * ModalManager — creates and manages editor modals.
 *
 * Responsibilities:
 *  - Open/close modals by ID (link, image, video, table, emoji, specialChars)
 *  - Save and restore the iframe selection across modal open/close
 *  - Route insert results to the canvas via EventBus
 */

import { LinkModal } from './modals/LinkModal.js';
import { ImageModal } from './modals/ImageModal.js';
import { VideoModal } from './modals/VideoModal.js';
import { TableModal } from './modals/TableModal.js';
import { EmojiPicker } from './modals/EmojiPicker.js';
import { SpecialCharsPicker } from './modals/SpecialCharsPicker.js';

export class ModalManager {
  /**
   * @param {object} opts
   * @param {import('../core/Options').EditorOptions} opts.options
   * @param {import('../core/EventBus').EventBus} opts.bus
   * @param {import('../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   */
  constructor(opts = {}) {
    this._opts    = opts.options || {};
    this._bus     = opts.bus || null;
    this._i18n    = opts.i18n || { t: k => k };
    this._hostEl  = opts.hostEl || document.body;
    this._canvas  = opts.canvasManager || null;

    /** @type {string|null} — currently open modal id */
    this._openId = null;

    /** @type {Range|null} — saved selection range */
    this._savedRange = null;

    /** @type {object|null} — currently open modal instance */
    this._current = null;

    /** @type {boolean} */
    this._destroyed = false;

    this._linkModal        = null;
    this._imageModal       = null;
    this._videoModal       = null;
    this._tableModal       = null;
    this._emojiPicker      = null;
    this._specialCharsPicker = null;
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  /**
   * Save the current iframe selection, then open the requested modal.
   * @param {string} modalId — 'link' | 'image' | 'video' | 'table' | 'emoji' | 'specialChars'
   * @param {object} [data] — optional seed data (e.g. existing link href)
   */
  open(modalId, data = {}) {
    if (this._destroyed) return;
    // If another modal is open, close it first
    if (this._openId) this.close();

    this._saveSelection();
    this._openId = modalId;

    const modal = this._getOrCreateModal(modalId);
    if (!modal) {
      this._openId = null;
      return;
    }
    this._current = modal;
    modal.open(data);
  }

  /**
   * Close the currently open modal and restore selection.
   */
  close() {
    if (this._current) {
      this._current.close();
      this._current = null;
    }
    this._openId = null;
    this._restoreSelection();
  }

  /**
   * Attach a canvas manager after construction.
   * @param {import('../canvas/CanvasManager').CanvasManager} canvasManager
   */
  attachCanvas(canvasManager) {
    this._canvas = canvasManager;
  }

  /**
   * Destroy all modals and clean up.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.close();
    // Destroy lazily created modals
    for (const key of ['_linkModal', '_imageModal', '_videoModal', '_tableModal', '_emojiPicker', '_specialCharsPicker']) {
      if (this[key] && typeof this[key].destroy === 'function') {
        this[key].destroy();
      }
      this[key] = null;
    }
  }

  // ─── Selection save / restore ─────────────────────────────────────────────

  _saveSelection() {
    this._savedRange = null;
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      const sel = doc.getSelection();
      if (sel && sel.rangeCount > 0) {
        this._savedRange = sel.getRangeAt(0).cloneRange();
      }
    } catch {
      // guard
    }
  }

  _restoreSelection() {
    if (!this._savedRange) return;
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      const sel = doc.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this._savedRange);
      }
    } catch {
      // guard
    } finally {
      this._savedRange = null;
    }
  }

  // ─── Modal factory ────────────────────────────────────────────────────────

  /**
   * @param {string} id
   * @returns {object|null}
   */
  _getOrCreateModal(id) {
    const commonOpts = {
      i18n:     this._i18n,
      hostEl:   this._hostEl,
      bus:      this._bus,
      onClose:  () => this.close(),
      onInsert: (html) => this._insert(html),
      options:  this._opts,
      canvasManager: this._canvas,
    };

    switch (id) {
      case 'link':
        if (!this._linkModal) {
          this._linkModal = new LinkModal(commonOpts);
        }
        return this._linkModal;

      case 'image':
        if (!this._imageModal) {
          this._imageModal = new ImageModal({
            ...commonOpts,
            imageUploadHandler: this._opts.imageUploadHandler || null,
            allowDataUris:      this._opts.allowDataUris === true,
          });
        }
        return this._imageModal;

      case 'video':
        if (!this._videoModal) {
          this._videoModal = new VideoModal({
            ...commonOpts,
            videoUploadHandler: this._opts.videoUploadHandler || null,
            allowDataUris:      this._opts.allowDataUris === true,
          });
        }
        return this._videoModal;

      case 'table':
        if (!this._tableModal) {
          this._tableModal = new TableModal(commonOpts);
        }
        return this._tableModal;

      case 'emoji':
        if (!this._emojiPicker) {
          this._emojiPicker = new EmojiPicker(commonOpts);
        }
        return this._emojiPicker;

      case 'specialChars':
        if (!this._specialCharsPicker) {
          this._specialCharsPicker = new SpecialCharsPicker(commonOpts);
        }
        return this._specialCharsPicker;

      default:
        return null;
    }
  }

  // ─── Insert into canvas ───────────────────────────────────────────────────

  /**
   * Insert HTML at the saved selection position inside the iframe.
   * @param {string} html
   */
  _insert(html) {
    if (!html) return;
    const doc = this._getIframeDoc();
    if (!doc) {
      // Emit bus event as fallback for external wiring
      if (this._bus) this._bus.emit('modal:insert', { html });
      return;
    }

    // Restore selection first so insertion lands at the right spot
    this._restoreSelection();

    try {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) {
        // Fallback: append to body
        const body = this._canvas ? this._canvas.getBody() : doc.body;
        if (body) body.insertAdjacentHTML('beforeend', html);
        return;
      }

      const range = sel.getRangeAt(0);
      range.deleteContents();

      // Parse HTML into a fragment
      const tmp = doc.createElement('div');
      tmp.innerHTML = html;
      const frag = doc.createDocumentFragment();
      while (tmp.firstChild) frag.appendChild(tmp.firstChild);

      range.insertNode(frag);

      // Move cursor after inserted content
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch {
      // Fallback on error
      if (this._bus) this._bus.emit('modal:insert', { html });
    }

    // Notify content changed
    if (this._bus) {
      const body = this._canvas ? this._canvas.getBody() : null;
      this._bus.emit('content:change', { html: body ? body.innerHTML : '' });
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

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

export default ModalManager;
