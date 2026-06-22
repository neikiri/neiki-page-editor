/**
 * TableContextMenu — right-click context menu for table cells inside the iframe.
 *
 * Actions:
 *  - Insert row above / below
 *  - Insert column left / right
 *  - Delete row / column / table
 *  - Merge cells (when multiple selected via colspan/rowspan logic)
 *  - Split cell
 *
 * The menu is rendered in the host document, positioned above the iframe
 * using coordinate translation.
 */
export class TableContextMenu {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.hostEl — editor shell element
   * @param {import('../i18n/i18n').I18nInstance} opts.i18n
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   * @param {import('../core/EventBus').EventBus} [opts.bus]
   */
  constructor(opts = {}) {
    this._hostEl = opts.hostEl || document.body;
    this._i18n   = opts.i18n  || { t: k => k };
    this._canvas = opts.canvasManager || null;
    this._bus    = opts.bus || null;

    /** @type {HTMLElement|null} */
    this._menu = null;

    /** @type {HTMLTableCellElement|null} — the cell that was right-clicked */
    this._targetCell = null;

    /** @type {Function|null} */
    this._onDocClick = null;

    /** @type {Function|null} */
    this._onKeyDown = null;

    /** @type {boolean} */
    this._destroyed = false;

    this._attachIframeListener();
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  /**
   * Show the context menu at the given host-document position for the given cell.
   * @param {{ x: number, y: number }} position — host-document coordinates
   * @param {HTMLTableCellElement} cell
   */
  show(position, cell) {
    this.hide();
    this._targetCell = cell;
    this._build(position, cell);
  }

  /**
   * Hide and remove the context menu.
   */
  hide() {
    this._removeMenu();
    this._targetCell = null;
  }

  /**
   * Attach or re-attach the canvas after construction.
   * @param {import('../canvas/CanvasManager').CanvasManager} canvasManager
   */
  attachCanvas(canvasManager) {
    this._canvas = canvasManager;
    this._attachIframeListener();
  }

  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.hide();
    this._detachIframeListener();
  }

  // ─── Build ────────────────────────────────────────────────────────────────────

  _build(position, cell) {
    const t = this._i18n.t.bind(this._i18n);

    const menu = document.createElement('div');
    menu.className = 'npe-context-menu';
    menu.setAttribute('role', 'menu');

    const items = [
      { key: 'table.insertRowAbove', action: () => this._insertRowAbove() },
      { key: 'table.insertRowBelow', action: () => this._insertRowBelow() },
      { separator: true },
      { key: 'table.insertColLeft',  action: () => this._insertColLeft() },
      { key: 'table.insertColRight', action: () => this._insertColRight() },
      { separator: true },
      { key: 'table.deleteRow',      action: () => this._deleteRow() },
      { key: 'table.deleteColumn',   action: () => this._deleteColumn() },
      { key: 'table.deleteTable',    action: () => this._deleteTable() },
      { separator: true },
      { key: 'table.mergeCells',     action: () => this._mergeCells() },
      { key: 'table.splitCell',      action: () => this._splitCell() },
    ];

    for (const item of items) {
      if (item.separator) {
        const sep = document.createElement('div');
        sep.className = 'npe-context-menu-sep';
        menu.appendChild(sep);
        continue;
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'npe-context-menu-item';
      btn.setAttribute('role', 'menuitem');
      btn.textContent = t(item.key);
      btn.addEventListener('click', () => {
        item.action();
        this.hide();
      });
      menu.appendChild(btn);
    }

    // Position within host document
    menu.style.position = 'fixed';
    menu.style.zIndex   = '10000';
    menu.style.left     = position.x + 'px';
    menu.style.top      = position.y + 'px';

    this._hostEl.appendChild(menu);
    this._menu = menu;

    // Adjust if off screen
    requestAnimationFrame(() => {
      if (!menu.isConnected) return;
      const rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menu.style.left = Math.max(0, window.innerWidth - rect.width - 4) + 'px';
      }
      if (rect.bottom > window.innerHeight) {
        menu.style.top = Math.max(0, window.innerHeight - rect.height - 4) + 'px';
      }
    });

    // Close on outside click
    this._onDocClick = (e) => {
      if (menu && !menu.contains(e.target)) {
        this.hide();
      }
    };
    // Close on Escape
    this._onKeyDown = (e) => {
      if (e.key === 'Escape') this.hide();
    };

    // Defer so this click doesn't immediately trigger the outside-click handler
    setTimeout(() => {
      document.addEventListener('click', this._onDocClick, { capture: true });
      document.addEventListener('keydown', this._onKeyDown);
    }, 0);

    // Focus first item
    const firstItem = menu.querySelector('.npe-context-menu-item');
    if (firstItem) firstItem.focus();
  }

  _removeMenu() {
    if (this._onDocClick) {
      document.removeEventListener('click', this._onDocClick, { capture: true });
      this._onDocClick = null;
    }
    if (this._onKeyDown) {
      document.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._menu && this._menu.parentNode) {
      this._menu.parentNode.removeChild(this._menu);
    }
    this._menu = null;
  }

  // ─── Iframe listener ─────────────────────────────────────────────────────────

