/**
 * DropdownButton — reusable base for any toolbar dropdown/menu button.
 * Renders a button that opens a floating dropdown panel.
 */
import { ButtonBase } from './ButtonBase.js';

export class DropdownButton extends ButtonBase {
  /**
   * @param {object} opts
   * @param {string} opts.id
   * @param {string} opts.label
   * @param {string} [opts.icon]
   * @param {Array<{id: string, label: string, icon?: string, action?: Function}>} opts.items
   * @param {Function} [opts.onItemClick]
   * @param {boolean} [opts.disabled]
   * @param {boolean} [opts.hideArrow] — if true, omit the dropdown chevron
   * @param {boolean} [opts.alignRight] — if true, dropdown opens left-aligned to its right edge (avoids viewport overflow)
   */
  constructor(opts = {}) {
    // Store hideArrow/alignRight BEFORE calling super() so _render() can use them.
    // We use a temporary own property trick: assign directly to the prototype slot
    // before super() triggers _render().
    // Cleanest approach: pass through opts and read in _render via stored ref.
    // We store on the instance via Object.defineProperty before super() isn't
    // possible in JS — so instead we patch the arrow AFTER super() returns.
    super({
      ...opts,
      toggle: true,
      onClick: (e) => this._toggleDropdown(e),
    });

    this._items = opts.items || [];
    this._onItemClick = opts.onItemClick || null;
    this._hideArrow = opts.hideArrow || false;
    this._alignRight = opts.alignRight || false;

    // _render() was already called by ButtonBase constructor before _hideArrow
    // was set, so the arrow was always appended. Remove it now if not wanted.
    if (this._hideArrow && this._el) {
      const arrow = this._el.querySelector('.npe-dropdown-arrow');
      if (arrow) arrow.remove();
    }

    /** @type {HTMLElement|null} */
    this._dropdown = null;
    /** @type {boolean} */
    this._open = false;

    this._buildDropdown();
    this._bindDocumentClose();
  }

  _render() {
    super._render();
    if (this._el) {
      // Always add the dropdown indicator arrow — it will be removed post-construction
      // if hideArrow is set (since _render runs before hideArrow is initialized).
      const arrow = document.createElement('span');
      arrow.className = 'npe-dropdown-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>';
      this._el.appendChild(arrow);

      // Indicate this is a menu trigger
      this._el.setAttribute('aria-haspopup', 'true');
      this._el.setAttribute('aria-expanded', 'false');
    }
  }

  _buildDropdown() {
    const menu = document.createElement('ul');
    menu.className = 'npe-dropdown';
    menu.setAttribute('role', 'menu');
    menu.style.display = 'none';

    for (const item of this._items) {
      const li = document.createElement('li');
      li.className = 'npe-dropdown-item';
      li.setAttribute('role', 'menuitem');
      li.setAttribute('tabindex', '0');

      if (item.icon) {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'npe-dropdown-item-icon';
        iconSpan.setAttribute('aria-hidden', 'true');
        // Support both SVG strings and plain text icons
        if (item.icon.trim().startsWith('<')) {
          iconSpan.innerHTML = item.icon;
        } else {
          iconSpan.textContent = item.icon;
        }
        li.appendChild(iconSpan);
      }

      const labelSpan = document.createElement('span');
      labelSpan.textContent = item.label;
      li.appendChild(labelSpan);

      li.addEventListener('click', (e) => {
        e.stopPropagation();
        this._closeDropdown();
        if (item.action) item.action(e, item);
        if (this._onItemClick) this._onItemClick(item, e);
      });

      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          li.click();
        }
      });

      menu.appendChild(li);
    }

    this._dropdown = menu;
  }

  _bindDocumentClose() {
    this._docCloseHandler = (e) => {
      if (this._open && this._el && !this._el.contains(e.target) &&
          this._dropdown && !this._dropdown.contains(e.target)) {
        this._closeDropdown();
      }
    };
    this._keyCloseHandler = (e) => {
      if (e.key === 'Escape' && this._open) {
        this._closeDropdown();
        if (this._el) this._el.focus();
      }
    };
    document.addEventListener('mousedown', this._docCloseHandler, true);
    document.addEventListener('keydown', this._keyCloseHandler, true);
  }

  _toggleDropdown(e) {
    if (e) e.stopPropagation();
    if (this._open) {
      this._closeDropdown();
    } else {
      this._openDropdown();
    }
  }

  _openDropdown() {
    if (!this._dropdown || !this._el) return;
    this._open = true;

    // Attach dropdown adjacent to button if not already in DOM
    if (!this._dropdown.parentNode) {
      // Use the button's parent as container so positioning is relative
      const container = this._el.parentNode || document.body;
      container.style.position = 'relative';
      container.appendChild(this._dropdown);
    }

    // Align right edge of dropdown to right edge of its container
    if (this._alignRight) {
      this._dropdown.style.left  = 'auto';
      this._dropdown.style.right = '0';
    } else {
      this._dropdown.style.left  = '0';
      this._dropdown.style.right = 'auto';
    }

    this._dropdown.style.display = 'block';
    this._el.setAttribute('aria-expanded', 'true');
    this.setActive(true);
  }

  _closeDropdown() {
    if (!this._dropdown) return;
    this._open = false;
    this._dropdown.style.display = 'none';
    if (this._el) {
      this._el.setAttribute('aria-expanded', 'false');
    }
    this.setActive(false);
  }

  /**
   * Update the items in the dropdown.
   * @param {Array} items
   */
  setItems(items) {
    this._items = items;
    if (this._dropdown) {
      this._dropdown.innerHTML = '';
      for (const item of items) {
        const li = document.createElement('li');
        li.className = 'npe-dropdown-item';
        li.setAttribute('role', 'menuitem');
        li.setAttribute('tabindex', '0');
        li.textContent = item.label;
        li.addEventListener('click', (e) => {
          e.stopPropagation();
          this._closeDropdown();
          if (item.action) item.action(e, item);
          if (this._onItemClick) this._onItemClick(item, e);
        });
        this._dropdown.appendChild(li);
      }
    }
  }

  /**
   * Return the rendered button element.
   */
  render() {
    return this._el;
  }

  destroy() {
    this._closeDropdown();
    document.removeEventListener('mousedown', this._docCloseHandler, true);
    document.removeEventListener('keydown', this._keyCloseHandler, true);
    if (this._dropdown && this._dropdown.parentNode) {
      this._dropdown.parentNode.removeChild(this._dropdown);
    }
    this._dropdown = null;
    super.destroy();
  }
}

export default DropdownButton;
