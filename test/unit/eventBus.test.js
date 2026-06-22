/**
 * Unit tests for EventBus.
 */
import { jest } from '@jest/globals';
import { EventBus } from '../../src/core/EventBus.js';

describe('EventBus', () => {
  let bus;

  beforeEach(() => {
    bus = new EventBus();
  });

  afterEach(() => {
    bus.destroy();
  });

  test('on() + emit() calls handler with args', () => {
    const handler = jest.fn();
    bus.on('test', handler);
    bus.emit('test', 1, 2);
    expect(handler).toHaveBeenCalledWith(1, 2);
  });

  test('on() returns unsubscribe function', () => {
    const handler = jest.fn();
    const off = bus.on('test', handler);
    off();
    bus.emit('test');
    expect(handler).not.toHaveBeenCalled();
  });

  test('off() removes specific handler', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    bus.on('test', h1);
    bus.on('test', h2);
    bus.off('test', h1);
    bus.emit('test');
    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalled();
  });

  test('emit() on unknown event does not throw', () => {
    expect(() => bus.emit('no-such-event')).not.toThrow();
  });

  test('multiple handlers for same event all fire', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    const h3 = jest.fn();
    bus.on('ev', h1);
    bus.on('ev', h2);
    bus.on('ev', h3);
    bus.emit('ev', 'arg');
    expect(h1).toHaveBeenCalledWith('arg');
    expect(h2).toHaveBeenCalledWith('arg');
    expect(h3).toHaveBeenCalledWith('arg');
  });

  test('a throwing handler does not stop other handlers', () => {
    const bad = jest.fn(() => { throw new Error('boom'); });
    const good = jest.fn();
    bus.on('ev', bad);
    bus.on('ev', good);
    expect(() => bus.emit('ev')).not.toThrow();
    expect(good).toHaveBeenCalled();
  });

  test('destroy() prevents further emissions', () => {
    const handler = jest.fn();
    bus.on('ev', handler);
    bus.destroy();
    bus.emit('ev');
    expect(handler).not.toHaveBeenCalled();
  });

  test('destroy() is idempotent', () => {
    expect(() => {
      bus.destroy();
      bus.destroy();
    }).not.toThrow();
  });

  test('on() after destroy() returns no-op unsubscribe', () => {
    bus.destroy();
    const handler = jest.fn();
    const off = bus.on('ev', handler);
    expect(typeof off).toBe('function');
    expect(() => off()).not.toThrow();
    bus.emit('ev');
    expect(handler).not.toHaveBeenCalled();
  });

  test('same handler can subscribe to multiple events independently', () => {
    const handler = jest.fn();
    bus.on('a', handler);
    bus.on('b', handler);
    bus.emit('a', 'A');
    bus.emit('b', 'B');
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenNthCalledWith(1, 'A');
    expect(handler).toHaveBeenNthCalledWith(2, 'B');
  });
});
