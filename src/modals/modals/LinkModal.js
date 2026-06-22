/**
 * LinkModal — Insert/edit a hyperlink.
 *
 * Fields:
 *  - URL input
 *  - Display text input
 *  - Open-in-new-tab checkbox
 *
 * On insert, emits an <a href="…"> tag via the onInsert callback.
 */
export class LinkModal {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   * @param {Function} opts.onClose  — called when the modal should close
   * @param {Function} opts.onInsert — called with HTML string to insert
   */
  constructor(opts = {}) {
    this._i18n     = opts.i18n     || { t: k => k };
    this._hostEl   = opts.hostEl   || document.body;
    this._onClose  = opts.onClose  || (() => {});
    this._onInsert = opts.onInsert || (() => {});

    /** @type {HTMLElement|null} */
    this._backdrop = null;
    /** @type {HTMLElement|null} */
    this._modal = null;
    /** @type {Function|null} */
    this._onKeyDown = null;
    /** @type {boolean} */
    this._destroyed = false;
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  /**
   * @param {object} [data]
   * @param {string} [data.href]  — pre-populate URL (for editing existing link)
   * @param {string} [data.text]  — pre-populate display text
   * @param {boolean} [data.newTab]
   */
  open(data = {}) {
    if (this._modal) return;
    this._build(data);
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

  _build(data = {}) {
    const t = this._i18n.t.bind(this._i18n);

    const backdrop = document.createElement('div');
    backdrop.className = 'npe-modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) this._onClose(); });

    const modal = document.createElement('div');
    modal.className = 'npe-modal npe-link-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'npe-link-title');
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Header
    const header = document.createElement('div');
    header.className = 'npe-modal-header';

    const title = document.createElement('h2');
    title.id = 'npe-link-title';
    title.className = 'npe-modal-title';
    title.textContent = t('modal.link.title');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'npe-modal-close';
    closeBtn.setAttribute('aria-label', t('modal.common.close'));
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this._onClose());

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.className = 'npe-modal-body';

    // URL
    const urlLabel = document.createElement('label');
    urlLabel.className = 'npe-form-label';
    urlLabel.setAttribute('for', 'npe-link-url');
    urlLabel.textContent = t('modal.link.url');

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.id = 'npe-link-url';
    urlInput.className = 'npe-form-input';
    urlInput.value = data.href || '';
    urlInput.setAttribute('placeholder', 'https://');
    urlInput.setAttribute('autocomplete', 'off');

    // Display text
    const textLabel = document.createElement('label');
    textLabel.className = 'npe-form-label';
    textLabel.setAttribute('for', 'npe-link-text');
    textLabel.textContent = t('modal.link.text');

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'npe-link-text';
    textInput.className = 'npe-form-input';
    textInput.value = data.text || '';
    textInput.setAttribute('autocomplete', 'off');

    // New tab checkbox
    const { check: newTabCheck, label: newTabLabel } = _makeCheckbox(
      'npe-link-newtab', t('modal.link.newTab')
    );
    newTabCheck.checked = data.newTab === true;

    body.appendChild(urlLabel);
    body.appendChild(urlInput);
    body.appendChild(textLabel);
    body.appendChild(textInput);
    body.appendChild(newTabLabel);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'npe-modal-footer';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'npe-btn';
    cancelBtn.textContent = t('modal.common.cancel');
    cancelBtn.addEventListener('click', () => this._onClose());

    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.className = 'npe-btn npe-btn-primary';
    insertBtn.textContent = t('modal.common.insert');
    insertBtn.addEventListener('click', () => {
      const href = urlInput.value.trim();
      if (!href) { urlInput.focus(); return; }
      const displayText = textInput.value.trim() || href;
      const target = newTabCheck.checked ? ' target="_blank" rel="noopener noreferrer"' : '';
      const html = `<a href="${_escapeAttr(href)}"${target}>${_escapeHtml(displayText)}</a>`;
      this._onInsert(html);
      this._onClose();
    });

    footer.appendChild(cancelBtn);
    footer.appendChild(insertBtn);

    // Assemble
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);

    this._urlInput  = urlInput;
    this._backdrop  = backdrop;
    this._modal     = modal;
  }

  _show() {
    // Modal must be inside the backdrop so the backdrop's flex centering applies.
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._urlInput) this._urlInput.focus();
    this._onKeyDown = (e) => _handleModalKey(e, this._modal, () => this._onClose());
    document.addEventListener('keydown', this._onKeyDown);
  }

  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }
    // Modal is a child of backdrop — removing backdrop removes both.
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop = null;
    this._modal    = null;
    this._urlInput = null;
  }
}

export default LinkModal;

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Standard modal keyboard handler: Escape closes, Tab traps focus.
 * @param {KeyboardEvent} e
 * @param {HTMLElement|null} modal
 * @param {Function} closeFn
 */
export function _handleModalKey(e, modal, closeFn) {
  if (e.key === 'Escape') {
    closeFn();
    return;
  }
  if (e.key === 'Tab' && modal) {
    const focusable = Array.from(
      modal.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.disabled && el.getAttribute('tabindex') !== '-1');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

/**
 * @param {string} id
 * @param {string} labelText
 * @returns {{ check: HTMLInputElement, label: HTMLLabelElement }}
 */
export function _makeCheckbox(id, labelText) {
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.id = id;
  check.className = 'npe-form-checkbox';

  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.className = 'npe-form-check-label';
  label.appendChild(check);
  label.appendChild(document.createTextNode(' ' + labelText));

  return { check, label };
}

/** @param {string} s @returns {string} */
export function _escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** @param {string} s @returns {string} */
export function _escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