  _attachIframeListener() {
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      this._iframeContextHandler = (e) => {
        const cell = e.target && e.target.closest ? e.target.closest('td,th') : null;
        if (!cell) return;
        e.preventDefault();

        // Translate iframe coordinates to host document coordinates
        const iframe = this._canvas ? this._canvas.iframe : null;
        let x = e.clientX;
        let y = e.clientY;
        if (iframe) {
          const rect = iframe.getBoundingClientRect();
          x = rect.left + e.clientX;
          y = rect.top  + e.clientY;
        }
        this.show({ x, y }, cell);
      };
      doc.addEventListener('contextmenu', this._iframeContextHandler);
    } catch {
      // guard: iframe not accessible
    }
  }

  _detachIframeListener() {
    const doc = this._getIframeDoc();
    if (!doc || !this._iframeContextHandler) return;
    try {
      doc.removeEventListener('contextmenu', this._iframeContextHandler);
    } catch { /* ignore */ }
    this._iframeContextHandler = null;
  }

  // ─── Table manipulation ──────────────────────────────────────────────────────

  _insertRowAbove() {
    const cell = this._targetCell;
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row) return;
    const newRow = this._cloneEmptyRow(row);
    row.parentNode.insertBefore(newRow, row);
    this._notifyChange();
  }

  _insertRowBelow() {
    const cell = this._targetCell;
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row) return;
    const newRow = this._cloneEmptyRow(row);
    if (row.nextSibling) {
      row.parentNode.insertBefore(newRow, row.nextSibling);
    } else {
      row.parentNode.appendChild(newRow);
    }
    this._notifyChange();
  }

  _insertColLeft() {
    const cell = this._targetCell;
    if (!cell) return;
    const table = cell.closest('table');
    if (!table) return;
    const colIndex = this._getCellColumnIndex(cell);
    this._insertColumnAt(table, colIndex);
    this._notifyChange();
  }

  _insertColRight() {
    const cell = this._targetCell;
    if (!cell) return;
    const table = cell.closest('table');
    if (!table) return;
    const colIndex = this._getCellColumnIndex(cell);
    this._insertColumnAt(table, colIndex + 1);
    this._notifyChange();
  }

  _deleteRow() {
    const cell = this._targetCell;
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row) return;
    const tbody = row.parentNode;
    if (tbody.rows.length <= 1) return; // don't delete the last row
    tbody.removeChild(row);
    this._notifyChange();
  }

  _deleteColumn() {
    const cell = this._targetCell;
    if (!cell) return;
    const table = cell.closest('table');
    if (!table) return;
    const colIndex = this._getCellColumnIndex(cell);
    const rows = Array.from(table.querySelectorAll('tr'));
    for (const row of rows) {
      if (row.cells.length <= 1) continue; // don't remove last column
      const c = row.cells[colIndex];
      if (c) row.removeChild(c);
    }
    this._notifyChange();
  }

  _deleteTable() {
    const cell = this._targetCell;
    if (!cell) return;
    const table = cell.closest('table');
    if (!table || !table.parentNode) return;
    table.parentNode.removeChild(table);
    this._notifyChange();
  }

  _mergeCells() {
    // Basic merge: merge right neighbour into current cell (colspan)
    const cell = this._targetCell;
    if (!cell) return;
    const row = cell.closest('tr');
    if (!row) return;
    const colIndex = this._getCellColumnIndex(cell);
    const nextCell = row.cells[colIndex + 1];
    if (!nextCell) return;

    const currentSpan = parseInt(cell.getAttribute('colspan') || '1', 10);
    const nextSpan    = parseInt(nextCell.getAttribute('colspan') || '1', 10);
    cell.setAttribute('colspan', String(currentSpan + nextSpan));
    // Move content
    while (nextCell.firstChild) cell.appendChild(nextCell.firstChild);
    row.removeChild(nextCell);
    this._notifyChange();
  }

  _splitCell() {
    // Split a merged cell back to individual cells
    const cell = this._targetCell;
    if (!cell) return;
    const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
    if (colspan <= 1) return;

    const row   = cell.closest('tr');
    const tag   = cell.tagName.toLowerCase();
    const doc   = this._getIframeDoc();
    if (!row || !doc) return;

    // Insert colspan-1 new empty cells after this one
    const ref = cell.nextSibling;
    for (let i = 1; i < colspan; i++) {
      const newCell = doc.createElement(tag);
      newCell.innerHTML = '<br>';
      row.insertBefore(newCell, ref);
    }
    cell.removeAttribute('colspan');
    this._notifyChange();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /**
   * Get the column index of a cell within its row.
   * @param {HTMLTableCellElement} cell
   * @returns {number}
   */
  _getCellColumnIndex(cell) {
    const row = cell.closest('tr');
    if (!row) return 0;
    return Array.prototype.indexOf.call(row.cells, cell);
  }

  /**
   * Clone a row structure with empty cells.
   * @param {HTMLTableRowElement} templateRow
   * @returns {HTMLTableRowElement}
   */
  _cloneEmptyRow(templateRow) {
    const doc = this._getIframeDoc() || document;
    const newRow = doc.createElement('tr');
    for (const cell of Array.from(templateRow.cells)) {
      const tag = cell.tagName.toLowerCase() === 'th' ? 'th' : 'td';
      const newCell = doc.createElement(tag);
      newCell.innerHTML = '<br>';
      newRow.appendChild(newCell);
    }
    return newRow;
  }

  /**
   * Insert an empty column at the given index in every row.
   * @param {HTMLTableElement} table
   * @param {number} colIndex
   */
  _insertColumnAt(table, colIndex) {
    const doc = this._getIframeDoc() || document;
    const rows = Array.from(table.querySelectorAll('tr'));
    for (const row of rows) {
      const tag = row.closest('thead') ? 'th' : 'td';
      const newCell = doc.createElement(tag);
      newCell.innerHTML = '<br>';
      const ref = row.cells[colIndex] || null;
      row.insertBefore(newCell, ref);
    }
  }

  _notifyChange() {
    if (!this._bus) return;
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      this._bus.emit('content:change', { html: body.innerHTML });
    }
  }

  /** @returns {Document|null} */
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch {
      return null;
    }
  }
}

export default TableContextMenu;
