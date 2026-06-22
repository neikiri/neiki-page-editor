/**
 * Unit tests for FullHtmlParser.
 */
import { FullHtmlParser, defaultStylesheetUrlValidator } from '../../src/canvas/FullHtmlParser.js';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FullHtmlParser', () => {
  let parser;

  beforeEach(() => {
    parser = new FullHtmlParser();
  });

  describe('constructor', () => {
    test('instantiates without error', () => {
      expect(() => new FullHtmlParser()).not.toThrow();
    });
  });

  describe('parse() — return shape', () => {
    test('always returns bodyHtml, styleBlocks, cssUrls keys', () => {
      const result = parser.parse('<html><body><p>Hi</p></body></html>');
      expect(result).toHaveProperty('bodyHtml');
      expect(result).toHaveProperty('styleBlocks');
      expect(result).toHaveProperty('cssUrls');
    });

    test('styleBlocks is always an array', () => {
      const result = parser.parse('<html><body></body></html>');
      expect(Array.isArray(result.styleBlocks)).toBe(true);
    });

    test('cssUrls is always an array', () => {
      const result = parser.parse('<html><body></body></html>');
      expect(Array.isArray(result.cssUrls)).toBe(true);
    });

    test('returns empty payload for null input', () => {
      const result = parser.parse(null);
      expect(result).toEqual({ bodyHtml: '', styleBlocks: [], cssUrls: [] });
    });

    test('returns empty payload for empty string', () => {
      const result = parser.parse('');
      expect(result).toEqual({ bodyHtml: '', styleBlocks: [], cssUrls: [] });
    });
  });

  describe('parse() — body extraction', () => {
    test('extracts body innerHTML', () => {
      const result = parser.parse('<html><body><p>Hello world</p></body></html>');
      expect(result.bodyHtml).toBe('<p>Hello world</p>');
    });

    test('extracts nested body content', () => {
      const html = '<html><body><h1>Title</h1><p>Para <strong>bold</strong></p></body></html>';
      const result = parser.parse(html);
      expect(result.bodyHtml).toContain('<h1>Title</h1>');
      expect(result.bodyHtml).toContain('<strong>bold</strong>');
    });

    test('returns empty bodyHtml for document with no body content', () => {
      const result = parser.parse('<html><head><title>Test</title></head><body></body></html>');
      expect(result.bodyHtml.trim()).toBe('');
    });

    test('extracts body from minimal HTML fragment', () => {
      const result = parser.parse('<p>Simple fragment</p>');
      // DOMParser wraps fragments in body
      expect(result.bodyHtml).toContain('Simple fragment');
    });
  });

  describe('parse() — style block extraction', () => {
    test('extracts a single <style> block from head', () => {
      const html = `<html>
        <head><style>body { color: red; }</style></head>
        <body><p>Hi</p></body>
      </html>`;
      const result = parser.parse(html);
      expect(result.styleBlocks).toHaveLength(1);
      expect(result.styleBlocks[0]).toContain('color: red');
    });

    test('extracts multiple <style> blocks from head', () => {
      const html = `<html>
        <head>
          <style>.a { color: red; }</style>
          <style>.b { color: blue; }</style>
        </head>
        <body></body>
      </html>`;
      const result = parser.parse(html);
      expect(result.styleBlocks).toHaveLength(2);
      expect(result.styleBlocks[0]).toContain('.a');
      expect(result.styleBlocks[1]).toContain('.b');
    });

    test('ignores empty <style> blocks', () => {
      const html = '<html><head><style>   </style></head><body></body></html>';
      const result = parser.parse(html);
      expect(result.styleBlocks).toHaveLength(0);
    });

    test('returns empty styleBlocks when no style elements present', () => {
      const result = parser.parse('<html><body><p>Test</p></body></html>');
      expect(result.styleBlocks).toHaveLength(0);
    });
  });

  describe('parse() — CSS URL extraction', () => {
    test('extracts valid https .css link', () => {
      const html = `<html>
        <head>
          <link rel="stylesheet" href="https://example.com/style.css">
        </head>
        <body></body>
      </html>`;
      const result = parser.parse(html);
      expect(result.cssUrls).toContain('https://example.com/style.css');
    });

    test('extracts valid http .css link', () => {
      const html = `<html>
        <head>
          <link rel="stylesheet" href="http://example.com/styles.css">
        </head>
        <body></body>
      </html>`;
      const result = parser.parse(html);
      expect(result.cssUrls).toContain('http://example.com/styles.css');
    });

    test('extracts multiple valid stylesheet links', () => {
      const html = `<html>
        <head>
          <link rel="stylesheet" href="https://cdn.example.com/a.css">
          <link rel="stylesheet" href="https://cdn.example.com/b.css">
        </head>
        <body></body>
      </html>`;
      const result = parser.parse(html);
      expect(result.cssUrls).toHaveLength(2);
    });

    test('rejects data: URI stylesheets', () => {
      const html = `<html>
        <head>
          <link rel="stylesheet" href="data:text/css,body{color:red}">
        </head>
        <body></body>
      </html>`;
      const result = parser.parse(html);
      expect(result.cssUrls).toHaveLength(0);
    });

    test('rejects javascript: protocol stylesheets', () => {
      const html = `<html>
        <head>
          <link rel="stylesheet" href="javascript:alert(1)">
        </head>
        <body></body>
      </html>`;
      const result = parser.parse(html);
      expect(result.cssUrls).toHaveLength(0);
    });

    test('rejects non-.css URLs by default', () => {
      const html = `<html>
        <head>
          <link rel="stylesheet" href="https://example.com/style.php">
        </head>
        <body></body>
      </html>`;
      const result = parser.parse(html);
      expect(result.cssUrls).toHaveLength(0);
    });

    test('ignores <link> elements that are not rel="stylesheet"', () => {
      const html = `<html>
        <head>
          <link rel="icon" href="https://example.com/favicon.ico">
          <link rel="preload" href="https://example.com/font.css">
        </head>
        <body></body>
      </html>`;
      const result = parser.parse(html);
      // preload is not rel="stylesheet"
      expect(result.cssUrls).toHaveLength(0);
    });

    test('accepts custom stylesheetUrlValidator', () => {
      const html = `<html>
        <head>
          <link rel="stylesheet" href="https://example.com/styles.php?v=2">
        </head>
        <body></body>
      </html>`;
      const result = parser.parse(html, {
        stylesheetUrlValidator: url => url.startsWith('https://'),
      });
      expect(result.cssUrls).toContain('https://example.com/styles.php?v=2');
    });

    test('supports CSS URL with query string ending in .css path', () => {
      const html = `<html>
        <head>
          <link rel="stylesheet" href="https://example.com/styles.css?v=123">
        </head>
        <body></body>
      </html>`;
      const result = parser.parse(html);
      expect(result.cssUrls).toContain('https://example.com/styles.css?v=123');
    });
  });

  describe('parse() — combined extraction', () => {
    test('extracts body, style blocks, and CSS URLs from a full document', () => {
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="https://cdn.example.com/theme.css">
  <style>h1 { color: navy; }</style>
</head>
<body>
  <h1>Page Title</h1>
  <p>Content paragraph</p>
</body>
</html>`;
      const result = parser.parse(html);
      expect(result.bodyHtml).toContain('<h1>Page Title</h1>');
      expect(result.styleBlocks).toHaveLength(1);
      expect(result.styleBlocks[0]).toContain('h1 { color: navy; }');
      expect(result.cssUrls).toContain('https://cdn.example.com/theme.css');
    });
  });
});

describe('defaultStylesheetUrlValidator', () => {
  test('accepts https URL ending in .css', () => {
    expect(defaultStylesheetUrlValidator('https://example.com/style.css')).toBe(true);
  });

  test('accepts http URL ending in .css', () => {
    expect(defaultStylesheetUrlValidator('http://example.com/style.css')).toBe(true);
  });

  test('accepts .css URL with query string', () => {
    expect(defaultStylesheetUrlValidator('https://example.com/style.css?v=2')).toBe(true);
  });

  test('accepts .css URL with hash', () => {
    expect(defaultStylesheetUrlValidator('https://example.com/style.css#section')).toBe(true);
  });

  test('accepts relative .css path', () => {
    expect(defaultStylesheetUrlValidator('/assets/style.css')).toBe(true);
  });

  test('rejects data: URIs', () => {
    expect(defaultStylesheetUrlValidator('data:text/css,body{}')).toBe(false);
  });

  test('rejects javascript: URIs', () => {
    expect(defaultStylesheetUrlValidator('javascript:void(0)')).toBe(false);
  });

  test('rejects ftp: URIs', () => {
    expect(defaultStylesheetUrlValidator('ftp://example.com/style.css')).toBe(false);
  });

  test('rejects URLs not ending in .css', () => {
    expect(defaultStylesheetUrlValidator('https://example.com/style.php')).toBe(false);
  });

  test('rejects empty string', () => {
    expect(defaultStylesheetUrlValidator('')).toBe(false);
  });

  test('rejects null', () => {
    expect(defaultStylesheetUrlValidator(null)).toBe(false);
  });
});
