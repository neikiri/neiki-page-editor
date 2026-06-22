/**
 * EventBus — instance-scoped pub/sub.
 * Each editor instance creates its own EventBus so modules stay loosely coupled.
 *
 * @example
 *   const bus = new EventBus();
 *   const off = bus.on('selection:change', handler);
 *   bus.emit('selection:change', { range });
 *   off(); // unsubscribe
 *   bus.destroy(); // called by Editor.destroy()
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
    this._destroyed = false;
  }

  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} handler
   * @returns {() => void} Unsubscribe function
   */
  on(event, handler) {
    if (this._destroyed) return () => {};
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  /**
   * Unsubscribe a specific handler from an event.
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    const set = this._listeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        this._listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event, invoking all subscribed handlers.
   * Handlers are called synchronously in subscription order.
   * @param {string} event
   * @param {...unknown} args
   */
  emit(event, ...args) {
    if (this._destroyed) return;
    const set = this._listeners.get(event);
    if (!set) return;
    // Snapshot to avoid mutation during iteration
    for (const handler of Array.from(set)) {
      try {
        handler(...args);
      } catch (err) {
        // Prevent one bad handler from stopping others
        // Errors are silently swallowed in production; use debug events if needed
      }
    }
  }

  /**
   * Remove all listeners and mark the bus as destroyed.
   * Idempotent — safe to call multiple times.
   */
  destroy() {
    this._listeners.clear();
    this._destroyed = true;
  }
}

export default EventBus;
