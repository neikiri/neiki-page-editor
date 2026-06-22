/**
 * Unit tests for SourceViewModal.
 */
import { jest } from '@jest/globals';
import { SourceViewModal } from '../../src/modals/modals/SourceViewModal.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeI18n() {
  return { t: (k) => k };
}

function makeSerializer(html = '<p>Hello</p>') {
  const setContent = jest.fn();
  return {
    getContent: () => html,
    setContent,
  };
}

function makeStyleManager(css = 'body { color: red; }') {
  const setStyles = jest.fn();
  return {
    getStyles: () => css,
    setStyles,
  };
}

function makeSanitizer() {
  return {
    sanitize: (html) => html, // pass-through for tests
  };
}

function makeModal(overrides = {}) {
  const hostEl = document.createElement('div');
  document.body.appendChild(hostEl);

  return {
    modal: new SourceViewModal({
      contentSerializer: makeSerializer(),
      styleManager: makeStyleManager(),
      sanitizer: makeSanitizer(),
      i18n: makeI18n(),
      hostEl,
      ...overrides,
    }),
    hostEl,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SourceViewModal — instantiation', () => {
  test('instantiates without arguments', () => {
    expect(() => new SourceViewModal()).not.toThrow();
  });

  test('open() does not throw', () => {
    const { modal } = makeModal();
    expect(() => modal.open()).not.toThrow();
    modal.close();
  });

  test('close() does not throw when not open', () => {
    const modal = new SourceViewModal();
    expect(() => modal.close()).not.toThrow();
  });
});

describe('SourceViewModal — DOM structure', () => {
  test('open() appends modal to host element', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    expect(hostEl.querySelector('.npe-source-modal')).not.toBeNull();
    modal.close();
  });

  test('open() appends backdrop to host element', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    expect(hostEl.querySelector('.npe-modal-backdrop')).not.toBeNull();
    modal.close();
  });

  test('modal has role="dialog"', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const el = hostEl.querySelector('.npe-source-modal');
    expect(el.getAttribute('role')).toBe('dialog');
    modal.close();
  });

  test('modal has aria-modal="true"', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const el = hostEl.querySelector('.npe-source-modal');
    expect(el.getAttribute('aria-modal')).toBe('true');
    modal.close();
  });

  test('modal contains HTML and CSS textareas', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const textareas = hostEl.querySelectorAll('textarea');
    expect(textareas.length).toBeGreaterThanOrEqual(2);
    modal.close();
  });

  test('HTML textarea is populated with current content', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const textareas = hostEl.querySelectorAll('textarea');
    const htmlArea = Array.from(textareas).find(t => t.value.includes('<p>Hello</p>'));
    expect(htmlArea).not.toBeUndefined();
    modal.close();
  });

  test('CSS textarea is populated with current styles', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const textareas = hostEl.querySelectorAll('textarea');
    const cssArea = Array.from(textareas).find(t => t.value.includes('color: red'));
    expect(cssArea).not.toBeUndefined();
    modal.close();
  });
});

describe('SourceViewModal — close behaviour', () => {
  test('close() removes modal from DOM', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    modal.close();
    expect(hostEl.querySelector('.npe-source-modal')).toBeNull();
  });

  test('close() removes backdrop from DOM', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    modal.close();
    expect(hostEl.querySelector('.npe-modal-backdrop')).toBeNull();
  });

  test('Escape key closes the modal', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    expect(hostEl.querySelector('.npe-source-modal')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(hostEl.querySelector('.npe-source-modal')).toBeNull();
  });

  test('cancel button closes the modal', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const cancelBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.textContent.includes('cancel') || b.textContent.includes('modal.source.cancel'));
    if (cancelBtn) cancelBtn.click();
    expect(hostEl.querySelector('.npe-source-modal')).toBeNull();
  });
});

describe('SourceViewModal — apply behaviour', () => {
  test('apply writes sanitized HTML to the serializer', () => {
    const setContent = jest.fn();
    const serializer = { getContent: () => '<p>Hello</p>', setContent };
    const setStyles = jest.fn();
    const styleManager = { getStyles: () => '', setStyles };
    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    const modal = new SourceViewModal({
      contentSerializer: serializer,
      styleManager,
      sanitizer: makeSanitizer(),
      i18n: makeI18n(),
      hostEl,
    });
    modal.open();

    // Change textarea content
    const htmlArea = hostEl.querySelector('textarea[aria-label="modal.source.html"]');
    if (htmlArea) {
      htmlArea.value = '<p>Updated</p>';
    }

    // Click Apply
    const applyBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.textContent.includes('modal.source.apply'));
    if (applyBtn) applyBtn.click();

    expect(setContent).toHaveBeenCalled();
  });

  test('apply writes CSS to the style manager', () => {
    const setContent = jest.fn();
    const serializer = { getContent: () => '', setContent };
    const setStyles = jest.fn();
    const styleManager = { getStyles: () => 'h1 { color: blue; }', setStyles };
    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    const modal = new SourceViewModal({
      contentSerializer: serializer,
      styleManager,
      sanitizer: makeSanitizer(),
      i18n: makeI18n(),
      hostEl,
    });
    modal.open();

    const cssArea = hostEl.querySelector('textarea[aria-label="modal.source.css"]');
    if (cssArea) {
      cssArea.value = 'h1 { color: green; }';
    }

    const applyBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.textContent.includes('modal.source.apply'));
    if (applyBtn) applyBtn.click();

    expect(setStyles).toHaveBeenCalled();
  });

  test('apply sanitizes HTML before writing to serializer', () => {
    const setContent = jest.fn();
    const serializer = { getContent: () => '', setContent };
    const sanitizeFn = jest.fn((html) => html.replace(/<script[^>]*>.*?<\/script>/gi, ''));
    const sanitizer = { sanitize: sanitizeFn };
    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    const modal = new SourceViewModal({
      contentSerializer: serializer,
      styleManager: makeStyleManager(''),
      sanitizer,
      i18n: makeI18n(),
      hostEl,
    });
    modal.open();

    const htmlArea = hostEl.querySelector('textarea[aria-label="modal.source.html"]');
    if (htmlArea) {
      htmlArea.value = '<p>Safe</p><script>evil()</script>';
    }

    const applyBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.textContent.includes('modal.source.apply'));
    if (applyBtn) applyBtn.click();

    expect(sanitizeFn).toHaveBeenCalled();
  });
});

describe('SourceViewModal — double open guard', () => {
  test('calling open() twice does not add two modals', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    modal.open(); // second call should be ignored
    const modals = hostEl.querySelectorAll('.npe-source-modal');
    expect(modals.length).toBe(1);
    modal.close();
  });
});

describe('SourceViewModal — destroy', () => {
  test('destroy() removes the modal if open', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    modal.destroy();
    expect(hostEl.querySelector('.npe-source-modal')).toBeNull();
  });

  test('destroy() is idempotent', () => {
    const modal = new SourceViewModal();
    expect(() => {
      modal.destroy();
      modal.destroy();
    }).not.toThrow();
  });
});
