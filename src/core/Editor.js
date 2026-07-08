/**
 * Editor — top-level orchestrator.
 * Owns all manager instances and wires lifecycle callbacks.
 */

import { EventBus } from './EventBus.js';
import { normalizeOptions } from './Options.js';
import { createI18n } from '../i18n/i18n.js';
import { ToolbarBuilder } from '../toolbar/ToolbarBuilder.js';
import { ToolbarState } from '../toolbar/ToolbarState.js';
import { CommandRegistry } from '../commands/CommandRegistry.js';
import { ModalManager } from '../modals/ModalManager.js';
import { SourceViewModal } from '../modals/modals/SourceViewModal.js';
import { FindReplaceModal } from '../modals/modals/FindReplaceModal.js';
import { OverlayManager } from '../overlays/OverlayManager.js';
import { CanvasManager } from '../canvas/CanvasManager.js';
import { ContentSerializer } from '../canvas/ContentSerializer.js';
import { StyleManager } from '../canvas/StyleManager.js';
import { Sanitizer } from '../canvas/Sanitizer.js';
import { FullHtmlParser } from '../canvas/FullHtmlParser.js';
import { ThemeManager } from '../themes/ThemeManager.js';
import { StatusBar } from '../statusbar/StatusBar.js';
import { AutosaveManager } from '../autosave/AutosaveManager.js';

/** Default debounce delay for onChange (ms). */
const CHANGE_DEBOUNCE_MS = 300;

/** Toast auto-dismiss duration (ms). */
const TOAST_DURATION_MS = 4000;

/** Package version, shown in the Help/About modal. Keep in sync with package.json. */
const NPE_VERSION = '0.4.0';

/** Logo shown in the Help/About modal. */
const NPE_LOGO_URL = 'https://raw.githubusercontent.com/neikiri/neiki-page-editor/main/assets/img/logo.svg';

/** GitHub repository shown in the Help/About modal. */
const NPE_GITHUB_URL = 'https://github.com/neikiri/neiki-page-editor';

export class Editor {
  /**
   * @param {Element} targetEl — resolved target element
   * @param {object} rawOptions — raw user options
   */
  constructor(targetEl, rawOptions) {
    /** @type {Element} */
    this._target = targetEl;

    /** @type {import('./Options').EditorOptions} */
    this._opts = normalizeOptions(rawOptions);

    /** @type {EventBus} */
    this._bus = new EventBus();

    /** @type {boolean} */
    this._destroyed = false;

    /** @type {HTMLElement|null} */
    this._shell = null;

    /** @type {HTMLElement|null} */
    this._toolbarEl = null;

    /** @type {import('../i18n/i18n').I18nInstance} */
    this._i18n = createI18n(this._opts.language, this._opts.translations);

    /** @type {ToolbarBuilder|null} */
    this._toolbarBuilder = null;

    /** @type {ToolbarState|null} */
    this._toolbarState = null;

    /** @type {CommandRegistry|null} */
    this._commands = null;

    /** @type {ModalManager|null} */
    this._modalManager = null;

    /** @type {SourceViewModal|null} */
    this._sourceViewModal = null;

    /** @type {FindReplaceModal|null} */
    this._findReplaceModal = null;

    /** @type {CanvasManager|null} */
    this._canvas = null;

    /** @type {StyleManager|null} */
    this._styleManager = null;

    /** @type {ContentSerializer|null} */
    this._serializer = null;

    /** @type {Sanitizer|null} */
    this._sanitizer = null;

    /** @type {FullHtmlParser|null} */
    this._fullHtmlParser = null;

    /** @type {ThemeManager|null} */
    this._themeManager = null;

    /** @type {StatusBar|null} */
    this._statusBar = null;

    /** @type {AutosaveManager|null} */
    this._autosave = null;

    /** @type {OverlayManager|null} */
    this._overlayManager = null;

    /**
     * Persisted metadata from the last load payload.
     * @type {Record<string, unknown>}
     */
    this._metadata = {};

    /**
     * Persisted cssUrls from the last load payload.
     * @type {string[]}
     */
    this._cssUrls = Array.isArray(this._opts.cssUrls) ? this._opts.cssUrls.slice() : [];

    /**
     * Persisted assetsBaseUrl from the last load payload.
     * @type {string}
     */
    this._assetsBaseUrl = this._opts.assetsBaseUrl || '';

    /** @type {number|null} — debounce timer id for onChange */
    this._onChangeTimer = null;

    /** @type {boolean} — fullscreen state */
    this._fullscreen = false;

    this._init();
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  _init() {
    this._buildShell();
    this._buildCanvas();
    this._buildToolbar();
    this._buildCommands();
    this._buildModals();
    this._buildStatusBar();
    this._buildAutosave();
    this._bindToolbarCommands();
    this._bindKeyboardShortcuts();
    this._bindLifecycleCallbacks();
    this._loadContent();
  }

  /**
   * Build the minimal editor shell DOM.
   * Inserts .npe-editor into the target element.
   */
  _buildShell() {
    const shell = document.createElement('div');
    shell.className = 'npe-editor';

    if (this._opts.customClass) {
      shell.classList.add(this._opts.customClass);
    }

    // Toolbar placeholder
    const toolbar = document.createElement('div');
    toolbar.className = 'npe-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Editor toolbar');

    // Canvas wrapper placeholder
    const canvasWrapper = document.createElement('div');
    canvasWrapper.className = 'npe-canvas-wrapper';
    // Set min-height as a CSS custom property so the iframe can inherit it
    canvasWrapper.style.minHeight = this._opts.minHeight + 'px';
    if (this._opts.maxHeight) {
      canvasWrapper.style.maxHeight = this._opts.maxHeight + 'px';
      canvasWrapper.style.overflowY = 'auto';
    }

    // Overlay layer (host-side overlays above iframe)
    const overlayLayer = document.createElement('div');
    overlayLayer.className = 'npe-overlay-layer';
    overlayLayer.setAttribute('aria-hidden', 'true');

    // Statusbar placeholder
    const statusbar = document.createElement('div');
    statusbar.className = 'npe-statusbar';
    statusbar.setAttribute('role', 'status');
    statusbar.setAttribute('aria-live', 'polite');

    canvasWrapper.appendChild(overlayLayer);
    shell.appendChild(toolbar);
    shell.appendChild(canvasWrapper);
    shell.appendChild(statusbar);

    this._target.appendChild(shell);
    this._shell = shell;
    this._toolbarEl = toolbar;
    this._canvasWrapper = canvasWrapper;

    // ThemeManager — applies theme classes to the shell
    this._themeManager = new ThemeManager(
      shell,
      this._opts.theme,
      this._opts.persistTheme
    );

    // Create overlay manager early so it's ready when canvas is attached.
    this._overlayManager = new OverlayManager({
      hostEl: shell,
      canvasManager: null,
      bus:    this._bus,
      i18n:   this._i18n,
      options: this._opts,
    });
  }

