/**
 * FindReplaceModal — Find & Replace dialog.
 *
 * Features:
 *  - Search term input and replace-with input.
 *  - Case-sensitive checkbox.
 *  - Regular expression checkbox.
 *  - Find Next / Replace / Replace All buttons.
 *  - Operates on the iframe body's text content via TreeWalker.
 *  - Highlights the current match by wrapping it in a temporary <mark> element.
 *  - All previous matches are cleared before each new search.
 *
 * The find/replace implementation walks text nodes inside the iframe body and
 * matches against the search pattern. It never executes scripts; the iframe
 * always uses allow-same-origin only.
 */
export class FindReplaceModal {
  /**
   * @param {object} opts
   * @param {import('../canvas/CanvasManager').CanvasManager} opts.canvasManager
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   */
  constructor(opts = {}) {
    this._canvas  = opts.canvasManager || null;
    this._i18n    = opts.i18n || { t: k => k };
    this._hostEl  = opts.hostEl || document.body;

    /** @type {HTMLElement|null} */
    this._backdrop = null;

    /** @type {HTMLElement|null} */
    this._modal = null;

    /** @type {HTMLInputElement|null} */
    this._findInput = null;

    /** @type {HTMLInputElement|null} */
    this._replaceInput = null;

    /** @type {HTMLInputElement|null} */
    this._caseSensitiveCheck = null;

    /** @type {HTMLInputElement|null} */
    this._regexCheck = null;

    /** @type {Array<{node: Text, index: number, length: number}>} */
    this._matches = [];

    /** @type {number} */
    this._currentMatch = -1;

    /** @type {string} */
    this._MARK_CLASS = 'npe-fr-highlight';

    /** @type {Function|null} */
    this._onKeyDown = null;

    /** @type {boolean} */
    this._destroyed = false;
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  open() {
    if (this._modal) return;
    this._build();
    this._show();
  }

  close() {
    this._clearHighlights();
    this._teardown();
  }

  destroy() {
    this._destroyed = true;
    this.close();
  }

  // ─── Build ────────────────────────────────────────────────────────────────────

  _build() {
    const t = this._i18n.t.bind(this._i18n);

    const backdrop = document.createElement('div');
    backdrop.className = 'npe-modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) this.close(); });

    const modal = document.createElement('div');
    modal.className = 'npe-modal npe-find-replace-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'npe-fr-title');
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Header
    const header = document.createElement('div');
    header.className = 'npe-modal-header';

    const title = document.createElement('h2');
    title.id = 'npe-fr-title';
    title.className = 'npe-modal-title';
    title.textContent = t('modal.findReplace.title');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'npe-modal-close';
    closeBtn.setAttribute('aria-label', t('modal.findReplace.close'));
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.className = 'npe-modal-body';

    // Find row
    const findLabel = document.createElement('label');
    findLabel.className = 'npe-form-label';
    findLabel.setAttribute('for', 'npe-fr-find');
    findLabel.textContent = t('modal.findReplace.find');

    const findInput = document.createElement('input');
    findInput.type = 'text';
    findInput.id = 'npe-fr-find';
    findInput.className = 'npe-form-input';
    findInput.setAttribute('autocomplete', 'off');
    findInput.setAttribute('spellcheck', 'false');
    // Re-run search when query changes
    findInput.addEventListener('input', () => this._runSearch());
    this._findInput = findInput;

    // Replace row
    const replaceLabel = document.createElement('label');
    replaceLabel.className = 'npe-form-label';
    replaceLabel.setAttribute('for', 'npe-fr-replace');
    replaceLabel.textContent = t('modal.findReplace.replace');

    const replaceInput = document.createElement('input');
    replaceInput.type = 'text';
    replaceInput.id = 'npe-fr-replace';
    replaceInput.className = 'npe-form-input';
    replaceInput.setAttribute('autocomplete', 'off');
    this._replaceInput = replaceInput;

    // Options row
    const optionsRow = document.createElement('div');
    optionsRow.className = 'npe-fr-options';

    const { check: caseCheck, label: caseLabel } = this._makeCheckbox(
      'npe-fr-case', t('modal.findReplace.caseSensitive')
    );
    caseCheck.addEventListener('change', () => this._runSearch());
    this._caseSensitiveCheck = caseCheck;

    const { check: regexCheck, label: regexLabel } = this._makeCheckbox(
      'npe-fr-regex', t('modal.findReplace.useRegex')
    );
    regexCheck.addEventListener('change', () => this._runSearch());
    this._regexCheck = regexCheck;

    optionsRow.appendChild(caseLabel);
    optionsRow.appendChild(regexLabel);

    body.appendChild(findLabel);
    body.appendChild(findInput);
    body.appendChild(replaceLabel);
    body.appendChild(replaceInput);
    body.appendChild(optionsRow);

    // Footer — action buttons
    const footer = document.createElement('div');
    footer.className = 'npe-modal-footer';

    const findNextBtn = document.createElement('button');
    findNextBtn.type = 'button';
    findNextBtn.className = 'npe-btn';
    findNextBtn.textContent = t('modal.findReplace.findNext');
    findNextBtn.addEventListener('click', () => this._findNext());

    const replaceBtn = document.createElement('button');
    replaceBtn.type = 'button';
    replaceBtn.className = 'npe-btn';
    replaceBtn.textContent = t('modal.findReplace.replaceOne');
    replaceBtn.addEventListener('click', () => this._replaceCurrent());

    const replaceAllBtn = document.createElement('button');
    replaceAllBtn.type = 'button';
    replaceAllBtn.className = 'npe-btn npe-btn-primary';
    replaceAllBtn.textContent = t('modal.findReplace.replaceAll');
    replaceAllBtn.addEventListener('click', () => this._replaceAll());

    const closeFooterBtn = document.createElement('button');
    closeFooterBtn.type = 'button';
    closeFooterBtn.className = 'npe-btn';
    closeFooterBtn.textContent = t('modal.findReplace.close');
    closeFooterBtn.addEventListener('click', () => this.close());

    footer.appendChild(findNextBtn);
    footer.appendChild(replaceBtn);
    footer.appendChild(replaceAllBtn);
    footer.appendChild(closeFooterBtn);

    // Assemble
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);

    this._backdrop = backdrop;
    this._modal = modal;
  }

