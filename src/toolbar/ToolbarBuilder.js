/**
 * ToolbarBuilder — builds toolbar DOM from a toolbar config array.
 *
 * Maps string IDs to control constructors.
 * Handles '|' separators between groups.
 * Groups wrap as units on narrow screens.
 * Supports plugin-registered buttons.
 */

import { ButtonBase } from './buttons/ButtonBase.js';
import { DropdownButton } from './buttons/DropdownButton.js';
import { HeadingSelect } from './buttons/HeadingSelect.js';
import { FontFamilySelect } from './buttons/FontFamilySelect.js';
import { FontSizeWidget } from './buttons/FontSizeWidget.js';
import { ColorPickerButton } from './buttons/ColorPickerButton.js';
import { InsertDropdown } from './buttons/InsertDropdown.js';
import { MoreMenu } from './buttons/MoreMenu.js';

/**
 * @typedef {object} ToolbarControl
 * @property {string} id
 * @property {HTMLElement} el
 * @property {ButtonBase|HeadingSelect|FontFamilySelect|FontSizeWidget|ColorPickerButton|DropdownButton|null} instance
 */

/* ─── SVG icon set (matches neiki-editor.js Icons) ─────────────────────────── */
const ICONS = {
  undo:          '<svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
  redo:          '<svg viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>',
  bold:          '<svg viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>',
  italic:        '<svg viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>',
  underline:     '<svg viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>',
  strikethrough: '<svg viewBox="0 0 24 24"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>',
  superscript:   '<svg viewBox="0 0 24 24"><path d="M22 7h-2v1h3v1h-4V6.5c0-.83.67-1.5 1.5-1.5h1.5V4h-3V3h2.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.87 6H6.19l4.32 6.73L5.88 20z"/></svg>',
  subscript:     '<svg viewBox="0 0 24 24"><path d="M22 18h-2v1h3v1h-4v-2.5c0-.83.67-1.5 1.5-1.5h1.5v-1h-3v-1h2.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.87 4H6.19l4.32 6.73L5.88 18z"/></svg>',
  code:          '<svg viewBox="0 0 256 256"><path d="M0 0h256v256H0z" fill="none"/><path fill="currentColor" d="M71.68 97.22L34.74 128l36.94 30.78a12 12 0 1 1-15.36 18.44l-48-40a12 12 0 0 1 0-18.44l48-40a12 12 0 0 1 15.36 18.44m176 21.56l-48-40a12 12 0 1 0-15.36 18.44L221.26 128l-36.94 30.78a12 12 0 1 0 15.36 18.44l48-40a12 12 0 0 0 0-18.44M164.1 28.72a12 12 0 0 0-15.38 7.18l-64 176a12 12 0 0 0 7.18 15.37a11.8 11.8 0 0 0 4.1.73a12 12 0 0 0 11.28-7.9l64-176a12 12 0 0 0-7.18-15.38"/></svg>',
  removeFormat:  '<svg viewBox="0 0 24 24"><path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 01-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0zm-1.41 1.42L6.93 12.9l4.24 4.24 7.9-7.9-4.24-4.26z"/></svg>',
  viewCode:      '<svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
  findReplace:   '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
  alignLeft:     '<svg viewBox="0 0 24 24"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>',
  alignCenter:   '<svg viewBox="0 0 24 24"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>',
  alignRight:    '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>',
  alignJustify:  '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/></svg>',
  indent:        '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>',
  outdent:       '<svg viewBox="0 0 24 24"><path d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>',
  bulletList:    '<svg viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>',
  numberedList:  '<svg viewBox="0 0 24 24"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>',
  blockquote:    '<svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>',
  horizontalRule:'<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>',
  // color picker icons
  foreColor:     '<svg viewBox="0 0 24 24"><path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z"/><rect x="3" y="19" width="18" height="3" fill="currentColor"/></svg>',
  backColor:     '<svg viewBox="0 0 24 24"><path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/><rect x="0" y="20" width="24" height="4"/></svg>',
  // insert/more menu icons
  link:          '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
  image:         '<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
  video:         '<svg viewBox="0 0 24 24"><path d="M17 10.5V6c0-1.1-.9-2-2-2H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-4.5l5 5v-13l-5 5zM9 16V8l5 4-5 4z"/></svg>',
  table:         '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>',
  emoji:         '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
  specialChars:  '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="bold" fill="currentColor">©</text></svg>',
  save:          '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
  preview:       '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
  download:      '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
  print:         '<svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>',
  autosave:      '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
  clearAll:      '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  changeTheme:   '<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>',
  fullscreen:    '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  help:          '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
  plus:          '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
  more:          '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg>',
};

