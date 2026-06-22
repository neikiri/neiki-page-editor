/**
 * EmojiPicker — Inline emoji picker panel.
 *
 * Opens as a modal/panel with a scrollable grid of emoji categories.
 * Clicking an emoji calls onInsert with the emoji character.
 */

import { _handleModalKey } from './LinkModal.js';

/** Common emoji organized by category. */
const EMOJI_CATEGORIES = [
  {
    label: 'Smileys',
    emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😇','😈','😉','😊','😋','😌','😍','🥰','😎','😏','😐','😑','😒','😓','😔','😕','😖','😗','😘','😙','😚','😛','😜','😝','😞','😟','😠','😡','😢','😤','😥','😦','😧','😨','😩','🥺','😪','😫','😬','😭','😮','😯','😰','😱','😲','😳','🥴','😴','😵','🤯','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥳','🤠','😎','🤓','🧐'],
  },
  {
    label: 'People',
    emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','💪','🦾','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👁','👀','👅','👄'],
  },
  {
    label: 'Animals',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🦟','🦗','🕷','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿','🦔'],
  },
  {
    label: 'Food',
    emojis: ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🫑','🥕','🧄','🧅','🥔','🍠','🫘','🥐','🥯','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥮','🍢','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🧃','🥤','🧋','☕','🍵','🫖','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽','🥢','🧂'],
  },
  {
    label: 'Travel',
    emojis: ['🚗','🚕','🚙','🚌','🚎','🏎','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🛵','🏍','🚲','🛴','🛹','🛼','🚁','🛸','🚀','🛶','⛵','🚤','🛥','🛳','⛴','🚢','✈','🛩','🛫','🛬','🛰','💺','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚖','🚗','🚘','🚙','🛻','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏧','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩','🕋','⛲','⛺','🌁','🌃','🌄','🌅','🌆','🌇','🌉','🏙','🌌','🌠','🎇','🎆'],
  },
  {
    label: 'Symbols',
    emojis: ['❤','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣','💕','💞','💓','💗','💖','💘','💝','💟','☮','✝','☪','🕉','☸','✡','🔯','🕎','☯','☦','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛','🉑','☢','☣','📴','📳','🈶','🈚','🈸','🈺','🈷','✴','🆚','💮','🉐','㊙','㊗','🈴','🈵','🈹','🈲','🅰','🅱','🆎','🆑','🅾','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼','⁉','🔅','🔆','〽','⚠','🚸','🔱','⚜','🔰','♻','✅','🈯','💹','❎','🌐','💠','Ⓜ','🌀','💤','🏧','🚾','♿','🅿','🛗','🈳','🈹','🚺','🚹','🚻','🚼','🚮','🎦','📶','🈁','🔣','ℹ','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏','▶','⏸','⏹','⏺','⏭','⏮','⏩','⏪','⏫','⏬','◀','🔼','🔽','➡','⬅','⬆','⬇','↗','↘','↙','↖','↕','↔','↩','↪','⤴','⤵','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖','♾','💲','💱','™','©','®','〰','➰','➿','🔚','🔙','🔛','🔝','🔜','✔','☑','🔘','🔲','🔳','⚫','⚪','🟤','🔴','🟠','🟡','🟢','🔵','🟣','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','◼','◻','◾','◽','▪','▫'],
  },
];

export class EmojiPicker {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   * @param {Function} opts.onClose
   * @param {Function} opts.onInsert — called with single emoji character string
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
    modal.className = 'npe-modal npe-emoji-picker';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'npe-emoji-title');
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Header
    const header = document.createElement('div');
    header.className = 'npe-modal-header';

    const title = document.createElement('h2');
    title.id = 'npe-emoji-title';
    title.className = 'npe-modal-title';
    title.textContent = t('modal.emoji.title');

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
    searchInput.setAttribute('aria-label', 'Search emoji');
    searchInput.addEventListener('input', () => this._filterEmoji(searchInput.value, grid));
    this._searchInput = searchInput;

    // Grid
    const grid = document.createElement('div');
    grid.className = 'npe-emoji-grid';

    this._renderEmoji(grid, null);

    // Assemble
    modal.appendChild(header);
    modal.appendChild(searchInput);
    modal.appendChild(grid);

    this._backdrop = backdrop;
    this._modal    = modal;
    this._grid     = grid;
  }

  /**
   * Render emoji buttons into the grid.
   * @param {HTMLElement} grid
   * @param {string|null} filter — search string or null for all
   */
  _renderEmoji(grid, filter) {
    grid.innerHTML = '';
    const query = filter ? filter.toLowerCase() : null;

    for (const category of EMOJI_CATEGORIES) {
      const emojis = query
        ? category.emojis.filter(e => e.toLowerCase().includes(query))
        : category.emojis;

      if (emojis.length === 0) continue;

      const catLabel = document.createElement('div');
      catLabel.className = 'npe-emoji-category-label';
      catLabel.textContent = category.label;
      grid.appendChild(catLabel);

      const row = document.createElement('div');
      row.className = 'npe-emoji-row';

      for (const emoji of emojis) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'npe-emoji-btn';
        btn.textContent = emoji;
        btn.setAttribute('title', emoji);
        btn.setAttribute('aria-label', emoji);
        btn.addEventListener('click', () => {
          this._onInsert(emoji);
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

  _filterEmoji(query, grid) {
    this._renderEmoji(grid, query || null);
  }

  _show() {
    // Modal must be inside the backdrop so the backdrop's flex centering applies.
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

export default EmojiPicker;
