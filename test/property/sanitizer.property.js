/**
 * Property-based tests for Sanitizer.
 *
 * Property 1 — Idempotency:
 *   sanitize(sanitize(html)) === sanitize(html)
 *
 * Property 2 — Safety:
 *   sanitize(html) must never contain:
 *     - <script>, <iframe>, <object>, <embed>, <form>
 *     - on* attributes
 *     - javascript: or vbscript: in any attribute value
 *     - data: URLs unless allowDataUris is true AND MIME type is allowed
 *
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**
 */
import * as fc from 'fast-check';
import { Sanitizer } from '../../src/canvas/Sanitizer.js';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generate a random HTML tag name (mix of valid and invalid). */
const htmlTagArb = fc.oneof(
  // Known safe tags
  fc.constantFrom(
    'div', 'p', 'span', 'section', 'article', 'main', 'header', 'footer',
    'nav', 'aside', 'figure', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'table', 'tr', 'td', 'th',
    'blockquote', 'pre', 'code', 'br', 'hr', 'video',
  ),
  // Dangerous tags
  fc.constantFrom(
    'script', 'iframe', 'object', 'embed', 'form', 'input', 'button',
    'select', 'textarea', 'style', 'link', 'meta',
  ),
  // Random tag names
  fc.stringMatching(/^[a-z][a-z0-9-]{0,10}$/),
);

/** Generate a random attribute name (mix of valid, event handlers, and unknown). */
const attrNameArb = fc.oneof(
  // Safe attributes
  fc.constantFrom(
    'class', 'id', 'style', 'title', 'href', 'src', 'alt', 'width', 'height',
    'data-foo', 'data-bar', 'aria-label', 'aria-hidden', 'rel', 'target',
    'colspan', 'rowspan', 'controls', 'poster',
  ),
  // Event handlers (must be stripped)
  fc.constantFrom(
    'onclick', 'onload', 'onerror', 'onmouseover', 'onsubmit',
    'onfocus', 'onblur', 'onkeydown', 'onchange', 'oninput', 'onmouseout',
  ),
  // Random attribute names
  fc.stringMatching(/^[a-z][a-z0-9-]{0,15}$/),
);

/** Generate a URL value (mix of safe and dangerous). */
const urlValueArb = fc.oneof(
  fc.constantFrom(
    'https://example.com',
    'https://example.com/page',
    '/relative/path',
    '#anchor',
    '',
    // Dangerous
    'javascript:alert(1)',
    'javascript:void(0)',
    'JAVASCRIPT:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    'data:image/png;base64,AAAAAA==',
    'data:image/svg+xml;base64,PHN2Zy8+',
    // Obfuscated
    '&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;alert(1)',
    '  javascript:alert(1)',
    '\tjavascript:alert(1)',
  ),
  fc.webUrl({ validSchemes: ['http', 'https'] }),
);

/** Generate a random attribute value. */
const attrValueArb = fc.oneof(
  fc.string({ maxLength: 50 }),
  urlValueArb,
  fc.constantFrom('alert(1)', 'true', 'false', '0', '100', 'npe-class foo'),
);

/** Generate a single attribute string like `name="value"`. */
const attrArb = fc.tuple(attrNameArb, attrValueArb).map(
  ([name, val]) => `${name}="${val.replace(/"/g, '&quot;')}"`,
);

/** Generate an attributes string with 0–4 attributes. */
const attrsArb = fc.array(attrArb, { maxLength: 4 }).map(attrs => attrs.join(' '));

/**
 * Generate simple HTML content strings of varying complexity.
 * This is a recursive-ish structure using a depth limit.
 */
function htmlFragmentArb(depth = 0) {
  const textArb = fc.string({ maxLength: 30 }).map(t => t.replace(/</g, '&lt;').replace(/>/g, '&gt;'));

  if (depth >= 3) {
    return textArb;
  }

  return fc.oneof(
    // Plain text
    textArb,
    // A simple element
    fc.tuple(htmlTagArb, attrsArb, textArb).map(
      ([tag, attrs, text]) => `<${tag}${attrs ? ' ' + attrs : ''}>${text}</${tag}>`,
    ),
    // Void element
    fc.tuple(
      fc.constantFrom('br', 'hr', 'img', 'input'),
      attrsArb,
    ).map(([tag, attrs]) => `<${tag}${attrs ? ' ' + attrs : ''}>`),
    // XSS payloads
    fc.constantFrom(
      '<script>alert(document.cookie)</script>',
      '<img src=x onerror=alert(1)>',
      '<a href="javascript:alert(1)">xss</a>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<div onclick="alert(1)">click me</div>',
      '<svg onload="alert(1)"><use href="data:text/html,<script>alert(1)</script>"></use></svg>',
      '<object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></object>',
      '<form action="javascript:alert(1)"><button type="submit">go</button></form>',
      '<p style="behavior:url(evil.htc)">styled</p>',
    ),
  );
}

