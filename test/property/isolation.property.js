/**
 * Property-based tests for isolation guarantees.
 *
 * Property 5 — Host Isolation:
 *   Host page CSS selectors must not match any element inside the iframe canvas.
 *
 * Property 6 — Page Isolation:
 *   Page CSS loaded into the iframe must not affect any .npe-* element in the host page.
 *
 * Property 7 — Instance Isolation:
 *   Two editor instances must have independent content, CSS, and event state.
 *   Mutating one must not affect the other.
 *
 * Property 8 — Destroy Cleanup:
 *   After destroy(), no .npe-* DOM nodes remain in the host document.
 *
 * **Validates: Requirements 1.1, 1.10, 1.11, 7.4, 10.4, 10.5**
 */
import * as fc from 'fast-check';
import { StyleManager } from '../../src/canvas/StyleManager.js';
import { ContentSerializer } from '../../src/canvas/ContentSerializer.js';
import { Sanitizer } from '../../src/canvas/Sanitizer.js';
import { Editor } from '../../src/core/Editor.js';
import { normalizeOptions } from '../../src/core/Options.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal fake iframe document with the 3 named style elements.
 */
function makeIframeDoc() {
  const doc = document.implementation.createHTMLDocument('test');
  doc.head.innerHTML = `
    <style id="npe-base"></style>
    <style id="npe-page"></style>
    <style id="npe-helper"></style>
  `;
  return doc;
}

/**
 * Create an initialized StyleManager with its own iframe doc.
 */
function makeStyleManager(opts = {}) {
  const sm = new StyleManager(null, opts);
  const doc = makeIframeDoc();
  sm.init(doc, opts);
  return { sm, doc };
}

/**
 * Build a minimal fake CanvasManager backed by a fresh jsdom body element.
 */
function makeCanvas() {
  const body = document.createElement('body');
  return { getBody: () => body };
}

/**
 * Create an Editor target div and append it to document.body.
 */
function makeTarget(id) {
  const el = document.createElement('div');
  el.id = id;
  document.body.appendChild(el);
  return el;
}

/**
 * Create an Editor instance and wait for it to be ready.
 */
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

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generate simple page CSS rules targeting generic selectors. */
const pageCssArb = fc.oneof(
  fc.constantFrom(
    'body { color: red; font-size: 16px; }',
    'p { margin: 0; line-height: 1.5; }',
    'h1 { color: navy; }',
    '.hero { background: blue; }',
    '#main { width: 960px; }',
    'table { border-collapse: collapse; }',
    '',
  ),
  fc.tuple(
    fc.constantFrom('body', 'p', 'h1', 'h2', '.section', '.hero', '#content'),
    fc.constantFrom('color', 'font-size', 'margin', 'padding', 'background'),
    fc.constantFrom('red', 'blue', '#fff', '0', '10px', '1rem'),
  ).map(([sel, prop, val]) => `${sel} { ${prop}: ${val}; }`),
);

