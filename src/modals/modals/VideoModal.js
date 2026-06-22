/**
 * VideoModal — Insert a video via URL or file upload.
 *
 * Tabs:
 *  - URL: text input for video URL (also accepts embed URLs)
 *  - Upload: file input
 *
 * Upload flow:
 *  1. If videoUploadHandler is provided — call it with the File; await the returned URL.
 *  2. If allowDataUris is true and no handler — embed as base64 data URI.
 *  3. Otherwise — show error; no silent embedding.
 *
 * Allowed MIME types for data URIs: video/mp4, video/webm.
 */

import { _handleModalKey, _escapeAttr } from './LinkModal.js';

const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/webm']);

export class VideoModal {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   * @param {Function} opts.onClose
   * @param {Function} opts.onInsert
   * @param {Function|null} [opts.videoUploadHandler]
   * @param {boolean} [opts.allowDataUris]
   */
  constructor(opts = {}) {
    this._i18n          = opts.i18n || { t: k => k };
    this._hostEl        = opts.hostEl || document.body;
    this._onClose       = opts.onClose || (() => {});
    this._onInsert      = opts.onInsert || (() => {});
    this._uploadHandler = opts.videoUploadHandler || null;
    this._allowDataUris = opts.allowDataUris === true;

    this._backdrop  = null;
    this._modal     = null;
    this._onKeyDown = null;
    this._destroyed = false;
    this._activeTab = 'url';
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  open(data = {}) {
    if (this._modal) return;
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

    const backdrop = document.createElement('div');
    backdrop.className = 'npe-modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) this._onClose(); });

    const modal = document.createElement('div');
    modal.className = 'npe-modal npe-video-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'npe-video-title');
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Header
    const header = document.createElement('div');
    header.className = 'npe-modal-header';

    const title = document.createElement('h2');
    title.id = 'npe-video-title';
    title.className = 'npe-modal-title';
    title.textContent = t('modal.video.title');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'npe-modal-close';
    closeBtn.setAttribute('aria-label', t('modal.common.close'));
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this._onClose());

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Tabs
    const tabBar = document.createElement('div');
    tabBar.className = 'npe-modal-tabs';
    tabBar.setAttribute('role', 'tablist');

    const urlTabBtn    = this._makeTabBtn(t('modal.video.urlTab'),    'url',    true);
    const uploadTabBtn = this._makeTabBtn(t('modal.video.uploadTab'), 'upload', false);
    tabBar.appendChild(urlTabBtn);
    tabBar.appendChild(uploadTabBtn);

    // URL Panel
    const urlPanel = document.createElement('div');
    urlPanel.className = 'npe-modal-panel';
    urlPanel.id = 'npe-video-panel-url';
    urlPanel.setAttribute('role', 'tabpanel');

    const urlLabel = document.createElement('label');
    urlLabel.className = 'npe-form-label';
    urlLabel.setAttribute('for', 'npe-video-url');
    urlLabel.textContent = t('modal.video.url');

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.id = 'npe-video-url';
    urlInput.className = 'npe-form-input';
    urlInput.value = data.src || '';
    urlInput.setAttribute('placeholder', 'https://');
    urlInput.setAttribute('autocomplete', 'off');
    this._urlInput = urlInput;

    urlPanel.appendChild(urlLabel);
    urlPanel.appendChild(urlInput);

    // Upload Panel
    const uploadPanel = document.createElement('div');
    uploadPanel.className = 'npe-modal-panel';
    uploadPanel.id = 'npe-video-panel-upload';
    uploadPanel.setAttribute('role', 'tabpanel');
    uploadPanel.setAttribute('hidden', '');

    const dropzone = document.createElement('div');
    dropzone.className = 'npe-dropzone';
    dropzone.textContent = t('modal.video.upload');
    this._setupDropzone(dropzone);

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'npe-video-file';
    fileInput.className = 'npe-file-input';
    fileInput.accept = Array.from(ALLOWED_VIDEO_MIME).join(',');
    fileInput.setAttribute('aria-label', t('modal.video.upload'));
    fileInput.addEventListener('change', () => this._handleFiles(fileInput.files));
    this._fileInput = fileInput;

    const progressEl = document.createElement('div');
    progressEl.className = 'npe-upload-progress';
    progressEl.setAttribute('hidden', '');
    this._progressEl = progressEl;

    const errorEl = document.createElement('div');
    errorEl.className = 'npe-upload-error';
    errorEl.setAttribute('hidden', '');
    this._errorEl = errorEl;

    uploadPanel.appendChild(dropzone);
    uploadPanel.appendChild(fileInput);
    uploadPanel.appendChild(progressEl);
    uploadPanel.appendChild(errorEl);

    // Tab switching
    urlTabBtn.addEventListener('click', () => this._switchTab('url', urlTabBtn, uploadTabBtn, urlPanel, uploadPanel));
    uploadTabBtn.addEventListener('click', () => this._switchTab('upload', uploadTabBtn, urlTabBtn, uploadPanel, urlPanel));

    // Footer
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

    footer.appendChild(cancelBtn);
    footer.appendChild(insertBtn);

    // Assemble
    modal.appendChild(header);
    modal.appendChild(tabBar);
    modal.appendChild(urlPanel);
    modal.appendChild(uploadPanel);
    modal.appendChild(footer);

    this._backdrop  = backdrop;
    this._modal     = modal;
  }

