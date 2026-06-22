/**
 * Sanitizer — DOMParser-based allowlist sanitizer.
 *
 * Uses an element/attribute allowlist approach. Never uses regex to strip HTML.
 * Idempotent: sanitize(sanitize(html)) === sanitize(html).
 */

/** Elements that are always removed, including all their children. */
const BLOCKED_TAGS = new Set([
  'script', 'iframe', 'object', 'embed', 'form', 'input', 'button',
  'select', 'textarea', 'meta', 'base', 'link', 'style', 'head',
  'noscript', 'template', 'slot', 'canvas', 'applet', 'frame', 'frameset',
]);

/** Elements that are allowed through (children are still walked). */
const ALLOWED_TAGS = new Set([
  // Structural
  'div', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside',
  'figure', 'figcaption', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'hr', 'br',
  // Inline
  'span', 'strong', 'em', 'u', 's', 'sub', 'sup', 'code', 'a',
  // Media
  'img', 'video',
  // Lists
  'ul', 'ol', 'li',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  // Misc safe
  'caption', 'colgroup', 'col', 'details', 'summary', 'mark', 'small',
  'abbr', 'cite', 'q', 'del', 'ins', 'kbd', 'samp', 'var', 'time',
  'address', 'bdi', 'bdo', 'ruby', 'rt', 'rp', 'wbr', 'data',
]);

/**
 * Attributes globally allowed on any element (plus element-specific ones below).
 * data-* and aria-* are handled by prefix checks.
 */
const ALLOWED_ATTRS_GLOBAL = new Set([
  'class', 'id', 'style', 'title', 'lang', 'dir', 'tabindex',
]);

/** Per-element additional allowed attributes. */
const ALLOWED_ATTRS_BY_TAG = {
  a:     new Set(['href', 'target', 'rel', 'download']),
  img:   new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding', 'srcset', 'sizes']),
  video: new Set(['src', 'poster', 'controls', 'width', 'height', 'autoplay', 'muted', 'loop', 'preload']),
  td:    new Set(['colspan', 'rowspan', 'headers']),
  th:    new Set(['colspan', 'rowspan', 'scope', 'headers', 'abbr']),
  col:   new Set(['span']),
  colgroup: new Set(['span']),
  time:  new Set(['datetime']),
  ins:   new Set(['cite', 'datetime']),
  del:   new Set(['cite', 'datetime']),
  ol:    new Set(['start', 'reversed', 'type']),
  li:    new Set(['value']),
  details: new Set(['open']),
  // Deprecated but commonly used by CMS content
  table: new Set(['cellpadding', 'cellspacing', 'border', 'summary', 'width']),
};

/**
 * URL-bearing attributes that need protocol validation.
 * Map: attrName → set of tags it applies to (null = any tag).
 */
const URL_ATTRS = {
  href:   null,  // any tag (a)
  src:    null,  // any tag (img, video)
  poster: null,  // video
  action: null,  // form — blocked anyway but in case
  data:   null,  // object — blocked anyway
};

/** Allowed data: URI MIME types per element (only when allowDataUris: true). */
const ALLOWED_DATA_URI_MIME = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif',
  'video/mp4', 'video/webm',
]);

/** Tags/attrs where data: is allowed (when allowDataUris: true). */
const DATA_URI_ALLOWED_TAGS = new Set(['img', 'video']);
const DATA_URI_ALLOWED_ATTR = 'src';

/** Dangerous URL protocol pattern (used in isSafeUrl). */
const DATA_URI_RE = /^\s*data:([^;,]+)[;,]/i;

/**
 * Check whether a URL value is safe.
 *
 * @param {string} value
 * @param {string} tagName
 * @param {string} attrName
 * @param {boolean} allowDataUris
 * @returns {boolean}
 */