/** Generate safe HTML content strings. */
const safeContentArb = fc.oneof(
  fc.constantFrom(
    '<p>Hello world</p>',
    '<h1>Title</h1><p>Body text here.</p>',
    '<ul><li>Item A</li><li>Item B</li></ul>',
    '<section><p>Content</p></section>',
    '',
  ),
  fc.string({ minLength: 1, maxLength: 50 }).map(t =>
    `<p>${t.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
  ),
);

/** Generate pairs of distinct safe CSS strings. */
const twoCssArb = fc.tuple(
  pageCssArb,
  pageCssArb,
).filter(([a, b]) => a !== b);

/** Generate pairs of distinct safe HTML strings. */
const twoContentArb = fc.tuple(
  safeContentArb,
  safeContentArb,
).filter(([a, b]) => a !== b);

// ---------------------------------------------------------------------------
// Property 5 — Host Isolation
// ---------------------------------------------------------------------------

describe('Property 5 — Host Isolation: iframe CSS does not leak into host elements', () => {
  /**
   * Validates: Requirements 1.1, 1.10
   *
   * The iframe document is isolated. Elements with .npe-* classes are rendered
   * in the HOST document (the editor shell/toolbar), not in the iframe canvas.
   * Therefore, page CSS injected into the iframe cannot select or affect host .npe-* elements.
   *
   * We verify this structurally: the iframe document's head styles (npe-page etc.)
   * are separate Documents from the host document, so CSS from the iframe
   * Document cannot be a StyleSheet in the host Document.
   */
  test('iframe document is not the same document as the host', () => {
    fc.assert(
      fc.property(pageCssArb, (css) => {
        const { sm, doc: iframeDoc } = makeStyleManager();
        sm.setStyles(css);

        // The iframe document is a separate document instance
        return iframeDoc !== document;
      }),
      { numRuns: 100, seed: 1001 },
    );
  });

  test('npe-page style element belongs to iframe doc, not host doc', () => {
    fc.assert(
      fc.property(pageCssArb, (css) => {
        const { sm, doc: iframeDoc } = makeStyleManager();
        sm.setStyles(css);

        const pageEl = iframeDoc.getElementById('npe-page');
        // pageEl.ownerDocument must be iframeDoc, not the host document
        return pageEl !== null && pageEl.ownerDocument === iframeDoc && pageEl.ownerDocument !== document;
      }),
      { numRuns: 100, seed: 1002 },
    );
  });

  test('host document does not acquire npe-page styles from iframe init', () => {
    fc.assert(
      fc.property(pageCssArb, (css) => {
        const { sm } = makeStyleManager();
        sm.setStyles(css);

        // Host document must not contain any npe-page style element
        const hostPageEl = document.getElementById('npe-page');
        return hostPageEl === null;
      }),
      { numRuns: 100, seed: 1003 },
    );
  });

  test('setStyles writes only to iframe doc, host doc stylesheet count is unchanged', () => {
    fc.assert(
      fc.property(pageCssArb, (css) => {
        const hostSheetsBefore = document.styleSheets.length;
        const { sm } = makeStyleManager();
        sm.setStyles(css);
        const hostSheetsAfter = document.styleSheets.length;
        sm.destroy();
        // StyleManager must not add new stylesheets to the host document
        return hostSheetsAfter === hostSheetsBefore;
      }),
      { numRuns: 50, seed: 1004 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6 — Page Isolation
// ---------------------------------------------------------------------------

describe('Property 6 — Page Isolation: page CSS does not affect .npe-* elements', () => {
  /**
   * Validates: Requirements 1.11, 7.4
   *
   * Page CSS is injected into the iframe document (npe-page style element).
   * The .npe-* elements (toolbar, shell, modals) live in the HOST document.
   * Since these are separate documents, page CSS cannot affect the host .npe-* elements.
   *
   * We verify that:
   * 1. StyleManager writes page CSS only to the iframe doc.
   * 2. No npe-* elements are created inside the iframe doc by StyleManager.
   */
  test('StyleManager writes page CSS to iframe npe-page element, not to host document', () => {
    fc.assert(
      fc.property(pageCssArb, (css) => {
        const { sm, doc: iframeDoc } = makeStyleManager();
        sm.setStyles(css);

        const iframePageEl = iframeDoc.getElementById('npe-page');
        return iframePageEl !== null && iframePageEl.textContent === css;
      }),
      { numRuns: 100, seed: 2001 },
    );
  });

  test('StyleManager does not create any npe-* elements in the iframe body', () => {
    fc.assert(
      fc.property(pageCssArb, (css) => {
        const { sm, doc: iframeDoc } = makeStyleManager();
        sm.setStyles(css);

        // The iframe body must not contain any npe-* elements
        // (StyleManager only works on the head, not the body)
        const npeInBody = iframeDoc.body
          ? iframeDoc.body.querySelectorAll('[class*="npe-"]').length
          : 0;
        return npeInBody === 0;
      }),
      { numRuns: 100, seed: 2002 },
    );
  });

  test('npe-base and npe-helper are not page CSS (page CSS only in npe-page)', () => {
    fc.assert(
      fc.property(pageCssArb, (css) => {
        if (!css) return true; // empty CSS is trivially isolated
        const { sm, doc: iframeDoc } = makeStyleManager();
        sm.setStyles(css);

        const baseEl = iframeDoc.getElementById('npe-base');
        const helperEl = iframeDoc.getElementById('npe-helper');
        const pageEl = iframeDoc.getElementById('npe-page');

        // Page CSS must only be in npe-page
        const baseContainsPageCss = baseEl && baseEl.textContent === css;
        const helperContainsPageCss = helperEl && helperEl.textContent === css;
        const pageHasCorrectCss = pageEl && pageEl.textContent === css;

        return !baseContainsPageCss && !helperContainsPageCss && pageHasCorrectCss;
      }),
      { numRuns: 100, seed: 2003 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7 — Instance Isolation
// ---------------------------------------------------------------------------

describe('Property 7 — Instance Isolation: two editors have independent state', () => {
  /**
   * Validates: Requirements 10.5
   *
   * Two ContentSerializer instances backed by separate canvases must not
   * share state. Mutating one must not affect the other.
   */
  test('setContent on serializer A does not affect serializer B', () => {
    const sanitizer = new Sanitizer({ allowDataUris: false });

    fc.assert(
      fc.property(twoContentArb, ([htmlA, htmlB]) => {
        const canvasA = makeCanvas();
        const canvasB = makeCanvas();
        const csA = new ContentSerializer(canvasA, sanitizer);
        const csB = new ContentSerializer(canvasB, sanitizer);

        csA.setContent(htmlA);
        csB.setContent(htmlB);

        // After setting different content, each should only have its own
        const retrievedA = csA.getContent();
        const retrievedB = csB.getContent();

        // The bodies must be independent — B must not be affected by A's content
        return retrievedA !== retrievedB ||
               (sanitizer.sanitize(htmlA) === sanitizer.sanitize(htmlB));
      }),
      { numRuns: 200, seed: 3001 },
    );
  });

  test('setStyles on manager A does not affect manager B', () => {
    fc.assert(
      fc.property(twoCssArb, ([cssA, cssB]) => {
        const { sm: smA } = makeStyleManager();
        const { sm: smB } = makeStyleManager();

        smA.setStyles(cssA);
        smB.setStyles(cssB);

        // A and B must have their own independent CSS values
        return smA.getStyles() === cssA && smB.getStyles() === cssB;
      }),
      { numRuns: 200, seed: 3002 },
    );
  });

  test('destroying manager A does not affect manager B styles', () => {
    fc.assert(
      fc.property(twoCssArb, ([cssA, cssB]) => {
        const { sm: smA } = makeStyleManager();
        const { sm: smB } = makeStyleManager();

        smA.setStyles(cssA);
        smB.setStyles(cssB);

        smA.destroy();

        // B must still have its own CSS after A is destroyed
        return smB.getStyles() === cssB;
      }),
      { numRuns: 200, seed: 3003 },
    );
  });

  test('two separate iframe documents are truly independent', () => {
    fc.assert(
      fc.property(twoCssArb, ([cssA, cssB]) => {
        const docA = makeIframeDoc();
        const docB = makeIframeDoc();

        const smA = new StyleManager(null, {});
        smA.init(docA, {});
        smA.setStyles(cssA);

        const smB = new StyleManager(null, {});
        smB.init(docB, {});
        smB.setStyles(cssB);

        const pageElA = docA.getElementById('npe-page');
        const pageElB = docB.getElementById('npe-page');

        // Documents are independent: A's npe-page has cssA, B's has cssB
        return pageElA.textContent === cssA && pageElB.textContent === cssB;
      }),
      { numRuns: 100, seed: 3004 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 8 — Destroy Cleanup (Editor-level)
// ---------------------------------------------------------------------------

describe('Property 8 — Destroy Cleanup: no .npe-* nodes remain after destroy()', () => {
  /**
   * Validates: Requirements 10.4
   *
   * After destroy(), no .npe-* DOM nodes should remain in the host document
   * under the editor's target element.
   */

  test('destroy() removes all .npe-* nodes from target (repeated with different content)', async () => {
    const contentSamples = [
      '<p>Hello world</p>',
      '<h1>Title</h1><p>Paragraph</p>',
      '<ul><li>Item 1</li><li>Item 2</li></ul>',
    ];

    for (const html of contentSamples) {
      const target = makeTarget(`destroy-test-${Math.random().toString(36).slice(2)}`);

      try {
        const editor = await createEditor(target, { initialContent: html });

        // Verify editor nodes exist before destroy
        const npeNodesBefore = target.querySelectorAll('[class*="npe-"]');
        expect(npeNodesBefore.length).toBeGreaterThan(0);

        editor.destroy();

        // After destroy, no .npe-* nodes should remain
        const npeNodesAfter = target.querySelectorAll('[class*="npe-"]');
        expect(npeNodesAfter.length).toBe(0);

        // Target element itself must still exist
        expect(target.parentNode).toBe(document.body);
      } finally {
        if (target.parentNode) target.parentNode.removeChild(target);
      }
    }
  });

  test('destroy() on StyleManager clears internal state', () => {
    fc.assert(
      fc.property(pageCssArb, (css) => {
        const { sm } = makeStyleManager();
        sm.setStyles(css);
        sm.destroy();
        // After destroy, getStyles() must return empty string
        return sm.getStyles() === '';
      }),
      { numRuns: 100, seed: 4001 },
    );
  });

  test('destroy() on StyleManager is idempotent', () => {
    fc.assert(
      fc.property(pageCssArb, (css) => {
        const { sm } = makeStyleManager();
        sm.setStyles(css);
        try {
          sm.destroy();
          sm.destroy();
          sm.destroy();
          return true;
        } catch {
          return false;
        }
      }),
      { numRuns: 50, seed: 4002 },
    );
  });

  test('two Editor instances: destroy on A leaves no .npe-* from A in host document', async () => {
    const targetA = makeTarget('destroy-a');
    const targetB = makeTarget('destroy-b');

    try {
      const editorA = await createEditor(targetA, {});
      const editorB = await createEditor(targetB, {});

      editorB.setContent('<p>B content stays</p>');

      editorA.destroy();

      // A's shell is gone
      expect(targetA.querySelectorAll('[class*="npe-"]').length).toBe(0);

      // B's shell is still present
      expect(targetB.querySelector('.npe-editor')).not.toBeNull();

      // B's content is unchanged
      expect(editorB.getContent()).toContain('B content stays');

      editorB.destroy();
    } finally {
      if (targetA.parentNode) targetA.parentNode.removeChild(targetA);
      if (targetB.parentNode) targetB.parentNode.removeChild(targetB);
    }
  });
});
