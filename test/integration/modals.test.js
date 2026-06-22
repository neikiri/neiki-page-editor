/**
 * Integration test: modal open/close/insert.
 *
 * Tests the modal components directly within the editor's DOM context,
 * since Editor delegates modal management to individual modal classes.
 */
import { Editor } from '../../src/core/Editor.js';
import { normalizeOptions } from '../../src/core/Options.js';
import { LinkModal } from '../../src/modals/modals/LinkModal.js';
import { TableModal } from '../../src/modals/modals/TableModal.js';
import { ModalManager } from '../../src/modals/ModalManager.js';

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

function makeHostEl() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
}

function makeI18n() {
  return { t: (k) => k };
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

// ─── Tests: ModalManager ──────────────────────────────────────────────────────

describe('modals: ModalManager open/close', () => {
  let hostEl;
  let mgr;

  beforeEach(() => {
    hostEl = makeHostEl();
    mgr = new ModalManager({
      i18n: makeI18n(),
      hostEl,
    });
  });

  afterEach(() => {
    mgr.destroy();
    removeTarget(hostEl);
  });

  test('open("link") inserts a modal into the hostEl', () => {
    mgr.open('link');
    const modal = hostEl.querySelector('.npe-link-modal');
    expect(modal).not.toBeNull();
    mgr.close();
  });

  test('open("image") inserts a modal into the hostEl', () => {
    mgr.open('image');
    const modal = hostEl.querySelector('.npe-image-modal');
    expect(modal).not.toBeNull();
    mgr.close();
  });

  test('open("video") inserts a modal into the hostEl', () => {
    mgr.open('video');
    const modal = hostEl.querySelector('.npe-video-modal');
    expect(modal).not.toBeNull();
    mgr.close();
  });

  test('open("table") inserts a modal into the hostEl', () => {
    mgr.open('table');
    const modal = hostEl.querySelector('.npe-table-modal');
    expect(modal).not.toBeNull();
    mgr.close();
  });

  test('open("emoji") inserts picker into the hostEl', () => {
    mgr.open('emoji');
    // Emoji picker may use npe-emoji-modal or npe-emoji-picker class
    const picker = hostEl.querySelector('[class*="npe-emoji"]');
    expect(picker).not.toBeNull();
    mgr.close();
  });

  test('open("specialChars") inserts picker into the hostEl', () => {
    mgr.open('specialChars');
    const picker = hostEl.querySelector('[class*="npe-special"]');
    expect(picker).not.toBeNull();
    mgr.close();
  });

  test('close() removes the open modal', () => {
    mgr.open('link');
    expect(hostEl.querySelector('.npe-link-modal')).not.toBeNull();
    mgr.close();
    expect(hostEl.querySelector('.npe-link-modal')).toBeNull();
  });

  test('opening a second modal closes the first', () => {
    mgr.open('link');
    mgr.open('image');
    expect(hostEl.querySelector('.npe-link-modal')).toBeNull();
    expect(hostEl.querySelector('.npe-image-modal')).not.toBeNull();
    mgr.close();
  });

  test('destroy() removes any open modal', () => {
    mgr.open('table');
    mgr.destroy();
    expect(hostEl.querySelector('.npe-table-modal')).toBeNull();
  });
});

// ─── Tests: LinkModal ─────────────────────────────────────────────────────────

describe('modals: link modal in editor context', () => {
  let hostEl;
  let insertedHtml;
  let modal;

  beforeEach(() => {
    hostEl = makeHostEl();
    insertedHtml = null;
    // onClose must call modal.close() so Escape key actually removes the modal
    modal = new LinkModal({
      i18n: makeI18n(),
      hostEl,
      onInsert: (html) => { insertedHtml = html; },
      onClose: () => { modal && modal.close(); },
    });
  });

  afterEach(() => {
    modal.close();
    removeTarget(hostEl);
  });

  test('modal has role=dialog and aria-modal=true', () => {
    modal.open();
    const el = hostEl.querySelector('.npe-link-modal');
    expect(el.getAttribute('role')).toBe('dialog');
    expect(el.getAttribute('aria-modal')).toBe('true');
  });

  test('Escape key closes the modal', () => {
    modal.open();
    expect(hostEl.querySelector('.npe-link-modal')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(hostEl.querySelector('.npe-link-modal')).toBeNull();
  });

  test('inserting a URL calls onInsert with anchor HTML', () => {
    modal.open();
    const urlInput = hostEl.querySelector('#npe-link-url');
    urlInput.value = 'https://example.com';
    const textInput = hostEl.querySelector('#npe-link-text');
    textInput.value = 'Example';
    const insertBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();

    expect(insertedHtml).toContain('href="https://example.com"');
    expect(insertedHtml).toContain('Example');
  });

  test('inserting with new tab checked adds target=_blank', () => {
    modal.open();
    const urlInput = hostEl.querySelector('#npe-link-url');
    urlInput.value = 'https://example.com';
    const check = hostEl.querySelector('#npe-link-newtab');
    check.checked = true;
    const insertBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();

    expect(insertedHtml).toContain('target="_blank"');
  });
});

// ─── Tests: TableModal insert action ─────────────────────────────────────────

describe('modals: table modal insert action', () => {
  let hostEl;
  let insertedHtml;
  let modal;

  beforeEach(() => {
    hostEl = makeHostEl();
    insertedHtml = null;
    modal = new TableModal({
      i18n: makeI18n(),
      hostEl,
      onInsert: (html) => { insertedHtml = html; },
      onClose: () => {},
    });
  });

  afterEach(() => {
    modal.close();
    removeTarget(hostEl);
  });

  test('inserting a 3x2 table produces correct HTML', () => {
    modal.open();
    hostEl.querySelector('#npe-table-rows').value = '3';
    hostEl.querySelector('#npe-table-cols').value = '2';
    const insertBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();

    expect(insertedHtml).toContain('<table');
    expect(insertedHtml).toContain('<tr>');
    expect(insertedHtml).toContain('<td');
  });

  test('with header row checked, inserted table contains thead', () => {
    modal.open();
    hostEl.querySelector('#npe-table-header').checked = true;
    const insertBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();

    expect(insertedHtml).toContain('<thead>');
  });
});

// ─── Tests: Source view via Editor bus ───────────────────────────────────────

describe('modals: source view modal via Editor', () => {
  let target;
  let editor;

  beforeEach(async () => {
    target = makeTarget('modals-sv-test');
    editor = await createEditor(target, {
      initialContent: '<p>Hello world</p>',
    });
  });

  afterEach(() => {
    try { editor && editor.destroy(); } catch {}
    removeTarget(target);
  });

  test('toolbar:command viewCode opens source view modal', () => {
    editor.getBus().emit('toolbar:command', 'viewCode');
    const shell = target.querySelector('.npe-editor');
    const modal = shell.querySelector('.npe-source-modal');
    expect(modal).not.toBeNull();
    // Close via escape
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });

  test('source view modal has HTML and CSS textareas', () => {
    editor.getBus().emit('toolbar:command', 'viewCode');
    const shell = target.querySelector('.npe-editor');
    const textareas = shell.querySelectorAll('textarea');
    expect(textareas.length).toBeGreaterThanOrEqual(2);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
});

// ─── Tests: Find & Replace modal via Editor bus ───────────────────────────────

describe('modals: find & replace modal via Editor', () => {
  let target;
  let editor;

  beforeEach(async () => {
    target = makeTarget('modals-fr-test');
    editor = await createEditor(target, {
      initialContent: '<p>Hello world. Hello again.</p>',
    });
  });

  afterEach(() => {
    try { editor && editor.destroy(); } catch {}
    removeTarget(target);
  });

  test('toolbar:command findReplace opens find & replace modal', () => {
    editor.getBus().emit('toolbar:command', 'findReplace');
    const shell = target.querySelector('.npe-editor');
    const modal = shell.querySelector('.npe-find-replace-modal');
    expect(modal).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });

  test('find & replace modal has role=dialog', () => {
    editor.getBus().emit('toolbar:command', 'findReplace');
    const shell = target.querySelector('.npe-editor');
    const modal = shell.querySelector('.npe-find-replace-modal');
    expect(modal.getAttribute('role')).toBe('dialog');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });

  test('Escape key closes the find & replace modal', () => {
    editor.getBus().emit('toolbar:command', 'findReplace');
    const shell = target.querySelector('.npe-editor');
    expect(shell.querySelector('.npe-find-replace-modal')).not.toBeNull();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(shell.querySelector('.npe-find-replace-modal')).toBeNull();
  });
});
