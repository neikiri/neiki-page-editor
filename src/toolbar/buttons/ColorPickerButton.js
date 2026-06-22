/**
 * ColorPickerButton — toolbar color picker button with color swatch.
 * Shows current color as a small swatch below the icon.
 * Opens a floating picker panel on click: preset swatches + native color input + hex input + Apply + Reset.
 */
import { ButtonBase } from './ButtonBase.js';

/** Default preset color palette */
const PRESET_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#ffffff',
  '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0',
  '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c8', '#674ea7', '#a61c00',
  '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#351c75', '#741b47',
];

export class ColorPickerButton extends ButtonBase {
  /**
   * @param {object} opts
   * @param {string} opts.id — 'foreColor' or 'backColor'
   * @param {string} opts.label — translated label
   * @param {string} [opts.icon] — icon HTML
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onApply] — called with final color string (e.g. '#ff0000') or '' for reset
   * @param {Function} [opts.onPreview] — called with preview color string during swatch hover
   * @param {boolean} [opts.disabled]
   */
  constructor(opts = {}) {
    super({
      ...opts,
      toggle: true,
      onClick: (e) => this._togglePanel(e),
    });

    this._i18n = opts.i18n || { t: (k) => k };
    this._onApply = opts.onApply || null;
    this._onPreview = opts.onPreview || null;
    this._currentColor = '';
    this._pendingColor = '';

    /** @type {HTMLElement|null} */
    this._panel = null;
    /** @type {HTMLElement|null} */
    this._swatchIndicator = null;
    /** @type {boolean} */
    this._panelOpen = false;

    this._buildSwatch();
    this._buildPanel();
    this._bindDocumentClose();
  }

  _buildSwatch() {
    if (!this._el) return;
    // Add a color swatch indicator below the button text
    const swatch = document.createElement('span');
    swatch.className = 'npe-color-swatch';
    swatch.setAttribute('aria-hidden', 'true');
    this._el.appendChild(swatch);
    this._swatchIndicator = swatch;
  }

  _buildPanel() {
    const panel = document.createElement('div');
    panel.className = 'npe-color-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', this._label);
    panel.style.display = 'none';

    // Preset swatches grid
    const swatchesGrid = document.createElement('div');
    swatchesGrid.className = 'npe-color-swatches';