/**
 * Map of simple toggle/button controls — id → { toggle, iconKey }
 * All use ButtonBase with SVG icons from ICONS map.
 */
const SIMPLE_BUTTONS = {
  viewCode:      { iconKey: 'viewCode',      toggle: true },
  undo:          { iconKey: 'undo',          toggle: false },
  redo:          { iconKey: 'redo',          toggle: false },
  findReplace:   { iconKey: 'findReplace',   toggle: false },
  bold:          { iconKey: 'bold',          toggle: true },
  italic:        { iconKey: 'italic',        toggle: true },
  underline:     { iconKey: 'underline',     toggle: true },
  strikethrough: { iconKey: 'strikethrough', toggle: true },
  superscript:   { iconKey: 'superscript',   toggle: true },
  subscript:     { iconKey: 'subscript',     toggle: true },
  code:          { iconKey: 'code',          toggle: true },
  removeFormat:  { iconKey: 'removeFormat',  toggle: false },
  alignLeft:     { iconKey: 'alignLeft',     toggle: true },
  alignCenter:   { iconKey: 'alignCenter',   toggle: true },
  alignRight:    { iconKey: 'alignRight',    toggle: true },
  alignJustify:  { iconKey: 'alignJustify',  toggle: true },
  indent:        { iconKey: 'indent',        toggle: false },
  outdent:       { iconKey: 'outdent',       toggle: false },
  bulletList:    { iconKey: 'bulletList',    toggle: true },
  numberedList:  { iconKey: 'numberedList',  toggle: true },
  blockquote:    { iconKey: 'blockquote',    toggle: true },
  horizontalRule:{ iconKey: 'horizontalRule',toggle: false },
};

/** @type {Map<string, {id:string, init(editor):void, destroy?():void}>} */
const _pluginButtons = new Map();

export class ToolbarBuilder {
  /**
   * @param {HTMLElement} container — the .npe-toolbar element
   * @param {import('../core/Options').EditorOptions} opts
   * @param {import('../core/EventBus').EventBus} bus
   * @param {import('../i18n/i18n').I18nInstance} i18n
   */
  constructor(container, opts, bus, i18n) {
    this._container = container;
    this._opts = opts;
    this._bus = bus;
    this._i18n = i18n;

    /** @type {ToolbarControl[]} */
    this._controls = [];

    /** @type {HTMLElement[]} */
    this._groups = [];

    this.build();
  }

  /**
   * Build the toolbar DOM from the toolbar config.
   */
  build() {
    const toolbar = this._opts.toolbar || [];
    // Group items by '|' separators
    const groups = this._groupItems(toolbar);

    for (const group of groups) {
      const groupEl = document.createElement('div');
      groupEl.className = 'npe-toolbar-group';

      for (const id of group) {
        const control = this._buildControl(id);
        if (control) {
          groupEl.appendChild(control.el);
          this._controls.push(control);
          // Mark group containing moreMenu so it can be pushed to the right
          if (control.isMoreMenu) {
            groupEl.classList.add('npe-more-menu-group');
          }
        }
      }

      this._container.appendChild(groupEl);
      this._groups.push(groupEl);
    }

    // Add visual separators between groups
    const allChildren = Array.from(this._container.children);
    for (let i = 0; i < allChildren.length - 1; i++) {
      const sep = document.createElement('span');
      sep.className = 'npe-toolbar-sep';
      sep.setAttribute('aria-hidden', 'true');
      this._container.insertBefore(sep, allChildren[i + 1]);
    }
  }

  /**
   * Split toolbar array by '|' into groups.
   * @param {string[]} toolbar
   * @returns {string[][]}
   */
  _groupItems(toolbar) {
    const groups = [];
    let current = [];

    for (const item of toolbar) {
      if (item === '|') {
        if (current.length > 0) {
          groups.push(current);
          current = [];
        }
      } else {
        current.push(item);
      }
    }

    if (current.length > 0) {
      groups.push(current);
    }

    return groups;
  }

