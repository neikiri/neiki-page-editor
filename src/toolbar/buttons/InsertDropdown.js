/**
 * InsertDropdown — "Insert" toolbar dropdown menu.
 * Items: Link, Image, Video, Table, Emoji, Special Characters
 */
import { DropdownButton } from './DropdownButton.js';

const INSERT_ICONS = {
  link:         '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
  image:        '<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
  video:        '<svg viewBox="0 0 24 24"><path d="M17 10.5V6c0-1.1-.9-2-2-2H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-4.5l5 5v-13l-5 5zM9 16V8l5 4-5 4z"/></svg>',
  table:        '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>',
  emoji:        '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
  specialChars: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="bold" fill="currentColor">©</text></svg>',
};

export class InsertDropdown extends DropdownButton {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onItemClick] — called with item id (e.g. 'link', 'image', ...)
   * @param {boolean} [opts.disabled]
   */
  constructor(opts = {}) {
    const i18n = opts.i18n || { t: (k) => k };

    const items = [
      { id: 'link',         label: i18n.t('insert.link'),         icon: INSERT_ICONS.link },
      { id: 'image',        label: i18n.t('insert.image'),        icon: INSERT_ICONS.image },
      { id: 'video',        label: i18n.t('insert.video'),        icon: INSERT_ICONS.video },
      { id: 'table',        label: i18n.t('insert.table'),        icon: INSERT_ICONS.table },
      { id: 'emoji',        label: i18n.t('insert.emoji'),        icon: INSERT_ICONS.emoji },
      { id: 'specialChars', label: i18n.t('insert.specialChars'), icon: INSERT_ICONS.specialChars },
    ];

    const onItemClick = opts.onItemClick || null;

    super({
      id: 'insertDropdown',
      label: i18n.t('toolbar.insertDropdown'),
      // Icon + visible label text together — matches the old Neiki Editor "Insert ▾" button
      icon: `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg><span class="npe-btn-label">${i18n.t('toolbar.insertDropdown')}</span>`,
      disabled: opts.disabled || false,
      items: items.map(item => ({
        ...item,
        action: () => {
          if (onItemClick) onItemClick(item.id);
        },
      })),
    });

    this._i18n = i18n;
  }
}

export default InsertDropdown;
