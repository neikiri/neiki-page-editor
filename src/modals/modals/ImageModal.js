/**
 * ImageModal — Insert an image via file upload or URL.
 *
 * Single-panel layout (matches Neiki's Editor reference):
 *
 *   Upload Image [dashed zone — click or drag-drop]
 *   ─────────── OR ───────────
 *   Image URL   [input]
 *   Alt Text    [input]
 *   Width (optional) [input]
 *
 * Upload flow:
 *  1. imageUploadHandler provided → call it with each File; await URLs.
 *  2. No handler, allowDataUris true → read as base64.
 *  3. Single file, no handler, no allowDataUris → base64 preview shown in URL field.
 *  4. No handler, no allowDataUris → show error; never embed silently.
 *
 * Allowed MIME types for data URIs: image/png, jpeg, gif, webp, avif.
 * SVG is never allowed as data URI.
 */

import { _handleModalKey, _escapeAttr } from './LinkModal.js';

const ALLOWED_IMAGE_MIME = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif',
]);

const IMAGE_ICON_SVG = `<svg viewBox="0 0 24 24" fill="currentColor">
  <rect x="2" y="4" width="20" height="16" rx="2" fill="#1a73e8"/>
  <path d="M2 16l5-5 3.5 3.5 4-5 7.5 9.5H2v-3z" fill="white" opacity="0.9"/>
  <circle cx="8" cy="9" r="2" fill="white" opacity="0.9"/>
</svg>`;

export class ImageModal {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   * @param {Function} opts.onClose
   * @param {Function} opts.onInsert — called with HTML string to insert
   * @param {Function|null} [opts.imageUploadHandler]
   * @param {boolean} [opts.allowDataUris]
   */
  constructor(opts = {}) {
    this._i18n          = opts.i18n || { t: k => k };
    this._hostEl        = opts.hostEl || document.body;
    this._onClose       = opts.onClose || (() => {});
    this._onInsert      = opts.onInsert || (() => {});
    this._uploadHandler = opts.imageUploadHandler || null;
    this._allowDataUris = opts.allowDataUris === true;

    this._backdrop    = null;
    this._modal       = null;
    this._onKeyDown   = null;
    this._destroyed   = false;

    // Upload state
    /** @type {File[]} */
    this._pendingFiles    = [];
    this._uploadDragCount = 0;

    // DOM refs
    this._urlInput    = null;
    this._altInput    = null;
    this._widthInput  = null;
    this._fileInput   = null;
    this._uploadZone  = null;
    this._uploadFiles = null;
    this._insertBtn   = null;
    this._errorEl     = null;
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  open(data = {}) {
    if (this._modal) return;
    this._pendingFiles    = [];
    this._uploadDragCount = 0;
    this._build(data);
    this._show();
  }

  close() {
    this._teardown();
  }

  destroy() {
    this._destroyed = true;
    this._teardown();
  }

  // ─── Build ────────────────────────────────────────────────────────────────────

  _build(data = {}) {
    const t = this._i18n.t.bind(this._i18n);
    const hasUploadHandler = typeof this._uploadHandler === 'function';
    const uploadHint = hasUploadHandler
      ? t('modal.image.uploadHintHandler')
      : t('modal.image.uploadHintBase64');

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'npe-modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) this._onClose();
    });

    // Modal
    const modal = document.createElement('div');
    modal.className = 'npe-modal npe-image-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'npe-image-title');
    modal.addEventListener('click', (e) => e.stopPropagation());

    // ── Header ──────────────────────────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'npe-modal-header';

