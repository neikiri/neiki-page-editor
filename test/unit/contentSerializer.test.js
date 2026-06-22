/**
 * Unit tests for ContentSerializer.
 */
import { ContentSerializer } from '../../src/canvas/ContentSerializer.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ContentSerializer', () => {
  describe('constructor', () => {
    test('instantiates without arguments', () => {
      expect(() => new ContentSerializer()).not.toThrow();
    });

    test('instantiates with canvasManager and sanitizer', () => {
      const canvas = makeCanvas();
      const sanitizer = { sanitize: html => html };
      expect(() => new ContentSerializer(canvas, sanitizer)).not.toThrow();
    });
  });

  describe('getContent()', () => {
    test('returns empty string when no canvasManager provided', () => {
      const cs = new ContentSerializer();
      expect(cs.getContent()).toBe('');
    });

    test('returns body innerHTML', () => {
      const canvas = makeCanvas('<p>Hello</p>');
      const cs = new ContentSerializer(canvas);
      expect(cs.getContent()).toBe('<p>Hello</p>');
    });

    test('strips npe-prefixed overlay elements from content', () => {
      const canvas = makeCanvas('<p>Hello</p><div class="npe-overlay">editor ui</div>');
      const cs = new ContentSerializer(canvas);
      // Overlay should be excluded
      expect(cs.getContent()).toBe('<p>Hello</p>');
    });

    test('does not mutate the live DOM when stripping overlays', () => {
      const canvas = makeCanvas('<p>Text</p><div class="npe-helper">x</div>');
      const cs = new ContentSerializer(canvas);
      cs.getContent();
      // Live body should still have the overlay element
      expect(canvas.getBody().querySelector('.npe-helper')).not.toBeNull();
    });

    test('returns empty string when body is empty', () => {
      const canvas = makeCanvas('');
      const cs = new ContentSerializer(canvas);
      expect(cs.getContent()).toBe('');
    });
  });

  describe('setContent()', () => {
    test('sets body innerHTML directly (no sanitizer)', () => {
      const canvas = makeCanvas('');
      const cs = new ContentSerializer(canvas);
      cs.setContent('<p>Hello</p>');
      expect(canvas.getBody().innerHTML).toBe('<p>Hello</p>');
    });

    test('runs content through sanitizer when provided', () => {
      const canvas = makeCanvas('');
      // Use a DOMParser-based approach rather than a regex to avoid bad-tag-filter
      // and incomplete-sanitization warnings from static analysis tools.
      const sanitizer = {
        sanitize: (input) => {
          const parsed = new DOMParser().parseFromString(input, 'text/html');
          parsed.querySelectorAll('script').forEach(el => el.remove());
          return parsed.body.innerHTML;
        },
      };
      const cs = new ContentSerializer(canvas, sanitizer);
      cs.setContent('<p>Safe</p><script>evil()</script>');
      expect(canvas.getBody().innerHTML).toBe('<p>Safe</p>');
    });

    test('does nothing when canvasManager is absent', () => {
      const cs = new ContentSerializer();
      expect(() => cs.setContent('<p>test</p>')).not.toThrow();
    });

    test('round-trip: setContent then getContent returns equivalent HTML', () => {
      const canvas = makeCanvas('');
      const cs = new ContentSerializer(canvas);
      cs.setContent('<p>Hello</p>');
      expect(cs.getContent()).toBe('<p>Hello</p>');
    });

    test('round-trip preserves nested elements', () => {
      const canvas = makeCanvas('');
      const cs = new ContentSerializer(canvas);
      const html = '<h1>Title</h1><p>Para with <strong>bold</strong></p>';
      cs.setContent(html);
      expect(cs.getContent()).toBe(html);
    });
  });

  describe('getText()', () => {
    test('returns empty string when no canvasManager', () => {
      const cs = new ContentSerializer();
      expect(cs.getText()).toBe('');
    });

    test('returns plain text stripping HTML tags', () => {
      const canvas = makeCanvas('<p>Hello <strong>world</strong></p>');
      const cs = new ContentSerializer(canvas);
      expect(cs.getText()).toBe('Hello world');
    });

    test('returns empty string for empty body', () => {
      const canvas = makeCanvas('');
      const cs = new ContentSerializer(canvas);
      expect(cs.getText()).toBe('');
    });

    test('returns text from multiple block elements', () => {
      const canvas = makeCanvas('<h1>Title</h1><p>Body text</p>');
      const cs = new ContentSerializer(canvas);
      expect(cs.getText()).toContain('Title');
      expect(cs.getText()).toContain('Body text');
    });
  });

  describe('isEmpty()', () => {
    test('returns true when no canvasManager', () => {
      const cs = new ContentSerializer();
      expect(cs.isEmpty()).toBe(true);
    });

    test('returns true for empty body', () => {
      const canvas = makeCanvas('');
      const cs = new ContentSerializer(canvas);
      expect(cs.isEmpty()).toBe(true);
    });

    test('returns true for whitespace-only content', () => {
      const canvas = makeCanvas('   \n\t  ');
      const cs = new ContentSerializer(canvas);
      expect(cs.isEmpty()).toBe(true);
    });

    test('returns false when body has text content', () => {
      const canvas = makeCanvas('<p>Hello</p>');
      const cs = new ContentSerializer(canvas);
      expect(cs.isEmpty()).toBe(false);
    });

    test('returns false when body has an image (no text)', () => {
      const canvas = makeCanvas('<img src="test.jpg" alt="">');
      const cs = new ContentSerializer(canvas);
      expect(cs.isEmpty()).toBe(false);
    });

    test('returns false when body has a table', () => {
      const canvas = makeCanvas('<table><tr><td></td></tr></table>');
      const cs = new ContentSerializer(canvas);
      expect(cs.isEmpty()).toBe(false);
    });

    test('returns false when body has an hr element', () => {
      const canvas = makeCanvas('<hr>');
      const cs = new ContentSerializer(canvas);
      expect(cs.isEmpty()).toBe(false);
    });
  });
});