  /**
   * Build and initialize canvas-related managers.
   */
  _buildCanvas() {
    if (!this._canvasWrapper) return;

    this._sanitizer = new Sanitizer({ allowDataUris: this._opts.allowDataUris });
    this._fullHtmlParser = new FullHtmlParser();

    this._canvas = new CanvasManager(this._canvasWrapper, this._opts, this._bus);

    this._styleManager = new StyleManager(this._canvas, this._opts);
    const doc = this._canvas.getDocument();
    if (doc) {
      this._styleManager.init(doc, this._opts);
    }

    this._serializer = new ContentSerializer(this._canvas, this._sanitizer);

    // Wire overlays to the canvas
    if (this._overlayManager) {
      this._overlayManager.attachCanvas(this._canvas);
    }

    this._bus.on('content:change', () => {
      if (this._overlayManager) this._overlayManager.update();
    });
    this._bus.on('selection:change', () => {
      if (this._overlayManager) this._overlayManager.update();
    });

    // Bind Tab/Shift+Tab for indent/outdent inside the iframe
    this._bindCanvasTabShortcuts();
  }


  /**
   * Build and render the toolbar using ToolbarBuilder.
   */
  _buildToolbar() {
    if (!this._toolbarEl) return;

    this._toolbarBuilder = new ToolbarBuilder(
      this._toolbarEl,
      this._opts,
      this._bus,
      this._i18n
    );

    this._toolbarState = new ToolbarState(
      this._toolbarBuilder,
      this._canvas,
      this._bus
    );
  }

  /**
   * Build the CommandRegistry with live canvas references.
   */
  _buildCommands() {
    this._commands = new CommandRegistry(
      this._canvas,
      this._bus,
      this._styleManager,
      this._sanitizer
    );
  }

  /**
   * Build the ModalManager and wire it to the bus.
   * Modals open on 'toolbar:insert' events and insert into the iframe canvas.
   */
  _buildModals() {
    this._modalManager = new ModalManager({
      options:       this._opts,
      bus:           this._bus,
      i18n:          this._i18n,
      hostEl:        this._shell || document.body,
      canvasManager: this._canvas,
    });
  }

  /**
   * Build the StatusBar and wire it to the statusbar element in the shell.
   */
  _buildStatusBar() {
    const statusbarEl = this._shell ? this._shell.querySelector('.npe-statusbar') : null;
    if (!statusbarEl) return;
    this._statusBar = new StatusBar(statusbarEl, this._bus, this._i18n);
  }