    for (const color of PRESET_COLORS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'npe-color-swatch-btn';
      btn.style.backgroundColor = color;
      btn.setAttribute('title', color);
      btn.setAttribute('aria-label', color);

      btn.addEventListener('mouseenter', () => {
        this._pendingColor = color;
        if (this._onPreview) this._onPreview(color);
      });

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._pendingColor = color;
        this._commitColor(color);
      });

      swatchesGrid.appendChild(btn);
    }

    panel.appendChild(swatchesGrid);

    // Native color picker row
    const pickerRow = document.createElement('div');
    pickerRow.className = 'npe-color-picker-row';
    pickerRow.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:6px;';

    const nativePicker = document.createElement('input');
    nativePicker.type = 'color';
    nativePicker.className = 'npe-color-native';
    nativePicker.value = this._currentColor || '#000000';
    nativePicker.style.cssText = 'width:32px;height:28px;border:none;padding:0;cursor:pointer;';
    nativePicker.setAttribute('aria-label', 'Color picker');

    nativePicker.addEventListener('input', () => {
      this._pendingColor = nativePicker.value;
      if (this._hexInput) this._hexInput.value = nativePicker.value;
      if (this._onPreview) this._onPreview(nativePicker.value);
    });

    // Hex text input
    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.className = 'npe-color-hex-input';
    hexInput.placeholder = '#000000';
    hexInput.maxLength = 7;
    hexInput.style.cssText = 'flex:1;height:28px;padding:0 6px;border:1px solid var(--npe-chrome-border);border-radius:3px;font-family:monospace;font-size:12px;background:var(--npe-toolbar-bg);color:var(--npe-chrome-text);';
    hexInput.setAttribute('aria-label', this._i18n.t('color.hex'));

    hexInput.addEventListener('input', () => {
      const v = hexInput.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
        this._pendingColor = v;
        nativePicker.value = v;
        if (this._onPreview) this._onPreview(v);
      }
    });

    pickerRow.appendChild(nativePicker);
    pickerRow.appendChild(hexInput);
    panel.appendChild(pickerRow);

    this._hexInput = hexInput;
    this._nativePicker = nativePicker;

    // Actions row
    const actionsRow = document.createElement('div');
    actionsRow.style.cssText = 'display:flex;gap:4px;justify-content:flex-end;';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'npe-btn';
    resetBtn.textContent = this._i18n.t('color.reset');
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._commitColor('');
    });

    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'npe-btn npe-btn-primary';
    applyBtn.style.cssText = 'background:var(--npe-toolbar-btn-active-bg);color:var(--npe-toolbar-btn-active-text);';
    applyBtn.textContent = this._i18n.t('color.apply');
    applyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._commitColor(this._pendingColor);
    });

    actionsRow.appendChild(resetBtn);
    actionsRow.appendChild(applyBtn);
    panel.appendChild(actionsRow);

    this._panel = panel;
  }

  _commitColor(color) {
    this._currentColor = color;
    this._pendingColor = color;
    this._updateSwatchDisplay();
    if (this._nativePicker) this._nativePicker.value = color || '#000000';
    if (this._hexInput) this._hexInput.value = color || '';
    this._closePanel();
    if (this._onApply) this._onApply(color);
  }

  _updateSwatchDisplay() {
    if (!this._swatchIndicator) return;
    if (this._currentColor) {
      this._swatchIndicator.style.backgroundColor = this._currentColor;
      this._swatchIndicator.style.border = 'none';
    } else {
      this._swatchIndicator.style.backgroundColor = 'transparent';
      this._swatchIndicator.style.border = '1px solid #000';
    }
  }

  _bindDocumentClose() {
    this._docCloseHandler = (e) => {
      if (this._panelOpen && this._el && !this._el.contains(e.target) &&
          this._panel && !this._panel.contains(e.target)) {
        this._closePanel();
      }
    };
    this._keyCloseHandler = (e) => {
      if (e.key === 'Escape' && this._panelOpen) {
        this._closePanel();
        if (this._el) this._el.focus();
      }
    };
    document.addEventListener('mousedown', this._docCloseHandler, true);
    document.addEventListener('keydown', this._keyCloseHandler, true);
  }

  _togglePanel(e) {
    if (e) e.stopPropagation();
    if (this._panelOpen) {
      this._closePanel();
    } else {
      this._openPanel();
    }
  }

  _openPanel() {
    if (!this._panel || !this._el) return;
    this._panelOpen = true;

    if (!this._panel.parentNode) {
      const container = this._el.parentNode || document.body;
      container.style.position = 'relative';
      container.appendChild(this._panel);
    }

    this._panel.style.display = 'block';
    this.setActive(true);

    // Sync hex input with current color
    if (this._hexInput) this._hexInput.value = this._currentColor || '';
    if (this._nativePicker) this._nativePicker.value = this._currentColor || '#000000';
    this._pendingColor = this._currentColor;
  }

  _closePanel() {
    if (!this._panel) return;
    this._panelOpen = false;
    this._panel.style.display = 'none';
    this.setActive(false);
  }

  /**
   * Set the current color value (updates swatch display).
   * @param {string} color — CSS color string
   */
  setColor(color) {
    this._currentColor = color || '';
    this._pendingColor = this._currentColor;
    this._updateSwatchDisplay();
    if (this._nativePicker) this._nativePicker.value = color || '#000000';
    if (this._hexInput) this._hexInput.value = color || '';
  }

  /**
   * Return the rendered button element.
   */
  render() {
    return this._el;
  }

  destroy() {
    this._closePanel();
    document.removeEventListener('mousedown', this._docCloseHandler, true);
    document.removeEventListener('keydown', this._keyCloseHandler, true);
    if (this._panel && this._panel.parentNode) {
      this._panel.parentNode.removeChild(this._panel);
    }
    this._panel = null;
    super.destroy();
  }
}

export default ColorPickerButton;
