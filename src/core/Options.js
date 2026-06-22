/**
 * Options — normalization and defaults for EditorOptions.
 * Call normalizeOptions(raw) to get a fully-resolved options object.
 */

export const DEFAULT_TOOLBAR = [
  'viewCode', 'undo', 'redo', 'findReplace', '|',
  'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'code', 'removeFormat', '|',
  'heading', 'fontFamily', 'fontSize', '|',
  'foreColor', 'backColor', '|',
  'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', '|',
  'indent', 'outdent', '|',
  'bulletList', 'numberedList', 'blockquote', 'horizontalRule', '|',
  'insertDropdown', '|',
  'moreMenu',
];

/** @type {string[]} */
export const VALID_THEMES = ['light', 'dark', 'blue', 'dark-blue', 'midnight'];

/** @type {string[]} */
export const VALID_EDIT_MODES = ['body', 'regions'];

/**
 * Default option values.
 * @type {import('./Options').EditorOptions}
 */
export const DEFAULTS = {
  initialContent: '',
  pageStyles: '',
  cssUrls: [],
  assetsBaseUrl: '',

  minHeight: 300,
  maxHeight: null,

  autofocus: false,
  spellcheck: true,
  readonly: false,

  editMode: 'body',
  editableSelector: '[data-npe-editable]',

  theme: 'light',
  persistTheme: false,
  language: 'en',
  translations: {},
  customClass: null,

  toolbar: DEFAULT_TOOLBAR,
  showHelp: true,

  loadHandler: null,
  saveHandler: null,

  stylesheetUrlValidator: null,
  imageUploadHandler: null,
  videoUploadHandler: null,
  allowDataUris: false,
  autosaveKey: null,

  onReady: null,
  onChange: null,
  onSave: null,
  onFocus: null,
  onBlur: null,
};

/**
 * Normalize and validate raw user-supplied options against the defaults.
 * Unknown keys are ignored. Invalid values are replaced with defaults.
 *
 * @param {Partial<import('./Options').EditorOptions>} raw
 * @returns {import('./Options').EditorOptions}
 */
export function normalizeOptions(raw = {}) {
  const opts = Object.assign({}, DEFAULTS);

  // String / content
  if (typeof raw.initialContent === 'string') opts.initialContent = raw.initialContent;
  if (typeof raw.pageStyles === 'string') opts.pageStyles = raw.pageStyles;
  if (typeof raw.assetsBaseUrl === 'string') opts.assetsBaseUrl = raw.assetsBaseUrl;

  // cssUrls — must be array of strings
  if (Array.isArray(raw.cssUrls)) {
    opts.cssUrls = raw.cssUrls.filter(u => typeof u === 'string');
  }

  // Numbers
  if (typeof raw.minHeight === 'number' && raw.minHeight >= 0) {
    opts.minHeight = raw.minHeight;
  }
  if (raw.maxHeight === null || (typeof raw.maxHeight === 'number' && raw.maxHeight > 0)) {
    opts.maxHeight = raw.maxHeight;
  }

  // Booleans
  for (const key of ['autofocus', 'spellcheck', 'readonly', 'persistTheme', 'allowDataUris', 'showHelp']) {
    if (typeof raw[key] === 'boolean') opts[key] = raw[key];
  }

  // editMode
  if (VALID_EDIT_MODES.includes(raw.editMode)) {
    opts.editMode = raw.editMode;
  }

  // editableSelector
  if (typeof raw.editableSelector === 'string' && raw.editableSelector.trim()) {
    opts.editableSelector = raw.editableSelector.trim();
  }

  // theme
  if (VALID_THEMES.includes(raw.theme)) {
    opts.theme = raw.theme;
  }

  // language
  if (typeof raw.language === 'string' && raw.language.trim()) {
    opts.language = raw.language.trim();
  }

  // translations
  if (raw.translations && typeof raw.translations === 'object' && !Array.isArray(raw.translations)) {
    opts.translations = Object.assign({}, raw.translations);
  }

  // customClass
  if (typeof raw.customClass === 'string' || raw.customClass === null) {
    opts.customClass = raw.customClass;
  }

  // toolbar
  if (Array.isArray(raw.toolbar) && raw.toolbar.length > 0) {
    opts.toolbar = raw.toolbar.filter(item => typeof item === 'string');
  }

  // autosaveKey
  if (typeof raw.autosaveKey === 'string' || raw.autosaveKey === null) {
    opts.autosaveKey = raw.autosaveKey;
  }

  // Callbacks — must be functions
  for (const key of [
    'loadHandler', 'saveHandler', 'stylesheetUrlValidator',
    'imageUploadHandler', 'videoUploadHandler',
    'onReady', 'onChange', 'onSave', 'onFocus', 'onBlur',
  ]) {
    if (typeof raw[key] === 'function') opts[key] = raw[key];
    else if (raw[key] != null && typeof raw[key] !== 'function') opts[key] = null; // coerce invalid
  }

  return opts;
}

export default normalizeOptions;