  /**
   * Derive the autosave storage key for this instance.
   * Uses the configured autosaveKey or falls back to a positional key.
   * @returns {string}
   */
  _getAutosaveKey() {
    if (this._opts.autosaveKey) return `npe-autosave-${this._opts.autosaveKey}`;
    // Derive from the target element's id, or fall back to a positional key
    const id = (this._target && this._target.id) ? this._target.id : null;
    if (id) return `npe-autosave-${id}`;
    // Last resort — use a counter based on the target's position in the DOM
    return 'npe-autosave-default';
  }

  /**
   * Build the AutosaveManager.
   */
  _buildAutosave() {
    this._autosave = new AutosaveManager({
      storageKey: this._getAutosaveKey(),
      bus: this._bus,
      getContent: () => this.getContent(),
      enabled: false, // off by default unless opted in
    });
  }

  /**
   * Listen to toolbar:command and toolbar:more bus events and route to commands.
   */
  _bindToolbarCommands() {
    this._bus.on('toolbar:command', (id, value) => {
      if (!this._commands) return;
      this._commands.execute(id, value);
    });

    this._bus.on('toolbar:colorPreview', () => {
      // Preview color — no-op for now
    });

    this._bus.on('toolbar:more', (itemId) => {
      this._handleMoreMenuItem(itemId);
    });

    // Insert dropdown — open the appropriate modal/picker
    this._bus.on('toolbar:insert', (itemId) => {
      if (this._modalManager) this._modalManager.open(itemId);
    });

    // canvas:insert — HTML insertion from overlays (e.g. file drag-drop)
    this._bus.on('canvas:insert', ({ html }) => {
      if (!html) return;
      if (this._modalManager) {
        // Reuse ModalManager's _insert which handles selection + content:change
        this._modalManager._insert(html);
      }
    });

    // viewCode button toggles source view
    this._bus.on('toolbar:command', (id) => {
      if (id === 'viewCode') this._openSourceView();
      if (id === 'findReplace') this._openFindReplace();
    });
  }

  /**
   * Handle a More menu item click.
   * @param {string} itemId
   */
  _handleMoreMenuItem(itemId) {
    switch (itemId) {
      case 'save':
        this.triggerSave();
        break;

      case 'preview':
        this._openPreview();
        break;

      case 'download':
        this._downloadHtml();
        break;

      case 'print':
        this._printCanvas();
        break;

      case 'autosave':
        this._toggleAutosave();
        break;

      case 'clearAll':
        this._clearAll();
        break;

      case 'changeTheme':
        this.toggleTheme();
        break;

      case 'fullscreen':
        this.toggleFullscreen();
        break;

      case 'help':
        this._openHelp();
        break;

      default:
        break;
    }
  }