  /**
   * Build a single toolbar control.
   * @param {string} id
   * @returns {ToolbarControl|null}
   */
  _buildControl(id) {
    const t = this._i18n.t.bind(this._i18n);
    const bus = this._bus;

    // Simple buttons
    if (id in SIMPLE_BUTTONS) {
      const def = SIMPLE_BUTTONS[id];
      const icon = ICONS[def.iconKey] || '';
      const btn = new ButtonBase({
        id,
        label: t(`toolbar.${id}`),
        icon,
        toggle: def.toggle,
        onClick: () => bus.emit('toolbar:command', id),
      });
      return { id, el: btn.render(), instance: btn };
    }

    // Heading select
    if (id === 'heading') {
      const control = new HeadingSelect({
        i18n: this._i18n,
        onChange: (value) => bus.emit('toolbar:command', 'heading', value),
      });
      return { id, el: control.render(), instance: control };
    }

    // Font family select
    if (id === 'fontFamily') {
      const control = new FontFamilySelect({
        i18n: this._i18n,
        onChange: (value) => bus.emit('toolbar:command', 'fontFamily', value),
      });
      return { id, el: control.render(), instance: control };
    }

    // Font size widget
    if (id === 'fontSize') {
      const control = new FontSizeWidget({
        i18n: this._i18n,
        onChange: (value) => bus.emit('toolbar:command', 'fontSize', value),
      });
      return { id, el: control.render(), instance: control };
    }

    // Foreground color picker
    if (id === 'foreColor') {
      const control = new ColorPickerButton({
        id,
        label: t('toolbar.foreColor'),
        icon: ICONS.foreColor,
        i18n: this._i18n,
        onApply: (color) => bus.emit('toolbar:command', 'foreColor', color),
        onPreview: (color) => bus.emit('toolbar:colorPreview', 'foreColor', color),
      });
      return { id, el: control.render(), instance: control };
    }

    // Background color picker
    if (id === 'backColor') {
      const control = new ColorPickerButton({
        id,
        label: t('toolbar.backColor'),
        icon: ICONS.backColor,
        i18n: this._i18n,
        onApply: (color) => bus.emit('toolbar:command', 'backColor', color),
        onPreview: (color) => bus.emit('toolbar:colorPreview', 'backColor', color),
      });
      return { id, el: control.render(), instance: control };
    }

    // Insert dropdown
    if (id === 'insertDropdown') {
      const control = new InsertDropdown({
        i18n: this._i18n,
        onItemClick: (itemId) => bus.emit('toolbar:insert', itemId),
      });
      return { id, el: control.render(), instance: control };
    }

    // More menu
    if (id === 'moreMenu') {
      const control = new MoreMenu({
        i18n: this._i18n,
        onItemClick: (itemId) => bus.emit('toolbar:more', itemId),
      });
      return { id, el: control.render(), instance: control, isMoreMenu: true };
    }

    // Plugin-registered button
    if (_pluginButtons.has(id)) {
      const pluginDef = _pluginButtons.get(id);
      const btn = new ButtonBase({
        id,
        label: pluginDef.label || id,
        icon: pluginDef.icon || '',
        toggle: pluginDef.toggle || false,
        onClick: () => {
          if (pluginDef.action) pluginDef.action();
          bus.emit('toolbar:command', id);
        },
      });
      return { id, el: btn.render(), instance: btn };
    }

    // Unknown control — skip gracefully
    return null;
  }

  /**
   * Register a plugin button type so it can be referenced in the toolbar array.
   * @param {object} def
   * @param {string} def.id
   * @param {string} def.label
   * @param {string} [def.icon]
   * @param {boolean} [def.toggle]
   * @param {Function} [def.action]
   */
  static registerPluginButton(def) {
    if (def && typeof def.id === 'string') {
      _pluginButtons.set(def.id, def);
    }
  }

  /**
   * Get a control instance by id.
   * @param {string} id
   * @returns {ToolbarControl|undefined}
   */
  getControl(id) {
    return this._controls.find(c => c.id === id);
  }

  /**
   * Get all control instances.
   * @returns {ToolbarControl[]}
   */
  getControls() {
    return this._controls;
  }

  /**
   * Destroy the toolbar — remove all elements and controls.
   */
  destroy() {
    for (const control of this._controls) {
      if (control.instance && typeof control.instance.destroy === 'function') {
        control.instance.destroy();
      }
    }
    this._controls = [];

    // Clear the container
    while (this._container.firstChild) {
      this._container.removeChild(this._container.firstChild);
    }
    this._groups = [];
  }
}

export default ToolbarBuilder;
