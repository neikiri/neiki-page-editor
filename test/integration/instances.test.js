/**
 * Integration test: multiple editor instances are isolated.
 */

import { Editor } from '../../src/core/Editor.js';
import { normalizeOptions } from '../../src/core/Options.js';

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

describe('instances: multiple editor isolation', () => {
  let targetA, targetB, editorA, editorB;

  beforeEach(async () => {
    targetA = makeTarget('inst-a');
    targetB = makeTarget('inst-b');
    editorA = await createEditor(targetA, {});
    editorB = await createEditor(targetB, {});
  });

  afterEach(() => {
    try { editorA && editorA.destroy(); } catch {}
    try { editorB && editorB.destroy(); } catch {}
    removeTarget(targetA);
    removeTarget(targetB);
  });

  test('setContent on A does not affect B', () => {
    editorA.setContent('<p>Content A</p>');
    editorB.setContent('<p>Content B</p>');

    expect(editorA.getContent()).toContain('Content A');
    expect(editorB.getContent()).toContain('Content B');
    expect(editorA.getContent()).not.toContain('Content B');
    expect(editorB.getContent()).not.toContain('Content A');
  });

  test('setStyles on A does not affect B', () => {
    editorA.setStyles('body { color: red; }');
    editorB.setStyles('body { color: blue; }');

    expect(editorA.getStyles()).toBe('body { color: red; }');
    expect(editorB.getStyles()).toBe('body { color: blue; }');
  });

  test('each instance has its own EventBus', () => {
    const busA = editorA.getBus();
    const busB = editorB.getBus();
    expect(busA).not.toBe(busB);
  });

  test('bus events on A do not propagate to B', () => {
    const receivedOnB = [];
    editorB.getBus().on('test:event', (val) => receivedOnB.push(val));

    editorA.getBus().emit('test:event', 'from A');

    expect(receivedOnB).toHaveLength(0);
  });

  test('destroy on A does not affect B content', () => {
    editorB.setContent('<p>B survives</p>');
    editorA.destroy();

    expect(editorB.getContent()).toContain('B survives');
  });

  test('destroy on A leaves B fully functional (triggerSave works)', async () => {
    const saveCalls = [];
    editorB = await createEditor(targetB, {
      saveHandler: async (p) => saveCalls.push(p),
    });

    editorA.destroy();
    await editorB.triggerSave();

    expect(saveCalls.length).toBe(1);
  });

  test('destroy on A removes only its .npe-* nodes, not B nodes', () => {
    editorA.destroy();

    // B's editor shell should still be present
    expect(targetB.querySelector('.npe-editor')).not.toBeNull();
    // A's editor shell should be gone
    expect(targetA.querySelector('.npe-editor')).toBeNull();
  });

  test('setPage on A does not affect B', () => {
    editorA.setPage({ html: '<p>A page</p>', css: 'p{color:red}' });

    expect(editorA.getContent()).toContain('A page');
    expect(editorB.getContent()).not.toContain('A page');
  });

  test('theme on A is independent from B', () => {
    editorA.setTheme('dark');
    editorB.setTheme('blue');

    expect(editorA.getTheme()).toBe('dark');
    expect(editorB.getTheme()).toBe('blue');
  });
});
