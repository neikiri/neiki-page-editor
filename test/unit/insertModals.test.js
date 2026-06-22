/**
 * Unit tests for Task 6 insert modals:
 *  - LinkModal
 *  - ImageModal
 *  - VideoModal
 *  - TableModal
 *  - EmojiPicker
 *  - SpecialCharsPicker
 *  - ModalManager
 */
import { jest } from '@jest/globals';
import { LinkModal }         from '../../src/modals/modals/LinkModal.js';
import { ImageModal }        from '../../src/modals/modals/ImageModal.js';
import { VideoModal }        from '../../src/modals/modals/VideoModal.js';
import { TableModal }        from '../../src/modals/modals/TableModal.js';
import { EmojiPicker }       from '../../src/modals/modals/EmojiPicker.js';
import { SpecialCharsPicker }from '../../src/modals/modals/SpecialCharsPicker.js';
import { ModalManager }      from '../../src/modals/ModalManager.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeI18n() {
  return { t: (k) => k };
}

function makeHostEl() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
}

function makeBaseOpts(overrides = {}) {
  const hostEl = makeHostEl();
  return {
    hostEl,
    i18n: makeI18n(),
    onClose: jest.fn(),
    onInsert: jest.fn(),
    ...overrides,
  };
}

// ─── LinkModal ────────────────────────────────────────────────────────────────

describe('LinkModal — instantiation', () => {
  test('instantiates without arguments', () => {
    expect(() => new LinkModal()).not.toThrow();
  });

  test('open() does not throw', () => {
    const modal = new LinkModal(makeBaseOpts());
    expect(() => modal.open()).not.toThrow();
    modal.close();
  });

  test('close() is idempotent when not open', () => {
    const modal = new LinkModal();
    expect(() => { modal.close(); modal.close(); }).not.toThrow();
  });
});

describe('LinkModal — DOM structure', () => {
  test('open() appends modal with role=dialog to hostEl', () => {
    const opts = makeBaseOpts();
    const modal = new LinkModal(opts);
    modal.open();
    const el = opts.hostEl.querySelector('.npe-link-modal');
    expect(el).not.toBeNull();
    expect(el.getAttribute('role')).toBe('dialog');
    expect(el.getAttribute('aria-modal')).toBe('true');
    modal.close();
  });

  test('modal contains URL input', () => {
    const opts = makeBaseOpts();
    const modal = new LinkModal(opts);
    modal.open();
    expect(opts.hostEl.querySelector('#npe-link-url')).not.toBeNull();
    modal.close();
  });

  test('modal contains display text input', () => {
    const opts = makeBaseOpts();
    const modal = new LinkModal(opts);
    modal.open();
    expect(opts.hostEl.querySelector('#npe-link-text')).not.toBeNull();
    modal.close();
  });

  test('modal contains new-tab checkbox', () => {
    const opts = makeBaseOpts();
    const modal = new LinkModal(opts);
    modal.open();
    expect(opts.hostEl.querySelector('#npe-link-newtab')).not.toBeNull();
    modal.close();
  });

  test('close() removes modal from DOM', () => {
    const opts = makeBaseOpts();
    const modal = new LinkModal(opts);
    modal.open();
    modal.close();
    expect(opts.hostEl.querySelector('.npe-link-modal')).toBeNull();
    expect(opts.hostEl.querySelector('.npe-modal-backdrop')).toBeNull();
  });

  test('Escape key calls onClose', () => {
    const opts = makeBaseOpts();
    const modal = new LinkModal(opts);
    modal.open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(opts.onClose).toHaveBeenCalled();
    modal.close();
  });
});

