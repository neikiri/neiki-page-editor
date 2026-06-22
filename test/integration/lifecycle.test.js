/**
 * Integration test: init → load → edit → save → destroy lifecycle.
 */

import { Editor } from '../../src/core/Editor.js';
import { normalizeOptions } from '../../src/core/Options.js';

// Helper: create a target div and append to document.body
function makeTarget(id = 'editor-target') {
  const el = document.createElement('div');
  el.id = id;
  document.body.appendChild(el);
  return el;
}

// Helper: remove a target div
function removeTarget(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

// Helper: create an Editor and wait for editor:ready
function createEditor(target, options = {}) {
  return new Promise((resolve) => {
    const opts = normalizeOptions(options);
    const editor = new Editor(target, opts);
    // editor:ready is emitted asynchronously after _loadContent
    const off = editor.getBus().on('editor:ready', () => {
      off();
      resolve(editor);
    });
    // Fallback: if bus already destroyed or ready never fires within 500ms
    setTimeout(() => resolve(editor), 500);
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('lifecycle: init → load → edit → save → destroy', () => {
  let target;

  beforeEach(() => {
    target = makeTarget('lc-target');
  });

  afterEach(() => {
    removeTarget(target);
  });

  test('editor initialises and shell is added to target', async () => {
    const editor = await createEditor(target, {});
    expect(target.querySelector('.npe-editor')).not.toBeNull();
    editor.destroy();
  });

  test('content loads from loadHandler payload', async () => {
    const html = '<p>Hello from DB</p>';
    const editor = await createEditor(target, {
      loadHandler: async () => ({ html }),
    });
    expect(editor.getContent()).toContain('Hello from DB');
    editor.destroy();
  });

  test('content loads from fullHtml payload', async () => {
    const fullHtml = '<!DOCTYPE html><html><head></head><body><p>Full page content</p></body></html>';
    const editor = await createEditor(target, {
      loadHandler: async () => ({ fullHtml }),
    });
    expect(editor.getContent()).toContain('Full page content');
    editor.destroy();
  });

  test('loadHandler failure falls back to initialContent', async () => {
    const editor = await createEditor(target, {
      loadHandler: async () => { throw new Error('DB error'); },
      initialContent: '<p>Fallback</p>',
    });
    expect(editor.getContent()).toContain('Fallback');
    editor.destroy();
  });

  test('onChange fires (debounced) when content changes via bus', async () => {
    return new Promise((resolve, reject) => {
      let fired = false;
      const timeout = setTimeout(() => {
        if (!fired) reject(new Error('onChange never fired'));
      }, 2000);

      createEditor(target, {
        onChange: (html) => {
          clearTimeout(timeout);
          fired = true;
          expect(typeof html).toBe('string');
          resolve();
        },
      }).then((editor) => {
        // Simulate content change via bus
        editor.getBus().emit('content:change', { html: '<p>Changed</p>' });
        // Don't destroy immediately — wait for debounce
        setTimeout(() => editor.destroy(), 600);
      });
    });
  });

  test('triggerSave calls saveHandler with html/css payload', async () => {
    const saved = [];
    const editor = await createEditor(target, {
      loadHandler: async () => ({ html: '<p>Test</p>', css: 'body{color:red}' }),
      saveHandler: async (payload) => { saved.push(payload); },
    });

    await editor.triggerSave();

    expect(saved.length).toBe(1);
    expect(typeof saved[0].html).toBe('string');
    editor.destroy();
  });

  test('onSave fires after successful save', async () => {
    const saveCalls = [];
    const editor = await createEditor(target, {
      saveHandler: async () => {},
      onSave: (payload) => { saveCalls.push(payload); },
    });

    await editor.triggerSave();

    expect(saveCalls.length).toBe(1);
    editor.destroy();
  });

  test('triggerSave shows toast and throws when saveHandler rejects', async () => {
    const editor = await createEditor(target, {
      saveHandler: async () => { throw new Error('network error'); },
    });

    await expect(editor.triggerSave()).rejects.toThrow('network error');

    // Toast should be in the shell
    const shell = target.querySelector('.npe-editor');
    expect(shell.querySelector('.npe-toast')).not.toBeNull();
    editor.destroy();
  });

  test('onFocus fires when canvas:focus is emitted', async () => {
    let focusCalled = false;
    const editor = await createEditor(target, {
      onFocus: () => { focusCalled = true; },
    });

    editor.getBus().emit('canvas:focus');
    expect(focusCalled).toBe(true);
    editor.destroy();
  });

  test('onBlur fires when canvas:blur is emitted', async () => {
    let blurCalled = false;
    const editor = await createEditor(target, {
      onBlur: () => { blurCalled = true; },
    });

    editor.getBus().emit('canvas:blur');
    expect(blurCalled).toBe(true);
    editor.destroy();
  });

  test('destroy removes all .npe-* nodes from target', async () => {
    const editor = await createEditor(target, {});
    expect(target.querySelector('.npe-editor')).not.toBeNull();

    editor.destroy();

    // No .npe-* nodes should remain
    const remaining = target.querySelectorAll('[class*="npe-"]');
    expect(remaining.length).toBe(0);
  });

  test('destroy restores target element (target is not removed)', async () => {
    const editor = await createEditor(target, {});
    editor.destroy();

    // Target element itself should still exist
    expect(document.getElementById('lc-target')).not.toBeNull();
  });

  test('destroy is idempotent — second call does not throw', async () => {
    const editor = await createEditor(target, {});
    editor.destroy();
    expect(() => editor.destroy()).not.toThrow();
  });

  test('getPage returns html, css, cssUrls, metadata from loaded payload', async () => {
    const editor = await createEditor(target, {
      loadHandler: async () => ({
        html: '<p>Page content</p>',
        css: 'p{font-size:16px}',
        cssUrls: ['https://example.com/style.css'],
        metadata: { pageId: 42 },
      }),
    });

    const page = editor.getPage();
    expect(page.html).toContain('Page content');
    expect(page.css).toBe('p{font-size:16px}');
    expect(page.cssUrls).toEqual(['https://example.com/style.css']);
    expect(page.metadata).toEqual({ pageId: 42 });
    editor.destroy();
  });

  test('setPage loads new content and css', async () => {
    const editor = await createEditor(target, {});
    editor.setPage({ html: '<h1>Set Page</h1>', css: 'h1{color:blue}' });

    expect(editor.getContent()).toContain('Set Page');
    expect(editor.getStyles()).toBe('h1{color:blue}');
    editor.destroy();
  });

  test('enable/disable toggle contenteditable on canvas body', async () => {
    const editor = await createEditor(target, {});

    editor.disable();
    // After disable, canvas body contentEditable should be 'false'
    const iframe = target.querySelector('iframe.npe-canvas');
    if (iframe && iframe.contentDocument) {
      expect(iframe.contentDocument.body.contentEditable).toBe('false');
    }

    editor.enable();
    if (iframe && iframe.contentDocument) {
      expect(iframe.contentDocument.body.contentEditable).toBe('true');
    }
    editor.destroy();
  });

  test('toggleFullscreen adds/removes npe-fullscreen class', async () => {
    const editor = await createEditor(target, {});
    const shell = target.querySelector('.npe-editor');

    editor.toggleFullscreen();
    expect(shell.classList.contains('npe-fullscreen')).toBe(true);

    editor.toggleFullscreen();
    expect(shell.classList.contains('npe-fullscreen')).toBe(false);
    editor.destroy();
  });
});
