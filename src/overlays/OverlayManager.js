/**
 * OverlayManager — manages host-side overlays above the iframe canvas.
 *
 * Owns:
 *  - TableContextMenu — right-click context menu for tables
 *  - TableResize      — drag handles for column resizing
 *  - ImageResize      — image/video selection overlay with resize handles
 *  - FloatingToolbar  — floating text-selection toolbar
 *  - BlockDragDrop    — block drag-and-drop reordering
 *
 * Coordinates overlay positioning when the iframe scrolls, the host scrolls,
 * or the window resizes. Forwards canvas and bus references to all overlays.
 */

import { TableContextMenu } from './TableContextMenu.js';
import { TableResize }      from './TableResize.js';
import { ImageResize }      from './ImageResize.js';
import { FloatingToolbar }  from './FloatingToolbar.js';
import { BlockDragDrop }    from './BlockDragDrop.js';

export class OverlayManager {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.hostEl       — .npe-editor shell element
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   * @param {import('../core/EventBus').EventBus} [opts.bus]
   * @param {import('../i18n/i18n').I18nInstance} [opts.i18n]
   * @param {import('../core/Options').EditorOptions} [opts.options]
   */
  constructor(opts = {}) {
    this._hostEl = opts.hostEl || document.body;
    this._canvas = opts.canvasManager || null;
    this._bus    = opts.bus || null;
    this._i18n   = opts.i18n || { t: k => k };
    this._opts   = opts.options || {};

    /** @type {boolean} */
    this._destroyed = false;

    this._tableContextMenu = new TableContextMenu({
      hostEl: this._hostEl,
      i18n:   this._i18n,
      canvasManager: this._canvas,
      bus:    this._bus,
    });

    this._tableResize = new TableResize({
      hostEl: this._hostEl,
      canvasManager: this._canvas,
      bus:    this._bus,
    });

    this._imageResize = new ImageResize({
      hostEl: this._hostEl,
      canvasManager: this._canvas,
      bus:    this._bus,
      i18n:   this._i18n,
    });

    this._floatingToolbar = new FloatingToolbar({
      hostEl: this._hostEl,
      canvasManager: this._canvas,
      bus:    this._bus,
      i18n:   this._i18n,
    });

    this._blockDragDrop = new BlockDragDrop({
      hostEl: this._hostEl,
      canvasManager: this._canvas,
      bus:    this._bus,
      options: this._opts,
    });

    this._onResize = () => this.update();
    window.addEventListener('resize', this._onResize);
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  /**
   * Attach or re-attach canvas and bus references to all overlays.
   * @param {import('../canvas/CanvasManager').CanvasManager} canvasManager
   */
  attachCanvas(canvasManager) {
    this._canvas = canvasManager;
    this._tableContextMenu.attachCanvas(canvasManager);
    this._tableResize.attachCanvas(canvasManager);
    this._imageResize.attachCanvas(canvasManager);
    this._floatingToolbar.attachCanvas(canvasManager);
    this._blockDragDrop.attachCanvas(canvasManager);
  }

  /**
   * Trigger a repositioning of all persistent overlays.
   * Call after: iframe scroll, host scroll, window resize, content change.
   */
  update() {
    // ImageResize self-updates its position via _updatePosition().
    // We trigger it explicitly so that it stays aligned after scroll/resize.
    if (this._imageResize) {
      this._imageResize._updatePosition();
    }
  }

  /**
   * Expose ImageResize for direct use (e.g. selecting an element programmatically).
   * @returns {ImageResize}
   */
  getImageResize() {
    return this._imageResize;
  }

  /**
   * Expose FloatingToolbar for direct access.
   * @returns {FloatingToolbar}
   */
  getFloatingToolbar() {
    return this._floatingToolbar;
  }

  /**
   * Destroy all overlays.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    this._tableContextMenu.destroy();
    this._tableResize.destroy();
    this._imageResize.destroy();
    this._floatingToolbar.destroy();
    this._blockDragDrop.destroy();

    window.removeEventListener('resize', this._onResize);
  }
}

export default OverlayManager;
