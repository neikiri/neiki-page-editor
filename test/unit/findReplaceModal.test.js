/**
 * Unit tests for FindReplaceModal.
 */
import { FindReplaceModal } from '../../src/modals/modals/FindReplaceModal.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeI18n() {
  return { t: (k) => k };
}

/**
 * Build a minimal fake CanvasManager backed by a real jsdom document.
 * @param {string} bodyHtml
 */
function makeCanvas(bodyHtml = '') {
  const doc = document.implementation.createHTMLDocument('test');
  doc.body.innerHTML = bodyHtml;
  return {
    getDocument: () => doc,
    getBody: () => doc.body,
  };
}

function makeModal(overrides = {}) {
  const canvas = makeCanvas('<p>Hello world. Hello again.</p>');
  const hostEl = document.createElement('div');
  document.body.appendChild(hostEl);

  return {
    modal: new FindReplaceModal({
      canvasManager: canvas,
      i18n: makeI18n(),
      hostEl,
      ...overrides,
    }),
    canvas,
    hostEl,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FindReplaceModal — instantiation', () => {
  test('instantiates without arguments', () => {
    expect(() => new FindReplaceModal()).not.toThrow();
  });

  test('open() does not throw', () => {
    const { modal } = makeModal();
    expect(() => modal.open()).not.toThrow();
    modal.close();
  });

  test('close() does not throw when not open', () => {
    const modal = new FindReplaceModal();
    expect(() => modal.close()).not.toThrow();
  });
});

describe('FindReplaceModal — DOM structure', () => {
  test('open() appends modal to host element', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    expect(hostEl.querySelector('.npe-find-replace-modal')).not.toBeNull();
    modal.close();
  });

  test('modal has role="dialog"', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const el = hostEl.querySelector('.npe-find-replace-modal');
    expect(el.getAttribute('role')).toBe('dialog');
    modal.close();
  });

  test('modal has aria-modal="true"', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const el = hostEl.querySelector('.npe-find-replace-modal');
    expect(el.getAttribute('aria-modal')).toBe('true');
    modal.close();
  });

  test('modal contains find input', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const findInput = hostEl.querySelector('#npe-fr-find');
    expect(findInput).not.toBeNull();
    modal.close();
  });

  test('modal contains replace input', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const replaceInput = hostEl.querySelector('#npe-fr-replace');
    expect(replaceInput).not.toBeNull();
    modal.close();
  });

  test('modal contains case-sensitive checkbox', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const check = hostEl.querySelector('#npe-fr-case');
    expect(check).not.toBeNull();
    expect(check.type).toBe('checkbox');
    modal.close();
  });

  test('modal contains regex checkbox', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const check = hostEl.querySelector('#npe-fr-regex');
    expect(check).not.toBeNull();
    expect(check.type).toBe('checkbox');
    modal.close();
  });

  test('modal contains Find Next, Replace, Replace All, Close buttons', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    const buttons = Array.from(hostEl.querySelectorAll('button')).map(b => b.textContent);
    expect(buttons.some(t => t.includes('modal.findReplace.findNext'))).toBe(true);
    expect(buttons.some(t => t.includes('modal.findReplace.replaceOne'))).toBe(true);
    expect(buttons.some(t => t.includes('modal.findReplace.replaceAll'))).toBe(true);
    expect(buttons.some(t => t.includes('modal.findReplace.close'))).toBe(true);
    modal.close();
  });
});

describe('FindReplaceModal — close behaviour', () => {
  test('close() removes modal from DOM', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    modal.close();
    expect(hostEl.querySelector('.npe-find-replace-modal')).toBeNull();
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
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(hostEl.querySelector('.npe-find-replace-modal')).toBeNull();
  });
});

