/**
 * AutosaveManager — localStorage-based autosave for one editor instance.
 *
 * - Scoped by autosaveKey option or a derived key from the instance index.
 * - Stores sanitized HTML.
 * - Cleared on successful save.
 * - Restores drafts on init.
 * - Emits 'autosave:status' on the bus so the StatusBar can update.
 */

const AUTOSAVE_INTERVAL_MS = 30000; // 30 seconds

export class AutosaveManager {
  /**
   * @param {object} opts
   * @param {string} opts.storageKey — unique localStorage key for this instance
   * @param {import('../core/EventBus').EventBus} opts.bus
   * @param {Function} opts.getContent — () => string — returns current sanitized HTML
   * @param {boolean} [opts.enabled] — whether autosave starts enabled
   */
  constructor({ storageKey, bus, getContent, enabled = false }) {
    this._key = storageKey;
    this._bus = bus;
    this._getContent = getContent;
    this._enabled = enabled;
    this._timer = null;
    this._lastSaveTime = null;

    if (this._enabled) {
      this._start();
    }

    this._emitStatus();
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** @returns {boolean} */
  isEnabled() {
    return this._enabled;
  }

  /**
   * Enable autosave. Starts the interval timer.
   */
  enable() {
    if (this._enabled) return;
    this._enabled = true;
    this._start();
    this._emitStatus();
  }

  /**
   * Disable autosave. Stops the interval timer.
   */
  disable() {
    if (!this._enabled) return;
    this._enabled = false;
    this._stop();
    this._emitStatus();
  }

  /**
   * Toggle autosave on/off.
   * @returns {boolean} new enabled state
   */
  toggle() {
    if (this._enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this._enabled;
  }

  /**
   * Save immediately (regardless of the interval timer).
   */
  saveNow() {
    if (!this._enabled) return;
    this._save();
  }

  /**
   * Restore the last draft from localStorage.
   * Returns null if no draft exists.
   * @returns {string|null}
   */
  restore() {
    try {
      return localStorage.getItem(this._key) || null;
    } catch {
      return null;
    }
  }

  /**
   * Clear the autosave draft (called on successful explicit save).
   */
  clear() {
    try {
      localStorage.removeItem(this._key);
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Destroy the manager: stop timer, do not clear the stored draft.
   */
  destroy() {
    this._stop();
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  _start() {
    this._stop();
    this._timer = setInterval(() => this._save(), AUTOSAVE_INTERVAL_MS);
  }

  _stop() {
    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _save() {
    if (!this._enabled) return;

    this._emitSaving();

    try {
      const html = this._getContent();
      localStorage.setItem(this._key, html);
      this._lastSaveTime = new Date();
      this._emitSaved();
    } catch {
      // localStorage may be full or blocked — fail silently
      this._emitStatus();
    }
  }

  _emitSaving() {
    this._bus.emit('autosave:status', { status: 'saving', lastSaveTime: this._lastSaveTime });
  }

  _emitSaved() {
    this._bus.emit('autosave:status', { status: 'saved', lastSaveTime: this._lastSaveTime });
  }

  _emitStatus() {
    const status = this._enabled ? (this._lastSaveTime ? 'saved' : 'saving') : 'off';
    // If just enabled but no save yet — show 'off' until first save runs
    const resolvedStatus = this._enabled && !this._lastSaveTime ? 'off' : status;
    this._bus.emit('autosave:status', {
      status: resolvedStatus === 'off' && this._enabled ? 'saving' : resolvedStatus,
      lastSaveTime: this._lastSaveTime,
    });
    // Simplify: just emit off when disabled
    if (!this._enabled) {
      this._bus.emit('autosave:status', { status: 'off', lastSaveTime: null });
    }
  }
}

export default AutosaveManager;