  /**
   * Open a preview of the current page (HTML + CSS) in a new browser tab.
   */
  _openPreview() {
    const html = this._buildFullPageHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    // Revoke the blob URL after the window has loaded
    if (win) {
      win.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
    } else {
      // Fallback if popups are blocked: revoke after a delay
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
  }

  /**
   * Download the current page as an HTML file with embedded CSS.
   */
  _downloadHtml() {
    const html = this._buildFullPageHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  /**
   * Build a full HTML document string containing current canvas HTML and page CSS.
   * @returns {string}
   */
  _buildFullPageHtml() {
    const bodyHtml = this.getContent();
    const css = this.getStyles();
    const cssUrls = this._cssUrls || [];
    const assetsBaseUrl = this._assetsBaseUrl || '';

    let linkTags = '';
    for (const url of cssUrls) {
      linkTags += `  <link rel="stylesheet" href="${this._escapeAttr(url)}">\n`;
    }

    let styleTag = '';
    if (css) {
      styleTag = `  <style>\n${css}\n  </style>\n`;
    }

    let baseTag = '';
    if (assetsBaseUrl) {
      baseTag = `  <base href="${this._escapeAttr(assetsBaseUrl)}">\n`;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
${baseTag}${linkTags}${styleTag}</head>
<body>
${bodyHtml}
</body>
</html>`;
  }

  /**
   * Open the print dialog for the current canvas content.
   */
  _printCanvas() {
    const iframeDoc = this._getIframeDoc();
    if (!iframeDoc) return;
    try {
      const win = iframeDoc.defaultView;
      if (win) win.print();
    } catch {
      // Guard against cross-origin or destroyed iframe
    }
  }

  /**
   * Toggle autosave on/off for this instance.
   */
  _toggleAutosave() {
    if (!this._autosave) return;
    this._autosave.toggle();
  }

  /**
   * Clear all canvas content after user confirmation.
   */
  _clearAll() {
    const confirmed = window.confirm(this._i18n.t('confirm.clearAll'));
    if (!confirmed) return;
    this.setContent('');
    this._bus.emit('content:change', { html: '', words: 0, chars: 0 });
  }

  /**
   * Open the Help panel showing keyboard shortcuts.
   */
  _openHelp() {
    if (this._helpPanel) {
      // Toggle: if already open, close it
      this._closeHelp();
      return;
    }
    this._renderHelpPanel();
  }

  /**
   * Render the help panel as an overlay inside the editor shell.
   */
  _renderHelpPanel() {
    if (!this._shell) return;
    const t = (key) => this._i18n.t(key);

    const backdrop = document.createElement('div');
    backdrop.className = 'npe-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', t('help.title'));

    const panel = document.createElement('div');
    panel.className = 'npe-modal npe-help-panel npe-help-about-panel';

    const header = document.createElement('div');
    header.className = 'npe-modal-header';

    const title = document.createElement('h2');
    title.className = 'npe-modal-title';
    title.textContent = t('help.title');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'npe-modal-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', t('help.close'));
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this._closeHelp());

    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'npe-modal-body npe-help-body npe-help-about';
    body.innerHTML = this._buildHelpContent();

    panel.appendChild(header);
    panel.appendChild(body);
    backdrop.appendChild(panel);

    // Close on backdrop click (outside panel)
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this._closeHelp();
    });

    // Close on Escape
    this._helpEscHandler = (e) => {
      if (e.key === 'Escape') this._closeHelp();
    };
    document.addEventListener('keydown', this._helpEscHandler);

    this._shell.appendChild(backdrop);
    this._helpPanel = backdrop;

    // Focus the close button for accessibility
    closeBtn.focus();
  }

  /**
   * Build the HTML content for the Help/About modal: logo, version, GitHub link.
   * @returns {string}
   */
  _buildHelpContent() {
    const t = (key) => this._i18n.t(key);

    return (
      `<img class="npe-help-logo" src="${this._escapeAttr(NPE_LOGO_URL)}" alt="Neiki Page Editor">` +
      `<div class="npe-help-info">` +
      `<div><strong>${this._escapeHtml(t('help.author'))}:</strong> neikiri (Jindřich Stoklasa)</div>` +
      `<div><strong>${this._escapeHtml(t('help.version'))}:</strong> ${this._escapeHtml(NPE_VERSION)}</div>` +
      `<div><strong>${this._escapeHtml(t('help.github'))}:</strong> ` +
      `<a href="${this._escapeAttr(NPE_GITHUB_URL)}" target="_blank" rel="noopener noreferrer">neikiri/neiki-page-editor</a></div>` +
      `</div>`
    );
  }

  _closeHelp() {
    if (this._helpPanel && this._helpPanel.parentNode) {
      this._helpPanel.parentNode.removeChild(this._helpPanel);
    }
    this._helpPanel = null;
    if (this._helpEscHandler) {
      document.removeEventListener('keydown', this._helpEscHandler);
      this._helpEscHandler = null;
    }
  }

  /**
   * Escape an HTML attribute value.
   * @param {string} str
   * @returns {string}
   */
  _escapeAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Escape HTML entities for text content.
   * @param {string} str
   * @returns {string}
   */
  _escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Bind keyboard shortcuts to the host document.
   */
  _bindKeyboardShortcuts() {
    if (!this._shell) return;

    this._onKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      const key = e.key ? e.key.toLowerCase() : '';

      switch (key) {
        case 'b':
          e.preventDefault();
          this._commands && this._commands.execute('bold');
          break;
        case 'i':
          e.preventDefault();
          this._commands && this._commands.execute('italic');
          break;
        case 'u':
          e.preventDefault();
          this._commands && this._commands.execute('underline');
          break;
        case 'k':
          e.preventDefault();
          this._bus.emit('toolbar:insert', 'link');
          break;
        case 's':
          e.preventDefault();
          this.triggerSave();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            this._commands && this._commands.execute('redo');
          } else {
            this._commands && this._commands.execute('undo');
          }
          break;
        case 'y':
          e.preventDefault();
          this._commands && this._commands.execute('redo');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', this._onKeyDown);
  }


  /**
   * Wire lifecycle callbacks (onChange debounced, onFocus, onBlur) to bus events.
   */
  _bindLifecycleCallbacks() {
    // Debounced onChange + word/char stat emission
    this._bus.on('content:change', ({ html } = {}) => {
      if (this._destroyed) return;

      // Emit updated word/char counts with content:change
      this._emitContentStats();

      if (typeof this._opts.onChange !== 'function') return;

      if (this._onChangeTimer !== null) {
        clearTimeout(this._onChangeTimer);
      }
      this._onChangeTimer = setTimeout(() => {
        this._onChangeTimer = null;
        if (!this._destroyed && typeof this._opts.onChange === 'function') {
          this._opts.onChange(html != null ? html : this.getContent());
        }
      }, CHANGE_DEBOUNCE_MS);
    });

    // Track selection change to update block type in status bar
    this._bus.on('selection:change', () => {
      if (this._destroyed) return;
      this._emitBlockType();
    });

    // onFocus
    this._bus.on('canvas:focus', () => {
      if (this._destroyed) return;
      if (typeof this._opts.onFocus === 'function') {
        this._opts.onFocus();
      }
    });

    // onBlur
    this._bus.on('canvas:blur', () => {
      if (this._destroyed) return;
      if (typeof this._opts.onBlur === 'function') {
        this._opts.onBlur();
      }
    });
  }

  /**
   * Compute and emit current word and character counts via 'content:change'.
   * Does NOT re-emit 'content:change' — just updates the status bar directly.
   */
  _emitContentStats() {
    const text = this.getText ? this.getText() : '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    // Update the status bar directly without triggering another content:change loop
    if (this._statusBar) {
      this._statusBar.update({ words, chars });
    }
  }

  /**
   * Determine and emit the current block type for the status bar.
   */
  _emitBlockType() {
    const doc = this._getIframeDoc();
    if (!doc) return;

    let blockName = '';
    try {
      const sel = doc.getSelection();
      if (sel && sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        // Walk up to find the block-level element
        const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE',
          'LI', 'DIV', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'MAIN'];
        while (node && node !== doc.body) {
          if (BLOCK_TAGS.includes(node.nodeName)) {
            blockName = this._blockTagToLabel(node.nodeName);
            break;
          }
          node = node.parentElement;
        }
        if (!blockName && doc.body) blockName = this._i18n.t('heading.paragraph');
      }
    } catch {
      // Guard against iframe access errors
    }

    if (this._statusBar) {
      this._statusBar.update({ block: blockName });
    }
  }

  /**
   * Convert a block tag name to a translated label.
   * @param {string} tagName
   * @returns {string}
   */
  _blockTagToLabel(tagName) {
    const t = this._i18n.t.bind(this._i18n);
    const map = {
      'P': t('heading.paragraph'),
      'H1': t('heading.h1'),
      'H2': t('heading.h2'),
      'H3': t('heading.h3'),
      'H4': t('heading.h4'),
      'H5': t('heading.h5'),
      'H6': t('heading.h6'),
      'BLOCKQUOTE': t('toolbar.blockquote'),
      'PRE': t('toolbar.code'),
      'LI': 'List Item',
      'DIV': t('heading.paragraph'),
    };
    return map[tagName] || tagName.toLowerCase();
  }

  /**
   * Load initial content using loadHandler or initialContent / target element HTML.
   * Fires onReady after content is ready.
   * @returns {Promise<void>}
   */
  async _loadContent() {
    let payload = null;

    if (typeof this._opts.loadHandler === 'function') {
      try {
        payload = await this._opts.loadHandler();
      } catch {
        // loadHandler failed — fall back to initialContent / target HTML
        payload = null;
      }
    }

    if (payload) {
      this._applyLoadPayload(payload);
    } else {
      // Fall back to initialContent or current target innerHTML
      const fallback = this._opts.initialContent ||
        (this._target ? (this._target.innerHTML || '') : '');
      if (fallback && this._serializer) {
        this._serializer.setContent(fallback);
      }
    }

    // Check for autosave draft to restore
    if (this._autosave) {
      const draft = this._autosave.restore();
      if (draft && !payload && !this._opts.initialContent) {
        // Restore draft only when no explicit content was provided
        if (this._serializer) {
          this._serializer.setContent(draft);
        }
      }
    }

    // Emit initial word/char counts
    this._emitContentStats();

    // Autofocus
    if (this._opts.autofocus) {
      this.focus();
    }

    // Emit ready event on the bus; neiki-page-editor.js wires onReady to this
    this._bus.emit('editor:ready');
  }

  /**
   * Apply a LoadPayload to the canvas:
   *  1. Normalize
   *  2. If fullHtml, use FullHtmlParser to extract parts
   *  3. Sanitize body HTML
   *  4. Write content to canvas
   *  5. Inject CSS through StyleManager
   *
   * @param {import('../core/Options').LoadPayload} payload
   */
  _applyLoadPayload(payload) {
    if (!payload || typeof payload !== 'object') return;

    let bodyHtml = '';
    let cssString = typeof payload.css === 'string' ? payload.css : '';
    let cssUrls = Array.isArray(payload.cssUrls) ? payload.cssUrls : [];
    const assetsBaseUrl = typeof payload.assetsBaseUrl === 'string'
      ? payload.assetsBaseUrl
      : (this._opts.assetsBaseUrl || '');

    if (typeof payload.fullHtml === 'string' && payload.fullHtml.trim()) {
      // Parse full HTML document
      const parsed = this._fullHtmlParser
        ? this._fullHtmlParser.parse(payload.fullHtml, {
            stylesheetUrlValidator: this._opts.stylesheetUrlValidator,
          })
        : { bodyHtml: '', styleBlocks: [], cssUrls: [] };

      bodyHtml = parsed.bodyHtml || '';

      // Extracted style blocks go into StyleManager
      if (this._styleManager && parsed.styleBlocks && parsed.styleBlocks.length) {
        this._styleManager.addExtractedStyleBlocks(parsed.styleBlocks);
      }

      // Merge cssUrls from both payload and parsed links
      if (parsed.cssUrls && parsed.cssUrls.length) {
        cssUrls = [...cssUrls, ...parsed.cssUrls];
      }
    } else if (typeof payload.html === 'string') {
      bodyHtml = payload.html;
    }

    // Sanitize body HTML
    if (this._sanitizer && bodyHtml) {
      bodyHtml = this._sanitizer.sanitize(bodyHtml);
    }

    // Write to canvas body
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      body.innerHTML = bodyHtml;
    }

    // Update assetsBaseUrl if provided
    if (assetsBaseUrl) {
      this._assetsBaseUrl = assetsBaseUrl;
    }

    // Store metadata
    if (payload.metadata && typeof payload.metadata === 'object') {
      this._metadata = Object.assign({}, payload.metadata);
    }

    // Store cssUrls
    this._cssUrls = cssUrls.slice();

    // Apply CSS through StyleManager
    if (this._styleManager) {
      if (cssString) {
        this._styleManager.setStyles(cssString);
      }
      if (cssUrls.length) {
        this._styleManager.setExternalLinks(cssUrls);
      }
    }
  }


  // ─── Source View ─────────────────────────────────────────────────────────────

  _openSourceView() {
    if (!this._sourceViewModal) {
      this._sourceViewModal = new SourceViewModal({
        contentSerializer: this._serializer,
        styleManager:      this._styleManager,
        sanitizer:         this._sanitizer,
        i18n:              this._i18n,
        hostEl:            this._shell || document.body,
      });
    }
    this._sourceViewModal.open();
  }

  // ─── Find & Replace ───────────────────────────────────────────────────────────

  _openFindReplace() {
    if (!this._findReplaceModal) {
      this._findReplaceModal = new FindReplaceModal({
        canvasManager: this._canvas,
        i18n:          this._i18n,
        hostEl:        this._shell || document.body,
      });
    }
    this._findReplaceModal.open();
  }

  // ─── Canvas tab shortcuts ─────────────────────────────────────────────────────

  _bindCanvasTabShortcuts() {
    const doc = this._getIframeDoc();
    if (!doc) return;

    const handler = (e) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      if (this._commands) {
        this._commands.execute(e.shiftKey ? 'outdent' : 'indent');
      }
    };

    try {
      doc.addEventListener('keydown', handler);
      this._iframeTabHandler = handler;
    } catch {
      // guard
    }
  }

  /** @returns {Document|null} */
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch {
      return null;
    }
  }

  // ─── Canvas wiring (legacy — kept for backward compatibility) ────────────────

  /**
   * Attach canvas-related managers after the canvas is initialized.
   * In Task 8 the canvas is built internally; this method is kept for compatibility.
   *
   * @param {object} refs
   * @param {import('../canvas/CanvasManager').CanvasManager} refs.canvas
   * @param {import('../canvas/StyleManager').StyleManager} refs.styleManager
   * @param {import('../canvas/ContentSerializer').ContentSerializer} refs.serializer
   * @param {import('../canvas/Sanitizer').Sanitizer} refs.sanitizer
   */
  attachCanvas(refs) {
    this._canvas       = refs.canvas       || this._canvas;
    this._styleManager = refs.styleManager || this._styleManager;
    this._serializer   = refs.serializer   || this._serializer;
    this._sanitizer    = refs.sanitizer    || this._sanitizer;

    // Rebuild commands with the real canvas reference
    if (this._commands) this._commands.destroy();
    this._commands = new CommandRegistry(
      this._canvas,
      this._bus,
      this._styleManager,
      this._sanitizer
    );

    // Rewire toolbar state with the real canvas
    if (this._toolbarState) this._toolbarState.destroy();
    this._toolbarState = new ToolbarState(
      this._toolbarBuilder,
      this._canvas,
      this._bus
    );

    // Wire overlays to the canvas
    if (this._overlayManager) {
      this._overlayManager.attachCanvas(this._canvas);
    }

    this._bindCanvasTabShortcuts();
  }


  // ─── Public accessors for integration ───────────────────────────────────────

  /** @returns {import('../i18n/i18n').I18nInstance} */
  getI18n() { return this._i18n; }

  /** @returns {ToolbarBuilder|null} */
  getToolbarBuilder() { return this._toolbarBuilder; }

  /** @returns {EventBus} */
  getBus() { return this._bus; }

  /** @returns {CommandRegistry|null} */
  getCommandRegistry() { return this._commands; }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** @returns {string} Sanitized HTML of current canvas content */
  getContent() { return this._serializer ? this._serializer.getContent() : ''; }

  /** @param {string} html */
  setContent(html) { if (this._serializer) this._serializer.setContent(html); }

  /**
   * Get current page state as a PagePayload.
   * @returns {{ html: string, css?: string, cssUrls?: string[], assetsBaseUrl?: string, metadata?: object }}
   */
  getPage() {
    const page = {
      html: this.getContent(),
    };

    const css = this.getStyles();
    if (css) page.css = css;

    if (this._cssUrls && this._cssUrls.length) {
      page.cssUrls = this._cssUrls.slice();
    }

    if (this._assetsBaseUrl) {
      page.assetsBaseUrl = this._assetsBaseUrl;
    }

    if (this._metadata && Object.keys(this._metadata).length) {
      page.metadata = Object.assign({}, this._metadata);
    }

    return page;
  }

  /**
   * Load a page payload into the editor.
   * @param {{ html?: string, fullHtml?: string, css?: string, cssUrls?: string[], assetsBaseUrl?: string, metadata?: object }} payload
   */
  setPage(payload) {
    if (!payload || typeof payload !== 'object') return;
    this._applyLoadPayload(payload);
  }

  /** @returns {string} Current page CSS string */
  getStyles() { return this._styleManager ? this._styleManager.getStyles() : ''; }

  /** @param {string} css */
  setStyles(css) { if (this._styleManager) this._styleManager.setStyles(css); }

  /** @returns {string} Plain text of canvas content */
  getText() { return this._serializer ? this._serializer.getText() : ''; }

  /** @returns {boolean} */
  isEmpty() { return this._serializer ? this._serializer.isEmpty() : true; }

  /**
   * Move focus into the iframe canvas body.
   */
  focus() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      try { body.focus(); } catch { /* guard */ }
    }
  }

  /**
   * Move focus away from the iframe canvas body.
   */
  blur() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      try { body.blur(); } catch { /* guard */ }
    }
  }

  /**
   * Re-enable the editor canvas (make it editable again).
   */
  enable() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      body.contentEditable = 'true';
      body.setAttribute('aria-disabled', 'false');
    }
    if (this._shell) {
      this._shell.classList.remove('npe-disabled');
    }
  }

  /**
   * Disable editing on the canvas (read-only mode).
   */
  disable() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      body.contentEditable = 'false';
      body.setAttribute('aria-disabled', 'true');
    }
    if (this._shell) {
      this._shell.classList.add('npe-disabled');
    }
  }


  /**
   * Trigger a save operation.
   * Calls saveHandler with the current page payload, fires onSave on success,
   * and shows a non-blocking toast on failure.
   * @returns {Promise<void>}
   */
  async triggerSave() {
    const payload = this.getPage();

    if (typeof this._opts.saveHandler === 'function') {
      try {
        await this._opts.saveHandler(payload);
        // Success — clear autosave draft and fire onSave
        if (this._autosave) this._autosave.clear();
        if (typeof this._opts.onSave === 'function') {
          this._opts.onSave(payload);
        }
        this._bus.emit('editor:saved', payload);
      } catch (err) {
        // Show non-blocking toast on save failure
        this._showSaveErrorToast();
        this._bus.emit('editor:saveFailed', err);
        // Re-throw so callers can handle if needed (but wrapped to not break)
        throw err;
      }
    } else {
      // No saveHandler — just clear autosave draft and fire onSave if present
      if (this._autosave) this._autosave.clear();
      if (typeof this._opts.onSave === 'function') {
        this._opts.onSave(payload);
      }
      this._bus.emit('editor:saved', payload);
    }
  }

  /**
   * Show a non-blocking toast message for save failure.
   * Auto-dismisses after TOAST_DURATION_MS. Uses npe- prefixed class names.
   */
  _showSaveErrorToast() {
    if (!this._shell) return;

    // Remove any existing toast first (idempotent)
    const existing = this._shell.querySelector('.npe-toast');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const toast = document.createElement('div');
    toast.className = 'npe-toast npe-toast--error';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.textContent = this._i18n.t('error.saveFailed');

    this._shell.appendChild(toast);

    // Auto-dismiss
    const timer = setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, TOAST_DURATION_MS);

    // Store timer reference so destroy() can clear it
    if (!this._toastTimers) this._toastTimers = [];
    this._toastTimers.push(timer);
  }

  /**
   * Toggle fullscreen mode for the editor shell.
   */
  toggleFullscreen() {
    if (!this._shell) return;
    this._fullscreen = !this._fullscreen;
    if (this._fullscreen) {
      this._shell.classList.add('npe-fullscreen');
    } else {
      this._shell.classList.remove('npe-fullscreen');
    }
    this._bus.emit('editor:fullscreenChange', this._fullscreen);
  }

  // ─── Theme API ───────────────────────────────────────────────────────────────

  /** @param {string} name */
  setTheme(name) {
    if (this._themeManager) this._themeManager.setTheme(name);
  }

  toggleTheme() {
    if (this._themeManager) this._themeManager.toggleTheme();
  }

  /** @returns {string} */
  getTheme() {
    return this._themeManager ? this._themeManager.getTheme() : this._opts.theme;
  }


  /**
   * Destroy this editor instance.
   * Removes all DOM nodes, clears the event bus, and restores the target.
   * Idempotent — safe to call multiple times.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    // Clear debounce timer
    if (this._onChangeTimer !== null) {
      clearTimeout(this._onChangeTimer);
      this._onChangeTimer = null;
    }

    // Clear toast timers
    if (this._toastTimers) {
      for (const t of this._toastTimers) clearTimeout(t);
      this._toastTimers = [];
    }

    // Remove keyboard shortcut listener
    if (this._onKeyDown) {
      document.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }

    // Remove iframe Tab handler
    const doc = this._getIframeDoc();
    if (doc && this._iframeTabHandler) {
      try { doc.removeEventListener('keydown', this._iframeTabHandler); } catch { /* ignore */ }
      this._iframeTabHandler = null;
    }

    // Close and destroy modals
    if (this._modalManager) {
      this._modalManager.destroy();
      this._modalManager = null;
    }
    if (this._sourceViewModal) {
      this._sourceViewModal.destroy();
      this._sourceViewModal = null;
    }
    if (this._findReplaceModal) {
      this._findReplaceModal.destroy();
      this._findReplaceModal = null;
    }

    // Destroy commands
    if (this._commands) {
      this._commands.destroy();
      this._commands = null;
    }

    // Destroy overlay manager
    if (this._overlayManager) {
      this._overlayManager.destroy();
      this._overlayManager = null;
    }

    // Destroy toolbar state and builder
    if (this._toolbarState) {
      this._toolbarState.destroy();
      this._toolbarState = null;
    }

    if (this._toolbarBuilder) {
      this._toolbarBuilder.destroy();
      this._toolbarBuilder = null;
    }

    // Destroy canvas (removes iframe from DOM)
    if (this._canvas) {
      this._canvas.destroy();
      this._canvas = null;
    }

    // Destroy style manager
    if (this._styleManager) {
      this._styleManager.destroy();
      this._styleManager = null;
    }

    // Destroy theme manager
    if (this._themeManager) {
      this._themeManager.destroy();
      this._themeManager = null;
    }

    // Destroy status bar
    if (this._statusBar) {
      this._statusBar.destroy();
      this._statusBar = null;
    }

    // Destroy autosave manager
    if (this._autosave) {
      this._autosave.destroy();
      this._autosave = null;
    }

    // Close help panel if open
    this._closeHelp();

    // Destroy event bus
    this._bus.destroy();

    // Remove all remaining .npe-* nodes from shell (overlays, toasts, etc.)
    if (this._shell) {
      const npeNodes = this._shell.querySelectorAll('[class*="npe-"]');
      for (const node of Array.from(npeNodes)) {
        if (node.parentNode) node.parentNode.removeChild(node);
      }
      // Remove the shell itself
      if (this._shell.parentNode) {
        this._shell.parentNode.removeChild(this._shell);
      }
    }
    this._shell = null;
    this._toolbarEl = null;
    this._canvasWrapper = null;

    // Restore target element visibility/state
    // (target itself is never removed — it is the user's element)
  }
}

export default Editor;
