/**
 * MoreMenu — "More" toolbar dropdown menu.
 * Items: Save, Preview, Download, Print, Autosave, Clear all, Change theme, Fullscreen, Help
 */
import { DropdownButton } from './DropdownButton.js';

const MORE_ICONS = {
  save:        '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
  preview:     '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
  download:    '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
  print:       '<svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>',
  autosave:    '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
  clearAll:    '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  changeTheme: '<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>',
  fullscreen:  '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  help:        '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
};

export class MoreMenu extends DropdownButton {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onItemClick] — called with item id (e.g. 'save', 'preview', ...)
   * @param {boolean} [opts.disabled]
   */
  constructor(opts = {}) {
    const i18n = opts.i18n || { t: (k) => k };

    const items = [
      { id: 'save',        label: i18n.t('menu.more.save'),        icon: MORE_ICONS.save },
      { id: 'preview',     label: i18n.t('menu.more.preview'),     icon: MORE_ICONS.preview },
      { id: 'download',    label: i18n.t('menu.more.download'),    icon: MORE_ICONS.download },
      { id: 'print',       label: i18n.t('menu.more.print'),       icon: MORE_ICONS.print },
      { id: 'autosave',    label: i18n.t('menu.more.autosave'),    icon: MORE_ICONS.autosave },
      { id: 'clearAll',    label: i18n.t('menu.more.clearAll'),    icon: MORE_ICONS.clearAll },
      { id: 'changeTheme', label: i18n.t('menu.more.changeTheme'), icon: MORE_ICONS.changeTheme },
      { id: 'fullscreen',  label: i18n.t('menu.more.fullscreen'),  icon: MORE_ICONS.fullscreen },
      { id: 'help',        label: i18n.t('menu.more.help'),        icon: MORE_ICONS.help },
    ];

    const onItemClick = opts.onItemClick || null;

    super({
      id: 'moreMenu',
      label: i18n.t('toolbar.moreMenu'),
      icon: '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg>',
      disabled: opts.disabled || false,
      hideArrow: true,
      alignRight: true,
      items: items.map(item => ({
        ...item,
        action: () => {
          if (onItemClick) onItemClick(item.id);
        },
      })),
    });

    this._i18n = i18n;

    // Mark the rendered button so the toolbar can push it to the far right
    if (this._el) {
      this._el.classList.add('npe-more-menu-btn');
    }
  }
}

export default MoreMenu;
