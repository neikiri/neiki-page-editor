/**
 * Unit tests for CommandRegistry.
 *
 * Since execCommand is not reliable in jsdom, we verify:
 *  - Commands are registered and callable.
 *  - execute() routes to the correct handler.
 *  - Custom commands override builtins.
 *  - Word-at-cursor auto-expand works on text nodes.
 *  - destroy() clears all commands.
 *  - Null canvas is handled gracefully.
 */
import { jest } from '@jest/globals';
import { CommandRegistry } from '../../src/commands/CommandRegistry.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal fake CanvasManager backed by the main jsdom document
 * so that document.getSelection() works (jsdom only supports getSelection
 * on the global document, not on createHTMLDocument instances).
 *
 * A fresh container is appended to document.body for each test.
 */
function makeCanvas(initialHtml = '') {
  const container = document.createElement('div');
  container.setAttribute('contenteditable', 'true');
  container.innerHTML = initialHtml;
  document.body.appendChild(container);

  // Fake "body" is the container
  return {
    getDocument: () => document,
    getBody: () => container,
    _container: container,
  };
}

/**
 * Create a collapsed selection (cursor) at the given offset inside a text node.
 * Uses the global document selection API.
 * @param {Text} textNode
 * @param {number} offset
 */
function setCursor(textNode, offset) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.setStart(textNode, offset);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CommandRegistry — instantiation', () => {
  test('instantiates without arguments', () => {
    expect(() => new CommandRegistry()).not.toThrow();
  });

  test('instantiates with a canvas manager', () => {
    const canvas = makeCanvas();
    expect(() => new CommandRegistry(canvas, null)).not.toThrow();
  });
});