  _makeTabBtn(label, id, active) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'npe-tab' + (active ? ' npe-tab-active' : '');
    btn.dataset.tab = id;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
    btn.textContent = label;
    return btn;
  }

  _switchTab(id, activateBtn, deactivateBtn, showPanel, hidePanel) {
    this._activeTab = id;
    activateBtn.classList.add('npe-tab-active');
    activateBtn.setAttribute('aria-selected', 'true');
    deactivateBtn.classList.remove('npe-tab-active');
    deactivateBtn.setAttribute('aria-selected', 'false');
    showPanel.removeAttribute('hidden');
    hidePanel.setAttribute('hidden', '');
  }

  _setupDropzone(dropzone) {
    dropzone.addEventListener('click', () => {
      if (this._fileInput) this._fileInput.click();
    });
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('npe-dropzone-active');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('npe-dropzone-active');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('npe-dropzone-active');
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this._handleFiles(e.dataTransfer.files);
      }
    });
  }

  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._urlInput) this._urlInput.focus();
    this._onKeyDown = (e) => _handleModalKey(e, this._modal, () => this._onClose());
    document.addEventListener('keydown', this._onKeyDown);
  }

  // ─── Insert logic ─────────────────────────────────────────────────────────────

  _handleInsert() {
    if (this._activeTab === 'url') {
      const src = this._urlInput ? this._urlInput.value.trim() : '';
      if (!src) { if (this._urlInput) this._urlInput.focus(); return; }
      this._onInsert(`<video src="${_escapeAttr(src)}" controls></video>`);
      this._onClose();
    }
  }

  async _handleFiles(files) {
    if (!files || files.length === 0) return;
    const file = files[0]; // video: single file
    if (!ALLOWED_VIDEO_MIME.has(file.type)) return;

    const t = this._i18n.t.bind(this._i18n);
    this._showProgress(true);
    this._showError('');

    if (this._uploadHandler) {
      try {
        const url = await this._uploadHandler(file);
        if (url) {
          this._onInsert(`<video src="${_escapeAttr(url)}" controls></video>`);
          this._onClose();
        }
      } catch {
        this._showError(t('error.uploadFailed', { file: file.name }));
      }
    } else if (this._allowDataUris) {
      try {
        const dataUrl = await _fileToDataUrl(file);
        this._onInsert(`<video src="${_escapeAttr(dataUrl)}" controls></video>`);
        this._onClose();
      } catch {
        this._showError(t('error.uploadFailed', { file: file.name }));
      }
    } else {
      this._showError(t('error.dataUrisDisabled'));
    }

    this._showProgress(false);
  }

  _showProgress(show) {
    if (!this._progressEl) return;
    if (show) this._progressEl.removeAttribute('hidden');
    else this._progressEl.setAttribute('hidden', '');
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

  // ─── Teardown ─────────────────────────────────────────────────────────────────

  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener('keydown', this._onKeyDown);
      this._onKeyDown = null;
    }
    // Modal is a child of backdrop — removing backdrop removes both.
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop  = null;
    this._modal     = null;
    this._urlInput  = null;
    this._fileInput = null;
    this._progressEl = null;
    this._errorEl   = null;
  }
}

export default VideoModal;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function _fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(/** @type {string} */ (reader.result));
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}
