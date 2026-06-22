/**
 * SourceViewModal — two-panel source view: HTML and CSS.
 *
 * HTML panel shows sanitized canvas content (editable).
 * CSS panel shows current page CSS (editable).
 * Applying sanitizes the HTML and reloads the iframe; CSS is updated in-place.
 *
 * Security: HTML entered via the source panel goes through the Sanitizer before
 * being written to the iframe. The iframe never uses allow-scripts.
 */
export class SourceViewModal {
  /**
   * @param {object} opts
   * @param {import('../canvas/ContentSerializer').ContentSerializer} opts.contentSerializer
   * @param {import('../canvas/StyleManager').StyleManager} opts.styleManager
   * @param {import('../canvas/Sanitizer').Sanitizer} opts.sanitizer
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl — host element to append the modal to
   */
  constructor(opts = {}) {
    this._serializer   = opts.contentSerializer || null;
    this._styleManager = opts.styleManager || null;
    this._sanitizer    = opts.sanitizer || null;
    this._i18n         = opts.i18n || { t: k => k };
    this._hostEl       = opts.hostEl || document.body;

    /** @type {HTMLElement|null} */
    this._backdrop = null;

    /** @type {HTMLElement|null} */
    this._modal = null;

    /** @type {HTMLTextAreaElement|null} */
    this._htmlArea = null;

    /** @type {HTMLTextAreaElement|null} */
    this._cssArea = null;

    /** @type {Function|null} */
    this._onKeyDown = null;

    /** @type {boolean} */
    this._destroyed = false;
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  /**
   * Open the source view modal, populated with current content.
   */
  open() {
    if (this._modal) return; // already open
    this._build();
    this._populate();
    this._show();
  }

  /**
   * Close and remove the modal.
   */
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

    // Backdrop — close on click outside the modal
    const backdrop = document.createElement('div');
    backdrop.className = 'npe-modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', (e) => {
      // Only close when clicking the backdrop itself, not the modal inside it
      if (e.target === backdrop) this.close();
    });

    // Modal container
    const modal = document.createElement('div');
    modal.className = 'npe-modal npe-source-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'npe-source-title');
    // Prevent clicks inside the modal from reaching the backdrop
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Header
    const header = document.createElement('div');
    header.className = 'npe-modal-header';

    const title = document.createElement('h2');
    title.id = 'npe-source-title';
    title.className = 'npe-modal-title';
    title.textContent = t('modal.source.title');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'npe-modal-close';
    closeBtn.setAttribute('aria-label', t('modal.source.cancel'));
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Tabs
    const tabBar = document.createElement('div');
    tabBar.className = 'npe-modal-tabs';

    const htmlTab = this._makeTab(t('modal.source.html'), 'html', true);
    const cssTab  = this._makeTab(t('modal.source.css'),  'css',  false);
    tabBar.appendChild(htmlTab.btn);
    tabBar.appendChild(cssTab.btn);

    // Panels
    const htmlPanel = document.createElement('div');
    htmlPanel.className = 'npe-modal-panel npe-source-panel';
    htmlPanel.id = 'npe-source-panel-html';

    const htmlArea = document.createElement('textarea');
    htmlArea.className = 'npe-source-textarea';
    htmlArea.setAttribute('aria-label', t('modal.source.html'));
    htmlArea.setAttribute('spellcheck', 'false');
    htmlArea.setAttribute('autocomplete', 'off');
    htmlPanel.appendChild(htmlArea);
    this._htmlArea = htmlArea;

    const cssPanel = document.createElement('div');
    cssPanel.className = 'npe-modal-panel npe-source-panel';
    cssPanel.id = 'npe-source-panel-css';
    cssPanel.setAttribute('hidden', '');

    const cssArea = document.createElement('textarea');
    cssArea.className = 'npe-source-textarea';
    cssArea.setAttribute('aria-label', t('modal.source.css'));
    cssArea.setAttribute('spellcheck', 'false');
    cssArea.setAttribute('autocomplete', 'off');
    cssPanel.appendChild(cssArea);
    this._cssArea = cssArea;

    // Tab switching logic
    htmlTab.btn.addEventListener('click', () => {
      htmlTab.btn.classList.add('npe-tab-active');
      cssTab.btn.classList.remove('npe-tab-active');
      htmlPanel.removeAttribute('hidden');
      cssPanel.setAttribute('hidden', '');
    });
    cssTab.btn.addEventListener('click', () => {
      cssTab.btn.classList.add('npe-tab-active');
      htmlTab.btn.classList.remove('npe-tab-active');
      cssPanel.removeAttribute('hidden');
      htmlPanel.setAttribute('hidden', '');
    });

    // Footer
    const footer = document.createElement('div');
    footer.className = 'npe-modal-footer';

    const applyBtn = document.createElement('button');
    applyBtn.type = 'button';
    applyBtn.className = 'npe-btn npe-btn-primary';
    applyBtn.textContent = t('modal.source.apply');
    applyBtn.addEventListener('click', () => this._apply());

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'npe-btn';
    cancelBtn.textContent = t('modal.source.cancel');
    cancelBtn.addEventListener('click', () => this.close());

    footer.appendChild(cancelBtn);
    footer.appendChild(applyBtn);

    // Assemble
    modal.appendChild(header);
    modal.appendChild(tabBar);
    modal.appendChild(htmlPanel);
    modal.appendChild(cssPanel);
    modal.appendChild(footer);

    this._backdrop = backdrop;
    this._modal = modal;
  }

  /**
   * @param {string} label
   * @param {string} id
   * @param {boolean} active
   * @returns {{ btn: HTMLButtonElement }}
   */
  _makeTab(label, id, active) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'npe-tab' + (active ? ' npe-tab-active' : '');
    btn.textContent = label;
    btn.dataset.tab = id;
    return { btn };
  }

  _populate() {
    if (this._htmlArea && this._serializer) {
      this._htmlArea.value = this._serializer.getContent();
    }
    if (this._cssArea && this._styleManager) {
      this._cssArea.value = this._styleManager.getStyles();
    }
  }

  _show() {
    // Modal must be a child of the backdrop so the backdrop's flex centering applies.
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);

    // Focus the HTML textarea
    if (this._htmlArea) {
      this._htmlArea.focus();
    }

    // Keyboard handler — focus trap + Escape
    this._onKeyDown = (e) => this._handleKey(e);
    document.addEventListener('keydown', this._onKeyDown);
  }

  _handleKey(e) {
    if (e.key === 'Escape') {
      this.close();
      return;
    }
    // Focus trap — cycle between focusable modal elements
    if (e.key === 'Tab' && this._modal) {
      const focusable = Array.from(
        this._modal.querySelectorAll('button, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(el => !el.hasAttribute('disabled'));
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

  // ─── Apply ────────────────────────────────────────────────────────────────────

  /**
   * Apply edited HTML and CSS, sanitizing HTML before writing.
   */
  _apply() {
    // Apply CSS first (non-destructive, can be done regardless of HTML state)
    if (this._cssArea && this._styleManager) {
      this._styleManager.setStyles(this._cssArea.value);
    }

    // Sanitize and apply HTML
    if (this._htmlArea && this._serializer) {
      const raw     = this._htmlArea.value;
      const safe    = this._sanitizer ? this._sanitizer.sanitize(raw) : raw;
      this._serializer.setContent(safe);
    }

    this.close();
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
    this._backdrop = null;
    this._modal    = null;
    this._htmlArea = null;
    this._cssArea  = null;
  }
}

export default SourceViewModal;
