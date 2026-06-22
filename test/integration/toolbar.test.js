/**
 * Integration test: toolbar rendering and state.
 */
import { Editor } from '../../src/core/Editor.js';
import { normalizeOptions } from '../../src/core/Options.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTarget(id) {
  const el = document.createElement('div');
  el.id = id;
  document.body.appendChild(el);
  return el;
}

function removeTarget(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

function createEditor(target, options = {}) {
  return new Promise((resolve) => {
    const opts = normalizeOptions(options);
    const editor = new Editor(target, opts);
    const off = editor.getBus().on('editor:ready', () => {
      off();
      resolve(editor);
    });
    setTimeout(() => resolve(editor), 500);
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('toolbar: rendering', () => {
  let target;
  let editor;

  beforeEach(async () => {
    target = makeTarget('toolbar-test');
    editor = await createEditor(target, {});
  });

  afterEach(() => {
    try { editor && editor.destroy(); } catch {}
    removeTarget(target);
  });

  test('toolbar element exists inside editor shell', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    expect(toolbar).not.toBeNull();
  });

  test('toolbar has role="toolbar"', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    expect(toolbar.getAttribute('role')).toBe('toolbar');
  });

  test('toolbar renders the bold button', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    // ButtonBase uses data-npe-cmd attribute
    const boldBtn = toolbar.querySelector('[data-npe-cmd="bold"]');
    expect(boldBtn).not.toBeNull();
  });

  test('toolbar renders the italic button', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const btn = toolbar.querySelector('[data-npe-cmd="italic"]');
    expect(btn).not.toBeNull();
  });

  test('toolbar renders the underline button', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const btn = toolbar.querySelector('[data-npe-cmd="underline"]');
    expect(btn).not.toBeNull();
  });

  test('toolbar renders the undo button', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const btn = toolbar.querySelector('[data-npe-cmd="undo"]');
    expect(btn).not.toBeNull();
  });

  test('toolbar renders the redo button', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const btn = toolbar.querySelector('[data-npe-cmd="redo"]');
    expect(btn).not.toBeNull();
  });

  test('toolbar contains at least one separator', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const separators = toolbar.querySelectorAll('.npe-toolbar-sep');
    expect(separators.length).toBeGreaterThan(0);
  });

  test('toolbar buttons have aria-label and title attributes', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const btns = toolbar.querySelectorAll('button[data-npe-cmd]');
    let allHaveLabel = true;
    for (const btn of btns) {
      if (!btn.getAttribute('aria-label') && !btn.getAttribute('title')) {
        allHaveLabel = false;
        break;
      }
    }
    expect(allHaveLabel).toBe(true);
  });

  test('toolbar renders heading select (.npe-heading-select)', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const heading = toolbar.querySelector('.npe-heading-select');
    expect(heading).not.toBeNull();
  });

  test('toolbar renders font family select (.npe-font-family-select)', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const ff = toolbar.querySelector('.npe-font-family-select');
    expect(ff).not.toBeNull();
  });

  test('toolbar renders font size widget (.npe-font-size-widget)', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const fs = toolbar.querySelector('.npe-font-size-widget');
    expect(fs).not.toBeNull();
  });

  test('font size widget has − button, numeric input, and + button', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const widget = toolbar.querySelector('.npe-font-size-widget');
    expect(widget.querySelector('.npe-font-size-dec')).not.toBeNull();
    expect(widget.querySelector('.npe-font-size-input')).not.toBeNull();
    expect(widget.querySelector('.npe-font-size-inc')).not.toBeNull();
  });

  test('toolbar renders insert dropdown button', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    // InsertDropdown extends DropdownButton which extends ButtonBase — data-npe-cmd="insertDropdown"
    const insertBtn = toolbar.querySelector('[data-npe-cmd="insertDropdown"]');
    expect(insertBtn).not.toBeNull();
  });

  test('toolbar renders more menu button', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const moreBtn = toolbar.querySelector('[data-npe-cmd="moreMenu"]');
    expect(moreBtn).not.toBeNull();
  });

  test('toolbar contains multiple toolbar groups', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const groups = toolbar.querySelectorAll('.npe-toolbar-group');
    expect(groups.length).toBeGreaterThan(3);
  });
});

describe('toolbar: Czech locale', () => {
  let target;
  let editor;

  beforeEach(async () => {
    target = makeTarget('toolbar-cs-test');
    editor = await createEditor(target, { language: 'cs' });
  });

  afterEach(() => {
    try { editor && editor.destroy(); } catch {}
    removeTarget(target);
  });

  test('bold button has Czech label (Tučné)', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const boldBtn = toolbar.querySelector('[data-npe-cmd="bold"]');
    expect(boldBtn).not.toBeNull();
    const label = boldBtn.getAttribute('aria-label') || boldBtn.getAttribute('title') || '';
    expect(label).toBe('Tučné');
  });

  test('italic button has Czech label (Kurzíva)', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const btn = toolbar.querySelector('[data-npe-cmd="italic"]');
    expect(btn).not.toBeNull();
    const label = btn.getAttribute('aria-label') || '';
    expect(label).toBe('Kurzíva');
  });
});

describe('toolbar: custom toolbar array', () => {
  let target;
  let editor;

  beforeEach(async () => {
    target = makeTarget('toolbar-custom-test');
    editor = await createEditor(target, {
      toolbar: ['bold', 'italic', '|', 'undo'],
    });
  });

  afterEach(() => {
    try { editor && editor.destroy(); } catch {}
    removeTarget(target);
  });

  test('custom toolbar only contains the specified buttons', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const btns = toolbar.querySelectorAll('button[data-npe-cmd]');
    const cmdIds = Array.from(btns).map(b => b.getAttribute('data-npe-cmd'));
    expect(cmdIds).toContain('bold');
    expect(cmdIds).toContain('italic');
    expect(cmdIds).toContain('undo');
  });

  test('heading select not present in custom toolbar', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const heading = toolbar.querySelector('.npe-heading-select');
    expect(heading).toBeNull();
  });

  test('insert dropdown not present in custom toolbar', () => {
    const toolbar = target.querySelector('.npe-toolbar');
    const insertBtn = toolbar.querySelector('[data-npe-cmd="insertDropdown"]');
    expect(insertBtn).toBeNull();
  });
});
