/**
 * ButtonBase — base class for all toolbar button types.
 * Handles aria-label, title, aria-pressed, aria-disabled, tabindex,
 * and active/disabled/toggle states.
 */
export class ButtonBase {
  /**
   * @param {object} opts
   * @param {string} opts.id — toolbar control id (e.g. 'bold')
   * @param {string} opts.label — translated label for aria-label and title
   * @param {string} [opts.icon] — SVG/text icon content (HTML string)
   * @param {boolean} [opts.toggle] — true if button can be in active/pressed state
   * @param {boolean} [opts.disabled] — initial disabled state
   * @param {Function} [opts.onClick] — click handler
   */
  constructor(opts = {}) {
    this._id = opts.id || '';
    this._label = opts.label || '';
    this._icon = opts.icon || '';
    this._toggle = opts.toggle !== false;
    this._active = false;
    this._disabled = opts.disabled || false;
    this._onClick = opts.onClick || null;

    /** @type {HTMLButtonElement|null} */
    this._el = null;

    this._render();
    this._bindEvents();
  }

  _render() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'npe-btn';
    btn.setAttribute('data-npe-cmd', this._id);
    btn.setAttribute('title', this._label);
    btn.setAttribute('aria-label', this._label);

    if (this._toggle) {
      btn.setAttribute('aria-pressed', 'false');
    }

    if (this._icon) {
      // SVG strings must be injected as HTML; plain text as textContent
      if (this._icon.trim().startsWith('<')) {
        btn.innerHTML = this._icon;
      } else {
        btn.textContent = this._icon;
      }
    } else {
      // Use a short text icon based on id if no icon provided
      btn.textContent = this._getDefaultText();
    }

    if (this._disabled) {
      this._applyDisabled(btn, true);
    }

    this._el = btn;
  }

  _getDefaultText() {
    // Map of common button ids to short display text
    const textMap = {
      bold: 'B', italic: 'I', underline: 'U', strikethrough: 'S',
      superscript: 'x²', subscript: 'x₂', code: '<>', removeFormat: '✕',
      undo: '↩', redo: '↪', viewCode: '</>', findReplace: '🔍',
      alignLeft: '≡', alignCenter: '☰', alignRight: '≡', alignJustify: '≡',
      indent: '→', outdent: '←', bulletList: '•', numberedList: '1.',
      blockquote: '"', horizontalRule: '—',
    };
    return textMap[this._id] || this._id;
  }

  _bindEvents() {
    if (!this._el) return;
    this._el.addEventListener('click', (e) => {
      if (this._disabled) return;
      if (this._onClick) this._onClick(e, this);
    });
  }

  /**
   * Return the rendered DOM element.
   * @returns {HTMLButtonElement}
   */
  render() {
    return this._el;
  }

  /**
   * Set the active/pressed state.
   * @param {boolean} active
   */
  setActive(active) {
    this._active = !!active;
    if (!this._el) return;
    if (this._toggle) {
      this._el.setAttribute('aria-pressed', this._active ? 'true' : 'false');
    }
    this._el.classList.toggle('npe-active', this._active);
  }

  /**
   * Set the disabled state.
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this._disabled = !!disabled;
    if (!this._el) return;
    this._applyDisabled(this._el, this._disabled);
  }

  /**
   * @param {HTMLElement} el
   * @param {boolean} disabled
   */
  _applyDisabled(el, disabled) {
    if (disabled) {
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('tabindex', '-1');
      el.classList.add('npe-disabled');
    } else {
      el.removeAttribute('aria-disabled');
      el.removeAttribute('tabindex');
      el.classList.remove('npe-disabled');
    }
  }

  /**
   * Update the translated label.
   * @param {string} label
   */
  setLabel(label) {
    this._label = label;
    if (!this._el) return;
    this._el.setAttribute('title', label);
    this._el.setAttribute('aria-label', label);
  }

  /**
   * Destroy the button.
   */
  destroy() {
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
  }
}

export default ButtonBase;