  /**
   * @param {string} id
   * @param {string} labelText
   * @returns {{ check: HTMLInputElement, label: HTMLLabelElement }}
   */
  _makeCheckbox(id, labelText) {
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

  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);

    if (this._findInput) this._findInput.focus();

    this._onKeyDown = (e) => this._handleKey(e);
    document.addEventListener('keydown', this._onKeyDown);
  }

  _handleKey(e) {
    if (e.key === 'Escape') {
      this.close();
      return;
    }
    if (e.key === 'Enter' && document.activeElement === this._findInput) {
      e.preventDefault();
      this._findNext();
      return;
    }
    if (e.key === 'Tab' && this._modal) {
      const focusable = Array.from(
        this._modal.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')
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

  // ─── Search engine ────────────────────────────────────────────────────────────

  /**
   * Build a RegExp from the find input value.
   * @returns {RegExp|null}
   */
  _buildPattern() {
    const query = this._findInput ? this._findInput.value : '';
    if (!query) return null;

    const flags = this._caseSensitiveCheck && this._caseSensitiveCheck.checked ? 'g' : 'gi';
    const useRegex = this._regexCheck && this._regexCheck.checked;

    try {
      const pattern = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(pattern, flags);
    } catch {
      // Invalid regex — return null so no search runs
      return null;
    }
  }

  /**
   * Collect all text-node matches in the iframe body.
   * Clears previous highlights first.
   */
  _runSearch() {
    this._clearHighlights();
    this._matches = [];
    this._currentMatch = -1;

    const re = this._buildPattern();
    if (!re) return;

    const body = this._getBody();
    if (!body) return;

    const walker = document.createTreeWalker
      ? this._createWalker(body)
      : null;

    if (!walker) return;

    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent || '';
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        this._matches.push({ node, index: m.index, length: m[0].length });
      }
    }
  }

  /**
   * Create a TreeWalker over text nodes inside the given root,
   * using the iframe document's createTreeWalker if available.
   * @param {Element} root
   * @returns {TreeWalker|null}
   */
  _createWalker(root) {
    try {
      const doc = this._getIframeDoc();
      if (!doc) return null;
      return doc.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */, null);
    } catch {
      return null;
    }
  }

  // ─── Find Next ────────────────────────────────────────────────────────────────

  _findNext() {
    this._runSearch();
    if (this._matches.length === 0) return;

    this._currentMatch = (this._currentMatch + 1) % this._matches.length;
    this._highlightMatch(this._currentMatch);
  }

  // ─── Replace ──────────────────────────────────────────────────────────────────

  _replaceCurrent() {
    this._runSearch();
    if (this._matches.length === 0) return;
    if (this._currentMatch < 0) this._currentMatch = 0;

    const replaceWith = this._replaceInput ? this._replaceInput.value : '';
    const match = this._matches[this._currentMatch];
    if (!match) return;

    this._replaceMatchInNode(match, replaceWith);
    // Re-run after replacement
    this._runSearch();
    if (this._matches.length > 0) {
      this._currentMatch = Math.min(this._currentMatch, this._matches.length - 1);
      this._highlightMatch(this._currentMatch);
    }
  }

  _replaceAll() {
    this._runSearch();
    if (this._matches.length === 0) return;

    const replaceWith = this._replaceInput ? this._replaceInput.value : '';
    const re = this._buildPattern();
    if (!re) return;

    const body = this._getBody();
    if (!body) return;

    // Collect unique text nodes that have matches
    const textNodes = Array.from(new Set(this._matches.map(m => m.node)));

    for (const node of textNodes) {
      const text = node.textContent || '';
      re.lastIndex = 0;
      node.textContent = text.replace(re, replaceWith);
    }

    this._matches = [];
    this._currentMatch = -1;
  }

  // ─── Highlight helpers ────────────────────────────────────────────────────────

  /**
   * Highlight the match at the given index by scrolling to it and wrapping
   * the matched text range in a temporary <mark> element.
   * @param {number} idx
   */
  _highlightMatch(idx) {
    this._clearHighlights();
    const match = this._matches[idx];
    if (!match) return;

    const doc = this._getIframeDoc();
    if (!doc) return;

    try {
      // Split the text node at match boundaries and wrap the middle part
      const node = match.node;
      const before = node.textContent.slice(0, match.index);
      const matched = node.textContent.slice(match.index, match.index + match.length);
      const after = node.textContent.slice(match.index + match.length);

      const mark = doc.createElement('mark');
      mark.className = this._MARK_CLASS;
      mark.textContent = matched;

      const parent = node.parentNode;
      if (!parent) return;

      const frag = doc.createDocumentFragment();
      if (before) frag.appendChild(doc.createTextNode(before));
      frag.appendChild(mark);
      if (after) frag.appendChild(doc.createTextNode(after));

      parent.replaceChild(frag, node);

      // Scroll the mark into view
      if (mark.scrollIntoView) {
        mark.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    } catch {
      // ignore DOM manipulation failures
    }
  }

  /**
   * Remove all highlight <mark> elements inserted by find.
   */
  _clearHighlights() {
    const body = this._getBody();
    if (!body) return;
    try {
      const marks = Array.from(body.querySelectorAll('.' + this._MARK_CLASS));
      for (const mark of marks) {
        const parent = mark.parentNode;
        if (!parent) continue;
        // Replace mark with its text content
        const text = mark.textContent || '';
        parent.replaceChild(document.createTextNode(text), mark);
        // Normalize adjacent text nodes
        try { parent.normalize(); } catch { /* ignore */ }
      }
    } catch {
      // ignore
    }
  }

  // ─── Replace in node ─────────────────────────────────────────────────────────

  /**
   * Replace one match occurrence directly in the text node.
   * @param {{ node: Text, index: number, length: number }} match
   * @param {string} replaceWith
   */
  _replaceMatchInNode(match, replaceWith) {
    try {
      const text = match.node.textContent || '';
      const newText = text.slice(0, match.index) + replaceWith + text.slice(match.index + match.length);
      match.node.textContent = newText;
    } catch {
      // ignore
    }
  }

  // ─── DOM helpers ──────────────────────────────────────────────────────────────

  /** @returns {Document|null} */
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch {
      return null;
    }
  }

  /** @returns {HTMLBodyElement|null} */
  _getBody() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getBody ? this._canvas.getBody() : null;
    } catch {
      return null;
    }
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
    this._findInput    = null;
    this._replaceInput = null;
    this._caseSensitiveCheck = null;
    this._regexCheck = null;
  }
}

export default FindReplaceModal;
