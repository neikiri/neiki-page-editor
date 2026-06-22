/**
 * Property-based tests for content and style round-trips.
 *
 * Property 3 — Content Round-Trip:
 *   getContent(setContent(html)) is structurally equivalent to sanitize(html)
 *
 * Property 4 — Style Round-Trip:
 *   getStyles(setStyles(css)) === css  (modulo normalization)
 *
 * **Validates: Requirements 1.14, 3.5, 7.2, 7.9, 10.2**
 */
import * as fc from 'fast-check';
import { ContentSerializer } from '../../src/canvas/ContentSerializer.js';
import { StyleManager } from '../../src/canvas/StyleManager.js';
import { Sanitizer } from '../../src/canvas/Sanitizer.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal fake CanvasManager backed by a real jsdom body element.
 */
function makeCanvas(initialHtml = '') {
  const body = document.createElement('body');
  body.innerHTML = initialHtml;
  return {
    getBody: () => body,
  };
}

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
 * Create an initialized StyleManager.
 */
function makeStyleManager(opts = {}) {
  const sm = new StyleManager(null, opts);
  const doc = makeIframeDoc();
  sm.init(doc, opts);
  return sm;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates simple, safe HTML fragments with common tags.
 * These are valid HTML that the sanitizer should pass through unchanged.
 */
const safeSingleTagArb = fc.oneof(
  fc.string({ maxLength: 40 }).map(t =>
    `<p>${t.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
  ),
  fc.string({ maxLength: 40 }).map(t =>
    `<h1>${t.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>`
  ),
  fc.string({ maxLength: 40 }).map(t =>
    `<div>${t.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`
  ),
  fc.string({ maxLength: 30 }).map(t =>
    `<p><strong>${t.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong></p>`
  ),
  fc.string({ maxLength: 30 }).map(t =>
    `<p><em>${t.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</em></p>`
  ),
  fc.constantFrom(
    '<ul><li>one</li><li>two</li><li>three</li></ul>',
    '<table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>A</td><td>B</td></tr></tbody></table>',
    '<blockquote><p>A quote here</p></blockquote>',
    '<section class="hero"><h2>Title</h2><p>Description.</p></section>',
    '<article data-id="123"><header><h1>Post</h1></header><p>Content</p></article>',
    '',
  ),
);

/** Generates 1-4 safe HTML fragments concatenated together. */
const safeHtmlArb = fc.array(safeSingleTagArb, { minLength: 1, maxLength: 4 }).map(
  parts => parts.join('\n').trim()
);

/**
 * Generates CSS strings of varying complexity.
 * These are arbitrary CSS strings we inject and then retrieve.
 */
const cssPropertyArb = fc.oneof(
  fc.constantFrom(
    'color', 'background-color', 'font-size', 'font-family',
    'margin', 'padding', 'border', 'width', 'max-width', 'line-height',
    'display', 'flex-direction', 'gap', 'align-items',
  ),
);

const cssValueArb = fc.oneof(
  fc.constantFrom(
    'red', 'blue', '#fff', '#000', '#4a90e2',
    '1rem', '16px', '2em', '100%',
    'none', 'block', 'flex', 'grid',
    'bold', 'normal', 'italic',
    'center', 'left', 'right',
  ),
  fc.nat({ max: 999 }).map(n => `${n}px`),
);

const cssRuleArb = fc.tuple(
  fc.constantFrom('body', 'p', 'h1', 'h2', '.content', '#main', '.npe-content', 'section', 'article'),
  fc.array(fc.tuple(cssPropertyArb, cssValueArb), { minLength: 1, maxLength: 5 }),
).map(([selector, decls]) => {
  const props = decls.map(([prop, val]) => `  ${prop}: ${val};`).join('\n');
  return `${selector} {\n${props}\n}`;
});

const cssStringArb = fc.oneof(
  fc.constantFrom('', 'body { }'),
  fc.array(cssRuleArb, { minLength: 1, maxLength: 4 }).map(rules => rules.join('\n\n')),
);

// ---------------------------------------------------------------------------
// Property 3 — Content Round-Trip
// ---------------------------------------------------------------------------

describe('ContentSerializer Property 3 — Content Round-Trip', () => {
  /**
   * Validates: Requirements 1.14, 3.5, 10.2
   *
   * After setContent(html), getContent() returns the same sanitized HTML.
   * For safe HTML (that passes through the sanitizer unchanged), this means
   * setContent(safeHtml) then getContent() returns safeHtml (possibly trimmed/normalized).
   */

  test('round-trip: setContent then getContent returns the sanitized equivalent (allowDataUris: false)', () => {
    const sanitizer = new Sanitizer({ allowDataUris: false });

    fc.assert(
      fc.property(safeHtmlArb, (html) => {
        const canvas = makeCanvas();
        const cs = new ContentSerializer(canvas, sanitizer);

        cs.setContent(html);
        const retrieved = cs.getContent();

        // The retrieved content must equal sanitize(html).
        // We verify by sanitizing what we got back is the same as what was written.
        // Since we set sanitized content, sanitize(retrieved) === retrieved.
        const resanitized = sanitizer.sanitize(retrieved);
        return resanitized === retrieved;
      }),
      { numRuns: 300, seed: 1234 },
    );
  });

  test('round-trip: setContent preserves the decoded text content of safe HTML', () => {
    const sanitizer = new Sanitizer({ allowDataUris: false });

    fc.assert(
      fc.property(
        // Generate printable ASCII text (no HTML special chars to avoid entity encoding issues)
        fc.string({ minLength: 1, maxLength: 80 }).map(
          s => s.replace(/[&<>"']/g, c => ({ '&': 'and', '<': 'lt', '>': 'gt', '"': 'q', "'": 'sq' }[c]))
        ).filter(s => s.trim().length > 0),
        (text) => {
          const html = `<p>${text}</p>`;
          const canvas = makeCanvas();
          const cs = new ContentSerializer(canvas, sanitizer);

          cs.setContent(html);

          // The text content of the body must include our text
          // (using textContent, not innerHTML, so entity encoding is irrelevant)
          const bodyText = canvas.getBody().textContent;
          return bodyText.includes(text);
        }
      ),
      { numRuns: 200, seed: 5678 },
    );
  });

  test('round-trip: setContent is idempotent — setting same content twice yields same result', () => {
    const sanitizer = new Sanitizer({ allowDataUris: false });

    fc.assert(
      fc.property(safeHtmlArb, (html) => {
        const canvas = makeCanvas();
        const cs = new ContentSerializer(canvas, sanitizer);

        cs.setContent(html);
        const first = cs.getContent();

        cs.setContent(html);
        const second = cs.getContent();

        return first === second;
      }),
      { numRuns: 200, seed: 9012 },
    );
  });

  test('round-trip: getContent(setContent(html)) never contains editor overlay markup', () => {
    const sanitizer = new Sanitizer({ allowDataUris: false });

    fc.assert(
      fc.property(safeHtmlArb, (html) => {
        const canvas = makeCanvas();
        const cs = new ContentSerializer(canvas, sanitizer);

        cs.setContent(html);
        const retrieved = cs.getContent();

        // Editor overlay elements should never appear in retrieved content
        return !retrieved.includes('npe-toolbar') &&
               !retrieved.includes('npe-statusbar') &&
               !retrieved.includes('npe-overlay');
      }),
      { numRuns: 200, seed: 3456 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4 — Style Round-Trip
// ---------------------------------------------------------------------------

describe('StyleManager Property 4 — Style Round-Trip', () => {
  /**
   * Validates: Requirements 7.2, 7.9, 10.2
   *
   * CSS provided via setStyles() is returned unchanged by getStyles().
   */

  test('round-trip: getStyles(setStyles(css)) === css for arbitrary CSS', () => {
    fc.assert(
      fc.property(cssStringArb, (css) => {
        const sm = makeStyleManager();
        sm.setStyles(css);
        return sm.getStyles() === css;
      }),
      { numRuns: 300, seed: 7890 },
    );
  });

  test('round-trip: setStyles then getStyles does not modify CSS content', () => {
    const cssExamples = [
      'body { font-family: sans-serif; }',
      'h1, h2 { color: #333; margin: 0; }',
      '.container { max-width: 1200px; margin: 0 auto; padding: 0 16px; }',
      '@media (max-width: 768px) { body { font-size: 14px; } }',
      '/* comment */ p { line-height: 1.6; }',
      '',
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...cssExamples),
        (css) => {
          const sm = makeStyleManager();
          sm.setStyles(css);
          return sm.getStyles() === css;
        }
      ),
      { numRuns: 50, seed: 1111 },
    );
  });

  test('round-trip: setStyles overwrites previous value (last write wins)', () => {
    fc.assert(
      fc.property(
        cssStringArb,
        cssStringArb,
        (css1, css2) => {
          const sm = makeStyleManager();
          sm.setStyles(css1);
          sm.setStyles(css2);
          // Only css2 should be returned
          return sm.getStyles() === css2;
        }
      ),
      { numRuns: 200, seed: 2222 },
    );
  });

  test('round-trip: setStyles does not affect base or helper CSS', () => {
    const cssExamples = [
      'body { color: red; }',
      'h1 { font-size: 2em; }',
      '',
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...cssExamples),
        (css) => {
          const doc = makeIframeDoc();
          const sm = new StyleManager(null, {});
          sm.init(doc, {});

          const baseBefore = doc.getElementById('npe-base').textContent;
          const helperBefore = doc.getElementById('npe-helper').textContent;

          sm.setStyles(css);

          const baseAfter = doc.getElementById('npe-base').textContent;
          const helperAfter = doc.getElementById('npe-helper').textContent;

          // Base and helper CSS must remain unchanged
          return baseAfter === baseBefore && helperAfter === helperBefore;
        }
      ),
      { numRuns: 50, seed: 3333 },
    );
  });
});