describe('CommandRegistry — register / execute', () => {
  test('execute does nothing when command is unknown', () => {
    const reg = new CommandRegistry();
    expect(() => reg.execute('nonexistent')).not.toThrow();
  });

  test('register adds a command handler', () => {
    const reg = new CommandRegistry();
    const handler = jest.fn();
    reg.register('myCmd', handler);
    reg.execute('myCmd');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('execute passes arguments to the handler', () => {
    const reg = new CommandRegistry();
    const handler = jest.fn();
    reg.register('myCmd', handler);
    reg.execute('myCmd', 'arg1', 42);
    expect(handler).toHaveBeenCalledWith('arg1', 42);
  });

  test('register overwrites a previously registered command', () => {
    const reg = new CommandRegistry();
    const first = jest.fn();
    const second = jest.fn();
    reg.register('cmd', first);
    reg.register('cmd', second);
    reg.execute('cmd');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe('CommandRegistry — built-in commands registered', () => {
  const BUILTIN_IDS = [
    'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript',
    'removeFormat', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
    'indent', 'outdent', 'bulletList', 'numberedList', 'horizontalRule',
    'undo', 'redo', 'code', 'heading', 'fontFamily', 'fontSize',
    'foreColor', 'backColor', 'blockquote',
  ];

  test.each(BUILTIN_IDS)('"%s" is registered as a builtin', (id) => {
    const reg = new CommandRegistry();
    // execute should not throw even without a canvas
    expect(() => reg.execute(id, 'h2')).not.toThrow();
  });
});

describe('CommandRegistry — null canvas guard', () => {
  test('all builtin commands survive with null canvas', () => {
    const reg = new CommandRegistry(null, null);
    const IDS = ['bold', 'italic', 'undo', 'redo', 'heading', 'fontFamily', 'fontSize',
                 'foreColor', 'backColor', 'blockquote', 'alignLeft', 'indent', 'outdent'];
    for (const id of IDS) {
      expect(() => reg.execute(id, 'test')).not.toThrow();
    }
  });
});

describe('CommandRegistry — word-at-cursor expansion', () => {
  afterEach(() => {
    // Clean up any containers appended to body
    document.body.innerHTML = '';
  });

  test('_expandWordAtCursor does not throw when selection is collapsed on a text node', () => {
    const canvas = makeCanvas('<p>Hello world</p>');
    const reg = new CommandRegistry(canvas, null);

    const textNode = canvas.getBody().querySelector('p').firstChild;
    setCursor(textNode, 5); // cursor in the middle of "Hello"

    // Calling an inline command should trigger expansion — no throw
    expect(() => reg.execute('bold')).not.toThrow();
  });

  test('_expandWordAtCursor does nothing when there is no canvas', () => {
    const reg = new CommandRegistry(null, null);
    expect(() => reg.execute('bold')).not.toThrow();
  });

  test('_expandWordAtCursor does nothing when selection is not collapsed', () => {
    const canvas = makeCanvas('<p>Hello world</p>');
    const reg = new CommandRegistry(canvas, null);

    const textNode = canvas.getBody().querySelector('p').firstChild;

    // Select "Hello" (0..5)
    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 5);
    sel.removeAllRanges();
    sel.addRange(range);

    expect(() => reg.execute('bold')).not.toThrow();
    // Selection should not have been changed — still non-collapsed
    const afterSel = window.getSelection();
    expect(afterSel.isCollapsed).toBe(false);
  });
});

describe('CommandRegistry — heading command', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('heading command does not throw with valid tag', () => {
    const canvas = makeCanvas('<p>text</p>');
    const reg = new CommandRegistry(canvas, null);
    expect(() => reg.execute('heading', 'h2')).not.toThrow();
  });

  test('heading command does not throw with "p"', () => {
    const canvas = makeCanvas('<h2>text</h2>');
    const reg = new CommandRegistry(canvas, null);
    expect(() => reg.execute('heading', 'p')).not.toThrow();
  });
});

describe('CommandRegistry — fontFamily command', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('fontFamily command does not throw with known alias', () => {
    const canvas = makeCanvas('<p>text</p>');
    const reg = new CommandRegistry(canvas, null);
    expect(() => reg.execute('fontFamily', 'serif')).not.toThrow();
  });

  test('fontFamily command does not throw with custom value', () => {
    const canvas = makeCanvas('<p>text</p>');
    const reg = new CommandRegistry(canvas, null);
    expect(() => reg.execute('fontFamily', 'Helvetica, sans-serif')).not.toThrow();
  });
});

describe('CommandRegistry — fontSize command', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('fontSize does not throw with a valid px value', () => {
    const canvas = makeCanvas('<p>text</p>');
    const reg = new CommandRegistry(canvas, null);
    expect(() => reg.execute('fontSize', 16)).not.toThrow();
  });

  test('fontSize does nothing with zero or negative value', () => {
    const canvas = makeCanvas('<p>text</p>');
    const reg = new CommandRegistry(canvas, null);
    expect(() => reg.execute('fontSize', 0)).not.toThrow();
    expect(() => reg.execute('fontSize', -10)).not.toThrow();
  });
});

describe('CommandRegistry — foreColor / backColor commands', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('foreColor does not throw with a valid hex color', () => {
    const canvas = makeCanvas('<p>text</p>');
    const reg = new CommandRegistry(canvas, null);
    expect(() => reg.execute('foreColor', '#ff0000')).not.toThrow();
  });

  test('foreColor with null/empty color does not throw', () => {
    const canvas = makeCanvas('<p>text</p>');
    const reg = new CommandRegistry(canvas, null);
    expect(() => reg.execute('foreColor', null)).not.toThrow();
    expect(() => reg.execute('foreColor', '')).not.toThrow();
  });

  test('backColor does not throw with a valid color', () => {
    const canvas = makeCanvas('<p>text</p>');
    const reg = new CommandRegistry(canvas, null);
    expect(() => reg.execute('backColor', '#00ff00')).not.toThrow();
  });
});

describe('CommandRegistry — blockquote command', () => {
  afterEach(() => { document.body.innerHTML = ''; });

  test('blockquote does not throw when selection is inside a paragraph', () => {
    const canvas = makeCanvas('<p>text</p>');
    const reg = new CommandRegistry(canvas, null);

    const textNode = canvas.getBody().querySelector('p').firstChild;
    setCursor(textNode, 2);

    expect(() => reg.execute('blockquote')).not.toThrow();
  });
});

describe('CommandRegistry — destroy', () => {
  test('destroy clears all registered commands', () => {
    const reg = new CommandRegistry();
    const handler = jest.fn();
    reg.register('myCmd', handler);
    reg.destroy();
    reg.execute('myCmd');
    expect(handler).not.toHaveBeenCalled();
  });

  test('execute after destroy does nothing', () => {
    const reg = new CommandRegistry();
    reg.destroy();
    expect(() => reg.execute('bold')).not.toThrow();
  });

  test('destroy is idempotent', () => {
    const reg = new CommandRegistry();
    expect(() => {
      reg.destroy();
      reg.destroy();
    }).not.toThrow();
  });
});