describe('LinkModal — insert', () => {
  test('insert button calls onInsert with anchor html', () => {
    const opts = makeBaseOpts();
    const modal = new LinkModal(opts);
    modal.open();
    const urlInput = opts.hostEl.querySelector('#npe-link-url');
    urlInput.value = 'https://example.com';
    const textInput = opts.hostEl.querySelector('#npe-link-text');
    textInput.value = 'Example';
    const insertBtn = Array.from(opts.hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();
    expect(opts.onInsert).toHaveBeenCalledWith(expect.stringContaining('href="https://example.com"'));
    expect(opts.onInsert).toHaveBeenCalledWith(expect.stringContaining('Example'));
  });

  test('insert without URL does not call onInsert', () => {
    const opts = makeBaseOpts();
    const modal = new LinkModal(opts);
    modal.open();
    const insertBtn = Array.from(opts.hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();
    expect(opts.onInsert).not.toHaveBeenCalled();
    modal.close();
  });

  test('new-tab checked adds target=_blank and rel', () => {
    const opts = makeBaseOpts();
    const modal = new LinkModal(opts);
    modal.open();
    const urlInput = opts.hostEl.querySelector('#npe-link-url');
    urlInput.value = 'https://example.com';
    const check = opts.hostEl.querySelector('#npe-link-newtab');
    check.checked = true;
    const insertBtn = Array.from(opts.hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();
    expect(opts.onInsert).toHaveBeenCalledWith(expect.stringContaining('target="_blank"'));
  });

  test('pre-populated data fills inputs', () => {
    const opts = makeBaseOpts();
    const modal = new LinkModal(opts);
    modal.open({ href: 'https://foo.com', text: 'Foo', newTab: true });
    expect(opts.hostEl.querySelector('#npe-link-url').value).toBe('https://foo.com');
    expect(opts.hostEl.querySelector('#npe-link-text').value).toBe('Foo');
    expect(opts.hostEl.querySelector('#npe-link-newtab').checked).toBe(true);
    modal.close();
  });
});

describe('LinkModal — double open guard', () => {
  test('calling open() twice does not add two modals', () => {
    const opts = makeBaseOpts();
    const modal = new LinkModal(opts);
    modal.open();
    modal.open();
    expect(opts.hostEl.querySelectorAll('.npe-link-modal').length).toBe(1);
    modal.close();
  });
});

// ─── ImageModal ───────────────────────────────────────────────────────────────

describe('ImageModal — instantiation', () => {
  test('instantiates without arguments', () => {
    expect(() => new ImageModal()).not.toThrow();
  });

  test('open() does not throw', () => {
    const modal = new ImageModal(makeBaseOpts());
    expect(() => modal.open()).not.toThrow();
    modal.close();
  });
});

describe('ImageModal — DOM structure', () => {
  test('has upload zone, URL input, alt input, and width input', () => {
    const opts = makeBaseOpts();
    const modal = new ImageModal(opts);
    modal.open();
    expect(opts.hostEl.querySelector('.npe-image-upload-zone')).not.toBeNull();
    expect(opts.hostEl.querySelector('#npe-image-url')).not.toBeNull();
    expect(opts.hostEl.querySelector('#npe-image-alt')).not.toBeNull();
    expect(opts.hostEl.querySelector('#npe-image-width')).not.toBeNull();
    modal.close();
  });

  test('URL input is present and editable', () => {
    const opts = makeBaseOpts();
    const modal = new ImageModal(opts);
    modal.open();
    const urlInput = opts.hostEl.querySelector('#npe-image-url');
    expect(urlInput).not.toBeNull();
    expect(urlInput.hasAttribute('hidden')).toBe(false);
    modal.close();
  });

  test('insert with URL calls onInsert with img tag', () => {
    const opts = makeBaseOpts();
    const modal = new ImageModal(opts);
    modal.open();
    const urlInput = opts.hostEl.querySelector('#npe-image-url');
    urlInput.value = 'https://example.com/img.png';
    const insertBtn = Array.from(opts.hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();
    expect(opts.onInsert).toHaveBeenCalledWith(expect.stringContaining('<img'));
    expect(opts.onInsert).toHaveBeenCalledWith(expect.stringContaining('https://example.com/img.png'));
  });
});

// ─── VideoModal ───────────────────────────────────────────────────────────────

describe('VideoModal — instantiation', () => {
  test('instantiates without arguments', () => {
    expect(() => new VideoModal()).not.toThrow();
  });

  test('open() does not throw', () => {
    const modal = new VideoModal(makeBaseOpts());
    expect(() => modal.open()).not.toThrow();
    modal.close();
  });
});

describe('VideoModal — insert', () => {
  test('insert with URL calls onInsert with video tag', () => {
    const opts = makeBaseOpts();
    const modal = new VideoModal(opts);
    modal.open();
    const urlInput = opts.hostEl.querySelector('#npe-video-url');
    urlInput.value = 'https://example.com/video.mp4';
    const insertBtn = Array.from(opts.hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();
    expect(opts.onInsert).toHaveBeenCalledWith(expect.stringContaining('<video'));
    expect(opts.onInsert).toHaveBeenCalledWith(expect.stringContaining('https://example.com/video.mp4'));
  });
});

// ─── TableModal ───────────────────────────────────────────────────────────────

describe('TableModal — instantiation', () => {
  test('instantiates without arguments', () => {
    expect(() => new TableModal()).not.toThrow();
  });

  test('open() does not throw', () => {
    const modal = new TableModal(makeBaseOpts());
    expect(() => modal.open()).not.toThrow();
    modal.close();
  });
});

describe('TableModal — DOM structure', () => {
  test('has rows, cols, header inputs', () => {
    const opts = makeBaseOpts();
    const modal = new TableModal(opts);
    modal.open();
    expect(opts.hostEl.querySelector('#npe-table-rows')).not.toBeNull();
    expect(opts.hostEl.querySelector('#npe-table-cols')).not.toBeNull();
    expect(opts.hostEl.querySelector('#npe-table-header')).not.toBeNull();
    modal.close();
  });
});

describe('TableModal — insert', () => {
  test('insert calls onInsert with <table> HTML', () => {
    const opts = makeBaseOpts();
    const modal = new TableModal(opts);
    modal.open();
    opts.hostEl.querySelector('#npe-table-rows').value = '2';
    opts.hostEl.querySelector('#npe-table-cols').value = '3';
    const insertBtn = Array.from(opts.hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();
    const html = opts.onInsert.mock.calls[0][0];
    expect(html).toContain('<table');
    expect(html).toContain('<tr>');
    expect(html).toContain('<td');
  });

  test('header row checkbox creates thead', () => {
    const opts = makeBaseOpts();
    const modal = new TableModal(opts);
    modal.open();
    opts.hostEl.querySelector('#npe-table-header').checked = true;
    const insertBtn = Array.from(opts.hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();
    expect(opts.onInsert.mock.calls[0][0]).toContain('<thead>');
  });

  test('no header row skips thead', () => {
    const opts = makeBaseOpts();
    const modal = new TableModal(opts);
    modal.open();
    opts.hostEl.querySelector('#npe-table-header').checked = false;
    const insertBtn = Array.from(opts.hostEl.querySelectorAll('button'))
      .find(b => b.classList.contains('npe-btn-primary'));
    insertBtn.click();
    expect(opts.onInsert.mock.calls[0][0]).not.toContain('<thead>');
  });
});

// ─── EmojiPicker ──────────────────────────────────────────────────────────────

describe('EmojiPicker — instantiation', () => {
  test('instantiates without arguments', () => {
    expect(() => new EmojiPicker()).not.toThrow();
  });

  test('open() does not throw', () => {
    const modal = new EmojiPicker(makeBaseOpts());
    expect(() => modal.open()).not.toThrow();
    modal.close();
  });
});

describe('EmojiPicker — DOM', () => {
  test('renders emoji buttons', () => {
    const opts = makeBaseOpts();
    const modal = new EmojiPicker(opts);
    modal.open();
    const btns = opts.hostEl.querySelectorAll('.npe-emoji-btn');
    expect(btns.length).toBeGreaterThan(0);
    modal.close();
  });

  test('clicking emoji calls onInsert', () => {
    const opts = makeBaseOpts();
    const modal = new EmojiPicker(opts);
    modal.open();
    const btn = opts.hostEl.querySelector('.npe-emoji-btn');
    btn.click();
    expect(opts.onInsert).toHaveBeenCalled();
    modal.close();
  });

  test('has search input', () => {
    const opts = makeBaseOpts();
    const modal = new EmojiPicker(opts);
    modal.open();
    expect(opts.hostEl.querySelector('.npe-emoji-search')).not.toBeNull();
    modal.close();
  });
});

// ─── SpecialCharsPicker ───────────────────────────────────────────────────────

describe('SpecialCharsPicker — instantiation', () => {
  test('instantiates without arguments', () => {
    expect(() => new SpecialCharsPicker()).not.toThrow();
  });

  test('open() does not throw', () => {
    const modal = new SpecialCharsPicker(makeBaseOpts());
    expect(() => modal.open()).not.toThrow();
    modal.close();
  });
});

describe('SpecialCharsPicker — DOM', () => {
  test('renders special char buttons', () => {
    const opts = makeBaseOpts();
    const modal = new SpecialCharsPicker(opts);
    modal.open();
    const btns = opts.hostEl.querySelectorAll('.npe-special-char-btn');
    expect(btns.length).toBeGreaterThan(0);
    modal.close();
  });

  test('clicking a char calls onInsert', () => {
    const opts = makeBaseOpts();
    const modal = new SpecialCharsPicker(opts);
    modal.open();
    const btn = opts.hostEl.querySelector('.npe-special-char-btn');
    btn.click();
    expect(opts.onInsert).toHaveBeenCalled();
    modal.close();
  });
});

// ─── ModalManager ─────────────────────────────────────────────────────────────

describe('ModalManager — instantiation', () => {
  test('instantiates without arguments', () => {
    expect(() => new ModalManager()).not.toThrow();
  });
});

describe('ModalManager — open/close', () => {
  function makeManager() {
    const hostEl = makeHostEl();
    return new ModalManager({
      i18n: makeI18n(),
      hostEl,
    });
  }

  test('open("link") does not throw', () => {
    const mgr = makeManager();
    expect(() => mgr.open('link')).not.toThrow();
    mgr.close();
    mgr.destroy();
  });

  test('open("image") does not throw', () => {
    const mgr = makeManager();
    expect(() => mgr.open('image')).not.toThrow();
    mgr.close();
    mgr.destroy();
  });

  test('open("video") does not throw', () => {
    const mgr = makeManager();
    expect(() => mgr.open('video')).not.toThrow();
    mgr.close();
    mgr.destroy();
  });

  test('open("table") does not throw', () => {
    const mgr = makeManager();
    expect(() => mgr.open('table')).not.toThrow();
    mgr.close();
    mgr.destroy();
  });

  test('open("emoji") does not throw', () => {
    const mgr = makeManager();
    expect(() => mgr.open('emoji')).not.toThrow();
    mgr.close();
    mgr.destroy();
  });

  test('open("specialChars") does not throw', () => {
    const mgr = makeManager();
    expect(() => mgr.open('specialChars')).not.toThrow();
    mgr.close();
    mgr.destroy();
  });

  test('open unknown id does not throw', () => {
    const mgr = makeManager();
    expect(() => mgr.open('unknown')).not.toThrow();
    mgr.close();
    mgr.destroy();
  });

  test('destroy() is idempotent', () => {
    const mgr = makeManager();
    expect(() => { mgr.destroy(); mgr.destroy(); }).not.toThrow();
  });
});