describe('FindReplaceModal — find/replace logic', () => {
  test('replace all replaces all occurrences in the iframe body', () => {
    const canvas = makeCanvas('<p>Hello world. Hello again.</p>');
    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    const modal = new FindReplaceModal({
      canvasManager: canvas,
      i18n: makeI18n(),
      hostEl,
    });
    modal.open();

    // Set find text
    const findInput = hostEl.querySelector('#npe-fr-find');
    findInput.value = 'Hello';
    findInput.dispatchEvent(new Event('input'));

    // Set replace text
    const replaceInput = hostEl.querySelector('#npe-fr-replace');
    replaceInput.value = 'Hi';

    // Click Replace All
    const replaceAllBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.textContent.includes('modal.findReplace.replaceAll'));
    replaceAllBtn.click();

    modal.close();

    const bodyText = canvas.getBody().textContent;
    expect(bodyText).not.toContain('Hello');
    expect(bodyText).toContain('Hi');
  });

  test('case-sensitive flag distinguishes case', () => {
    const canvas = makeCanvas('<p>Hello hello HELLO</p>');
    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    const modal = new FindReplaceModal({
      canvasManager: canvas,
      i18n: makeI18n(),
      hostEl,
    });
    modal.open();

    const findInput = hostEl.querySelector('#npe-fr-find');
    findInput.value = 'Hello';
    const caseCheck = hostEl.querySelector('#npe-fr-case');
    caseCheck.checked = true;
    caseCheck.dispatchEvent(new Event('change'));
    findInput.dispatchEvent(new Event('input'));

    const replaceInput = hostEl.querySelector('#npe-fr-replace');
    replaceInput.value = 'Hi';

    const replaceAllBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.textContent.includes('modal.findReplace.replaceAll'));
    replaceAllBtn.click();

    modal.close();

    const bodyText = canvas.getBody().textContent;
    // Only exact-case "Hello" replaced
    expect(bodyText).toContain('hello');
    expect(bodyText).toContain('HELLO');
    expect(bodyText).not.toContain('Hello');
  });

  test('regex mode matches pattern', () => {
    const canvas = makeCanvas('<p>cat bat rat</p>');
    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    const modal = new FindReplaceModal({
      canvasManager: canvas,
      i18n: makeI18n(),
      hostEl,
    });
    modal.open();

    const findInput = hostEl.querySelector('#npe-fr-find');
    findInput.value = '[cbr]at';
    const regexCheck = hostEl.querySelector('#npe-fr-regex');
    regexCheck.checked = true;
    regexCheck.dispatchEvent(new Event('change'));
    findInput.dispatchEvent(new Event('input'));

    const replaceInput = hostEl.querySelector('#npe-fr-replace');
    replaceInput.value = 'pet';

    const replaceAllBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.textContent.includes('modal.findReplace.replaceAll'));
    replaceAllBtn.click();

    modal.close();

    const bodyText = canvas.getBody().textContent;
    expect(bodyText).toBe('pet pet pet');
  });

  test('invalid regex does not throw', () => {
    const canvas = makeCanvas('<p>text</p>');
    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    const modal = new FindReplaceModal({
      canvasManager: canvas,
      i18n: makeI18n(),
      hostEl,
    });
    modal.open();

    const findInput = hostEl.querySelector('#npe-fr-find');
    findInput.value = '[invalid(regex';
    const regexCheck = hostEl.querySelector('#npe-fr-regex');
    regexCheck.checked = true;
    regexCheck.dispatchEvent(new Event('change'));
    findInput.dispatchEvent(new Event('input'));

    const replaceAllBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.textContent.includes('modal.findReplace.replaceAll'));
    expect(() => replaceAllBtn.click()).not.toThrow();

    modal.close();
  });

  test('empty find term does nothing', () => {
    const canvas = makeCanvas('<p>Hello world</p>');
    const originalText = canvas.getBody().textContent;
    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    const modal = new FindReplaceModal({
      canvasManager: canvas,
      i18n: makeI18n(),
      hostEl,
    });
    modal.open();

    // leave find empty
    const replaceInput = hostEl.querySelector('#npe-fr-replace');
    replaceInput.value = 'REPLACED';

    const replaceAllBtn = Array.from(hostEl.querySelectorAll('button'))
      .find(b => b.textContent.includes('modal.findReplace.replaceAll'));
    replaceAllBtn.click();

    modal.close();
    expect(canvas.getBody().textContent).toBe(originalText);
  });
});

describe('FindReplaceModal — double open guard', () => {
  test('calling open() twice does not add two modals', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    modal.open();
    const modals = hostEl.querySelectorAll('.npe-find-replace-modal');
    expect(modals.length).toBe(1);
    modal.close();
  });
});

describe('FindReplaceModal — destroy', () => {
  test('destroy() removes the modal if open', () => {
    const { modal, hostEl } = makeModal();
    modal.open();
    modal.destroy();
    expect(hostEl.querySelector('.npe-find-replace-modal')).toBeNull();
  });

  test('destroy() is idempotent', () => {
    const modal = new FindReplaceModal();
    expect(() => {
      modal.destroy();
      modal.destroy();
    }).not.toThrow();
  });
});
