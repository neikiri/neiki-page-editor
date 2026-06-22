/**
 * Unit tests for Task 7 overlay modules:
 *  - ImageResize
 *  - FloatingToolbar
 *  - BlockDragDrop
 *  - OverlayManager (wires the above)
 */
import { jest } from '@jest/globals';
import { ImageResize }     from '../../src/overlays/ImageResize.js';
import { FloatingToolbar } from '../../src/overlays/FloatingToolbar.js';
import { BlockDragDrop }   from '../../src/overlays/BlockDragDrop.js';
import { OverlayManager }  from '../../src/overlays/OverlayManager.js';
import { EventBus }        from '../../src/core/EventBus.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeI18n() {
  return { t: (k) => k };
}

function makeBus() {
  return new EventBus();
}

/**
 * Minimal canvasManager stub.
 * @param {Document} iframeDoc
 */
function makeCanvas(iframeDoc) {
  const iframe = { getBoundingClientRect: () => ({ top: 0, left: 0, width: 800, height: 600 }) };
  return {
    iframe,
    getDocument: () => iframeDoc,
    getBody:     () => iframeDoc ? iframeDoc.body : null,
  };
}

// ─── ImageResize ──────────────────────────────────────────────────────────────

describe('ImageResize', () => {
  let hostEl;
  let ir;

  beforeEach(() => {
    hostEl = document.createElement('div');
    document.body.appendChild(hostEl);
    ir = new ImageResize({ hostEl, i18n: makeI18n() });
  });

  afterEach(() => {
    ir.destroy();
    if (hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
  });

  test('constructor creates selection border, 8 handles, size label, and toolbar in hostEl', () => {
    expect(hostEl.querySelector('.npe-img-select-border')).not.toBeNull();
    expect(hostEl.querySelectorAll('.npe-img-resize-handle').length).toBe(8);
    expect(hostEl.querySelector('.npe-img-size-label')).not.toBeNull();
    expect(hostEl.querySelector('.npe-img-toolbar')).not.toBeNull();
  });

  test('overlays are hidden initially', () => {
    expect(hostEl.querySelector('.npe-img-select-border').style.display).toBe('none');
    expect(hostEl.querySelector('.npe-img-toolbar').style.display).toBe('none');
    for (const h of hostEl.querySelectorAll('.npe-img-resize-handle')) {
      expect(h.style.display).toBe('none');
    }
  });

  test('destroy() is idempotent', () => {
    expect(() => {
      ir.destroy();
      ir.destroy();
    }).not.toThrow();
  });

  test('destroy() removes all overlay elements from hostEl', () => {
    ir.destroy();
    expect(hostEl.querySelector('.npe-img-select-border')).toBeNull();
    expect(hostEl.querySelector('.npe-img-toolbar')).toBeNull();
    expect(hostEl.querySelectorAll('.npe-img-resize-handle').length).toBe(0);
  });

  test('toolbar has drag, replace, and delete buttons', () => {
    const tb = hostEl.querySelector('.npe-img-toolbar');
    const btns = tb.querySelectorAll('.npe-img-toolbar-btn');
    expect(btns.length).toBeGreaterThanOrEqual(3);
  });

  test('each handle has the correct data-pos attribute', () => {
    const expected = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    const found = Array.from(hostEl.querySelectorAll('.npe-img-resize-handle'))
      .map(h => h.getAttribute('data-pos'));
    expect(found.sort()).toEqual(expected.sort());
  });

  test('deselect() hides all overlays', () => {
    // Manually show overlays by calling internal show
    ir._showOverlays();
    ir.deselect();
    expect(hostEl.querySelector('.npe-img-select-border').style.display).toBe('none');
  });

  test('attachCanvas() does not throw', () => {
    const canvas = makeCanvas(document);
    expect(() => ir.attachCanvas(canvas)).not.toThrow();
  });

  test('delete button emits content:change event via bus', () => {
    const bus    = makeBus();
    const iframeDoc = document.implementation.createHTMLDocument('');
    const canvas = makeCanvas(iframeDoc);
    const img    = iframeDoc.createElement('img');
    iframeDoc.body.appendChild(img);

    const ir2 = new ImageResize({ hostEl, canvasManager: canvas, bus, i18n: makeI18n() });
    ir2._selectedEl = img;

    const handler = jest.fn();
    bus.on('content:change', handler);

    ir2._deleteMedia();

    expect(handler).toHaveBeenCalled();
    expect(img.parentNode).toBeNull(); // removed from DOM
    ir2.destroy();
    bus.destroy();
  });
});

// ─── FloatingToolbar ─────────────────────────────────────────────────────────

describe('FloatingToolbar', () => {
  let hostEl;
  let ft;

  beforeEach(() => {
    hostEl = document.createElement('div');
    document.body.appendChild(hostEl);
    ft = new FloatingToolbar({ hostEl, i18n: makeI18n() });
  });

  afterEach(() => {
    ft.destroy();
    if (hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
  });

  test('constructor creates toolbar element in hostEl', () => {
    expect(hostEl.querySelector('.npe-floating-toolbar')).not.toBeNull();
  });

  test('toolbar is hidden initially', () => {
    const el = hostEl.querySelector('.npe-floating-toolbar');
    expect(el.style.display).toBe('none');
  });

  test('show() makes toolbar visible', () => {
    const rect = { top: 100, left: 100, bottom: 120, width: 200, height: 20 };
    ft.show(rect);
    const el = hostEl.querySelector('.npe-floating-toolbar');
    expect(el.style.display).toBe('flex');
  });

  test('hide() makes toolbar invisible again', () => {
    const rect = { top: 100, left: 100, bottom: 120, width: 200, height: 20 };
    ft.show(rect);
    ft.hide();
    const el = hostEl.querySelector('.npe-floating-toolbar');
    expect(el.style.display).toBe('none');
  });

  test('toolbar has bold, italic, underline, link, move-up, move-down buttons', () => {
    const btns = hostEl.querySelectorAll('.npe-floating-toolbar-btn');
    expect(btns.length).toBeGreaterThanOrEqual(6);
  });

  test('destroy() removes toolbar from DOM', () => {
    ft.destroy();
    expect(hostEl.querySelector('.npe-floating-toolbar')).toBeNull();
  });

  test('destroy() is idempotent', () => {
    expect(() => {
      ft.destroy();
      ft.destroy();
    }).not.toThrow();
  });

  test('attachCanvas() does not throw', () => {
    const canvas = makeCanvas(document);
    expect(() => ft.attachCanvas(canvas)).not.toThrow();
  });

  test('_moveBlockUp() moves block above its previous sibling', () => {
    const iframeDoc = document.implementation.createHTMLDocument('');
    const body = iframeDoc.body;
    const p1 = iframeDoc.createElement('p'); p1.textContent = 'first';
    const p2 = iframeDoc.createElement('p'); p2.textContent = 'second';
    body.appendChild(p1);
    body.appendChild(p2);

    const canvas = makeCanvas(iframeDoc);
    const bus    = makeBus();
    const ft2    = new FloatingToolbar({ hostEl, canvasManager: canvas, bus, i18n: makeI18n() });

    // Fake a selection anchor inside p2
    const sel = {
      rangeCount: 1,
      anchorNode: p2,
      isCollapsed: false,
      getRangeAt: () => ({ getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 20, bottom: 20, right: 100 }) }),
    };
    jest.spyOn(iframeDoc, 'getSelection').mockReturnValue(sel);

    ft2._moveBlockUp();

    // p2 should now be before p1
    expect(body.children[0]).toBe(p2);
    expect(body.children[1]).toBe(p1);

    ft2.destroy();
    bus.destroy();
  });

  test('_moveBlockDown() moves block below its next sibling', () => {
    const iframeDoc = document.implementation.createHTMLDocument('');
    const body = iframeDoc.body;
    const p1 = iframeDoc.createElement('p'); p1.textContent = 'first';
    const p2 = iframeDoc.createElement('p'); p2.textContent = 'second';
    body.appendChild(p1);
    body.appendChild(p2);

    const canvas = makeCanvas(iframeDoc);
    const bus    = makeBus();
    const ft3    = new FloatingToolbar({ hostEl, canvasManager: canvas, bus, i18n: makeI18n() });

    const sel = {
      rangeCount: 1,
      anchorNode: p1,
      isCollapsed: false,
      getRangeAt: () => ({ getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 20, bottom: 20, right: 100 }) }),
    };
    jest.spyOn(iframeDoc, 'getSelection').mockReturnValue(sel);

    ft3._moveBlockDown();

    expect(body.children[0]).toBe(p2);
    expect(body.children[1]).toBe(p1);

    ft3.destroy();
    bus.destroy();
  });
});