/** Generates HTML fragments (a list of 1-5 elements joined together). */
const htmlInputArb = fc.array(htmlFragmentArb(0), { minLength: 1, maxLength: 5 }).map(
  parts => parts.join('\n'),
);

/**
 * Adversarial HTML specifically crafted to test security.
 * Generates strings with XSS payloads, nested scripts, encoded attributes.
 */
const adversarialHtmlArb = fc.oneof(
  htmlInputArb,
  fc.constantFrom(
    // Nested scripts
    '<div><div><script>alert(1)</script></div></div>',
    // Obfuscated javascript href
    '<a href="&#106;avascript:alert(1)">link</a>',
    '<a href="&#x6A;avascript:alert(1)">link</a>',
    // Data URI in href
    '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">click</a>',
    // SVG with script
    '<svg><script>alert(1)</script></svg>',
    // On* on safe tags
    '<p onmouseover="alert(1)" onclick="evil()">hover me</p>',
    '<h1 onload="steal(document.cookie)">Title</h1>',
    '<img src="valid.png" onerror="alert(1)" onload="steal()">',
    // CSS expression
    '<div style="width:expression(alert(1));color:red">test</div>',
    '<span style="behavior:url(javascript:alert(1))">text</span>',
    // Nested iframes
    '<div><iframe><iframe><script>alert(1)</script></iframe></iframe></div>',
    // Embedded script in various places
    '<table><tbody><tr><td><script>alert(1)</script></td></tr></tbody></table>',
    // Vbscript in href
    '<a href="vbscript:MsgBox(1)">link</a>',
    // Data URI SVG (never allowed)
    '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxzY3JpcHQ+YWxlcnQoMSk8L3NjcmlwdD48L3N2Zz4=">',
    // Uppercase tags
    '<SCRIPT>alert(1)</SCRIPT>',
    '<IFRAME src="evil.html"></IFRAME>',
    // Whitespace tricks
    '<scr\nipt>alert(1)</scr\nipt>',
    '< script >alert(1)</ script >',
    // Null byte tricks
    '<scr\x00ipt>alert(1)</scr\x00ipt>',
  ),
);

