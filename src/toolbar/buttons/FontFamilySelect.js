/**
 * FontFamilySelect — font family dropdown.
 * Options: Sans Serif, Serif, Monospace, Cursive
 */
export class FontFamilySelect {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onChange] — called with the selected CSS font-family value
   * @param {boolean} [opts.disabled]
   */
  constructor(opts = {}) {
    this._i18n = opts.i18n || { t: (k) => k };
    this._onChange = opts.onChange || null;
    this._disabled = opts.disabled || false;

    /** @type {HTMLSelectElement|null} */
    this._el = null;

    this._render();
  }

  _render() {
    const select = document.createElement('select');
    select.className = 'npe-select npe-font-family-select';
    select.setAttribute('aria-label', this._i18n.t('toolbar.fontFamily'));
    select.setAttribute('title', this._i18n.t('toolbar.fontFamily'));

    const options = [
      { value: '', key: 'toolbar.fontFamily' },   // placeholder
      { value: 'Arial, Helvetica, sans-serif', key: 'fontFamily.sansSerif' },
      { value: 'Georgia, "Times New Roman", serif', key: 'fontFamily.serif' },
      { value: '"Courier New", Courier, monospace', key: 'fontFamily.monospace' },
      { value: '"Comic Sans MS", cursive', key: 'fontFamily.cursive' },
    ];

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = this._i18n.t(opt.key);
      if (i === 0) {
        option.disabled = true;
        option.selected = true;
      }
      select.appendChild(option);
    }

    if (this._disabled) {
      select.disabled = true;
      select.setAttribute('aria-disabled', 'true');
    }

    select.addEventListener('change', () => {
      if (this._onChange) this._onChange(select.value);
    });

    this._el = select;
  }

  /**
   * Return the rendered element.
   * @returns {HTMLSelectElement}
   */
  render() {
    return this._el;
  }

  /**
   * Set the currently selected value.
   * @param {string} value — CSS font-family value
   */
  setValue(value) {
    if (!this._el) return;
    this._el.value = value || '';
  }

  /**
   * Set disabled state.
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this._disabled = !!disabled;
    if (!this._el) return;
    this._el.disabled = this._disabled;
    if (this._disabled) {
      this._el.setAttribute('aria-disabled', 'true');
    } else {
      this._el.removeAttribute('aria-disabled');
    }
  }

  destroy() {
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
  }
}

export default FontFamilySelect;