    const title = document.createElement('h2');
    title.id = 'npe-image-title';
    title.className = 'npe-modal-title';
    title.textContent = t('modal.image.title');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'npe-modal-close';
    closeBtn.setAttribute('aria-label', t('modal.common.close'));
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => this._onClose());

    header.appendChild(title);
    header.appendChild(closeBtn);

    // ── Body ────────────────────────────────────────────────────────────────────
    const body = document.createElement('div');
    body.className = 'npe-modal-body';

    // ── Upload section ──────────────────────────────────────────────────────────
    const uploadGroup = document.createElement('div');
    uploadGroup.className = 'npe-form-group';

    const uploadLabel = document.createElement('label');
    uploadLabel.className = 'npe-form-label';
    uploadLabel.textContent = t('modal.image.uploadLabel');

    // Hidden file input (absolute-positioned, off-screen)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.className = 'npe-file-input';
    fileInput.accept = Array.from(ALLOWED_IMAGE_MIME).join(',');
    fileInput.multiple = true;
    fileInput.setAttribute('aria-label', t('modal.image.uploadLabel'));
    fileInput.addEventListener('change', () => this._handleSelectedFiles(fileInput.files));
    this._fileInput = fileInput;

    // Upload zone
    const uploadZone = document.createElement('div');
    uploadZone.className = 'npe-image-upload-zone';
    uploadZone.setAttribute('role', 'button');
    uploadZone.setAttribute('tabindex', '0');
    this._uploadZone = uploadZone;

    const uploadIcon = document.createElement('div');
    uploadIcon.className = 'npe-image-upload-icon';
    uploadIcon.setAttribute('aria-hidden', 'true');
    uploadIcon.innerHTML = IMAGE_ICON_SVG;

    const uploadTitle = document.createElement('div');
    uploadTitle.className = 'npe-image-upload-title';
    uploadTitle.textContent = t('modal.image.uploadLabel');

    const uploadHintEl = document.createElement('div');
    uploadHintEl.className = 'npe-image-upload-hint';
    uploadHintEl.textContent = uploadHint;

    const uploadFilesEl = document.createElement('div');
    uploadFilesEl.className = 'npe-image-upload-files';
    uploadFilesEl.setAttribute('aria-live', 'polite');
    this._uploadFiles = uploadFilesEl;

    uploadZone.appendChild(uploadIcon);
    uploadZone.appendChild(uploadTitle);
    uploadZone.appendChild(uploadHintEl);
    uploadZone.appendChild(uploadFilesEl);

    // Upload zone interactions
    uploadZone.addEventListener('click', (e) => {
      if (e.target !== fileInput) fileInput.click();
    });
    uploadZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
    });
    uploadZone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      this._uploadDragCount++;
      uploadZone.classList.add('drag-over');
    });
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    uploadZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this._uploadDragCount--;
      if (this._uploadDragCount <= 0) {
        this._uploadDragCount = 0;
        uploadZone.classList.remove('drag-over');
      }
    });
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this._uploadDragCount = 0;
      uploadZone.classList.remove('drag-over');
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this._handleSelectedFiles(e.dataTransfer.files);
      }
    });

    uploadGroup.appendChild(uploadLabel);
    uploadGroup.appendChild(fileInput);
    uploadGroup.appendChild(uploadZone);

    // ── OR divider ───────────────────────────────────────────────────────────────
    const divider = document.createElement('div');
    divider.className = 'npe-form-divider';
    const dividerSpan = document.createElement('span');
    dividerSpan.textContent = t('modal.image.or');
    divider.appendChild(dividerSpan);

    // ── URL input ────────────────────────────────────────────────────────────────
    const urlGroup = document.createElement('div');
    urlGroup.className = 'npe-form-group';

    const urlLabel = document.createElement('label');
    urlLabel.className = 'npe-form-label';
    urlLabel.setAttribute('for', 'npe-image-url');
    urlLabel.textContent = t('modal.image.url');

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.id = 'npe-image-url';
    urlInput.className = 'npe-form-input';
    urlInput.value = data.src || '';
    urlInput.setAttribute('placeholder', 'https://example.com/image.jpg');
    urlInput.setAttribute('autocomplete', 'off');
    // If user types into URL, clear file selection
    urlInput.addEventListener('input', () => {
      if (!urlInput.value) {
        this._pendingFiles = [];
        this._updateUploadFeedback([]);
        urlInput.disabled = false;
        if (fileInput) fileInput.value = '';
      }
    });
    this._urlInput = urlInput;

    urlGroup.appendChild(urlLabel);
    urlGroup.appendChild(urlInput);

    // ── Alt text ─────────────────────────────────────────────────────────────────
    const altGroup = document.createElement('div');
    altGroup.className = 'npe-form-group';

    const altLabel = document.createElement('label');
    altLabel.className = 'npe-form-label';
    altLabel.setAttribute('for', 'npe-image-alt');
    altLabel.textContent = t('modal.image.alt');

    const altInput = document.createElement('input');
    altInput.type = 'text';
    altInput.id = 'npe-image-alt';
    altInput.className = 'npe-form-input';
    altInput.value = data.alt || '';
    altInput.setAttribute('placeholder', t('modal.image.altPlaceholder'));
    altInput.setAttribute('autocomplete', 'off');
    this._altInput = altInput;

    altGroup.appendChild(altLabel);
    altGroup.appendChild(altInput);

    // ── Width (optional) ──────────────────────────────────────────────────────────
    const widthGroup = document.createElement('div');
    widthGroup.className = 'npe-form-group';

    const widthLabel = document.createElement('label');
    widthLabel.className = 'npe-form-label';
    widthLabel.setAttribute('for', 'npe-image-width');
    widthLabel.textContent = t('modal.image.width');

    const widthInput = document.createElement('input');
    widthInput.type = 'text';
    widthInput.id = 'npe-image-width';
    widthInput.className = 'npe-form-input';
    widthInput.value = data.width || '';
    widthInput.setAttribute('placeholder', t('modal.image.widthPlaceholder'));
    widthInput.setAttribute('autocomplete', 'off');
    this._widthInput = widthInput;

    widthGroup.appendChild(widthLabel);
    widthGroup.appendChild(widthInput);

    // ── Error display ─────────────────────────────────────────────────────────────
    const errorEl = document.createElement('div');
    errorEl.className = 'npe-upload-error';
    errorEl.setAttribute('hidden', '');
    this._errorEl = errorEl;

    body.appendChild(uploadGroup);
    body.appendChild(divider);
    body.appendChild(urlGroup);
    body.appendChild(altGroup);
    body.appendChild(widthGroup);
    body.appendChild(errorEl);

    // ── Footer ───────────────────────────────────────────────────────────────────
    const footer = document.createElement('div');
    footer.className = 'npe-modal-footer';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'npe-btn';
    cancelBtn.textContent = t('modal.common.cancel');
    cancelBtn.addEventListener('click', () => this._onClose());

    const insertBtn = document.createElement('button');
    insertBtn.type = 'button';
    insertBtn.className = 'npe-btn npe-btn-primary';
    insertBtn.textContent = t('modal.common.insert');
    insertBtn.addEventListener('click', () => this._handleInsert());
    this._insertBtn = insertBtn;

    footer.appendChild(cancelBtn);
    footer.appendChild(insertBtn);

    // ── Assemble ──────────────────────────────────────────────────────────────────
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);

    this._backdrop = backdrop;
    this._modal    = modal;
  }

  // ─── File selection ───────────────────────────────────────────────────────────

  /**
   * Called when files are selected via input or drag-drop into the zone.
   * @param {FileList|File[]} fileList
   */
  _handleSelectedFiles(fileList) {
    const selected   = Array.from(fileList || []);
    const valid      = selected.filter(f => ALLOWED_IMAGE_MIME.has(f.type));
    const invalid    = selected.filter(f => !ALLOWED_IMAGE_MIME.has(f.type));

    if (invalid.length > 0) {
      this._showError(this._i18n.t('modal.image.invalidFile'));
    } else {
      this._showError('');
    }

    if (valid.length === 0) {
      this._pendingFiles = [];
      this._updateUploadFeedback([]);
      if (this._urlInput) this._urlInput.disabled = false;
      return;
    }

    this._pendingFiles = valid;
    this._updateUploadFeedback(valid);

    const hasUploadHandler = typeof this._uploadHandler === 'function';

    if (valid.length === 1 && !hasUploadHandler) {
      // Single file without handler: preview as base64 in URL field
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (this._urlInput) {
          this._urlInput.value = /** @type {string} */ (ev.target.result);
          this._urlInput.disabled = true;
        }
      };
      reader.readAsDataURL(valid[0]);
    } else {
      if (this._urlInput) {
        this._urlInput.value = '';
        this._urlInput.disabled = true;
      }
    }
  }

  /**
   * @param {File[]} files
   */
  _updateUploadFeedback(files) {
    const zone = this._uploadZone;
    const filesEl = this._uploadFiles;
    if (zone) zone.classList.toggle('has-files', files.length > 0);
    if (filesEl) filesEl.textContent = files.map(f => f.name).join(', ');
  }

  // ─── Insert ───────────────────────────────────────────────────────────────────

  async _handleInsert() {
    const t   = this._i18n.t.bind(this._i18n);
    const alt   = this._altInput   ? this._altInput.value.trim()   : '';
    const width = this._widthInput ? this._widthInput.value.trim() : '';

    const widthAttr = width ? ` style="width:${_escapeAttr(width)}"` : '';

    const hasUploadHandler = typeof this._uploadHandler === 'function';

    if (this._pendingFiles.length > 0 && hasUploadHandler) {
      // Upload each file through the handler
      if (this._insertBtn) { this._insertBtn.disabled = true; this._insertBtn.textContent = t('modal.image.uploading'); }
      try {
        const parts = [];
        for (const file of this._pendingFiles) {
          const url = await this._uploadHandler(file);
          if (url) {
            parts.push(`<img src="${_escapeAttr(url)}" alt="${_escapeAttr(alt || file.name)}"${widthAttr}>`);
          }
        }
        if (parts.length > 0) {
          this._onInsert(parts.join(''));
        }
      } catch {
        this._showError(t('error.uploadFailed'));
        if (this._insertBtn) { this._insertBtn.disabled = false; this._insertBtn.textContent = t('modal.common.insert'); }
        return;
      }
      this._onClose();
      return;
    }

    if (this._pendingFiles.length > 1) {
      // Multiple files without handler: insert each as base64
      if (this._insertBtn) { this._insertBtn.disabled = true; this._insertBtn.textContent = t('modal.image.uploading'); }
      const parts = [];
      for (const file of this._pendingFiles) {
        try {
          const dataUrl = await _fileToDataUrl(file);
          parts.push(`<img src="${_escapeAttr(dataUrl)}" alt="${_escapeAttr(alt || file.name)}"${widthAttr}>`);
        } catch {
          this._showError(t('error.uploadFailed'));
        }
      }
      if (parts.length > 0) {
        this._onInsert(parts.join(''));
      }
      this._onClose();
      return;
    }

    // Single file (already in URL input as base64) or direct URL entry
    const src = this._urlInput ? this._urlInput.value.trim() : '';
    if (!src) {
      if (this._urlInput) this._urlInput.focus();
      return;
    }
    this._onInsert(`<img src="${_escapeAttr(src)}" alt="${_escapeAttr(alt)}"${widthAttr}>`);
    this._onClose();
  }

  _showError(msg) {
    if (!this._errorEl) return;
    if (msg) {
      this._errorEl.textContent = msg;
      this._errorEl.removeAttribute('hidden');
    } else {
      this._errorEl.textContent = '';
      this._errorEl.setAttribute('hidden', '');
    }
  }

  // ─── Show / Teardown ──────────────────────────────────────────────────────────

  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._urlInput) this._urlInput.focus();
    this._onKeyDown = (e) => _handleModalKey(e, this._modal, () => this._onClose());
    document.addEventListener('keydown', this._onKeyDown);
  }

  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop    = null;
    this._modal       = null;
    this._urlInput    = null;
    this._altInput    = null;
    this._widthInput  = null;
    this._fileInput   = null;
    this._uploadZone  = null;
    this._uploadFiles = null;
    this._insertBtn   = null;
    this._errorEl     = null;
    this._pendingFiles    = [];
    this._uploadDragCount = 0;
  }
}

export default ImageModal;

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * @param {File} file
 * @returns {Promise<string>}
 */
function _fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(/** @type {string} */ (reader.result));
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}
