/**
 * HeadingSelect — heading/paragraph dropdown.
 * Options: Paragraph, H1–H6
 */
export class HeadingSelect {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onChange] — called with the selected value ('p', 'h1'–'h6')
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
    select.className = 'npe-select npe-heading-select';
    select.setAttribute('aria-label', this._i18n.t('toolbar.heading'));
    select.setAttribute('title', this._i18n.t('toolbar.heading'));

    const options = [
      { value: 'p', key: 'heading.paragraph' },
      { value: 'h1', key: 'heading.h1' },
      { value: 'h2', key: 'heading.h2' },
      { value: 'h3', key: 'heading.h3' },
      { value: 'h4', key: 'heading.h4' },
      { value: 'h5', key: 'heading.h5' },
      { value: 'h6', key: 'heading.h6' },
    ];

    for (const opt of options) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = this._i18n.t(opt.key);
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
   * @param {string} value — e.g. 'p', 'h1', 'h2', etc.
   */
  setValue(value) {
    if (!this._el) return;
    this._el.value = value || 'p';
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

export default HeadingSelect;
