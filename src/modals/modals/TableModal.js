/**
 * TableModal — Insert a table.
 *
 * Fields:
 *  - Rows (number, min 1)
 *  - Columns (number, min 1)
 *  - Include header row (checkbox)
 *
 * Generates a valid <table> element with thead/tbody structure when header row is checked.
 */

import { _handleModalKey, _makeCheckbox } from './LinkModal.js';

export class TableModal {
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
    modal.className = 'npe-modal npe-table-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'npe-table-title');
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Header
    const header = document.createElement('div');
    header.className = 'npe-modal-header';

    const title = document.createElement('h2');
    title.id = 'npe-table-title';
    title.className = 'npe-modal-title';
    title.textContent = t('modal.table.title');

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

    // Rows
    const rowsLabel = document.createElement('label');
    rowsLabel.className = 'npe-form-label';
    rowsLabel.setAttribute('for', 'npe-table-rows');
    rowsLabel.textContent = t('modal.table.rows');

    const rowsInput = document.createElement('input');
    rowsInput.type = 'number';
    rowsInput.id = 'npe-table-rows';
    rowsInput.className = 'npe-form-input npe-table-number-input';
    rowsInput.value = String(data.rows || 3);
    rowsInput.min = '1';
    rowsInput.max = '100';
    this._rowsInput = rowsInput;

    // Columns
    const colsLabel = document.createElement('label');
    colsLabel.className = 'npe-form-label';
    colsLabel.setAttribute('for', 'npe-table-cols');
    colsLabel.textContent = t('modal.table.columns');

    const colsInput = document.createElement('input');
    colsInput.type = 'number';
    colsInput.id = 'npe-table-cols';
    colsInput.className = 'npe-form-input npe-table-number-input';
    colsInput.value = String(data.cols || 3);
    colsInput.min = '1';
    colsInput.max = '100';
    this._colsInput = colsInput;

    // Header row checkbox
    const { check: headerCheck, label: headerLabel } = _makeCheckbox(
      'npe-table-header', t('modal.table.headerRow')
    );
    headerCheck.checked = data.headerRow !== false; // default: true
    this._headerCheck = headerCheck;

    body.appendChild(rowsLabel);
    body.appendChild(rowsInput);
    body.appendChild(colsLabel);
    body.appendChild(colsInput);
    body.appendChild(headerLabel);

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
    insertBtn.addEventListener('click', () => this._handleInsert());

    footer.appendChild(cancelBtn);
    footer.appendChild(insertBtn);

    // Assemble
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);

    this._backdrop = backdrop;
    this._modal    = modal;
  }

  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._rowsInput) this._rowsInput.focus();
    this._onKeyDown = (e) => _handleModalKey(e, this._modal, () => this._onClose());
    document.addEventListener('keydown', this._onKeyDown);
  }

  // ─── Insert logic ─────────────────────────────────────────────────────────────

  _handleInsert() {
    const rows = Math.max(1, Math.min(100, parseInt(this._rowsInput ? this._rowsInput.value : '3', 10) || 3));
    const cols = Math.max(1, Math.min(100, parseInt(this._colsInput ? this._colsInput.value : '3', 10) || 3));
    const includeHeader = this._headerCheck ? this._headerCheck.checked : true;

    this._onInsert(_buildTableHtml(rows, cols, includeHeader));
    this._onClose();
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
    this._backdrop   = null;
    this._modal      = null;
    this._rowsInput  = null;
    this._colsInput  = null;
    this._headerCheck = null;
  }
}

export default TableModal;

// ─── Table HTML builder ───────────────────────────────────────────────────────

/**
 * Build a table HTML string with a visible default border.
 * The border is an inline style so users can remove it via source view
 * without any editor infrastructure getting in the way — accurate rendering
 * is preserved and the editor never forces styles on later edits.
 * @param {number} rows   — data rows (excluding header)
 * @param {number} cols
 * @param {boolean} includeHeader
 * @returns {string}
 */
function _buildTableHtml(rows, cols, includeHeader) {
  const cellStyle = 'border:1px solid #ccc;padding:6px 10px;';
  const emptyCell = (tag) => `<${tag} style="${cellStyle}"><br></${tag}>`;

  let html = '<table style="border-collapse:collapse;width:100%;border:1px solid #ccc">';

  if (includeHeader) {
    html += '<thead><tr>';
    for (let c = 0; c < cols; c++) {
      html += emptyCell('th');
    }
    html += '</tr></thead>';
  }

  html += '<tbody>';
  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      html += emptyCell('td');
    }
    html += '</tr>';
  }
  html += '</tbody></table>';

  return html;
}
