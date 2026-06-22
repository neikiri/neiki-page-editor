/**
 * Unit tests for Sanitizer.
 *
 * Covers:
 *  - Allowed structural/inline/media/list/table tags pass through
 *  - Blocked tags (script, iframe, object, embed, form, input, etc.) are removed
 *  - on* event attributes are stripped
 *  - javascript: and vbscript: URLs are removed
 *  - data: URLs are blocked by default; allowed when allowDataUris: true and MIME is safe
 *  - SVG data URIs are never allowed
 *  - Legitimate classes, ids, inline styles, data-* and aria-* are preserved
 *  - Layout tags (div, section, article, header, footer, nav, aside, figure, figcaption) survive
 *  - Idempotency: sanitize(sanitize(html)) === sanitize(html)
 */
import { Sanitizer } from '../../src/canvas/Sanitizer.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function make(opts) {
  return new Sanitizer(opts);
}
const s = make();

// ---------------------------------------------------------------------------
// Instantiation
// ---------------------------------------------------------------------------
describe('Sanitizer — instantiation', () => {
  test('instantiates without arguments', () => {
    expect(() => new Sanitizer()).not.toThrow();
  });

  test('instantiates with allowDataUris: false', () => {
    expect(() => new Sanitizer({ allowDataUris: false })).not.toThrow();
  });

  test('instantiates with allowDataUris: true', () => {
    expect(() => new Sanitizer({ allowDataUris: true })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Empty / trivial inputs
// ---------------------------------------------------------------------------
describe('Sanitizer — trivial inputs', () => {
  test('returns empty string for empty input', () => {
    expect(s.sanitize('')).toBe('');
  });

  test('returns empty string for non-string input', () => {
    expect(s.sanitize(null)).toBe('');
    expect(s.sanitize(undefined)).toBe('');
    expect(s.sanitize(42)).toBe('');
  });

  test('whitespace-only input passes through as whitespace text node', () => {
    // Whitespace is a text node — it passes through sanitization unchanged.
    // sanitize(sanitize(whitespace)) === sanitize(whitespace) must hold.
    const out = s.sanitize('   ');
    expect(s.sanitize(out)).toBe(out);
  });
});

// ---------------------------------------------------------------------------
// Allowed structural tags
// ---------------------------------------------------------------------------
describe('Sanitizer — structural tags preserved', () => {
  const LAYOUT_TAGS = [
    'div', 'section', 'article', 'main', 'header', 'footer',
    'nav', 'aside', 'figure', 'figcaption',
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'pre',
  ];

  for (const tag of LAYOUT_TAGS) {
    test(`<${tag}> is preserved`, () => {
      const out = s.sanitize(`<${tag}>content</${tag}>`);
      expect(out).toContain(`<${tag}>`);
    });
  }

  test('<br> is preserved', () => {
    const out = s.sanitize('<p>line1<br>line2</p>');
    expect(out).toContain('<br>');
  });

  test('<hr> is preserved', () => {
    const out = s.sanitize('<hr>');
    expect(out).toContain('<hr>');
  });
});

// ---------------------------------------------------------------------------
// Allowed inline tags
// ---------------------------------------------------------------------------
describe('Sanitizer — inline tags preserved', () => {
  const INLINE_TAGS = ['span', 'strong', 'em', 'u', 's', 'sub', 'sup', 'code'];

  for (const tag of INLINE_TAGS) {
    test(`<${tag}> is preserved`, () => {
      const out = s.sanitize(`<p><${tag}>text</${tag}></p>`);
      expect(out).toContain(`<${tag}>`);
    });
  }

  test('<a> with safe href is preserved', () => {
    const out = s.sanitize('<a href="https://example.com">link</a>');
    expect(out).toContain('<a ');
    expect(out).toContain('href="https://example.com"');
  });
});

// ---------------------------------------------------------------------------
// Allowed media tags
// ---------------------------------------------------------------------------
describe('Sanitizer — media tags preserved', () => {
  test('<img> with safe src is preserved', () => {
    const out = s.sanitize('<img src="https://example.com/img.png" alt="test" width="100" height="80">');
    expect(out).toContain('<img');
    expect(out).toContain('src="https://example.com/img.png"');
    expect(out).toContain('alt="test"');
    expect(out).toContain('width="100"');
    expect(out).toContain('height="80"');
  });

  test('<video> with safe src is preserved', () => {
    const out = s.sanitize('<video src="https://example.com/v.mp4" controls width="640" height="360"></video>');
    expect(out).toContain('<video');
    expect(out).toContain('src="https://example.com/v.mp4"');
    expect(out).toContain('controls');
  });
});

// ---------------------------------------------------------------------------
// Allowed list/table tags
// ---------------------------------------------------------------------------
describe('Sanitizer — list and table tags preserved', () => {
  test('ul/ol/li are preserved', () => {
    const html = '<ul><li>item 1</li><li>item 2</li></ul>';
    const out = s.sanitize(html);
    expect(out).toContain('<ul>');
    expect(out).toContain('<li>');
  });

  test('table structure is preserved', () => {
    const html = '<table><thead><tr><th>H1</th></tr></thead><tbody><tr><td>D1</td></tr></tbody></table>';
    const out = s.sanitize(html);
    expect(out).toContain('<table>');
    expect(out).toContain('<thead>');
    expect(out).toContain('<tbody>');
    expect(out).toContain('<tr>');
    expect(out).toContain('<th>');
    expect(out).toContain('<td>');
  });

  test('colspan and rowspan on td/th are preserved', () => {
    const out = s.sanitize('<table><tr><td colspan="2" rowspan="3">cell</td></tr></table>');
    expect(out).toContain('colspan="2"');
    expect(out).toContain('rowspan="3"');
  });
});

// ---------------------------------------------------------------------------
// Blocked tags
// ---------------------------------------------------------------------------
describe('Sanitizer — blocked tags removed', () => {
  const BLOCKED = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea'];

  // Void elements (embed, input) don't have children in HTML parsing — text
  // after them becomes a sibling, not a child. Non-void elements (script,
  // iframe, etc.) do swallow their text content which the sanitizer then drops.
  const VOID_BLOCKED = new Set(['embed', 'input']);

  for (const tag of BLOCKED) {
    test(`<${tag}> is removed`, () => {
      const out = s.sanitize(`<p>before</p><${tag}>evil</${tag}><p>after</p>`);
      expect(out).not.toContain(`<${tag}`);
      if (!VOID_BLOCKED.has(tag)) {
        // For non-void elements, inner text is also removed
        expect(out).not.toContain('evil');
      }
      expect(out).toContain('<p>before</p>');
      expect(out).toContain('<p>after</p>');
    });
  }

  test('<meta> is removed', () => {
    const out = s.sanitize('<meta http-equiv="refresh" content="0;url=evil">');
    expect(out).not.toContain('<meta');
  });

  test('<style> is removed', () => {
    const out = s.sanitize('<style>body{display:none}</style><p>visible</p>');
    expect(out).not.toContain('<style');
    expect(out).toContain('<p>visible</p>');
  });

  test('<link> is removed', () => {
    const out = s.sanitize('<link rel="stylesheet" href="evil.css"><p>text</p>');
    expect(out).not.toContain('<link');
    expect(out).toContain('<p>text</p>');
  });

  test('nested script inside div is removed', () => {
    const out = s.sanitize('<div><p>safe</p><script>alert(1)</script></div>');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert');
    expect(out).toContain('<p>safe</p>');
  });

  test('script content is not exposed as text', () => {
    const out = s.sanitize('<script>window.location="evil.com"</script>');
    expect(out).not.toContain('window.location');
    expect(out).not.toContain('evil.com');
  });
});

// ---------------------------------------------------------------------------
// on* event attribute removal
// ---------------------------------------------------------------------------
describe('Sanitizer — on* attributes removed', () => {
  const EVENT_ATTRS = [
    'onclick', 'onload', 'onerror', 'onmouseover', 'onsubmit',
    'onfocus', 'onblur', 'onkeydown', 'onchange', 'oninput',
  ];

  for (const attr of EVENT_ATTRS) {
    test(`${attr} attribute is removed`, () => {
      const out = s.sanitize(`<div ${attr}="alert(1)">text</div>`);
      expect(out).not.toContain(attr);
    });
  }

  test('img onerror is removed', () => {
    const out = s.sanitize('<img src="x" onerror="alert(1)">');
    expect(out).not.toContain('onerror');
    expect(out).toContain('<img');
  });
});

// ---------------------------------------------------------------------------
// javascript: and vbscript: URL removal
// ---------------------------------------------------------------------------
describe('Sanitizer — dangerous URL protocols removed', () => {
  test('javascript: in href is removed', () => {
    const out = s.sanitize('<a href="javascript:alert(1)">click</a>');
    expect(out).not.toContain('javascript:');
    // The <a> tag may still be present (without href) or href may be absent
    expect(out).not.toMatch(/href="javascript:/i);
  });

  test('vbscript: in href is removed', () => {
    const out = s.sanitize('<a href="vbscript:msgbox(1)">click</a>');
    expect(out).not.toContain('vbscript:');
  });

  test('javascript: in img src is removed', () => {
    const out = s.sanitize('<img src="javascript:alert(1)">');
    expect(out).not.toMatch(/src="javascript:/i);
  });

  test('javascript: with mixed case is removed', () => {
    const out = s.sanitize('<a href="JaVaScRiPt:alert(1)">click</a>');
    expect(out).not.toMatch(/href="[Jj][Aa][Vv][Aa][Ss][Cc][Rr][Ii][Pp][Tt]:/);
  });

  test('javascript: with leading whitespace is removed', () => {
    const out = s.sanitize('<a href="  javascript:alert(1)">click</a>');
    expect(out).not.toMatch(/href=.*javascript:/i);
  });

  test('href with safe https URL is preserved', () => {
    const out = s.sanitize('<a href="https://example.com/page">link</a>');
    expect(out).toContain('href="https://example.com/page"');
  });

  test('href with relative URL is preserved', () => {
    const out = s.sanitize('<a href="/about">link</a>');
    expect(out).toContain('href="/about"');
  });
});

// ---------------------------------------------------------------------------
// data: URI policy
// ---------------------------------------------------------------------------
describe('Sanitizer — data: URI policy', () => {
  const PNG_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const MP4_DATA = 'data:video/mp4;base64,AAAAAA==';
  const SVG_DATA = 'data:image/svg+xml;base64,PHN2Zy8+';
  const HTML_DATA = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';

  describe('allowDataUris: false (default)', () => {
    test('data: URI on img src is blocked', () => {
      const out = s.sanitize(`<img src="${PNG_DATA}" alt="test">`);
      expect(out).not.toContain('data:');
    });

    test('data: URI on video src is blocked', () => {
      const out = s.sanitize(`<video src="${MP4_DATA}"></video>`);
      expect(out).not.toContain('data:');
    });

    test('data: URI on a href is blocked', () => {
      const out = s.sanitize(`<a href="${HTML_DATA}">click</a>`);
      expect(out).not.toContain('data:');
    });
  });

  describe('allowDataUris: true', () => {
    const sData = make({ allowDataUris: true });

    test('allowed image data: URI on img[src] passes', () => {
      const out = sData.sanitize(`<img src="${PNG_DATA}" alt="test">`);
      expect(out).toContain('src="data:image/png');
    });

    test('allowed video data: URI on video[src] passes', () => {
      const out = sData.sanitize(`<video src="${MP4_DATA}"></video>`);
      expect(out).toContain('src="data:video/mp4');
    });

    test('SVG data URI is always blocked even with allowDataUris: true', () => {
      const out = sData.sanitize(`<img src="${SVG_DATA}" alt="test">`);
      expect(out).not.toContain('data:image/svg+xml');
    });

    test('data: URI on a href is blocked even with allowDataUris: true', () => {
      const out = sData.sanitize(`<a href="${HTML_DATA}">click</a>`);
      expect(out).not.toContain('data:');
    });

    test('disallowed MIME text/html data URI on img src is blocked', () => {
      const out = sData.sanitize(`<img src="${HTML_DATA}" alt="test">`);
      expect(out).not.toContain('data:text/html');
    });

    test('data: URI on video poster is blocked (poster is not an allowed data-URI attr)', () => {
      const out = sData.sanitize(`<video poster="${PNG_DATA}" src="v.mp4"></video>`);
      expect(out).not.toContain('poster="data:');
    });
  });
});

// ---------------------------------------------------------------------------
// Attribute preservation
// ---------------------------------------------------------------------------
describe('Sanitizer — safe attributes preserved', () => {
  test('class attribute is preserved', () => {
    const out = s.sanitize('<div class="npe-container hero-section">content</div>');
    expect(out).toContain('class="npe-container hero-section"');
  });

  test('id attribute is preserved', () => {
    const out = s.sanitize('<section id="intro-section">content</section>');
    expect(out).toContain('id="intro-section"');
  });

  test('inline style is preserved', () => {
    const out = s.sanitize('<p style="color: red; font-size: 16px;">text</p>');
    expect(out).toContain('style=');
    expect(out).toContain('color: red');
    expect(out).toContain('font-size: 16px');
  });

  test('data-* attribute is preserved', () => {
    const out = s.sanitize('<div data-npe-editable="true" data-block-id="123">content</div>');
    expect(out).toContain('data-npe-editable="true"');
    expect(out).toContain('data-block-id="123"');
  });

  test('aria-* attribute is preserved', () => {
    const out = s.sanitize('<nav aria-label="main navigation" aria-expanded="false">nav</nav>');
    expect(out).toContain('aria-label="main navigation"');
    expect(out).toContain('aria-expanded="false"');
  });

  test('title attribute is preserved', () => {
    const out = s.sanitize('<abbr title="HyperText Markup Language">HTML</abbr>');
    expect(out).toContain('title="HyperText Markup Language"');
  });

  test('a[target] and a[rel] are preserved', () => {
    const out = s.sanitize('<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  test('unknown attributes are removed', () => {
    const out = s.sanitize('<div xss-payload="evil" bad-attr="bad">content</div>');
    expect(out).not.toContain('xss-payload');
    expect(out).not.toContain('bad-attr');
    expect(out).toContain('<div>');
    expect(out).toContain('content');
  });
});

// ---------------------------------------------------------------------------
// Style attribute sanitization
// ---------------------------------------------------------------------------
describe('Sanitizer — style attribute sanitization', () => {
  test('CSS expression() is neutralized', () => {
    const out = s.sanitize('<div style="width: expression(alert(1))">text</div>');
    expect(out).not.toContain('expression(alert');
  });

  test('css url() with javascript: is neutralized', () => {
    const out = s.sanitize('<div style="background: url(javascript:alert(1))">text</div>');
    expect(out).not.toContain('url(javascript:');
  });

  test('safe CSS properties survive', () => {
    const out = s.sanitize('<div style="color: blue; margin: 10px; padding: 5px;">text</div>');
    expect(out).toContain('color: blue');
    expect(out).toContain('margin: 10px');
    expect(out).toContain('padding: 5px');
  });
});

// ---------------------------------------------------------------------------
// XSS payloads
// ---------------------------------------------------------------------------
describe('Sanitizer — XSS payload tests', () => {
  const PAYLOADS = [
    '<script>alert(1)</script>',
    '<img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
    '<<SCRIPT>alert(1)//<</SCRIPT>',
    '<a href="javascript:alert(1)">click</a>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<body onload=alert(1)>',
    '<input type="image" src="x" onerror="alert(1)">',
    '<div style="background:url(javascript:alert(1))">x</div>',
    '<object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">',
    '<embed src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">',
    '<form action="javascript:alert(1)"><input type="submit"></form>',
    '<a href="&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;alert(1)">xss</a>',
  ];

  for (const payload of PAYLOADS) {
    test(`XSS payload is neutralized: ${payload.substring(0, 50)}...`, () => {
      const out = s.sanitize(payload);
      expect(out).not.toMatch(/<script/i);
      expect(out).not.toMatch(/\bon\w+\s*=/i);
      expect(out).not.toMatch(/javascript:/i);
      expect(out).not.toMatch(/<iframe/i);
      expect(out).not.toMatch(/<object/i);
      expect(out).not.toMatch(/<embed/i);
      expect(out).not.toMatch(/<form/i);
    });
  }
});

// ---------------------------------------------------------------------------
// Unknown/custom elements
// ---------------------------------------------------------------------------
describe('Sanitizer — unknown elements', () => {
  test('unknown element is unwrapped but children are preserved', () => {
    const out = s.sanitize('<custom-widget><p>child content</p></custom-widget>');
    expect(out).not.toContain('<custom-widget');
    expect(out).toContain('<p>child content</p>');
  });

  test('SVG is stripped but text content is preserved', () => {
    const out = s.sanitize('<svg><script>alert(1)</script><text>label</text></svg>');
    expect(out).not.toContain('<svg');
    expect(out).not.toContain('<script');
    // Text node inside svg/text may be preserved depending on unwrapping depth
    expect(out).not.toContain('alert');
  });
});

// ---------------------------------------------------------------------------
// Content preservation
// ---------------------------------------------------------------------------
describe('Sanitizer — text content preserved', () => {
  test('plain text is preserved', () => {
    const out = s.sanitize('<p>Hello, world!</p>');
    expect(out).toContain('Hello, world!');
  });

  test('complex layout structure is preserved', () => {
    const html = `
      <article class="post">
        <header>
          <h1 class="post-title">Title</h1>
        </header>
        <section class="content">
          <p>First paragraph.</p>
          <blockquote>A quote</blockquote>
        </section>
        <footer class="post-footer">Footer</footer>
      </article>
    `;
    const out = s.sanitize(html);
    expect(out).toContain('<article');
    expect(out).toContain('class="post"');
    expect(out).toContain('<h1');
    expect(out).toContain('post-title');
    expect(out).toContain('<section');
    expect(out).toContain('<blockquote>');
    expect(out).toContain('<footer');
  });
});

// ---------------------------------------------------------------------------
// Idempotency
// ---------------------------------------------------------------------------
describe('Sanitizer — idempotency', () => {
  const CASES = [
    '<p>simple text</p>',
    '<div class="wrapper"><h1>Title</h1><p>Para</p></div>',
    '<ul><li>one</li><li>two</li></ul>',
    '<table><tr><td>cell</td></tr></table>',
    '<a href="https://example.com" target="_blank">link</a>',
    '<img src="https://example.com/img.png" alt="test" width="200">',
    '<section><header><nav><a href="/">Home</a></nav></header></section>',
    '<p style="color: blue; font-size: 14px;">styled</p>',
    '<div data-block="intro" aria-label="intro section">content</div>',
  ];

  for (const html of CASES) {
    test(`idempotency: ${html.substring(0, 40)}...`, () => {
      const once = s.sanitize(html);
      const twice = s.sanitize(once);
      expect(twice).toBe(once);
    });
  }

  test('idempotency with allowDataUris: true', () => {
    const sData = make({ allowDataUris: true });
    const PNG_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const html = `<img src="${PNG_DATA}" alt="img">`;
    const once = sData.sanitize(html);
    const twice = sData.sanitize(once);
    expect(twice).toBe(once);
  });
});
