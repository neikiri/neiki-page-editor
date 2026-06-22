/**
 * StatusBar — displays word count, character count, block type, and autosave state.
 *
 * Format:
 *   Words: 142   Characters: 847   Block: Paragraph   Autosave: Saved 2 min ago
 *
 * Updates on every content change and selection change.
 */
export class StatusBar {
  /**
   * @param {HTMLElement} container — the .npe-statusbar element
   * @param {import('../core/EventBus').EventBus} bus
   * @param {import('../i18n/i18n').I18nInstance} i18n
   */
  constructor(container, bus, i18n) {
    this._container = container;
    this._bus = bus;
    this._i18n = i18n;

    /** @type {number} */
    this._words = 0;
    /** @type {number} */
    this._chars = 0;
    /** @type {string} */
    this._block = '';
    /** @type {string} */
    this._autosaveStatus = 'off';
    /** @type {Date|null} */
    this._lastSaveTime = null;
    /** @type {number|null} */
    this._agoTimer = null;

    this._wordEl = null;
    this._charEl = null;
    this._blockEl = null;
    this._autosaveEl = null;

    this._render();
    this._bindBusEvents();
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Update the status bar with new state.
   * @param {object} state
   * @param {number} [state.words]
   * @param {number} [state.chars]
   * @param {string} [state.block]
   * @param {string} [state.autosaveStatus] — 'off' | 'saving' | 'saved'
   * @param {Date|null} [state.lastSaveTime]
   */
  update(state = {}) {
    if (typeof state.words === 'number') this._words = state.words;
    if (typeof state.chars === 'number') this._chars = state.chars;
    if (typeof state.block === 'string') this._block = state.block;
    if (typeof state.autosaveStatus === 'string') this._autosaveStatus = state.autosaveStatus;
    if (state.lastSaveTime !== undefined) this._lastSaveTime = state.lastSaveTime;

    this._updateDOM();
  }

  destroy() {
    this._clearAgoTimer();
    if (this._container) {
      this._container.innerHTML = '';
    }
    this._offHandlers();
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  _render() {
    if (!this._container) return;
    this._container.innerHTML = '';

    this._wordEl = this._makeItem('statusbar.words', '0');
    this._charEl = this._makeItem('statusbar.characters', '0');
    this._blockEl = this._makeItem('statusbar.block', '');
    this._autosaveEl = this._makeItem('statusbar.autosave', this._i18n.t('statusbar.autosave.off'));

    this._container.appendChild(this._wordEl.wrapper);
    this._container.appendChild(this._charEl.wrapper);
    this._container.appendChild(this._blockEl.wrapper);
    this._container.appendChild(this._autosaveEl.wrapper);
  }

  /**
   * Make a label + value span pair wrapped in a .npe-statusbar-item div.
   * @param {string} labelKey
   * @param {string} initialValue
   * @returns {{ wrapper: HTMLElement, value: HTMLElement }}
   */
  _makeItem(labelKey, initialValue) {
    const wrapper = document.createElement('span');
    wrapper.className = 'npe-statusbar-item';

    const label = document.createElement('span');
    label.className = 'npe-statusbar-label';
    label.textContent = this._i18n.t(labelKey) + ':';

    const value = document.createElement('span');
    value.className = 'npe-statusbar-value';
    value.textContent = initialValue;

    wrapper.appendChild(label);
    wrapper.appendChild(value);

    return { wrapper, value };
  }

  _updateDOM() {
    if (this._wordEl) this._wordEl.value.textContent = String(this._words);
    if (this._charEl) this._charEl.value.textContent = String(this._chars);
    if (this._blockEl) this._blockEl.value.textContent = this._block;
    if (this._autosaveEl) this._autosaveEl.value.textContent = this._formatAutosave();

    // Restart the "X min ago" refresh timer when we have a saved timestamp
    if (this._autosaveStatus === 'saved' && this._lastSaveTime) {
      this._startAgoTimer();
    } else {
      this._clearAgoTimer();
    }
  }

  /**
   * Format the autosave status string.
   * @returns {string}
   */
  _formatAutosave() {
    const t = this._i18n.t.bind(this._i18n);

    if (this._autosaveStatus === 'off') return t('statusbar.autosave.off');
    if (this._autosaveStatus === 'saving') return t('statusbar.autosave.saving');
    if (this._autosaveStatus === 'saved' && this._lastSaveTime) {
      const diffMs = Date.now() - this._lastSaveTime.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) {
        return t('statusbar.autosave.saved');
      }
      const diffMin = Math.floor(diffSec / 60);
      return `${t('statusbar.autosave.saved')} ${diffMin} min ${t('statusbar.autosave.ago')}`;
    }
    return t('statusbar.autosave.saved');
  }

  /**
   * Start (or restart) a timer that refreshes the "X min ago" display every minute.
   */
  _startAgoTimer() {
    this._clearAgoTimer();
    this._agoTimer = setInterval(() => {
      if (this._autosaveEl) {
        this._autosaveEl.value.textContent = this._formatAutosave();
      }
    }, 60000);
  }

  _clearAgoTimer() {
    if (this._agoTimer !== null) {
      clearInterval(this._agoTimer);
      this._agoTimer = null;
    }
  }

  /**
   * Bind to bus events for live updates.
   */
  _bindBusEvents() {
    if (!this._bus) return;

    this._onContentChange = ({ words, chars } = {}) => {
      if (typeof words === 'number') this._words = words;
      if (typeof chars === 'number') this._chars = chars;
      this._updateDOM();
    };

    this._onSelectionChange = ({ block } = {}) => {
      if (typeof block === 'string') this._block = block;
      this._updateDOM();
    };

    this._onAutosaveStatus = ({ status, lastSaveTime } = {}) => {
      if (typeof status === 'string') this._autosaveStatus = status;
      if (lastSaveTime !== undefined) this._lastSaveTime = lastSaveTime;
      this._updateDOM();
    };

    this._bus.on('content:change', this._onContentChange);
    this._bus.on('selection:change', this._onSelectionChange);
    this._bus.on('autosave:status', this._onAutosaveStatus);
  }

  _offHandlers() {
    if (!this._bus) return;
    if (this._onContentChange) this._bus.off('content:change', this._onContentChange);
    if (this._onSelectionChange) this._bus.off('selection:change', this._onSelectionChange);
    if (this._onAutosaveStatus) this._bus.off('autosave:status', this._onAutosaveStatus);
  }
}

export default StatusBar;
