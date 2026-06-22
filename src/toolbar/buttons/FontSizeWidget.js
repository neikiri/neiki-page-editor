/**
 * FontSizeWidget — compound font size control.
 * Layout: − button · numeric input · chevron button · + button
 * Clicking the chevron (or the numeric input) opens a custom popup list
 * of preset sizes anchored below the input. Users can also type directly.
 */

/** Preset font sizes in px */
const FONT_SIZE_PRESETS = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];

const DEFAULT_SIZE = 16;
const MIN_SIZE = 1;
const MAX_SIZE = 400;

export class FontSizeWidget {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onChange] — called with numeric pixel value
   * @param {boolean} [opts.disabled]
   */
  constructor(opts = {}) {
    this._i18n = opts.i18n || { t: (k) => k };
    this._onChange = opts.onChange || null;
    this._disabled = opts.disabled || false;
    this._value = DEFAULT_SIZE;

    /** @type {HTMLDivElement|null} */
    this._el = null;
    /** @type {HTMLButtonElement|null} */
    this._decBtn = null;
    /** @type {HTMLInputElement|null} */
    this._input = null;
    /** @type {HTMLButtonElement|null} */
    this._dropBtn = null;
    /** @type {HTMLButtonElement|null} */
    this._incBtn = null;
    /** @type {HTMLElement|null} */
    this._popup = null;
    /** @type {boolean} */
    this._popupOpen = false;
    /** @type {Function|null} */
    this._docCloseHandler = null;

    this._render();
  }

  _render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'npe-font-size-widget';
    wrapper.setAttribute('role', 'group');
    wrapper.setAttribute('aria-label', this._i18n.t('toolbar.fontSize'));
    // Needed for absolute popup positioning
    wrapper.style.position = 'relative';

    // Decrement button
    const decBtn = document.createElement('button');
    decBtn.type = 'button';
    decBtn.className = 'npe-btn npe-font-size-dec';
    decBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 13H5v-2h14v2z"/></svg>';
    decBtn.setAttribute('aria-label', 'Decrease font size');
    decBtn.setAttribute('title', 'Decrease font size');
    decBtn.addEventListener('click', () => { this._closePopup(); this._adjustSize(-1); });

    // Numeric input — typing is allowed; click opens/closes popup
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'npe-font-size-input';
    input.min = String(MIN_SIZE);
    input.max = String(MAX_SIZE);
    input.value = String(this._value);
    input.setAttribute('aria-label', this._i18n.t('toolbar.fontSize'));
    input.setAttribute('aria-haspopup', 'listbox');
    input.setAttribute('aria-expanded', 'false');
    input.addEventListener('change', () => {
      const v = parseInt(input.value, 10);
      if (!isNaN(v)) this._setValue(v, true);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp')   { e.preventDefault(); this._adjustSize(1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); this._adjustSize(-1); }
      if (e.key === 'Escape')    { this._closePopup(); }
      if (e.key === 'Enter')     { this._closePopup(); }
    });
    // Click opens/closes preset popup
    input.addEventListener('click', (e) => {
      e.stopPropagation();
      this._togglePopup();
    });

    // Increment button
    const incBtn = document.createElement('button');
    incBtn.type = 'button';
    incBtn.className = 'npe-btn npe-font-size-inc';
    incBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    incBtn.setAttribute('aria-label', 'Increase font size');
    incBtn.setAttribute('title', 'Increase font size');
    incBtn.addEventListener('click', () => { this._closePopup(); this._adjustSize(1); });

    wrapper.appendChild(decBtn);
    wrapper.appendChild(input);
    wrapper.appendChild(incBtn);

    this._el      = wrapper;
    this._decBtn  = decBtn;
    this._input   = input;
    this._dropBtn = null; // no separate dropdown button
    this._incBtn  = incBtn;

    // Build the popup list
    this._buildPopup();

    // Close popup on outside click
    this._docCloseHandler = (e) => {
      if (this._popupOpen && this._el && !this._el.contains(e.target)) {
        this._closePopup();
      }
    };
    document.addEventListener('mousedown', this._docCloseHandler, true);

    if (this._disabled) {
      this._applyDisabled(true);
    }
  }

  _buildPopup() {
    const popup = document.createElement('div');
    popup.className = 'npe-font-size-popup';
    popup.setAttribute('role', 'listbox');
    popup.style.display = 'none';

    for (const size of FONT_SIZE_PRESETS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'npe-font-size-popup-item';
      btn.setAttribute('role', 'option');
      btn.textContent = String(size);
      btn.addEventListener('mousedown', (e) => {
        // Use mousedown so it fires before the input's blur
        e.preventDefault();
      });
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._setValue(size, true);
        this._closePopup();
        if (this._input) this._input.focus();
      });
      popup.appendChild(btn);
    }

    this._popup = popup;
    // Will be appended to wrapper on first open
  }

  _togglePopup() {
    if (this._popupOpen) {
      this._closePopup();
    } else {
      this._openPopup();
    }
  }

  _openPopup() {
    if (!this._popup || !this._el) return;
    this._popupOpen = true;

    if (!this._popup.parentNode) {
      this._el.appendChild(this._popup);
    }

    // Highlight the currently selected size
    const items = this._popup.querySelectorAll('.npe-font-size-popup-item');
    items.forEach((item) => {
      item.classList.toggle('npe-active', parseInt(item.textContent, 10) === this._value);
    });

    this._popup.style.display = 'block';
    if (this._input) this._input.setAttribute('aria-expanded', 'true');

    // Scroll the active item into view
    const active = this._popup.querySelector('.npe-font-size-popup-item.npe-active');
    if (active) {
      active.scrollIntoView({ block: 'nearest' });
    }
  }

  _closePopup() {
    if (!this._popup) return;
    this._popupOpen = false;
    this._popup.style.display = 'none';
    if (this._input) this._input.setAttribute('aria-expanded', 'false');
  }

  _adjustSize(delta) {
    this._setValue(this._value + delta, true);
  }

  _setValue(v, notify = false) {
    v = Math.max(MIN_SIZE, Math.min(MAX_SIZE, v));
    this._value = v;
    if (this._input) this._input.value = String(v);
    if (notify && this._onChange) this._onChange(v);
  }

  _applyDisabled(disabled) {
    for (const el of [this._decBtn, this._incBtn, this._input]) {
      if (!el) continue;
      if (disabled) {
        el.disabled = true;
        el.setAttribute('aria-disabled', 'true');
      } else {
        el.disabled = false;
        el.removeAttribute('aria-disabled');
      }
    }
  }

  /** @returns {HTMLDivElement} */
  render() {
    return this._el;
  }

  /**
   * Set the displayed font size (px).
   * @param {number|string} value
   */
  setValue(value) {
    const v = parseInt(value, 10);
    if (!isNaN(v)) this._setValue(v, false);
  }

  /** @returns {number} */
  getValue() {
    return this._value;
  }

  setDisabled(disabled) {
    this._disabled = !!disabled;
    this._applyDisabled(this._disabled);
  }

  destroy() {
    this._closePopup();
    if (this._docCloseHandler) {
      document.removeEventListener('mousedown', this._docCloseHandler, true);
      this._docCloseHandler = null;
    }
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
  }
}

export default FontSizeWidget;
