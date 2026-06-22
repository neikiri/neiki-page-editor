/**
 * ToolbarState — reads the iframe selection and updates toolbar button active/disabled states.
 *
 * Uses document.queryCommandState() for supported commands while the iframe has focus.
 * Saves the last known state so it persists when focus temporarily leaves (e.g. toolbar click).
 * Falls back to DOM inspection for heading, blockquote, alignment.
 */

/** Map from toolbar ID to execCommand state command name */
const COMMAND_STATE_MAP = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strikethrough: 'strikeThrough',
  superscript: 'superscript',
  subscript: 'subscript',
  bulletList: 'insertUnorderedList',
  numberedList: 'insertOrderedList',
  blockquote: null, // DOM inspection only
};

/** Map from toolbar ID to alignment state command */
const ALIGNMENT_STATE_MAP = {
  alignLeft:    'justifyLeft',
  alignCenter:  'justifyCenter',
  alignRight:   'justifyRight',
  alignJustify: 'justifyFull',
};

export class ToolbarState {
  /**
   * @param {import('./ToolbarBuilder').ToolbarBuilder} toolbarBuilder
   * @param {import('../canvas/CanvasManager').CanvasManager|null} canvasManager
   * @param {import('../core/EventBus').EventBus} bus
   */
  constructor(toolbarBuilder, canvasManager, bus) {
    this._toolbar = toolbarBuilder;
    this._canvas = canvasManager;
    this._bus = bus;

    /** @type {boolean} */
    this._destroyed = false;

    this._bindEvents();
  }

  _bindEvents() {
    this._offSelectionChange = this._bus.on('selection:change', () => this.update());
    this._offContentChange   = this._bus.on('content:change',   () => this.update());
    // Re-run update when the iframe body re-gains focus after a toolbar click
    this._offCanvasFocus     = this._bus.on('canvas:focus',     () => this.update());
    // Also update after commands execute (iframe will be re-focused by then)
    this._offCommand         = this._bus.on('toolbar:command',  () => setTimeout(() => this.update(), 20));
  }

  /**
   * Read the current iframe selection and update all toolbar control states.
   * queryCommandState works correctly when the iframe has focus; we also
   * fall back to DOM inspection so values stay correct after focus moves away.
   */
  update() {
    if (this._destroyed || !this._toolbar) return;

    const doc = this._getIframeDocument();

    // ── Toggle buttons via queryCommandState ──────────────────────────────────
    for (const [id, cmd] of Object.entries(COMMAND_STATE_MAP)) {
      if (!cmd) continue;
      const control = this._toolbar.getControl(id);
      if (!control?.instance) continue;

      let active = false;
      try {
        if (doc) active = doc.queryCommandState(cmd);
      } catch { /* guard — queryCommandState may throw */ }

      if (typeof control.instance.setActive === 'function') {
        control.instance.setActive(active);
      }
    }

    // ── Blockquote — DOM inspection ───────────────────────────────────────────
    this._updateBlockquoteState(doc);

    // ── Heading select ────────────────────────────────────────────────────────
    this._updateHeadingState(doc);

    // ── Alignment ────────────────────────────────────────────────────────────
    this._updateAlignmentState(doc);

    // ── Undo / Redo enabled state ─────────────────────────────────────────────
    this._updateUndoRedoState(doc);

    this._bus.emit('toolbar:stateUpdated');
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  _getIframeDocument() {
    if (!this._canvas) return null;
    try {
      const iframe = this._canvas.getIframe ? this._canvas.getIframe() : null;
      if (!iframe) return null;
      return iframe.contentDocument || null;
    } catch {
      return null;
    }
  }

  /**
   * Return the element that is the common ancestor of the current selection,
   * walking up past text nodes.
   * @param {Document|null} doc
   * @returns {Element|null}
   */
  _getAncestorElement(doc) {
    if (!doc) return null;
    try {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) return null;
      let node = sel.getRangeAt(0).commonAncestorContainer;
      while (node && node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
      }
      return /** @type {Element|null} */ (node);
    } catch {
      return null;
    }
  }

  _updateBlockquoteState(doc) {
    const control = this._toolbar.getControl('blockquote');
    if (!control?.instance) return;

    const el = this._getAncestorElement(doc);
    const active = el ? !!el.closest('blockquote') : false;

    if (typeof control.instance.setActive === 'function') {
      control.instance.setActive(active);
    }
  }

  _updateHeadingState(doc) {
    const control = this._toolbar.getControl('heading');
    if (!control?.instance) return;

    let value = 'p';
    const el = this._getAncestorElement(doc);
    if (el) {
      const block = el.closest('h1,h2,h3,h4,h5,h6,p,div');
      if (block) {
        const tag = block.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) value = tag;
      }
    }

    if (typeof control.instance.setValue === 'function') {
      control.instance.setValue(value);
    }
  }

  _updateAlignmentState(doc) {
    for (const [id, cmd] of Object.entries(ALIGNMENT_STATE_MAP)) {
      const control = this._toolbar.getControl(id);
      if (!control?.instance) continue;

      let active = false;
      try {
        if (doc) active = doc.queryCommandState(cmd);
      } catch {
        // DOM inspection fallback
        const el = this._getAncestorElement(doc);
        if (el) {
          const block = el.closest('p,h1,h2,h3,h4,h5,h6,div,li,td,th');
          if (block) {
            const alignVal = { alignLeft: 'left', alignCenter: 'center', alignRight: 'right', alignJustify: 'justify' };
            const align = block.style.textAlign || block.getAttribute('align') || '';
            active = align.toLowerCase() === (alignVal[id] || '');
          }
        }
      }

      if (typeof control.instance.setActive === 'function') {
        control.instance.setActive(active);
      }
    }
  }

  _updateUndoRedoState(doc) {
    for (const id of ['undo', 'redo']) {
      const control = this._toolbar.getControl(id);
      if (!control?.instance) continue;

      let enabled = false;
      try {
        if (doc) enabled = doc.queryCommandEnabled(id === 'undo' ? 'undo' : 'redo');
      } catch { /* guard */ }

      if (typeof control.instance.setDisabled === 'function') {
        control.instance.setDisabled(!enabled);
      }
    }
  }

  destroy() {
    this._destroyed = true;
    if (this._offSelectionChange) this._offSelectionChange();
    if (this._offContentChange)   this._offContentChange();
    if (this._offCanvasFocus)     this._offCanvasFocus();
    if (this._offCommand)         this._offCommand();
  }
}

export default ToolbarState;
