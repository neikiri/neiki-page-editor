/**
 * SpecialCharsPicker — picker for special/mathematical/typographic characters.
 *
 * Clicking a character inserts it at the saved selection.
 */

import { _handleModalKey } from './LinkModal.js';

/** Special characters organized by category. */
const CHAR_CATEGORIES = [
  {
    label: 'Currency',
    chars: ['€','£','¥','¢','₹','₽','₩','₪','₺','₫','฿','₴','₦','₡','₲','₵','₱'],
  },
  {
    label: 'Math',
    chars: ['±','×','÷','≠','≤','≥','≈','∞','∑','∏','√','∛','∫','∂','∆','∇','∈','∉','∋','∩','∪','⊂','⊃','⊄','⊅','⊆','⊇','∀','∃','∄','¬','∧','∨','⊕','⊗','⊥','∥','∟','∠','°','′','″','‰','‱','%'],
  },
  {
    label: 'Arrows',
    chars: ['←','→','↑','↓','↔','↕','↖','↗','↘','↙','⇐','⇒','⇑','⇓','⇔','⇕','⟵','⟶','⟷','⟸','⟹','⟺','➔','➜','➡','⬅','⬆','⬇','↩','↪','↺','↻'],
  },
  {
    label: 'Punctuation',
    chars: ['©','®','™','§','¶','†','‡','•','‣','·','…','‥','—','–','\u2011','«','»','‹','›','\u201C','\u201D','„','\u2018','\u2019','‚','|','¦','¡','¿'],
  },
  {
    label: 'Letters',
    chars: ['À','Á','Â','Ã','Ä','Å','Æ','Ç','È','É','Ê','Ë','Ì','Í','Î','Ï','Ð','Ñ','Ò','Ó','Ô','Õ','Ö','Ø','Ù','Ú','Û','Ü','Ý','Þ','ß','à','á','â','ã','ä','å','æ','ç','è','é','ê','ë','ì','í','î','ï','ð','ñ','ò','ó','ô','õ','ö','ø','ù','ú','û','ü','ý','þ','ÿ'],
  },
  {
    label: 'Greek',
    chars: ['Α','Β','Γ','Δ','Ε','Ζ','Η','Θ','Ι','Κ','Λ','Μ','Ν','Ξ','Ο','Π','Ρ','Σ','Τ','Υ','Φ','Χ','Ψ','Ω','α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ','ς','σ','τ','υ','φ','χ','ψ','ω'],
  },
  {
    label: 'Fractions',
    chars: ['½','¼','¾','⅓','⅔','⅛','⅜','⅝','⅞','⅐','⅑','⅒'],
  },
  {
    label: 'Subscript',
    chars: ['₀','₁','₂','₃','₄','₅','₆','₇','₈','₉','₊','₋','₌','₍','₎'],
  },
  {
    label: 'Superscript',
    chars: ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹','⁺','⁻','⁼','⁽','⁾'],
  },
];

export class SpecialCharsPicker {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   * @param {Function} opts.onClose
   * @param {Function} opts.onInsert
   */
  constructor(opts = {}) {
    this._i18n     = opts.i18n || { t: k => k };
    this._hostEl   = opts.hostEl || document.body;
    this._onClose  = opts.onClose || (() => {});
    this._onInsert = opts.onInsert || (() => {});

    this._backdrop  = null;
    this._modal     = null;
    this._onKeyDown = null;
    this._destroyed = false;
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  open(data = {}) {
    if (this._modal) return;
    this._build();
    this._show();
  }

  close() {
    this._teardown();
  }

  destroy() {
    this._destroyed = true;
    this._teardown();
  }

  // ─── Build ────────────────────────────────────────────────────────────────────

  _build() {
    const t = this._i18n.t.bind(this._i18n);

    const backdrop = document.createElement('div');
    backdrop.className = 'npe-modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) this._onClose(); });

    const modal = document.createElement('div');
    modal.className = 'npe-modal npe-special-chars-picker';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'npe-special-chars-title');
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Header
    const header = document.createElement('div');
    header.className = 'npe-modal-header';

    const title = document.createElement('h2');
    title.id = 'npe-special-chars-title';
    title.className = 'npe-modal-title';
    title.textContent = t('modal.specialChars.title');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'npe-modal-close';
    closeBtn.setAttribute('aria-label', t('modal.common.close'));
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this._onClose());

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Search
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'npe-form-input npe-emoji-search';
    searchInput.setAttribute('placeholder', '🔍');
    searchInput.setAttribute('aria-label', 'Search characters');
    searchInput.addEventListener('input', () => this._filterChars(searchInput.value, grid));
    this._searchInput = searchInput;

    // Grid
    const grid = document.createElement('div');
    grid.className = 'npe-emoji-grid npe-special-chars-grid';
    this._renderChars(grid, null);

    // Assemble
    modal.appendChild(header);
    modal.appendChild(searchInput);
    modal.appendChild(grid);

    this._backdrop = backdrop;
    this._modal    = modal;
    this._grid     = grid;
  }

  _renderChars(grid, filter) {
    grid.innerHTML = '';
    const query = filter ? filter.toLowerCase() : null;

    for (const category of CHAR_CATEGORIES) {
      const chars = query
        ? category.chars.filter(c => c.toLowerCase().includes(query) || category.label.toLowerCase().includes(query))
        : category.chars;

      if (chars.length === 0) continue;

      const catLabel = document.createElement('div');
      catLabel.className = 'npe-emoji-category-label';
      catLabel.textContent = category.label;
      grid.appendChild(catLabel);

      const row = document.createElement('div');
      row.className = 'npe-emoji-row';

      for (const char of chars) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'npe-special-char-btn';
        btn.textContent = char;
        btn.setAttribute('title', char);
        btn.setAttribute('aria-label', char);
        btn.addEventListener('click', () => {
          this._onInsert(char);
          this._onClose();
        });
        row.appendChild(btn);
      }

      grid.appendChild(row);
    }

    if (grid.children.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'npe-emoji-empty';
      empty.textContent = '—';
      grid.appendChild(empty);
    }
  }

  _filterChars(query, grid) {
    this._renderChars(grid, query || null);
  }

  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._searchInput) this._searchInput.focus();
    this._onKeyDown = (e) => _handleModalKey(e, this._modal, () => this._onClose());
    document.addEventListener('keydown', this._onKeyDown);
  }

  // ─── Teardown ─────────────────────────────────────────────────────────────────

  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }
    // Modal is a child of backdrop — removing backdrop removes both.
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop    = null;
    this._modal       = null;
    this._searchInput = null;
    this._grid        = null;
  }
}

export default SpecialCharsPicker;
