/**
 * FullHtmlParser — parses complete HTML documents into safe editor payload pieces.
 *
 * Given a full HTML string (e.g. from a CMS), extracts:
 *  - bodyHtml: the innerHTML of <body>
 *  - styleBlocks: array of text content from <style> elements in <head>
 *  - cssUrls: validated <link rel="stylesheet"> hrefs
 */
export class FullHtmlParser {
  /**
   * Parse a full HTML document string.
   *
   * @param {string} fullHtml
   * @param {{ stylesheetUrlValidator?: ((url: string) => boolean)|null }} [options]
   * @returns {{ bodyHtml: string, styleBlocks: string[], cssUrls: string[] }}
   */
  parse(fullHtml, options = {}) {
    if (!fullHtml || typeof fullHtml !== 'string') {
      return { bodyHtml: '', styleBlocks: [], cssUrls: [] };
    }

    const validator = (options && typeof options.stylesheetUrlValidator === 'function')
      ? options.stylesheetUrlValidator
      : _defaultStylesheetUrlValidator;

    let doc;
    try {
      const parser = new DOMParser();
      doc = parser.parseFromString(fullHtml, 'text/html');
    } catch {
      return { bodyHtml: '', styleBlocks: [], cssUrls: [] };
    }

    // ── Body HTML ────────────────────────────────────────────────────────────
    const bodyHtml = doc.body ? doc.body.innerHTML : '';

    // ── Style blocks from <head> <style> elements ────────────────────────────
    const styleBlocks = [];
    const headStyleEls = doc.head
      ? Array.from(doc.head.querySelectorAll('style'))
      : [];
    for (const styleEl of headStyleEls) {
      const content = styleEl.textContent;
      if (content && content.trim()) {
        styleBlocks.push(content);
      }
    }

    // Also collect <style> elements that appear directly in body (not inside page content)
    // These are unusual but possible in some CMS outputs; we collect and lift them.
    const bodyStyleEls = doc.body
      ? Array.from(doc.body.querySelectorAll('style'))
      : [];
    for (const styleEl of bodyStyleEls) {
      const content = styleEl.textContent;
      if (content && content.trim()) {
        styleBlocks.push(content);
      }
    }

    // ── Stylesheet links ─────────────────────────────────────────────────────
    const cssUrls = [];
    const allLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    for (const link of allLinks) {
      const href = link.getAttribute('href');
      if (href && validator(href)) {
        cssUrls.push(href);
      }
    }

    return { bodyHtml, styleBlocks, cssUrls };
  }
}

// ─── Default validator ────────────────────────────────────────────────────────

/**
 * Default stylesheet URL validator.
 * Rejects:
 *  - Non-HTTP/HTTPS protocols
 *  - data: URIs
 *  - URLs not ending in .css (unless they include a query/hash, which is allowed for CDNs)
 *
 * @param {string} url
 * @returns {boolean}
 */
function _defaultStylesheetUrlValidator(url) {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();

  // Reject data URIs
  if (/^data:/i.test(trimmed)) return false;

  // Must start with http:// or https:// (absolute) or be a relative path
  // Reject javascript:, vbscript:, ftp:, etc.
  const protocolMatch = trimmed.match(/^([a-z][a-z0-9+\-.]*):\/\//i);
  if (protocolMatch) {
    const protocol = protocolMatch[1].toLowerCase();
    if (protocol !== 'http' && protocol !== 'https') return false;
  }

  // Path (without query/hash) must end in .css
  let path = trimmed;
  const hashIdx = path.indexOf('#');
  if (hashIdx !== -1) path = path.slice(0, hashIdx);
  const queryIdx = path.indexOf('?');
  if (queryIdx !== -1) path = path.slice(0, queryIdx);

  return path.endsWith('.css');
}

export { _defaultStylesheetUrlValidator as defaultStylesheetUrlValidator };
export default FullHtmlParser;
