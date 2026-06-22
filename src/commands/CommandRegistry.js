/**
 * CommandRegistry — maps toolbar command IDs to command handlers and executes
 * them against the iframe document.
 *
 * Design notes:
 *  - All execCommand calls go through _exec() which guards against null doc.
 *  - Word-at-cursor auto-expand: if nothing is selected, inline commands
 *    expand the selection to the word under the cursor first.
 *  - Layout containers (divs, sections, etc.) are never replaced — heading
 *    changes operate at the block level without touching ancestors.
 */

/** Inline commands that need word-at-cursor auto-expand when no text is selected. */
const INLINE_COMMANDS = new Set([
  'bold', 'italic', 'underline', 'strikethrough',
  'superscript', 'subscript', 'code', 'foreColor', 'backColor',
]);

/** Map from toolbar command id to execCommand command string. */
const EXEC_MAP = {
  bold:          'bold',
  italic:        'italic',
  underline:     'underline',
  strikethrough: 'strikeThrough',
  superscript:   'superscript',
  subscript:     'subscript',
  removeFormat:  'removeFormat',
  alignLeft:     'justifyLeft',
  alignCenter:   'justifyCenter',
  alignRight:    'justifyRight',
  alignJustify:  'justifyFull',
  indent:        'indent',
  outdent:       'outdent',
  bulletList:    'insertUnorderedList',
  numberedList:  'insertOrderedList',
  horizontalRule:'insertHorizontalRule',
  undo:          'undo',
  redo:          'redo',
};

export class CommandRegistry {
  /**
   * @param {import('../canvas/CanvasManager').CanvasManager|null} canvasManager
   * @param {import('../core/EventBus').EventBus|null} bus
   * @param {import('../canvas/StyleManager').StyleManager|null} [styleManager]
   * @param {import('../canvas/Sanitizer').Sanitizer|null} [sanitizer]
   */
  constructor(canvasManager, bus, styleManager, sanitizer) {
    /** @type {import('../canvas/CanvasManager').CanvasManager|null} */
    this._canvas = canvasManager || null;

    /** @type {import('../core/EventBus').EventBus|null} */
    this._bus = bus || null;

    /** @type {import('../canvas/StyleManager').StyleManager|null} */
    this._styleManager = styleManager || null;

    /** @type {import('../canvas/Sanitizer').Sanitizer|null} */
    this._sanitizer = sanitizer || null;

    /** @type {Map<string, Function>} */
    this._commands = new Map();

    /** @type {boolean} */
    this._destroyed = false;

    this._registerBuiltins();
  }

  // ─── Registration ────────────────────────────────────────────────────────────

  /**
   * Register or override a command handler.
   * @param {string} id
   * @param {Function} handler
   */
  register(id, handler) {
    this._commands.set(id, handler);
  }

  /**
   * Execute a registered command.
   * @param {string} id
   * @param {...unknown} args
   */
  execute(id, ...args) {
    if (this._destroyed) return;
    const handler = this._commands.get(id);
    if (handler) handler(...args);
  }

  // ─── Built-in command registration ───────────────────────────────────────────

  _registerBuiltins() {
    // ── execCommand-based inline/block commands ──────────────────────────────
    for (const [id, cmd] of Object.entries(EXEC_MAP)) {
      this._commands.set(id, () => {
        if (INLINE_COMMANDS.has(id)) this._expandWordAtCursor();
        this._exec(cmd);
      });
    }

    // ── code (inline) ────────────────────────────────────────────────────────
    this._commands.set('code', () => {
      this._expandWordAtCursor();
      this._wrapOrUnwrapInline('code');
    });

    // ── heading ──────────────────────────────────────────────────────────────
    this._commands.set('heading', (value) => {
      const doc = this._getDoc();
      if (!doc) return;
      // formatBlock accepts tag names with or without angle brackets depending on browser.
      // Always wrap in <> to ensure cross-browser compatibility.
      const tag = value === 'p' ? 'p' : value; // 'p', 'h1'–'h6'
      try {
        doc.execCommand('formatBlock', false, `<${tag}>`);
      } catch {
        // Some environments don't support formatBlock
      }
    });

    // ── fontFamily ───────────────────────────────────────────────────────────
    this._commands.set('fontFamily', (value) => {
      this._expandWordAtCursor();
      const fontFamilyMap = {
        sansSerif: 'Arial, sans-serif',
        serif:     'Georgia, serif',
        monospace: 'Courier New, monospace',
        cursive:   'Comic Sans MS, cursive',
      };
      const css = fontFamilyMap[value] || value;
      this._exec('fontName', css);
    });

    // ── fontSize ─────────────────────────────────────────────────────────────
    this._commands.set('fontSize', (value) => {
      this._expandWordAtCursor();
      // execCommand fontSize only accepts 1–7; we use a custom span approach
      const doc = this._getDoc();
      if (!doc) return;
      const px = parseInt(value, 10);
      if (!px || px <= 0) return;
      // Use execCommand with a font size hack then overwrite the font tag's size
      // Better: wrap selection with a span with inline style
      this._applyStyleToSelection(doc, 'font-size', `${px}px`);
    });

    // ── foreColor ────────────────────────────────────────────────────────────
    this._commands.set('foreColor', (color) => {
      this._expandWordAtCursor();
      if (color) {
        this._exec('foreColor', color);
      } else {
        this._exec('removeFormat');
      }
    });

    // ── backColor ────────────────────────────────────────────────────────────
    this._commands.set('backColor', (color) => {
      this._expandWordAtCursor();
      if (color) {
        this._exec('hiliteColor', color);
      } else {
        this._exec('removeFormat');
      }
    });

    // ── blockquote ───────────────────────────────────────────────────────────
    this._commands.set('blockquote', () => {
      const doc = this._getDoc();
      if (!doc) return;
      try {
        // Toggle: if already in blockquote, formatBlock to p, else to blockquote
        const sel = doc.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const anchorNode = sel.anchorNode;
        const inBq = anchorNode
          ? !!(anchorNode.nodeType === 3
              ? anchorNode.parentElement && anchorNode.parentElement.closest('blockquote')
              : anchorNode.closest && anchorNode.closest('blockquote'))
          : false;
        doc.execCommand('formatBlock', false, inBq ? 'p' : 'blockquote');
      } catch {
        // ignore
      }
    });

    // ── horizontalRule ───────────────────────────────────────────────────────
    this._commands.set('horizontalRule', () => {
      this._exec('insertHorizontalRule');
    });

    // ── undo / redo ──────────────────────────────────────────────────────────
    this._commands.set('undo', () => this._exec('undo'));
    this._commands.set('redo', () => this._exec('redo'));
  }