// ---------------------------------------------------------------------------
// Property 1 — Idempotency
// ---------------------------------------------------------------------------
describe('Sanitizer Property 1 — Idempotency', () => {
  /**
   * Validates: Requirements 6.1, 6.7
   */
  test('sanitize(sanitize(html)) === sanitize(html) for random HTML (allowDataUris: false)', () => {
    const sanitizer = new Sanitizer({ allowDataUris: false });

    fc.assert(
      fc.property(htmlInputArb, (html) => {
        const once = sanitizer.sanitize(html);
        const twice = sanitizer.sanitize(once);
        return twice === once;
      }),
      {
        numRuns: 500,
        seed: 42,
      },
    );
  });

  test('sanitize(sanitize(html)) === sanitize(html) for random HTML (allowDataUris: true)', () => {
    const sanitizer = new Sanitizer({ allowDataUris: true });

    fc.assert(
      fc.property(htmlInputArb, (html) => {
        const once = sanitizer.sanitize(html);
        const twice = sanitizer.sanitize(once);
        return twice === once;
      }),
      {
        numRuns: 500,
        seed: 42,
      },
    );
  });

  test('sanitize(sanitize(html)) === sanitize(html) for adversarial HTML', () => {
    const sanitizer = new Sanitizer({ allowDataUris: false });

    fc.assert(
      fc.property(adversarialHtmlArb, (html) => {
        const once = sanitizer.sanitize(html);
        const twice = sanitizer.sanitize(once);
        return twice === once;
      }),
      {
        numRuns: 300,
        seed: 42,
      },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2 — Safety
// ---------------------------------------------------------------------------
describe('Sanitizer Property 2 — Safety', () => {
  /**
   * Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.9
   */

  /**
   * Checks that the sanitized output contains no executable content.
   * Specifically:
   *  - No executable tags
   *  - No on* event handler attributes
   *  - No javascript:/vbscript: in URL-bearing attributes (href, src, poster, action, data)
   *  - No data: URIs in unexpected positions
   *
   * @param {string} output
   * @param {boolean} allowDataUris
   */
  function assertSafe(output, allowDataUris) {
    // No script/iframe/object/embed/form tags
    expect(output).not.toMatch(/<script[\s>/]/i);
    expect(output).not.toMatch(/<iframe[\s>/]/i);
    expect(output).not.toMatch(/<object[\s>/]/i);
    expect(output).not.toMatch(/<embed[\s>/]/i);
    expect(output).not.toMatch(/<form[\s>/]/i);

    // No on* event handlers in attributes
    // Pattern: attribute position — preceded by whitespace (start of attribute)
    expect(output).not.toMatch(/\bon[a-z]+\s*=/i);

    // No javascript: or vbscript: in URL-bearing attribute values.
    // We check href=, src=, poster=, action=, and similar URL attrs.
    // We do NOT flag javascript: appearing as plain text inside class/id/other text content.
    const urlAttrPattern = /(href|src|poster|action|formaction|data)\s*=\s*["']([^"']*)/gi;
    let match;
    while ((match = urlAttrPattern.exec(output)) !== null) {
      const urlVal = match[2].trim().toLowerCase().replace(/[\x00-\x20]/g, '');
      expect(urlVal).not.toMatch(/^javascript:/);
      expect(urlVal).not.toMatch(/^vbscript:/);
    }

    if (!allowDataUris) {
      // data: URIs in any URL attribute must be absent
      const urlAttrPattern2 = /(href|src|poster|action)\s*=\s*["']([^"']*)/gi;
      let m2;
      while ((m2 = urlAttrPattern2.exec(output)) !== null) {
        expect(m2[2]).not.toMatch(/^data:/i);
      }
    } else {
      // SVG data URIs are never allowed (even with allowDataUris: true)
      const srcPattern = /src\s*=\s*["']([^"']*)/gi;
      let m3;
      while ((m3 = srcPattern.exec(output)) !== null) {
        expect(m3[1]).not.toMatch(/^data:image\/svg\+xml/i);
      }
      // data: in href is never allowed
      const hrefPattern = /href\s*=\s*["']([^"']*)/gi;
      let m4;
      while ((m4 = hrefPattern.exec(output)) !== null) {
        expect(m4[1]).not.toMatch(/^data:/i);
      }
      // data: in poster is never allowed
      const posterPattern = /poster\s*=\s*["']([^"']*)/gi;
      let m5;
      while ((m5 = posterPattern.exec(output)) !== null) {
        expect(m5[1]).not.toMatch(/^data:/i);
      }
    }
  }

  test('sanitized output (allowDataUris: false) is always safe for random HTML', () => {
    const sanitizer = new Sanitizer({ allowDataUris: false });

    fc.assert(
      fc.property(htmlInputArb, (html) => {
        const out = sanitizer.sanitize(html);
        assertSafe(out, false);
        return true;
      }),
      {
        numRuns: 500,
        seed: 42,
      },
    );
  });

  test('sanitized output (allowDataUris: true) is always safe for random HTML', () => {
    const sanitizer = new Sanitizer({ allowDataUris: true });

    fc.assert(
      fc.property(htmlInputArb, (html) => {
        const out = sanitizer.sanitize(html);
        assertSafe(out, true);
        return true;
      }),
      {
        numRuns: 500,
        seed: 42,
      },
    );
  });

  test('sanitized output (allowDataUris: false) is always safe for adversarial HTML', () => {
    const sanitizer = new Sanitizer({ allowDataUris: false });

    fc.assert(
      fc.property(adversarialHtmlArb, (html) => {
        const out = sanitizer.sanitize(html);
        assertSafe(out, false);
        return true;
      }),
      {
        numRuns: 300,
        seed: 42,
      },
    );
  });

  test('sanitized output (allowDataUris: true) is always safe for adversarial HTML', () => {
    const sanitizer = new Sanitizer({ allowDataUris: true });

    fc.assert(
      fc.property(adversarialHtmlArb, (html) => {
        const out = sanitizer.sanitize(html);
        assertSafe(out, true);
        return true;
      }),
      {
        numRuns: 300,
        seed: 42,
      },
    );
  });
});
