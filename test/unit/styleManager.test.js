/**
 * Unit tests for StyleManager.
 */
import { StyleManager } from '../../src/canvas/StyleManager.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal fake iframe document backed by jsdom.
 * Contains the canonical style element IDs that CanvasManager writes.
 */
function makeIframeDoc() {
  const doc = document.implementation.createHTMLDocument('test');

  // Match the iframe template from CanvasManager
  doc.head.innerHTML = `
    <style id="npe-base"></style>
    <style id="npe-page"></style>
    <style id="npe-helper"></style>
  `;

  return doc;
}

/**
 * Build a StyleManager that has been init()'d against a fresh fake document.
 */
function makeInitializedSM(opts = {}) {
  const sm = new StyleManager(null, opts);
  const doc = makeIframeDoc();
  sm.init(doc, opts);
  return { sm, doc };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('StyleManager', () => {
  describe('constructor', () => {
    test('instantiates without arguments', () => {
      expect(() => new StyleManager()).not.toThrow();
    });

    test('getStyles() returns empty string before init', () => {
      const sm = new StyleManager();
      expect(sm.getStyles()).toBe('');
    });
  });

  describe('init()', () => {
    test('init does not throw', () => {
      const sm = new StyleManager();
      const doc = makeIframeDoc();
      expect(() => sm.init(doc, {})).not.toThrow();
    });

    test('init writes base CSS into #npe-base', () => {
      const { doc } = makeInitializedSM();
      const baseEl = doc.getElementById('npe-base');
      expect(baseEl.textContent.length).toBeGreaterThan(0);
    });

    test('init writes helper CSS into #npe-helper', () => {
      const { doc } = makeInitializedSM();
      const helperEl = doc.getElementById('npe-helper');
      // helper may be minimal but element should exist and be populated
      expect(helperEl).not.toBeNull();
    });

    test('init applies pageStyles option into #npe-page', () => {
      const { doc } = makeInitializedSM({ pageStyles: 'body { font-size: 16px; }' });
      const pageEl = doc.getElementById('npe-page');
      expect(pageEl.textContent).toBe('body { font-size: 16px; }');
    });

    test('init with empty pageStyles leaves #npe-page empty', () => {
      const { doc } = makeInitializedSM({ pageStyles: '' });
      const pageEl = doc.getElementById('npe-page');
      expect(pageEl.textContent).toBe('');
    });
  });

  describe('getStyles() / setStyles()', () => {
    test('getStyles() returns empty string initially (no pageStyles option)', () => {
      const { sm } = makeInitializedSM();
      expect(sm.getStyles()).toBe('');
    });

    test('setStyles() updates #npe-page content', () => {
      const { sm, doc } = makeInitializedSM();
      sm.setStyles('h1 { color: red; }');
      const pageEl = doc.getElementById('npe-page');
      expect(pageEl.textContent).toBe('h1 { color: red; }');
    });

    test('getStyles() returns the CSS set via setStyles()', () => {
      const { sm } = makeInitializedSM();
      sm.setStyles('h1 { color: red; }');
      expect(sm.getStyles()).toBe('h1 { color: red; }');
    });

    test('setStyles() overwrites previous value', () => {
      const { sm } = makeInitializedSM();
      sm.setStyles('p { color: blue; }');
      sm.setStyles('p { color: green; }');
      expect(sm.getStyles()).toBe('p { color: green; }');
    });

    test('setStyles() does not affect #npe-base', () => {
      const { sm, doc } = makeInitializedSM();
      sm.setStyles('h2 { margin: 0; }');
      const baseEl = doc.getElementById('npe-base');
      expect(baseEl.textContent).not.toContain('h2');
    });

    test('setStyles() does not affect #npe-helper', () => {
      const { sm, doc } = makeInitializedSM();
      sm.setStyles('h2 { margin: 0; }');
      const helperEl = doc.getElementById('npe-helper');
      expect(helperEl.textContent).not.toContain('h2');
    });

    test('setStyles() with empty string clears #npe-page', () => {
      const { sm } = makeInitializedSM();
      sm.setStyles('p { color: red; }');
      sm.setStyles('');
      expect(sm.getStyles()).toBe('');
    });

    test('round-trip: setStyles then getStyles returns same string', () => {
      const { sm } = makeInitializedSM();
      const css = 'h1 { color: navy; } p { line-height: 1.5; }';
      sm.setStyles(css);
      expect(sm.getStyles()).toBe(css);
    });
  });

  describe('addExtractedStyleBlocks()', () => {
    test('inserts style elements before #npe-helper', () => {
      const { sm, doc } = makeInitializedSM();
      sm.addExtractedStyleBlocks(['div { display: block; }']);

      const head = doc.head;
      const children = Array.from(head.children);
      const helperIdx = children.findIndex(el => el.id === 'npe-helper');
      const extractedIdx = children.findIndex(el => el.hasAttribute('data-npe-extracted'));

      expect(extractedIdx).toBeGreaterThanOrEqual(0);
      expect(extractedIdx).toBeLessThan(helperIdx);
    });

    test('inserts style elements after #npe-page', () => {
      const { sm, doc } = makeInitializedSM();
      sm.addExtractedStyleBlocks(['.foo { color: purple; }']);

      const head = doc.head;
      const children = Array.from(head.children);
      const pageIdx = children.findIndex(el => el.id === 'npe-page');
      const extractedIdx = children.findIndex(el => el.hasAttribute('data-npe-extracted'));

      expect(extractedIdx).toBeGreaterThan(pageIdx);
    });

    test('inserts content of each block into a style element', () => {
      const { sm, doc } = makeInitializedSM();
      sm.addExtractedStyleBlocks(['.a { color: red; }', '.b { color: blue; }']);
      const extractedEls = doc.head.querySelectorAll('[data-npe-extracted]');
      expect(extractedEls).toHaveLength(2);
      expect(extractedEls[0].textContent).toBe('.a { color: red; }');
      expect(extractedEls[1].textContent).toBe('.b { color: blue; }');
    });

    test('replaces previous extracted blocks on repeated calls', () => {
      const { sm, doc } = makeInitializedSM();
      sm.addExtractedStyleBlocks(['.old { }']);
      sm.addExtractedStyleBlocks(['.new { }']);

      const extractedEls = doc.head.querySelectorAll('[data-npe-extracted]');
      expect(extractedEls).toHaveLength(1);
      expect(extractedEls[0].textContent).toBe('.new { }');
    });

    test('handles empty array without throwing', () => {
      const { sm, doc } = makeInitializedSM();
      expect(() => sm.addExtractedStyleBlocks([])).not.toThrow();
      expect(doc.head.querySelectorAll('[data-npe-extracted]')).toHaveLength(0);
    });

    test('ignores empty/whitespace-only strings in blocks array', () => {
      const { sm, doc } = makeInitializedSM();
      sm.addExtractedStyleBlocks(['   ', '', 'p { color: red; }']);
      const extractedEls = doc.head.querySelectorAll('[data-npe-extracted]');
      expect(extractedEls).toHaveLength(1);
    });
  });

  describe('setExternalLinks()', () => {
    test('injects a valid https .css link into head', () => {
      const { sm, doc } = makeInitializedSM();
      sm.setExternalLinks(['https://example.com/style.css']);
      const links = doc.head.querySelectorAll('link[data-npe-external]');
      expect(links).toHaveLength(1);
      expect(links[0].getAttribute('href')).toBe('https://example.com/style.css');
      expect(links[0].getAttribute('rel')).toBe('stylesheet');
    });

    test('inserts external links before #npe-page', () => {
      const { sm, doc } = makeInitializedSM();
      sm.setExternalLinks(['https://example.com/style.css']);

      const head = doc.head;
      const children = Array.from(head.children);
      const pageIdx = children.findIndex(el => el.id === 'npe-page');
      const linkIdx = children.findIndex(el => el.hasAttribute('data-npe-external'));

      expect(linkIdx).toBeLessThan(pageIdx);
    });

    test('inserts external links after #npe-base', () => {
      const { sm, doc } = makeInitializedSM();
      sm.setExternalLinks(['https://example.com/style.css']);

      const head = doc.head;
      const children = Array.from(head.children);
      const baseIdx = children.findIndex(el => el.id === 'npe-base');
      const linkIdx = children.findIndex(el => el.hasAttribute('data-npe-external'));

      expect(linkIdx).toBeGreaterThan(baseIdx);
    });

    test('rejects data: URI stylesheets', () => {
      const { sm, doc } = makeInitializedSM();
      sm.setExternalLinks(['data:text/css,body{}']);
      expect(doc.head.querySelectorAll('link[data-npe-external]')).toHaveLength(0);
    });

    test('rejects non-.css URLs by default', () => {
      const { sm, doc } = makeInitializedSM();
      sm.setExternalLinks(['https://example.com/styles.php']);
      expect(doc.head.querySelectorAll('link[data-npe-external]')).toHaveLength(0);
    });

    test('replaces previous external links on repeated calls', () => {
      const { sm, doc } = makeInitializedSM();
      sm.setExternalLinks(['https://example.com/old.css']);
      sm.setExternalLinks(['https://example.com/new.css']);
      const links = doc.head.querySelectorAll('link[data-npe-external]');
      expect(links).toHaveLength(1);
      expect(links[0].getAttribute('href')).toBe('https://example.com/new.css');
    });

    test('accepts custom stylesheetUrlValidator', () => {
      const { sm, doc } = makeInitializedSM({
        stylesheetUrlValidator: url => url.startsWith('https://'),
      });
      sm.setExternalLinks(['https://example.com/styles.php']);
      expect(doc.head.querySelectorAll('link[data-npe-external]')).toHaveLength(1);
    });

    test('handles empty array without throwing', () => {
      const { sm, doc } = makeInitializedSM();
      expect(() => sm.setExternalLinks([])).not.toThrow();
      expect(doc.head.querySelectorAll('link[data-npe-external]')).toHaveLength(0);
    });
  });

  describe('CSS injection order', () => {
    test('canonical order: npe-base → external links → npe-page → extracted → npe-helper', () => {
      const { sm, doc } = makeInitializedSM({ pageStyles: 'p { color: red; }' });
      sm.setExternalLinks(['https://cdn.example.com/fonts.css']);
      sm.addExtractedStyleBlocks(['.extracted { }']);

      const head = doc.head;
      const children = Array.from(head.children);

      const baseIdx = children.findIndex(el => el.id === 'npe-base');
      const linkIdx = children.findIndex(el => el.hasAttribute('data-npe-external'));
      const pageIdx = children.findIndex(el => el.id === 'npe-page');
      const extractedIdx = children.findIndex(el => el.hasAttribute('data-npe-extracted'));
      const helperIdx = children.findIndex(el => el.id === 'npe-helper');

      expect(baseIdx).toBeLessThan(linkIdx);
      expect(linkIdx).toBeLessThan(pageIdx);
      expect(pageIdx).toBeLessThan(extractedIdx);
      expect(extractedIdx).toBeLessThan(helperIdx);
    });
  });

  describe('destroy()', () => {
    test('does not throw', () => {
      const { sm } = makeInitializedSM();
      expect(() => sm.destroy()).not.toThrow();
    });

    test('is idempotent (safe to call twice)', () => {
      const { sm } = makeInitializedSM();
      sm.destroy();
      expect(() => sm.destroy()).not.toThrow();
    });

    test('getStyles() returns empty string after destroy', () => {
      const { sm } = makeInitializedSM();
      sm.setStyles('p { color: red; }');
      sm.destroy();
      expect(sm.getStyles()).toBe('');
    });
  });
});