function isSafeUrl(value, tagName, attrName, allowDataUris) {
  const trimmed = value.trim();

  // Check for data: URI first
  if (/^\s*data:/i.test(trimmed)) {
    if (!allowDataUris) return false;
    // Only allowed on img[src] and video[src]
    if (!DATA_URI_ALLOWED_TAGS.has(tagName) || attrName !== DATA_URI_ALLOWED_ATTR) {
      return false;
    }
    // Check MIME type
    const match = trimmed.match(DATA_URI_RE);
    if (!match) return false;
    const mime = match[1].trim().toLowerCase();
    return ALLOWED_DATA_URI_MIME.has(mime);
  }

  // Block javascript: and vbscript: (and any encoded form)
  // Decode HTML entities and strip whitespace/control chars for comparison
  const decoded = trimmed.replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
                          .replace(/&#([0-9]+);?/gi, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
                          .replace(/[\x00-\x20]/g, '');

  if (/^(javascript|vbscript):/i.test(decoded)) return false;

  return true;
}

/**
 * Determine whether an attribute name is in the allowed set for a given tag.
 *
 * @param {string} attrName  lowercase attribute name
 * @param {string} tagName   lowercase tag name
 * @returns {boolean}
 */
function isAllowedAttr(attrName, tagName) {
  // Block all on* event handlers
  if (/^on/i.test(attrName)) return false;

  // Global allowlist
  if (ALLOWED_ATTRS_GLOBAL.has(attrName)) return true;

  // data-* and aria-* prefixes
  if (/^data-[a-z]/i.test(attrName)) return true;
  if (/^aria-[a-z]/i.test(attrName)) return true;

  // Per-element allowlist
  const tagAttrs = ALLOWED_ATTRS_BY_TAG[tagName];
  if (tagAttrs && tagAttrs.has(attrName)) return true;

  return false;
}

/**
 * Walk and sanitize a DOM subtree in-place.
 * Returns an array of safe child nodes to append to the output fragment.
 *
 * @param {Node} node
 * @param {Document} doc
 * @param {boolean} allowDataUris
 * @returns {Node[]}
 */
function sanitizeNode(node, doc, allowDataUris) {
  if (node.nodeType === Node.TEXT_NODE) {
    return [doc.createTextNode(node.textContent)];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    // Drop comments, processing instructions, etc.
    return [];
  }

  const tagName = node.tagName.toLowerCase();

  // Hard block: remove element and all its children
  if (BLOCKED_TAGS.has(tagName)) {
    return [];
  }

  // Unknown element: skip the element but still recurse into children (preserves text)
  const isKnown = ALLOWED_TAGS.has(tagName);

  const safeChildren = [];
  for (const child of Array.from(node.childNodes)) {
    safeChildren.push(...sanitizeNode(child, doc, allowDataUris));
  }

  if (!isKnown) {
    // Unwrap: return children directly without the unknown wrapper element
    return safeChildren;
  }

  // Create a clean element of the same type
  const clean = doc.createElement(tagName);

  // Copy allowed attributes
  for (const attr of Array.from(node.attributes)) {
    const name = attr.name.toLowerCase();
    const value = attr.value;

    if (!isAllowedAttr(name, tagName)) continue;

    // Validate URLs
    if (name in URL_ATTRS || name === 'src' || name === 'href' || name === 'poster') {
      if (!isSafeUrl(value, tagName, name, allowDataUris)) continue;
    }

    // Validate style attribute: strip expressions and url() with dangerous protocols
    if (name === 'style') {
      const safeStyle = sanitizeStyleAttr(value);
      if (safeStyle) {
        clean.setAttribute('style', safeStyle);
      }
      continue;
    }

    clean.setAttribute(name, value);
  }

  for (const child of safeChildren) {
    clean.appendChild(child);
  }

  return [clean];
}

/**
 * Sanitize a CSS style attribute value.
 * Strips javascript: expressions and dangerous url() values.
 *
 * @param {string} styleValue
 * @returns {string}
 */
function sanitizeStyleAttr(styleValue) {
  if (!styleValue) return '';

  // Remove javascript/vbscript expressions (expression(...) is IE-specific)
  let safe = styleValue.replace(/expression\s*\(/gi, 'BLOCKED(');

  // Remove url() with dangerous protocols
  safe = safe.replace(/url\s*\(\s*(['"]?)(javascript|vbscript|data):[^)]*\1\s*\)/gi, 'url(about:blank)');

  return safe;
}

/**
 * Sanitizer class — DOMParser-based allowlist sanitizer.
 *
 * Usage:
 *   const s = new Sanitizer({ allowDataUris: false });
 *   const safeHtml = s.sanitize(untrustedHtml);
 */
export class Sanitizer {
  /**
   * @param {{ allowDataUris?: boolean }} [opts]
   */
  constructor(opts = {}) {
    this._allowDataUris = opts.allowDataUris === true;
  }

  /**
   * Sanitize an HTML string and return safe HTML.
   *
   * @param {string} html
   * @returns {string}
   */
  sanitize(html) {
    if (typeof html !== 'string') return '';
    if (html === '') return '';

    let doc;
    try {
      doc = new DOMParser().parseFromString(html, 'text/html');
    } catch {
      return '';
    }

    // Create a fresh document fragment to hold the result
    const outputDoc = document.implementation.createHTMLDocument('');
    const fragment = outputDoc.createDocumentFragment();

    // Walk the body children (not the body itself)
    const body = doc.body;
    if (!body) return '';

    for (const child of Array.from(body.childNodes)) {
      const safeNodes = sanitizeNode(child, outputDoc, this._allowDataUris);
      for (const n of safeNodes) {
        fragment.appendChild(n);
      }
    }

    // Serialize each top-level safe node via outerHTML (for elements) or
    // escaped nodeValue (for text nodes). Every element in the fragment was
    // constructed from scratch by createElement/setAttribute — no untrusted
    // string was ever assigned to innerHTML — so outerHTML is safe to read.
    const parts = [];
    for (const n of Array.from(fragment.childNodes)) {
      if (n.nodeType === Node.TEXT_NODE) {
        // Escape text node content so it serialises as plain text, not HTML.
        parts.push(
          (n.nodeValue || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;'),
        );
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        // outerHTML is safe: the element was built entirely via
        // createElement/setAttribute with sanitized values.
        parts.push(n.outerHTML);
      }
    }
    return parts.join('').trim();
  }
}

export default Sanitizer;