  // ─── Word-at-cursor auto-expand ───────────────────────────────────────────

  /**
   * If the current selection is collapsed (cursor, no text selected),
   * expand it to cover the word at the cursor position.
   * Does nothing if text is already selected.
   */
  _expandWordAtCursor() {
    const doc = this._getDoc();
    if (!doc) return;
    try {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      if (!sel.isCollapsed) return; // text already selected — leave it

      const range = sel.getRangeAt(0);
      const node = range.startContainer;

      // Only expand in text nodes
      if (!node || node.nodeType !== 3) return;

      const text = node.textContent || '';
      const offset = range.startOffset;

      // Find word boundaries around offset
      const before = text.slice(0, offset);
      const after = text.slice(offset);

      const wordBefore = before.match(/\S+$/) || [''];
      const wordAfter = after.match(/^\S+/) || [''];

      const start = offset - wordBefore[0].length;
      const end = offset + wordAfter[0].length;

      if (start === end) return; // no word found

      const newRange = doc.createRange();
      newRange.setStart(node, start);
      newRange.setEnd(node, end);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch {
      // guard: selection may not be accessible
    }
  }

  // ─── Inline style application ─────────────────────────────────────────────

  /**
   * Apply a CSS property to the current selection by wrapping in a <span>.
   * Falls back to execCommand for simpler properties.
   * @param {Document} doc
   * @param {string} prop  — CSS property name (e.g. 'font-size')
   * @param {string} value — CSS value (e.g. '16px')
   */
  _applyStyleToSelection(doc, prop, value) {
    try {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (range.collapsed) return;

      // Insert a span wrapping the selection
      const span = doc.createElement('span');
      span.style[prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;

      range.surroundContents(span);

      // Re-select the span content
      const newRange = doc.createRange();
      newRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch {
      // surroundContents throws when selection crosses element boundaries;
      // fall back to execCommand fontSize level 7 trick (best-effort)
      try {
        doc.execCommand('fontSize', false, '7');
        const fontEls = doc.querySelectorAll('font[size="7"]');
        for (const el of Array.from(fontEls)) {
          el.removeAttribute('size');
          el.style[prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
        }
      } catch {
        // ignore
      }
    }
  }

  // ─── Inline wrap/unwrap ───────────────────────────────────────────────────

  /**
   * Toggle an inline wrapper element (e.g. <code>) on the selection.
   * @param {string} tag
   */
  _wrapOrUnwrapInline(tag) {
    const doc = this._getDoc();
    if (!doc) return;
    try {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);

      // Check if the selection is already wrapped
      const ancestor = range.commonAncestorContainer;
      const parentTag = ancestor.nodeType === 3
        ? ancestor.parentElement && ancestor.parentElement.tagName.toLowerCase()
        : ancestor.tagName && ancestor.tagName.toLowerCase();

      if (parentTag === tag) {
        // Unwrap: replace the wrapper with its children
        const parent = ancestor.nodeType === 3 ? ancestor.parentElement : ancestor;
        if (parent && parent.tagName.toLowerCase() === tag) {
          const frag = doc.createDocumentFragment();
          while (parent.firstChild) {
            frag.appendChild(parent.firstChild);
          }
          parent.parentNode.replaceChild(frag, parent);
        }
      } else {
        // Wrap selection
        if (!range.collapsed) {
          const el = doc.createElement(tag);
          range.surroundContents(el);
          const newRange = doc.createRange();
          newRange.selectNodeContents(el);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      }
    } catch {
      // ignore — complex multi-element selections
    }
  }

  // ─── execCommand helper ───────────────────────────────────────────────────

  /**
   * Execute a document.execCommand on the iframe document.
   * Guards against null doc and execCommand failures.
   * @param {string} cmd
   * @param {string|null} [value]
   */
  _exec(cmd, value) {
    const doc = this._getDoc();
    if (!doc) return;
    try {
      doc.execCommand(cmd, false, value || null);
    } catch {
      // execCommand is deprecated in some environments but still functional
    }
  }

  /** @returns {Document|null} */
  _getDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch {
      return null;
    }
  }

  destroy() {
    this._destroyed = true;
    this._commands.clear();
  }
}

export default CommandRegistry;