// ─── BlockDragDrop ────────────────────────────────────────────────────────────

describe('BlockDragDrop', () => {
  let hostEl;
  let bdd;
  let iframeDoc;
  let canvas;
  let bus;

  beforeEach(() => {
    hostEl    = document.createElement('div');
    document.body.appendChild(hostEl);
    iframeDoc = document.implementation.createHTMLDocument('');
    canvas    = makeCanvas(iframeDoc);
    bus       = makeBus();
    bdd       = new BlockDragDrop({ hostEl, canvasManager: canvas, bus });
  });

  afterEach(() => {
    bdd.destroy();
    bus.destroy();
    if (hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
  });

  test('constructor does not throw', () => {
    expect(bdd).toBeTruthy();
  });

  test('destroy() is idempotent', () => {
    expect(() => {
      bdd.destroy();
      bdd.destroy();
    }).not.toThrow();
  });

  test('attachCanvas() does not throw', () => {
    expect(() => bdd.attachCanvas(canvas)).not.toThrow();
  });

  test('_getDirectBodyChild returns correct block for a direct child', () => {
    const body = iframeDoc.body;
    const p = iframeDoc.createElement('p');
    body.appendChild(p);
    expect(bdd._getDirectBodyChild(p, body)).toBe(p);
  });

  test('_getDirectBodyChild returns correct block for a nested node', () => {
    const body = iframeDoc.body;
    const p    = iframeDoc.createElement('p');
    const span = iframeDoc.createElement('span');
    p.appendChild(span);
    body.appendChild(p);
    expect(bdd._getDirectBodyChild(span, body)).toBe(p);
  });

  test('_getDirectBodyChild returns null for body itself', () => {
    const body = iframeDoc.body;
    expect(bdd._getDirectBodyChild(body, body)).toBeNull();
  });

  test('drop reorders blocks and emits content:change', () => {
    const body = iframeDoc.body;
    const p1 = iframeDoc.createElement('p'); p1.textContent = 'first';
    const p2 = iframeDoc.createElement('p'); p2.textContent = 'second';
    body.appendChild(p1);
    body.appendChild(p2);

    const handler = jest.fn();
    bus.on('content:change', handler);

    // Simulate a drag-drop of p1 after p2 via _handleBlockDragEnd
    bdd._dragSrc    = p1;
    bdd._dropTarget = p2;
    bdd._dropBefore = false;

    bdd._handleBlockDragEnd({ preventDefault: () => {} });

    expect(body.children[0]).toBe(p2);
    expect(body.children[1]).toBe(p1);
    expect(handler).toHaveBeenCalled();
  });

  test('placeholder is added and removed', () => {
    const body = iframeDoc.body;
    const p = iframeDoc.createElement('p'); p.textContent = 'block';
    body.appendChild(p);

    bdd._showPlaceholder(p, true);
    // placeholder is inserted as a sibling before p (inline styles, no class)
    expect(body.children.length).toBeGreaterThan(1);
    expect(bdd._placeholder).not.toBeNull();

    bdd._hidePlaceholder();
    expect(bdd._placeholder).toBeNull();
    expect(body.children.length).toBe(1);
  });
});

// ─── OverlayManager ──────────────────────────────────────────────────────────

describe('OverlayManager', () => {
  let hostEl;
  let om;

  beforeEach(() => {
    hostEl = document.createElement('div');
    document.body.appendChild(hostEl);
    om = new OverlayManager({
      hostEl,
      i18n: makeI18n(),
      bus:  makeBus(),
    });
  });

  afterEach(() => {
    om.destroy();
    if (hostEl.parentNode) hostEl.parentNode.removeChild(hostEl);
  });

  test('constructor does not throw', () => {
    expect(om).toBeTruthy();
  });

  test('getImageResize() returns an ImageResize instance', () => {
    expect(om.getImageResize()).toBeTruthy();
  });

  test('getFloatingToolbar() returns a FloatingToolbar instance', () => {
    expect(om.getFloatingToolbar()).toBeTruthy();
  });

  test('attachCanvas() does not throw', () => {
    const canvas = makeCanvas(document.implementation.createHTMLDocument(''));
    expect(() => om.attachCanvas(canvas)).not.toThrow();
  });

  test('destroy() is idempotent', () => {
    expect(() => {
      om.destroy();
      om.destroy();
    }).not.toThrow();
  });

  test('update() does not throw even without a canvas', () => {
    expect(() => om.update()).not.toThrow();
  });
});
