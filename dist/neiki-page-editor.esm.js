/* neiki-page-editor | Source Available License */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/core/EventBus.js
var EventBus = class {
  constructor() {
    this._listeners = /* @__PURE__ */ new Map();
    this._destroyed = false;
  }
  /**
   * Subscribe to an event.
   * @param {string} event
   * @param {Function} handler
   * @returns {() => void} Unsubscribe function
   */
  on(event, handler) {
    if (this._destroyed) return () => {
    };
    if (!this._listeners.has(event)) {
      this._listeners.set(event, /* @__PURE__ */ new Set());
    }
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }
  /**
   * Unsubscribe a specific handler from an event.
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    const set = this._listeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        this._listeners.delete(event);
      }
    }
  }
  /**
   * Emit an event, invoking all subscribed handlers.
   * Handlers are called synchronously in subscription order.
   * @param {string} event
   * @param {...unknown} args
   */
  emit(event, ...args) {
    if (this._destroyed) return;
    const set = this._listeners.get(event);
    if (!set) return;
    for (const handler of Array.from(set)) {
      try {
        handler(...args);
      } catch (err) {
      }
    }
  }
  /**
   * Remove all listeners and mark the bus as destroyed.
   * Idempotent — safe to call multiple times.
   */
  destroy() {
    this._listeners.clear();
    this._destroyed = true;
  }
};

// src/core/Options.js
var DEFAULT_TOOLBAR = [
  "viewCode",
  "undo",
  "redo",
  "findReplace",
  "|",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "superscript",
  "subscript",
  "code",
  "removeFormat",
  "|",
  "heading",
  "fontFamily",
  "fontSize",
  "|",
  "foreColor",
  "backColor",
  "|",
  "alignLeft",
  "alignCenter",
  "alignRight",
  "alignJustify",
  "|",
  "indent",
  "outdent",
  "|",
  "bulletList",
  "numberedList",
  "blockquote",
  "horizontalRule",
  "|",
  "insertDropdown",
  "|",
  "moreMenu"
];
var VALID_THEMES = ["light", "dark", "blue", "dark-blue", "midnight", "void", "autumn"];
var VALID_EDIT_MODES = ["body", "regions"];
var DEFAULTS = {
  initialContent: "",
  pageStyles: "",
  cssUrls: [],
  assetsBaseUrl: "",
  minHeight: 300,
  maxHeight: null,
  autofocus: false,
  spellcheck: true,
  readonly: false,
  editMode: "body",
  editableSelector: "[data-npe-editable]",
  theme: "light",
  persistTheme: false,
  language: "en",
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
  onBlur: null
};
function normalizeOptions(raw = {}) {
  const opts = Object.assign({}, DEFAULTS);
  if (typeof raw.initialContent === "string") opts.initialContent = raw.initialContent;
  if (typeof raw.pageStyles === "string") opts.pageStyles = raw.pageStyles;
  if (typeof raw.assetsBaseUrl === "string") opts.assetsBaseUrl = raw.assetsBaseUrl;
  if (Array.isArray(raw.cssUrls)) {
    opts.cssUrls = raw.cssUrls.filter((u) => typeof u === "string");
  }
  if (typeof raw.minHeight === "number" && raw.minHeight >= 0) {
    opts.minHeight = raw.minHeight;
  }
  if (raw.maxHeight === null || typeof raw.maxHeight === "number" && raw.maxHeight > 0) {
    opts.maxHeight = raw.maxHeight;
  }
  for (const key of ["autofocus", "spellcheck", "readonly", "persistTheme", "allowDataUris", "showHelp"]) {
    if (typeof raw[key] === "boolean") opts[key] = raw[key];
  }
  if (VALID_EDIT_MODES.includes(raw.editMode)) {
    opts.editMode = raw.editMode;
  }
  if (typeof raw.editableSelector === "string" && raw.editableSelector.trim()) {
    opts.editableSelector = raw.editableSelector.trim();
  }
  if (VALID_THEMES.includes(raw.theme)) {
    opts.theme = raw.theme;
  }
  if (typeof raw.language === "string" && raw.language.trim()) {
    opts.language = raw.language.trim();
  }
  if (raw.translations && typeof raw.translations === "object" && !Array.isArray(raw.translations)) {
    opts.translations = Object.assign({}, raw.translations);
  }
  if (typeof raw.customClass === "string" || raw.customClass === null) {
    opts.customClass = raw.customClass;
  }
  if (Array.isArray(raw.toolbar) && raw.toolbar.length > 0) {
    opts.toolbar = raw.toolbar.filter((item) => typeof item === "string");
  }
  if (typeof raw.autosaveKey === "string" || raw.autosaveKey === null) {
    opts.autosaveKey = raw.autosaveKey;
  }
  for (const key of [
    "loadHandler",
    "saveHandler",
    "stylesheetUrlValidator",
    "imageUploadHandler",
    "videoUploadHandler",
    "onReady",
    "onChange",
    "onSave",
    "onFocus",
    "onBlur"
  ]) {
    if (typeof raw[key] === "function") opts[key] = raw[key];
    else if (raw[key] != null && typeof raw[key] !== "function") opts[key] = null;
  }
  return opts;
}

// src/i18n/en.js
var en = {
  // Toolbar buttons
  "toolbar.viewCode": "View Source",
  "toolbar.undo": "Undo",
  "toolbar.redo": "Redo",
  "toolbar.findReplace": "Find & Replace",
  "toolbar.bold": "Bold",
  "toolbar.italic": "Italic",
  "toolbar.underline": "Underline",
  "toolbar.strikethrough": "Strikethrough",
  "toolbar.superscript": "Superscript",
  "toolbar.subscript": "Subscript",
  "toolbar.code": "Inline Code",
  "toolbar.removeFormat": "Remove Formatting",
  "toolbar.heading": "Heading",
  "toolbar.fontFamily": "Font Family",
  "toolbar.fontSize": "Font Size",
  "toolbar.foreColor": "Text Color",
  "toolbar.backColor": "Background Color",
  "toolbar.alignLeft": "Align Left",
  "toolbar.alignCenter": "Align Center",
  "toolbar.alignRight": "Align Right",
  "toolbar.alignJustify": "Justify",
  "toolbar.indent": "Indent",
  "toolbar.outdent": "Outdent",
  "toolbar.bulletList": "Bullet List",
  "toolbar.numberedList": "Numbered List",
  "toolbar.blockquote": "Blockquote",
  "toolbar.horizontalRule": "Horizontal Rule",
  "toolbar.insertDropdown": "Insert",
  "toolbar.moreMenu": "More",
  // Heading options
  "heading.paragraph": "Paragraph",
  "heading.h1": "Heading 1",
  "heading.h2": "Heading 2",
  "heading.h3": "Heading 3",
  "heading.h4": "Heading 4",
  "heading.h5": "Heading 5",
  "heading.h6": "Heading 6",
  // Font families
  "fontFamily.sansSerif": "Sans Serif",
  "fontFamily.serif": "Serif",
  "fontFamily.monospace": "Monospace",
  "fontFamily.cursive": "Cursive",
  // Insert dropdown
  "insert.link": "Link",
  "insert.image": "Image",
  "insert.video": "Video",
  "insert.table": "Table",
  "insert.emoji": "Emoji",
  "insert.specialChars": "Special Characters",
  // More menu
  "menu.more.save": "Save",
  "menu.more.preview": "Preview",
  "menu.more.download": "Download",
  "menu.more.print": "Print",
  "menu.more.autosave": "Autosave",
  "menu.more.clearAll": "Clear All",
  "menu.more.changeTheme": "Change Theme",
  "menu.more.fullscreen": "Fullscreen",
  "menu.more.help": "Help",
  // Modals — common actions
  "modal.common.insert": "Insert",
  "modal.common.cancel": "Cancel",
  "modal.common.apply": "Apply",
  "modal.common.close": "Close",
  // Modals — Link
  "modal.link.title": "Insert Link",
  "modal.link.url": "URL",
  "modal.link.text": "Display Text",
  "modal.link.newTab": "Open in new tab",
  "modal.link.insert": "Insert",
  "modal.link.cancel": "Cancel",
  // Modals — Image
  "modal.image.title": "Insert Image",
  "modal.image.urlTab": "URL",
  "modal.image.uploadTab": "Upload",
  "modal.image.tabUrl": "URL",
  "modal.image.tabUpload": "Upload",
  "modal.image.url": "Image URL",
  "modal.image.uploadLabel": "Upload Image",
  "modal.image.uploadHintHandler": "Will be uploaded via handler",
  "modal.image.uploadHintBase64": "Will be converted to base64",
  "modal.image.alt": "Alt Text",
  "modal.image.altPlaceholder": "Describe the image",
  "modal.image.width": "Width (optional)",
  "modal.image.widthPlaceholder": "e.g. 300px or 50%",
  "modal.image.or": "OR",
  "modal.image.invalidFile": "Only image files (PNG, JPEG, GIF, WebP, AVIF) are accepted.",
  "modal.image.uploading": "Uploading\u2026",
  "modal.image.upload": "Choose files or drag & drop",
  "modal.image.dropzone": "Drop images here or click to browse",
  "modal.image.insert": "Insert",
  "modal.image.cancel": "Cancel",
  // Modals — Video
  "modal.video.title": "Insert Video",
  "modal.video.urlTab": "URL",
  "modal.video.uploadTab": "Upload",
  "modal.video.tabUrl": "URL",
  "modal.video.tabUpload": "Upload",
  "modal.video.url": "Video URL",
  "modal.video.upload": "Choose file",
  "modal.video.insert": "Insert",
  "modal.video.cancel": "Cancel",
  // Modals — Table
  "modal.table.title": "Insert Table",
  "modal.table.rows": "Rows",
  "modal.table.cols": "Columns",
  "modal.table.columns": "Columns",
  "modal.table.headerRow": "Include header row",
  "modal.table.insert": "Insert",
  "modal.table.cancel": "Cancel",
  // Modals — Emoji / Special chars
  "modal.emoji.title": "Insert Emoji",
  "modal.specialChars.title": "Special Characters",
  // Context menu — table
  "contextMenu.table.insertRowAbove": "Insert row above",
  "contextMenu.table.insertRowBelow": "Insert row below",
  "contextMenu.table.insertColLeft": "Insert column left",
  "contextMenu.table.insertColRight": "Insert column right",
  "contextMenu.table.deleteRow": "Delete row",
  "contextMenu.table.deleteCol": "Delete column",
  "contextMenu.table.deleteTable": "Delete table",
  "contextMenu.table.mergeCells": "Merge cells",
  "contextMenu.table.splitCell": "Split cell",
  // Modals — Source View
  "modal.source.title": "Source View",
  "modal.source.html": "HTML",
  "modal.source.css": "CSS",
  "modal.source.apply": "Apply",
  "modal.source.cancel": "Cancel",
  // Modals — Find & Replace
  "modal.findReplace.title": "Find & Replace",
  "modal.findReplace.find": "Find",
  "modal.findReplace.replace": "Replace with",
  "modal.findReplace.caseSensitive": "Case sensitive",
  "modal.findReplace.useRegex": "Regular expression",
  "modal.findReplace.findNext": "Find Next",
  "modal.findReplace.replaceOne": "Replace",
  "modal.findReplace.replaceAll": "Replace All",
  "modal.findReplace.close": "Close",
  // Color picker
  "color.apply": "Apply",
  "color.reset": "Reset",
  "color.hex": "Hex",
  // Status bar
  "statusbar.words": "Words",
  "statusbar.characters": "Characters",
  "statusbar.block": "Block",
  "statusbar.autosave": "Autosave",
  "statusbar.autosave.saved": "Saved",
  "statusbar.autosave.saving": "Saving\u2026",
  "statusbar.autosave.off": "Off",
  "statusbar.autosave.ago": "ago",
  // Table context menu
  "table.insertRowAbove": "Insert row above",
  "table.insertRowBelow": "Insert row below",
  "table.insertColLeft": "Insert column left",
  "table.insertColRight": "Insert column right",
  "table.deleteRow": "Delete row",
  "table.deleteColumn": "Delete column",
  "table.deleteTable": "Delete table",
  "table.mergeCells": "Merge cells",
  "table.splitCell": "Split cell",
  // Confirm messages
  "confirm.clearAll": "Are you sure you want to clear all content?",
  // Error / status messages
  "error.saveFailed": "Save failed. Your changes are preserved.",
  "error.loadFailed": "Failed to load content.",
  "error.invalidUrl": "Invalid URL.",
  "error.uploadFailed": "Upload failed: {file}",
  "error.dataUrisDisabled": "File embedding is disabled. Please provide a URL or configure an upload handler.",
  "error.invalidStylesheetUrl": "Stylesheet URL rejected: {url}",
  // Themes
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.blue": "Blue",
  "theme.darkBlue": "Dark Blue",
  "theme.midnight": "Midnight",
  "theme.void": "Void",
  "theme.autumn": "Autumn",
  // Help
  "help.title": "Help",
  "help.close": "Close",
  "help.author": "Author",
  "help.version": "Version",
  "help.github": "GitHub",
  // Overlay — media resize / contextual toolbar
  "overlay.media.toolbar": "Media toolbar",
  "overlay.media.drag": "Drag to reposition",
  "overlay.media.replace": "Replace",
  "overlay.media.delete": "Delete",
  // Floating toolbar
  "floatingToolbar.label": "Selection toolbar",
  "floatingToolbar.link": "Insert link",
  "floatingToolbar.moveBlockUp": "Move block up",
  "floatingToolbar.moveBlockDown": "Move block down"
};

// src/i18n/cs.js
var cs = {
  // Toolbar buttons
  "toolbar.viewCode": "Zobrazit zdrojov\xFD k\xF3d",
  "toolbar.undo": "Zp\u011Bt",
  "toolbar.redo": "Znovu",
  "toolbar.findReplace": "Naj\xEDt a nahradit",
  "toolbar.bold": "Tu\u010Dn\xE9",
  "toolbar.italic": "Kurz\xEDva",
  "toolbar.underline": "Podtr\u017Een\xED",
  "toolbar.strikethrough": "P\u0159e\u0161krtnut\xED",
  "toolbar.superscript": "Horn\xED index",
  "toolbar.subscript": "Doln\xED index",
  "toolbar.code": "Vlo\u017Een\xFD k\xF3d",
  "toolbar.removeFormat": "Odstranit form\xE1tov\xE1n\xED",
  "toolbar.heading": "Nadpis",
  "toolbar.fontFamily": "Typ p\xEDsma",
  "toolbar.fontSize": "Velikost p\xEDsma",
  "toolbar.foreColor": "Barva textu",
  "toolbar.backColor": "Barva pozad\xED",
  "toolbar.alignLeft": "Zarovnat vlevo",
  "toolbar.alignCenter": "Zarovnat na st\u0159ed",
  "toolbar.alignRight": "Zarovnat vpravo",
  "toolbar.alignJustify": "Zarovnat do bloku",
  "toolbar.indent": "Odsazen\xED",
  "toolbar.outdent": "Zmen\u0161it odsazen\xED",
  "toolbar.bulletList": "Odr\xE1\u017Ekov\xFD seznam",
  "toolbar.numberedList": "\u010C\xEDslovan\xFD seznam",
  "toolbar.blockquote": "Cit\xE1t",
  "toolbar.horizontalRule": "Vodorovn\xE1 \u010D\xE1ra",
  "toolbar.insertDropdown": "Vlo\u017Eit",
  "toolbar.moreMenu": "V\xEDce",
  // Heading options
  "heading.paragraph": "Odstavec",
  "heading.h1": "Nadpis 1",
  "heading.h2": "Nadpis 2",
  "heading.h3": "Nadpis 3",
  "heading.h4": "Nadpis 4",
  "heading.h5": "Nadpis 5",
  "heading.h6": "Nadpis 6",
  // Font families
  "fontFamily.sansSerif": "Bezpatkov\xE9",
  "fontFamily.serif": "Patkov\xE9",
  "fontFamily.monospace": "Pevn\xE1 \u0161\xED\u0159ka",
  "fontFamily.cursive": "Kurz\xEDvn\xED",
  // Insert dropdown
  "insert.link": "Odkaz",
  "insert.image": "Obr\xE1zek",
  "insert.video": "Video",
  "insert.table": "Tabulka",
  "insert.emoji": "Emoji",
  "insert.specialChars": "Speci\xE1ln\xED znaky",
  // More menu
  "menu.more.save": "Ulo\u017Eit",
  "menu.more.preview": "N\xE1hled",
  "menu.more.download": "St\xE1hnout",
  "menu.more.print": "Tisk",
  "menu.more.autosave": "Automatick\xE9 ukl\xE1d\xE1n\xED",
  "menu.more.clearAll": "Vymazat v\u0161e",
  "menu.more.changeTheme": "Zm\u011Bnit t\xE9ma",
  "menu.more.fullscreen": "Cel\xE1 obrazovka",
  "menu.more.help": "N\xE1pov\u011Bda",
  // Modals — common actions
  "modal.common.insert": "Vlo\u017Eit",
  "modal.common.cancel": "Zru\u0161it",
  "modal.common.apply": "Pou\u017E\xEDt",
  "modal.common.close": "Zav\u0159\xEDt",
  // Modals — Link
  "modal.link.title": "Vlo\u017Eit odkaz",
  "modal.link.url": "URL",
  "modal.link.text": "Zobrazovan\xFD text",
  "modal.link.newTab": "Otev\u0159\xEDt v nov\xE9m okn\u011B",
  "modal.link.insert": "Vlo\u017Eit",
  "modal.link.cancel": "Zru\u0161it",
  // Modals — Image
  "modal.image.title": "Vlo\u017Eit obr\xE1zek",
  "modal.image.urlTab": "URL",
  "modal.image.uploadTab": "Nahr\xE1t",
  "modal.image.tabUrl": "URL",
  "modal.image.tabUpload": "Nahr\xE1t",
  "modal.image.url": "URL obr\xE1zku",
  "modal.image.uploadLabel": "Nahr\xE1t obr\xE1zek",
  "modal.image.uploadHintHandler": "Bude nahr\xE1no p\u0159es handler",
  "modal.image.uploadHintBase64": "Bude p\u0159evedeno na base64",
  "modal.image.alt": "Popisek (alt)",
  "modal.image.altPlaceholder": "Popis obr\xE1zku",
  "modal.image.width": "\u0160\xED\u0159ka (voliteln\xE9)",
  "modal.image.widthPlaceholder": "nap\u0159. 300px nebo 50%",
  "modal.image.or": "NEBO",
  "modal.image.invalidFile": "Jsou povoleny pouze obr\xE1zky (PNG, JPEG, GIF, WebP, AVIF).",
  "modal.image.uploading": "Nahr\xE1v\xE1m\u2026",
  "modal.image.upload": "Vyberte soubory nebo p\u0159et\xE1hn\u011Bte",
  "modal.image.dropzone": "P\u0159et\xE1hn\u011Bte obr\xE1zky sem nebo klikn\u011Bte pro v\xFDb\u011Br",
  "modal.image.insert": "Vlo\u017Eit",
  "modal.image.cancel": "Zru\u0161it",
  // Modals — Video
  "modal.video.title": "Vlo\u017Eit video",
  "modal.video.urlTab": "URL",
  "modal.video.uploadTab": "Nahr\xE1t",
  "modal.video.tabUrl": "URL",
  "modal.video.tabUpload": "Nahr\xE1t",
  "modal.video.url": "URL videa",
  "modal.video.upload": "Vyberte soubor",
  "modal.video.insert": "Vlo\u017Eit",
  "modal.video.cancel": "Zru\u0161it",
  // Modals — Table
  "modal.table.title": "Vlo\u017Eit tabulku",
  "modal.table.rows": "\u0158\xE1dky",
  "modal.table.cols": "Sloupce",
  "modal.table.columns": "Sloupce",
  "modal.table.headerRow": "Zahrnout z\xE1hlav\xED",
  "modal.table.insert": "Vlo\u017Eit",
  "modal.table.cancel": "Zru\u0161it",
  // Modals — Emoji / Special chars
  "modal.emoji.title": "Vlo\u017Eit emoji",
  "modal.specialChars.title": "Speci\xE1ln\xED znaky",
  // Context menu — table
  "contextMenu.table.insertRowAbove": "Vlo\u017Eit \u0159\xE1dek nad",
  "contextMenu.table.insertRowBelow": "Vlo\u017Eit \u0159\xE1dek pod",
  "contextMenu.table.insertColLeft": "Vlo\u017Eit sloupec vlevo",
  "contextMenu.table.insertColRight": "Vlo\u017Eit sloupec vpravo",
  "contextMenu.table.deleteRow": "Smazat \u0159\xE1dek",
  "contextMenu.table.deleteCol": "Smazat sloupec",
  "contextMenu.table.deleteTable": "Smazat tabulku",
  "contextMenu.table.mergeCells": "Slou\u010Dit bu\u0148ky",
  "contextMenu.table.splitCell": "Rozd\u011Blit bu\u0148ku",
  // Modals — Source View
  "modal.source.title": "Zdrojov\xFD k\xF3d",
  "modal.source.html": "HTML",
  "modal.source.css": "CSS",
  "modal.source.apply": "Pou\u017E\xEDt",
  "modal.source.cancel": "Zru\u0161it",
  // Modals — Find & Replace
  "modal.findReplace.title": "Naj\xEDt a nahradit",
  "modal.findReplace.find": "Naj\xEDt",
  "modal.findReplace.replace": "Nahradit za",
  "modal.findReplace.caseSensitive": "Rozli\u0161ovat velikost p\xEDsmen",
  "modal.findReplace.useRegex": "Regul\xE1rn\xED v\xFDraz",
  "modal.findReplace.findNext": "Naj\xEDt dal\u0161\xED",
  "modal.findReplace.replaceOne": "Nahradit",
  "modal.findReplace.replaceAll": "Nahradit v\u0161e",
  "modal.findReplace.close": "Zav\u0159\xEDt",
  // Color picker
  "color.apply": "Pou\u017E\xEDt",
  "color.reset": "Resetovat",
  "color.hex": "Hex",
  // Status bar
  "statusbar.words": "Slova",
  "statusbar.characters": "Znaky",
  "statusbar.block": "Blok",
  "statusbar.autosave": "Aut. ukl\xE1d\xE1n\xED",
  "statusbar.autosave.saved": "Ulo\u017Eeno",
  "statusbar.autosave.saving": "Ukl\xE1d\xE1m\u2026",
  "statusbar.autosave.off": "Vypnuto",
  "statusbar.autosave.ago": "p\u0159ed",
  // Table context menu
  "table.insertRowAbove": "Vlo\u017Eit \u0159\xE1dek nad",
  "table.insertRowBelow": "Vlo\u017Eit \u0159\xE1dek pod",
  "table.insertColLeft": "Vlo\u017Eit sloupec vlevo",
  "table.insertColRight": "Vlo\u017Eit sloupec vpravo",
  "table.deleteRow": "Smazat \u0159\xE1dek",
  "table.deleteColumn": "Smazat sloupec",
  "table.deleteTable": "Smazat tabulku",
  "table.mergeCells": "Slou\u010Dit bu\u0148ky",
  "table.splitCell": "Rozd\u011Blit bu\u0148ku",
  // Confirm messages
  "confirm.clearAll": "Opravdu chcete smazat ve\u0161ker\xFD obsah?",
  // Error / status messages
  "error.saveFailed": "Ulo\u017Een\xED selhalo. Va\u0161e zm\u011Bny jsou zachov\xE1ny.",
  "error.loadFailed": "Nepoda\u0159ilo se na\u010D\xEDst obsah.",
  "error.invalidUrl": "Neplatn\xE1 URL adresa.",
  "error.uploadFailed": "Nahr\xE1v\xE1n\xED selhalo: {file}",
  "error.dataUrisDisabled": "Vkl\xE1d\xE1n\xED soubor\u016F je zak\xE1z\xE1no. Zadejte URL nebo nastavte obslu\u017En\xFD program nahr\xE1v\xE1n\xED.",
  "error.invalidStylesheetUrl": "URL stylopisu byla zam\xEDtnuta: {url}",
  // Themes
  "theme.light": "Sv\u011Btl\xE9",
  "theme.dark": "Tmav\xE9",
  "theme.blue": "Modr\xE9",
  "theme.darkBlue": "Tmav\u011B modr\xE9",
  "theme.midnight": "P\u016Flno\u010Dn\xED",
  "theme.void": "Void",
  "theme.autumn": "Podzim",
  // Help
  "help.title": "N\xE1pov\u011Bda",
  "help.close": "Zav\u0159\xEDt",
  "help.author": "Autor",
  "help.version": "Verze",
  "help.github": "GitHub",
  // Overlay — media resize / contextual toolbar
  "overlay.media.toolbar": "Panel m\xE9di\xED",
  "overlay.media.drag": "P\u0159et\xE1hnout pro p\u0159em\xEDst\u011Bn\xED",
  "overlay.media.replace": "Nahradit",
  "overlay.media.delete": "Smazat",
  // Floating toolbar
  "floatingToolbar.label": "Panel v\xFDb\u011Bru",
  "floatingToolbar.link": "Vlo\u017Eit odkaz",
  "floatingToolbar.moveBlockUp": "P\u0159esunout blok v\xFD\u0161e",
  "floatingToolbar.moveBlockDown": "P\u0159esunout blok n\xED\u017Ee"
};

// src/i18n/es.js
var es = {
  // Toolbar buttons
  "toolbar.viewCode": "Ver c\xF3digo fuente",
  "toolbar.undo": "Deshacer",
  "toolbar.redo": "Rehacer",
  "toolbar.findReplace": "Buscar y reemplazar",
  "toolbar.bold": "Negrita",
  "toolbar.italic": "Cursiva",
  "toolbar.underline": "Subrayado",
  "toolbar.strikethrough": "Tachado",
  "toolbar.superscript": "Super\xEDndice",
  "toolbar.subscript": "Sub\xEDndice",
  "toolbar.code": "C\xF3digo en l\xEDnea",
  "toolbar.removeFormat": "Quitar formato",
  "toolbar.heading": "Encabezado",
  "toolbar.fontFamily": "Tipo de letra",
  "toolbar.fontSize": "Tama\xF1o de letra",
  "toolbar.foreColor": "Color de texto",
  "toolbar.backColor": "Color de fondo",
  "toolbar.alignLeft": "Alinear a la izquierda",
  "toolbar.alignCenter": "Centrar",
  "toolbar.alignRight": "Alinear a la derecha",
  "toolbar.alignJustify": "Justificar",
  "toolbar.indent": "Aumentar sangr\xEDa",
  "toolbar.outdent": "Disminuir sangr\xEDa",
  "toolbar.bulletList": "Lista con vi\xF1etas",
  "toolbar.numberedList": "Lista numerada",
  "toolbar.blockquote": "Cita",
  "toolbar.horizontalRule": "L\xEDnea horizontal",
  "toolbar.insertDropdown": "Insertar",
  "toolbar.moreMenu": "M\xE1s",
  // Heading options
  "heading.paragraph": "P\xE1rrafo",
  "heading.h1": "Encabezado 1",
  "heading.h2": "Encabezado 2",
  "heading.h3": "Encabezado 3",
  "heading.h4": "Encabezado 4",
  "heading.h5": "Encabezado 5",
  "heading.h6": "Encabezado 6",
  // Font families
  "fontFamily.sansSerif": "Sans Serif",
  "fontFamily.serif": "Serif",
  "fontFamily.monospace": "Monoespaciada",
  "fontFamily.cursive": "Cursiva",
  // Insert dropdown
  "insert.link": "Enlace",
  "insert.image": "Imagen",
  "insert.video": "V\xEDdeo",
  "insert.table": "Tabla",
  "insert.emoji": "Emoji",
  "insert.specialChars": "Caracteres especiales",
  // More menu
  "menu.more.save": "Guardar",
  "menu.more.preview": "Vista previa",
  "menu.more.download": "Descargar",
  "menu.more.print": "Imprimir",
  "menu.more.autosave": "Guardado autom\xE1tico",
  "menu.more.clearAll": "Borrar todo",
  "menu.more.changeTheme": "Cambiar tema",
  "menu.more.fullscreen": "Pantalla completa",
  "menu.more.help": "Ayuda",
  // Modals — common actions
  "modal.common.insert": "Insertar",
  "modal.common.cancel": "Cancelar",
  "modal.common.apply": "Aplicar",
  "modal.common.close": "Cerrar",
  // Modals — Link
  "modal.link.title": "Insertar enlace",
  "modal.link.url": "URL",
  "modal.link.text": "Texto a mostrar",
  "modal.link.newTab": "Abrir en una pesta\xF1a nueva",
  "modal.link.insert": "Insertar",
  "modal.link.cancel": "Cancelar",
  // Modals — Image
  "modal.image.title": "Insertar imagen",
  "modal.image.urlTab": "URL",
  "modal.image.uploadTab": "Subir",
  "modal.image.tabUrl": "URL",
  "modal.image.tabUpload": "Subir",
  "modal.image.url": "URL de la imagen",
  "modal.image.uploadLabel": "Subir imagen",
  "modal.image.uploadHintHandler": "Se subir\xE1 mediante el gestor configurado",
  "modal.image.uploadHintBase64": "Se convertir\xE1 a base64",
  "modal.image.alt": "Texto alternativo",
  "modal.image.altPlaceholder": "Describe la imagen",
  "modal.image.width": "Ancho (opcional)",
  "modal.image.widthPlaceholder": "p. ej. 300px o 50%",
  "modal.image.or": "O",
  "modal.image.invalidFile": "Solo se aceptan archivos de imagen (PNG, JPEG, GIF, WebP, AVIF).",
  "modal.image.uploading": "Subiendo\u2026",
  "modal.image.upload": "Elige archivos o arr\xE1stralos aqu\xED",
  "modal.image.dropzone": "Suelta las im\xE1genes aqu\xED o haz clic para explorar",
  "modal.image.insert": "Insertar",
  "modal.image.cancel": "Cancelar",
  // Modals — Video
  "modal.video.title": "Insertar v\xEDdeo",
  "modal.video.urlTab": "URL",
  "modal.video.uploadTab": "Subir",
  "modal.video.tabUrl": "URL",
  "modal.video.tabUpload": "Subir",
  "modal.video.url": "URL del v\xEDdeo",
  "modal.video.upload": "Elegir archivo",
  "modal.video.insert": "Insertar",
  "modal.video.cancel": "Cancelar",
  // Modals — Table
  "modal.table.title": "Insertar tabla",
  "modal.table.rows": "Filas",
  "modal.table.cols": "Columnas",
  "modal.table.columns": "Columnas",
  "modal.table.headerRow": "Incluir fila de encabezado",
  "modal.table.insert": "Insertar",
  "modal.table.cancel": "Cancelar",
  // Modals — Emoji / Special chars
  "modal.emoji.title": "Insertar emoji",
  "modal.specialChars.title": "Caracteres especiales",
  // Context menu — table
  "contextMenu.table.insertRowAbove": "Insertar fila arriba",
  "contextMenu.table.insertRowBelow": "Insertar fila abajo",
  "contextMenu.table.insertColLeft": "Insertar columna a la izquierda",
  "contextMenu.table.insertColRight": "Insertar columna a la derecha",
  "contextMenu.table.deleteRow": "Eliminar fila",
  "contextMenu.table.deleteCol": "Eliminar columna",
  "contextMenu.table.deleteTable": "Eliminar tabla",
  "contextMenu.table.mergeCells": "Combinar celdas",
  "contextMenu.table.splitCell": "Dividir celda",
  // Modals — Source View
  "modal.source.title": "Ver c\xF3digo fuente",
  "modal.source.html": "HTML",
  "modal.source.css": "CSS",
  "modal.source.apply": "Aplicar",
  "modal.source.cancel": "Cancelar",
  // Modals — Find & Replace
  "modal.findReplace.title": "Buscar y reemplazar",
  "modal.findReplace.find": "Buscar",
  "modal.findReplace.replace": "Reemplazar con",
  "modal.findReplace.caseSensitive": "Distinguir may\xFAsculas y min\xFAsculas",
  "modal.findReplace.useRegex": "Expresi\xF3n regular",
  "modal.findReplace.findNext": "Buscar siguiente",
  "modal.findReplace.replaceOne": "Reemplazar",
  "modal.findReplace.replaceAll": "Reemplazar todo",
  "modal.findReplace.close": "Cerrar",
  // Color picker
  "color.apply": "Aplicar",
  "color.reset": "Restablecer",
  "color.hex": "Hex",
  // Status bar
  "statusbar.words": "Palabras",
  "statusbar.characters": "Caracteres",
  "statusbar.block": "Bloque",
  "statusbar.autosave": "Guardado autom\xE1tico",
  "statusbar.autosave.saved": "Guardado",
  "statusbar.autosave.saving": "Guardando\u2026",
  "statusbar.autosave.off": "Desactivado",
  "statusbar.autosave.ago": "hace",
  // Table context menu
  "table.insertRowAbove": "Insertar fila arriba",
  "table.insertRowBelow": "Insertar fila abajo",
  "table.insertColLeft": "Insertar columna a la izquierda",
  "table.insertColRight": "Insertar columna a la derecha",
  "table.deleteRow": "Eliminar fila",
  "table.deleteColumn": "Eliminar columna",
  "table.deleteTable": "Eliminar tabla",
  "table.mergeCells": "Combinar celdas",
  "table.splitCell": "Dividir celda",
  // Confirm messages
  "confirm.clearAll": "\xBFSeguro que quieres borrar todo el contenido?",
  // Error / status messages
  "error.saveFailed": "Error al guardar. Tus cambios se han conservado.",
  "error.loadFailed": "No se pudo cargar el contenido.",
  "error.invalidUrl": "URL no v\xE1lida.",
  "error.uploadFailed": "Error al subir el archivo: {file}",
  "error.dataUrisDisabled": "La incrustaci\xF3n de archivos est\xE1 desactivada. Proporciona una URL o configura un gestor de subida.",
  "error.invalidStylesheetUrl": "URL de hoja de estilos rechazada: {url}",
  // Themes
  "theme.light": "Claro",
  "theme.dark": "Oscuro",
  "theme.blue": "Azul",
  "theme.darkBlue": "Azul oscuro",
  "theme.midnight": "Medianoche",
  "theme.void": "Vac\xEDo",
  "theme.autumn": "Oto\xF1o",
  // Help
  "help.title": "Ayuda",
  "help.close": "Cerrar",
  "help.author": "Autor",
  "help.version": "Versi\xF3n",
  "help.github": "GitHub",
  // Overlay — media resize / contextual toolbar
  "overlay.media.toolbar": "Barra de herramientas multimedia",
  "overlay.media.drag": "Arrastra para reposicionar",
  "overlay.media.replace": "Reemplazar",
  "overlay.media.delete": "Eliminar",
  // Floating toolbar
  "floatingToolbar.label": "Barra de herramientas de selecci\xF3n",
  "floatingToolbar.link": "Insertar enlace",
  "floatingToolbar.moveBlockUp": "Mover bloque hacia arriba",
  "floatingToolbar.moveBlockDown": "Mover bloque hacia abajo"
};

// src/i18n/zh.js
var zh = {
  // Toolbar buttons
  "toolbar.viewCode": "\u67E5\u770B\u6E90\u4EE3\u7801",
  "toolbar.undo": "\u64A4\u9500",
  "toolbar.redo": "\u91CD\u505A",
  "toolbar.findReplace": "\u67E5\u627E\u548C\u66FF\u6362",
  "toolbar.bold": "\u7C97\u4F53",
  "toolbar.italic": "\u659C\u4F53",
  "toolbar.underline": "\u4E0B\u5212\u7EBF",
  "toolbar.strikethrough": "\u5220\u9664\u7EBF",
  "toolbar.superscript": "\u4E0A\u6807",
  "toolbar.subscript": "\u4E0B\u6807",
  "toolbar.code": "\u884C\u5185\u4EE3\u7801",
  "toolbar.removeFormat": "\u6E05\u9664\u683C\u5F0F",
  "toolbar.heading": "\u6807\u9898",
  "toolbar.fontFamily": "\u5B57\u4F53",
  "toolbar.fontSize": "\u5B57\u53F7",
  "toolbar.foreColor": "\u6587\u5B57\u989C\u8272",
  "toolbar.backColor": "\u80CC\u666F\u989C\u8272",
  "toolbar.alignLeft": "\u5DE6\u5BF9\u9F50",
  "toolbar.alignCenter": "\u5C45\u4E2D\u5BF9\u9F50",
  "toolbar.alignRight": "\u53F3\u5BF9\u9F50",
  "toolbar.alignJustify": "\u4E24\u7AEF\u5BF9\u9F50",
  "toolbar.indent": "\u589E\u52A0\u7F29\u8FDB",
  "toolbar.outdent": "\u51CF\u5C11\u7F29\u8FDB",
  "toolbar.bulletList": "\u9879\u76EE\u7B26\u53F7\u5217\u8868",
  "toolbar.numberedList": "\u7F16\u53F7\u5217\u8868",
  "toolbar.blockquote": "\u5F15\u7528",
  "toolbar.horizontalRule": "\u6C34\u5E73\u7EBF",
  "toolbar.insertDropdown": "\u63D2\u5165",
  "toolbar.moreMenu": "\u66F4\u591A",
  // Heading options
  "heading.paragraph": "\u6BB5\u843D",
  "heading.h1": "\u6807\u9898 1",
  "heading.h2": "\u6807\u9898 2",
  "heading.h3": "\u6807\u9898 3",
  "heading.h4": "\u6807\u9898 4",
  "heading.h5": "\u6807\u9898 5",
  "heading.h6": "\u6807\u9898 6",
  // Font families
  "fontFamily.sansSerif": "\u65E0\u886C\u7EBF\u4F53",
  "fontFamily.serif": "\u886C\u7EBF\u4F53",
  "fontFamily.monospace": "\u7B49\u5BBD\u5B57\u4F53",
  "fontFamily.cursive": "\u624B\u5199\u4F53",
  // Insert dropdown
  "insert.link": "\u94FE\u63A5",
  "insert.image": "\u56FE\u7247",
  "insert.video": "\u89C6\u9891",
  "insert.table": "\u8868\u683C",
  "insert.emoji": "\u8868\u60C5\u7B26\u53F7",
  "insert.specialChars": "\u7279\u6B8A\u5B57\u7B26",
  // More menu
  "menu.more.save": "\u4FDD\u5B58",
  "menu.more.preview": "\u9884\u89C8",
  "menu.more.download": "\u4E0B\u8F7D",
  "menu.more.print": "\u6253\u5370",
  "menu.more.autosave": "\u81EA\u52A8\u4FDD\u5B58",
  "menu.more.clearAll": "\u6E05\u7A7A\u5168\u90E8",
  "menu.more.changeTheme": "\u5207\u6362\u4E3B\u9898",
  "menu.more.fullscreen": "\u5168\u5C4F",
  "menu.more.help": "\u5E2E\u52A9",
  // Modals — common actions
  "modal.common.insert": "\u63D2\u5165",
  "modal.common.cancel": "\u53D6\u6D88",
  "modal.common.apply": "\u5E94\u7528",
  "modal.common.close": "\u5173\u95ED",
  // Modals — Link
  "modal.link.title": "\u63D2\u5165\u94FE\u63A5",
  "modal.link.url": "\u7F51\u5740",
  "modal.link.text": "\u663E\u793A\u6587\u5B57",
  "modal.link.newTab": "\u5728\u65B0\u6807\u7B7E\u9875\u4E2D\u6253\u5F00",
  "modal.link.insert": "\u63D2\u5165",
  "modal.link.cancel": "\u53D6\u6D88",
  // Modals — Image
  "modal.image.title": "\u63D2\u5165\u56FE\u7247",
  "modal.image.urlTab": "\u7F51\u5740",
  "modal.image.uploadTab": "\u4E0A\u4F20",
  "modal.image.tabUrl": "\u7F51\u5740",
  "modal.image.tabUpload": "\u4E0A\u4F20",
  "modal.image.url": "\u56FE\u7247\u7F51\u5740",
  "modal.image.uploadLabel": "\u4E0A\u4F20\u56FE\u7247",
  "modal.image.uploadHintHandler": "\u5C06\u901A\u8FC7\u5DF2\u914D\u7F6E\u7684\u5904\u7406\u7A0B\u5E8F\u4E0A\u4F20",
  "modal.image.uploadHintBase64": "\u5C06\u8F6C\u6362\u4E3A base64",
  "modal.image.alt": "\u66FF\u4EE3\u6587\u5B57",
  "modal.image.altPlaceholder": "\u63CF\u8FF0\u8FD9\u5F20\u56FE\u7247",
  "modal.image.width": "\u5BBD\u5EA6\uFF08\u53EF\u9009\uFF09",
  "modal.image.widthPlaceholder": "\u4F8B\u5982 300px \u6216 50%",
  "modal.image.or": "\u6216",
  "modal.image.invalidFile": "\u4EC5\u63A5\u53D7\u56FE\u7247\u6587\u4EF6\uFF08PNG\u3001JPEG\u3001GIF\u3001WebP\u3001AVIF\uFF09\u3002",
  "modal.image.uploading": "\u4E0A\u4F20\u4E2D\u2026",
  "modal.image.upload": "\u9009\u62E9\u6587\u4EF6\u6216\u62D6\u653E\u5230\u6B64\u5904",
  "modal.image.dropzone": "\u5C06\u56FE\u7247\u62D6\u653E\u5230\u6B64\u5904\uFF0C\u6216\u70B9\u51FB\u6D4F\u89C8",
  "modal.image.insert": "\u63D2\u5165",
  "modal.image.cancel": "\u53D6\u6D88",
  // Modals — Video
  "modal.video.title": "\u63D2\u5165\u89C6\u9891",
  "modal.video.urlTab": "\u7F51\u5740",
  "modal.video.uploadTab": "\u4E0A\u4F20",
  "modal.video.tabUrl": "\u7F51\u5740",
  "modal.video.tabUpload": "\u4E0A\u4F20",
  "modal.video.url": "\u89C6\u9891\u7F51\u5740",
  "modal.video.upload": "\u9009\u62E9\u6587\u4EF6",
  "modal.video.insert": "\u63D2\u5165",
  "modal.video.cancel": "\u53D6\u6D88",
  // Modals — Table
  "modal.table.title": "\u63D2\u5165\u8868\u683C",
  "modal.table.rows": "\u884C\u6570",
  "modal.table.cols": "\u5217\u6570",
  "modal.table.columns": "\u5217\u6570",
  "modal.table.headerRow": "\u5305\u542B\u8868\u5934\u884C",
  "modal.table.insert": "\u63D2\u5165",
  "modal.table.cancel": "\u53D6\u6D88",
  // Modals — Emoji / Special chars
  "modal.emoji.title": "\u63D2\u5165\u8868\u60C5\u7B26\u53F7",
  "modal.specialChars.title": "\u7279\u6B8A\u5B57\u7B26",
  // Context menu — table
  "contextMenu.table.insertRowAbove": "\u5728\u4E0A\u65B9\u63D2\u5165\u884C",
  "contextMenu.table.insertRowBelow": "\u5728\u4E0B\u65B9\u63D2\u5165\u884C",
  "contextMenu.table.insertColLeft": "\u5728\u5DE6\u4FA7\u63D2\u5165\u5217",
  "contextMenu.table.insertColRight": "\u5728\u53F3\u4FA7\u63D2\u5165\u5217",
  "contextMenu.table.deleteRow": "\u5220\u9664\u884C",
  "contextMenu.table.deleteCol": "\u5220\u9664\u5217",
  "contextMenu.table.deleteTable": "\u5220\u9664\u8868\u683C",
  "contextMenu.table.mergeCells": "\u5408\u5E76\u5355\u5143\u683C",
  "contextMenu.table.splitCell": "\u62C6\u5206\u5355\u5143\u683C",
  // Modals — Source View
  "modal.source.title": "\u67E5\u770B\u6E90\u4EE3\u7801",
  "modal.source.html": "HTML",
  "modal.source.css": "CSS",
  "modal.source.apply": "\u5E94\u7528",
  "modal.source.cancel": "\u53D6\u6D88",
  // Modals — Find & Replace
  "modal.findReplace.title": "\u67E5\u627E\u548C\u66FF\u6362",
  "modal.findReplace.find": "\u67E5\u627E",
  "modal.findReplace.replace": "\u66FF\u6362\u4E3A",
  "modal.findReplace.caseSensitive": "\u533A\u5206\u5927\u5C0F\u5199",
  "modal.findReplace.useRegex": "\u6B63\u5219\u8868\u8FBE\u5F0F",
  "modal.findReplace.findNext": "\u67E5\u627E\u4E0B\u4E00\u4E2A",
  "modal.findReplace.replaceOne": "\u66FF\u6362",
  "modal.findReplace.replaceAll": "\u5168\u90E8\u66FF\u6362",
  "modal.findReplace.close": "\u5173\u95ED",
  // Color picker
  "color.apply": "\u5E94\u7528",
  "color.reset": "\u91CD\u7F6E",
  "color.hex": "\u5341\u516D\u8FDB\u5236",
  // Status bar
  "statusbar.words": "\u5B57\u6570",
  "statusbar.characters": "\u5B57\u7B26\u6570",
  "statusbar.block": "\u533A\u5757",
  "statusbar.autosave": "\u81EA\u52A8\u4FDD\u5B58",
  "statusbar.autosave.saved": "\u5DF2\u4FDD\u5B58",
  "statusbar.autosave.saving": "\u4FDD\u5B58\u4E2D\u2026",
  "statusbar.autosave.off": "\u5DF2\u5173\u95ED",
  "statusbar.autosave.ago": "\u524D",
  // Table context menu
  "table.insertRowAbove": "\u5728\u4E0A\u65B9\u63D2\u5165\u884C",
  "table.insertRowBelow": "\u5728\u4E0B\u65B9\u63D2\u5165\u884C",
  "table.insertColLeft": "\u5728\u5DE6\u4FA7\u63D2\u5165\u5217",
  "table.insertColRight": "\u5728\u53F3\u4FA7\u63D2\u5165\u5217",
  "table.deleteRow": "\u5220\u9664\u884C",
  "table.deleteColumn": "\u5220\u9664\u5217",
  "table.deleteTable": "\u5220\u9664\u8868\u683C",
  "table.mergeCells": "\u5408\u5E76\u5355\u5143\u683C",
  "table.splitCell": "\u62C6\u5206\u5355\u5143\u683C",
  // Confirm messages
  "confirm.clearAll": "\u786E\u5B9A\u8981\u6E05\u7A7A\u5168\u90E8\u5185\u5BB9\u5417\uFF1F",
  // Error / status messages
  "error.saveFailed": "\u4FDD\u5B58\u5931\u8D25\uFF0C\u60A8\u7684\u66F4\u6539\u5DF2\u4FDD\u7559\u3002",
  "error.loadFailed": "\u5185\u5BB9\u52A0\u8F7D\u5931\u8D25\u3002",
  "error.invalidUrl": "\u7F51\u5740\u65E0\u6548\u3002",
  "error.uploadFailed": "\u4E0A\u4F20\u5931\u8D25\uFF1A{file}",
  "error.dataUrisDisabled": "\u6587\u4EF6\u5185\u5D4C\u529F\u80FD\u5DF2\u7981\u7528\uFF0C\u8BF7\u63D0\u4F9B\u7F51\u5740\u6216\u914D\u7F6E\u4E0A\u4F20\u5904\u7406\u7A0B\u5E8F\u3002",
  "error.invalidStylesheetUrl": "\u6837\u5F0F\u8868\u7F51\u5740\u88AB\u62D2\u7EDD\uFF1A{url}",
  // Themes
  "theme.light": "\u6D45\u8272",
  "theme.dark": "\u6DF1\u8272",
  "theme.blue": "\u84DD\u8272",
  "theme.darkBlue": "\u6DF1\u84DD\u8272",
  "theme.midnight": "\u5348\u591C",
  "theme.void": "\u865A\u7A7A",
  "theme.autumn": "\u79CB\u5929",
  // Help
  "help.title": "\u5E2E\u52A9",
  "help.close": "\u5173\u95ED",
  "help.author": "\u4F5C\u8005",
  "help.version": "\u7248\u672C",
  "help.github": "GitHub",
  // Overlay — media resize / contextual toolbar
  "overlay.media.toolbar": "\u5A92\u4F53\u5DE5\u5177\u680F",
  "overlay.media.drag": "\u62D6\u52A8\u4EE5\u91CD\u65B0\u5B9A\u4F4D",
  "overlay.media.replace": "\u66FF\u6362",
  "overlay.media.delete": "\u5220\u9664",
  // Floating toolbar
  "floatingToolbar.label": "\u9009\u533A\u5DE5\u5177\u680F",
  "floatingToolbar.link": "\u63D2\u5165\u94FE\u63A5",
  "floatingToolbar.moveBlockUp": "\u4E0A\u79FB\u533A\u5757",
  "floatingToolbar.moveBlockDown": "\u4E0B\u79FB\u533A\u5757"
};

// src/i18n/de.js
var de = {
  // Toolbar buttons
  "toolbar.viewCode": "Quellcode anzeigen",
  "toolbar.undo": "R\xFCckg\xE4ngig",
  "toolbar.redo": "Wiederholen",
  "toolbar.findReplace": "Suchen & Ersetzen",
  "toolbar.bold": "Fett",
  "toolbar.italic": "Kursiv",
  "toolbar.underline": "Unterstrichen",
  "toolbar.strikethrough": "Durchgestrichen",
  "toolbar.superscript": "Hochgestellt",
  "toolbar.subscript": "Tiefgestellt",
  "toolbar.code": "Inline-Code",
  "toolbar.removeFormat": "Formatierung entfernen",
  "toolbar.heading": "\xDCberschrift",
  "toolbar.fontFamily": "Schriftart",
  "toolbar.fontSize": "Schriftgr\xF6\xDFe",
  "toolbar.foreColor": "Textfarbe",
  "toolbar.backColor": "Hintergrundfarbe",
  "toolbar.alignLeft": "Linksb\xFCndig",
  "toolbar.alignCenter": "Zentriert",
  "toolbar.alignRight": "Rechtsb\xFCndig",
  "toolbar.alignJustify": "Blocksatz",
  "toolbar.indent": "Einzug vergr\xF6\xDFern",
  "toolbar.outdent": "Einzug verkleinern",
  "toolbar.bulletList": "Aufz\xE4hlungsliste",
  "toolbar.numberedList": "Nummerierte Liste",
  "toolbar.blockquote": "Zitat",
  "toolbar.horizontalRule": "Horizontale Linie",
  "toolbar.insertDropdown": "Einf\xFCgen",
  "toolbar.moreMenu": "Mehr",
  // Heading options
  "heading.paragraph": "Absatz",
  "heading.h1": "\xDCberschrift 1",
  "heading.h2": "\xDCberschrift 2",
  "heading.h3": "\xDCberschrift 3",
  "heading.h4": "\xDCberschrift 4",
  "heading.h5": "\xDCberschrift 5",
  "heading.h6": "\xDCberschrift 6",
  // Font families
  "fontFamily.sansSerif": "Serifenlos",
  "fontFamily.serif": "Serif",
  "fontFamily.monospace": "Monospace",
  "fontFamily.cursive": "Kursivschrift",
  // Insert dropdown
  "insert.link": "Link",
  "insert.image": "Bild",
  "insert.video": "Video",
  "insert.table": "Tabelle",
  "insert.emoji": "Emoji",
  "insert.specialChars": "Sonderzeichen",
  // More menu
  "menu.more.save": "Speichern",
  "menu.more.preview": "Vorschau",
  "menu.more.download": "Herunterladen",
  "menu.more.print": "Drucken",
  "menu.more.autosave": "Automatisches Speichern",
  "menu.more.clearAll": "Alles l\xF6schen",
  "menu.more.changeTheme": "Design \xE4ndern",
  "menu.more.fullscreen": "Vollbild",
  "menu.more.help": "Hilfe",
  // Modals — common actions
  "modal.common.insert": "Einf\xFCgen",
  "modal.common.cancel": "Abbrechen",
  "modal.common.apply": "\xDCbernehmen",
  "modal.common.close": "Schlie\xDFen",
  // Modals — Link
  "modal.link.title": "Link einf\xFCgen",
  "modal.link.url": "URL",
  "modal.link.text": "Anzeigetext",
  "modal.link.newTab": "In neuem Tab \xF6ffnen",
  "modal.link.insert": "Einf\xFCgen",
  "modal.link.cancel": "Abbrechen",
  // Modals — Image
  "modal.image.title": "Bild einf\xFCgen",
  "modal.image.urlTab": "URL",
  "modal.image.uploadTab": "Hochladen",
  "modal.image.tabUrl": "URL",
  "modal.image.tabUpload": "Hochladen",
  "modal.image.url": "Bild-URL",
  "modal.image.uploadLabel": "Bild hochladen",
  "modal.image.uploadHintHandler": "Wird \xFCber den konfigurierten Handler hochgeladen",
  "modal.image.uploadHintBase64": "Wird in Base64 konvertiert",
  "modal.image.alt": "Alternativtext",
  "modal.image.altPlaceholder": "Beschreibe das Bild",
  "modal.image.width": "Breite (optional)",
  "modal.image.widthPlaceholder": "z. B. 300px oder 50%",
  "modal.image.or": "ODER",
  "modal.image.invalidFile": "Nur Bilddateien (PNG, JPEG, GIF, WebP, AVIF) werden akzeptiert.",
  "modal.image.uploading": "Wird hochgeladen\u2026",
  "modal.image.upload": "Dateien ausw\xE4hlen oder hierher ziehen",
  "modal.image.dropzone": "Bilder hier ablegen oder klicken zum Durchsuchen",
  "modal.image.insert": "Einf\xFCgen",
  "modal.image.cancel": "Abbrechen",
  // Modals — Video
  "modal.video.title": "Video einf\xFCgen",
  "modal.video.urlTab": "URL",
  "modal.video.uploadTab": "Hochladen",
  "modal.video.tabUrl": "URL",
  "modal.video.tabUpload": "Hochladen",
  "modal.video.url": "Video-URL",
  "modal.video.upload": "Datei ausw\xE4hlen",
  "modal.video.insert": "Einf\xFCgen",
  "modal.video.cancel": "Abbrechen",
  // Modals — Table
  "modal.table.title": "Tabelle einf\xFCgen",
  "modal.table.rows": "Zeilen",
  "modal.table.cols": "Spalten",
  "modal.table.columns": "Spalten",
  "modal.table.headerRow": "Kopfzeile einschlie\xDFen",
  "modal.table.insert": "Einf\xFCgen",
  "modal.table.cancel": "Abbrechen",
  // Modals — Emoji / Special chars
  "modal.emoji.title": "Emoji einf\xFCgen",
  "modal.specialChars.title": "Sonderzeichen",
  // Context menu — table
  "contextMenu.table.insertRowAbove": "Zeile oberhalb einf\xFCgen",
  "contextMenu.table.insertRowBelow": "Zeile unterhalb einf\xFCgen",
  "contextMenu.table.insertColLeft": "Spalte links einf\xFCgen",
  "contextMenu.table.insertColRight": "Spalte rechts einf\xFCgen",
  "contextMenu.table.deleteRow": "Zeile l\xF6schen",
  "contextMenu.table.deleteCol": "Spalte l\xF6schen",
  "contextMenu.table.deleteTable": "Tabelle l\xF6schen",
  "contextMenu.table.mergeCells": "Zellen verbinden",
  "contextMenu.table.splitCell": "Zelle teilen",
  // Modals — Source View
  "modal.source.title": "Quellcode anzeigen",
  "modal.source.html": "HTML",
  "modal.source.css": "CSS",
  "modal.source.apply": "\xDCbernehmen",
  "modal.source.cancel": "Abbrechen",
  // Modals — Find & Replace
  "modal.findReplace.title": "Suchen & Ersetzen",
  "modal.findReplace.find": "Suchen",
  "modal.findReplace.replace": "Ersetzen durch",
  "modal.findReplace.caseSensitive": "Gro\xDF-/Kleinschreibung beachten",
  "modal.findReplace.useRegex": "Regul\xE4rer Ausdruck",
  "modal.findReplace.findNext": "Weitersuchen",
  "modal.findReplace.replaceOne": "Ersetzen",
  "modal.findReplace.replaceAll": "Alle ersetzen",
  "modal.findReplace.close": "Schlie\xDFen",
  // Color picker
  "color.apply": "\xDCbernehmen",
  "color.reset": "Zur\xFCcksetzen",
  "color.hex": "Hex",
  // Status bar
  "statusbar.words": "W\xF6rter",
  "statusbar.characters": "Zeichen",
  "statusbar.block": "Block",
  "statusbar.autosave": "Automatisches Speichern",
  "statusbar.autosave.saved": "Gespeichert",
  "statusbar.autosave.saving": "Speichern\u2026",
  "statusbar.autosave.off": "Aus",
  "statusbar.autosave.ago": "vor",
  // Table context menu
  "table.insertRowAbove": "Zeile oberhalb einf\xFCgen",
  "table.insertRowBelow": "Zeile unterhalb einf\xFCgen",
  "table.insertColLeft": "Spalte links einf\xFCgen",
  "table.insertColRight": "Spalte rechts einf\xFCgen",
  "table.deleteRow": "Zeile l\xF6schen",
  "table.deleteColumn": "Spalte l\xF6schen",
  "table.deleteTable": "Tabelle l\xF6schen",
  "table.mergeCells": "Zellen verbinden",
  "table.splitCell": "Zelle teilen",
  // Confirm messages
  "confirm.clearAll": "M\xF6chtest du wirklich den gesamten Inhalt l\xF6schen?",
  // Error / status messages
  "error.saveFailed": "Speichern fehlgeschlagen. Deine \xC4nderungen bleiben erhalten.",
  "error.loadFailed": "Inhalt konnte nicht geladen werden.",
  "error.invalidUrl": "Ung\xFCltige URL.",
  "error.uploadFailed": "Upload fehlgeschlagen: {file}",
  "error.dataUrisDisabled": "Das Einbetten von Dateien ist deaktiviert. Bitte gib eine URL an oder konfiguriere einen Upload-Handler.",
  "error.invalidStylesheetUrl": "Stylesheet-URL abgelehnt: {url}",
  // Themes
  "theme.light": "Hell",
  "theme.dark": "Dunkel",
  "theme.blue": "Blau",
  "theme.darkBlue": "Dunkelblau",
  "theme.midnight": "Mitternacht",
  "theme.void": "Void",
  "theme.autumn": "Herbst",
  // Help
  "help.title": "Hilfe",
  "help.close": "Schlie\xDFen",
  "help.author": "Autor",
  "help.version": "Version",
  "help.github": "GitHub",
  // Overlay — media resize / contextual toolbar
  "overlay.media.toolbar": "Medien-Werkzeugleiste",
  "overlay.media.drag": "Ziehen zum Verschieben",
  "overlay.media.replace": "Ersetzen",
  "overlay.media.delete": "L\xF6schen",
  // Floating toolbar
  "floatingToolbar.label": "Auswahl-Werkzeugleiste",
  "floatingToolbar.link": "Link einf\xFCgen",
  "floatingToolbar.moveBlockUp": "Block nach oben verschieben",
  "floatingToolbar.moveBlockDown": "Block nach unten verschieben"
};

// src/i18n/fr.js
var fr = {
  // Toolbar buttons
  "toolbar.viewCode": "Voir le code source",
  "toolbar.undo": "Annuler",
  "toolbar.redo": "R\xE9tablir",
  "toolbar.findReplace": "Rechercher et remplacer",
  "toolbar.bold": "Gras",
  "toolbar.italic": "Italique",
  "toolbar.underline": "Soulign\xE9",
  "toolbar.strikethrough": "Barr\xE9",
  "toolbar.superscript": "Exposant",
  "toolbar.subscript": "Indice",
  "toolbar.code": "Code en ligne",
  "toolbar.removeFormat": "Supprimer la mise en forme",
  "toolbar.heading": "Titre",
  "toolbar.fontFamily": "Police",
  "toolbar.fontSize": "Taille de police",
  "toolbar.foreColor": "Couleur du texte",
  "toolbar.backColor": "Couleur de fond",
  "toolbar.alignLeft": "Aligner \xE0 gauche",
  "toolbar.alignCenter": "Centrer",
  "toolbar.alignRight": "Aligner \xE0 droite",
  "toolbar.alignJustify": "Justifier",
  "toolbar.indent": "Augmenter le retrait",
  "toolbar.outdent": "Diminuer le retrait",
  "toolbar.bulletList": "Liste \xE0 puces",
  "toolbar.numberedList": "Liste num\xE9rot\xE9e",
  "toolbar.blockquote": "Citation",
  "toolbar.horizontalRule": "Ligne horizontale",
  "toolbar.insertDropdown": "Ins\xE9rer",
  "toolbar.moreMenu": "Plus",
  // Heading options
  "heading.paragraph": "Paragraphe",
  "heading.h1": "Titre 1",
  "heading.h2": "Titre 2",
  "heading.h3": "Titre 3",
  "heading.h4": "Titre 4",
  "heading.h5": "Titre 5",
  "heading.h6": "Titre 6",
  // Font families
  "fontFamily.sansSerif": "Sans Serif",
  "fontFamily.serif": "Serif",
  "fontFamily.monospace": "Monospace",
  "fontFamily.cursive": "Cursive",
  // Insert dropdown
  "insert.link": "Lien",
  "insert.image": "Image",
  "insert.video": "Vid\xE9o",
  "insert.table": "Tableau",
  "insert.emoji": "Emoji",
  "insert.specialChars": "Caract\xE8res sp\xE9ciaux",
  // More menu
  "menu.more.save": "Enregistrer",
  "menu.more.preview": "Aper\xE7u",
  "menu.more.download": "T\xE9l\xE9charger",
  "menu.more.print": "Imprimer",
  "menu.more.autosave": "Enregistrement automatique",
  "menu.more.clearAll": "Tout effacer",
  "menu.more.changeTheme": "Changer de th\xE8me",
  "menu.more.fullscreen": "Plein \xE9cran",
  "menu.more.help": "Aide",
  // Modals — common actions
  "modal.common.insert": "Ins\xE9rer",
  "modal.common.cancel": "Annuler",
  "modal.common.apply": "Appliquer",
  "modal.common.close": "Fermer",
  // Modals — Link
  "modal.link.title": "Ins\xE9rer un lien",
  "modal.link.url": "URL",
  "modal.link.text": "Texte affich\xE9",
  "modal.link.newTab": "Ouvrir dans un nouvel onglet",
  "modal.link.insert": "Ins\xE9rer",
  "modal.link.cancel": "Annuler",
  // Modals — Image
  "modal.image.title": "Ins\xE9rer une image",
  "modal.image.urlTab": "URL",
  "modal.image.uploadTab": "T\xE9l\xE9verser",
  "modal.image.tabUrl": "URL",
  "modal.image.tabUpload": "T\xE9l\xE9verser",
  "modal.image.url": "URL de l\u2019image",
  "modal.image.uploadLabel": "T\xE9l\xE9verser une image",
  "modal.image.uploadHintHandler": "Sera t\xE9l\xE9vers\xE9e via le gestionnaire configur\xE9",
  "modal.image.uploadHintBase64": "Sera convertie en base64",
  "modal.image.alt": "Texte alternatif",
  "modal.image.altPlaceholder": "D\xE9crivez l\u2019image",
  "modal.image.width": "Largeur (optionnel)",
  "modal.image.widthPlaceholder": "ex. 300px ou 50%",
  "modal.image.or": "OU",
  "modal.image.invalidFile": "Seuls les fichiers image (PNG, JPEG, GIF, WebP, AVIF) sont accept\xE9s.",
  "modal.image.uploading": "T\xE9l\xE9versement\u2026",
  "modal.image.upload": "Choisissez des fichiers ou glissez-d\xE9posez",
  "modal.image.dropzone": "D\xE9posez les images ici ou cliquez pour parcourir",
  "modal.image.insert": "Ins\xE9rer",
  "modal.image.cancel": "Annuler",
  // Modals — Video
  "modal.video.title": "Ins\xE9rer une vid\xE9o",
  "modal.video.urlTab": "URL",
  "modal.video.uploadTab": "T\xE9l\xE9verser",
  "modal.video.tabUrl": "URL",
  "modal.video.tabUpload": "T\xE9l\xE9verser",
  "modal.video.url": "URL de la vid\xE9o",
  "modal.video.upload": "Choisir un fichier",
  "modal.video.insert": "Ins\xE9rer",
  "modal.video.cancel": "Annuler",
  // Modals — Table
  "modal.table.title": "Ins\xE9rer un tableau",
  "modal.table.rows": "Lignes",
  "modal.table.cols": "Colonnes",
  "modal.table.columns": "Colonnes",
  "modal.table.headerRow": "Inclure une ligne d\u2019en-t\xEAte",
  "modal.table.insert": "Ins\xE9rer",
  "modal.table.cancel": "Annuler",
  // Modals — Emoji / Special chars
  "modal.emoji.title": "Ins\xE9rer un emoji",
  "modal.specialChars.title": "Caract\xE8res sp\xE9ciaux",
  // Context menu — table
  "contextMenu.table.insertRowAbove": "Ins\xE9rer une ligne au-dessus",
  "contextMenu.table.insertRowBelow": "Ins\xE9rer une ligne en dessous",
  "contextMenu.table.insertColLeft": "Ins\xE9rer une colonne \xE0 gauche",
  "contextMenu.table.insertColRight": "Ins\xE9rer une colonne \xE0 droite",
  "contextMenu.table.deleteRow": "Supprimer la ligne",
  "contextMenu.table.deleteCol": "Supprimer la colonne",
  "contextMenu.table.deleteTable": "Supprimer le tableau",
  "contextMenu.table.mergeCells": "Fusionner les cellules",
  "contextMenu.table.splitCell": "Diviser la cellule",
  // Modals — Source View
  "modal.source.title": "Voir le code source",
  "modal.source.html": "HTML",
  "modal.source.css": "CSS",
  "modal.source.apply": "Appliquer",
  "modal.source.cancel": "Annuler",
  // Modals — Find & Replace
  "modal.findReplace.title": "Rechercher et remplacer",
  "modal.findReplace.find": "Rechercher",
  "modal.findReplace.replace": "Remplacer par",
  "modal.findReplace.caseSensitive": "Respecter la casse",
  "modal.findReplace.useRegex": "Expression r\xE9guli\xE8re",
  "modal.findReplace.findNext": "Suivant",
  "modal.findReplace.replaceOne": "Remplacer",
  "modal.findReplace.replaceAll": "Tout remplacer",
  "modal.findReplace.close": "Fermer",
  // Color picker
  "color.apply": "Appliquer",
  "color.reset": "R\xE9initialiser",
  "color.hex": "Hex",
  // Status bar
  "statusbar.words": "Mots",
  "statusbar.characters": "Caract\xE8res",
  "statusbar.block": "Bloc",
  "statusbar.autosave": "Enregistrement automatique",
  "statusbar.autosave.saved": "Enregistr\xE9",
  "statusbar.autosave.saving": "Enregistrement\u2026",
  "statusbar.autosave.off": "D\xE9sactiv\xE9",
  "statusbar.autosave.ago": "il y a",
  // Table context menu
  "table.insertRowAbove": "Ins\xE9rer une ligne au-dessus",
  "table.insertRowBelow": "Ins\xE9rer une ligne en dessous",
  "table.insertColLeft": "Ins\xE9rer une colonne \xE0 gauche",
  "table.insertColRight": "Ins\xE9rer une colonne \xE0 droite",
  "table.deleteRow": "Supprimer la ligne",
  "table.deleteColumn": "Supprimer la colonne",
  "table.deleteTable": "Supprimer le tableau",
  "table.mergeCells": "Fusionner les cellules",
  "table.splitCell": "Diviser la cellule",
  // Confirm messages
  "confirm.clearAll": "Voulez-vous vraiment effacer tout le contenu ?",
  // Error / status messages
  "error.saveFailed": "\xC9chec de l\u2019enregistrement. Vos modifications sont conserv\xE9es.",
  "error.loadFailed": "\xC9chec du chargement du contenu.",
  "error.invalidUrl": "URL invalide.",
  "error.uploadFailed": "\xC9chec du t\xE9l\xE9versement : {file}",
  "error.dataUrisDisabled": "L\u2019int\xE9gration de fichiers est d\xE9sactiv\xE9e. Veuillez fournir une URL ou configurer un gestionnaire de t\xE9l\xE9versement.",
  "error.invalidStylesheetUrl": "URL de feuille de style rejet\xE9e : {url}",
  // Themes
  "theme.light": "Clair",
  "theme.dark": "Sombre",
  "theme.blue": "Bleu",
  "theme.darkBlue": "Bleu fonc\xE9",
  "theme.midnight": "Minuit",
  "theme.void": "Vide",
  "theme.autumn": "Automne",
  // Help
  "help.title": "Aide",
  "help.close": "Fermer",
  "help.author": "Auteur",
  "help.version": "Version",
  "help.github": "GitHub",
  // Overlay — media resize / contextual toolbar
  "overlay.media.toolbar": "Barre d\u2019outils multim\xE9dia",
  "overlay.media.drag": "Faites glisser pour repositionner",
  "overlay.media.replace": "Remplacer",
  "overlay.media.delete": "Supprimer",
  // Floating toolbar
  "floatingToolbar.label": "Barre d\u2019outils de s\xE9lection",
  "floatingToolbar.link": "Ins\xE9rer un lien",
  "floatingToolbar.moveBlockUp": "D\xE9placer le bloc vers le haut",
  "floatingToolbar.moveBlockDown": "D\xE9placer le bloc vers le bas"
};

// src/i18n/ja.js
var ja = {
  // Toolbar buttons
  "toolbar.viewCode": "\u30BD\u30FC\u30B9\u3092\u8868\u793A",
  "toolbar.undo": "\u5143\u306B\u623B\u3059",
  "toolbar.redo": "\u3084\u308A\u76F4\u3059",
  "toolbar.findReplace": "\u691C\u7D22\u3068\u7F6E\u63DB",
  "toolbar.bold": "\u592A\u5B57",
  "toolbar.italic": "\u659C\u4F53",
  "toolbar.underline": "\u4E0B\u7DDA",
  "toolbar.strikethrough": "\u53D6\u308A\u6D88\u3057\u7DDA",
  "toolbar.superscript": "\u4E0A\u4ED8\u304D\u6587\u5B57",
  "toolbar.subscript": "\u4E0B\u4ED8\u304D\u6587\u5B57",
  "toolbar.code": "\u30A4\u30F3\u30E9\u30A4\u30F3\u30B3\u30FC\u30C9",
  "toolbar.removeFormat": "\u66F8\u5F0F\u3092\u30AF\u30EA\u30A2",
  "toolbar.heading": "\u898B\u51FA\u3057",
  "toolbar.fontFamily": "\u30D5\u30A9\u30F3\u30C8",
  "toolbar.fontSize": "\u30D5\u30A9\u30F3\u30C8\u30B5\u30A4\u30BA",
  "toolbar.foreColor": "\u6587\u5B57\u8272",
  "toolbar.backColor": "\u80CC\u666F\u8272",
  "toolbar.alignLeft": "\u5DE6\u63C3\u3048",
  "toolbar.alignCenter": "\u4E2D\u592E\u63C3\u3048",
  "toolbar.alignRight": "\u53F3\u63C3\u3048",
  "toolbar.alignJustify": "\u4E21\u7AEF\u63C3\u3048",
  "toolbar.indent": "\u30A4\u30F3\u30C7\u30F3\u30C8\u3092\u5897\u3084\u3059",
  "toolbar.outdent": "\u30A4\u30F3\u30C7\u30F3\u30C8\u3092\u6E1B\u3089\u3059",
  "toolbar.bulletList": "\u7B87\u6761\u66F8\u304D\u30EA\u30B9\u30C8",
  "toolbar.numberedList": "\u756A\u53F7\u4ED8\u304D\u30EA\u30B9\u30C8",
  "toolbar.blockquote": "\u5F15\u7528",
  "toolbar.horizontalRule": "\u6C34\u5E73\u7DDA",
  "toolbar.insertDropdown": "\u633F\u5165",
  "toolbar.moreMenu": "\u3082\u3063\u3068\u898B\u308B",
  // Heading options
  "heading.paragraph": "\u6BB5\u843D",
  "heading.h1": "\u898B\u51FA\u3057 1",
  "heading.h2": "\u898B\u51FA\u3057 2",
  "heading.h3": "\u898B\u51FA\u3057 3",
  "heading.h4": "\u898B\u51FA\u3057 4",
  "heading.h5": "\u898B\u51FA\u3057 5",
  "heading.h6": "\u898B\u51FA\u3057 6",
  // Font families
  "fontFamily.sansSerif": "\u30B4\u30B7\u30C3\u30AF\u4F53",
  "fontFamily.serif": "\u660E\u671D\u4F53",
  "fontFamily.monospace": "\u7B49\u5E45\u30D5\u30A9\u30F3\u30C8",
  "fontFamily.cursive": "\u7B46\u8A18\u4F53",
  // Insert dropdown
  "insert.link": "\u30EA\u30F3\u30AF",
  "insert.image": "\u753B\u50CF",
  "insert.video": "\u52D5\u753B",
  "insert.table": "\u8868",
  "insert.emoji": "\u7D75\u6587\u5B57",
  "insert.specialChars": "\u7279\u6B8A\u6587\u5B57",
  // More menu
  "menu.more.save": "\u4FDD\u5B58",
  "menu.more.preview": "\u30D7\u30EC\u30D3\u30E5\u30FC",
  "menu.more.download": "\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9",
  "menu.more.print": "\u5370\u5237",
  "menu.more.autosave": "\u81EA\u52D5\u4FDD\u5B58",
  "menu.more.clearAll": "\u3059\u3079\u3066\u6D88\u53BB",
  "menu.more.changeTheme": "\u30C6\u30FC\u30DE\u3092\u5909\u66F4",
  "menu.more.fullscreen": "\u5168\u753B\u9762\u8868\u793A",
  "menu.more.help": "\u30D8\u30EB\u30D7",
  // Modals — common actions
  "modal.common.insert": "\u633F\u5165",
  "modal.common.cancel": "\u30AD\u30E3\u30F3\u30BB\u30EB",
  "modal.common.apply": "\u9069\u7528",
  "modal.common.close": "\u9589\u3058\u308B",
  // Modals — Link
  "modal.link.title": "\u30EA\u30F3\u30AF\u3092\u633F\u5165",
  "modal.link.url": "URL",
  "modal.link.text": "\u8868\u793A\u30C6\u30AD\u30B9\u30C8",
  "modal.link.newTab": "\u65B0\u3057\u3044\u30BF\u30D6\u3067\u958B\u304F",
  "modal.link.insert": "\u633F\u5165",
  "modal.link.cancel": "\u30AD\u30E3\u30F3\u30BB\u30EB",
  // Modals — Image
  "modal.image.title": "\u753B\u50CF\u3092\u633F\u5165",
  "modal.image.urlTab": "URL",
  "modal.image.uploadTab": "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9",
  "modal.image.tabUrl": "URL",
  "modal.image.tabUpload": "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9",
  "modal.image.url": "\u753B\u50CF\u306EURL",
  "modal.image.uploadLabel": "\u753B\u50CF\u3092\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9",
  "modal.image.uploadHintHandler": "\u8A2D\u5B9A\u6E08\u307F\u306E\u30CF\u30F3\u30C9\u30E9\u30FC\u7D4C\u7531\u3067\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u3055\u308C\u307E\u3059",
  "modal.image.uploadHintBase64": "base64\u306B\u5909\u63DB\u3055\u308C\u307E\u3059",
  "modal.image.alt": "\u4EE3\u66FF\u30C6\u30AD\u30B9\u30C8",
  "modal.image.altPlaceholder": "\u753B\u50CF\u306E\u8AAC\u660E\u3092\u5165\u529B",
  "modal.image.width": "\u5E45\uFF08\u4EFB\u610F\uFF09",
  "modal.image.widthPlaceholder": "\u4F8B\uFF1A300px \u3084 50%",
  "modal.image.or": "\u307E\u305F\u306F",
  "modal.image.invalidFile": "\u753B\u50CF\u30D5\u30A1\u30A4\u30EB\uFF08PNG\u3001JPEG\u3001GIF\u3001WebP\u3001AVIF\uFF09\u306E\u307F\u5229\u7528\u3067\u304D\u307E\u3059\u3002",
  "modal.image.uploading": "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u4E2D\u2026",
  "modal.image.upload": "\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E\u307E\u305F\u306F\u30C9\u30E9\u30C3\u30B0\uFF06\u30C9\u30ED\u30C3\u30D7",
  "modal.image.dropzone": "\u3053\u3053\u306B\u753B\u50CF\u3092\u30C9\u30ED\u30C3\u30D7\u3001\u307E\u305F\u306F\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u9078\u629E",
  "modal.image.insert": "\u633F\u5165",
  "modal.image.cancel": "\u30AD\u30E3\u30F3\u30BB\u30EB",
  // Modals — Video
  "modal.video.title": "\u52D5\u753B\u3092\u633F\u5165",
  "modal.video.urlTab": "URL",
  "modal.video.uploadTab": "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9",
  "modal.video.tabUrl": "URL",
  "modal.video.tabUpload": "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9",
  "modal.video.url": "\u52D5\u753B\u306EURL",
  "modal.video.upload": "\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E",
  "modal.video.insert": "\u633F\u5165",
  "modal.video.cancel": "\u30AD\u30E3\u30F3\u30BB\u30EB",
  // Modals — Table
  "modal.table.title": "\u8868\u3092\u633F\u5165",
  "modal.table.rows": "\u884C\u6570",
  "modal.table.cols": "\u5217\u6570",
  "modal.table.columns": "\u5217\u6570",
  "modal.table.headerRow": "\u30D8\u30C3\u30C0\u30FC\u884C\u3092\u542B\u3081\u308B",
  "modal.table.insert": "\u633F\u5165",
  "modal.table.cancel": "\u30AD\u30E3\u30F3\u30BB\u30EB",
  // Modals — Emoji / Special chars
  "modal.emoji.title": "\u7D75\u6587\u5B57\u3092\u633F\u5165",
  "modal.specialChars.title": "\u7279\u6B8A\u6587\u5B57",
  // Context menu — table
  "contextMenu.table.insertRowAbove": "\u4E0A\u306B\u884C\u3092\u633F\u5165",
  "contextMenu.table.insertRowBelow": "\u4E0B\u306B\u884C\u3092\u633F\u5165",
  "contextMenu.table.insertColLeft": "\u5DE6\u306B\u5217\u3092\u633F\u5165",
  "contextMenu.table.insertColRight": "\u53F3\u306B\u5217\u3092\u633F\u5165",
  "contextMenu.table.deleteRow": "\u884C\u3092\u524A\u9664",
  "contextMenu.table.deleteCol": "\u5217\u3092\u524A\u9664",
  "contextMenu.table.deleteTable": "\u8868\u3092\u524A\u9664",
  "contextMenu.table.mergeCells": "\u30BB\u30EB\u3092\u7D50\u5408",
  "contextMenu.table.splitCell": "\u30BB\u30EB\u3092\u5206\u5272",
  // Modals — Source View
  "modal.source.title": "\u30BD\u30FC\u30B9\u3092\u8868\u793A",
  "modal.source.html": "HTML",
  "modal.source.css": "CSS",
  "modal.source.apply": "\u9069\u7528",
  "modal.source.cancel": "\u30AD\u30E3\u30F3\u30BB\u30EB",
  // Modals — Find & Replace
  "modal.findReplace.title": "\u691C\u7D22\u3068\u7F6E\u63DB",
  "modal.findReplace.find": "\u691C\u7D22",
  "modal.findReplace.replace": "\u7F6E\u63DB\u5F8C\u306E\u6587\u5B57\u5217",
  "modal.findReplace.caseSensitive": "\u5927\u6587\u5B57\u3068\u5C0F\u6587\u5B57\u3092\u533A\u5225",
  "modal.findReplace.useRegex": "\u6B63\u898F\u8868\u73FE",
  "modal.findReplace.findNext": "\u6B21\u3092\u691C\u7D22",
  "modal.findReplace.replaceOne": "\u7F6E\u63DB",
  "modal.findReplace.replaceAll": "\u3059\u3079\u3066\u7F6E\u63DB",
  "modal.findReplace.close": "\u9589\u3058\u308B",
  // Color picker
  "color.apply": "\u9069\u7528",
  "color.reset": "\u30EA\u30BB\u30C3\u30C8",
  "color.hex": "16\u9032\u6570",
  // Status bar
  "statusbar.words": "\u5358\u8A9E\u6570",
  "statusbar.characters": "\u6587\u5B57\u6570",
  "statusbar.block": "\u30D6\u30ED\u30C3\u30AF",
  "statusbar.autosave": "\u81EA\u52D5\u4FDD\u5B58",
  "statusbar.autosave.saved": "\u4FDD\u5B58\u6E08\u307F",
  "statusbar.autosave.saving": "\u4FDD\u5B58\u4E2D\u2026",
  "statusbar.autosave.off": "\u30AA\u30D5",
  "statusbar.autosave.ago": "\u524D",
  // Table context menu
  "table.insertRowAbove": "\u4E0A\u306B\u884C\u3092\u633F\u5165",
  "table.insertRowBelow": "\u4E0B\u306B\u884C\u3092\u633F\u5165",
  "table.insertColLeft": "\u5DE6\u306B\u5217\u3092\u633F\u5165",
  "table.insertColRight": "\u53F3\u306B\u5217\u3092\u633F\u5165",
  "table.deleteRow": "\u884C\u3092\u524A\u9664",
  "table.deleteColumn": "\u5217\u3092\u524A\u9664",
  "table.deleteTable": "\u8868\u3092\u524A\u9664",
  "table.mergeCells": "\u30BB\u30EB\u3092\u7D50\u5408",
  "table.splitCell": "\u30BB\u30EB\u3092\u5206\u5272",
  // Confirm messages
  "confirm.clearAll": "\u3059\u3079\u3066\u306E\u5185\u5BB9\u3092\u6D88\u53BB\u3057\u3066\u3082\u3088\u308D\u3057\u3044\u3067\u3059\u304B\uFF1F",
  // Error / status messages
  "error.saveFailed": "\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u5909\u66F4\u5185\u5BB9\u306F\u4FDD\u6301\u3055\u308C\u3066\u3044\u307E\u3059\u3002",
  "error.loadFailed": "\u30B3\u30F3\u30C6\u30F3\u30C4\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002",
  "error.invalidUrl": "\u7121\u52B9\u306AURL\u3067\u3059\u3002",
  "error.uploadFailed": "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306B\u5931\u6557\u3057\u307E\u3057\u305F\uFF1A{file}",
  "error.dataUrisDisabled": "\u30D5\u30A1\u30A4\u30EB\u306E\u57CB\u3081\u8FBC\u307F\u306F\u7121\u52B9\u306B\u306A\u3063\u3066\u3044\u307E\u3059\u3002URL\u3092\u6307\u5B9A\u3059\u308B\u304B\u3001\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u30CF\u30F3\u30C9\u30E9\u30FC\u3092\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  "error.invalidStylesheetUrl": "\u30B9\u30BF\u30A4\u30EB\u30B7\u30FC\u30C8\u306EURL\u304C\u62D2\u5426\u3055\u308C\u307E\u3057\u305F\uFF1A{url}",
  // Themes
  "theme.light": "\u30E9\u30A4\u30C8",
  "theme.dark": "\u30C0\u30FC\u30AF",
  "theme.blue": "\u30D6\u30EB\u30FC",
  "theme.darkBlue": "\u30C0\u30FC\u30AF\u30D6\u30EB\u30FC",
  "theme.midnight": "\u30DF\u30C3\u30C9\u30CA\u30A4\u30C8",
  "theme.void": "\u30F4\u30A9\u30A4\u30C9",
  "theme.autumn": "\u30AA\u30FC\u30BF\u30E0",
  // Help
  "help.title": "\u30D8\u30EB\u30D7",
  "help.close": "\u9589\u3058\u308B",
  "help.author": "\u4F5C\u8005",
  "help.version": "\u30D0\u30FC\u30B8\u30E7\u30F3",
  "help.github": "GitHub",
  // Overlay — media resize / contextual toolbar
  "overlay.media.toolbar": "\u30E1\u30C7\u30A3\u30A2\u30C4\u30FC\u30EB\u30D0\u30FC",
  "overlay.media.drag": "\u30C9\u30E9\u30C3\u30B0\u3057\u3066\u4F4D\u7F6E\u3092\u5909\u66F4",
  "overlay.media.replace": "\u7F6E\u304D\u63DB\u3048",
  "overlay.media.delete": "\u524A\u9664",
  // Floating toolbar
  "floatingToolbar.label": "\u9078\u629E\u30C4\u30FC\u30EB\u30D0\u30FC",
  "floatingToolbar.link": "\u30EA\u30F3\u30AF\u3092\u633F\u5165",
  "floatingToolbar.moveBlockUp": "\u30D6\u30ED\u30C3\u30AF\u3092\u4E0A\u306B\u79FB\u52D5",
  "floatingToolbar.moveBlockDown": "\u30D6\u30ED\u30C3\u30AF\u3092\u4E0B\u306B\u79FB\u52D5"
};

// src/i18n/i18n.js
var _builtinMaps = /* @__PURE__ */ new Map([
  ["en", en],
  ["cs", cs],
  ["es", es],
  ["zh", zh],
  ["de", de],
  ["fr", fr],
  ["ja", ja]
]);
var _customMaps = /* @__PURE__ */ new Map();
function addTranslation(lang, keys) {
  if (!lang || typeof lang !== "string") return;
  const existing = _customMaps.get(lang) || {};
  _customMaps.set(lang, Object.assign({}, existing, keys));
}
function createI18n(language = "en", customTranslations = {}) {
  function t(key, vars) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    let value = (_i = (_h = (_f = (_d = (_b = customTranslations[key]) != null ? _b : (
      // 1. per-instance overrides
      (_a = _customMaps.get(language)) == null ? void 0 : _a[key]
    )) != null ? _d : (
      // 2. custom registered language
      (_c = _builtinMaps.get(language)) == null ? void 0 : _c[key]
    )) != null ? _f : (
      // 3. builtin active language
      (_e = _customMaps.get("en")) == null ? void 0 : _e[key]
    )) != null ? _h : (
      // 4. custom English
      (_g = _builtinMaps.get("en")) == null ? void 0 : _g[key]
    )) != null ? _i : (
      // 5. builtin English
      key
    );
    if (vars && typeof value === "string") {
      value = value.replace(/\{(\w+)\}/g, (_, k) => vars[k] !== void 0 ? vars[k] : `{${k}}`);
    }
    return value;
  }
  return { t };
}

// src/toolbar/buttons/ButtonBase.js
var ButtonBase = class {
  /**
   * @param {object} opts
   * @param {string} opts.id — toolbar control id (e.g. 'bold')
   * @param {string} opts.label — translated label for aria-label and title
   * @param {string} [opts.icon] — SVG/text icon content (HTML string)
   * @param {boolean} [opts.toggle] — true if button can be in active/pressed state
   * @param {boolean} [opts.disabled] — initial disabled state
   * @param {Function} [opts.onClick] — click handler
   */
  constructor(opts = {}) {
    this._id = opts.id || "";
    this._label = opts.label || "";
    this._icon = opts.icon || "";
    this._toggle = opts.toggle !== false;
    this._active = false;
    this._disabled = opts.disabled || false;
    this._onClick = opts.onClick || null;
    this._el = null;
    this._render();
    this._bindEvents();
  }
  _render() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "npe-btn";
    btn.setAttribute("data-npe-cmd", this._id);
    btn.setAttribute("title", this._label);
    btn.setAttribute("aria-label", this._label);
    if (this._toggle) {
      btn.setAttribute("aria-pressed", "false");
    }
    if (this._icon) {
      if (this._icon.trim().startsWith("<")) {
        btn.innerHTML = this._icon;
      } else {
        btn.textContent = this._icon;
      }
    } else {
      btn.textContent = this._getDefaultText();
    }
    if (this._disabled) {
      this._applyDisabled(btn, true);
    }
    this._el = btn;
  }
  _getDefaultText() {
    const textMap = {
      bold: "B",
      italic: "I",
      underline: "U",
      strikethrough: "S",
      superscript: "x\xB2",
      subscript: "x\u2082",
      code: "<>",
      removeFormat: "\u2715",
      undo: "\u21A9",
      redo: "\u21AA",
      viewCode: "</>",
      findReplace: "\u{1F50D}",
      alignLeft: "\u2261",
      alignCenter: "\u2630",
      alignRight: "\u2261",
      alignJustify: "\u2261",
      indent: "\u2192",
      outdent: "\u2190",
      bulletList: "\u2022",
      numberedList: "1.",
      blockquote: '"',
      horizontalRule: "\u2014"
    };
    return textMap[this._id] || this._id;
  }
  _bindEvents() {
    if (!this._el) return;
    this._el.addEventListener("click", (e) => {
      if (this._disabled) return;
      if (this._onClick) this._onClick(e, this);
    });
  }
  /**
   * Return the rendered DOM element.
   * @returns {HTMLButtonElement}
   */
  render() {
    return this._el;
  }
  /**
   * Set the active/pressed state.
   * @param {boolean} active
   */
  setActive(active) {
    this._active = !!active;
    if (!this._el) return;
    if (this._toggle) {
      this._el.setAttribute("aria-pressed", this._active ? "true" : "false");
    }
    this._el.classList.toggle("npe-active", this._active);
  }
  /**
   * Set the disabled state.
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this._disabled = !!disabled;
    if (!this._el) return;
    this._applyDisabled(this._el, this._disabled);
  }
  /**
   * @param {HTMLElement} el
   * @param {boolean} disabled
   */
  _applyDisabled(el, disabled) {
    if (disabled) {
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("tabindex", "-1");
      el.classList.add("npe-disabled");
    } else {
      el.removeAttribute("aria-disabled");
      el.removeAttribute("tabindex");
      el.classList.remove("npe-disabled");
    }
  }
  /**
   * Update the translated label.
   * @param {string} label
   */
  setLabel(label) {
    this._label = label;
    if (!this._el) return;
    this._el.setAttribute("title", label);
    this._el.setAttribute("aria-label", label);
  }
  /**
   * Destroy the button.
   */
  destroy() {
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
  }
};

// src/toolbar/buttons/HeadingSelect.js
var HeadingSelect = class {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onChange] — called with the selected value ('p', 'h1'–'h6')
   * @param {boolean} [opts.disabled]
   */
  constructor(opts = {}) {
    this._i18n = opts.i18n || { t: (k) => k };
    this._onChange = opts.onChange || null;
    this._disabled = opts.disabled || false;
    this._el = null;
    this._render();
  }
  _render() {
    const select = document.createElement("select");
    select.className = "npe-select npe-heading-select";
    select.setAttribute("aria-label", this._i18n.t("toolbar.heading"));
    select.setAttribute("title", this._i18n.t("toolbar.heading"));
    const options = [
      { value: "p", key: "heading.paragraph" },
      { value: "h1", key: "heading.h1" },
      { value: "h2", key: "heading.h2" },
      { value: "h3", key: "heading.h3" },
      { value: "h4", key: "heading.h4" },
      { value: "h5", key: "heading.h5" },
      { value: "h6", key: "heading.h6" }
    ];
    for (const opt of options) {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = this._i18n.t(opt.key);
      select.appendChild(option);
    }
    if (this._disabled) {
      select.disabled = true;
      select.setAttribute("aria-disabled", "true");
    }
    select.addEventListener("change", () => {
      if (this._onChange) this._onChange(select.value);
    });
    this._el = select;
  }
  /**
   * Return the rendered element.
   * @returns {HTMLSelectElement}
   */
  render() {
    return this._el;
  }
  /**
   * Set the currently selected value.
   * @param {string} value — e.g. 'p', 'h1', 'h2', etc.
   */
  setValue(value) {
    if (!this._el) return;
    this._el.value = value || "p";
  }
  /**
   * Set disabled state.
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this._disabled = !!disabled;
    if (!this._el) return;
    this._el.disabled = this._disabled;
    if (this._disabled) {
      this._el.setAttribute("aria-disabled", "true");
    } else {
      this._el.removeAttribute("aria-disabled");
    }
  }
  destroy() {
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
  }
};

// src/toolbar/buttons/FontFamilySelect.js
var FontFamilySelect = class {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onChange] — called with the selected CSS font-family value
   * @param {boolean} [opts.disabled]
   */
  constructor(opts = {}) {
    this._i18n = opts.i18n || { t: (k) => k };
    this._onChange = opts.onChange || null;
    this._disabled = opts.disabled || false;
    this._el = null;
    this._render();
  }
  _render() {
    const select = document.createElement("select");
    select.className = "npe-select npe-font-family-select";
    select.setAttribute("aria-label", this._i18n.t("toolbar.fontFamily"));
    select.setAttribute("title", this._i18n.t("toolbar.fontFamily"));
    const options = [
      { value: "", key: "toolbar.fontFamily" },
      // placeholder
      { value: "Arial, Helvetica, sans-serif", key: "fontFamily.sansSerif" },
      { value: 'Georgia, "Times New Roman", serif', key: "fontFamily.serif" },
      { value: '"Courier New", Courier, monospace', key: "fontFamily.monospace" },
      { value: '"Comic Sans MS", cursive', key: "fontFamily.cursive" }
    ];
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = this._i18n.t(opt.key);
      if (i === 0) {
        option.disabled = true;
        option.selected = true;
      }
      select.appendChild(option);
    }
    if (this._disabled) {
      select.disabled = true;
      select.setAttribute("aria-disabled", "true");
    }
    select.addEventListener("change", () => {
      if (this._onChange) this._onChange(select.value);
    });
    this._el = select;
  }
  /**
   * Return the rendered element.
   * @returns {HTMLSelectElement}
   */
  render() {
    return this._el;
  }
  /**
   * Set the currently selected value.
   * @param {string} value — CSS font-family value
   */
  setValue(value) {
    if (!this._el) return;
    this._el.value = value || "";
  }
  /**
   * Set disabled state.
   * @param {boolean} disabled
   */
  setDisabled(disabled) {
    this._disabled = !!disabled;
    if (!this._el) return;
    this._el.disabled = this._disabled;
    if (this._disabled) {
      this._el.setAttribute("aria-disabled", "true");
    } else {
      this._el.removeAttribute("aria-disabled");
    }
  }
  destroy() {
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
  }
};

// src/toolbar/buttons/FontSizeWidget.js
var FONT_SIZE_PRESETS = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];
var DEFAULT_SIZE = 16;
var MIN_SIZE = 1;
var MAX_SIZE = 400;
var FontSizeWidget = class {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onChange] — called with numeric pixel value
   * @param {boolean} [opts.disabled]
   */
  constructor(opts = {}) {
    this._i18n = opts.i18n || { t: (k) => k };
    this._onChange = opts.onChange || null;
    this._disabled = opts.disabled || false;
    this._value = DEFAULT_SIZE;
    this._el = null;
    this._decBtn = null;
    this._input = null;
    this._dropBtn = null;
    this._incBtn = null;
    this._popup = null;
    this._popupOpen = false;
    this._docCloseHandler = null;
    this._render();
  }
  _render() {
    const wrapper = document.createElement("div");
    wrapper.className = "npe-font-size-widget";
    wrapper.setAttribute("role", "group");
    wrapper.setAttribute("aria-label", this._i18n.t("toolbar.fontSize"));
    wrapper.style.position = "relative";
    const decBtn = document.createElement("button");
    decBtn.type = "button";
    decBtn.className = "npe-btn npe-font-size-dec";
    decBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 13H5v-2h14v2z"/></svg>';
    decBtn.setAttribute("aria-label", "Decrease font size");
    decBtn.setAttribute("title", "Decrease font size");
    decBtn.addEventListener("click", () => {
      this._closePopup();
      this._adjustSize(-1);
    });
    const input = document.createElement("input");
    input.type = "number";
    input.className = "npe-font-size-input";
    input.min = String(MIN_SIZE);
    input.max = String(MAX_SIZE);
    input.value = String(this._value);
    input.setAttribute("aria-label", this._i18n.t("toolbar.fontSize"));
    input.setAttribute("aria-haspopup", "listbox");
    input.setAttribute("aria-expanded", "false");
    input.addEventListener("change", () => {
      const v = parseInt(input.value, 10);
      if (!isNaN(v)) this._setValue(v, true);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this._adjustSize(1);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this._adjustSize(-1);
      }
      if (e.key === "Escape") {
        this._closePopup();
      }
      if (e.key === "Enter") {
        this._closePopup();
      }
    });
    input.addEventListener("click", (e) => {
      e.stopPropagation();
      this._togglePopup();
    });
    const incBtn = document.createElement("button");
    incBtn.type = "button";
    incBtn.className = "npe-btn npe-font-size-inc";
    incBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    incBtn.setAttribute("aria-label", "Increase font size");
    incBtn.setAttribute("title", "Increase font size");
    incBtn.addEventListener("click", () => {
      this._closePopup();
      this._adjustSize(1);
    });
    wrapper.appendChild(decBtn);
    wrapper.appendChild(input);
    wrapper.appendChild(incBtn);
    this._el = wrapper;
    this._decBtn = decBtn;
    this._input = input;
    this._dropBtn = null;
    this._incBtn = incBtn;
    this._buildPopup();
    this._docCloseHandler = (e) => {
      if (this._popupOpen && this._el && !this._el.contains(e.target)) {
        this._closePopup();
      }
    };
    document.addEventListener("mousedown", this._docCloseHandler, true);
    if (this._disabled) {
      this._applyDisabled(true);
    }
  }
  _buildPopup() {
    const popup = document.createElement("div");
    popup.className = "npe-font-size-popup";
    popup.setAttribute("role", "listbox");
    popup.style.display = "none";
    for (const size of FONT_SIZE_PRESETS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "npe-font-size-popup-item";
      btn.setAttribute("role", "option");
      btn.textContent = String(size);
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._setValue(size, true);
        this._closePopup();
        if (this._input) this._input.focus();
      });
      popup.appendChild(btn);
    }
    this._popup = popup;
  }
  _togglePopup() {
    if (this._popupOpen) {
      this._closePopup();
    } else {
      this._openPopup();
    }
  }
  _openPopup() {
    if (!this._popup || !this._el) return;
    this._popupOpen = true;
    if (!this._popup.parentNode) {
      this._el.appendChild(this._popup);
    }
    const items = this._popup.querySelectorAll(".npe-font-size-popup-item");
    items.forEach((item) => {
      item.classList.toggle("npe-active", parseInt(item.textContent, 10) === this._value);
    });
    this._popup.style.display = "block";
    if (this._input) this._input.setAttribute("aria-expanded", "true");
    const active = this._popup.querySelector(".npe-font-size-popup-item.npe-active");
    if (active) {
      active.scrollIntoView({ block: "nearest" });
    }
  }
  _closePopup() {
    if (!this._popup) return;
    this._popupOpen = false;
    this._popup.style.display = "none";
    if (this._input) this._input.setAttribute("aria-expanded", "false");
  }
  _adjustSize(delta) {
    this._setValue(this._value + delta, true);
  }
  _setValue(v, notify = false) {
    v = Math.max(MIN_SIZE, Math.min(MAX_SIZE, v));
    this._value = v;
    if (this._input) this._input.value = String(v);
    if (notify && this._onChange) this._onChange(v);
  }
  _applyDisabled(disabled) {
    for (const el of [this._decBtn, this._incBtn, this._input]) {
      if (!el) continue;
      if (disabled) {
        el.disabled = true;
        el.setAttribute("aria-disabled", "true");
      } else {
        el.disabled = false;
        el.removeAttribute("aria-disabled");
      }
    }
  }
  /** @returns {HTMLDivElement} */
  render() {
    return this._el;
  }
  /**
   * Set the displayed font size (px).
   * @param {number|string} value
   */
  setValue(value) {
    const v = parseInt(value, 10);
    if (!isNaN(v)) this._setValue(v, false);
  }
  /** @returns {number} */
  getValue() {
    return this._value;
  }
  setDisabled(disabled) {
    this._disabled = !!disabled;
    this._applyDisabled(this._disabled);
  }
  destroy() {
    this._closePopup();
    if (this._docCloseHandler) {
      document.removeEventListener("mousedown", this._docCloseHandler, true);
      this._docCloseHandler = null;
    }
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
  }
};

// src/toolbar/buttons/ColorPickerButton.js
var PRESET_COLORS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#ffffff",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#cfe2f3",
  "#d9d2e9",
  "#ead1dc",
  "#ea9999",
  "#f9cb9c",
  "#ffe599",
  "#b6d7a8",
  "#a2c4c9",
  "#9fc5e8",
  "#b4a7d6",
  "#d5a6bd",
  "#e06666",
  "#f6b26b",
  "#ffd966",
  "#93c47d",
  "#76a5af",
  "#6fa8dc",
  "#8e7cc3",
  "#c27ba0",
  "#cc0000",
  "#e69138",
  "#f1c232",
  "#6aa84f",
  "#45818e",
  "#3d85c8",
  "#674ea7",
  "#a61c00",
  "#990000",
  "#b45f06",
  "#bf9000",
  "#38761d",
  "#134f5c",
  "#1155cc",
  "#351c75",
  "#741b47"
];
var ColorPickerButton = class extends ButtonBase {
  /**
   * @param {object} opts
   * @param {string} opts.id — 'foreColor' or 'backColor'
   * @param {string} opts.label — translated label
   * @param {string} [opts.icon] — icon HTML
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onApply] — called with final color string (e.g. '#ff0000') or '' for reset
   * @param {Function} [opts.onPreview] — called with preview color string during swatch hover
   * @param {boolean} [opts.disabled]
   */
  constructor(opts = {}) {
    super(__spreadProps(__spreadValues({}, opts), {
      toggle: true,
      onClick: (e) => this._togglePanel(e)
    }));
    this._i18n = opts.i18n || { t: (k) => k };
    this._onApply = opts.onApply || null;
    this._onPreview = opts.onPreview || null;
    this._currentColor = "";
    this._pendingColor = "";
    this._panel = null;
    this._swatchIndicator = null;
    this._panelOpen = false;
    this._buildSwatch();
    this._buildPanel();
    this._bindDocumentClose();
  }
  _buildSwatch() {
    if (!this._el) return;
    const swatch = document.createElement("span");
    swatch.className = "npe-color-swatch";
    swatch.setAttribute("aria-hidden", "true");
    this._el.appendChild(swatch);
    this._swatchIndicator = swatch;
  }
  _buildPanel() {
    const panel = document.createElement("div");
    panel.className = "npe-color-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", this._label);
    panel.style.display = "none";
    const swatchesGrid = document.createElement("div");
    swatchesGrid.className = "npe-color-swatches";
    for (const color of PRESET_COLORS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "npe-color-swatch-btn";
      btn.style.backgroundColor = color;
      btn.setAttribute("title", color);
      btn.setAttribute("aria-label", color);
      btn.addEventListener("mouseenter", () => {
        this._pendingColor = color;
        if (this._onPreview) this._onPreview(color);
      });
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._pendingColor = color;
        this._commitColor(color);
      });
      swatchesGrid.appendChild(btn);
    }
    panel.appendChild(swatchesGrid);
    const pickerRow = document.createElement("div");
    pickerRow.className = "npe-color-picker-row";
    pickerRow.style.cssText = "display:flex;align-items:center;gap:6px;margin-bottom:6px;";
    const nativePicker = document.createElement("input");
    nativePicker.type = "color";
    nativePicker.className = "npe-color-native";
    nativePicker.value = this._currentColor || "#000000";
    nativePicker.style.cssText = "width:32px;height:28px;border:none;padding:0;cursor:pointer;";
    nativePicker.setAttribute("aria-label", "Color picker");
    nativePicker.addEventListener("input", () => {
      this._pendingColor = nativePicker.value;
      if (this._hexInput) this._hexInput.value = nativePicker.value;
      if (this._onPreview) this._onPreview(nativePicker.value);
    });
    const hexInput = document.createElement("input");
    hexInput.type = "text";
    hexInput.className = "npe-color-hex-input";
    hexInput.placeholder = "#000000";
    hexInput.maxLength = 7;
    hexInput.style.cssText = "flex:1;height:28px;padding:0 6px;border:1px solid var(--npe-chrome-border);border-radius:3px;font-family:monospace;font-size:12px;background:var(--npe-toolbar-bg);color:var(--npe-chrome-text);";
    hexInput.setAttribute("aria-label", this._i18n.t("color.hex"));
    hexInput.addEventListener("input", () => {
      const v = hexInput.value.trim();
      if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
        this._pendingColor = v;
        nativePicker.value = v;
        if (this._onPreview) this._onPreview(v);
      }
    });
    pickerRow.appendChild(nativePicker);
    pickerRow.appendChild(hexInput);
    panel.appendChild(pickerRow);
    this._hexInput = hexInput;
    this._nativePicker = nativePicker;
    const actionsRow = document.createElement("div");
    actionsRow.style.cssText = "display:flex;gap:4px;justify-content:flex-end;";
    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "npe-btn";
    resetBtn.textContent = this._i18n.t("color.reset");
    resetBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._commitColor("");
    });
    const applyBtn = document.createElement("button");
    applyBtn.type = "button";
    applyBtn.className = "npe-btn npe-btn-primary";
    applyBtn.style.cssText = "background:var(--npe-toolbar-btn-active-bg);color:var(--npe-toolbar-btn-active-text);";
    applyBtn.textContent = this._i18n.t("color.apply");
    applyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._commitColor(this._pendingColor);
    });
    actionsRow.appendChild(resetBtn);
    actionsRow.appendChild(applyBtn);
    panel.appendChild(actionsRow);
    this._panel = panel;
  }
  _commitColor(color) {
    this._currentColor = color;
    this._pendingColor = color;
    this._updateSwatchDisplay();
    if (this._nativePicker) this._nativePicker.value = color || "#000000";
    if (this._hexInput) this._hexInput.value = color || "";
    this._closePanel();
    if (this._onApply) this._onApply(color);
  }
  _updateSwatchDisplay() {
    if (!this._swatchIndicator) return;
    if (this._currentColor) {
      this._swatchIndicator.style.backgroundColor = this._currentColor;
      this._swatchIndicator.style.border = "none";
    } else {
      this._swatchIndicator.style.backgroundColor = "transparent";
      this._swatchIndicator.style.border = "1px solid #000";
    }
  }
  _bindDocumentClose() {
    this._docCloseHandler = (e) => {
      if (this._panelOpen && this._el && !this._el.contains(e.target) && this._panel && !this._panel.contains(e.target)) {
        this._closePanel();
      }
    };
    this._keyCloseHandler = (e) => {
      if (e.key === "Escape" && this._panelOpen) {
        this._closePanel();
        if (this._el) this._el.focus();
      }
    };
    document.addEventListener("mousedown", this._docCloseHandler, true);
    document.addEventListener("keydown", this._keyCloseHandler, true);
  }
  _togglePanel(e) {
    if (e) e.stopPropagation();
    if (this._panelOpen) {
      this._closePanel();
    } else {
      this._openPanel();
    }
  }
  _openPanel() {
    if (!this._panel || !this._el) return;
    this._panelOpen = true;
    if (!this._panel.parentNode) {
      const container = this._el.parentNode || document.body;
      container.style.position = "relative";
      container.appendChild(this._panel);
    }
    this._panel.style.display = "block";
    this.setActive(true);
    if (this._hexInput) this._hexInput.value = this._currentColor || "";
    if (this._nativePicker) this._nativePicker.value = this._currentColor || "#000000";
    this._pendingColor = this._currentColor;
  }
  _closePanel() {
    if (!this._panel) return;
    this._panelOpen = false;
    this._panel.style.display = "none";
    this.setActive(false);
  }
  /**
   * Set the current color value (updates swatch display).
   * @param {string} color — CSS color string
   */
  setColor(color) {
    this._currentColor = color || "";
    this._pendingColor = this._currentColor;
    this._updateSwatchDisplay();
    if (this._nativePicker) this._nativePicker.value = color || "#000000";
    if (this._hexInput) this._hexInput.value = color || "";
  }
  /**
   * Return the rendered button element.
   */
  render() {
    return this._el;
  }
  destroy() {
    this._closePanel();
    document.removeEventListener("mousedown", this._docCloseHandler, true);
    document.removeEventListener("keydown", this._keyCloseHandler, true);
    if (this._panel && this._panel.parentNode) {
      this._panel.parentNode.removeChild(this._panel);
    }
    this._panel = null;
    super.destroy();
  }
};

// src/toolbar/buttons/DropdownButton.js
var DropdownButton = class extends ButtonBase {
  /**
   * @param {object} opts
   * @param {string} opts.id
   * @param {string} opts.label
   * @param {string} [opts.icon]
   * @param {Array<{id: string, label: string, icon?: string, action?: Function}>} opts.items
   * @param {Function} [opts.onItemClick]
   * @param {boolean} [opts.disabled]
   * @param {boolean} [opts.hideArrow] — if true, omit the dropdown chevron
   * @param {boolean} [opts.alignRight] — if true, dropdown opens left-aligned to its right edge (avoids viewport overflow)
   */
  constructor(opts = {}) {
    super(__spreadProps(__spreadValues({}, opts), {
      toggle: true,
      onClick: (e) => this._toggleDropdown(e)
    }));
    this._items = opts.items || [];
    this._onItemClick = opts.onItemClick || null;
    this._hideArrow = opts.hideArrow || false;
    this._alignRight = opts.alignRight || false;
    if (this._hideArrow && this._el) {
      const arrow = this._el.querySelector(".npe-dropdown-arrow");
      if (arrow) arrow.remove();
    }
    this._dropdown = null;
    this._open = false;
    this._buildDropdown();
    this._bindDocumentClose();
  }
  _render() {
    super._render();
    if (this._el) {
      const arrow = document.createElement("span");
      arrow.className = "npe-dropdown-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>';
      this._el.appendChild(arrow);
      this._el.setAttribute("aria-haspopup", "true");
      this._el.setAttribute("aria-expanded", "false");
    }
  }
  _buildDropdown() {
    const menu = document.createElement("ul");
    menu.className = "npe-dropdown";
    menu.setAttribute("role", "menu");
    menu.style.display = "none";
    for (const item of this._items) {
      const li = document.createElement("li");
      li.className = "npe-dropdown-item";
      li.setAttribute("role", "menuitem");
      li.setAttribute("tabindex", "0");
      if (item.icon) {
        const iconSpan = document.createElement("span");
        iconSpan.className = "npe-dropdown-item-icon";
        iconSpan.setAttribute("aria-hidden", "true");
        if (item.icon.trim().startsWith("<")) {
          iconSpan.innerHTML = item.icon;
        } else {
          iconSpan.textContent = item.icon;
        }
        li.appendChild(iconSpan);
      }
      const labelSpan = document.createElement("span");
      labelSpan.textContent = item.label;
      li.appendChild(labelSpan);
      li.addEventListener("click", (e) => {
        e.stopPropagation();
        this._closeDropdown();
        if (item.action) item.action(e, item);
        if (this._onItemClick) this._onItemClick(item, e);
      });
      li.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          li.click();
        }
      });
      menu.appendChild(li);
    }
    this._dropdown = menu;
  }
  _bindDocumentClose() {
    this._docCloseHandler = (e) => {
      if (this._open && this._el && !this._el.contains(e.target) && this._dropdown && !this._dropdown.contains(e.target)) {
        this._closeDropdown();
      }
    };
    this._keyCloseHandler = (e) => {
      if (e.key === "Escape" && this._open) {
        this._closeDropdown();
        if (this._el) this._el.focus();
      }
    };
    document.addEventListener("mousedown", this._docCloseHandler, true);
    document.addEventListener("keydown", this._keyCloseHandler, true);
  }
  _toggleDropdown(e) {
    if (e) e.stopPropagation();
    if (this._open) {
      this._closeDropdown();
    } else {
      this._openDropdown();
    }
  }
  _openDropdown() {
    if (!this._dropdown || !this._el) return;
    this._open = true;
    if (!this._dropdown.parentNode) {
      const container = this._el.parentNode || document.body;
      container.style.position = "relative";
      container.appendChild(this._dropdown);
    }
    if (this._alignRight) {
      this._dropdown.style.left = "auto";
      this._dropdown.style.right = "0";
    } else {
      this._dropdown.style.left = "0";
      this._dropdown.style.right = "auto";
    }
    this._dropdown.style.display = "block";
    this._el.setAttribute("aria-expanded", "true");
    this.setActive(true);
  }
  _closeDropdown() {
    if (!this._dropdown) return;
    this._open = false;
    this._dropdown.style.display = "none";
    if (this._el) {
      this._el.setAttribute("aria-expanded", "false");
    }
    this.setActive(false);
  }
  /**
   * Update the items in the dropdown.
   * @param {Array} items
   */
  setItems(items) {
    this._items = items;
    if (this._dropdown) {
      this._dropdown.innerHTML = "";
      for (const item of items) {
        const li = document.createElement("li");
        li.className = "npe-dropdown-item";
        li.setAttribute("role", "menuitem");
        li.setAttribute("tabindex", "0");
        li.textContent = item.label;
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          this._closeDropdown();
          if (item.action) item.action(e, item);
          if (this._onItemClick) this._onItemClick(item, e);
        });
        this._dropdown.appendChild(li);
      }
    }
  }
  /**
   * Return the rendered button element.
   */
  render() {
    return this._el;
  }
  destroy() {
    this._closeDropdown();
    document.removeEventListener("mousedown", this._docCloseHandler, true);
    document.removeEventListener("keydown", this._keyCloseHandler, true);
    if (this._dropdown && this._dropdown.parentNode) {
      this._dropdown.parentNode.removeChild(this._dropdown);
    }
    this._dropdown = null;
    super.destroy();
  }
};

// src/toolbar/buttons/InsertDropdown.js
var INSERT_ICONS = {
  link: '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
  image: '<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
  video: '<svg viewBox="0 0 24 24"><path d="M17 10.5V6c0-1.1-.9-2-2-2H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-4.5l5 5v-13l-5 5zM9 16V8l5 4-5 4z"/></svg>',
  table: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>',
  emoji: '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
  specialChars: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="bold" fill="currentColor">\xA9</text></svg>'
};
var InsertDropdown = class extends DropdownButton {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onItemClick] — called with item id (e.g. 'link', 'image', ...)
   * @param {boolean} [opts.disabled]
   */
  constructor(opts = {}) {
    const i18n = opts.i18n || { t: (k) => k };
    const items = [
      { id: "link", label: i18n.t("insert.link"), icon: INSERT_ICONS.link },
      { id: "image", label: i18n.t("insert.image"), icon: INSERT_ICONS.image },
      { id: "video", label: i18n.t("insert.video"), icon: INSERT_ICONS.video },
      { id: "table", label: i18n.t("insert.table"), icon: INSERT_ICONS.table },
      { id: "emoji", label: i18n.t("insert.emoji"), icon: INSERT_ICONS.emoji },
      { id: "specialChars", label: i18n.t("insert.specialChars"), icon: INSERT_ICONS.specialChars }
    ];
    const onItemClick = opts.onItemClick || null;
    super({
      id: "insertDropdown",
      label: i18n.t("toolbar.insertDropdown"),
      // Icon + visible label text together — matches the old Neiki Editor "Insert ▾" button
      icon: `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg><span class="npe-btn-label">${i18n.t("toolbar.insertDropdown")}</span>`,
      disabled: opts.disabled || false,
      items: items.map((item) => __spreadProps(__spreadValues({}, item), {
        action: () => {
          if (onItemClick) onItemClick(item.id);
        }
      }))
    });
    this._i18n = i18n;
  }
};

// src/toolbar/buttons/MoreMenu.js
var MORE_ICONS = {
  save: '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
  preview: '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
  print: '<svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>',
  autosave: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>',
  clearAll: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  changeTheme: '<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>',
  fullscreen: '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  help: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>'
};
var MoreMenu = class extends DropdownButton {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {Function} [opts.onItemClick] — called with item id (e.g. 'save', 'preview', ...)
   * @param {boolean} [opts.disabled]
   */
  constructor(opts = {}) {
    const i18n = opts.i18n || { t: (k) => k };
    const items = [
      { id: "save", label: i18n.t("menu.more.save"), icon: MORE_ICONS.save },
      { id: "preview", label: i18n.t("menu.more.preview"), icon: MORE_ICONS.preview },
      { id: "download", label: i18n.t("menu.more.download"), icon: MORE_ICONS.download },
      { id: "print", label: i18n.t("menu.more.print"), icon: MORE_ICONS.print },
      { id: "autosave", label: i18n.t("menu.more.autosave"), icon: MORE_ICONS.autosave },
      { id: "clearAll", label: i18n.t("menu.more.clearAll"), icon: MORE_ICONS.clearAll },
      { id: "changeTheme", label: i18n.t("menu.more.changeTheme"), icon: MORE_ICONS.changeTheme },
      { id: "fullscreen", label: i18n.t("menu.more.fullscreen"), icon: MORE_ICONS.fullscreen },
      { id: "help", label: i18n.t("menu.more.help"), icon: MORE_ICONS.help }
    ];
    const onItemClick = opts.onItemClick || null;
    super({
      id: "moreMenu",
      label: i18n.t("toolbar.moreMenu"),
      icon: '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg>',
      disabled: opts.disabled || false,
      hideArrow: true,
      alignRight: true,
      items: items.map((item) => __spreadProps(__spreadValues({}, item), {
        action: () => {
          if (onItemClick) onItemClick(item.id);
        }
      }))
    });
    this._i18n = i18n;
    if (this._el) {
      this._el.classList.add("npe-more-menu-btn");
    }
  }
};

// src/toolbar/ToolbarBuilder.js
var ICONS = {
  undo: '<svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
  redo: '<svg viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>',
  bold: '<svg viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>',
  italic: '<svg viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>',
  underline: '<svg viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>',
  strikethrough: '<svg viewBox="0 0 24 24"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>',
  superscript: '<svg viewBox="0 0 24 24"><path d="M22 7h-2v1h3v1h-4V6.5c0-.83.67-1.5 1.5-1.5h1.5V4h-3V3h2.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.87 6H6.19l4.32 6.73L5.88 20z"/></svg>',
  subscript: '<svg viewBox="0 0 24 24"><path d="M22 18h-2v1h3v1h-4v-2.5c0-.83.67-1.5 1.5-1.5h1.5v-1h-3v-1h2.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.87 4H6.19l4.32 6.73L5.88 18z"/></svg>',
  code: '<svg viewBox="0 0 256 256"><path d="M0 0h256v256H0z" fill="none"/><path fill="currentColor" d="M71.68 97.22L34.74 128l36.94 30.78a12 12 0 1 1-15.36 18.44l-48-40a12 12 0 0 1 0-18.44l48-40a12 12 0 0 1 15.36 18.44m176 21.56l-48-40a12 12 0 1 0-15.36 18.44L221.26 128l-36.94 30.78a12 12 0 1 0 15.36 18.44l48-40a12 12 0 0 0 0-18.44M164.1 28.72a12 12 0 0 0-15.38 7.18l-64 176a12 12 0 0 0 7.18 15.37a11.8 11.8 0 0 0 4.1.73a12 12 0 0 0 11.28-7.9l64-176a12 12 0 0 0-7.18-15.38"/></svg>',
  removeFormat: '<svg viewBox="0 0 24 24"><path d="M16.24 3.56l4.95 4.94c.78.79.78 2.05 0 2.84L12 20.53a4.008 4.008 0 01-5.66 0L2.81 17c-.78-.79-.78-2.05 0-2.84l10.6-10.6c.79-.78 2.05-.78 2.83 0zm-1.41 1.42L6.93 12.9l4.24 4.24 7.9-7.9-4.24-4.26z"/></svg>',
  viewCode: '<svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
  findReplace: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
  alignLeft: '<svg viewBox="0 0 24 24"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>',
  alignCenter: '<svg viewBox="0 0 24 24"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>',
  alignRight: '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>',
  alignJustify: '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/></svg>',
  indent: '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>',
  outdent: '<svg viewBox="0 0 24 24"><path d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>',
  bulletList: '<svg viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>',
  numberedList: '<svg viewBox="0 0 24 24"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>',
  blockquote: '<svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>',
  horizontalRule: '<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>',
  // color picker icons
  foreColor: '<svg viewBox="0 0 24 24"><path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z"/><rect x="3" y="19" width="18" height="3" fill="currentColor"/></svg>',
  backColor: '<svg viewBox="0 0 24 24"><path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/><rect x="0" y="20" width="24" height="4"/></svg>',
  // insert/more menu icons
  link: '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
  image: '<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
  video: '<svg viewBox="0 0 24 24"><path d="M17 10.5V6c0-1.1-.9-2-2-2H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-4.5l5 5v-13l-5 5zM9 16V8l5 4-5 4z"/></svg>',
  table: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/></svg>',
  emoji: '<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>',
  specialChars: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="bold" fill="currentColor">\xA9</text></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
  preview: '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
  download: '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
  print: '<svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>',
  autosave: '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
  clearAll: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
  changeTheme: '<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>',
  fullscreen: '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  help: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
  more: '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg>'
};
var SIMPLE_BUTTONS = {
  viewCode: { iconKey: "viewCode", toggle: true },
  undo: { iconKey: "undo", toggle: false },
  redo: { iconKey: "redo", toggle: false },
  findReplace: { iconKey: "findReplace", toggle: false },
  bold: { iconKey: "bold", toggle: true },
  italic: { iconKey: "italic", toggle: true },
  underline: { iconKey: "underline", toggle: true },
  strikethrough: { iconKey: "strikethrough", toggle: true },
  superscript: { iconKey: "superscript", toggle: true },
  subscript: { iconKey: "subscript", toggle: true },
  code: { iconKey: "code", toggle: true },
  removeFormat: { iconKey: "removeFormat", toggle: false },
  alignLeft: { iconKey: "alignLeft", toggle: true },
  alignCenter: { iconKey: "alignCenter", toggle: true },
  alignRight: { iconKey: "alignRight", toggle: true },
  alignJustify: { iconKey: "alignJustify", toggle: true },
  indent: { iconKey: "indent", toggle: false },
  outdent: { iconKey: "outdent", toggle: false },
  bulletList: { iconKey: "bulletList", toggle: true },
  numberedList: { iconKey: "numberedList", toggle: true },
  blockquote: { iconKey: "blockquote", toggle: true },
  horizontalRule: { iconKey: "horizontalRule", toggle: false }
};
var _pluginButtons = /* @__PURE__ */ new Map();
var ToolbarBuilder = class {
  /**
   * @param {HTMLElement} container — the .npe-toolbar element
   * @param {import('../core/Options').EditorOptions} opts
   * @param {import('../core/EventBus').EventBus} bus
   * @param {import('../i18n/i18n').I18nInstance} i18n
   */
  constructor(container, opts, bus, i18n) {
    this._container = container;
    this._opts = opts;
    this._bus = bus;
    this._i18n = i18n;
    this._controls = [];
    this._groups = [];
    this.build();
  }
  /**
   * Build the toolbar DOM from the toolbar config.
   */
  build() {
    const toolbar = this._opts.toolbar || [];
    const groups = this._groupItems(toolbar);
    for (const group of groups) {
      const groupEl = document.createElement("div");
      groupEl.className = "npe-toolbar-group";
      for (const id of group) {
        const control = this._buildControl(id);
        if (control) {
          groupEl.appendChild(control.el);
          this._controls.push(control);
          if (control.isMoreMenu) {
            groupEl.classList.add("npe-more-menu-group");
          }
        }
      }
      this._container.appendChild(groupEl);
      this._groups.push(groupEl);
    }
    const allChildren = Array.from(this._container.children);
    for (let i = 0; i < allChildren.length - 1; i++) {
      const sep = document.createElement("span");
      sep.className = "npe-toolbar-sep";
      sep.setAttribute("aria-hidden", "true");
      this._container.insertBefore(sep, allChildren[i + 1]);
    }
  }
  /**
   * Split toolbar array by '|' into groups.
   * @param {string[]} toolbar
   * @returns {string[][]}
   */
  _groupItems(toolbar) {
    const groups = [];
    let current = [];
    for (const item of toolbar) {
      if (item === "|") {
        if (current.length > 0) {
          groups.push(current);
          current = [];
        }
      } else {
        current.push(item);
      }
    }
    if (current.length > 0) {
      groups.push(current);
    }
    return groups;
  }
  /**
   * Build a single toolbar control.
   * @param {string} id
   * @returns {ToolbarControl|null}
   */
  _buildControl(id) {
    const t = this._i18n.t.bind(this._i18n);
    const bus = this._bus;
    if (id in SIMPLE_BUTTONS) {
      const def = SIMPLE_BUTTONS[id];
      const icon = ICONS[def.iconKey] || "";
      const btn = new ButtonBase({
        id,
        label: t(`toolbar.${id}`),
        icon,
        toggle: def.toggle,
        onClick: () => bus.emit("toolbar:command", id)
      });
      return { id, el: btn.render(), instance: btn };
    }
    if (id === "heading") {
      const control = new HeadingSelect({
        i18n: this._i18n,
        onChange: (value) => bus.emit("toolbar:command", "heading", value)
      });
      return { id, el: control.render(), instance: control };
    }
    if (id === "fontFamily") {
      const control = new FontFamilySelect({
        i18n: this._i18n,
        onChange: (value) => bus.emit("toolbar:command", "fontFamily", value)
      });
      return { id, el: control.render(), instance: control };
    }
    if (id === "fontSize") {
      const control = new FontSizeWidget({
        i18n: this._i18n,
        onChange: (value) => bus.emit("toolbar:command", "fontSize", value)
      });
      return { id, el: control.render(), instance: control };
    }
    if (id === "foreColor") {
      const control = new ColorPickerButton({
        id,
        label: t("toolbar.foreColor"),
        icon: ICONS.foreColor,
        i18n: this._i18n,
        onApply: (color) => bus.emit("toolbar:command", "foreColor", color),
        onPreview: (color) => bus.emit("toolbar:colorPreview", "foreColor", color)
      });
      return { id, el: control.render(), instance: control };
    }
    if (id === "backColor") {
      const control = new ColorPickerButton({
        id,
        label: t("toolbar.backColor"),
        icon: ICONS.backColor,
        i18n: this._i18n,
        onApply: (color) => bus.emit("toolbar:command", "backColor", color),
        onPreview: (color) => bus.emit("toolbar:colorPreview", "backColor", color)
      });
      return { id, el: control.render(), instance: control };
    }
    if (id === "insertDropdown") {
      const control = new InsertDropdown({
        i18n: this._i18n,
        onItemClick: (itemId) => bus.emit("toolbar:insert", itemId)
      });
      return { id, el: control.render(), instance: control };
    }
    if (id === "moreMenu") {
      const control = new MoreMenu({
        i18n: this._i18n,
        onItemClick: (itemId) => bus.emit("toolbar:more", itemId)
      });
      return { id, el: control.render(), instance: control, isMoreMenu: true };
    }
    if (_pluginButtons.has(id)) {
      const pluginDef = _pluginButtons.get(id);
      const btn = new ButtonBase({
        id,
        label: pluginDef.label || id,
        icon: pluginDef.icon || "",
        toggle: pluginDef.toggle || false,
        onClick: () => {
          if (pluginDef.action) pluginDef.action();
          bus.emit("toolbar:command", id);
        }
      });
      return { id, el: btn.render(), instance: btn };
    }
    return null;
  }
  /**
   * Register a plugin button type so it can be referenced in the toolbar array.
   * @param {object} def
   * @param {string} def.id
   * @param {string} def.label
   * @param {string} [def.icon]
   * @param {boolean} [def.toggle]
   * @param {Function} [def.action]
   */
  static registerPluginButton(def) {
    if (def && typeof def.id === "string") {
      _pluginButtons.set(def.id, def);
    }
  }
  /**
   * Get a control instance by id.
   * @param {string} id
   * @returns {ToolbarControl|undefined}
   */
  getControl(id) {
    return this._controls.find((c) => c.id === id);
  }
  /**
   * Get all control instances.
   * @returns {ToolbarControl[]}
   */
  getControls() {
    return this._controls;
  }
  /**
   * Destroy the toolbar — remove all elements and controls.
   */
  destroy() {
    for (const control of this._controls) {
      if (control.instance && typeof control.instance.destroy === "function") {
        control.instance.destroy();
      }
    }
    this._controls = [];
    while (this._container.firstChild) {
      this._container.removeChild(this._container.firstChild);
    }
    this._groups = [];
  }
};

// src/toolbar/ToolbarState.js
var COMMAND_STATE_MAP = {
  bold: "bold",
  italic: "italic",
  underline: "underline",
  strikethrough: "strikeThrough",
  superscript: "superscript",
  subscript: "subscript",
  bulletList: "insertUnorderedList",
  numberedList: "insertOrderedList",
  blockquote: null
  // DOM inspection only
};
var ALIGNMENT_STATE_MAP = {
  alignLeft: "justifyLeft",
  alignCenter: "justifyCenter",
  alignRight: "justifyRight",
  alignJustify: "justifyFull"
};
var ToolbarState = class {
  /**
   * @param {import('./ToolbarBuilder').ToolbarBuilder} toolbarBuilder
   * @param {import('../canvas/CanvasManager').CanvasManager|null} canvasManager
   * @param {import('../core/EventBus').EventBus} bus
   */
  constructor(toolbarBuilder, canvasManager, bus) {
    this._toolbar = toolbarBuilder;
    this._canvas = canvasManager;
    this._bus = bus;
    this._destroyed = false;
    this._bindEvents();
  }
  _bindEvents() {
    this._offSelectionChange = this._bus.on("selection:change", () => this.update());
    this._offContentChange = this._bus.on("content:change", () => this.update());
    this._offCanvasFocus = this._bus.on("canvas:focus", () => this.update());
    this._offCommand = this._bus.on("toolbar:command", () => setTimeout(() => this.update(), 20));
  }
  /**
   * Read the current iframe selection and update all toolbar control states.
   * queryCommandState works correctly when the iframe has focus; we also
   * fall back to DOM inspection so values stay correct after focus moves away.
   */
  update() {
    if (this._destroyed || !this._toolbar) return;
    const doc = this._getIframeDocument();
    for (const [id, cmd] of Object.entries(COMMAND_STATE_MAP)) {
      if (!cmd) continue;
      const control = this._toolbar.getControl(id);
      if (!(control == null ? void 0 : control.instance)) continue;
      let active = false;
      try {
        if (doc) active = doc.queryCommandState(cmd);
      } catch (e) {
      }
      if (typeof control.instance.setActive === "function") {
        control.instance.setActive(active);
      }
    }
    this._updateBlockquoteState(doc);
    this._updateHeadingState(doc);
    this._updateAlignmentState(doc);
    this._updateUndoRedoState(doc);
    this._bus.emit("toolbar:stateUpdated");
  }
  // ─── Private helpers ──────────────────────────────────────────────────────────
  _getIframeDocument() {
    if (!this._canvas) return null;
    try {
      const iframe = this._canvas.getIframe ? this._canvas.getIframe() : null;
      if (!iframe) return null;
      return iframe.contentDocument || null;
    } catch (e) {
      return null;
    }
  }
  /**
   * Return the element that is the common ancestor of the current selection,
   * walking up past text nodes.
   * @param {Document|null} doc
   * @returns {Element|null}
   */
  _getAncestorElement(doc) {
    if (!doc) return null;
    try {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) return null;
      let node = sel.getRangeAt(0).commonAncestorContainer;
      while (node && node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
      }
      return (
        /** @type {Element|null} */
        node
      );
    } catch (e) {
      return null;
    }
  }
  _updateBlockquoteState(doc) {
    const control = this._toolbar.getControl("blockquote");
    if (!(control == null ? void 0 : control.instance)) return;
    const el = this._getAncestorElement(doc);
    const active = el ? !!el.closest("blockquote") : false;
    if (typeof control.instance.setActive === "function") {
      control.instance.setActive(active);
    }
  }
  _updateHeadingState(doc) {
    const control = this._toolbar.getControl("heading");
    if (!(control == null ? void 0 : control.instance)) return;
    let value = "p";
    const el = this._getAncestorElement(doc);
    if (el) {
      const block = el.closest("h1,h2,h3,h4,h5,h6,p,div");
      if (block) {
        const tag = block.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tag)) value = tag;
      }
    }
    if (typeof control.instance.setValue === "function") {
      control.instance.setValue(value);
    }
  }
  _updateAlignmentState(doc) {
    for (const [id, cmd] of Object.entries(ALIGNMENT_STATE_MAP)) {
      const control = this._toolbar.getControl(id);
      if (!(control == null ? void 0 : control.instance)) continue;
      let active = false;
      try {
        if (doc) active = doc.queryCommandState(cmd);
      } catch (e) {
        const el = this._getAncestorElement(doc);
        if (el) {
          const block = el.closest("p,h1,h2,h3,h4,h5,h6,div,li,td,th");
          if (block) {
            const alignVal = { alignLeft: "left", alignCenter: "center", alignRight: "right", alignJustify: "justify" };
            const align = block.style.textAlign || block.getAttribute("align") || "";
            active = align.toLowerCase() === (alignVal[id] || "");
          }
        }
      }
      if (typeof control.instance.setActive === "function") {
        control.instance.setActive(active);
      }
    }
  }
  _updateUndoRedoState(doc) {
    for (const id of ["undo", "redo"]) {
      const control = this._toolbar.getControl(id);
      if (!(control == null ? void 0 : control.instance)) continue;
      let enabled = false;
      try {
        if (doc) enabled = doc.queryCommandEnabled(id === "undo" ? "undo" : "redo");
      } catch (e) {
      }
      if (typeof control.instance.setDisabled === "function") {
        control.instance.setDisabled(!enabled);
      }
    }
  }
  destroy() {
    this._destroyed = true;
    if (this._offSelectionChange) this._offSelectionChange();
    if (this._offContentChange) this._offContentChange();
    if (this._offCanvasFocus) this._offCanvasFocus();
    if (this._offCommand) this._offCommand();
  }
};

// src/commands/CommandRegistry.js
var INLINE_COMMANDS = /* @__PURE__ */ new Set([
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "superscript",
  "subscript",
  "code",
  "foreColor",
  "backColor"
]);
var EXEC_MAP = {
  bold: "bold",
  italic: "italic",
  underline: "underline",
  strikethrough: "strikeThrough",
  superscript: "superscript",
  subscript: "subscript",
  removeFormat: "removeFormat",
  alignLeft: "justifyLeft",
  alignCenter: "justifyCenter",
  alignRight: "justifyRight",
  alignJustify: "justifyFull",
  indent: "indent",
  outdent: "outdent",
  bulletList: "insertUnorderedList",
  numberedList: "insertOrderedList",
  horizontalRule: "insertHorizontalRule",
  undo: "undo",
  redo: "redo"
};
var CommandRegistry = class {
  /**
   * @param {import('../canvas/CanvasManager').CanvasManager|null} canvasManager
   * @param {import('../core/EventBus').EventBus|null} bus
   * @param {import('../canvas/StyleManager').StyleManager|null} [styleManager]
   * @param {import('../canvas/Sanitizer').Sanitizer|null} [sanitizer]
   */
  constructor(canvasManager, bus, styleManager, sanitizer) {
    this._canvas = canvasManager || null;
    this._bus = bus || null;
    this._styleManager = styleManager || null;
    this._sanitizer = sanitizer || null;
    this._commands = /* @__PURE__ */ new Map();
    this._destroyed = false;
    this._registerBuiltins();
  }
  // ─── Registration ────────────────────────────────────────────────────────────
  /**
   * Register or override a command handler.
   * @param {string} id
   * @param {Function} handler
   */
  register(id, handler) {
    this._commands.set(id, handler);
  }
  /**
   * Execute a registered command.
   * @param {string} id
   * @param {...unknown} args
   */
  execute(id, ...args) {
    if (this._destroyed) return;
    const handler = this._commands.get(id);
    if (handler) handler(...args);
  }
  // ─── Built-in command registration ───────────────────────────────────────────
  _registerBuiltins() {
    for (const [id, cmd] of Object.entries(EXEC_MAP)) {
      this._commands.set(id, () => {
        if (INLINE_COMMANDS.has(id)) this._expandWordAtCursor();
        this._exec(cmd);
      });
    }
    this._commands.set("code", () => {
      this._expandWordAtCursor();
      this._wrapOrUnwrapInline("code");
    });
    this._commands.set("heading", (value) => {
      const doc = this._getDoc();
      if (!doc) return;
      const tag = value === "p" ? "p" : value;
      try {
        doc.execCommand("formatBlock", false, `<${tag}>`);
      } catch (e) {
      }
    });
    this._commands.set("fontFamily", (value) => {
      this._expandWordAtCursor();
      const fontFamilyMap = {
        sansSerif: "Arial, sans-serif",
        serif: "Georgia, serif",
        monospace: "Courier New, monospace",
        cursive: "Comic Sans MS, cursive"
      };
      const css = fontFamilyMap[value] || value;
      this._exec("fontName", css);
    });
    this._commands.set("fontSize", (value) => {
      this._expandWordAtCursor();
      const doc = this._getDoc();
      if (!doc) return;
      const px = parseInt(value, 10);
      if (!px || px <= 0) return;
      this._applyStyleToSelection(doc, "font-size", `${px}px`);
    });
    this._commands.set("foreColor", (color) => {
      this._expandWordAtCursor();
      if (color) {
        this._exec("foreColor", color);
      } else {
        this._exec("removeFormat");
      }
    });
    this._commands.set("backColor", (color) => {
      this._expandWordAtCursor();
      if (color) {
        this._exec("hiliteColor", color);
      } else {
        this._exec("removeFormat");
      }
    });
    this._commands.set("blockquote", () => {
      const doc = this._getDoc();
      if (!doc) return;
      try {
        const sel = doc.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const anchorNode = sel.anchorNode;
        const inBq = anchorNode ? !!(anchorNode.nodeType === 3 ? anchorNode.parentElement && anchorNode.parentElement.closest("blockquote") : anchorNode.closest && anchorNode.closest("blockquote")) : false;
        doc.execCommand("formatBlock", false, inBq ? "p" : "blockquote");
      } catch (e) {
      }
    });
    this._commands.set("horizontalRule", () => {
      this._exec("insertHorizontalRule");
    });
    this._commands.set("undo", () => this._exec("undo"));
    this._commands.set("redo", () => this._exec("redo"));
  }
  // ─── Word-at-cursor auto-expand ───────────────────────────────────────────
  /**
   * If the current selection is collapsed (cursor, no text selected),
   * expand it to cover the word at the cursor position.
   * Does nothing if text is already selected.
   */
  _expandWordAtCursor() {
    const doc = this._getDoc();
    if (!doc) return;
    try {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      if (!sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      if (!node || node.nodeType !== 3) return;
      const text = node.textContent || "";
      const offset = range.startOffset;
      const before = text.slice(0, offset);
      const after = text.slice(offset);
      const wordBefore = before.match(/\S+$/) || [""];
      const wordAfter = after.match(/^\S+/) || [""];
      const start = offset - wordBefore[0].length;
      const end = offset + wordAfter[0].length;
      if (start === end) return;
      const newRange = doc.createRange();
      newRange.setStart(node, start);
      newRange.setEnd(node, end);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch (e) {
    }
  }
  // ─── Inline style application ─────────────────────────────────────────────
  /**
   * Apply a CSS property to the current selection by wrapping in a <span>.
   * Falls back to execCommand for simpler properties.
   * @param {Document} doc
   * @param {string} prop  — CSS property name (e.g. 'font-size')
   * @param {string} value — CSS value (e.g. '16px')
   */
  _applyStyleToSelection(doc, prop, value) {
    try {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (range.collapsed) return;
      const span = doc.createElement("span");
      span.style[prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
      range.surroundContents(span);
      const newRange = doc.createRange();
      newRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch (e) {
      try {
        doc.execCommand("fontSize", false, "7");
        const fontEls = doc.querySelectorAll('font[size="7"]');
        for (const el of Array.from(fontEls)) {
          el.removeAttribute("size");
          el.style[prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
        }
      } catch (e2) {
      }
    }
  }
  // ─── Inline wrap/unwrap ───────────────────────────────────────────────────
  /**
   * Toggle an inline wrapper element (e.g. <code>) on the selection.
   * @param {string} tag
   */
  _wrapOrUnwrapInline(tag) {
    const doc = this._getDoc();
    if (!doc) return;
    try {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const ancestor = range.commonAncestorContainer;
      const parentTag = ancestor.nodeType === 3 ? ancestor.parentElement && ancestor.parentElement.tagName.toLowerCase() : ancestor.tagName && ancestor.tagName.toLowerCase();
      if (parentTag === tag) {
        const parent = ancestor.nodeType === 3 ? ancestor.parentElement : ancestor;
        if (parent && parent.tagName.toLowerCase() === tag) {
          const frag = doc.createDocumentFragment();
          while (parent.firstChild) {
            frag.appendChild(parent.firstChild);
          }
          parent.parentNode.replaceChild(frag, parent);
        }
      } else {
        if (!range.collapsed) {
          const el = doc.createElement(tag);
          range.surroundContents(el);
          const newRange = doc.createRange();
          newRange.selectNodeContents(el);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      }
    } catch (e) {
    }
  }
  // ─── execCommand helper ───────────────────────────────────────────────────
  /**
   * Execute a document.execCommand on the iframe document.
   * Guards against null doc and execCommand failures.
   * @param {string} cmd
   * @param {string|null} [value]
   */
  _exec(cmd, value) {
    const doc = this._getDoc();
    if (!doc) return;
    try {
      doc.execCommand(cmd, false, value || null);
    } catch (e) {
    }
  }
  /** @returns {Document|null} */
  _getDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch (e) {
      return null;
    }
  }
  destroy() {
    this._destroyed = true;
    this._commands.clear();
  }
};

// src/modals/modals/LinkModal.js
var LinkModal = class {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   * @param {Function} opts.onClose  — called when the modal should close
   * @param {Function} opts.onInsert — called with HTML string to insert
   */
  constructor(opts = {}) {
    this._i18n = opts.i18n || { t: (k) => k };
    this._hostEl = opts.hostEl || document.body;
    this._onClose = opts.onClose || (() => {
    });
    this._onInsert = opts.onInsert || (() => {
    });
    this._backdrop = null;
    this._modal = null;
    this._onKeyDown = null;
    this._destroyed = false;
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  /**
   * @param {object} [data]
   * @param {string} [data.href]  — pre-populate URL (for editing existing link)
   * @param {string} [data.text]  — pre-populate display text
   * @param {boolean} [data.newTab]
   */
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
    const backdrop = document.createElement("div");
    backdrop.className = "npe-modal-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) this._onClose();
    });
    const modal = document.createElement("div");
    modal.className = "npe-modal npe-link-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "npe-link-title");
    modal.addEventListener("click", (e) => e.stopPropagation());
    const header = document.createElement("div");
    header.className = "npe-modal-header";
    const title = document.createElement("h2");
    title.id = "npe-link-title";
    title.className = "npe-modal-title";
    title.textContent = t("modal.link.title");
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "npe-modal-close";
    closeBtn.setAttribute("aria-label", t("modal.common.close"));
    closeBtn.textContent = "\xD7";
    closeBtn.addEventListener("click", () => this._onClose());
    header.appendChild(title);
    header.appendChild(closeBtn);
    const body = document.createElement("div");
    body.className = "npe-modal-body";
    const urlLabel = document.createElement("label");
    urlLabel.className = "npe-form-label";
    urlLabel.setAttribute("for", "npe-link-url");
    urlLabel.textContent = t("modal.link.url");
    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.id = "npe-link-url";
    urlInput.className = "npe-form-input";
    urlInput.value = data.href || "";
    urlInput.setAttribute("placeholder", "https://");
    urlInput.setAttribute("autocomplete", "off");
    const textLabel = document.createElement("label");
    textLabel.className = "npe-form-label";
    textLabel.setAttribute("for", "npe-link-text");
    textLabel.textContent = t("modal.link.text");
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.id = "npe-link-text";
    textInput.className = "npe-form-input";
    textInput.value = data.text || "";
    textInput.setAttribute("autocomplete", "off");
    const { check: newTabCheck, label: newTabLabel } = _makeCheckbox(
      "npe-link-newtab",
      t("modal.link.newTab")
    );
    newTabCheck.checked = data.newTab === true;
    body.appendChild(urlLabel);
    body.appendChild(urlInput);
    body.appendChild(textLabel);
    body.appendChild(textInput);
    body.appendChild(newTabLabel);
    const footer = document.createElement("div");
    footer.className = "npe-modal-footer";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "npe-btn";
    cancelBtn.textContent = t("modal.common.cancel");
    cancelBtn.addEventListener("click", () => this._onClose());
    const insertBtn = document.createElement("button");
    insertBtn.type = "button";
    insertBtn.className = "npe-btn npe-btn-primary";
    insertBtn.textContent = t("modal.common.insert");
    insertBtn.addEventListener("click", () => {
      const href = urlInput.value.trim();
      if (!href) {
        urlInput.focus();
        return;
      }
      const displayText = textInput.value.trim() || href;
      const target = newTabCheck.checked ? ' target="_blank" rel="noopener noreferrer"' : "";
      const html = `<a href="${_escapeAttr(href)}"${target}>${_escapeHtml(displayText)}</a>`;
      this._onInsert(html);
      this._onClose();
    });
    footer.appendChild(cancelBtn);
    footer.appendChild(insertBtn);
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    this._urlInput = urlInput;
    this._backdrop = backdrop;
    this._modal = modal;
  }
  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._urlInput) this._urlInput.focus();
    this._onKeyDown = (e) => _handleModalKey(e, this._modal, () => this._onClose());
    document.addEventListener("keydown", this._onKeyDown);
  }
  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop = null;
    this._modal = null;
    this._urlInput = null;
  }
};
function _handleModalKey(e, modal, closeFn) {
  if (e.key === "Escape") {
    closeFn();
    return;
  }
  if (e.key === "Tab" && modal) {
    const focusable = Array.from(
      modal.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.disabled && el.getAttribute("tabindex") !== "-1");
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}
function _makeCheckbox(id, labelText) {
  const check = document.createElement("input");
  check.type = "checkbox";
  check.id = id;
  check.className = "npe-form-checkbox";
  const label = document.createElement("label");
  label.setAttribute("for", id);
  label.className = "npe-form-check-label";
  label.appendChild(check);
  label.appendChild(document.createTextNode(" " + labelText));
  return { check, label };
}
function _escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function _escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// src/modals/modals/ImageModal.js
var ALLOWED_IMAGE_MIME = /* @__PURE__ */ new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif"
]);
var IMAGE_ICON_SVG = `<svg viewBox="0 0 24 24" fill="currentColor">
  <rect x="2" y="4" width="20" height="16" rx="2" fill="#1a73e8"/>
  <path d="M2 16l5-5 3.5 3.5 4-5 7.5 9.5H2v-3z" fill="white" opacity="0.9"/>
  <circle cx="8" cy="9" r="2" fill="white" opacity="0.9"/>
</svg>`;
var ImageModal = class {
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
    this._i18n = opts.i18n || { t: (k) => k };
    this._hostEl = opts.hostEl || document.body;
    this._onClose = opts.onClose || (() => {
    });
    this._onInsert = opts.onInsert || (() => {
    });
    this._uploadHandler = opts.imageUploadHandler || null;
    this._allowDataUris = opts.allowDataUris === true;
    this._backdrop = null;
    this._modal = null;
    this._onKeyDown = null;
    this._destroyed = false;
    this._pendingFiles = [];
    this._uploadDragCount = 0;
    this._urlInput = null;
    this._altInput = null;
    this._widthInput = null;
    this._fileInput = null;
    this._uploadZone = null;
    this._uploadFiles = null;
    this._insertBtn = null;
    this._errorEl = null;
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  open(data = {}) {
    if (this._modal) return;
    this._pendingFiles = [];
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
    const hasUploadHandler = typeof this._uploadHandler === "function";
    const uploadHint = hasUploadHandler ? t("modal.image.uploadHintHandler") : t("modal.image.uploadHintBase64");
    const backdrop = document.createElement("div");
    backdrop.className = "npe-modal-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) this._onClose();
    });
    const modal = document.createElement("div");
    modal.className = "npe-modal npe-image-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "npe-image-title");
    modal.addEventListener("click", (e) => e.stopPropagation());
    const header = document.createElement("div");
    header.className = "npe-modal-header";
    const title = document.createElement("h2");
    title.id = "npe-image-title";
    title.className = "npe-modal-title";
    title.textContent = t("modal.image.title");
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "npe-modal-close";
    closeBtn.setAttribute("aria-label", t("modal.common.close"));
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", () => this._onClose());
    header.appendChild(title);
    header.appendChild(closeBtn);
    const body = document.createElement("div");
    body.className = "npe-modal-body";
    const uploadGroup = document.createElement("div");
    uploadGroup.className = "npe-form-group";
    const uploadLabel = document.createElement("label");
    uploadLabel.className = "npe-form-label";
    uploadLabel.textContent = t("modal.image.uploadLabel");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.className = "npe-file-input";
    fileInput.accept = Array.from(ALLOWED_IMAGE_MIME).join(",");
    fileInput.multiple = true;
    fileInput.setAttribute("aria-label", t("modal.image.uploadLabel"));
    fileInput.addEventListener("change", () => this._handleSelectedFiles(fileInput.files));
    this._fileInput = fileInput;
    const uploadZone = document.createElement("div");
    uploadZone.className = "npe-image-upload-zone";
    uploadZone.setAttribute("role", "button");
    uploadZone.setAttribute("tabindex", "0");
    this._uploadZone = uploadZone;
    const uploadIcon = document.createElement("div");
    uploadIcon.className = "npe-image-upload-icon";
    uploadIcon.setAttribute("aria-hidden", "true");
    uploadIcon.innerHTML = IMAGE_ICON_SVG;
    const uploadTitle = document.createElement("div");
    uploadTitle.className = "npe-image-upload-title";
    uploadTitle.textContent = t("modal.image.uploadLabel");
    const uploadHintEl = document.createElement("div");
    uploadHintEl.className = "npe-image-upload-hint";
    uploadHintEl.textContent = uploadHint;
    const uploadFilesEl = document.createElement("div");
    uploadFilesEl.className = "npe-image-upload-files";
    uploadFilesEl.setAttribute("aria-live", "polite");
    this._uploadFiles = uploadFilesEl;
    uploadZone.appendChild(uploadIcon);
    uploadZone.appendChild(uploadTitle);
    uploadZone.appendChild(uploadHintEl);
    uploadZone.appendChild(uploadFilesEl);
    uploadZone.addEventListener("click", (e) => {
      if (e.target !== fileInput) fileInput.click();
    });
    uploadZone.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });
    uploadZone.addEventListener("dragenter", (e) => {
      e.preventDefault();
      this._uploadDragCount++;
      uploadZone.classList.add("drag-over");
    });
    uploadZone.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    uploadZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      this._uploadDragCount--;
      if (this._uploadDragCount <= 0) {
        this._uploadDragCount = 0;
        uploadZone.classList.remove("drag-over");
      }
    });
    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      this._uploadDragCount = 0;
      uploadZone.classList.remove("drag-over");
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this._handleSelectedFiles(e.dataTransfer.files);
      }
    });
    uploadGroup.appendChild(uploadLabel);
    uploadGroup.appendChild(fileInput);
    uploadGroup.appendChild(uploadZone);
    const divider = document.createElement("div");
    divider.className = "npe-form-divider";
    const dividerSpan = document.createElement("span");
    dividerSpan.textContent = t("modal.image.or");
    divider.appendChild(dividerSpan);
    const urlGroup = document.createElement("div");
    urlGroup.className = "npe-form-group";
    const urlLabel = document.createElement("label");
    urlLabel.className = "npe-form-label";
    urlLabel.setAttribute("for", "npe-image-url");
    urlLabel.textContent = t("modal.image.url");
    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.id = "npe-image-url";
    urlInput.className = "npe-form-input";
    urlInput.value = data.src || "";
    urlInput.setAttribute("placeholder", "https://example.com/image.jpg");
    urlInput.setAttribute("autocomplete", "off");
    urlInput.addEventListener("input", () => {
      if (!urlInput.value) {
        this._pendingFiles = [];
        this._updateUploadFeedback([]);
        urlInput.disabled = false;
        if (fileInput) fileInput.value = "";
      }
    });
    this._urlInput = urlInput;
    urlGroup.appendChild(urlLabel);
    urlGroup.appendChild(urlInput);
    const altGroup = document.createElement("div");
    altGroup.className = "npe-form-group";
    const altLabel = document.createElement("label");
    altLabel.className = "npe-form-label";
    altLabel.setAttribute("for", "npe-image-alt");
    altLabel.textContent = t("modal.image.alt");
    const altInput = document.createElement("input");
    altInput.type = "text";
    altInput.id = "npe-image-alt";
    altInput.className = "npe-form-input";
    altInput.value = data.alt || "";
    altInput.setAttribute("placeholder", t("modal.image.altPlaceholder"));
    altInput.setAttribute("autocomplete", "off");
    this._altInput = altInput;
    altGroup.appendChild(altLabel);
    altGroup.appendChild(altInput);
    const widthGroup = document.createElement("div");
    widthGroup.className = "npe-form-group";
    const widthLabel = document.createElement("label");
    widthLabel.className = "npe-form-label";
    widthLabel.setAttribute("for", "npe-image-width");
    widthLabel.textContent = t("modal.image.width");
    const widthInput = document.createElement("input");
    widthInput.type = "text";
    widthInput.id = "npe-image-width";
    widthInput.className = "npe-form-input";
    widthInput.value = data.width || "";
    widthInput.setAttribute("placeholder", t("modal.image.widthPlaceholder"));
    widthInput.setAttribute("autocomplete", "off");
    this._widthInput = widthInput;
    widthGroup.appendChild(widthLabel);
    widthGroup.appendChild(widthInput);
    const errorEl = document.createElement("div");
    errorEl.className = "npe-upload-error";
    errorEl.setAttribute("hidden", "");
    this._errorEl = errorEl;
    body.appendChild(uploadGroup);
    body.appendChild(divider);
    body.appendChild(urlGroup);
    body.appendChild(altGroup);
    body.appendChild(widthGroup);
    body.appendChild(errorEl);
    const footer = document.createElement("div");
    footer.className = "npe-modal-footer";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "npe-btn";
    cancelBtn.textContent = t("modal.common.cancel");
    cancelBtn.addEventListener("click", () => this._onClose());
    const insertBtn = document.createElement("button");
    insertBtn.type = "button";
    insertBtn.className = "npe-btn npe-btn-primary";
    insertBtn.textContent = t("modal.common.insert");
    insertBtn.addEventListener("click", () => this._handleInsert());
    this._insertBtn = insertBtn;
    footer.appendChild(cancelBtn);
    footer.appendChild(insertBtn);
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    this._backdrop = backdrop;
    this._modal = modal;
  }
  // ─── File selection ───────────────────────────────────────────────────────────
  /**
   * Called when files are selected via input or drag-drop into the zone.
   * @param {FileList|File[]} fileList
   */
  _handleSelectedFiles(fileList) {
    const selected = Array.from(fileList || []);
    const valid = selected.filter((f) => ALLOWED_IMAGE_MIME.has(f.type));
    const invalid = selected.filter((f) => !ALLOWED_IMAGE_MIME.has(f.type));
    if (invalid.length > 0) {
      this._showError(this._i18n.t("modal.image.invalidFile"));
    } else {
      this._showError("");
    }
    if (valid.length === 0) {
      this._pendingFiles = [];
      this._updateUploadFeedback([]);
      if (this._urlInput) this._urlInput.disabled = false;
      return;
    }
    this._pendingFiles = valid;
    this._updateUploadFeedback(valid);
    const hasUploadHandler = typeof this._uploadHandler === "function";
    if (valid.length === 1 && !hasUploadHandler) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (this._urlInput) {
          this._urlInput.value = /** @type {string} */
          ev.target.result;
          this._urlInput.disabled = true;
        }
      };
      reader.readAsDataURL(valid[0]);
    } else {
      if (this._urlInput) {
        this._urlInput.value = "";
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
    if (zone) zone.classList.toggle("has-files", files.length > 0);
    if (filesEl) filesEl.textContent = files.map((f) => f.name).join(", ");
  }
  // ─── Insert ───────────────────────────────────────────────────────────────────
  async _handleInsert() {
    const t = this._i18n.t.bind(this._i18n);
    const alt = this._altInput ? this._altInput.value.trim() : "";
    const width = this._widthInput ? this._widthInput.value.trim() : "";
    const widthAttr = width ? ` style="width:${_escapeAttr(width)}"` : "";
    const hasUploadHandler = typeof this._uploadHandler === "function";
    if (this._pendingFiles.length > 0 && hasUploadHandler) {
      if (this._insertBtn) {
        this._insertBtn.disabled = true;
        this._insertBtn.textContent = t("modal.image.uploading");
      }
      try {
        const parts = [];
        for (const file of this._pendingFiles) {
          const url = await this._uploadHandler(file);
          if (url) {
            parts.push(`<img src="${_escapeAttr(url)}" alt="${_escapeAttr(alt || file.name)}"${widthAttr}>`);
          }
        }
        if (parts.length > 0) {
          this._onInsert(parts.join(""));
        }
      } catch (e) {
        this._showError(t("error.uploadFailed"));
        if (this._insertBtn) {
          this._insertBtn.disabled = false;
          this._insertBtn.textContent = t("modal.common.insert");
        }
        return;
      }
      this._onClose();
      return;
    }
    if (this._pendingFiles.length > 1) {
      if (this._insertBtn) {
        this._insertBtn.disabled = true;
        this._insertBtn.textContent = t("modal.image.uploading");
      }
      const parts = [];
      for (const file of this._pendingFiles) {
        try {
          const dataUrl = await _fileToDataUrl(file);
          parts.push(`<img src="${_escapeAttr(dataUrl)}" alt="${_escapeAttr(alt || file.name)}"${widthAttr}>`);
        } catch (e) {
          this._showError(t("error.uploadFailed"));
        }
      }
      if (parts.length > 0) {
        this._onInsert(parts.join(""));
      }
      this._onClose();
      return;
    }
    const src = this._urlInput ? this._urlInput.value.trim() : "";
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
      this._errorEl.removeAttribute("hidden");
    } else {
      this._errorEl.textContent = "";
      this._errorEl.setAttribute("hidden", "");
    }
  }
  // ─── Show / Teardown ──────────────────────────────────────────────────────────
  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._urlInput) this._urlInput.focus();
    this._onKeyDown = (e) => _handleModalKey(e, this._modal, () => this._onClose());
    document.addEventListener("keydown", this._onKeyDown);
  }
  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop = null;
    this._modal = null;
    this._urlInput = null;
    this._altInput = null;
    this._widthInput = null;
    this._fileInput = null;
    this._uploadZone = null;
    this._uploadFiles = null;
    this._insertBtn = null;
    this._errorEl = null;
    this._pendingFiles = [];
    this._uploadDragCount = 0;
  }
};
function _fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(
      /** @type {string} */
      reader.result
    );
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(file);
  });
}

// src/modals/modals/VideoModal.js
var ALLOWED_VIDEO_MIME = /* @__PURE__ */ new Set(["video/mp4", "video/webm"]);
var VideoModal = class {
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
    this._i18n = opts.i18n || { t: (k) => k };
    this._hostEl = opts.hostEl || document.body;
    this._onClose = opts.onClose || (() => {
    });
    this._onInsert = opts.onInsert || (() => {
    });
    this._uploadHandler = opts.videoUploadHandler || null;
    this._allowDataUris = opts.allowDataUris === true;
    this._backdrop = null;
    this._modal = null;
    this._onKeyDown = null;
    this._destroyed = false;
    this._activeTab = "url";
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
    const backdrop = document.createElement("div");
    backdrop.className = "npe-modal-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) this._onClose();
    });
    const modal = document.createElement("div");
    modal.className = "npe-modal npe-video-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "npe-video-title");
    modal.addEventListener("click", (e) => e.stopPropagation());
    const header = document.createElement("div");
    header.className = "npe-modal-header";
    const title = document.createElement("h2");
    title.id = "npe-video-title";
    title.className = "npe-modal-title";
    title.textContent = t("modal.video.title");
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "npe-modal-close";
    closeBtn.setAttribute("aria-label", t("modal.common.close"));
    closeBtn.textContent = "\xD7";
    closeBtn.addEventListener("click", () => this._onClose());
    header.appendChild(title);
    header.appendChild(closeBtn);
    const tabBar = document.createElement("div");
    tabBar.className = "npe-modal-tabs";
    tabBar.setAttribute("role", "tablist");
    const urlTabBtn = this._makeTabBtn(t("modal.video.urlTab"), "url", true);
    const uploadTabBtn = this._makeTabBtn(t("modal.video.uploadTab"), "upload", false);
    tabBar.appendChild(urlTabBtn);
    tabBar.appendChild(uploadTabBtn);
    const urlPanel = document.createElement("div");
    urlPanel.className = "npe-modal-panel";
    urlPanel.id = "npe-video-panel-url";
    urlPanel.setAttribute("role", "tabpanel");
    const urlLabel = document.createElement("label");
    urlLabel.className = "npe-form-label";
    urlLabel.setAttribute("for", "npe-video-url");
    urlLabel.textContent = t("modal.video.url");
    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.id = "npe-video-url";
    urlInput.className = "npe-form-input";
    urlInput.value = data.src || "";
    urlInput.setAttribute("placeholder", "https://");
    urlInput.setAttribute("autocomplete", "off");
    this._urlInput = urlInput;
    urlPanel.appendChild(urlLabel);
    urlPanel.appendChild(urlInput);
    const uploadPanel = document.createElement("div");
    uploadPanel.className = "npe-modal-panel";
    uploadPanel.id = "npe-video-panel-upload";
    uploadPanel.setAttribute("role", "tabpanel");
    uploadPanel.setAttribute("hidden", "");
    const dropzone = document.createElement("div");
    dropzone.className = "npe-dropzone";
    dropzone.textContent = t("modal.video.upload");
    this._setupDropzone(dropzone);
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "npe-video-file";
    fileInput.className = "npe-file-input";
    fileInput.accept = Array.from(ALLOWED_VIDEO_MIME).join(",");
    fileInput.setAttribute("aria-label", t("modal.video.upload"));
    fileInput.addEventListener("change", () => this._handleFiles(fileInput.files));
    this._fileInput = fileInput;
    const progressEl = document.createElement("div");
    progressEl.className = "npe-upload-progress";
    progressEl.setAttribute("hidden", "");
    this._progressEl = progressEl;
    const errorEl = document.createElement("div");
    errorEl.className = "npe-upload-error";
    errorEl.setAttribute("hidden", "");
    this._errorEl = errorEl;
    uploadPanel.appendChild(dropzone);
    uploadPanel.appendChild(fileInput);
    uploadPanel.appendChild(progressEl);
    uploadPanel.appendChild(errorEl);
    urlTabBtn.addEventListener("click", () => this._switchTab("url", urlTabBtn, uploadTabBtn, urlPanel, uploadPanel));
    uploadTabBtn.addEventListener("click", () => this._switchTab("upload", uploadTabBtn, urlTabBtn, uploadPanel, urlPanel));
    const footer = document.createElement("div");
    footer.className = "npe-modal-footer";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "npe-btn";
    cancelBtn.textContent = t("modal.common.cancel");
    cancelBtn.addEventListener("click", () => this._onClose());
    const insertBtn = document.createElement("button");
    insertBtn.type = "button";
    insertBtn.className = "npe-btn npe-btn-primary";
    insertBtn.textContent = t("modal.common.insert");
    insertBtn.addEventListener("click", () => this._handleInsert());
    footer.appendChild(cancelBtn);
    footer.appendChild(insertBtn);
    modal.appendChild(header);
    modal.appendChild(tabBar);
    modal.appendChild(urlPanel);
    modal.appendChild(uploadPanel);
    modal.appendChild(footer);
    this._backdrop = backdrop;
    this._modal = modal;
  }
  _makeTabBtn(label, id, active) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "npe-tab" + (active ? " npe-tab-active" : "");
    btn.dataset.tab = id;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", active ? "true" : "false");
    btn.textContent = label;
    return btn;
  }
  _switchTab(id, activateBtn, deactivateBtn, showPanel, hidePanel) {
    this._activeTab = id;
    activateBtn.classList.add("npe-tab-active");
    activateBtn.setAttribute("aria-selected", "true");
    deactivateBtn.classList.remove("npe-tab-active");
    deactivateBtn.setAttribute("aria-selected", "false");
    showPanel.removeAttribute("hidden");
    hidePanel.setAttribute("hidden", "");
  }
  _setupDropzone(dropzone) {
    dropzone.addEventListener("click", () => {
      if (this._fileInput) this._fileInput.click();
    });
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("npe-dropzone-active");
    });
    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("npe-dropzone-active");
    });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("npe-dropzone-active");
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
    document.addEventListener("keydown", this._onKeyDown);
  }
  // ─── Insert logic ─────────────────────────────────────────────────────────────
  _handleInsert() {
    if (this._activeTab === "url") {
      const src = this._urlInput ? this._urlInput.value.trim() : "";
      if (!src) {
        if (this._urlInput) this._urlInput.focus();
        return;
      }
      this._onInsert(`<video src="${_escapeAttr(src)}" controls></video>`);
      this._onClose();
    }
  }
  async _handleFiles(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!ALLOWED_VIDEO_MIME.has(file.type)) return;
    const t = this._i18n.t.bind(this._i18n);
    this._showProgress(true);
    this._showError("");
    if (this._uploadHandler) {
      try {
        const url = await this._uploadHandler(file);
        if (url) {
          this._onInsert(`<video src="${_escapeAttr(url)}" controls></video>`);
          this._onClose();
        }
      } catch (e) {
        this._showError(t("error.uploadFailed", { file: file.name }));
      }
    } else if (this._allowDataUris) {
      try {
        const dataUrl = await _fileToDataUrl2(file);
        this._onInsert(`<video src="${_escapeAttr(dataUrl)}" controls></video>`);
        this._onClose();
      } catch (e) {
        this._showError(t("error.uploadFailed", { file: file.name }));
      }
    } else {
      this._showError(t("error.dataUrisDisabled"));
    }
    this._showProgress(false);
  }
  _showProgress(show) {
    if (!this._progressEl) return;
    if (show) this._progressEl.removeAttribute("hidden");
    else this._progressEl.setAttribute("hidden", "");
  }
  _showError(msg) {
    if (!this._errorEl) return;
    if (msg) {
      this._errorEl.textContent = msg;
      this._errorEl.removeAttribute("hidden");
    } else {
      this._errorEl.textContent = "";
      this._errorEl.setAttribute("hidden", "");
    }
  }
  // ─── Teardown ─────────────────────────────────────────────────────────────────
  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop = null;
    this._modal = null;
    this._urlInput = null;
    this._fileInput = null;
    this._progressEl = null;
    this._errorEl = null;
  }
};
function _fileToDataUrl2(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(
      /** @type {string} */
      reader.result
    );
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(file);
  });
}

// src/modals/modals/TableModal.js
var TableModal = class {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   * @param {Function} opts.onClose
   * @param {Function} opts.onInsert
   */
  constructor(opts = {}) {
    this._i18n = opts.i18n || { t: (k) => k };
    this._hostEl = opts.hostEl || document.body;
    this._onClose = opts.onClose || (() => {
    });
    this._onInsert = opts.onInsert || (() => {
    });
    this._backdrop = null;
    this._modal = null;
    this._onKeyDown = null;
    this._destroyed = false;
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
    const backdrop = document.createElement("div");
    backdrop.className = "npe-modal-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) this._onClose();
    });
    const modal = document.createElement("div");
    modal.className = "npe-modal npe-table-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "npe-table-title");
    modal.addEventListener("click", (e) => e.stopPropagation());
    const header = document.createElement("div");
    header.className = "npe-modal-header";
    const title = document.createElement("h2");
    title.id = "npe-table-title";
    title.className = "npe-modal-title";
    title.textContent = t("modal.table.title");
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "npe-modal-close";
    closeBtn.setAttribute("aria-label", t("modal.common.close"));
    closeBtn.textContent = "\xD7";
    closeBtn.addEventListener("click", () => this._onClose());
    header.appendChild(title);
    header.appendChild(closeBtn);
    const body = document.createElement("div");
    body.className = "npe-modal-body";
    const rowsLabel = document.createElement("label");
    rowsLabel.className = "npe-form-label";
    rowsLabel.setAttribute("for", "npe-table-rows");
    rowsLabel.textContent = t("modal.table.rows");
    const rowsInput = document.createElement("input");
    rowsInput.type = "number";
    rowsInput.id = "npe-table-rows";
    rowsInput.className = "npe-form-input npe-table-number-input";
    rowsInput.value = String(data.rows || 3);
    rowsInput.min = "1";
    rowsInput.max = "100";
    this._rowsInput = rowsInput;
    const colsLabel = document.createElement("label");
    colsLabel.className = "npe-form-label";
    colsLabel.setAttribute("for", "npe-table-cols");
    colsLabel.textContent = t("modal.table.columns");
    const colsInput = document.createElement("input");
    colsInput.type = "number";
    colsInput.id = "npe-table-cols";
    colsInput.className = "npe-form-input npe-table-number-input";
    colsInput.value = String(data.cols || 3);
    colsInput.min = "1";
    colsInput.max = "100";
    this._colsInput = colsInput;
    const { check: headerCheck, label: headerLabel } = _makeCheckbox(
      "npe-table-header",
      t("modal.table.headerRow")
    );
    headerCheck.checked = data.headerRow !== false;
    this._headerCheck = headerCheck;
    body.appendChild(rowsLabel);
    body.appendChild(rowsInput);
    body.appendChild(colsLabel);
    body.appendChild(colsInput);
    body.appendChild(headerLabel);
    const footer = document.createElement("div");
    footer.className = "npe-modal-footer";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "npe-btn";
    cancelBtn.textContent = t("modal.common.cancel");
    cancelBtn.addEventListener("click", () => this._onClose());
    const insertBtn = document.createElement("button");
    insertBtn.type = "button";
    insertBtn.className = "npe-btn npe-btn-primary";
    insertBtn.textContent = t("modal.common.insert");
    insertBtn.addEventListener("click", () => this._handleInsert());
    footer.appendChild(cancelBtn);
    footer.appendChild(insertBtn);
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    this._backdrop = backdrop;
    this._modal = modal;
  }
  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._rowsInput) this._rowsInput.focus();
    this._onKeyDown = (e) => _handleModalKey(e, this._modal, () => this._onClose());
    document.addEventListener("keydown", this._onKeyDown);
  }
  // ─── Insert logic ─────────────────────────────────────────────────────────────
  _handleInsert() {
    const rows = Math.max(1, Math.min(100, parseInt(this._rowsInput ? this._rowsInput.value : "3", 10) || 3));
    const cols = Math.max(1, Math.min(100, parseInt(this._colsInput ? this._colsInput.value : "3", 10) || 3));
    const includeHeader = this._headerCheck ? this._headerCheck.checked : true;
    this._onInsert(_buildTableHtml(rows, cols, includeHeader));
    this._onClose();
  }
  // ─── Teardown ─────────────────────────────────────────────────────────────────
  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop = null;
    this._modal = null;
    this._rowsInput = null;
    this._colsInput = null;
    this._headerCheck = null;
  }
};
function _buildTableHtml(rows, cols, includeHeader) {
  const cellStyle = "border:1px solid #ccc;padding:6px 10px;";
  const emptyCell = (tag) => `<${tag} style="${cellStyle}"><br></${tag}>`;
  let html = '<table style="border-collapse:collapse;width:100%;border:1px solid #ccc">';
  if (includeHeader) {
    html += "<thead><tr>";
    for (let c = 0; c < cols; c++) {
      html += emptyCell("th");
    }
    html += "</tr></thead>";
  }
  html += "<tbody>";
  for (let r = 0; r < rows; r++) {
    html += "<tr>";
    for (let c = 0; c < cols; c++) {
      html += emptyCell("td");
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  return html;
}

// src/modals/modals/EmojiPicker.js
var EMOJI_CATEGORIES = [
  {
    label: "Smileys",
    emojis: ["\u{1F600}", "\u{1F601}", "\u{1F602}", "\u{1F923}", "\u{1F603}", "\u{1F604}", "\u{1F605}", "\u{1F606}", "\u{1F607}", "\u{1F608}", "\u{1F609}", "\u{1F60A}", "\u{1F60B}", "\u{1F60C}", "\u{1F60D}", "\u{1F970}", "\u{1F60E}", "\u{1F60F}", "\u{1F610}", "\u{1F611}", "\u{1F612}", "\u{1F613}", "\u{1F614}", "\u{1F615}", "\u{1F616}", "\u{1F617}", "\u{1F618}", "\u{1F619}", "\u{1F61A}", "\u{1F61B}", "\u{1F61C}", "\u{1F61D}", "\u{1F61E}", "\u{1F61F}", "\u{1F620}", "\u{1F621}", "\u{1F622}", "\u{1F624}", "\u{1F625}", "\u{1F626}", "\u{1F627}", "\u{1F628}", "\u{1F629}", "\u{1F97A}", "\u{1F62A}", "\u{1F62B}", "\u{1F62C}", "\u{1F62D}", "\u{1F62E}", "\u{1F62F}", "\u{1F630}", "\u{1F631}", "\u{1F632}", "\u{1F633}", "\u{1F974}", "\u{1F634}", "\u{1F635}", "\u{1F92F}", "\u{1F637}", "\u{1F912}", "\u{1F915}", "\u{1F922}", "\u{1F92E}", "\u{1F927}", "\u{1F975}", "\u{1F976}", "\u{1F973}", "\u{1F920}", "\u{1F60E}", "\u{1F913}", "\u{1F9D0}"]
  },
  {
    label: "People",
    emojis: ["\u{1F44B}", "\u{1F91A}", "\u{1F590}", "\u270B", "\u{1F596}", "\u{1F44C}", "\u{1F90C}", "\u{1F90F}", "\u270C", "\u{1F91E}", "\u{1F91F}", "\u{1F918}", "\u{1F919}", "\u{1F448}", "\u{1F449}", "\u{1F446}", "\u{1F595}", "\u{1F447}", "\u261D", "\u{1F44D}", "\u{1F44E}", "\u270A", "\u{1F44A}", "\u{1F91B}", "\u{1F91C}", "\u{1F44F}", "\u{1F64C}", "\u{1F450}", "\u{1F932}", "\u{1F91D}", "\u{1F64F}", "\u{1F4AA}", "\u{1F9BE}", "\u{1F9B5}", "\u{1F9B6}", "\u{1F442}", "\u{1F9BB}", "\u{1F443}", "\u{1FAC0}", "\u{1FAC1}", "\u{1F9E0}", "\u{1F9B7}", "\u{1F9B4}", "\u{1F441}", "\u{1F440}", "\u{1F445}", "\u{1F444}"]
  },
  {
    label: "Animals",
    emojis: ["\u{1F436}", "\u{1F431}", "\u{1F42D}", "\u{1F439}", "\u{1F430}", "\u{1F98A}", "\u{1F43B}", "\u{1F43C}", "\u{1F43B}\u200D\u2744\uFE0F", "\u{1F428}", "\u{1F42F}", "\u{1F981}", "\u{1F42E}", "\u{1F437}", "\u{1F438}", "\u{1F435}", "\u{1F648}", "\u{1F649}", "\u{1F64A}", "\u{1F412}", "\u{1F414}", "\u{1F427}", "\u{1F426}", "\u{1F424}", "\u{1F986}", "\u{1F985}", "\u{1F989}", "\u{1F987}", "\u{1F43A}", "\u{1F417}", "\u{1F434}", "\u{1F984}", "\u{1F41D}", "\u{1F41B}", "\u{1F98B}", "\u{1F40C}", "\u{1F41E}", "\u{1F41C}", "\u{1F99F}", "\u{1F997}", "\u{1F577}", "\u{1F982}", "\u{1F422}", "\u{1F40D}", "\u{1F98E}", "\u{1F996}", "\u{1F995}", "\u{1F419}", "\u{1F991}", "\u{1F990}", "\u{1F99E}", "\u{1F980}", "\u{1F421}", "\u{1F420}", "\u{1F41F}", "\u{1F42C}", "\u{1F433}", "\u{1F40B}", "\u{1F988}", "\u{1F40A}", "\u{1F405}", "\u{1F406}", "\u{1F993}", "\u{1F98D}", "\u{1F9A7}", "\u{1F9A3}", "\u{1F418}", "\u{1F99B}", "\u{1F98F}", "\u{1F42A}", "\u{1F42B}", "\u{1F992}", "\u{1F998}", "\u{1F9AC}", "\u{1F403}", "\u{1F402}", "\u{1F404}", "\u{1F40E}", "\u{1F416}", "\u{1F40F}", "\u{1F411}", "\u{1F999}", "\u{1F410}", "\u{1F98C}", "\u{1F415}", "\u{1F429}", "\u{1F9AE}", "\u{1F415}\u200D\u{1F9BA}", "\u{1F408}", "\u{1F408}\u200D\u2B1B", "\u{1F413}", "\u{1F983}", "\u{1F9A4}", "\u{1F99A}", "\u{1F99C}", "\u{1F9A2}", "\u{1F9A9}", "\u{1F54A}", "\u{1F407}", "\u{1F99D}", "\u{1F9A8}", "\u{1F9A1}", "\u{1F9AB}", "\u{1F9A6}", "\u{1F9A5}", "\u{1F401}", "\u{1F400}", "\u{1F43F}", "\u{1F994}"]
  },
  {
    label: "Food",
    emojis: ["\u{1F34E}", "\u{1F350}", "\u{1F34A}", "\u{1F34B}", "\u{1F34C}", "\u{1F349}", "\u{1F347}", "\u{1F353}", "\u{1FAD0}", "\u{1F348}", "\u{1F352}", "\u{1F351}", "\u{1F96D}", "\u{1F34D}", "\u{1F965}", "\u{1F95D}", "\u{1F345}", "\u{1F346}", "\u{1F951}", "\u{1F966}", "\u{1F96C}", "\u{1F952}", "\u{1F336}", "\u{1FAD1}", "\u{1F955}", "\u{1F9C4}", "\u{1F9C5}", "\u{1F954}", "\u{1F360}", "\u{1FAD8}", "\u{1F950}", "\u{1F96F}", "\u{1F35E}", "\u{1F956}", "\u{1F968}", "\u{1F9C0}", "\u{1F95A}", "\u{1F373}", "\u{1F9C8}", "\u{1F95E}", "\u{1F9C7}", "\u{1F953}", "\u{1F969}", "\u{1F357}", "\u{1F356}", "\u{1F9B4}", "\u{1F32D}", "\u{1F354}", "\u{1F35F}", "\u{1F355}", "\u{1FAD3}", "\u{1F96A}", "\u{1F959}", "\u{1F9C6}", "\u{1F32E}", "\u{1F32F}", "\u{1FAD4}", "\u{1F957}", "\u{1F958}", "\u{1FAD5}", "\u{1F96B}", "\u{1F35D}", "\u{1F35C}", "\u{1F372}", "\u{1F35B}", "\u{1F363}", "\u{1F371}", "\u{1F95F}", "\u{1F9AA}", "\u{1F364}", "\u{1F359}", "\u{1F35A}", "\u{1F358}", "\u{1F365}", "\u{1F96E}", "\u{1F362}", "\u{1F9C1}", "\u{1F370}", "\u{1F382}", "\u{1F36E}", "\u{1F36D}", "\u{1F36C}", "\u{1F36B}", "\u{1F37F}", "\u{1F369}", "\u{1F36A}", "\u{1F330}", "\u{1F95C}", "\u{1F36F}", "\u{1F9C3}", "\u{1F964}", "\u{1F9CB}", "\u2615", "\u{1F375}", "\u{1FAD6}", "\u{1F37A}", "\u{1F37B}", "\u{1F942}", "\u{1F377}", "\u{1F943}", "\u{1F378}", "\u{1F379}", "\u{1F9C9}", "\u{1F37E}", "\u{1F9CA}", "\u{1F944}", "\u{1F374}", "\u{1F37D}", "\u{1F962}", "\u{1F9C2}"]
  },
  {
    label: "Travel",
    emojis: ["\u{1F697}", "\u{1F695}", "\u{1F699}", "\u{1F68C}", "\u{1F68E}", "\u{1F3CE}", "\u{1F693}", "\u{1F691}", "\u{1F692}", "\u{1F690}", "\u{1F6FB}", "\u{1F69A}", "\u{1F69B}", "\u{1F69C}", "\u{1F6F5}", "\u{1F3CD}", "\u{1F6B2}", "\u{1F6F4}", "\u{1F6F9}", "\u{1F6FC}", "\u{1F681}", "\u{1F6F8}", "\u{1F680}", "\u{1F6F6}", "\u26F5", "\u{1F6A4}", "\u{1F6E5}", "\u{1F6F3}", "\u26F4", "\u{1F6A2}", "\u2708", "\u{1F6E9}", "\u{1F6EB}", "\u{1F6EC}", "\u{1F6F0}", "\u{1F4BA}", "\u{1F682}", "\u{1F683}", "\u{1F684}", "\u{1F685}", "\u{1F686}", "\u{1F687}", "\u{1F688}", "\u{1F689}", "\u{1F68A}", "\u{1F69D}", "\u{1F69E}", "\u{1F68B}", "\u{1F68C}", "\u{1F68D}", "\u{1F68E}", "\u{1F690}", "\u{1F691}", "\u{1F692}", "\u{1F693}", "\u{1F694}", "\u{1F696}", "\u{1F697}", "\u{1F698}", "\u{1F699}", "\u{1F6FB}", "\u{1F3E0}", "\u{1F3E1}", "\u{1F3E2}", "\u{1F3E3}", "\u{1F3E4}", "\u{1F3E5}", "\u{1F3E6}", "\u{1F3E7}", "\u{1F3E8}", "\u{1F3E9}", "\u{1F3EA}", "\u{1F3EB}", "\u{1F3EC}", "\u{1F3ED}", "\u{1F3EF}", "\u{1F3F0}", "\u{1F492}", "\u{1F5FC}", "\u{1F5FD}", "\u26EA", "\u{1F54C}", "\u{1F6D5}", "\u{1F54D}", "\u26E9", "\u{1F54B}", "\u26F2", "\u26FA", "\u{1F301}", "\u{1F303}", "\u{1F304}", "\u{1F305}", "\u{1F306}", "\u{1F307}", "\u{1F309}", "\u{1F3D9}", "\u{1F30C}", "\u{1F320}", "\u{1F387}", "\u{1F386}"]
  },
  {
    label: "Symbols",
    emojis: ["\u2764", "\u{1F9E1}", "\u{1F49B}", "\u{1F49A}", "\u{1F499}", "\u{1F49C}", "\u{1F5A4}", "\u{1F90D}", "\u{1F90E}", "\u{1F494}", "\u2763", "\u{1F495}", "\u{1F49E}", "\u{1F493}", "\u{1F497}", "\u{1F496}", "\u{1F498}", "\u{1F49D}", "\u{1F49F}", "\u262E", "\u271D", "\u262A", "\u{1F549}", "\u2638", "\u2721", "\u{1F52F}", "\u{1F54E}", "\u262F", "\u2626", "\u{1F6D0}", "\u26CE", "\u2648", "\u2649", "\u264A", "\u264B", "\u264C", "\u264D", "\u264E", "\u264F", "\u2650", "\u2651", "\u2652", "\u2653", "\u{1F194}", "\u269B", "\u{1F251}", "\u2622", "\u2623", "\u{1F4F4}", "\u{1F4F3}", "\u{1F236}", "\u{1F21A}", "\u{1F238}", "\u{1F23A}", "\u{1F237}", "\u2734", "\u{1F19A}", "\u{1F4AE}", "\u{1F250}", "\u3299", "\u3297", "\u{1F234}", "\u{1F235}", "\u{1F239}", "\u{1F232}", "\u{1F170}", "\u{1F171}", "\u{1F18E}", "\u{1F191}", "\u{1F17E}", "\u{1F198}", "\u274C", "\u2B55", "\u{1F6D1}", "\u26D4", "\u{1F4DB}", "\u{1F6AB}", "\u{1F4AF}", "\u{1F4A2}", "\u2668", "\u{1F6B7}", "\u{1F6AF}", "\u{1F6B3}", "\u{1F6B1}", "\u{1F51E}", "\u{1F4F5}", "\u{1F6AD}", "\u2757", "\u2755", "\u2753", "\u2754", "\u203C", "\u2049", "\u{1F505}", "\u{1F506}", "\u303D", "\u26A0", "\u{1F6B8}", "\u{1F531}", "\u269C", "\u{1F530}", "\u267B", "\u2705", "\u{1F22F}", "\u{1F4B9}", "\u274E", "\u{1F310}", "\u{1F4A0}", "\u24C2", "\u{1F300}", "\u{1F4A4}", "\u{1F3E7}", "\u{1F6BE}", "\u267F", "\u{1F17F}", "\u{1F6D7}", "\u{1F233}", "\u{1F239}", "\u{1F6BA}", "\u{1F6B9}", "\u{1F6BB}", "\u{1F6BC}", "\u{1F6AE}", "\u{1F3A6}", "\u{1F4F6}", "\u{1F201}", "\u{1F523}", "\u2139", "\u{1F524}", "\u{1F521}", "\u{1F520}", "\u{1F196}", "\u{1F197}", "\u{1F199}", "\u{1F192}", "\u{1F195}", "\u{1F193}", "0\uFE0F\u20E3", "1\uFE0F\u20E3", "2\uFE0F\u20E3", "3\uFE0F\u20E3", "4\uFE0F\u20E3", "5\uFE0F\u20E3", "6\uFE0F\u20E3", "7\uFE0F\u20E3", "8\uFE0F\u20E3", "9\uFE0F\u20E3", "\u{1F51F}", "\u{1F522}", "#\uFE0F\u20E3", "*\uFE0F\u20E3", "\u23CF", "\u25B6", "\u23F8", "\u23F9", "\u23FA", "\u23ED", "\u23EE", "\u23E9", "\u23EA", "\u23EB", "\u23EC", "\u25C0", "\u{1F53C}", "\u{1F53D}", "\u27A1", "\u2B05", "\u2B06", "\u2B07", "\u2197", "\u2198", "\u2199", "\u2196", "\u2195", "\u2194", "\u21A9", "\u21AA", "\u2934", "\u2935", "\u{1F500}", "\u{1F501}", "\u{1F502}", "\u{1F504}", "\u{1F503}", "\u{1F3B5}", "\u{1F3B6}", "\u2795", "\u2796", "\u2797", "\u2716", "\u267E", "\u{1F4B2}", "\u{1F4B1}", "\u2122", "\xA9", "\xAE", "\u3030", "\u27B0", "\u27BF", "\u{1F51A}", "\u{1F519}", "\u{1F51B}", "\u{1F51D}", "\u{1F51C}", "\u2714", "\u2611", "\u{1F518}", "\u{1F532}", "\u{1F533}", "\u26AB", "\u26AA", "\u{1F7E4}", "\u{1F534}", "\u{1F7E0}", "\u{1F7E1}", "\u{1F7E2}", "\u{1F535}", "\u{1F7E3}", "\u{1F7E5}", "\u{1F7E7}", "\u{1F7E8}", "\u{1F7E9}", "\u{1F7E6}", "\u{1F7EA}", "\u2B1B", "\u2B1C", "\u25FC", "\u25FB", "\u25FE", "\u25FD", "\u25AA", "\u25AB"]
  }
];
var EmojiPicker = class {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   * @param {Function} opts.onClose
   * @param {Function} opts.onInsert — called with single emoji character string
   */
  constructor(opts = {}) {
    this._i18n = opts.i18n || { t: (k) => k };
    this._hostEl = opts.hostEl || document.body;
    this._onClose = opts.onClose || (() => {
    });
    this._onInsert = opts.onInsert || (() => {
    });
    this._backdrop = null;
    this._modal = null;
    this._onKeyDown = null;
    this._destroyed = false;
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  open(data = {}) {
    if (this._modal) return;
    this._build();
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
  _build() {
    const t = this._i18n.t.bind(this._i18n);
    const backdrop = document.createElement("div");
    backdrop.className = "npe-modal-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) this._onClose();
    });
    const modal = document.createElement("div");
    modal.className = "npe-modal npe-emoji-picker";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "npe-emoji-title");
    modal.addEventListener("click", (e) => e.stopPropagation());
    const header = document.createElement("div");
    header.className = "npe-modal-header";
    const title = document.createElement("h2");
    title.id = "npe-emoji-title";
    title.className = "npe-modal-title";
    title.textContent = t("modal.emoji.title");
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "npe-modal-close";
    closeBtn.setAttribute("aria-label", t("modal.common.close"));
    closeBtn.textContent = "\xD7";
    closeBtn.addEventListener("click", () => this._onClose());
    header.appendChild(title);
    header.appendChild(closeBtn);
    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.className = "npe-form-input npe-emoji-search";
    searchInput.setAttribute("placeholder", "\u{1F50D}");
    searchInput.setAttribute("aria-label", "Search emoji");
    searchInput.addEventListener("input", () => this._filterEmoji(searchInput.value, grid));
    this._searchInput = searchInput;
    const grid = document.createElement("div");
    grid.className = "npe-emoji-grid";
    this._renderEmoji(grid, null);
    modal.appendChild(header);
    modal.appendChild(searchInput);
    modal.appendChild(grid);
    this._backdrop = backdrop;
    this._modal = modal;
    this._grid = grid;
  }
  /**
   * Render emoji buttons into the grid.
   * @param {HTMLElement} grid
   * @param {string|null} filter — search string or null for all
   */
  _renderEmoji(grid, filter) {
    grid.innerHTML = "";
    const query = filter ? filter.toLowerCase() : null;
    for (const category of EMOJI_CATEGORIES) {
      const emojis = query ? category.emojis.filter((e) => e.toLowerCase().includes(query)) : category.emojis;
      if (emojis.length === 0) continue;
      const catLabel = document.createElement("div");
      catLabel.className = "npe-emoji-category-label";
      catLabel.textContent = category.label;
      grid.appendChild(catLabel);
      const row = document.createElement("div");
      row.className = "npe-emoji-row";
      for (const emoji of emojis) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "npe-emoji-btn";
        btn.textContent = emoji;
        btn.setAttribute("title", emoji);
        btn.setAttribute("aria-label", emoji);
        btn.addEventListener("click", () => {
          this._onInsert(emoji);
          this._onClose();
        });
        row.appendChild(btn);
      }
      grid.appendChild(row);
    }
    if (grid.children.length === 0) {
      const empty = document.createElement("p");
      empty.className = "npe-emoji-empty";
      empty.textContent = "\u2014";
      grid.appendChild(empty);
    }
  }
  _filterEmoji(query, grid) {
    this._renderEmoji(grid, query || null);
  }
  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._searchInput) this._searchInput.focus();
    this._onKeyDown = (e) => _handleModalKey(e, this._modal, () => this._onClose());
    document.addEventListener("keydown", this._onKeyDown);
  }
  // ─── Teardown ─────────────────────────────────────────────────────────────────
  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop = null;
    this._modal = null;
    this._searchInput = null;
    this._grid = null;
  }
};

// src/modals/modals/SpecialCharsPicker.js
var CHAR_CATEGORIES = [
  {
    label: "Currency",
    chars: ["\u20AC", "\xA3", "\xA5", "\xA2", "\u20B9", "\u20BD", "\u20A9", "\u20AA", "\u20BA", "\u20AB", "\u0E3F", "\u20B4", "\u20A6", "\u20A1", "\u20B2", "\u20B5", "\u20B1"]
  },
  {
    label: "Math",
    chars: ["\xB1", "\xD7", "\xF7", "\u2260", "\u2264", "\u2265", "\u2248", "\u221E", "\u2211", "\u220F", "\u221A", "\u221B", "\u222B", "\u2202", "\u2206", "\u2207", "\u2208", "\u2209", "\u220B", "\u2229", "\u222A", "\u2282", "\u2283", "\u2284", "\u2285", "\u2286", "\u2287", "\u2200", "\u2203", "\u2204", "\xAC", "\u2227", "\u2228", "\u2295", "\u2297", "\u22A5", "\u2225", "\u221F", "\u2220", "\xB0", "\u2032", "\u2033", "\u2030", "\u2031", "%"]
  },
  {
    label: "Arrows",
    chars: ["\u2190", "\u2192", "\u2191", "\u2193", "\u2194", "\u2195", "\u2196", "\u2197", "\u2198", "\u2199", "\u21D0", "\u21D2", "\u21D1", "\u21D3", "\u21D4", "\u21D5", "\u27F5", "\u27F6", "\u27F7", "\u27F8", "\u27F9", "\u27FA", "\u2794", "\u279C", "\u27A1", "\u2B05", "\u2B06", "\u2B07", "\u21A9", "\u21AA", "\u21BA", "\u21BB"]
  },
  {
    label: "Punctuation",
    chars: ["\xA9", "\xAE", "\u2122", "\xA7", "\xB6", "\u2020", "\u2021", "\u2022", "\u2023", "\xB7", "\u2026", "\u2025", "\u2014", "\u2013", "\u2011", "\xAB", "\xBB", "\u2039", "\u203A", "\u201C", "\u201D", "\u201E", "\u2018", "\u2019", "\u201A", "|", "\xA6", "\xA1", "\xBF"]
  },
  {
    label: "Letters",
    chars: ["\xC0", "\xC1", "\xC2", "\xC3", "\xC4", "\xC5", "\xC6", "\xC7", "\xC8", "\xC9", "\xCA", "\xCB", "\xCC", "\xCD", "\xCE", "\xCF", "\xD0", "\xD1", "\xD2", "\xD3", "\xD4", "\xD5", "\xD6", "\xD8", "\xD9", "\xDA", "\xDB", "\xDC", "\xDD", "\xDE", "\xDF", "\xE0", "\xE1", "\xE2", "\xE3", "\xE4", "\xE5", "\xE6", "\xE7", "\xE8", "\xE9", "\xEA", "\xEB", "\xEC", "\xED", "\xEE", "\xEF", "\xF0", "\xF1", "\xF2", "\xF3", "\xF4", "\xF5", "\xF6", "\xF8", "\xF9", "\xFA", "\xFB", "\xFC", "\xFD", "\xFE", "\xFF"]
  },
  {
    label: "Greek",
    chars: ["\u0391", "\u0392", "\u0393", "\u0394", "\u0395", "\u0396", "\u0397", "\u0398", "\u0399", "\u039A", "\u039B", "\u039C", "\u039D", "\u039E", "\u039F", "\u03A0", "\u03A1", "\u03A3", "\u03A4", "\u03A5", "\u03A6", "\u03A7", "\u03A8", "\u03A9", "\u03B1", "\u03B2", "\u03B3", "\u03B4", "\u03B5", "\u03B6", "\u03B7", "\u03B8", "\u03B9", "\u03BA", "\u03BB", "\u03BC", "\u03BD", "\u03BE", "\u03BF", "\u03C0", "\u03C1", "\u03C2", "\u03C3", "\u03C4", "\u03C5", "\u03C6", "\u03C7", "\u03C8", "\u03C9"]
  },
  {
    label: "Fractions",
    chars: ["\xBD", "\xBC", "\xBE", "\u2153", "\u2154", "\u215B", "\u215C", "\u215D", "\u215E", "\u2150", "\u2151", "\u2152"]
  },
  {
    label: "Subscript",
    chars: ["\u2080", "\u2081", "\u2082", "\u2083", "\u2084", "\u2085", "\u2086", "\u2087", "\u2088", "\u2089", "\u208A", "\u208B", "\u208C", "\u208D", "\u208E"]
  },
  {
    label: "Superscript",
    chars: ["\u2070", "\xB9", "\xB2", "\xB3", "\u2074", "\u2075", "\u2076", "\u2077", "\u2078", "\u2079", "\u207A", "\u207B", "\u207C", "\u207D", "\u207E"]
  }
];
var SpecialCharsPicker = class {
  /**
   * @param {object} opts
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   * @param {Function} opts.onClose
   * @param {Function} opts.onInsert
   */
  constructor(opts = {}) {
    this._i18n = opts.i18n || { t: (k) => k };
    this._hostEl = opts.hostEl || document.body;
    this._onClose = opts.onClose || (() => {
    });
    this._onInsert = opts.onInsert || (() => {
    });
    this._backdrop = null;
    this._modal = null;
    this._onKeyDown = null;
    this._destroyed = false;
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  open(data = {}) {
    if (this._modal) return;
    this._build();
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
  _build() {
    const t = this._i18n.t.bind(this._i18n);
    const backdrop = document.createElement("div");
    backdrop.className = "npe-modal-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) this._onClose();
    });
    const modal = document.createElement("div");
    modal.className = "npe-modal npe-special-chars-picker";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "npe-special-chars-title");
    modal.addEventListener("click", (e) => e.stopPropagation());
    const header = document.createElement("div");
    header.className = "npe-modal-header";
    const title = document.createElement("h2");
    title.id = "npe-special-chars-title";
    title.className = "npe-modal-title";
    title.textContent = t("modal.specialChars.title");
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "npe-modal-close";
    closeBtn.setAttribute("aria-label", t("modal.common.close"));
    closeBtn.textContent = "\xD7";
    closeBtn.addEventListener("click", () => this._onClose());
    header.appendChild(title);
    header.appendChild(closeBtn);
    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.className = "npe-form-input npe-emoji-search";
    searchInput.setAttribute("placeholder", "\u{1F50D}");
    searchInput.setAttribute("aria-label", "Search characters");
    searchInput.addEventListener("input", () => this._filterChars(searchInput.value, grid));
    this._searchInput = searchInput;
    const grid = document.createElement("div");
    grid.className = "npe-emoji-grid npe-special-chars-grid";
    this._renderChars(grid, null);
    modal.appendChild(header);
    modal.appendChild(searchInput);
    modal.appendChild(grid);
    this._backdrop = backdrop;
    this._modal = modal;
    this._grid = grid;
  }
  _renderChars(grid, filter) {
    grid.innerHTML = "";
    const query = filter ? filter.toLowerCase() : null;
    for (const category of CHAR_CATEGORIES) {
      const chars = query ? category.chars.filter((c) => c.toLowerCase().includes(query) || category.label.toLowerCase().includes(query)) : category.chars;
      if (chars.length === 0) continue;
      const catLabel = document.createElement("div");
      catLabel.className = "npe-emoji-category-label";
      catLabel.textContent = category.label;
      grid.appendChild(catLabel);
      const row = document.createElement("div");
      row.className = "npe-emoji-row";
      for (const char of chars) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "npe-special-char-btn";
        btn.textContent = char;
        btn.setAttribute("title", char);
        btn.setAttribute("aria-label", char);
        btn.addEventListener("click", () => {
          this._onInsert(char);
          this._onClose();
        });
        row.appendChild(btn);
      }
      grid.appendChild(row);
    }
    if (grid.children.length === 0) {
      const empty = document.createElement("p");
      empty.className = "npe-emoji-empty";
      empty.textContent = "\u2014";
      grid.appendChild(empty);
    }
  }
  _filterChars(query, grid) {
    this._renderChars(grid, query || null);
  }
  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._searchInput) this._searchInput.focus();
    this._onKeyDown = (e) => _handleModalKey(e, this._modal, () => this._onClose());
    document.addEventListener("keydown", this._onKeyDown);
  }
  // ─── Teardown ─────────────────────────────────────────────────────────────────
  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop = null;
    this._modal = null;
    this._searchInput = null;
    this._grid = null;
  }
};

// src/modals/ModalManager.js
var ModalManager = class {
  /**
   * @param {object} opts
   * @param {import('../core/Options').EditorOptions} opts.options
   * @param {import('../core/EventBus').EventBus} opts.bus
   * @param {import('../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   */
  constructor(opts = {}) {
    this._opts = opts.options || {};
    this._bus = opts.bus || null;
    this._i18n = opts.i18n || { t: (k) => k };
    this._hostEl = opts.hostEl || document.body;
    this._canvas = opts.canvasManager || null;
    this._openId = null;
    this._savedRange = null;
    this._current = null;
    this._destroyed = false;
    this._linkModal = null;
    this._imageModal = null;
    this._videoModal = null;
    this._tableModal = null;
    this._emojiPicker = null;
    this._specialCharsPicker = null;
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  /**
   * Save the current iframe selection, then open the requested modal.
   * @param {string} modalId — 'link' | 'image' | 'video' | 'table' | 'emoji' | 'specialChars'
   * @param {object} [data] — optional seed data (e.g. existing link href)
   */
  open(modalId, data = {}) {
    if (this._destroyed) return;
    if (this._openId) this.close();
    this._saveSelection();
    this._openId = modalId;
    const modal = this._getOrCreateModal(modalId);
    if (!modal) {
      this._openId = null;
      return;
    }
    this._current = modal;
    modal.open(data);
  }
  /**
   * Close the currently open modal and restore selection.
   */
  close() {
    if (this._current) {
      this._current.close();
      this._current = null;
    }
    this._openId = null;
    this._restoreSelection();
  }
  /**
   * Attach a canvas manager after construction.
   * @param {import('../canvas/CanvasManager').CanvasManager} canvasManager
   */
  attachCanvas(canvasManager) {
    this._canvas = canvasManager;
  }
  /**
   * Destroy all modals and clean up.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.close();
    for (const key of ["_linkModal", "_imageModal", "_videoModal", "_tableModal", "_emojiPicker", "_specialCharsPicker"]) {
      if (this[key] && typeof this[key].destroy === "function") {
        this[key].destroy();
      }
      this[key] = null;
    }
  }
  // ─── Selection save / restore ─────────────────────────────────────────────
  _saveSelection() {
    this._savedRange = null;
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      const sel = doc.getSelection();
      if (sel && sel.rangeCount > 0) {
        this._savedRange = sel.getRangeAt(0).cloneRange();
      }
    } catch (e) {
    }
  }
  _restoreSelection() {
    if (!this._savedRange) return;
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      const sel = doc.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this._savedRange);
      }
    } catch (e) {
    } finally {
      this._savedRange = null;
    }
  }
  // ─── Modal factory ────────────────────────────────────────────────────────
  /**
   * @param {string} id
   * @returns {object|null}
   */
  _getOrCreateModal(id) {
    const commonOpts = {
      i18n: this._i18n,
      hostEl: this._hostEl,
      bus: this._bus,
      onClose: () => this.close(),
      onInsert: (html) => this._insert(html),
      options: this._opts,
      canvasManager: this._canvas
    };
    switch (id) {
      case "link":
        if (!this._linkModal) {
          this._linkModal = new LinkModal(commonOpts);
        }
        return this._linkModal;
      case "image":
        if (!this._imageModal) {
          this._imageModal = new ImageModal(__spreadProps(__spreadValues({}, commonOpts), {
            imageUploadHandler: this._opts.imageUploadHandler || null,
            allowDataUris: this._opts.allowDataUris === true
          }));
        }
        return this._imageModal;
      case "video":
        if (!this._videoModal) {
          this._videoModal = new VideoModal(__spreadProps(__spreadValues({}, commonOpts), {
            videoUploadHandler: this._opts.videoUploadHandler || null,
            allowDataUris: this._opts.allowDataUris === true
          }));
        }
        return this._videoModal;
      case "table":
        if (!this._tableModal) {
          this._tableModal = new TableModal(commonOpts);
        }
        return this._tableModal;
      case "emoji":
        if (!this._emojiPicker) {
          this._emojiPicker = new EmojiPicker(commonOpts);
        }
        return this._emojiPicker;
      case "specialChars":
        if (!this._specialCharsPicker) {
          this._specialCharsPicker = new SpecialCharsPicker(commonOpts);
        }
        return this._specialCharsPicker;
      default:
        return null;
    }
  }
  // ─── Insert into canvas ───────────────────────────────────────────────────
  /**
   * Insert HTML at the saved selection position inside the iframe.
   * @param {string} html
   */
  _insert(html) {
    if (!html) return;
    const doc = this._getIframeDoc();
    if (!doc) {
      if (this._bus) this._bus.emit("modal:insert", { html });
      return;
    }
    this._restoreSelection();
    try {
      const sel = doc.getSelection();
      if (!sel || sel.rangeCount === 0) {
        const body = this._canvas ? this._canvas.getBody() : doc.body;
        if (body) body.insertAdjacentHTML("beforeend", html);
        return;
      }
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const tmp = doc.createElement("div");
      tmp.innerHTML = html;
      const frag = doc.createDocumentFragment();
      while (tmp.firstChild) frag.appendChild(tmp.firstChild);
      range.insertNode(frag);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {
      if (this._bus) this._bus.emit("modal:insert", { html });
    }
    if (this._bus) {
      const body = this._canvas ? this._canvas.getBody() : null;
      this._bus.emit("content:change", { html: body ? body.innerHTML : "" });
    }
  }
  // ─── Helpers ──────────────────────────────────────────────────────────────
  /** @returns {Document|null} */
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch (e) {
      return null;
    }
  }
};

// src/modals/modals/SourceViewModal.js
var SourceViewModal = class {
  /**
   * @param {object} opts
   * @param {import('../canvas/ContentSerializer').ContentSerializer} opts.contentSerializer
   * @param {import('../canvas/StyleManager').StyleManager} opts.styleManager
   * @param {import('../canvas/Sanitizer').Sanitizer} opts.sanitizer
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl — host element to append the modal to
   */
  constructor(opts = {}) {
    this._serializer = opts.contentSerializer || null;
    this._styleManager = opts.styleManager || null;
    this._sanitizer = opts.sanitizer || null;
    this._i18n = opts.i18n || { t: (k) => k };
    this._hostEl = opts.hostEl || document.body;
    this._backdrop = null;
    this._modal = null;
    this._htmlArea = null;
    this._cssArea = null;
    this._onKeyDown = null;
    this._destroyed = false;
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  /**
   * Open the source view modal, populated with current content.
   */
  open() {
    if (this._modal) return;
    this._build();
    this._populate();
    this._show();
  }
  /**
   * Close and remove the modal.
   */
  close() {
    this._teardown();
  }
  destroy() {
    this._destroyed = true;
    this._teardown();
  }
  // ─── Build ────────────────────────────────────────────────────────────────────
  _build() {
    const t = this._i18n.t.bind(this._i18n);
    const backdrop = document.createElement("div");
    backdrop.className = "npe-modal-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) this.close();
    });
    const modal = document.createElement("div");
    modal.className = "npe-modal npe-source-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "npe-source-title");
    modal.addEventListener("click", (e) => e.stopPropagation());
    const header = document.createElement("div");
    header.className = "npe-modal-header";
    const title = document.createElement("h2");
    title.id = "npe-source-title";
    title.className = "npe-modal-title";
    title.textContent = t("modal.source.title");
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "npe-modal-close";
    closeBtn.setAttribute("aria-label", t("modal.source.cancel"));
    closeBtn.textContent = "\xD7";
    closeBtn.addEventListener("click", () => this.close());
    header.appendChild(title);
    header.appendChild(closeBtn);
    const tabBar = document.createElement("div");
    tabBar.className = "npe-modal-tabs";
    const htmlTab = this._makeTab(t("modal.source.html"), "html", true);
    const cssTab = this._makeTab(t("modal.source.css"), "css", false);
    tabBar.appendChild(htmlTab.btn);
    tabBar.appendChild(cssTab.btn);
    const htmlPanel = document.createElement("div");
    htmlPanel.className = "npe-modal-panel npe-source-panel";
    htmlPanel.id = "npe-source-panel-html";
    const htmlArea = document.createElement("textarea");
    htmlArea.className = "npe-source-textarea";
    htmlArea.setAttribute("aria-label", t("modal.source.html"));
    htmlArea.setAttribute("spellcheck", "false");
    htmlArea.setAttribute("autocomplete", "off");
    htmlPanel.appendChild(htmlArea);
    this._htmlArea = htmlArea;
    const cssPanel = document.createElement("div");
    cssPanel.className = "npe-modal-panel npe-source-panel";
    cssPanel.id = "npe-source-panel-css";
    cssPanel.setAttribute("hidden", "");
    const cssArea = document.createElement("textarea");
    cssArea.className = "npe-source-textarea";
    cssArea.setAttribute("aria-label", t("modal.source.css"));
    cssArea.setAttribute("spellcheck", "false");
    cssArea.setAttribute("autocomplete", "off");
    cssPanel.appendChild(cssArea);
    this._cssArea = cssArea;
    htmlTab.btn.addEventListener("click", () => {
      htmlTab.btn.classList.add("npe-tab-active");
      cssTab.btn.classList.remove("npe-tab-active");
      htmlPanel.removeAttribute("hidden");
      cssPanel.setAttribute("hidden", "");
    });
    cssTab.btn.addEventListener("click", () => {
      cssTab.btn.classList.add("npe-tab-active");
      htmlTab.btn.classList.remove("npe-tab-active");
      cssPanel.removeAttribute("hidden");
      htmlPanel.setAttribute("hidden", "");
    });
    const footer = document.createElement("div");
    footer.className = "npe-modal-footer";
    const applyBtn = document.createElement("button");
    applyBtn.type = "button";
    applyBtn.className = "npe-btn npe-btn-primary";
    applyBtn.textContent = t("modal.source.apply");
    applyBtn.addEventListener("click", () => this._apply());
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "npe-btn";
    cancelBtn.textContent = t("modal.source.cancel");
    cancelBtn.addEventListener("click", () => this.close());
    footer.appendChild(cancelBtn);
    footer.appendChild(applyBtn);
    modal.appendChild(header);
    modal.appendChild(tabBar);
    modal.appendChild(htmlPanel);
    modal.appendChild(cssPanel);
    modal.appendChild(footer);
    this._backdrop = backdrop;
    this._modal = modal;
  }
  /**
   * @param {string} label
   * @param {string} id
   * @param {boolean} active
   * @returns {{ btn: HTMLButtonElement }}
   */
  _makeTab(label, id, active) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "npe-tab" + (active ? " npe-tab-active" : "");
    btn.textContent = label;
    btn.dataset.tab = id;
    return { btn };
  }
  _populate() {
    if (this._htmlArea && this._serializer) {
      this._htmlArea.value = this._serializer.getContent();
    }
    if (this._cssArea && this._styleManager) {
      this._cssArea.value = this._styleManager.getStyles();
    }
  }
  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._htmlArea) {
      this._htmlArea.focus();
    }
    this._onKeyDown = (e) => this._handleKey(e);
    document.addEventListener("keydown", this._onKeyDown);
  }
  _handleKey(e) {
    if (e.key === "Escape") {
      this.close();
      return;
    }
    if (e.key === "Tab" && this._modal) {
      const focusable = Array.from(
        this._modal.querySelectorAll('button, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }
  // ─── Apply ────────────────────────────────────────────────────────────────────
  /**
   * Apply edited HTML and CSS, sanitizing HTML before writing.
   */
  _apply() {
    if (this._cssArea && this._styleManager) {
      this._styleManager.setStyles(this._cssArea.value);
    }
    if (this._htmlArea && this._serializer) {
      const raw = this._htmlArea.value;
      const safe = this._sanitizer ? this._sanitizer.sanitize(raw) : raw;
      this._serializer.setContent(safe);
    }
    this.close();
  }
  // ─── Teardown ─────────────────────────────────────────────────────────────────
  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop = null;
    this._modal = null;
    this._htmlArea = null;
    this._cssArea = null;
  }
};

// src/modals/modals/FindReplaceModal.js
var FindReplaceModal = class {
  /**
   * @param {object} opts
   * @param {import('../canvas/CanvasManager').CanvasManager} opts.canvasManager
   * @param {import('../../i18n/i18n').I18nInstance} opts.i18n
   * @param {HTMLElement} opts.hostEl
   */
  constructor(opts = {}) {
    this._canvas = opts.canvasManager || null;
    this._i18n = opts.i18n || { t: (k) => k };
    this._hostEl = opts.hostEl || document.body;
    this._backdrop = null;
    this._modal = null;
    this._findInput = null;
    this._replaceInput = null;
    this._caseSensitiveCheck = null;
    this._regexCheck = null;
    this._matches = [];
    this._currentMatch = -1;
    this._MARK_CLASS = "npe-fr-highlight";
    this._onKeyDown = null;
    this._destroyed = false;
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  open() {
    if (this._modal) return;
    this._build();
    this._show();
  }
  close() {
    this._clearHighlights();
    this._teardown();
  }
  destroy() {
    this._destroyed = true;
    this.close();
  }
  // ─── Build ────────────────────────────────────────────────────────────────────
  _build() {
    const t = this._i18n.t.bind(this._i18n);
    const backdrop = document.createElement("div");
    backdrop.className = "npe-modal-backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) this.close();
    });
    const modal = document.createElement("div");
    modal.className = "npe-modal npe-find-replace-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "npe-fr-title");
    modal.addEventListener("click", (e) => e.stopPropagation());
    const header = document.createElement("div");
    header.className = "npe-modal-header";
    const title = document.createElement("h2");
    title.id = "npe-fr-title";
    title.className = "npe-modal-title";
    title.textContent = t("modal.findReplace.title");
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "npe-modal-close";
    closeBtn.setAttribute("aria-label", t("modal.findReplace.close"));
    closeBtn.textContent = "\xD7";
    closeBtn.addEventListener("click", () => this.close());
    header.appendChild(title);
    header.appendChild(closeBtn);
    const body = document.createElement("div");
    body.className = "npe-modal-body";
    const findLabel = document.createElement("label");
    findLabel.className = "npe-form-label";
    findLabel.setAttribute("for", "npe-fr-find");
    findLabel.textContent = t("modal.findReplace.find");
    const findInput = document.createElement("input");
    findInput.type = "text";
    findInput.id = "npe-fr-find";
    findInput.className = "npe-form-input";
    findInput.setAttribute("autocomplete", "off");
    findInput.setAttribute("spellcheck", "false");
    findInput.addEventListener("input", () => this._runSearch());
    this._findInput = findInput;
    const replaceLabel = document.createElement("label");
    replaceLabel.className = "npe-form-label";
    replaceLabel.setAttribute("for", "npe-fr-replace");
    replaceLabel.textContent = t("modal.findReplace.replace");
    const replaceInput = document.createElement("input");
    replaceInput.type = "text";
    replaceInput.id = "npe-fr-replace";
    replaceInput.className = "npe-form-input";
    replaceInput.setAttribute("autocomplete", "off");
    this._replaceInput = replaceInput;
    const optionsRow = document.createElement("div");
    optionsRow.className = "npe-fr-options";
    const { check: caseCheck, label: caseLabel } = this._makeCheckbox(
      "npe-fr-case",
      t("modal.findReplace.caseSensitive")
    );
    caseCheck.addEventListener("change", () => this._runSearch());
    this._caseSensitiveCheck = caseCheck;
    const { check: regexCheck, label: regexLabel } = this._makeCheckbox(
      "npe-fr-regex",
      t("modal.findReplace.useRegex")
    );
    regexCheck.addEventListener("change", () => this._runSearch());
    this._regexCheck = regexCheck;
    optionsRow.appendChild(caseLabel);
    optionsRow.appendChild(regexLabel);
    body.appendChild(findLabel);
    body.appendChild(findInput);
    body.appendChild(replaceLabel);
    body.appendChild(replaceInput);
    body.appendChild(optionsRow);
    const footer = document.createElement("div");
    footer.className = "npe-modal-footer";
    const findNextBtn = document.createElement("button");
    findNextBtn.type = "button";
    findNextBtn.className = "npe-btn";
    findNextBtn.textContent = t("modal.findReplace.findNext");
    findNextBtn.addEventListener("click", () => this._findNext());
    const replaceBtn = document.createElement("button");
    replaceBtn.type = "button";
    replaceBtn.className = "npe-btn";
    replaceBtn.textContent = t("modal.findReplace.replaceOne");
    replaceBtn.addEventListener("click", () => this._replaceCurrent());
    const replaceAllBtn = document.createElement("button");
    replaceAllBtn.type = "button";
    replaceAllBtn.className = "npe-btn npe-btn-primary";
    replaceAllBtn.textContent = t("modal.findReplace.replaceAll");
    replaceAllBtn.addEventListener("click", () => this._replaceAll());
    const closeFooterBtn = document.createElement("button");
    closeFooterBtn.type = "button";
    closeFooterBtn.className = "npe-btn";
    closeFooterBtn.textContent = t("modal.findReplace.close");
    closeFooterBtn.addEventListener("click", () => this.close());
    footer.appendChild(findNextBtn);
    footer.appendChild(replaceBtn);
    footer.appendChild(replaceAllBtn);
    footer.appendChild(closeFooterBtn);
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    this._backdrop = backdrop;
    this._modal = modal;
  }
  /**
   * @param {string} id
   * @param {string} labelText
   * @returns {{ check: HTMLInputElement, label: HTMLLabelElement }}
   */
  _makeCheckbox(id, labelText) {
    const check = document.createElement("input");
    check.type = "checkbox";
    check.id = id;
    check.className = "npe-form-checkbox";
    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.className = "npe-form-check-label";
    label.appendChild(check);
    label.appendChild(document.createTextNode(" " + labelText));
    return { check, label };
  }
  _show() {
    this._backdrop.appendChild(this._modal);
    this._hostEl.appendChild(this._backdrop);
    if (this._findInput) this._findInput.focus();
    this._onKeyDown = (e) => this._handleKey(e);
    document.addEventListener("keydown", this._onKeyDown);
  }
  _handleKey(e) {
    if (e.key === "Escape") {
      this.close();
      return;
    }
    if (e.key === "Enter" && document.activeElement === this._findInput) {
      e.preventDefault();
      this._findNext();
      return;
    }
    if (e.key === "Tab" && this._modal) {
      const focusable = Array.from(
        this._modal.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }
  // ─── Search engine ────────────────────────────────────────────────────────────
  /**
   * Build a RegExp from the find input value.
   * @returns {RegExp|null}
   */
  _buildPattern() {
    const query = this._findInput ? this._findInput.value : "";
    if (!query) return null;
    const flags = this._caseSensitiveCheck && this._caseSensitiveCheck.checked ? "g" : "gi";
    const useRegex = this._regexCheck && this._regexCheck.checked;
    try {
      const pattern = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(pattern, flags);
    } catch (e) {
      return null;
    }
  }
  /**
   * Collect all text-node matches in the iframe body.
   * Clears previous highlights first.
   */
  _runSearch() {
    this._clearHighlights();
    this._matches = [];
    this._currentMatch = -1;
    const re = this._buildPattern();
    if (!re) return;
    const body = this._getBody();
    if (!body) return;
    const walker = document.createTreeWalker ? this._createWalker(body) : null;
    if (!walker) return;
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent || "";
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text)) !== null) {
        this._matches.push({ node, index: m.index, length: m[0].length });
      }
    }
  }
  /**
   * Create a TreeWalker over text nodes inside the given root,
   * using the iframe document's createTreeWalker if available.
   * @param {Element} root
   * @returns {TreeWalker|null}
   */
  _createWalker(root) {
    try {
      const doc = this._getIframeDoc();
      if (!doc) return null;
      return doc.createTreeWalker(root, 4, null);
    } catch (e) {
      return null;
    }
  }
  // ─── Find Next ────────────────────────────────────────────────────────────────
  _findNext() {
    this._runSearch();
    if (this._matches.length === 0) return;
    this._currentMatch = (this._currentMatch + 1) % this._matches.length;
    this._highlightMatch(this._currentMatch);
  }
  // ─── Replace ──────────────────────────────────────────────────────────────────
  _replaceCurrent() {
    this._runSearch();
    if (this._matches.length === 0) return;
    if (this._currentMatch < 0) this._currentMatch = 0;
    const replaceWith = this._replaceInput ? this._replaceInput.value : "";
    const match = this._matches[this._currentMatch];
    if (!match) return;
    this._replaceMatchInNode(match, replaceWith);
    this._runSearch();
    if (this._matches.length > 0) {
      this._currentMatch = Math.min(this._currentMatch, this._matches.length - 1);
      this._highlightMatch(this._currentMatch);
    }
  }
  _replaceAll() {
    this._runSearch();
    if (this._matches.length === 0) return;
    const replaceWith = this._replaceInput ? this._replaceInput.value : "";
    const re = this._buildPattern();
    if (!re) return;
    const body = this._getBody();
    if (!body) return;
    const textNodes = Array.from(new Set(this._matches.map((m) => m.node)));
    for (const node of textNodes) {
      const text = node.textContent || "";
      re.lastIndex = 0;
      node.textContent = text.replace(re, replaceWith);
    }
    this._matches = [];
    this._currentMatch = -1;
  }
  // ─── Highlight helpers ────────────────────────────────────────────────────────
  /**
   * Highlight the match at the given index by scrolling to it and wrapping
   * the matched text range in a temporary <mark> element.
   * @param {number} idx
   */
  _highlightMatch(idx) {
    this._clearHighlights();
    const match = this._matches[idx];
    if (!match) return;
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      const node = match.node;
      const before = node.textContent.slice(0, match.index);
      const matched = node.textContent.slice(match.index, match.index + match.length);
      const after = node.textContent.slice(match.index + match.length);
      const mark = doc.createElement("mark");
      mark.className = this._MARK_CLASS;
      mark.textContent = matched;
      const parent = node.parentNode;
      if (!parent) return;
      const frag = doc.createDocumentFragment();
      if (before) frag.appendChild(doc.createTextNode(before));
      frag.appendChild(mark);
      if (after) frag.appendChild(doc.createTextNode(after));
      parent.replaceChild(frag, node);
      if (mark.scrollIntoView) {
        mark.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    } catch (e) {
    }
  }
  /**
   * Remove all highlight <mark> elements inserted by find.
   */
  _clearHighlights() {
    const body = this._getBody();
    if (!body) return;
    try {
      const marks = Array.from(body.querySelectorAll("." + this._MARK_CLASS));
      for (const mark of marks) {
        const parent = mark.parentNode;
        if (!parent) continue;
        const text = mark.textContent || "";
        parent.replaceChild(document.createTextNode(text), mark);
        try {
          parent.normalize();
        } catch (e) {
        }
      }
    } catch (e) {
    }
  }
  // ─── Replace in node ─────────────────────────────────────────────────────────
  /**
   * Replace one match occurrence directly in the text node.
   * @param {{ node: Text, index: number, length: number }} match
   * @param {string} replaceWith
   */
  _replaceMatchInNode(match, replaceWith) {
    try {
      const text = match.node.textContent || "";
      const newText = text.slice(0, match.index) + replaceWith + text.slice(match.index + match.length);
      match.node.textContent = newText;
    } catch (e) {
    }
  }
  // ─── DOM helpers ──────────────────────────────────────────────────────────────
  /** @returns {Document|null} */
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch (e) {
      return null;
    }
  }
  /** @returns {HTMLBodyElement|null} */
  _getBody() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getBody ? this._canvas.getBody() : null;
    } catch (e) {
      return null;
    }
  }
  // ─── Teardown ─────────────────────────────────────────────────────────────────
  _teardown() {
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._backdrop && this._backdrop.parentNode) {
      this._backdrop.parentNode.removeChild(this._backdrop);
    }
    this._backdrop = null;
    this._modal = null;
    this._findInput = null;
    this._replaceInput = null;
    this._caseSensitiveCheck = null;
    this._regexCheck = null;
  }
};

// src/overlays/TableContextMenu.js
var TableContextMenu = class {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.hostEl — editor shell element
   * @param {import('../i18n/i18n').I18nInstance} opts.i18n
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   * @param {import('../core/EventBus').EventBus} [opts.bus]
   */
  constructor(opts = {}) {
    this._hostEl = opts.hostEl || document.body;
    this._i18n = opts.i18n || { t: (k) => k };
    this._canvas = opts.canvasManager || null;
    this._bus = opts.bus || null;
    this._menu = null;
    this._targetCell = null;
    this._onDocClick = null;
    this._onKeyDown = null;
    this._destroyed = false;
    this._attachIframeListener();
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  /**
   * Show the context menu at the given host-document position for the given cell.
   * @param {{ x: number, y: number }} position — host-document coordinates
   * @param {HTMLTableCellElement} cell
   */
  show(position, cell) {
    this.hide();
    this._targetCell = cell;
    this._build(position, cell);
  }
  /**
   * Hide and remove the context menu.
   */
  hide() {
    this._removeMenu();
    this._targetCell = null;
  }
  /**
   * Attach or re-attach the canvas after construction.
   * @param {import('../canvas/CanvasManager').CanvasManager} canvasManager
   */
  attachCanvas(canvasManager) {
    this._canvas = canvasManager;
    this._attachIframeListener();
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this.hide();
    this._detachIframeListener();
  }
  // ─── Build ────────────────────────────────────────────────────────────────────
  _build(position, cell) {
    const t = this._i18n.t.bind(this._i18n);
    const menu = document.createElement("div");
    menu.className = "npe-context-menu";
    menu.setAttribute("role", "menu");
    const items = [
      { key: "table.insertRowAbove", action: () => this._insertRowAbove() },
      { key: "table.insertRowBelow", action: () => this._insertRowBelow() },
      { separator: true },
      { key: "table.insertColLeft", action: () => this._insertColLeft() },
      { key: "table.insertColRight", action: () => this._insertColRight() },
      { separator: true },
      { key: "table.deleteRow", action: () => this._deleteRow() },
      { key: "table.deleteColumn", action: () => this._deleteColumn() },
      { key: "table.deleteTable", action: () => this._deleteTable() },
      { separator: true },
      { key: "table.mergeCells", action: () => this._mergeCells() },
      { key: "table.splitCell", action: () => this._splitCell() }
    ];
    for (const item of items) {
      if (item.separator) {
        const sep = document.createElement("div");
        sep.className = "npe-context-menu-sep";
        menu.appendChild(sep);
        continue;
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "npe-context-menu-item";
      btn.setAttribute("role", "menuitem");
      btn.textContent = t(item.key);
      btn.addEventListener("click", () => {
        item.action();
        this.hide();
      });
      menu.appendChild(btn);
    }
    menu.style.position = "fixed";
    menu.style.zIndex = "10000";
    menu.style.left = position.x + "px";
    menu.style.top = position.y + "px";
    this._hostEl.appendChild(menu);
    this._menu = menu;
    requestAnimationFrame(() => {
      if (!menu.isConnected) return;
      const rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menu.style.left = Math.max(0, window.innerWidth - rect.width - 4) + "px";
      }
      if (rect.bottom > window.innerHeight) {
        menu.style.top = Math.max(0, window.innerHeight - rect.height - 4) + "px";
      }
    });
    this._onDocClick = (e) => {
      if (menu && !menu.contains(e.target)) {
        this.hide();
      }
    };
    this._onKeyDown = (e) => {
      if (e.key === "Escape") this.hide();
    };
    setTimeout(() => {
      document.addEventListener("click", this._onDocClick, { capture: true });
      document.addEventListener("keydown", this._onKeyDown);
    }, 0);
    const firstItem = menu.querySelector(".npe-context-menu-item");
    if (firstItem) firstItem.focus();
  }
  _removeMenu() {
    if (this._onDocClick) {
      document.removeEventListener("click", this._onDocClick, { capture: true });
      this._onDocClick = null;
    }
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._menu && this._menu.parentNode) {
      this._menu.parentNode.removeChild(this._menu);
    }
    this._menu = null;
  }
  // ─── Iframe listener ─────────────────────────────────────────────────────────
  _attachIframeListener() {
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      this._iframeContextHandler = (e) => {
        const cell = e.target && e.target.closest ? e.target.closest("td,th") : null;
        if (!cell) return;
        e.preventDefault();
        const iframe = this._canvas ? this._canvas.iframe : null;
        let x = e.clientX;
        let y = e.clientY;
        if (iframe) {
          const rect = iframe.getBoundingClientRect();
          x = rect.left + e.clientX;
          y = rect.top + e.clientY;
        }
        this.show({ x, y }, cell);
      };
      doc.addEventListener("contextmenu", this._iframeContextHandler);
    } catch (e) {
    }
  }
  _detachIframeListener() {
    const doc = this._getIframeDoc();
    if (!doc || !this._iframeContextHandler) return;
    try {
      doc.removeEventListener("contextmenu", this._iframeContextHandler);
    } catch (e) {
    }
    this._iframeContextHandler = null;
  }
  // ─── Table manipulation ──────────────────────────────────────────────────────
  _insertRowAbove() {
    const cell = this._targetCell;
    if (!cell) return;
    const row = cell.closest("tr");
    if (!row) return;
    const newRow = this._cloneEmptyRow(row);
    row.parentNode.insertBefore(newRow, row);
    this._notifyChange();
  }
  _insertRowBelow() {
    const cell = this._targetCell;
    if (!cell) return;
    const row = cell.closest("tr");
    if (!row) return;
    const newRow = this._cloneEmptyRow(row);
    if (row.nextSibling) {
      row.parentNode.insertBefore(newRow, row.nextSibling);
    } else {
      row.parentNode.appendChild(newRow);
    }
    this._notifyChange();
  }
  _insertColLeft() {
    const cell = this._targetCell;
    if (!cell) return;
    const table = cell.closest("table");
    if (!table) return;
    const colIndex = this._getCellColumnIndex(cell);
    this._insertColumnAt(table, colIndex);
    this._notifyChange();
  }
  _insertColRight() {
    const cell = this._targetCell;
    if (!cell) return;
    const table = cell.closest("table");
    if (!table) return;
    const colIndex = this._getCellColumnIndex(cell);
    this._insertColumnAt(table, colIndex + 1);
    this._notifyChange();
  }
  _deleteRow() {
    const cell = this._targetCell;
    if (!cell) return;
    const row = cell.closest("tr");
    if (!row) return;
    const tbody = row.parentNode;
    if (tbody.rows.length <= 1) return;
    tbody.removeChild(row);
    this._notifyChange();
  }
  _deleteColumn() {
    const cell = this._targetCell;
    if (!cell) return;
    const table = cell.closest("table");
    if (!table) return;
    const colIndex = this._getCellColumnIndex(cell);
    const rows = Array.from(table.querySelectorAll("tr"));
    for (const row of rows) {
      if (row.cells.length <= 1) continue;
      const c = row.cells[colIndex];
      if (c) row.removeChild(c);
    }
    this._notifyChange();
  }
  _deleteTable() {
    const cell = this._targetCell;
    if (!cell) return;
    const table = cell.closest("table");
    if (!table || !table.parentNode) return;
    table.parentNode.removeChild(table);
    this._notifyChange();
  }
  _mergeCells() {
    const cell = this._targetCell;
    if (!cell) return;
    const row = cell.closest("tr");
    if (!row) return;
    const colIndex = this._getCellColumnIndex(cell);
    const nextCell = row.cells[colIndex + 1];
    if (!nextCell) return;
    const currentSpan = parseInt(cell.getAttribute("colspan") || "1", 10);
    const nextSpan = parseInt(nextCell.getAttribute("colspan") || "1", 10);
    cell.setAttribute("colspan", String(currentSpan + nextSpan));
    while (nextCell.firstChild) cell.appendChild(nextCell.firstChild);
    row.removeChild(nextCell);
    this._notifyChange();
  }
  _splitCell() {
    const cell = this._targetCell;
    if (!cell) return;
    const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);
    if (colspan <= 1) return;
    const row = cell.closest("tr");
    const tag = cell.tagName.toLowerCase();
    const doc = this._getIframeDoc();
    if (!row || !doc) return;
    const ref = cell.nextSibling;
    for (let i = 1; i < colspan; i++) {
      const newCell = doc.createElement(tag);
      newCell.innerHTML = "<br>";
      row.insertBefore(newCell, ref);
    }
    cell.removeAttribute("colspan");
    this._notifyChange();
  }
  // ─── Helpers ─────────────────────────────────────────────────────────────────
  /**
   * Get the column index of a cell within its row.
   * @param {HTMLTableCellElement} cell
   * @returns {number}
   */
  _getCellColumnIndex(cell) {
    const row = cell.closest("tr");
    if (!row) return 0;
    return Array.prototype.indexOf.call(row.cells, cell);
  }
  /**
   * Clone a row structure with empty cells.
   * @param {HTMLTableRowElement} templateRow
   * @returns {HTMLTableRowElement}
   */
  _cloneEmptyRow(templateRow) {
    const doc = this._getIframeDoc() || document;
    const newRow = doc.createElement("tr");
    for (const cell of Array.from(templateRow.cells)) {
      const tag = cell.tagName.toLowerCase() === "th" ? "th" : "td";
      const newCell = doc.createElement(tag);
      newCell.innerHTML = "<br>";
      newRow.appendChild(newCell);
    }
    return newRow;
  }
  /**
   * Insert an empty column at the given index in every row.
   * @param {HTMLTableElement} table
   * @param {number} colIndex
   */
  _insertColumnAt(table, colIndex) {
    const doc = this._getIframeDoc() || document;
    const rows = Array.from(table.querySelectorAll("tr"));
    for (const row of rows) {
      const tag = row.closest("thead") ? "th" : "td";
      const newCell = doc.createElement(tag);
      newCell.innerHTML = "<br>";
      const ref = row.cells[colIndex] || null;
      row.insertBefore(newCell, ref);
    }
  }
  _notifyChange() {
    if (!this._bus) return;
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      this._bus.emit("content:change", { html: body.innerHTML });
    }
  }
  /** @returns {Document|null} */
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch (e) {
      return null;
    }
  }
};

// src/overlays/TableResize.js
var MIN_COL_WIDTH = 40;
var TableResize = class {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.hostEl
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   * @param {import('../core/EventBus').EventBus} [opts.bus]
   */
  constructor(opts = {}) {
    this._hostEl = opts.hostEl || document.body;
    this._canvas = opts.canvasManager || null;
    this._bus = opts.bus || null;
    this._handle = null;
    this._dragging = false;
    this._startX = 0;
    this._startWidth = 0;
    this._resizeCell = null;
    this._destroyed = false;
    this._onMouseMove = null;
    this._onMouseUp = null;
    this._iframeMouseMove = null;
    this._iframeMouseLeave = null;
    this._createHandle();
    this._attachIframeListeners();
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  /**
   * Attach or re-attach to a canvas manager.
   * @param {import('../canvas/CanvasManager').CanvasManager} canvasManager
   */
  attachCanvas(canvasManager) {
    this._detachIframeListeners();
    this._canvas = canvasManager;
    this._attachIframeListeners();
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._detachIframeListeners();
    this._removeHandle();
  }
  // ─── Handle DOM ──────────────────────────────────────────────────────────────
  _createHandle() {
    const handle = document.createElement("div");
    handle.className = "npe-col-resize-handle";
    handle.style.position = "fixed";
    handle.style.width = "6px";
    handle.style.cursor = "col-resize";
    handle.style.zIndex = "10001";
    handle.style.display = "none";
    handle.style.top = "0";
    handle.style.height = "0";
    this._hostEl.appendChild(handle);
    this._handle = handle;
    handle.addEventListener("mousedown", (e) => this._startDrag(e));
  }
  _removeHandle() {
    if (this._handle && this._handle.parentNode) {
      this._handle.parentNode.removeChild(this._handle);
    }
    this._handle = null;
  }
  // ─── Iframe listeners ─────────────────────────────────────────────────────────
  _attachIframeListeners() {
    const doc = this._getIframeDoc();
    if (!doc) return;
    this._iframeMouseMove = (e) => this._onIframeMouseMove(e);
    this._iframeMouseLeave = () => this._hideHandle();
    try {
      doc.addEventListener("mousemove", this._iframeMouseMove);
      doc.addEventListener("mouseleave", this._iframeMouseLeave);
    } catch (e) {
    }
  }
  _detachIframeListeners() {
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      if (this._iframeMouseMove) doc.removeEventListener("mousemove", this._iframeMouseMove);
      if (this._iframeMouseLeave) doc.removeEventListener("mouseleave", this._iframeMouseLeave);
    } catch (e) {
    }
    this._iframeMouseMove = null;
    this._iframeMouseLeave = null;
  }
  // ─── Mouse move inside iframe: show handle near column borders ───────────────
  /**
   * @param {MouseEvent} e — event from the iframe document
   */
  _onIframeMouseMove(e) {
    if (this._dragging) return;
    const target = e.target;
    if (!target || !target.closest) {
      this._hideHandle();
      return;
    }
    const cell = target.closest("td, th");
    if (!cell) {
      this._hideHandle();
      return;
    }
    const iframeRect = this._getIframeRect();
    if (!iframeRect) {
      this._hideHandle();
      return;
    }
    const cellRect = cell.getBoundingClientRect();
    const hostLeft = iframeRect.left + cellRect.left;
    const hostTop = iframeRect.top + cellRect.top;
    const hostRight = hostLeft + cellRect.width;
    const mouseHostX = iframeRect.left + e.clientX;
    const THRESHOLD = 6;
    if (mouseHostX >= hostRight - THRESHOLD && mouseHostX <= hostRight + THRESHOLD) {
      this._showHandle(hostRight - 3, hostTop, cellRect.height, cell);
    } else {
      this._hideHandle();
    }
  }
  _showHandle(x, y, height, cell) {
    if (!this._handle) return;
    this._handle.style.display = "block";
    this._handle.style.left = x + "px";
    this._handle.style.top = y + "px";
    this._handle.style.height = height + "px";
    this._resizeCell = cell;
  }
  _hideHandle() {
    if (this._handle) {
      this._handle.style.display = "none";
    }
    if (!this._dragging) {
      this._resizeCell = null;
    }
  }
  // ─── Drag ─────────────────────────────────────────────────────────────────────
  /**
   * @param {MouseEvent} e
   */
  _startDrag(e) {
    if (!this._resizeCell) return;
    e.preventDefault();
    this._dragging = true;
    this._startX = e.clientX;
    this._startWidth = this._resizeCell.offsetWidth;
    this._onMouseMove = (ev) => this._doDrag(ev);
    this._onMouseUp = (ev) => this._endDrag(ev);
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("mouseup", this._onMouseUp);
  }
  /**
   * @param {MouseEvent} e
   */
  _doDrag(e) {
    if (!this._dragging || !this._resizeCell) return;
    const delta = e.clientX - this._startX;
    const newWidth = Math.max(MIN_COL_WIDTH, this._startWidth + delta);
    this._resizeCell.style.width = newWidth + "px";
    if (this._handle && this._resizeCell) {
      const iframeRect = this._getIframeRect();
      if (iframeRect) {
        const cellRect = this._resizeCell.getBoundingClientRect();
        const hostRight = iframeRect.left + cellRect.left + cellRect.width;
        this._handle.style.left = hostRight - 3 + "px";
      }
    }
  }
  /**
   * @param {MouseEvent} e
   */
  _endDrag(e) {
    this._dragging = false;
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mouseup", this._onMouseUp);
    this._onMouseMove = null;
    this._onMouseUp = null;
    this._notifyChange();
  }
  // ─── Helpers ─────────────────────────────────────────────────────────────────
  _notifyChange() {
    if (!this._bus) return;
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      this._bus.emit("content:change", { html: body.innerHTML });
    }
  }
  /** @returns {DOMRect|null} */
  _getIframeRect() {
    if (!this._canvas || !this._canvas.iframe) return null;
    try {
      return this._canvas.iframe.getBoundingClientRect();
    } catch (e) {
      return null;
    }
  }
  /** @returns {Document|null} */
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch (e) {
      return null;
    }
  }
};

// src/overlays/ImageResize.js
var HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
var MIN_SIZE2 = 20;
var ImageResize = class {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.hostEl
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   * @param {import('../core/EventBus').EventBus} [opts.bus]
   * @param {import('../i18n/i18n').I18nInstance} [opts.i18n]
   */
  constructor(opts = {}) {
    this._hostEl = opts.hostEl || document.body;
    this._canvas = opts.canvasManager || null;
    this._bus = opts.bus || null;
    this._i18n = opts.i18n || { t: (k) => k };
    this._selectedEl = null;
    this._border = null;
    this._handles = [];
    this._sizeLabel = null;
    this._toolbar = null;
    this._dragging = false;
    this._dragHandle = "";
    this._dragStartX = 0;
    this._dragStartY = 0;
    this._startW = 0;
    this._startH = 0;
    this._startLeft = 0;
    this._startTop = 0;
    this._aspectRatio = 1;
    this._dragCover = null;
    this._onMouseMove = null;
    this._onMouseUp = null;
    this._onIframeClick = null;
    this._onIframeScroll = null;
    this._onDocClick = null;
    this._onWindowResize = null;
    this._destroyed = false;
    this._createOverlayElements();
    this._attachIframeListeners();
    this._onWindowResize = () => this._updatePosition();
    window.addEventListener("resize", this._onWindowResize);
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  /**
   * Attach or re-attach to a canvas manager.
   * @param {import('../canvas/CanvasManager').CanvasManager} canvasManager
   */
  attachCanvas(canvasManager) {
    this._detachIframeListeners();
    this._canvas = canvasManager;
    this._attachIframeListeners();
  }
  /**
   * Programmatically select an image/video element.
   * @param {HTMLElement} el
   */
  select(el) {
    this._selectElement(el);
  }
  /**
   * Deselect and hide all overlays.
   */
  deselect() {
    this._deselectElement();
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    if (this._dragCover && this._dragCover.parentNode) {
      this._dragCover.parentNode.removeChild(this._dragCover);
      this._dragCover = null;
    }
    if (this._onMouseMove) {
      document.removeEventListener("mousemove", this._onMouseMove);
      this._onMouseMove = null;
    }
    if (this._onMouseUp) {
      document.removeEventListener("mouseup", this._onMouseUp);
      this._onMouseUp = null;
    }
    this._deselectElement();
    this._detachIframeListeners();
    if (this._onWindowResize) {
      window.removeEventListener("resize", this._onWindowResize);
      this._onWindowResize = null;
    }
    this._removeAllOverlayElements();
  }
  // ─── Overlay DOM creation ─────────────────────────────────────────────────────
  _createOverlayElements() {
    const border = document.createElement("div");
    border.className = "npe-img-select-border";
    border.style.display = "none";
    this._hostEl.appendChild(border);
    this._border = border;
    for (const pos of HANDLES) {
      const handle = document.createElement("div");
      handle.className = `npe-img-resize-handle npe-img-handle-${pos}`;
      handle.setAttribute("data-pos", pos);
      handle.style.display = "none";
      this._hostEl.appendChild(handle);
      this._handles.push(handle);
      handle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._startResize(e, pos);
      });
    }
    const label = document.createElement("div");
    label.className = "npe-img-size-label";
    label.style.display = "none";
    this._hostEl.appendChild(label);
    this._sizeLabel = label;
    const tb = document.createElement("div");
    tb.className = "npe-img-toolbar";
    tb.style.display = "none";
    tb.setAttribute("aria-label", this._i18n.t("overlay.media.toolbar"));
    const dragBtn = document.createElement("div");
    dragBtn.className = "npe-img-toolbar-btn npe-img-drag-handle";
    dragBtn.title = this._i18n.t("overlay.media.drag");
    dragBtn.setAttribute("aria-label", this._i18n.t("overlay.media.drag"));
    dragBtn.innerHTML = "\u283F";
    dragBtn.addEventListener("mousedown", (e) => this._startDragMove(e));
    const replaceBtn = document.createElement("button");
    replaceBtn.type = "button";
    replaceBtn.className = "npe-img-toolbar-btn";
    replaceBtn.title = this._i18n.t("overlay.media.replace");
    replaceBtn.setAttribute("aria-label", this._i18n.t("overlay.media.replace"));
    replaceBtn.innerHTML = "\u21BA";
    replaceBtn.addEventListener("click", () => this._replaceMedia());
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "npe-img-toolbar-btn npe-img-delete-btn";
    deleteBtn.title = this._i18n.t("overlay.media.delete");
    deleteBtn.setAttribute("aria-label", this._i18n.t("overlay.media.delete"));
    deleteBtn.innerHTML = "\u2715";
    deleteBtn.addEventListener("click", () => this._deleteMedia());
    tb.appendChild(dragBtn);
    tb.appendChild(replaceBtn);
    tb.appendChild(deleteBtn);
    this._hostEl.appendChild(tb);
    this._toolbar = tb;
  }
  _removeAllOverlayElements() {
    const toRemove = [this._border, this._sizeLabel, this._toolbar, ...this._handles];
    for (const el of toRemove) {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }
    this._border = null;
    this._sizeLabel = null;
    this._toolbar = null;
    this._handles = [];
  }
  // ─── Iframe event listeners ───────────────────────────────────────────────────
  _attachIframeListeners() {
    const doc = this._getIframeDoc();
    if (!doc) return;
    this._onIframeClick = (e) => {
      const target = e.target;
      if (!target) return;
      if (target.tagName === "IMG" || target.tagName === "VIDEO") {
        e.preventDefault();
        this._selectElement(target);
      } else {
        this._deselectElement();
      }
    };
    this._onIframeScroll = () => this._updatePosition();
    try {
      doc.addEventListener("click", this._onIframeClick);
      doc.addEventListener("scroll", this._onIframeScroll, { capture: true });
    } catch (e) {
    }
    this._onDocScroll = () => this._updatePosition();
    document.addEventListener("scroll", this._onDocScroll, { capture: true, passive: true });
  }
  _detachIframeListeners() {
    const doc = this._getIframeDoc();
    if (doc) {
      try {
        if (this._onIframeClick) doc.removeEventListener("click", this._onIframeClick);
        if (this._onIframeScroll) doc.removeEventListener("scroll", this._onIframeScroll, { capture: true });
      } catch (e) {
      }
    }
    if (this._onDocScroll) {
      document.removeEventListener("scroll", this._onDocScroll, { capture: true });
    }
    this._onIframeClick = null;
    this._onIframeScroll = null;
    this._onDocScroll = null;
  }
  // ─── Element selection ────────────────────────────────────────────────────────
  /**
   * @param {HTMLElement} el — img or video in the iframe
   */
  _selectElement(el) {
    this._selectedEl = el;
    this._showOverlays();
    this._updatePosition();
    if (!this._onDocClick) {
      this._onDocClick = (e) => {
        const allOverlay = [this._border, this._toolbar, ...this._handles];
        if (allOverlay.some((o) => o && o.contains(e.target))) return;
        this._deselectElement();
      };
      setTimeout(() => {
        document.addEventListener("click", this._onDocClick, { capture: true });
      }, 0);
    }
  }
  _deselectElement() {
    this._selectedEl = null;
    this._hideOverlays();
    if (this._onDocClick) {
      document.removeEventListener("click", this._onDocClick, { capture: true });
      this._onDocClick = null;
    }
  }
  // ─── Show / hide overlays ────────────────────────────────────────────────────
  _showOverlays() {
    if (this._border) this._border.style.display = "block";
    if (this._toolbar) this._toolbar.style.display = "flex";
    for (const h of this._handles) h.style.display = "block";
  }
  _hideOverlays() {
    if (this._border) this._border.style.display = "none";
    if (this._toolbar) this._toolbar.style.display = "none";
    if (this._sizeLabel) this._sizeLabel.style.display = "none";
    for (const h of this._handles) h.style.display = "none";
  }
  // ─── Position update (translates iframe element rect → host coords) ──────────
  _updatePosition() {
    if (!this._selectedEl || !this._border) return;
    const iframeRect = this._getIframeRect();
    if (!iframeRect) return;
    const doc = this._getIframeDoc();
    const scrollTop = doc ? doc.documentElement.scrollTop || doc.body.scrollTop || 0 : 0;
    const scrollLeft = doc ? doc.documentElement.scrollLeft || doc.body.scrollLeft || 0 : 0;
    let elRect;
    try {
      elRect = this._selectedEl.getBoundingClientRect();
    } catch (e) {
      return;
    }
    const top = iframeRect.top + elRect.top - scrollTop;
    const left = iframeRect.left + elRect.left - scrollLeft;
    const width = elRect.width;
    const height = elRect.height;
    _positionEl(this._border, left, top, width, height);
    this._positionHandles(left, top, width, height);
    if (this._toolbar) {
      const tbRect = this._toolbar.getBoundingClientRect();
      const tbLeft = left + width / 2 - tbRect.width / 2;
      this._toolbar.style.left = Math.max(4, tbLeft) + "px";
      this._toolbar.style.top = top - tbRect.height - 6 + "px";
    }
  }
  /**
   * Place the 8 handles at corners and edge midpoints.
   */
  _positionHandles(left, top, width, height) {
    const hSize = 8;
    const half = hSize / 2;
    const positions = {
      nw: { x: left - half, y: top - half },
      n: { x: left + width / 2 - half, y: top - half },
      ne: { x: left + width - half, y: top - half },
      e: { x: left + width - half, y: top + height / 2 - half },
      se: { x: left + width - half, y: top + height - half },
      s: { x: left + width / 2 - half, y: top + height - half },
      sw: { x: left - half, y: top + height - half },
      w: { x: left - half, y: top + height / 2 - half }
    };
    for (const h of this._handles) {
      const pos = h.getAttribute("data-pos");
      const p = positions[pos];
      if (!p) continue;
      h.style.left = p.x + "px";
      h.style.top = p.y + "px";
    }
  }
  // ─── Resize drag ─────────────────────────────────────────────────────────────
  /**
   * @param {MouseEvent} e
   * @param {string} handlePos
   */
  _startResize(e, handlePos) {
    if (!this._selectedEl) return;
    const el = this._selectedEl;
    this._dragging = true;
    this._dragHandle = handlePos;
    this._dragStartX = e.clientX;
    this._dragStartY = e.clientY;
    this._startW = el.offsetWidth || el.naturalWidth || 100;
    this._startH = el.offsetHeight || el.naturalHeight || 100;
    this._aspectRatio = this._startH > 0 ? this._startW / this._startH : 1;
    this._showSizeLabel(this._startW, this._startH);
    this._dragCover = document.createElement("div");
    this._dragCover.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:99999",
      "cursor:" + _handleCursor(handlePos)
    ].join(";");
    document.body.appendChild(this._dragCover);
    this._onMouseMove = (ev) => this._doResize(ev);
    this._onMouseUp = (ev) => this._endResize(ev);
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("mouseup", this._onMouseUp);
  }
  /**
   * @param {MouseEvent} e
   */
  _doResize(e) {
    if (!this._dragging || !this._selectedEl) return;
    const dx = e.clientX - this._dragStartX;
    const dy = e.clientY - this._dragStartY;
    const pos = this._dragHandle;
    let newW = this._startW;
    let newH = this._startH;
    if (pos.includes("e")) newW = this._startW + dx;
    if (pos.includes("w")) newW = this._startW - dx;
    if (pos.includes("s")) newH = this._startH + dy;
    if (pos.includes("n")) newH = this._startH - dy;
    newW = Math.max(MIN_SIZE2, newW);
    newH = Math.max(MIN_SIZE2, newH);
    const lockAspect = !e.shiftKey;
    if (lockAspect && this._aspectRatio > 0) {
      if (pos === "n" || pos === "s") {
        newW = newH * this._aspectRatio;
      } else if (pos === "e" || pos === "w") {
        newH = newW / this._aspectRatio;
      } else {
        if (Math.abs(dx) >= Math.abs(dy)) {
          newH = newW / this._aspectRatio;
        } else {
          newW = newH * this._aspectRatio;
        }
      }
    }
    newW = Math.round(Math.max(MIN_SIZE2, newW));
    newH = Math.round(Math.max(MIN_SIZE2, newH));
    try {
      this._selectedEl.style.width = newW + "px";
      this._selectedEl.style.height = newH + "px";
    } catch (e2) {
    }
    this._updatePosition();
    this._showSizeLabel(newW, newH);
  }
  /**
   * @param {MouseEvent} e
   */
  _endResize(e) {
    this._dragging = false;
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mouseup", this._onMouseUp);
    this._onMouseMove = null;
    this._onMouseUp = null;
    if (this._dragCover) {
      if (this._dragCover.parentNode) this._dragCover.parentNode.removeChild(this._dragCover);
      this._dragCover = null;
    }
    if (this._sizeLabel) this._sizeLabel.style.display = "none";
    this._updatePosition();
    this._notifyChange();
  }
  // ─── Drag-move (translate element to new position) ───────────────────────────
  /**
   * @param {MouseEvent} e — mousedown on the drag handle
   */
  _startDragMove(e) {
    if (!this._selectedEl) return;
    e.preventDefault();
    e.stopPropagation();
    const el = this._selectedEl;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = parseInt(el.style.marginLeft || "0", 10);
    const startTop = parseInt(el.style.marginTop || "0", 10);
    const cover = document.createElement("div");
    cover.style.cssText = "position:fixed;inset:0;z-index:99999;cursor:grab;";
    document.body.appendChild(cover);
    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      try {
        el.style.marginLeft = startLeft + dx + "px";
        el.style.marginTop = startTop + dy + "px";
      } catch (e2) {
      }
      this._updatePosition();
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (cover.parentNode) cover.parentNode.removeChild(cover);
      this._notifyChange();
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }
  // ─── Mini-toolbar actions ─────────────────────────────────────────────────────
  _replaceMedia() {
    if (!this._selectedEl || !this._bus) return;
    const tag = this._selectedEl.tagName.toLowerCase();
    this._bus.emit("overlay:replaceMedia", { element: this._selectedEl, type: tag });
  }
  _deleteMedia() {
    if (!this._selectedEl) return;
    const el = this._selectedEl;
    this._deselectElement();
    try {
      if (el.parentNode) el.parentNode.removeChild(el);
    } catch (e) {
    }
    this._notifyChange();
  }
  // ─── Size label ──────────────────────────────────────────────────────────────
  /**
   * @param {number} w
   * @param {number} h
   */
  _showSizeLabel(w, h) {
    if (!this._sizeLabel || !this._border) return;
    this._sizeLabel.textContent = `${w} \xD7 ${h}`;
    this._sizeLabel.style.display = "block";
    const borderRect = this._border.getBoundingClientRect();
    this._sizeLabel.style.left = borderRect.left + "px";
    this._sizeLabel.style.top = borderRect.bottom + 4 + "px";
  }
  // ─── Helpers ─────────────────────────────────────────────────────────────────
  _notifyChange() {
    if (!this._bus) return;
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      this._bus.emit("content:change", { html: body.innerHTML });
    }
  }
  /** @returns {DOMRect|null} */
  _getIframeRect() {
    if (!this._canvas || !this._canvas.iframe) return null;
    try {
      return this._canvas.iframe.getBoundingClientRect();
    } catch (e) {
      return null;
    }
  }
  /** @returns {Document|null} */
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch (e) {
      return null;
    }
  }
};
function _positionEl(el, left, top, width, height) {
  el.style.position = "fixed";
  el.style.left = left + "px";
  el.style.top = top + "px";
  el.style.width = width + "px";
  el.style.height = height + "px";
}
function _handleCursor(pos) {
  const map = {
    nw: "nw-resize",
    n: "n-resize",
    ne: "ne-resize",
    e: "e-resize",
    se: "se-resize",
    s: "s-resize",
    sw: "sw-resize",
    w: "w-resize"
  };
  return map[pos] || "default";
}

// src/overlays/FloatingToolbar.js
var SHOW_DELAY_MS = 400;
var FloatingToolbar = class {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.hostEl
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   * @param {import('../core/EventBus').EventBus} [opts.bus]
   * @param {import('../i18n/i18n').I18nInstance} [opts.i18n]
   */
  constructor(opts = {}) {
    this._hostEl = opts.hostEl || document.body;
    this._canvas = opts.canvasManager || null;
    this._bus = opts.bus || null;
    this._i18n = opts.i18n || { t: (k) => k };
    this._el = null;
    this._showTimer = null;
    this._visible = false;
    this._destroyed = false;
    this._onSelectionChange = null;
    this._onMouseDown = null;
    this._onDocClick = null;
    this._onKeyDown = null;
    this._buildEl();
    this._attachIframeListeners();
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  /**
   * Attach or re-attach to a canvas manager.
   * @param {import('../canvas/CanvasManager').CanvasManager} canvasManager
   */
  attachCanvas(canvasManager) {
    this._detachIframeListeners();
    this._canvas = canvasManager;
    this._attachIframeListeners();
  }
  /**
   * Show the toolbar at the top of the given selection rect.
   * @param {DOMRect} selectionRect — in host document coordinates
   */
  show(selectionRect) {
    if (!this._el || this._destroyed) return;
    this._visible = true;
    this._el.style.display = "flex";
    this._positionAboveRect(selectionRect);
  }
  /**
   * Hide the toolbar.
   */
  hide() {
    this._cancelShowTimer();
    if (!this._el) return;
    this._visible = false;
    this._el.style.display = "none";
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._cancelShowTimer();
    this._detachIframeListeners();
    if (this._onDocClick) {
      document.removeEventListener("click", this._onDocClick, { capture: true });
      this._onDocClick = null;
    }
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
  }
  // ─── Build DOM ───────────────────────────────────────────────────────────────
  _buildEl() {
    const t = (k) => this._i18n.t(k);
    const el = document.createElement("div");
    el.className = "npe-floating-toolbar";
    el.setAttribute("role", "toolbar");
    el.setAttribute("aria-label", t("floatingToolbar.label"));
    el.style.display = "none";
    const buttons = [
      { id: "moveUp", icon: '<svg viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>', title: t("floatingToolbar.moveBlockUp"), action: () => this._moveBlockUp() },
      { id: "moveDown", icon: '<svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>', title: t("floatingToolbar.moveBlockDown"), action: () => this._moveBlockDown() },
      { separator: true },
      { id: "bold", icon: '<svg viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>', title: t("toolbar.bold"), action: () => this._execCommand("bold") },
      { id: "italic", icon: '<svg viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>', title: t("toolbar.italic"), action: () => this._execCommand("italic") },
      { id: "underline", icon: '<svg viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>', title: t("toolbar.underline"), action: () => this._execCommand("underline") },
      { id: "link", icon: '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>', title: t("floatingToolbar.link"), action: () => this._insertLink() }
    ];
    for (const item of buttons) {
      if (item.separator) {
        const sep = document.createElement("span");
        sep.className = "npe-floating-toolbar-sep";
        el.appendChild(sep);
        continue;
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "npe-floating-toolbar-btn";
      btn.title = item.title;
      btn.setAttribute("aria-label", item.title);
      btn.innerHTML = item.icon;
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        item.action();
      });
      el.appendChild(btn);
    }
    this._hostEl.appendChild(el);
    this._el = el;
    this._onDocClick = (e) => {
      if (this._el && this._el.contains(e.target)) return;
      this.hide();
    };
    document.addEventListener("click", this._onDocClick, { capture: true });
    this._onKeyDown = (e) => {
      if (e.key === "Escape") this.hide();
    };
    document.addEventListener("keydown", this._onKeyDown);
  }
  // ─── Position ────────────────────────────────────────────────────────────────
  /**
   * Position the toolbar above the given rect.
   * @param {DOMRect} rect
   */
  _positionAboveRect(rect) {
    if (!this._el) return;
    this._el.style.visibility = "hidden";
    this._el.style.display = "flex";
    const tbRect = this._el.getBoundingClientRect();
    this._el.style.visibility = "";
    const gap = 6;
    let top = rect.top - tbRect.height - gap;
    let left = rect.left + rect.width / 2 - tbRect.width / 2;
    if (top < 4) top = rect.bottom + gap;
    if (left < 4) left = 4;
    if (left + tbRect.width > window.innerWidth - 4) {
      left = window.innerWidth - tbRect.width - 4;
    }
    this._el.style.left = left + "px";
    this._el.style.top = top + "px";
  }
  // ─── Iframe listeners ─────────────────────────────────────────────────────────
  _attachIframeListeners() {
    const doc = this._getIframeDoc();
    if (!doc) return;
    this._onSelectionChange = () => this._handleSelectionChange();
    this._onMouseDown = () => {
      this._cancelShowTimer();
      this.hide();
    };
    try {
      doc.addEventListener("selectionchange", this._onSelectionChange);
      doc.addEventListener("mousedown", this._onMouseDown);
    } catch (e) {
    }
  }
  _detachIframeListeners() {
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      if (this._onSelectionChange) doc.removeEventListener("selectionchange", this._onSelectionChange);
      if (this._onMouseDown) doc.removeEventListener("mousedown", this._onMouseDown);
    } catch (e) {
    }
    this._onSelectionChange = null;
    this._onMouseDown = null;
  }
  // ─── Selection handling ───────────────────────────────────────────────────────
  _handleSelectionChange() {
    this._cancelShowTimer();
    const sel = this._getIframeSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      this.hide();
      return;
    }
    this._showTimer = setTimeout(() => {
      this._showTimer = null;
      const selNow = this._getIframeSelection();
      if (!selNow || selNow.isCollapsed) {
        this.hide();
        return;
      }
      const rect = this._getSelectionHostRect(selNow);
      if (rect) this.show(rect);
    }, SHOW_DELAY_MS);
  }
  /**
   * Translate the iframe selection range bounding rect to host coordinates.
   * @param {Selection} sel
   * @returns {DOMRect|null}
   */
  _getSelectionHostRect(sel) {
    try {
      const range = sel.getRangeAt(0);
      const iframeSelRect = range.getBoundingClientRect();
      const iframeRect = this._getIframeRect();
      if (!iframeRect) return null;
      const doc = this._getIframeDoc();
      const scrollTop = doc ? doc.documentElement.scrollTop || doc.body.scrollTop || 0 : 0;
      const scrollLeft = doc ? doc.documentElement.scrollLeft || doc.body.scrollLeft || 0 : 0;
      return new DOMRect(
        iframeRect.left + iframeSelRect.left - scrollLeft,
        iframeRect.top + iframeSelRect.top - scrollTop,
        iframeSelRect.width,
        iframeSelRect.height
      );
    } catch (e) {
      return null;
    }
  }
  _cancelShowTimer() {
    if (this._showTimer !== null) {
      clearTimeout(this._showTimer);
      this._showTimer = null;
    }
  }
  // ─── Commands ────────────────────────────────────────────────────────────────
  /**
   * Execute a document.execCommand on the iframe.
   * @param {string} cmd
   */
  _execCommand(cmd) {
    const doc = this._getIframeDoc();
    if (!doc) return;
    try {
      doc.execCommand(cmd, false, null);
    } catch (e) {
    }
    this._notifyChange();
  }
  _insertLink() {
    if (this._bus) {
      this._bus.emit("toolbar:insert", "link");
    }
    this.hide();
  }
  /**
   * Move the block containing the current selection one position up.
   */
  _moveBlockUp() {
    const block = this._getAnchorBlock();
    if (!block) return;
    const prev = block.previousElementSibling;
    if (!prev) return;
    try {
      block.parentNode.insertBefore(block, prev);
    } catch (e) {
    }
    this._notifyChange();
    this.hide();
  }
  /**
   * Move the block containing the current selection one position down.
   */
  _moveBlockDown() {
    const block = this._getAnchorBlock();
    if (!block) return;
    const next = block.nextElementSibling;
    if (!next) return;
    try {
      block.parentNode.insertBefore(next, block);
    } catch (e) {
    }
    this._notifyChange();
    this.hide();
  }
  /**
   * Find the top-level block element inside the iframe body that contains the
   * current selection anchor.
   * @returns {Element|null}
   */
  _getAnchorBlock() {
    const doc = this._getIframeDoc();
    const body = this._canvas ? this._canvas.getBody() : null;
    if (!doc || !body) return null;
    const sel = this._getIframeSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node = sel.anchorNode;
    if (!node) return null;
    while (node && node.parentNode !== body) {
      node = node.parentNode;
    }
    return node && node !== body ? node : null;
  }
  // ─── Helpers ─────────────────────────────────────────────────────────────────
  _notifyChange() {
    if (!this._bus) return;
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      this._bus.emit("content:change", { html: body.innerHTML });
    }
  }
  /** @returns {Selection|null} */
  _getIframeSelection() {
    const doc = this._getIframeDoc();
    if (!doc) return null;
    try {
      return doc.getSelection ? doc.getSelection() : null;
    } catch (e) {
      return null;
    }
  }
  /** @returns {DOMRect|null} */
  _getIframeRect() {
    if (!this._canvas || !this._canvas.iframe) return null;
    try {
      return this._canvas.iframe.getBoundingClientRect();
    } catch (e) {
      return null;
    }
  }
  /** @returns {Document|null} */
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch (e) {
      return null;
    }
  }
};

// src/overlays/BlockDragDrop.js
var BlockDragDrop = class {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.hostEl
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   * @param {import('../core/EventBus').EventBus} [opts.bus]
   * @param {import('../core/Options').EditorOptions} [opts.options]
   */
  constructor(opts = {}) {
    this._hostEl = opts.hostEl || document.body;
    this._canvas = opts.canvasManager || null;
    this._bus = opts.bus || null;
    this._opts = opts.options || {};
    this._dragSrc = null;
    this._ghost = null;
    this._placeholder = null;
    this._dropTarget = null;
    this._dropBefore = true;
    this._fileDragCount = 0;
    this._onIframeDragStart = null;
    this._onIframeDragOver = null;
    this._onIframeDragEnd = null;
    this._onIframeElDragEnter = null;
    this._onIframeElDragOver = null;
    this._onIframeElDragLeave = null;
    this._onIframeElDrop = null;
    this._destroyed = false;
    this._attachListeners();
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  attachCanvas(canvasManager) {
    this._detachListeners();
    this._canvas = canvasManager;
    this._attachListeners();
  }
  attachOptions(options) {
    this._opts = options || {};
  }
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._cleanupBlockDrag();
    this._detachListeners();
    this._removeDraggableFromBlocks();
  }
  // ─── Attach / detach ─────────────────────────────────────────────────────────
  _attachListeners() {
    const iframeEl = this._canvas ? this._canvas.iframe : null;
    const doc = this._getIframeDoc();
    if (doc) {
      this._onIframeDragStart = (e) => this._handleBlockDragStart(e);
      this._onIframeDragOver = (e) => this._handleBlockDragOver(e);
      this._onIframeDragEnd = (e) => this._handleBlockDragEnd(e);
      try {
        doc.addEventListener("dragstart", this._onIframeDragStart);
        doc.addEventListener("dragover", this._onIframeDragOver);
        doc.addEventListener("dragend", this._onIframeDragEnd);
      } catch (e) {
      }
      this._addDraggableToBlocks();
    }
    if (iframeEl && typeof iframeEl.addEventListener === "function") {
      this._onIframeElDragEnter = (e) => this._handleFileDragEnter(e);
      this._onIframeElDragOver = (e) => this._handleFileDragOver(e);
      this._onIframeElDragLeave = (e) => this._handleFileDragLeave(e);
      this._onIframeElDrop = (e) => this._handleFileDrop(e);
      iframeEl.addEventListener("dragenter", this._onIframeElDragEnter);
      iframeEl.addEventListener("dragover", this._onIframeElDragOver);
      iframeEl.addEventListener("dragleave", this._onIframeElDragLeave);
      iframeEl.addEventListener("drop", this._onIframeElDrop);
    }
  }
  _detachListeners() {
    const iframeEl = this._canvas ? this._canvas.iframe : null;
    const doc = this._getIframeDoc();
    if (doc) {
      try {
        if (this._onIframeDragStart) doc.removeEventListener("dragstart", this._onIframeDragStart);
        if (this._onIframeDragOver) doc.removeEventListener("dragover", this._onIframeDragOver);
        if (this._onIframeDragEnd) doc.removeEventListener("dragend", this._onIframeDragEnd);
      } catch (e) {
      }
      this._onIframeDragStart = null;
      this._onIframeDragOver = null;
      this._onIframeDragEnd = null;
    }
    if (iframeEl && typeof iframeEl.removeEventListener === "function") {
      iframeEl.removeEventListener("dragenter", this._onIframeElDragEnter);
      iframeEl.removeEventListener("dragover", this._onIframeElDragOver);
      iframeEl.removeEventListener("dragleave", this._onIframeElDragLeave);
      iframeEl.removeEventListener("drop", this._onIframeElDrop);
      this._onIframeElDragEnter = null;
      this._onIframeElDragOver = null;
      this._onIframeElDragLeave = null;
      this._onIframeElDrop = null;
    }
  }
  // ─── Draggable attribute management ──────────────────────────────────────────
  _addDraggableToBlocks() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (!body) return;
    try {
      for (const child of Array.from(body.children)) {
        child.setAttribute("draggable", "true");
      }
    } catch (e) {
    }
  }
  _removeDraggableFromBlocks() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (!body) return;
    try {
      for (const child of Array.from(body.children)) {
        child.removeAttribute("draggable");
      }
    } catch (e) {
    }
  }
  // ─── Block drag handlers (inside iframe document) ─────────────────────────────
  _handleBlockDragStart(e) {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (!body) return;
    const block = this._getDirectBodyChild(e.target, body);
    if (!block) return;
    this._dragSrc = block;
    try {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", "");
    } catch (e2) {
    }
    this._createGhost(block);
    try {
      const transparent = document.createElement("div");
      transparent.style.cssText = "position:fixed;top:-9999px";
      document.body.appendChild(transparent);
      e.dataTransfer.setDragImage(transparent, 0, 0);
      setTimeout(() => {
        if (transparent.parentNode) transparent.parentNode.removeChild(transparent);
      }, 0);
    } catch (e2) {
    }
    try {
      block.style.opacity = "0.4";
    } catch (e2) {
    }
  }
  _handleBlockDragOver(e) {
    if (!this._dragSrc) {
      return;
    }
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    const body = this._canvas ? this._canvas.getBody() : null;
    if (!body) return;
    const block = this._getDirectBodyChild(e.target, body);
    if (!block || block === this._dragSrc) {
      this._hidePlaceholder();
      this._dropTarget = null;
      return;
    }
    let insertBefore = true;
    try {
      const rect = block.getBoundingClientRect();
      insertBefore = e.clientY - rect.top < rect.height / 2;
    } catch (e2) {
    }
    if (block !== this._dropTarget || insertBefore !== this._dropBefore) {
      this._dropTarget = block;
      this._dropBefore = insertBefore;
      this._showPlaceholder(block, insertBefore);
    }
    this._moveGhost(e);
  }
  _handleBlockDragEnd(e) {
    if (this._dragSrc && this._dropTarget) {
      const parent = this._dropTarget.parentNode;
      if (parent) {
        try {
          if (this._dropBefore) {
            parent.insertBefore(this._dragSrc, this._dropTarget);
          } else {
            const ref = this._dropTarget.nextSibling;
            ref ? parent.insertBefore(this._dragSrc, ref) : parent.appendChild(this._dragSrc);
          }
        } catch (e2) {
        }
        this._notifyChange();
      }
    }
    this._cleanupBlockDrag();
  }
  // ─── File drag handlers (on <iframe> element in host document) ────────────────
  //
  // By attaching to the iframe ELEMENT (not the iframe document), we reliably
  // receive drag events for files coming from the OS or host page, which always
  // cross the host document boundary before entering the iframe content.
  _handleFileDragEnter(e) {
    if (!this._hasFiles(e)) return;
    e.preventDefault();
    this._fileDragCount++;
    this._showFileDragStyle();
  }
  _handleFileDragOver(e) {
    if (!this._hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }
  _handleFileDragLeave(e) {
    if (!this._hasFiles(e)) return;
    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
    this._fileDragCount = 0;
    this._hideFileDragStyle();
  }
  _handleFileDrop(e) {
    e.preventDefault();
    this._fileDragCount = 0;
    this._hideFileDragStyle();
    const files = e.dataTransfer ? Array.from(e.dataTransfer.files) : [];
    if (files.length === 0) return;
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const videoFiles = files.filter((f) => f.type.startsWith("video/"));
    if (imageFiles.length === 0 && videoFiles.length === 0) return;
    const iframeEl = this._canvas ? this._canvas.iframe : null;
    const iframeDoc = this._getIframeDoc();
    if (!iframeEl || !iframeDoc) return;
    const iframeRect = iframeEl.getBoundingClientRect();
    const iframeScrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop || 0;
    const iframeScrollLeft = iframeDoc.documentElement.scrollLeft || iframeDoc.body.scrollLeft || 0;
    void (e.clientX - iframeRect.left + iframeScrollLeft);
    void (e.clientY - iframeRect.top + iframeScrollTop);
    const setCursorAtDrop = () => {
      if (!iframeDoc) return;
      try {
        let range = null;
        if (iframeDoc.caretRangeFromPoint) {
          const vpX = e.clientX - iframeRect.left;
          const vpY = e.clientY - iframeRect.top;
          range = iframeDoc.caretRangeFromPoint(vpX, vpY);
        } else if (iframeDoc.caretPositionFromPoint) {
          const vpX = e.clientX - iframeRect.left;
          const vpY = e.clientY - iframeRect.top;
          const pos = iframeDoc.caretPositionFromPoint(vpX, vpY);
          if (pos) {
            range = iframeDoc.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.collapse(true);
          }
        }
        if (range) {
          const sel = iframeDoc.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      } catch (e2) {
      }
    };
    const _esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const insertHtml = (html) => {
      setCursorAtDrop();
      try {
        iframeDoc.execCommand("insertHTML", false, html);
      } catch (e2) {
        if (this._bus) this._bus.emit("canvas:insert", { html });
        return;
      }
      this._notifyChange();
    };
    const processFile = async (file, type) => {
      const isImage = type === "image";
      const handler = isImage ? this._opts && this._opts.imageUploadHandler : this._opts && this._opts.videoUploadHandler;
      if (typeof handler === "function") {
        try {
          const url = await handler(file);
          if (url) {
            const html = isImage ? `<img src="${_esc(url)}" alt="${_esc(file.name)}">` : `<video src="${_esc(url)}" controls style="max-width:100%"></video>`;
            insertHtml(html);
          }
        } catch (e2) {
        }
        return;
      }
      await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const src = (
            /** @type {string} */
            ev.target.result
          );
          const html = isImage ? `<img src="${_esc(src)}" alt="${_esc(file.name)}">` : `<video src="${_esc(src)}" controls style="max-width:100%"></video>`;
          insertHtml(html);
          resolve();
        };
        reader.onerror = () => resolve();
        reader.readAsDataURL(file);
      });
    };
    (async () => {
      for (const file of imageFiles) {
        await processFile(file, "image");
      }
      for (const file of videoFiles) {
        await processFile(file, "video");
      }
    })();
  }
  // ─── File drag visual feedback ────────────────────────────────────────────────
  _hasFiles(e) {
    if (!e.dataTransfer) return false;
    const types = e.dataTransfer.types;
    if (!types) return false;
    return typeof types.includes === "function" ? types.includes("Files") : typeof types.contains === "function" && types.contains("Files");
  }
  _showFileDragStyle() {
    const iframeEl = this._canvas ? this._canvas.iframe : null;
    if (iframeEl) iframeEl.style.outline = "3px dashed #0057cc";
  }
  _hideFileDragStyle() {
    const iframeEl = this._canvas ? this._canvas.iframe : null;
    if (iframeEl) iframeEl.style.outline = "";
  }
  // ─── Ghost preview ────────────────────────────────────────────────────────────
  _createGhost(block) {
    const iframeRect = this._getIframeRect();
    if (!iframeRect) return;
    let blockRect;
    try {
      blockRect = block.getBoundingClientRect();
    } catch (e) {
      return;
    }
    const ghost = document.createElement("div");
    ghost.className = "npe-block-drag-ghost";
    ghost.style.cssText = [
      "position:fixed",
      `left:${iframeRect.left + blockRect.left}px`,
      `top:${iframeRect.top + blockRect.top}px`,
      `width:${blockRect.width}px`,
      `height:${blockRect.height}px`,
      "pointer-events:none",
      "z-index:20000",
      "background:rgba(0,87,204,0.08)",
      "border:2px dashed #0057cc",
      "border-radius:3px"
    ].join(";");
    document.body.appendChild(ghost);
    this._ghost = ghost;
  }
  _moveGhost(e) {
    if (!this._ghost) return;
    this._ghost.style.left = e.clientX + 12 + "px";
    this._ghost.style.top = e.clientY + 12 + "px";
  }
  _removeGhost() {
    if (this._ghost && this._ghost.parentNode) {
      this._ghost.parentNode.removeChild(this._ghost);
    }
    this._ghost = null;
  }
  // ─── Drop placeholder ─────────────────────────────────────────────────────────
  _showPlaceholder(refBlock, insertBefore) {
    const doc = this._getIframeDoc();
    if (!doc) return;
    this._removePlaceholder();
    const ph = doc.createElement("div");
    ph.style.cssText = [
      "height:3px",
      "margin:2px 0",
      "background:#0057cc",
      "border-radius:2px",
      "pointer-events:none",
      "opacity:0.85"
    ].join(";");
    try {
      if (insertBefore) {
        refBlock.parentNode.insertBefore(ph, refBlock);
      } else {
        const ref = refBlock.nextSibling;
        ref ? refBlock.parentNode.insertBefore(ph, ref) : refBlock.parentNode.appendChild(ph);
      }
    } catch (e) {
    }
    this._placeholder = ph;
  }
  _hidePlaceholder() {
    this._removePlaceholder();
  }
  _removePlaceholder() {
    if (this._placeholder && this._placeholder.parentNode) {
      this._placeholder.parentNode.removeChild(this._placeholder);
    }
    this._placeholder = null;
  }
  // ─── Cleanup ─────────────────────────────────────────────────────────────────
  _cleanupBlockDrag() {
    if (this._dragSrc) {
      try {
        this._dragSrc.style.opacity = "";
      } catch (e) {
      }
    }
    this._removeGhost();
    this._removePlaceholder();
    this._dragSrc = null;
    this._dropTarget = null;
    this._dropBefore = true;
  }
  // ─── Helpers ─────────────────────────────────────────────────────────────────
  _getDirectBodyChild(node, body) {
    if (!node) return null;
    let el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el.parentNode !== body) {
      el = el.parentElement;
    }
    return el && el !== body ? el : null;
  }
  _notifyChange() {
    if (!this._bus) return;
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) this._bus.emit("content:change", { html: body.innerHTML });
  }
  _getIframeRect() {
    if (!this._canvas || !this._canvas.iframe) return null;
    try {
      return this._canvas.iframe.getBoundingClientRect();
    } catch (e) {
      return null;
    }
  }
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch (e) {
      return null;
    }
  }
};

// src/overlays/OverlayManager.js
var OverlayManager = class {
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.hostEl       — .npe-editor shell element
   * @param {import('../canvas/CanvasManager').CanvasManager} [opts.canvasManager]
   * @param {import('../core/EventBus').EventBus} [opts.bus]
   * @param {import('../i18n/i18n').I18nInstance} [opts.i18n]
   * @param {import('../core/Options').EditorOptions} [opts.options]
   */
  constructor(opts = {}) {
    this._hostEl = opts.hostEl || document.body;
    this._canvas = opts.canvasManager || null;
    this._bus = opts.bus || null;
    this._i18n = opts.i18n || { t: (k) => k };
    this._opts = opts.options || {};
    this._destroyed = false;
    this._tableContextMenu = new TableContextMenu({
      hostEl: this._hostEl,
      i18n: this._i18n,
      canvasManager: this._canvas,
      bus: this._bus
    });
    this._tableResize = new TableResize({
      hostEl: this._hostEl,
      canvasManager: this._canvas,
      bus: this._bus
    });
    this._imageResize = new ImageResize({
      hostEl: this._hostEl,
      canvasManager: this._canvas,
      bus: this._bus,
      i18n: this._i18n
    });
    this._floatingToolbar = new FloatingToolbar({
      hostEl: this._hostEl,
      canvasManager: this._canvas,
      bus: this._bus,
      i18n: this._i18n
    });
    this._blockDragDrop = new BlockDragDrop({
      hostEl: this._hostEl,
      canvasManager: this._canvas,
      bus: this._bus,
      options: this._opts
    });
    this._onResize = () => this.update();
    window.addEventListener("resize", this._onResize);
  }
  // ─── Public API ──────────────────────────────────────────────────────────────
  /**
   * Attach or re-attach canvas and bus references to all overlays.
   * @param {import('../canvas/CanvasManager').CanvasManager} canvasManager
   */
  attachCanvas(canvasManager) {
    this._canvas = canvasManager;
    this._tableContextMenu.attachCanvas(canvasManager);
    this._tableResize.attachCanvas(canvasManager);
    this._imageResize.attachCanvas(canvasManager);
    this._floatingToolbar.attachCanvas(canvasManager);
    this._blockDragDrop.attachCanvas(canvasManager);
  }
  /**
   * Trigger a repositioning of all persistent overlays.
   * Call after: iframe scroll, host scroll, window resize, content change.
   */
  update() {
    if (this._imageResize) {
      this._imageResize._updatePosition();
    }
  }
  /**
   * Expose ImageResize for direct use (e.g. selecting an element programmatically).
   * @returns {ImageResize}
   */
  getImageResize() {
    return this._imageResize;
  }
  /**
   * Expose FloatingToolbar for direct access.
   * @returns {FloatingToolbar}
   */
  getFloatingToolbar() {
    return this._floatingToolbar;
  }
  /**
   * Destroy all overlays.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._tableContextMenu.destroy();
    this._tableResize.destroy();
    this._imageResize.destroy();
    this._floatingToolbar.destroy();
    this._blockDragDrop.destroy();
    window.removeEventListener("resize", this._onResize);
  }
};

// src/canvas/CanvasManager.js
var CanvasManager = class {
  /**
   * @param {HTMLElement} canvasWrapper — the .npe-canvas-wrapper element
   * @param {import('../core/Options').EditorOptions} opts
   * @param {import('../core/EventBus').EventBus} bus
   */
  constructor(canvasWrapper, opts, bus) {
    this._wrapper = canvasWrapper;
    this._opts = opts;
    this._bus = bus;
    this._iframe = null;
    this._destroyed = false;
    this._onInput = null;
    this._onSelectionChange = null;
    this._onFocus = null;
    this._onBlur = null;
    this._onWrapperClick = null;
    this._create();
  }
  // ─── Private ────────────────────────────────────────────────────────────────
  _create() {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-same-origin");
    iframe.className = "npe-canvas";
    iframe.setAttribute("title", "Page editor canvas");
    iframe.setAttribute("aria-label", "Page editor canvas");
    iframe.setAttribute("referrerpolicy", "no-referrer");
    this._wrapper.appendChild(iframe);
    this._iframe = iframe;
    const wrapperMinH = this._wrapper.style.minHeight;
    if (wrapperMinH) {
      iframe.style.minHeight = wrapperMinH;
    }
    this._writeDocument();
    this._attachListeners();
  }
  /**
   * Build and write the initial iframe document using the canonical template.
   */
  _writeDocument() {
    const doc = this._getDoc();
    if (!doc) return;
    const baseHref = this._opts.assetsBaseUrl ? `<base href="${_escapeAttr2(this._opts.assetsBaseUrl)}">` : "";
    const spellcheck = this._opts.spellcheck !== false ? "true" : "false";
    const template = `<!DOCTYPE html>
<html style="height:100%">
<head>
  <meta charset="UTF-8">
  ${baseHref}
  <style id="npe-base">
    html { height: 100%; }
    body {
      min-height: 100%;
      margin: 0;
      padding: 16px 20px;
      box-sizing: border-box;
      outline: none;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    body:focus { outline: none; }
    /* Prevent table layout from jumping during editing */
    table {
      border-collapse: collapse;
      table-layout: fixed;
    }
    td, th {
      min-width: 40px;
      vertical-align: top;
    }
  </style>
  <style id="npe-page"></style>
  <style id="npe-helper"></style>
</head>
<body contenteditable="true" spellcheck="${spellcheck}">
</body>
</html>`;
    doc.open();
    doc.write(template);
    doc.close();
  }
  /**
   * Attach event listeners to the iframe document and wire them to the bus.
   */
  _attachListeners() {
    const doc = this._getDoc();
    if (!doc) return;
    this._onInput = () => {
      if (this._destroyed) return;
      const body2 = this.getBody();
      this._bus.emit("content:change", {
        html: body2 ? body2.innerHTML : ""
      });
    };
    this._onSelectionChange = () => {
      if (this._destroyed) return;
      this._bus.emit("selection:change", {
        selection: doc.getSelection ? doc.getSelection() : null
      });
    };
    this._onFocus = () => {
      if (this._destroyed) return;
      this._bus.emit("canvas:focus");
    };
    this._onBlur = () => {
      if (this._destroyed) return;
      this._bus.emit("canvas:blur");
    };
    doc.addEventListener("input", this._onInput);
    doc.addEventListener("selectionchange", this._onSelectionChange);
    const body = this.getBody();
    if (body) {
      body.addEventListener("focus", this._onFocus);
      body.addEventListener("blur", this._onBlur);
    }
    this._onWrapperClick = (e) => {
      if (this._destroyed) return;
      const body2 = this.getBody();
      if (body2 && document.activeElement !== this._iframe) {
        this._iframe.focus();
        try {
          const doc2 = this._getDoc();
          if (doc2) {
            const sel = doc2.getSelection();
            if (!sel || sel.rangeCount === 0) {
              const range = doc2.createRange();
              range.selectNodeContents(body2);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        } catch (err) {
        }
      }
    };
    this._wrapper.addEventListener("click", this._onWrapperClick);
  }
  _removeListeners() {
    const doc = this._getDoc();
    if (doc && this._onInput) {
      doc.removeEventListener("input", this._onInput);
      doc.removeEventListener("selectionchange", this._onSelectionChange);
    }
    const body = this.getBody();
    if (body) {
      if (this._onFocus) body.removeEventListener("focus", this._onFocus);
      if (this._onBlur) body.removeEventListener("blur", this._onBlur);
    }
    this._onInput = null;
    this._onSelectionChange = null;
    this._onFocus = null;
    this._onBlur = null;
    if (this._wrapper && this._onWrapperClick) {
      this._wrapper.removeEventListener("click", this._onWrapperClick);
      this._onWrapperClick = null;
    }
  }
  /** @returns {Document|null} */
  _getDoc() {
    try {
      return this._iframe ? this._iframe.contentDocument : null;
    } catch (e) {
      return null;
    }
  }
  // ─── Public API ─────────────────────────────────────────────────────────────
  /** @returns {HTMLIFrameElement|null} */
  get iframe() {
    return this._iframe;
  }
  /** @returns {HTMLIFrameElement|null} */
  getIframe() {
    return this._iframe;
  }
  /** @returns {Document|null} */
  getDocument() {
    return this._getDoc();
  }
  /** @returns {HTMLBodyElement|null} */
  getBody() {
    const doc = this._getDoc();
    return doc ? doc.body : null;
  }
  /**
   * Destroy the canvas: remove listeners and the iframe element.
   * Idempotent.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._removeListeners();
    if (this._iframe && this._iframe.parentNode) {
      this._iframe.parentNode.removeChild(this._iframe);
    }
    this._iframe = null;
  }
};
function _escapeAttr2(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// src/canvas/ContentSerializer.js
var ContentSerializer = class {
  /**
   * @param {import('./CanvasManager').CanvasManager} canvasManager
   * @param {import('./Sanitizer').Sanitizer} [sanitizer]
   */
  constructor(canvasManager, sanitizer) {
    this._canvas = canvasManager || null;
    this._sanitizer = sanitizer || null;
  }
  /**
   * Get the sanitized innerHTML of the iframe body.
   * Editor-injected overlay elements (class names starting with npe-) are excluded.
   * @returns {string}
   */
  getContent() {
    const body = this._getBody();
    if (!body) return "";
    const clone = body.cloneNode(true);
    const overlays = clone.querySelectorAll('[class*="npe-"]');
    for (const el of Array.from(overlays)) {
      el.parentNode && el.parentNode.removeChild(el);
    }
    return clone.innerHTML;
  }
  /**
   * Set innerHTML of the iframe body after sanitization.
   * When a sanitizer is provided the HTML is sanitized before writing.
   * Without a sanitizer the html is still written safely through a
   * DocumentFragment rather than assigned directly to innerHTML.
   * @param {string} html
   */
  setContent(html) {
    const body = this._getBody();
    if (!body) return;
    const doc = body.ownerDocument;
    const finalHtml = this._sanitizer ? this._sanitizer.sanitize(html) : html;
    let frag;
    try {
      frag = doc.createRange().createContextualFragment(finalHtml);
    } catch (e) {
      frag = doc.createDocumentFragment();
    }
    while (body.firstChild) body.removeChild(body.firstChild);
    body.appendChild(frag);
  }
  /**
   * Get the plain text content of the iframe body (no HTML tags).
   * @returns {string}
   */
  getText() {
    const body = this._getBody();
    if (!body) return "";
    return body.textContent || "";
  }
  /**
   * Returns true if the body contains no meaningful content (whitespace-only).
   * @returns {boolean}
   */
  isEmpty() {
    const text = this.getText();
    if (text.trim() !== "") return false;
    const body = this._getBody();
    if (!body) return true;
    const meaningful = body.querySelector("img, video, hr, br, table");
    return meaningful === null;
  }
  /** @returns {HTMLBodyElement|null} */
  _getBody() {
    if (!this._canvas) return null;
    return this._canvas.getBody ? this._canvas.getBody() : null;
  }
};

// src/canvas/StyleManager.js
var BASE_CSS = `
/* npe-base: minimal editing reset \u2014 must not override page layout */
[contenteditable]:focus { outline: none; }
`.trim();
var HELPER_CSS = `
/* npe-helper: non-invasive editing helpers */
`.trim();
var StyleManager = class {
  /**
   * @param {import('./CanvasManager').CanvasManager} [canvasManager]
   * @param {import('../core/Options').EditorOptions} [opts]
   */
  constructor(canvasManager, opts) {
    this._canvas = canvasManager || null;
    this._opts = opts || {};
    this._doc = null;
    this._initialized = false;
    this._extractedStyleEls = [];
  }
  // ─── Lifecycle ───────────────────────────────────────────────────────────
  /**
   * Initialize the StyleManager with the iframe document.
   * Injects all style elements in the correct order.
   *
   * @param {Document} iframeDocument
   * @param {import('../core/Options').EditorOptions} [options]
   */
  init(iframeDocument, options) {
    this._doc = iframeDocument;
    if (options) this._opts = options;
    this._initialized = true;
    this._applyBaseStyles();
    this._applyExternalLinks();
    this._applyPageStyles();
    this._applyHelperStyles();
  }
  // ─── Private ─────────────────────────────────────────────────────────────
  /** @returns {HTMLHeadElement|null} */
  _getHead() {
    return this._doc ? this._doc.head : null;
  }
  /** @returns {HTMLStyleElement|null} */
  _getStyleEl(id) {
    return this._doc ? this._doc.getElementById(id) : null;
  }
  /**
   * Inject base CSS into #npe-base.
   */
  _applyBaseStyles() {
    const el = this._getStyleEl("npe-base");
    if (el) {
      el.textContent = BASE_CSS;
    }
  }
  /**
   * Inject validated external stylesheet links.
   * Links are inserted after #npe-base and before #npe-page.
   */
  _applyExternalLinks() {
    const urls = Array.isArray(this._opts.cssUrls) ? this._opts.cssUrls : [];
    this.setExternalLinks(urls);
  }
  /**
   * Inject initial page CSS into #npe-page.
   */
  _applyPageStyles() {
    const css = typeof this._opts.pageStyles === "string" ? this._opts.pageStyles : "";
    this.setStyles(css);
  }
  /**
   * Inject helper CSS into #npe-helper.
   */
  _applyHelperStyles() {
    const el = this._getStyleEl("npe-helper");
    if (el) {
      el.textContent = HELPER_CSS;
    }
  }
  /**
   * Ensure extracted style block elements appear in the correct position:
   * after #npe-page, before #npe-helper.
   */
  _repositionExtractedStyles() {
    const head = this._getHead();
    const helperEl = this._getStyleEl("npe-helper");
    if (!head || !helperEl) return;
    for (const styleEl of this._extractedStyleEls) {
      head.insertBefore(styleEl, helperEl);
    }
  }
  // ─── Public API ──────────────────────────────────────────────────────────
  /**
   * Get the current page CSS string (contents of #npe-page).
   * @returns {string}
   */
  getStyles() {
    const el = this._getStyleEl("npe-page");
    return el ? el.textContent || "" : "";
  }
  /**
   * Update #npe-page with the given CSS string.
   * @param {string} css
   */
  setStyles(css) {
    const el = this._getStyleEl("npe-page");
    if (el) {
      el.textContent = typeof css === "string" ? css : "";
    }
  }
  /**
   * Insert extracted style blocks (from FullHtmlParser) after #npe-page.
   * Removes any previously injected extracted style blocks first.
   *
   * @param {string[]} blocks — array of CSS text strings
   */
  addExtractedStyleBlocks(blocks) {
    const head = this._getHead();
    if (!head) return;
    for (const el of this._extractedStyleEls) {
      if (el.parentNode) el.parentNode.removeChild(el);
    }
    this._extractedStyleEls = [];
    if (!Array.isArray(blocks) || blocks.length === 0) return;
    const helperEl = this._getStyleEl("npe-helper");
    for (const block of blocks) {
      if (typeof block !== "string" || !block.trim()) continue;
      const styleEl = this._doc.createElement("style");
      styleEl.setAttribute("data-npe-extracted", "");
      styleEl.textContent = block;
      this._extractedStyleEls.push(styleEl);
      if (helperEl) {
        head.insertBefore(styleEl, helperEl);
      } else {
        head.appendChild(styleEl);
      }
    }
  }
  /**
   * Inject validated external stylesheet <link> elements.
   * Replaces any previously injected external links.
   * Links are inserted between #npe-base and #npe-page.
   *
   * @param {string[]} urls — array of validated stylesheet URLs
   */
  setExternalLinks(urls) {
    const head = this._getHead();
    if (!head) return;
    const existing = Array.from(head.querySelectorAll("link[data-npe-external]"));
    for (const el of existing) {
      el.parentNode && el.parentNode.removeChild(el);
    }
    if (!Array.isArray(urls) || urls.length === 0) return;
    const validator = typeof this._opts.stylesheetUrlValidator === "function" ? this._opts.stylesheetUrlValidator : _defaultStylesheetUrlValidator;
    const pageStyleEl = this._getStyleEl("npe-page");
    for (const url of urls) {
      if (typeof url !== "string" || !validator(url)) continue;
      const link = this._doc.createElement("link");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("href", url);
      link.setAttribute("data-npe-external", "");
      if (pageStyleEl) {
        head.insertBefore(link, pageStyleEl);
      } else {
        head.appendChild(link);
      }
    }
  }
  /**
   * Destroy: remove all injected style elements.
   * Idempotent.
   */
  destroy() {
    this._doc = null;
    this._extractedStyleEls = [];
    this._initialized = false;
  }
};
function _defaultStylesheetUrlValidator(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (/^data:/i.test(trimmed)) return false;
  const protocolMatch = trimmed.match(/^([a-z][a-z0-9+\-.]*):\/\//i);
  if (protocolMatch) {
    const protocol = protocolMatch[1].toLowerCase();
    if (protocol !== "http" && protocol !== "https") return false;
  }
  let path = trimmed;
  const hashIdx = path.indexOf("#");
  if (hashIdx !== -1) path = path.slice(0, hashIdx);
  const queryIdx = path.indexOf("?");
  if (queryIdx !== -1) path = path.slice(0, queryIdx);
  return path.endsWith(".css");
}

// src/canvas/Sanitizer.js
var BLOCKED_TAGS = /* @__PURE__ */ new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "meta",
  "base",
  "link",
  "style",
  "head",
  "noscript",
  "template",
  "slot",
  "canvas",
  "applet",
  "frame",
  "frameset"
]);
var ALLOWED_TAGS = /* @__PURE__ */ new Set([
  // Structural
  "div",
  "section",
  "article",
  "main",
  "header",
  "footer",
  "nav",
  "aside",
  "figure",
  "figcaption",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "hr",
  "br",
  // Inline
  "span",
  "strong",
  "em",
  "u",
  "s",
  "sub",
  "sup",
  "code",
  "a",
  // Media
  "img",
  "video",
  // Lists
  "ul",
  "ol",
  "li",
  // Tables
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  // Misc safe
  "caption",
  "colgroup",
  "col",
  "details",
  "summary",
  "mark",
  "small",
  "abbr",
  "cite",
  "q",
  "del",
  "ins",
  "kbd",
  "samp",
  "var",
  "time",
  "address",
  "bdi",
  "bdo",
  "ruby",
  "rt",
  "rp",
  "wbr",
  "data"
]);
var SVG_NS = "http://www.w3.org/2000/svg";
var XLINK_NS = "http://www.w3.org/1999/xlink";
var ALLOWED_SVG_TAGS = /* @__PURE__ */ new Set([
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "textPath",
  "defs",
  "use",
  "symbol",
  "title",
  "desc",
  "clipPath",
  "mask",
  "pattern",
  "linearGradient",
  "radialGradient",
  "stop",
  "marker",
  "image",
  "switch",
  "view",
  "filter",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence"
]);
var SVG_ATTRS_GLOBAL = /* @__PURE__ */ new Set([
  "class",
  "id",
  "style",
  "tabindex",
  "fill",
  "fill-rule",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-opacity",
  "opacity",
  "transform",
  "clip-path",
  "clip-rule",
  "mask",
  "filter",
  "color",
  "stop-color",
  "stop-opacity",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "text-anchor",
  "dominant-baseline",
  "visibility",
  "display",
  "vector-effect",
  "paint-order"
]);
var SVG_ATTRS_BY_TAG = {
  svg: /* @__PURE__ */ new Set(["viewBox", "width", "height", "xmlns", "preserveAspectRatio", "version"]),
  path: /* @__PURE__ */ new Set(["d", "pathLength"]),
  rect: /* @__PURE__ */ new Set(["x", "y", "width", "height", "rx", "ry", "pathLength"]),
  circle: /* @__PURE__ */ new Set(["cx", "cy", "r", "pathLength"]),
  ellipse: /* @__PURE__ */ new Set(["cx", "cy", "rx", "ry", "pathLength"]),
  line: /* @__PURE__ */ new Set(["x1", "y1", "x2", "y2", "pathLength"]),
  polyline: /* @__PURE__ */ new Set(["points", "pathLength"]),
  polygon: /* @__PURE__ */ new Set(["points", "pathLength"]),
  text: /* @__PURE__ */ new Set(["x", "y", "dx", "dy", "rotate", "textLength", "lengthAdjust"]),
  tspan: /* @__PURE__ */ new Set(["x", "y", "dx", "dy", "rotate", "textLength", "lengthAdjust"]),
  textPath: /* @__PURE__ */ new Set(["href", "xlink:href", "startOffset", "method", "spacing"]),
  use: /* @__PURE__ */ new Set(["href", "xlink:href", "x", "y", "width", "height"]),
  image: /* @__PURE__ */ new Set(["href", "xlink:href", "x", "y", "width", "height", "preserveAspectRatio"]),
  linearGradient: /* @__PURE__ */ new Set(["x1", "y1", "x2", "y2", "gradientUnits", "gradientTransform", "spreadMethod", "href", "xlink:href"]),
  radialGradient: /* @__PURE__ */ new Set(["cx", "cy", "r", "fx", "fy", "fr", "gradientUnits", "gradientTransform", "spreadMethod", "href", "xlink:href"]),
  stop: /* @__PURE__ */ new Set(["offset", "stop-color", "stop-opacity"]),
  pattern: /* @__PURE__ */ new Set(["x", "y", "width", "height", "patternUnits", "patternContentUnits", "patternTransform", "viewBox", "href", "xlink:href", "preserveAspectRatio"]),
  marker: /* @__PURE__ */ new Set(["markerWidth", "markerHeight", "refX", "refY", "orient", "markerUnits", "viewBox", "preserveAspectRatio"]),
  clipPath: /* @__PURE__ */ new Set(["clipPathUnits"]),
  mask: /* @__PURE__ */ new Set(["maskUnits", "maskContentUnits", "x", "y", "width", "height"]),
  symbol: /* @__PURE__ */ new Set(["viewBox", "preserveAspectRatio", "x", "y", "width", "height"]),
  filter: /* @__PURE__ */ new Set(["x", "y", "width", "height", "filterUnits", "primitiveUnits"]),
  feGaussianBlur: /* @__PURE__ */ new Set(["stdDeviation", "in", "result", "edgeMode"]),
  feOffset: /* @__PURE__ */ new Set(["dx", "dy", "in", "result"]),
  feMerge: /* @__PURE__ */ new Set(["result"]),
  feMergeNode: /* @__PURE__ */ new Set(["in"]),
  feColorMatrix: /* @__PURE__ */ new Set(["type", "values", "in", "result"]),
  feComponentTransfer: /* @__PURE__ */ new Set(["in", "result"]),
  feFuncA: /* @__PURE__ */ new Set(["type", "tableValues", "slope", "intercept", "amplitude", "exponent", "offset"]),
  feFuncR: /* @__PURE__ */ new Set(["type", "tableValues", "slope", "intercept", "amplitude", "exponent", "offset"]),
  feFuncG: /* @__PURE__ */ new Set(["type", "tableValues", "slope", "intercept", "amplitude", "exponent", "offset"]),
  feFuncB: /* @__PURE__ */ new Set(["type", "tableValues", "slope", "intercept", "amplitude", "exponent", "offset"]),
  feFlood: /* @__PURE__ */ new Set(["flood-color", "flood-opacity", "result"]),
  feComposite: /* @__PURE__ */ new Set(["in", "in2", "operator", "k1", "k2", "k3", "k4", "result"]),
  feBlend: /* @__PURE__ */ new Set(["in", "in2", "mode", "result"]),
  feDropShadow: /* @__PURE__ */ new Set(["dx", "dy", "stdDeviation", "flood-color", "flood-opacity"]),
  feMorphology: /* @__PURE__ */ new Set(["operator", "radius", "in", "result"]),
  feTurbulence: /* @__PURE__ */ new Set(["type", "baseFrequency", "numOctaves", "seed", "stitchTiles", "result"]),
  feDisplacementMap: /* @__PURE__ */ new Set(["in", "in2", "scale", "xChannelSelector", "yChannelSelector", "result"]),
  feConvolveMatrix: /* @__PURE__ */ new Set(["order", "kernelMatrix", "divisor", "bias", "targetX", "targetY", "edgeMode", "kernelUnitLength", "preserveAlpha", "result", "in"]),
  feDiffuseLighting: /* @__PURE__ */ new Set(["surfaceScale", "diffuseConstant", "in", "result"]),
  feSpecularLighting: /* @__PURE__ */ new Set(["surfaceScale", "specularConstant", "specularExponent", "in", "result"]),
  feDistantLight: /* @__PURE__ */ new Set(["azimuth", "elevation"]),
  fePointLight: /* @__PURE__ */ new Set(["x", "y", "z"]),
  feSpotLight: /* @__PURE__ */ new Set(["x", "y", "z", "pointsAtX", "pointsAtY", "pointsAtZ", "specularExponent", "limitingConeAngle"]),
  feTile: /* @__PURE__ */ new Set(["in", "result"]),
  feImage: /* @__PURE__ */ new Set(["href", "xlink:href", "result", "preserveAspectRatio"]),
  view: /* @__PURE__ */ new Set(["viewBox", "preserveAspectRatio"])
};
var ALLOWED_ATTRS_GLOBAL = /* @__PURE__ */ new Set([
  "class",
  "id",
  "style",
  "title",
  "lang",
  "dir",
  "tabindex"
]);
var ALLOWED_ATTRS_BY_TAG = {
  a: /* @__PURE__ */ new Set(["href", "target", "rel", "download"]),
  img: /* @__PURE__ */ new Set(["src", "alt", "width", "height", "loading", "decoding", "srcset", "sizes"]),
  video: /* @__PURE__ */ new Set(["src", "poster", "controls", "width", "height", "autoplay", "muted", "loop", "preload"]),
  td: /* @__PURE__ */ new Set(["colspan", "rowspan", "headers"]),
  th: /* @__PURE__ */ new Set(["colspan", "rowspan", "scope", "headers", "abbr"]),
  col: /* @__PURE__ */ new Set(["span"]),
  colgroup: /* @__PURE__ */ new Set(["span"]),
  time: /* @__PURE__ */ new Set(["datetime"]),
  ins: /* @__PURE__ */ new Set(["cite", "datetime"]),
  del: /* @__PURE__ */ new Set(["cite", "datetime"]),
  ol: /* @__PURE__ */ new Set(["start", "reversed", "type"]),
  li: /* @__PURE__ */ new Set(["value"]),
  details: /* @__PURE__ */ new Set(["open"]),
  // Deprecated but commonly used by CMS content
  table: /* @__PURE__ */ new Set(["cellpadding", "cellspacing", "border", "summary", "width"])
};
var URL_ATTRS = {
  href: null,
  // any tag (a)
  src: null,
  // any tag (img, video)
  poster: null,
  // video
  action: null,
  // form — blocked anyway but in case
  data: null
  // object — blocked anyway
};
var ALLOWED_DATA_URI_MIME = /* @__PURE__ */ new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm"
]);
var DATA_URI_ALLOWED_TAGS = /* @__PURE__ */ new Set(["img", "video"]);
var DATA_URI_ALLOWED_ATTR = "src";
var DATA_URI_RE = /^\s*data:([^;,]+)[;,]/i;
function isSafeUrl(value, tagName, attrName, allowDataUris) {
  const trimmed = value.trim();
  if (/^\s*data:/i.test(trimmed)) {
    if (!allowDataUris) return false;
    if (!DATA_URI_ALLOWED_TAGS.has(tagName) || attrName !== DATA_URI_ALLOWED_ATTR) {
      return false;
    }
    const match = trimmed.match(DATA_URI_RE);
    if (!match) return false;
    const mime = match[1].trim().toLowerCase();
    return ALLOWED_DATA_URI_MIME.has(mime);
  }
  const decoded = trimmed.replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/&#([0-9]+);?/gi, (_, dec) => String.fromCharCode(parseInt(dec, 10))).replace(/[\x00-\x20]/g, "");
  if (/^(javascript|vbscript):/i.test(decoded)) return false;
  return true;
}
function isAllowedAttr(attrName, tagName, isSvg) {
  if (/^on/i.test(attrName)) return false;
  if (isSvg) {
    if (SVG_ATTRS_GLOBAL.has(attrName)) return true;
    if (/^data-[a-z]/i.test(attrName)) return true;
    if (/^aria-[a-z]/i.test(attrName)) return true;
    const svgTagAttrs = SVG_ATTRS_BY_TAG[tagName];
    if (svgTagAttrs && svgTagAttrs.has(attrName)) return true;
    return false;
  }
  if (ALLOWED_ATTRS_GLOBAL.has(attrName)) return true;
  if (/^data-[a-z]/i.test(attrName)) return true;
  if (/^aria-[a-z]/i.test(attrName)) return true;
  const tagAttrs = ALLOWED_ATTRS_BY_TAG[tagName];
  if (tagAttrs && tagAttrs.has(attrName)) return true;
  return false;
}
function sanitizeNode(node, doc, allowDataUris) {
  if (node.nodeType === Node.TEXT_NODE) {
    return [doc.createTextNode(node.textContent)];
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }
  const isSvg = node.namespaceURI === SVG_NS;
  const tagName = isSvg ? node.tagName : node.tagName.toLowerCase();
  if (BLOCKED_TAGS.has(tagName)) {
    return [];
  }
  const isKnown = isSvg ? ALLOWED_SVG_TAGS.has(tagName) : ALLOWED_TAGS.has(tagName);
  const safeChildren = [];
  for (const child of Array.from(node.childNodes)) {
    safeChildren.push(...sanitizeNode(child, doc, allowDataUris));
  }
  if (!isKnown) {
    return safeChildren;
  }
  const clean = isSvg ? doc.createElementNS(SVG_NS, tagName) : doc.createElement(tagName);
  for (const attr of Array.from(node.attributes)) {
    const name = isSvg ? attr.name : attr.name.toLowerCase();
    const value = attr.value;
    if (!isAllowedAttr(name, tagName, isSvg)) continue;
    if (name in URL_ATTRS || name === "src" || name === "href" || name === "xlink:href" || name === "poster") {
      if (!isSafeUrl(value, tagName, name, allowDataUris)) continue;
    }
    if (name === "style") {
      const safeStyle = sanitizeStyleAttr(value);
      if (safeStyle) {
        clean.setAttribute("style", safeStyle);
      }
      continue;
    }
    if (name === "xlink:href") {
      clean.setAttributeNS(XLINK_NS, "xlink:href", value);
    } else {
      clean.setAttribute(name, value);
    }
  }
  for (const child of safeChildren) {
    clean.appendChild(child);
  }
  return [clean];
}
function sanitizeStyleAttr(styleValue) {
  if (!styleValue) return "";
  let safe = styleValue.replace(/expression\s*\(/gi, "BLOCKED(");
  safe = safe.replace(/url\s*\(\s*(['"]?)(javascript|vbscript|data):[^)]*\1\s*\)/gi, "url(about:blank)");
  return safe;
}
var Sanitizer = class {
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
    if (typeof html !== "string") return "";
    if (html === "") return "";
    let doc;
    try {
      doc = new DOMParser().parseFromString(html, "text/html");
    } catch (e) {
      return "";
    }
    const outputDoc = document.implementation.createHTMLDocument("");
    const fragment = outputDoc.createDocumentFragment();
    const body = doc.body;
    if (!body) return "";
    for (const child of Array.from(body.childNodes)) {
      const safeNodes = sanitizeNode(child, outputDoc, this._allowDataUris);
      for (const n of safeNodes) {
        fragment.appendChild(n);
      }
    }
    const parts = [];
    for (const n of Array.from(fragment.childNodes)) {
      if (n.nodeType === Node.TEXT_NODE) {
        parts.push(
          (n.nodeValue || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        );
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        parts.push(n.outerHTML);
      }
    }
    return parts.join("").trim();
  }
};

// src/canvas/FullHtmlParser.js
var FullHtmlParser = class {
  /**
   * Parse a full HTML document string.
   *
   * @param {string} fullHtml
   * @param {{ stylesheetUrlValidator?: ((url: string) => boolean)|null }} [options]
   * @returns {{ bodyHtml: string, styleBlocks: string[], cssUrls: string[] }}
   */
  parse(fullHtml, options = {}) {
    if (!fullHtml || typeof fullHtml !== "string") {
      return { bodyHtml: "", styleBlocks: [], cssUrls: [] };
    }
    const validator = options && typeof options.stylesheetUrlValidator === "function" ? options.stylesheetUrlValidator : _defaultStylesheetUrlValidator2;
    let doc;
    try {
      const parser = new DOMParser();
      doc = parser.parseFromString(fullHtml, "text/html");
    } catch (e) {
      return { bodyHtml: "", styleBlocks: [], cssUrls: [] };
    }
    const bodyHtml = doc.body ? doc.body.innerHTML : "";
    const styleBlocks = [];
    const headStyleEls = doc.head ? Array.from(doc.head.querySelectorAll("style")) : [];
    for (const styleEl of headStyleEls) {
      const content = styleEl.textContent;
      if (content && content.trim()) {
        styleBlocks.push(content);
      }
    }
    const bodyStyleEls = doc.body ? Array.from(doc.body.querySelectorAll("style")) : [];
    for (const styleEl of bodyStyleEls) {
      const content = styleEl.textContent;
      if (content && content.trim()) {
        styleBlocks.push(content);
      }
    }
    const cssUrls = [];
    const allLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    for (const link of allLinks) {
      const href = link.getAttribute("href");
      if (href && validator(href)) {
        cssUrls.push(href);
      }
    }
    return { bodyHtml, styleBlocks, cssUrls };
  }
};
function _defaultStylesheetUrlValidator2(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (/^data:/i.test(trimmed)) return false;
  const protocolMatch = trimmed.match(/^([a-z][a-z0-9+\-.]*):\/\//i);
  if (protocolMatch) {
    const protocol = protocolMatch[1].toLowerCase();
    if (protocol !== "http" && protocol !== "https") return false;
  }
  let path = trimmed;
  const hashIdx = path.indexOf("#");
  if (hashIdx !== -1) path = path.slice(0, hashIdx);
  const queryIdx = path.indexOf("?");
  if (queryIdx !== -1) path = path.slice(0, queryIdx);
  return path.endsWith(".css");
}

// src/themes/ThemeManager.js
var THEME_CLASS_MAP = {
  "light": null,
  "dark": "npe-dark",
  "blue": "npe-theme-blue",
  "dark-blue": "npe-theme-dark-blue",
  "midnight": "npe-theme-midnight",
  "void": "npe-theme-void",
  "autumn": "npe-theme-autumn"
};
var STORAGE_KEY = "npe-theme";
var ThemeManager = class {
  /**
   * @param {HTMLElement} shell — the .npe-editor element
   * @param {string} initialTheme
   * @param {boolean} persist — whether to persist across page loads
   */
  constructor(shell, initialTheme = "light", persist = false) {
    this._shell = shell;
    this._persist = persist;
    this._current = VALID_THEMES.includes(initialTheme) ? initialTheme : "light";
    if (this._persist) {
      const stored = this._readStorage();
      if (stored) this._current = stored;
    }
    this._apply(this._current);
  }
  /**
   * @param {string} name
   */
  setTheme(name) {
    if (!VALID_THEMES.includes(name)) return;
    this._current = name;
    this._apply(name);
    if (this._persist) this._writeStorage(name);
  }
  toggleTheme() {
    const idx = VALID_THEMES.indexOf(this._current);
    const next = VALID_THEMES[(idx + 1) % VALID_THEMES.length];
    this.setTheme(next);
  }
  getTheme() {
    return this._current;
  }
  destroy() {
    for (const cls of Object.values(THEME_CLASS_MAP)) {
      if (cls) this._shell.classList.remove(cls);
    }
  }
  // ─── Private ────────────────────────────────────────────────────────────────
  _apply(theme) {
    for (const cls2 of Object.values(THEME_CLASS_MAP)) {
      if (cls2) this._shell.classList.remove(cls2);
    }
    const cls = THEME_CLASS_MAP[theme];
    if (cls) this._shell.classList.add(cls);
  }
  _readStorage() {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch (e) {
      return null;
    }
  }
  _writeStorage(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
    }
  }
};

// src/statusbar/StatusBar.js
var StatusBar = class {
  /**
   * @param {HTMLElement} container — the .npe-statusbar element
   * @param {import('../core/EventBus').EventBus} bus
   * @param {import('../i18n/i18n').I18nInstance} i18n
   */
  constructor(container, bus, i18n) {
    this._container = container;
    this._bus = bus;
    this._i18n = i18n;
    this._words = 0;
    this._chars = 0;
    this._block = "";
    this._autosaveStatus = "off";
    this._lastSaveTime = null;
    this._agoTimer = null;
    this._wordEl = null;
    this._charEl = null;
    this._blockEl = null;
    this._autosaveEl = null;
    this._render();
    this._bindBusEvents();
  }
  // ─── Public API ─────────────────────────────────────────────────────────────
  /**
   * Update the status bar with new state.
   * @param {object} state
   * @param {number} [state.words]
   * @param {number} [state.chars]
   * @param {string} [state.block]
   * @param {string} [state.autosaveStatus] — 'off' | 'saving' | 'saved'
   * @param {Date|null} [state.lastSaveTime]
   */
  update(state = {}) {
    if (typeof state.words === "number") this._words = state.words;
    if (typeof state.chars === "number") this._chars = state.chars;
    if (typeof state.block === "string") this._block = state.block;
    if (typeof state.autosaveStatus === "string") this._autosaveStatus = state.autosaveStatus;
    if (state.lastSaveTime !== void 0) this._lastSaveTime = state.lastSaveTime;
    this._updateDOM();
  }
  destroy() {
    this._clearAgoTimer();
    if (this._container) {
      this._container.innerHTML = "";
    }
    this._offHandlers();
  }
  // ─── Private ────────────────────────────────────────────────────────────────
  _render() {
    if (!this._container) return;
    this._container.innerHTML = "";
    this._wordEl = this._makeItem("statusbar.words", "0");
    this._charEl = this._makeItem("statusbar.characters", "0");
    this._blockEl = this._makeItem("statusbar.block", "");
    this._autosaveEl = this._makeItem("statusbar.autosave", this._i18n.t("statusbar.autosave.off"));
    this._container.appendChild(this._wordEl.wrapper);
    this._container.appendChild(this._charEl.wrapper);
    this._container.appendChild(this._blockEl.wrapper);
    this._container.appendChild(this._autosaveEl.wrapper);
  }
  /**
   * Make a label + value span pair wrapped in a .npe-statusbar-item div.
   * @param {string} labelKey
   * @param {string} initialValue
   * @returns {{ wrapper: HTMLElement, value: HTMLElement }}
   */
  _makeItem(labelKey, initialValue) {
    const wrapper = document.createElement("span");
    wrapper.className = "npe-statusbar-item";
    const label = document.createElement("span");
    label.className = "npe-statusbar-label";
    label.textContent = this._i18n.t(labelKey) + ":";
    const value = document.createElement("span");
    value.className = "npe-statusbar-value";
    value.textContent = initialValue;
    wrapper.appendChild(label);
    wrapper.appendChild(value);
    return { wrapper, value };
  }
  _updateDOM() {
    if (this._wordEl) this._wordEl.value.textContent = String(this._words);
    if (this._charEl) this._charEl.value.textContent = String(this._chars);
    if (this._blockEl) this._blockEl.value.textContent = this._block;
    if (this._autosaveEl) this._autosaveEl.value.textContent = this._formatAutosave();
    if (this._autosaveStatus === "saved" && this._lastSaveTime) {
      this._startAgoTimer();
    } else {
      this._clearAgoTimer();
    }
  }
  /**
   * Format the autosave status string.
   * @returns {string}
   */
  _formatAutosave() {
    const t = this._i18n.t.bind(this._i18n);
    if (this._autosaveStatus === "off") return t("statusbar.autosave.off");
    if (this._autosaveStatus === "saving") return t("statusbar.autosave.saving");
    if (this._autosaveStatus === "saved" && this._lastSaveTime) {
      const diffMs = Date.now() - this._lastSaveTime.getTime();
      const diffSec = Math.floor(diffMs / 1e3);
      if (diffSec < 60) {
        return t("statusbar.autosave.saved");
      }
      const diffMin = Math.floor(diffSec / 60);
      return `${t("statusbar.autosave.saved")} ${diffMin} min ${t("statusbar.autosave.ago")}`;
    }
    return t("statusbar.autosave.saved");
  }
  /**
   * Start (or restart) a timer that refreshes the "X min ago" display every minute.
   */
  _startAgoTimer() {
    this._clearAgoTimer();
    this._agoTimer = setInterval(() => {
      if (this._autosaveEl) {
        this._autosaveEl.value.textContent = this._formatAutosave();
      }
    }, 6e4);
  }
  _clearAgoTimer() {
    if (this._agoTimer !== null) {
      clearInterval(this._agoTimer);
      this._agoTimer = null;
    }
  }
  /**
   * Bind to bus events for live updates.
   */
  _bindBusEvents() {
    if (!this._bus) return;
    this._onContentChange = ({ words, chars } = {}) => {
      if (typeof words === "number") this._words = words;
      if (typeof chars === "number") this._chars = chars;
      this._updateDOM();
    };
    this._onSelectionChange = ({ block } = {}) => {
      if (typeof block === "string") this._block = block;
      this._updateDOM();
    };
    this._onAutosaveStatus = ({ status, lastSaveTime } = {}) => {
      if (typeof status === "string") this._autosaveStatus = status;
      if (lastSaveTime !== void 0) this._lastSaveTime = lastSaveTime;
      this._updateDOM();
    };
    this._bus.on("content:change", this._onContentChange);
    this._bus.on("selection:change", this._onSelectionChange);
    this._bus.on("autosave:status", this._onAutosaveStatus);
  }
  _offHandlers() {
    if (!this._bus) return;
    if (this._onContentChange) this._bus.off("content:change", this._onContentChange);
    if (this._onSelectionChange) this._bus.off("selection:change", this._onSelectionChange);
    if (this._onAutosaveStatus) this._bus.off("autosave:status", this._onAutosaveStatus);
  }
};

// src/autosave/AutosaveManager.js
var AUTOSAVE_INTERVAL_MS = 3e4;
var AutosaveManager = class {
  /**
   * @param {object} opts
   * @param {string} opts.storageKey — unique localStorage key for this instance
   * @param {import('../core/EventBus').EventBus} opts.bus
   * @param {Function} opts.getContent — () => string — returns current sanitized HTML
   * @param {boolean} [opts.enabled] — whether autosave starts enabled
   */
  constructor({ storageKey, bus, getContent, enabled = false }) {
    this._key = storageKey;
    this._bus = bus;
    this._getContent = getContent;
    this._enabled = enabled;
    this._timer = null;
    this._lastSaveTime = null;
    if (this._enabled) {
      this._start();
    }
    this._emitStatus();
  }
  // ─── Public API ─────────────────────────────────────────────────────────────
  /** @returns {boolean} */
  isEnabled() {
    return this._enabled;
  }
  /**
   * Enable autosave. Starts the interval timer.
   */
  enable() {
    if (this._enabled) return;
    this._enabled = true;
    this._start();
    this._emitStatus();
  }
  /**
   * Disable autosave. Stops the interval timer.
   */
  disable() {
    if (!this._enabled) return;
    this._enabled = false;
    this._stop();
    this._emitStatus();
  }
  /**
   * Toggle autosave on/off.
   * @returns {boolean} new enabled state
   */
  toggle() {
    if (this._enabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this._enabled;
  }
  /**
   * Save immediately (regardless of the interval timer).
   */
  saveNow() {
    if (!this._enabled) return;
    this._save();
  }
  /**
   * Restore the last draft from localStorage.
   * Returns null if no draft exists.
   * @returns {string|null}
   */
  restore() {
    try {
      return localStorage.getItem(this._key) || null;
    } catch (e) {
      return null;
    }
  }
  /**
   * Clear the autosave draft (called on successful explicit save).
   */
  clear() {
    try {
      localStorage.removeItem(this._key);
    } catch (e) {
    }
  }
  /**
   * Destroy the manager: stop timer, do not clear the stored draft.
   */
  destroy() {
    this._stop();
  }
  // ─── Private ────────────────────────────────────────────────────────────────
  _start() {
    this._stop();
    this._timer = setInterval(() => this._save(), AUTOSAVE_INTERVAL_MS);
  }
  _stop() {
    if (this._timer !== null) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
  _save() {
    if (!this._enabled) return;
    this._emitSaving();
    try {
      const html = this._getContent();
      localStorage.setItem(this._key, html);
      this._lastSaveTime = /* @__PURE__ */ new Date();
      this._emitSaved();
    } catch (e) {
      this._emitStatus();
    }
  }
  _emitSaving() {
    this._bus.emit("autosave:status", { status: "saving", lastSaveTime: this._lastSaveTime });
  }
  _emitSaved() {
    this._bus.emit("autosave:status", { status: "saved", lastSaveTime: this._lastSaveTime });
  }
  _emitStatus() {
    const status = this._enabled ? this._lastSaveTime ? "saved" : "saving" : "off";
    const resolvedStatus = this._enabled && !this._lastSaveTime ? "off" : status;
    this._bus.emit("autosave:status", {
      status: resolvedStatus === "off" && this._enabled ? "saving" : resolvedStatus,
      lastSaveTime: this._lastSaveTime
    });
    if (!this._enabled) {
      this._bus.emit("autosave:status", { status: "off", lastSaveTime: null });
    }
  }
};

// src/core/Editor.js
var CHANGE_DEBOUNCE_MS = 300;
var TOAST_DURATION_MS = 4e3;
var NPE_VERSION = "0.3.0";
var NPE_LOGO_URL = "https://raw.githubusercontent.com/neikiri/neiki-page-editor/main/assets/img/logo.svg";
var NPE_GITHUB_URL = "https://github.com/neikiri/neiki-page-editor";
var Editor = class {
  /**
   * @param {Element} targetEl — resolved target element
   * @param {object} rawOptions — raw user options
   */
  constructor(targetEl, rawOptions) {
    this._target = targetEl;
    this._opts = normalizeOptions(rawOptions);
    this._bus = new EventBus();
    this._destroyed = false;
    this._shell = null;
    this._toolbarEl = null;
    this._i18n = createI18n(this._opts.language, this._opts.translations);
    this._toolbarBuilder = null;
    this._toolbarState = null;
    this._commands = null;
    this._modalManager = null;
    this._sourceViewModal = null;
    this._findReplaceModal = null;
    this._canvas = null;
    this._styleManager = null;
    this._serializer = null;
    this._sanitizer = null;
    this._fullHtmlParser = null;
    this._themeManager = null;
    this._statusBar = null;
    this._autosave = null;
    this._overlayManager = null;
    this._metadata = {};
    this._cssUrls = Array.isArray(this._opts.cssUrls) ? this._opts.cssUrls.slice() : [];
    this._assetsBaseUrl = this._opts.assetsBaseUrl || "";
    this._onChangeTimer = null;
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
    const shell = document.createElement("div");
    shell.className = "npe-editor";
    if (this._opts.customClass) {
      shell.classList.add(this._opts.customClass);
    }
    const toolbar = document.createElement("div");
    toolbar.className = "npe-toolbar";
    toolbar.setAttribute("role", "toolbar");
    toolbar.setAttribute("aria-label", "Editor toolbar");
    const canvasWrapper = document.createElement("div");
    canvasWrapper.className = "npe-canvas-wrapper";
    canvasWrapper.style.minHeight = this._opts.minHeight + "px";
    if (this._opts.maxHeight) {
      canvasWrapper.style.maxHeight = this._opts.maxHeight + "px";
      canvasWrapper.style.overflowY = "auto";
    }
    const overlayLayer = document.createElement("div");
    overlayLayer.className = "npe-overlay-layer";
    overlayLayer.setAttribute("aria-hidden", "true");
    const statusbar = document.createElement("div");
    statusbar.className = "npe-statusbar";
    statusbar.setAttribute("role", "status");
    statusbar.setAttribute("aria-live", "polite");
    canvasWrapper.appendChild(overlayLayer);
    shell.appendChild(toolbar);
    shell.appendChild(canvasWrapper);
    shell.appendChild(statusbar);
    this._target.appendChild(shell);
    this._shell = shell;
    this._toolbarEl = toolbar;
    this._canvasWrapper = canvasWrapper;
    this._themeManager = new ThemeManager(
      shell,
      this._opts.theme,
      this._opts.persistTheme
    );
    this._overlayManager = new OverlayManager({
      hostEl: shell,
      canvasManager: null,
      bus: this._bus,
      i18n: this._i18n,
      options: this._opts
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
    if (this._overlayManager) {
      this._overlayManager.attachCanvas(this._canvas);
    }
    this._bus.on("content:change", () => {
      if (this._overlayManager) this._overlayManager.update();
    });
    this._bus.on("selection:change", () => {
      if (this._overlayManager) this._overlayManager.update();
    });
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
      options: this._opts,
      bus: this._bus,
      i18n: this._i18n,
      hostEl: this._shell || document.body,
      canvasManager: this._canvas
    });
  }
  /**
   * Build the StatusBar and wire it to the statusbar element in the shell.
   */
  _buildStatusBar() {
    const statusbarEl = this._shell ? this._shell.querySelector(".npe-statusbar") : null;
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
    const id = this._target && this._target.id ? this._target.id : null;
    if (id) return `npe-autosave-${id}`;
    return "npe-autosave-default";
  }
  /**
   * Build the AutosaveManager.
   */
  _buildAutosave() {
    this._autosave = new AutosaveManager({
      storageKey: this._getAutosaveKey(),
      bus: this._bus,
      getContent: () => this.getContent(),
      enabled: false
      // off by default unless opted in
    });
  }
  /**
   * Listen to toolbar:command and toolbar:more bus events and route to commands.
   */
  _bindToolbarCommands() {
    this._bus.on("toolbar:command", (id, value) => {
      if (!this._commands) return;
      this._commands.execute(id, value);
    });
    this._bus.on("toolbar:colorPreview", () => {
    });
    this._bus.on("toolbar:more", (itemId) => {
      this._handleMoreMenuItem(itemId);
    });
    this._bus.on("toolbar:insert", (itemId) => {
      if (this._modalManager) this._modalManager.open(itemId);
    });
    this._bus.on("canvas:insert", ({ html }) => {
      if (!html) return;
      if (this._modalManager) {
        this._modalManager._insert(html);
      }
    });
    this._bus.on("toolbar:command", (id) => {
      if (id === "viewCode") this._openSourceView();
      if (id === "findReplace") this._openFindReplace();
    });
  }
  /**
   * Handle a More menu item click.
   * @param {string} itemId
   */
  _handleMoreMenuItem(itemId) {
    switch (itemId) {
      case "save":
        this.triggerSave();
        break;
      case "preview":
        this._openPreview();
        break;
      case "download":
        this._downloadHtml();
        break;
      case "print":
        this._printCanvas();
        break;
      case "autosave":
        this._toggleAutosave();
        break;
      case "clearAll":
        this._clearAll();
        break;
      case "changeTheme":
        this.toggleTheme();
        break;
      case "fullscreen":
        this.toggleFullscreen();
        break;
      case "help":
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
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
    } else {
      setTimeout(() => URL.revokeObjectURL(url), 3e4);
    }
  }
  /**
   * Download the current page as an HTML file with embedded CSS.
   */
  _downloadHtml() {
    const html = this._buildFullPageHtml();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "page.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5e3);
  }
  /**
   * Build a full HTML document string containing current canvas HTML and page CSS.
   * @returns {string}
   */
  _buildFullPageHtml() {
    const bodyHtml = this.getContent();
    const css = this.getStyles();
    const cssUrls = this._cssUrls || [];
    const assetsBaseUrl = this._assetsBaseUrl || "";
    let linkTags = "";
    for (const url of cssUrls) {
      linkTags += `  <link rel="stylesheet" href="${this._escapeAttr(url)}">
`;
    }
    let styleTag = "";
    if (css) {
      styleTag = `  <style>
${css}
  </style>
`;
    }
    let baseTag = "";
    if (assetsBaseUrl) {
      baseTag = `  <base href="${this._escapeAttr(assetsBaseUrl)}">
`;
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
    } catch (e) {
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
    const confirmed = window.confirm(this._i18n.t("confirm.clearAll"));
    if (!confirmed) return;
    this.setContent("");
    this._bus.emit("content:change", { html: "", words: 0, chars: 0 });
  }
  /**
   * Open the Help panel showing keyboard shortcuts.
   */
  _openHelp() {
    if (this._helpPanel) {
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
    const backdrop = document.createElement("div");
    backdrop.className = "npe-modal-backdrop";
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-label", t("help.title"));
    const panel = document.createElement("div");
    panel.className = "npe-modal npe-help-panel npe-help-about-panel";
    const header = document.createElement("div");
    header.className = "npe-modal-header";
    const title = document.createElement("h2");
    title.className = "npe-modal-title";
    title.textContent = t("help.title");
    const closeBtn = document.createElement("button");
    closeBtn.className = "npe-modal-close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", t("help.close"));
    closeBtn.textContent = "\xD7";
    closeBtn.addEventListener("click", () => this._closeHelp());
    header.appendChild(title);
    header.appendChild(closeBtn);
    const body = document.createElement("div");
    body.className = "npe-modal-body npe-help-body npe-help-about";
    body.innerHTML = this._buildHelpContent();
    panel.appendChild(header);
    panel.appendChild(body);
    backdrop.appendChild(panel);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) this._closeHelp();
    });
    this._helpEscHandler = (e) => {
      if (e.key === "Escape") this._closeHelp();
    };
    document.addEventListener("keydown", this._helpEscHandler);
    this._shell.appendChild(backdrop);
    this._helpPanel = backdrop;
    closeBtn.focus();
  }
  /**
   * Build the HTML content for the Help/About modal: logo, version, GitHub link.
   * @returns {string}
   */
  _buildHelpContent() {
    const t = (key) => this._i18n.t(key);
    return `<img class="npe-help-logo" src="${this._escapeAttr(NPE_LOGO_URL)}" alt="Neiki Page Editor"><div class="npe-help-info"><div><strong>${this._escapeHtml(t("help.author"))}:</strong> neikiri (Jind\u0159ich Stoklasa)</div><div><strong>${this._escapeHtml(t("help.version"))}:</strong> ${this._escapeHtml(NPE_VERSION)}</div><div><strong>${this._escapeHtml(t("help.github"))}:</strong> <a href="${this._escapeAttr(NPE_GITHUB_URL)}" target="_blank" rel="noopener noreferrer">neikiri/neiki-page-editor</a></div></div>`;
  }
  _closeHelp() {
    if (this._helpPanel && this._helpPanel.parentNode) {
      this._helpPanel.parentNode.removeChild(this._helpPanel);
    }
    this._helpPanel = null;
    if (this._helpEscHandler) {
      document.removeEventListener("keydown", this._helpEscHandler);
      this._helpEscHandler = null;
    }
  }
  /**
   * Escape an HTML attribute value.
   * @param {string} str
   * @returns {string}
   */
  _escapeAttr(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  /**
   * Escape HTML entities for text content.
   * @param {string} str
   * @returns {string}
   */
  _escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  /**
   * Bind keyboard shortcuts to the host document.
   */
  _bindKeyboardShortcuts() {
    if (!this._shell) return;
    this._onKeyDown = (e) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      const key = e.key ? e.key.toLowerCase() : "";
      switch (key) {
        case "b":
          e.preventDefault();
          this._commands && this._commands.execute("bold");
          break;
        case "i":
          e.preventDefault();
          this._commands && this._commands.execute("italic");
          break;
        case "u":
          e.preventDefault();
          this._commands && this._commands.execute("underline");
          break;
        case "k":
          e.preventDefault();
          this._bus.emit("toolbar:insert", "link");
          break;
        case "s":
          e.preventDefault();
          this.triggerSave();
          break;
        case "z":
          e.preventDefault();
          if (e.shiftKey) {
            this._commands && this._commands.execute("redo");
          } else {
            this._commands && this._commands.execute("undo");
          }
          break;
        case "y":
          e.preventDefault();
          this._commands && this._commands.execute("redo");
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", this._onKeyDown);
  }
  /**
   * Wire lifecycle callbacks (onChange debounced, onFocus, onBlur) to bus events.
   */
  _bindLifecycleCallbacks() {
    this._bus.on("content:change", ({ html } = {}) => {
      if (this._destroyed) return;
      this._emitContentStats();
      if (typeof this._opts.onChange !== "function") return;
      if (this._onChangeTimer !== null) {
        clearTimeout(this._onChangeTimer);
      }
      this._onChangeTimer = setTimeout(() => {
        this._onChangeTimer = null;
        if (!this._destroyed && typeof this._opts.onChange === "function") {
          this._opts.onChange(html != null ? html : this.getContent());
        }
      }, CHANGE_DEBOUNCE_MS);
    });
    this._bus.on("selection:change", () => {
      if (this._destroyed) return;
      this._emitBlockType();
    });
    this._bus.on("canvas:focus", () => {
      if (this._destroyed) return;
      if (typeof this._opts.onFocus === "function") {
        this._opts.onFocus();
      }
    });
    this._bus.on("canvas:blur", () => {
      if (this._destroyed) return;
      if (typeof this._opts.onBlur === "function") {
        this._opts.onBlur();
      }
    });
  }
  /**
   * Compute and emit current word and character counts via 'content:change'.
   * Does NOT re-emit 'content:change' — just updates the status bar directly.
   */
  _emitContentStats() {
    const text = this.getText ? this.getText() : "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
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
    let blockName = "";
    try {
      const sel = doc.getSelection();
      if (sel && sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        const BLOCK_TAGS = [
          "P",
          "H1",
          "H2",
          "H3",
          "H4",
          "H5",
          "H6",
          "BLOCKQUOTE",
          "PRE",
          "LI",
          "DIV",
          "SECTION",
          "ARTICLE",
          "HEADER",
          "FOOTER",
          "MAIN"
        ];
        while (node && node !== doc.body) {
          if (BLOCK_TAGS.includes(node.nodeName)) {
            blockName = this._blockTagToLabel(node.nodeName);
            break;
          }
          node = node.parentElement;
        }
        if (!blockName && doc.body) blockName = this._i18n.t("heading.paragraph");
      }
    } catch (e) {
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
      "P": t("heading.paragraph"),
      "H1": t("heading.h1"),
      "H2": t("heading.h2"),
      "H3": t("heading.h3"),
      "H4": t("heading.h4"),
      "H5": t("heading.h5"),
      "H6": t("heading.h6"),
      "BLOCKQUOTE": t("toolbar.blockquote"),
      "PRE": t("toolbar.code"),
      "LI": "List Item",
      "DIV": t("heading.paragraph")
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
    if (typeof this._opts.loadHandler === "function") {
      try {
        payload = await this._opts.loadHandler();
      } catch (e) {
        payload = null;
      }
    }
    if (payload) {
      this._applyLoadPayload(payload);
    } else {
      const fallback = this._opts.initialContent || (this._target ? this._target.innerHTML || "" : "");
      if (fallback && this._serializer) {
        this._serializer.setContent(fallback);
      }
    }
    if (this._autosave) {
      const draft = this._autosave.restore();
      if (draft && !payload && !this._opts.initialContent) {
        if (this._serializer) {
          this._serializer.setContent(draft);
        }
      }
    }
    this._emitContentStats();
    if (this._opts.autofocus) {
      this.focus();
    }
    this._bus.emit("editor:ready");
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
    if (!payload || typeof payload !== "object") return;
    let bodyHtml = "";
    let cssString = typeof payload.css === "string" ? payload.css : "";
    let cssUrls = Array.isArray(payload.cssUrls) ? payload.cssUrls : [];
    const assetsBaseUrl = typeof payload.assetsBaseUrl === "string" ? payload.assetsBaseUrl : this._opts.assetsBaseUrl || "";
    if (typeof payload.fullHtml === "string" && payload.fullHtml.trim()) {
      const parsed = this._fullHtmlParser ? this._fullHtmlParser.parse(payload.fullHtml, {
        stylesheetUrlValidator: this._opts.stylesheetUrlValidator
      }) : { bodyHtml: "", styleBlocks: [], cssUrls: [] };
      bodyHtml = parsed.bodyHtml || "";
      if (this._styleManager && parsed.styleBlocks && parsed.styleBlocks.length) {
        this._styleManager.addExtractedStyleBlocks(parsed.styleBlocks);
      }
      if (parsed.cssUrls && parsed.cssUrls.length) {
        cssUrls = [...cssUrls, ...parsed.cssUrls];
      }
    } else if (typeof payload.html === "string") {
      bodyHtml = payload.html;
    }
    if (this._sanitizer && bodyHtml) {
      bodyHtml = this._sanitizer.sanitize(bodyHtml);
    }
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      body.innerHTML = bodyHtml;
    }
    if (assetsBaseUrl) {
      this._assetsBaseUrl = assetsBaseUrl;
    }
    if (payload.metadata && typeof payload.metadata === "object") {
      this._metadata = Object.assign({}, payload.metadata);
    }
    this._cssUrls = cssUrls.slice();
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
        styleManager: this._styleManager,
        sanitizer: this._sanitizer,
        i18n: this._i18n,
        hostEl: this._shell || document.body
      });
    }
    this._sourceViewModal.open();
  }
  // ─── Find & Replace ───────────────────────────────────────────────────────────
  _openFindReplace() {
    if (!this._findReplaceModal) {
      this._findReplaceModal = new FindReplaceModal({
        canvasManager: this._canvas,
        i18n: this._i18n,
        hostEl: this._shell || document.body
      });
    }
    this._findReplaceModal.open();
  }
  // ─── Canvas tab shortcuts ─────────────────────────────────────────────────────
  _bindCanvasTabShortcuts() {
    const doc = this._getIframeDoc();
    if (!doc) return;
    const handler = (e) => {
      if (e.key !== "Tab") return;
      e.preventDefault();
      if (this._commands) {
        this._commands.execute(e.shiftKey ? "outdent" : "indent");
      }
    };
    try {
      doc.addEventListener("keydown", handler);
      this._iframeTabHandler = handler;
    } catch (e) {
    }
  }
  /** @returns {Document|null} */
  _getIframeDoc() {
    if (!this._canvas) return null;
    try {
      return this._canvas.getDocument ? this._canvas.getDocument() : null;
    } catch (e) {
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
    this._canvas = refs.canvas || this._canvas;
    this._styleManager = refs.styleManager || this._styleManager;
    this._serializer = refs.serializer || this._serializer;
    this._sanitizer = refs.sanitizer || this._sanitizer;
    if (this._commands) this._commands.destroy();
    this._commands = new CommandRegistry(
      this._canvas,
      this._bus,
      this._styleManager,
      this._sanitizer
    );
    if (this._toolbarState) this._toolbarState.destroy();
    this._toolbarState = new ToolbarState(
      this._toolbarBuilder,
      this._canvas,
      this._bus
    );
    if (this._overlayManager) {
      this._overlayManager.attachCanvas(this._canvas);
    }
    this._bindCanvasTabShortcuts();
  }
  // ─── Public accessors for integration ───────────────────────────────────────
  /** @returns {import('../i18n/i18n').I18nInstance} */
  getI18n() {
    return this._i18n;
  }
  /** @returns {ToolbarBuilder|null} */
  getToolbarBuilder() {
    return this._toolbarBuilder;
  }
  /** @returns {EventBus} */
  getBus() {
    return this._bus;
  }
  /** @returns {CommandRegistry|null} */
  getCommandRegistry() {
    return this._commands;
  }
  // ─── Public API ─────────────────────────────────────────────────────────────
  /** @returns {string} Sanitized HTML of current canvas content */
  getContent() {
    return this._serializer ? this._serializer.getContent() : "";
  }
  /** @param {string} html */
  setContent(html) {
    if (this._serializer) this._serializer.setContent(html);
  }
  /**
   * Get current page state as a PagePayload.
   * @returns {{ html: string, css?: string, cssUrls?: string[], assetsBaseUrl?: string, metadata?: object }}
   */
  getPage() {
    const page = {
      html: this.getContent()
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
    if (!payload || typeof payload !== "object") return;
    this._applyLoadPayload(payload);
  }
  /** @returns {string} Current page CSS string */
  getStyles() {
    return this._styleManager ? this._styleManager.getStyles() : "";
  }
  /** @param {string} css */
  setStyles(css) {
    if (this._styleManager) this._styleManager.setStyles(css);
  }
  /** @returns {string} Plain text of canvas content */
  getText() {
    return this._serializer ? this._serializer.getText() : "";
  }
  /** @returns {boolean} */
  isEmpty() {
    return this._serializer ? this._serializer.isEmpty() : true;
  }
  /**
   * Move focus into the iframe canvas body.
   */
  focus() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      try {
        body.focus();
      } catch (e) {
      }
    }
  }
  /**
   * Move focus away from the iframe canvas body.
   */
  blur() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      try {
        body.blur();
      } catch (e) {
      }
    }
  }
  /**
   * Re-enable the editor canvas (make it editable again).
   */
  enable() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      body.contentEditable = "true";
      body.setAttribute("aria-disabled", "false");
    }
    if (this._shell) {
      this._shell.classList.remove("npe-disabled");
    }
  }
  /**
   * Disable editing on the canvas (read-only mode).
   */
  disable() {
    const body = this._canvas ? this._canvas.getBody() : null;
    if (body) {
      body.contentEditable = "false";
      body.setAttribute("aria-disabled", "true");
    }
    if (this._shell) {
      this._shell.classList.add("npe-disabled");
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
    if (typeof this._opts.saveHandler === "function") {
      try {
        await this._opts.saveHandler(payload);
        if (this._autosave) this._autosave.clear();
        if (typeof this._opts.onSave === "function") {
          this._opts.onSave(payload);
        }
        this._bus.emit("editor:saved", payload);
      } catch (err) {
        this._showSaveErrorToast();
        this._bus.emit("editor:saveFailed", err);
        throw err;
      }
    } else {
      if (this._autosave) this._autosave.clear();
      if (typeof this._opts.onSave === "function") {
        this._opts.onSave(payload);
      }
      this._bus.emit("editor:saved", payload);
    }
  }
  /**
   * Show a non-blocking toast message for save failure.
   * Auto-dismisses after TOAST_DURATION_MS. Uses npe- prefixed class names.
   */
  _showSaveErrorToast() {
    if (!this._shell) return;
    const existing = this._shell.querySelector(".npe-toast");
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
    const toast = document.createElement("div");
    toast.className = "npe-toast npe-toast--error";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.textContent = this._i18n.t("error.saveFailed");
    this._shell.appendChild(toast);
    const timer = setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, TOAST_DURATION_MS);
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
      this._shell.classList.add("npe-fullscreen");
    } else {
      this._shell.classList.remove("npe-fullscreen");
    }
    this._bus.emit("editor:fullscreenChange", this._fullscreen);
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
    if (this._onChangeTimer !== null) {
      clearTimeout(this._onChangeTimer);
      this._onChangeTimer = null;
    }
    if (this._toastTimers) {
      for (const t of this._toastTimers) clearTimeout(t);
      this._toastTimers = [];
    }
    if (this._onKeyDown) {
      document.removeEventListener("keydown", this._onKeyDown);
      this._onKeyDown = null;
    }
    const doc = this._getIframeDoc();
    if (doc && this._iframeTabHandler) {
      try {
        doc.removeEventListener("keydown", this._iframeTabHandler);
      } catch (e) {
      }
      this._iframeTabHandler = null;
    }
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
    if (this._commands) {
      this._commands.destroy();
      this._commands = null;
    }
    if (this._overlayManager) {
      this._overlayManager.destroy();
      this._overlayManager = null;
    }
    if (this._toolbarState) {
      this._toolbarState.destroy();
      this._toolbarState = null;
    }
    if (this._toolbarBuilder) {
      this._toolbarBuilder.destroy();
      this._toolbarBuilder = null;
    }
    if (this._canvas) {
      this._canvas.destroy();
      this._canvas = null;
    }
    if (this._styleManager) {
      this._styleManager.destroy();
      this._styleManager = null;
    }
    if (this._themeManager) {
      this._themeManager.destroy();
      this._themeManager = null;
    }
    if (this._statusBar) {
      this._statusBar.destroy();
      this._statusBar = null;
    }
    if (this._autosave) {
      this._autosave.destroy();
      this._autosave = null;
    }
    this._closeHelp();
    this._bus.destroy();
    if (this._shell) {
      const npeNodes = this._shell.querySelectorAll('[class*="npe-"]');
      for (const node of Array.from(npeNodes)) {
        if (node.parentNode) node.parentNode.removeChild(node);
      }
      if (this._shell.parentNode) {
        this._shell.parentNode.removeChild(this._shell);
      }
    }
    this._shell = null;
    this._toolbarEl = null;
    this._canvasWrapper = null;
  }
};

// src/neiki-page-editor.css
var EDITOR_CSS = `/**\r
 * Neiki's Page Editor \u2014 editor chrome CSS\r
 * All classes use the npe- prefix to avoid conflicts with page content.\r
 * Theme CSS (dark, blue, etc.) comes at the end of this file.\r
 */\r
\r
/* \u2500\u2500\u2500 CSS Custom Properties (light theme defaults) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
:root,\r
.npe-editor {\r
  --npe-font: system-ui, -apple-system, sans-serif;\r
  --npe-font-size: 13px;\r
\r
  /* Chrome colors */\r
  --npe-chrome-bg: #f5f5f5;\r
  --npe-chrome-border: #d0d0d0;\r
  --npe-chrome-text: #222;\r
  --npe-chrome-text-muted: #666;\r
\r
  /* Toolbar */\r
  --npe-toolbar-bg: #ffffff;\r
  --npe-toolbar-border: #d0d0d0;\r
  --npe-toolbar-btn-hover-bg: #e8e8e8;\r
  --npe-toolbar-btn-active-bg: #d0e4ff;\r
  --npe-toolbar-btn-active-text: #0057cc;\r
  --npe-toolbar-separator: #d0d0d0;\r
\r
  /* Canvas */\r
  --npe-canvas-bg: #fff;\r
  --npe-canvas-border: #d0d0d0;\r
\r
  /* Status bar */\r
  --npe-statusbar-bg: #f0f0f0;\r
  --npe-statusbar-border: #d0d0d0;\r
  --npe-statusbar-text: #555;\r
\r
  /* Focus ring */\r
  --npe-focus-ring: 0 0 0 2px #0057cc66;\r
\r
  /* Z-index layers */\r
  --npe-z-overlay: 10;\r
  --npe-z-toolbar: 20;\r
  --npe-z-modal: 1000;\r
  --npe-z-toast: 1100;\r
}\r
\r
/* \u2500\u2500\u2500 Editor Shell \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-editor {\r
  display: flex;\r
  flex-direction: column;\r
  font-family: var(--npe-font);\r
  font-size: var(--npe-font-size);\r
  color: var(--npe-chrome-text);\r
  background: var(--npe-chrome-bg);\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 4px;\r
  box-sizing: border-box;\r
  position: relative;\r
  width: 100%;\r
  height: 100%;\r
}\r
\r
.npe-editor *,\r
.npe-editor *::before,\r
.npe-editor *::after {\r
  box-sizing: border-box;\r
}\r
\r
/* \u2500\u2500\u2500 Toolbar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-toolbar {\r
  display: flex;\r
  flex-wrap: wrap;\r
  align-items: center;\r
  gap: 2px;\r
  padding: 3px 6px;\r
  background: var(--npe-toolbar-bg);\r
  border-bottom: 1px solid var(--npe-toolbar-border);\r
  position: relative;\r
  z-index: var(--npe-z-toolbar);\r
  min-height: 40px;\r
}\r
\r
.npe-toolbar-group {\r
  display: flex;\r
  align-items: center;\r
  flex-wrap: nowrap;\r
  gap: 1px;\r
  padding: 0 2px;\r
}\r
\r
/* Toolbar separator */\r
.npe-toolbar-sep {\r
  display: inline-block;\r
  width: 1px;\r
  height: 20px;\r
  background: var(--npe-toolbar-separator);\r
  margin: 0 4px;\r
  flex-shrink: 0;\r
}\r
\r
/* Toolbar buttons */\r
.npe-btn {\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
  min-width: 26px;\r
  height: 26px;\r
  padding: 0 4px;\r
  background: transparent;\r
  border: 1px solid transparent;\r
  border-radius: 3px;\r
  color: var(--npe-chrome-text);\r
  cursor: pointer;\r
  font-family: var(--npe-font);\r
  font-size: var(--npe-font-size);\r
  line-height: 1;\r
  transition: background 0.1s, border-color 0.1s;\r
  white-space: nowrap;\r
  user-select: none;\r
}\r
\r
.npe-btn:hover {\r
  background: var(--npe-toolbar-btn-hover-bg);\r
  border-color: var(--npe-chrome-border);\r
}\r
\r
.npe-btn:focus-visible {\r
  outline: none;\r
  box-shadow: var(--npe-focus-ring);\r
}\r
\r
.npe-btn[aria-pressed="true"],\r
.npe-btn.npe-active {\r
  background: var(--npe-toolbar-btn-active-bg);\r
  color: var(--npe-toolbar-btn-active-text);\r
  border-color: var(--npe-toolbar-btn-active-bg);\r
}\r
\r
.npe-btn[aria-disabled="true"],\r
.npe-btn:disabled {\r
  opacity: 0.4;\r
  cursor: default;\r
  pointer-events: none;\r
}\r
\r
/* SVG icons inside toolbar buttons */\r
.npe-btn svg {\r
  width: 16px;\r
  height: 16px;\r
  fill: currentColor;\r
  display: block;\r
  pointer-events: none;\r
}\r
\r
/* Visible text label inside a button (used by Insert dropdown) */\r
.npe-btn-label {\r
  font-family: var(--npe-font);\r
  font-size: var(--npe-font-size);\r
  line-height: 1;\r
  pointer-events: none;\r
  white-space: nowrap;\r
  margin-left: 2px;\r
}\r
\r
/* \u2500\u2500\u2500 Canvas Wrapper \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-canvas-wrapper {\r
  position: relative;\r
  background: var(--npe-canvas-bg);\r
  flex: 1 1 auto;\r
  overflow: hidden;\r
  /* Ensure the wrapper has an intrinsic height so the iframe fills it */\r
  display: flex;\r
  flex-direction: column;\r
}\r
\r
.npe-canvas-wrapper iframe {\r
  display: block;\r
  width: 100%;\r
  flex: 1 1 auto;\r
  /* iframe height falls back to min-height when no explicit height is set */\r
  min-height: inherit;\r
  border: 0;\r
}\r
\r
/* \u2500\u2500\u2500 Overlay Layer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-overlay-layer {\r
  position: absolute;\r
  top: 0;\r
  left: 0;\r
  width: 100%;\r
  height: 100%;\r
  pointer-events: none;\r
  z-index: var(--npe-z-overlay);\r
}\r
\r
/* \u2500\u2500\u2500 Status Bar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-statusbar {\r
  display: flex;\r
  align-items: center;\r
  gap: 16px;\r
  padding: 3px 10px;\r
  background: var(--npe-statusbar-bg);\r
  border-top: 1px solid var(--npe-statusbar-border);\r
  color: var(--npe-statusbar-text);\r
  font-size: 11px;\r
  min-height: 24px;\r
  flex-shrink: 0;\r
}\r
\r
.npe-statusbar-item {\r
  display: flex;\r
  align-items: center;\r
  gap: 4px;\r
  white-space: nowrap;\r
}\r
\r
/* \u2500\u2500\u2500 Dropdowns \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-dropdown {\r
  position: absolute;\r
  top: 100%;\r
  left: 0;\r
  min-width: 160px;\r
  background: var(--npe-toolbar-bg);\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 4px;\r
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);\r
  z-index: var(--npe-z-modal);\r
  padding: 4px 0;\r
  list-style: none;\r
  margin: 2px 0 0;\r
}\r
\r
.npe-dropdown-item {\r
  display: flex;\r
  align-items: center;\r
  gap: 8px;\r
  padding: 6px 12px;\r
  cursor: pointer;\r
  color: var(--npe-chrome-text);\r
  font-size: var(--npe-font-size);\r
  white-space: nowrap;\r
}\r
\r
.npe-dropdown-item:hover {\r
  background: var(--npe-toolbar-btn-hover-bg);\r
}\r
\r
.npe-dropdown-item-icon {\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
  width: 16px;\r
  height: 16px;\r
  flex-shrink: 0;\r
  color: var(--npe-chrome-text);\r
}\r
\r
.npe-dropdown-item-icon svg {\r
  width: 16px;\r
  height: 16px;\r
  fill: currentColor;\r
  display: block;\r
}\r
\r
/* \u2500\u2500\u2500 Modals \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-modal-backdrop {\r
  position: fixed;\r
  inset: 0;\r
  background: rgba(0, 0, 0, 0.4);\r
  z-index: calc(var(--npe-z-modal) - 1);\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
}\r
\r
.npe-modal {\r
  background: var(--npe-toolbar-bg);\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 6px;\r
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);\r
  min-width: 320px;\r
  max-width: min(600px, calc(100vw - 32px));\r
  max-height: calc(100vh - 48px);\r
  overflow: auto;\r
  padding: 20px 24px;\r
  position: relative;\r
  z-index: var(--npe-z-modal);\r
}\r
\r
.npe-modal-header {\r
  display: flex;\r
  align-items: center;\r
  justify-content: space-between;\r
  margin-bottom: 16px;\r
  flex-shrink: 0;\r
}\r
\r
.npe-modal-title {\r
  font-size: 16px;\r
  font-weight: 600;\r
  margin: 0;\r
  color: var(--npe-chrome-text);\r
}\r
\r
.npe-modal-close {\r
  background: none;\r
  border: none;\r
  font-size: 20px;\r
  line-height: 1;\r
  cursor: pointer;\r
  color: var(--npe-chrome-text-muted);\r
  padding: 0 4px;\r
  border-radius: 3px;\r
}\r
\r
.npe-modal-close:hover {\r
  background: var(--npe-toolbar-btn-hover-bg);\r
  color: var(--npe-chrome-text);\r
}\r
\r
.npe-modal-tabs {\r
  display: flex;\r
  gap: 2px;\r
  border-bottom: 1px solid var(--npe-chrome-border);\r
  margin-bottom: 12px;\r
  flex-shrink: 0;\r
}\r
\r
.npe-tab {\r
  background: none;\r
  border: none;\r
  border-bottom: 2px solid transparent;\r
  padding: 6px 12px;\r
  font-family: var(--npe-font);\r
  font-size: var(--npe-font-size);\r
  color: var(--npe-chrome-text-muted);\r
  cursor: pointer;\r
  margin-bottom: -1px;\r
}\r
\r
.npe-tab:hover {\r
  color: var(--npe-chrome-text);\r
}\r
\r
.npe-tab.npe-tab-active {\r
  color: var(--npe-chrome-text);\r
  border-bottom-color: var(--npe-toolbar-btn-active-text, #0057cc);\r
  font-weight: 600;\r
}\r
\r
.npe-modal-panel {\r
  flex: 1;\r
  display: flex;\r
  flex-direction: column;\r
  min-height: 0;\r
}\r
\r
.npe-modal-footer {\r
  display: flex;\r
  justify-content: flex-end;\r
  gap: 8px;\r
  margin-top: 16px;\r
  padding-top: 12px;\r
  border-top: 1px solid var(--npe-chrome-border);\r
  flex-shrink: 0;\r
}\r
\r
.npe-modal-actions {\r
  display: flex;\r
  justify-content: flex-end;\r
  gap: 8px;\r
  margin-top: 16px;\r
}\r
\r
/* \u2500\u2500\u2500 Source View Modal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-source-modal {\r
  width: min(1100px, calc(100vw - 32px));\r
  max-width: min(1100px, calc(100vw - 32px));\r
  max-height: calc(100vh - 48px);\r
  display: flex;\r
  flex-direction: column;\r
  overflow: hidden;\r
  padding: 20px 24px 0;\r
}\r
\r
/* Ensure [hidden] attribute hides panels even when display:flex is set */\r
.npe-source-panel[hidden] {\r
  display: none !important;\r
}\r
\r
.npe-source-panel {\r
  flex: 1;\r
  display: flex;\r
  flex-direction: column;\r
  min-height: 0;\r
  overflow: hidden;\r
}\r
\r
.npe-source-textarea {\r
  flex: 1;\r
  width: 100%;\r
  min-height: 300px;\r
  max-height: calc(100vh - 280px);\r
  padding: 10px 12px;\r
  font-family: 'Consolas', 'Menlo', 'Monaco', 'Courier New', monospace;\r
  font-size: 12px;\r
  line-height: 1.5;\r
  background: var(--npe-canvas-bg);\r
  color: var(--npe-chrome-text);\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 4px;\r
  resize: vertical;\r
  box-sizing: border-box;\r
  outline: none;\r
}\r
\r
.npe-source-textarea:focus {\r
  box-shadow: var(--npe-focus-ring);\r
}\r
\r
.npe-source-modal .npe-modal-footer {\r
  padding-bottom: 16px;\r
}\r
\r
/* \u2500\u2500\u2500 Select controls \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-select {\r
  height: 26px;\r
  padding: 0 4px;\r
  background: var(--npe-toolbar-bg);\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 3px;\r
  color: var(--npe-chrome-text);\r
  font-family: var(--npe-font);\r
  font-size: var(--npe-font-size);\r
  cursor: pointer;\r
}\r
\r
.npe-select:focus-visible {\r
  outline: none;\r
  box-shadow: var(--npe-focus-ring);\r
}\r
\r
/* \u2500\u2500\u2500 Font Size Widget \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-font-size-widget {\r
  display: inline-flex;\r
  align-items: center;\r
  gap: 0;\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 3px;\r
  overflow: visible;\r
  background: var(--npe-toolbar-bg);\r
  height: 26px;\r
}\r
\r
.npe-font-size-widget input[type="number"] {\r
  width: 36px;\r
  height: 24px;\r
  text-align: center;\r
  border: none;\r
  border-left: 1px solid var(--npe-chrome-border);\r
  border-right: 1px solid var(--npe-chrome-border);\r
  background: var(--npe-toolbar-bg);\r
  color: var(--npe-chrome-text);\r
  font-family: var(--npe-font);\r
  font-size: var(--npe-font-size);\r
  padding: 0 2px;\r
  /* Hide spin buttons */\r
  -moz-appearance: textfield;\r
}\r
\r
.npe-font-size-widget input[type="number"]::-webkit-inner-spin-button,\r
.npe-font-size-widget input[type="number"]::-webkit-outer-spin-button {\r
  -webkit-appearance: none;\r
}\r
\r
/* \u2500\u2500\u2500 Color Picker \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-color-swatch {\r
  display: inline-block;\r
  width: 12px;\r
  height: 12px;\r
  border-radius: 2px;\r
  margin-top: 1px;\r
  margin-left: 2px;\r
  flex-shrink: 0;\r
  /* Default: no color selected \u2014 show border outline */\r
  border: 1px solid var(--npe-chrome-border);\r
  background-color: transparent;\r
}\r
\r
.npe-color-panel {\r
  position: absolute;\r
  top: 100%;\r
  left: 0;\r
  background: var(--npe-toolbar-bg);\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 4px;\r
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\r
  padding: 10px;\r
  z-index: var(--npe-z-modal);\r
  min-width: 220px;\r
}\r
\r
.npe-color-swatches {\r
  display: grid;\r
  grid-template-columns: repeat(10, 20px);\r
  gap: 3px;\r
  margin-bottom: 8px;\r
}\r
\r
.npe-color-swatch-btn {\r
  width: 20px;\r
  height: 20px;\r
  border: 1px solid rgba(0, 0, 0, 0.15);\r
  border-radius: 2px;\r
  cursor: pointer;\r
  padding: 0;\r
}\r
\r
.npe-color-swatch-btn:hover {\r
  transform: scale(1.2);\r
  z-index: 1;\r
}\r
\r
/* \u2500\u2500\u2500 Toast / Non-blocking notifications \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-toast-container {\r
  position: absolute;\r
  bottom: 40px;\r
  left: 50%;\r
  transform: translateX(-50%);\r
  z-index: var(--npe-z-toast);\r
  display: flex;\r
  flex-direction: column;\r
  align-items: center;\r
  gap: 6px;\r
  pointer-events: none;\r
}\r
\r
.npe-toast {\r
  background: #333;\r
  color: #fff;\r
  padding: 8px 14px;\r
  border-radius: 4px;\r
  font-size: 12px;\r
  opacity: 1;\r
  transition: opacity 0.3s;\r
  pointer-events: auto;\r
}\r
\r
.npe-toast.npe-toast-error {\r
  background: #cc3333;\r
}\r
\r
/* \u2500\u2500\u2500 Fullscreen mode \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-editor.npe-fullscreen {\r
  position: fixed;\r
  inset: 0;\r
  z-index: calc(var(--npe-z-modal) + 100);\r
  border-radius: 0;\r
}\r
\r
/* \u2500\u2500\u2500 Dark Theme \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-editor.npe-dark {\r
  --npe-chrome-bg: #1e1e1e;\r
  --npe-chrome-border: #3a3a3a;\r
  --npe-chrome-text: #d4d4d4;\r
  --npe-chrome-text-muted: #888;\r
  --npe-toolbar-bg: #252526;\r
  --npe-toolbar-border: #3a3a3a;\r
  --npe-toolbar-btn-hover-bg: #3a3a3a;\r
  --npe-toolbar-btn-active-bg: #094771;\r
  --npe-toolbar-btn-active-text: #4fc3f7;\r
  --npe-toolbar-separator: #3a3a3a;\r
  --npe-canvas-bg: #1e1e1e;\r
  --npe-canvas-border: #3a3a3a;\r
  --npe-statusbar-bg: #1b1b1b;\r
  --npe-statusbar-border: #3a3a3a;\r
  --npe-statusbar-text: #888;\r
  --npe-focus-ring: 0 0 0 2px #4fc3f766;\r
}\r
\r
/* \u2500\u2500\u2500 Blue Theme \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-editor.npe-theme-blue {\r
  --npe-chrome-bg: #e8f0fe;\r
  --npe-chrome-border: #aac4f6;\r
  --npe-chrome-text: #0d2663;\r
  --npe-chrome-text-muted: #3a5aa8;\r
  --npe-toolbar-bg: #f0f6ff;\r
  --npe-toolbar-border: #aac4f6;\r
  --npe-toolbar-btn-hover-bg: #d0e4ff;\r
  --npe-toolbar-btn-active-bg: #0057cc;\r
  --npe-toolbar-btn-active-text: #fff;\r
  --npe-toolbar-separator: #aac4f6;\r
  --npe-canvas-bg: #fff;\r
  --npe-canvas-border: #aac4f6;\r
  --npe-statusbar-bg: #dce9ff;\r
  --npe-statusbar-border: #aac4f6;\r
  --npe-statusbar-text: #3a5aa8;\r
}\r
\r
/* \u2500\u2500\u2500 Dark Blue Theme \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-editor.npe-theme-dark-blue {\r
  --npe-chrome-bg: #0a1628;\r
  --npe-chrome-border: #1e3a5f;\r
  --npe-chrome-text: #c8d8f0;\r
  --npe-chrome-text-muted: #6a8cba;\r
  --npe-toolbar-bg: #0d1f3c;\r
  --npe-toolbar-border: #1e3a5f;\r
  --npe-toolbar-btn-hover-bg: #1e3a5f;\r
  --npe-toolbar-btn-active-bg: #1a5cc7;\r
  --npe-toolbar-btn-active-text: #fff;\r
  --npe-toolbar-separator: #1e3a5f;\r
  --npe-canvas-bg: #0d1f3c;\r
  --npe-canvas-border: #1e3a5f;\r
  --npe-statusbar-bg: #091526;\r
  --npe-statusbar-border: #1e3a5f;\r
  --npe-statusbar-text: #6a8cba;\r
  --npe-focus-ring: 0 0 0 2px #4d9fff66;\r
}\r
\r
/* \u2500\u2500\u2500 Midnight Theme \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-editor.npe-theme-midnight {\r
  --npe-chrome-bg: #0c0c18;\r
  --npe-chrome-border: #2a2a40;\r
  --npe-chrome-text: #c0c0e0;\r
  --npe-chrome-text-muted: #6060a0;\r
  --npe-toolbar-bg: #111128;\r
  --npe-toolbar-border: #2a2a40;\r
  --npe-toolbar-btn-hover-bg: #2a2a40;\r
  --npe-toolbar-btn-active-bg: #3a3a7a;\r
  --npe-toolbar-btn-active-text: #c0c0ff;\r
  --npe-toolbar-separator: #2a2a40;\r
  --npe-canvas-bg: #111128;\r
  --npe-canvas-border: #2a2a40;\r
  --npe-statusbar-bg: #090914;\r
  --npe-statusbar-border: #2a2a40;\r
  --npe-statusbar-text: #6060a0;\r
  --npe-focus-ring: 0 0 0 2px #7070ff66;\r
}\r
\r
/* Void Theme \u2014 dark purple cyberpunk */\r
.npe-editor.npe-theme-void {\r
  --npe-chrome-bg: #150f2b;\r
  --npe-chrome-border: #3d2e6b;\r
  --npe-chrome-text: #ece6ff;\r
  --npe-chrome-text-muted: #8a7ab0;\r
  --npe-toolbar-bg: #130c26;\r
  --npe-toolbar-border: #3d2e6b;\r
  --npe-toolbar-btn-hover-bg: #2a1f52;\r
  --npe-toolbar-btn-active-bg: #362a66;\r
  --npe-toolbar-btn-active-text: #e040fb;\r
  --npe-toolbar-separator: #3d2e6b;\r
  --npe-canvas-bg: #0a0614;\r
  --npe-canvas-border: #3d2e6b;\r
  --npe-statusbar-bg: #130c26;\r
  --npe-statusbar-border: #3d2e6b;\r
  --npe-statusbar-text: #8a7ab0;\r
  --npe-focus-ring: 0 0 0 2px #b026ff66;\r
}\r
\r
/* Void \u2014 neon glow accents for a cyberpunk feel */\r
.npe-editor.npe-theme-void .npe-toolbar {\r
  box-shadow: 0 1px 12px rgba(176, 38, 255, 0.15);\r
}\r
\r
.npe-editor.npe-theme-void .npe-btn:hover {\r
  box-shadow: 0 0 10px rgba(176, 38, 255, 0.5);\r
}\r
\r
.npe-editor.npe-theme-void .npe-btn[aria-pressed="true"],\r
.npe-editor.npe-theme-void .npe-btn.npe-active {\r
  box-shadow: 0 0 8px rgba(176, 38, 255, 0.65);\r
}\r
\r
.npe-editor.npe-theme-void .npe-canvas-wrapper {\r
  box-shadow: inset 0 0 24px rgba(176, 38, 255, 0.08);\r
}\r
\r
/* Autumn Theme \u2014 warm retro palette */\r
.npe-editor.npe-theme-autumn {\r
  --npe-chrome-bg: #32302f;\r
  --npe-chrome-border: #3c3836;\r
  --npe-chrome-text: #ebdbb2;\r
  --npe-chrome-text-muted: #a89984;\r
  --npe-toolbar-bg: #32302f;\r
  --npe-toolbar-border: #3c3836;\r
  --npe-toolbar-btn-hover-bg: #504945;\r
  --npe-toolbar-btn-active-bg: #665c54;\r
  --npe-toolbar-btn-active-text: #d65d0e;\r
  --npe-toolbar-separator: #3c3836;\r
  --npe-canvas-bg: #282828;\r
  --npe-canvas-border: #3c3836;\r
  --npe-statusbar-bg: #32302f;\r
  --npe-statusbar-border: #3c3836;\r
  --npe-statusbar-text: #a89984;\r
  --npe-focus-ring: 0 0 0 2px #fe801966;\r
}\r
\r
/* \u2500\u2500\u2500 Toolbar Group Responsive Wrapping \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-toolbar-group {\r
  display: inline-flex;\r
  align-items: center;\r
  flex-wrap: nowrap;\r
  gap: 1px;\r
  padding: 0 2px;\r
  /* Groups never split across lines \u2014 they wrap as units */\r
}\r
\r
/* \u2500\u2500\u2500 Dropdown Arrow \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-dropdown-arrow {\r
  display: inline-flex;\r
  align-items: center;\r
  opacity: 0.7;\r
  pointer-events: none;\r
  flex-shrink: 0;\r
}\r
\r
.npe-dropdown-arrow svg {\r
  width: 16px;\r
  height: 16px;\r
  fill: currentColor;\r
  display: block;\r
}\r
\r
/* \u2500\u2500\u2500 More Menu \u2014 pushed to far right of toolbar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-toolbar-group:has(.npe-more-menu-btn),\r
.npe-more-menu-group {\r
  margin-left: auto;\r
}\r
\r
/* \u2500\u2500\u2500 Heading Select \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-heading-select {\r
  max-width: 110px;\r
}\r
\r
/* \u2500\u2500\u2500 Font Family Select \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-font-family-select {\r
  max-width: 120px;\r
}\r
\r
/* \u2500\u2500\u2500 Font Size Widget \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
\r
/* Replace the <select> with a custom dropdown trigger button */\r
.npe-font-size-dropdown-btn {\r
  width: 22px;\r
  height: 24px;\r
  padding: 0;\r
  border: none;\r
  border-left: 1px solid var(--npe-chrome-border);\r
  border-radius: 0 2px 2px 0;\r
  background: var(--npe-toolbar-bg);\r
  cursor: pointer;\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
  color: var(--npe-chrome-text);\r
  opacity: 0.7;\r
}\r
\r
.npe-font-size-dropdown-btn:hover {\r
  background: var(--npe-toolbar-btn-hover-bg);\r
  opacity: 1;\r
}\r
\r
.npe-font-size-dropdown-btn svg {\r
  width: 16px;\r
  height: 16px;\r
  fill: currentColor;\r
  pointer-events: none;\r
}\r
\r
/* The popup list */\r
.npe-font-size-popup {\r
  position: absolute;\r
  top: 100%;\r
  left: 0;\r
  background: var(--npe-toolbar-bg);\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 4px;\r
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);\r
  z-index: var(--npe-z-modal);\r
  padding: 4px 0;\r
  min-width: 64px;\r
  max-height: 220px;\r
  overflow-y: auto;\r
}\r
\r
.npe-font-size-popup-item {\r
  display: block;\r
  width: 100%;\r
  padding: 4px 12px;\r
  background: none;\r
  border: none;\r
  text-align: left;\r
  font-family: var(--npe-font);\r
  font-size: var(--npe-font-size);\r
  color: var(--npe-chrome-text);\r
  cursor: pointer;\r
  white-space: nowrap;\r
}\r
\r
.npe-font-size-popup-item:hover,\r
.npe-font-size-popup-item.npe-active {\r
  background: var(--npe-toolbar-btn-hover-bg);\r
}\r
\r
.npe-font-size-dec,\r
.npe-font-size-inc {\r
  min-width: 22px;\r
  height: 24px;\r
  padding: 0 3px;\r
  border: none;\r
  border-radius: 0;\r
}\r
\r
.npe-font-size-dec {\r
  border-radius: 2px 0 0 2px;\r
}\r
\r
.npe-font-size-inc {\r
  border-radius: 0;\r
}\r
\r
/* Hide the old <select>-based preset */\r
.npe-font-size-preset {\r
  display: none;\r
}\r
\r
/* \u2500\u2500\u2500 Color Picker Panel Layout \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-color-picker-row {\r
  display: flex;\r
  align-items: center;\r
  gap: 6px;\r
  margin-bottom: 6px;\r
}\r
\r
.npe-color-hex-input {\r
  flex: 1;\r
  height: 28px;\r
  padding: 0 6px;\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 3px;\r
  font-family: monospace;\r
  font-size: 12px;\r
  background: var(--npe-toolbar-bg);\r
  color: var(--npe-chrome-text);\r
}\r
\r
.npe-color-hex-input:focus-visible {\r
  outline: none;\r
  box-shadow: var(--npe-focus-ring);\r
}\r
\r
.npe-color-native {\r
  width: 32px;\r
  height: 28px;\r
  border: none;\r
  padding: 0;\r
  cursor: pointer;\r
  border-radius: 3px;\r
}\r
\r
/* \u2500\u2500\u2500 Toolbar Button Primary Variant \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-btn.npe-btn-primary {\r
  background: var(--npe-toolbar-btn-active-bg);\r
  color: var(--npe-toolbar-btn-active-text);\r
  border-color: transparent;\r
}\r
\r
.npe-btn.npe-btn-primary:hover {\r
  opacity: 0.9;\r
}\r
\r
/* \u2500\u2500\u2500 Disabled toolbar controls \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-btn.npe-disabled {\r
  opacity: 0.4;\r
  cursor: default;\r
  pointer-events: none;\r
}\r
\r
.npe-select:disabled {\r
  opacity: 0.4;\r
  cursor: default;\r
}\r
\r
/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\r
   TASK 6 \u2014 Insert Features: Modals, Table Context Menu, Table Resize,\r
             Emoji / Special Characters Pickers\r
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\r
\r
/* \u2500\u2500\u2500 Modal Header / Footer / Body \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-modal-header {\r
  display: flex;\r
  align-items: center;\r
  justify-content: space-between;\r
  margin-bottom: 16px;\r
}\r
\r
.npe-modal-body {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 10px;\r
}\r
\r
.npe-modal-footer {\r
  display: flex;\r
  justify-content: flex-end;\r
  gap: 8px;\r
  margin-top: 16px;\r
}\r
\r
.npe-modal-close {\r
  background: none;\r
  border: none;\r
  font-size: 20px;\r
  line-height: 1;\r
  cursor: pointer;\r
  color: var(--npe-chrome-text-muted);\r
  padding: 2px 6px;\r
  border-radius: 3px;\r
}\r
\r
.npe-modal-close:hover {\r
  color: var(--npe-chrome-text);\r
  background: var(--npe-toolbar-btn-hover-bg);\r
}\r
\r
.npe-modal-close:focus-visible {\r
  outline: none;\r
  box-shadow: var(--npe-focus-ring);\r
}\r
\r
/* \u2500\u2500\u2500 Modal Tabs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-modal-tabs {\r
  display: flex;\r
  gap: 0;\r
  border-bottom: 2px solid var(--npe-chrome-border);\r
  margin-bottom: 16px;\r
}\r
\r
.npe-tab {\r
  background: none;\r
  border: none;\r
  border-bottom: 2px solid transparent;\r
  margin-bottom: -2px;\r
  padding: 6px 14px;\r
  cursor: pointer;\r
  color: var(--npe-chrome-text-muted);\r
  font-family: var(--npe-font);\r
  font-size: var(--npe-font-size);\r
  font-weight: 500;\r
  transition: color 0.15s, border-color 0.15s;\r
}\r
\r
.npe-tab:hover {\r
  color: var(--npe-chrome-text);\r
}\r
\r
.npe-tab.npe-tab-active {\r
  color: var(--npe-toolbar-btn-active-text);\r
  border-bottom-color: var(--npe-toolbar-btn-active-text);\r
}\r
\r
.npe-tab:focus-visible {\r
  outline: none;\r
  box-shadow: var(--npe-focus-ring);\r
}\r
\r
/* \u2500\u2500\u2500 Modal Panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-modal-panel {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 10px;\r
}\r
\r
/* \u2500\u2500\u2500 Form controls inside modals \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-form-label {\r
  font-size: var(--npe-font-size);\r
  color: var(--npe-chrome-text);\r
  font-weight: 500;\r
  margin-bottom: 2px;\r
}\r
\r
.npe-form-input {\r
  width: 100%;\r
  height: 32px;\r
  padding: 0 8px;\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 4px;\r
  background: var(--npe-toolbar-bg);\r
  color: var(--npe-chrome-text);\r
  font-family: var(--npe-font);\r
  font-size: var(--npe-font-size);\r
  box-sizing: border-box;\r
}\r
\r
.npe-form-input:focus-visible {\r
  outline: none;\r
  box-shadow: var(--npe-focus-ring);\r
  border-color: var(--npe-toolbar-btn-active-text);\r
}\r
\r
.npe-form-check-label {\r
  display: flex;\r
  align-items: center;\r
  gap: 6px;\r
  cursor: pointer;\r
  color: var(--npe-chrome-text);\r
  font-size: var(--npe-font-size);\r
  user-select: none;\r
}\r
\r
.npe-form-checkbox {\r
  width: 14px;\r
  height: 14px;\r
  cursor: pointer;\r
  flex-shrink: 0;\r
}\r
\r
/* Number inputs in table modal */\r
.npe-table-number-input {\r
  width: 80px;\r
}\r
\r
/* \u2500\u2500\u2500 Link Modal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-link-modal {\r
  min-width: 340px;\r
}\r
\r
/* \u2500\u2500\u2500 Image / Video Modals \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-image-modal,\r
.npe-video-modal {\r
  min-width: 380px;\r
}\r
\r
/* \u2500\u2500\u2500 Form group spacing \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-form-group {\r
  display: flex;\r
  flex-direction: column;\r
  gap: 4px;\r
}\r
\r
/* \u2500\u2500\u2500 Upload zone (image modal) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-image-upload-zone {\r
  position: relative;\r
  display: grid;\r
  justify-items: center;\r
  gap: 6px;\r
  padding: 24px 18px;\r
  border: 2px dashed var(--npe-chrome-border);\r
  border-radius: 8px;\r
  background: var(--npe-chrome-bg);\r
  color: var(--npe-chrome-text-muted);\r
  text-align: center;\r
  cursor: pointer;\r
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;\r
  user-select: none;\r
}\r
\r
.npe-image-upload-zone:hover,\r
.npe-image-upload-zone:focus-visible {\r
  border-color: var(--npe-toolbar-btn-active-text, #0057cc);\r
  background: var(--npe-toolbar-btn-active-bg);\r
  box-shadow: 0 0 0 3px rgba(0, 87, 204, 0.1);\r
  outline: none;\r
}\r
\r
.npe-image-upload-zone.drag-over {\r
  border-color: var(--npe-toolbar-btn-active-text, #0057cc);\r
  background: var(--npe-toolbar-btn-active-bg);\r
}\r
\r
.npe-image-upload-zone.has-files {\r
  border-style: solid;\r
  border-color: var(--npe-toolbar-btn-active-text, #0057cc);\r
}\r
\r
.npe-image-upload-icon {\r
  width: 38px;\r
  height: 38px;\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
}\r
\r
.npe-image-upload-icon svg {\r
  width: 38px;\r
  height: 38px;\r
  display: block;\r
  border-radius: 6px;\r
  overflow: hidden;\r
}\r
\r
.npe-image-upload-title {\r
  font-size: 14px;\r
  font-weight: 600;\r
  color: var(--npe-chrome-text);\r
}\r
\r
.npe-image-upload-hint {\r
  font-size: 12px;\r
  color: var(--npe-chrome-text-muted);\r
  line-height: 1.4;\r
}\r
\r
.npe-image-upload-files {\r
  font-size: 12px;\r
  color: var(--npe-chrome-text-muted);\r
  max-width: 100%;\r
  overflow: hidden;\r
  text-overflow: ellipsis;\r
  white-space: nowrap;\r
  line-height: 1.4;\r
  min-height: 1em;\r
}\r
\r
.npe-image-upload-zone.has-files .npe-image-upload-files {\r
  color: var(--npe-toolbar-btn-active-text, #0057cc);\r
  font-weight: 500;\r
}\r
\r
/* \u2500\u2500\u2500 OR divider \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-form-divider {\r
  display: flex;\r
  align-items: center;\r
  margin: 4px 0;\r
  text-align: center;\r
}\r
\r
.npe-form-divider::before,\r
.npe-form-divider::after {\r
  content: '';\r
  flex: 1;\r
  height: 1px;\r
  background: var(--npe-chrome-border);\r
}\r
\r
.npe-form-divider::before { margin-right: 12px; }\r
.npe-form-divider::after  { margin-left:  12px; }\r
\r
.npe-form-divider span {\r
  color: var(--npe-chrome-text-muted);\r
  font-size: 12px;\r
  font-weight: 500;\r
  white-space: nowrap;\r
}\r
\r
/* Dropzone */\r
.npe-dropzone {\r
  border: 2px dashed var(--npe-chrome-border);\r
  border-radius: 6px;\r
  padding: 24px 16px;\r
  text-align: center;\r
  cursor: pointer;\r
  color: var(--npe-chrome-text-muted);\r
  font-size: var(--npe-font-size);\r
  transition: border-color 0.15s, background 0.15s;\r
  user-select: none;\r
}\r
\r
.npe-dropzone:hover,\r
.npe-dropzone-active {\r
  border-color: var(--npe-toolbar-btn-active-text);\r
  background: var(--npe-toolbar-btn-active-bg);\r
  color: var(--npe-toolbar-btn-active-text);\r
}\r
\r
/* Hidden file input */\r
.npe-file-input {\r
  position: absolute;\r
  left: -9999px;\r
  opacity: 0;\r
  pointer-events: none;\r
}\r
\r
/* Upload progress */\r
.npe-upload-progress {\r
  font-size: 12px;\r
  color: var(--npe-chrome-text-muted);\r
  padding: 4px 0;\r
}\r
\r
.npe-upload-progress::before {\r
  content: '\u27F3 ';\r
}\r
\r
/* Upload error */\r
.npe-upload-error {\r
  font-size: 12px;\r
  color: #cc3333;\r
  padding: 4px 0;\r
}\r
\r
/* \u2500\u2500\u2500 Table Modal \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-table-modal {\r
  min-width: 300px;\r
}\r
\r
/* \u2500\u2500\u2500 Emoji Picker / Special Characters Picker \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-emoji-picker,\r
.npe-special-chars-picker {\r
  min-width: 360px;\r
  max-width: 520px;\r
}\r
\r
.npe-emoji-search {\r
  margin-bottom: 10px;\r
}\r
\r
.npe-emoji-grid,\r
.npe-special-chars-grid {\r
  max-height: 320px;\r
  overflow-y: auto;\r
  padding-right: 4px;\r
}\r
\r
.npe-emoji-category-label {\r
  font-size: 11px;\r
  font-weight: 600;\r
  color: var(--npe-chrome-text-muted);\r
  text-transform: uppercase;\r
  letter-spacing: 0.05em;\r
  padding: 8px 2px 4px;\r
}\r
\r
.npe-emoji-row {\r
  display: flex;\r
  flex-wrap: wrap;\r
  gap: 2px;\r
  margin-bottom: 4px;\r
}\r
\r
.npe-emoji-btn {\r
  background: none;\r
  border: 1px solid transparent;\r
  border-radius: 4px;\r
  width: 32px;\r
  height: 32px;\r
  font-size: 18px;\r
  line-height: 1;\r
  cursor: pointer;\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  padding: 0;\r
  transition: background 0.1s;\r
}\r
\r
.npe-emoji-btn:hover {\r
  background: var(--npe-toolbar-btn-hover-bg);\r
  border-color: var(--npe-chrome-border);\r
}\r
\r
.npe-emoji-btn:focus-visible {\r
  outline: none;\r
  box-shadow: var(--npe-focus-ring);\r
}\r
\r
.npe-special-char-btn {\r
  background: none;\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 3px;\r
  width: 34px;\r
  height: 30px;\r
  font-size: 14px;\r
  line-height: 1;\r
  cursor: pointer;\r
  display: flex;\r
  align-items: center;\r
  justify-content: center;\r
  padding: 0;\r
  color: var(--npe-chrome-text);\r
  font-family: serif;\r
  transition: background 0.1s, border-color 0.1s;\r
}\r
\r
.npe-special-char-btn:hover {\r
  background: var(--npe-toolbar-btn-hover-bg);\r
  border-color: var(--npe-toolbar-btn-active-text);\r
}\r
\r
.npe-special-char-btn:focus-visible {\r
  outline: none;\r
  box-shadow: var(--npe-focus-ring);\r
}\r
\r
.npe-emoji-empty {\r
  color: var(--npe-chrome-text-muted);\r
  text-align: center;\r
  padding: 12px 0;\r
  font-size: var(--npe-font-size);\r
}\r
\r
/* \u2500\u2500\u2500 Table Context Menu \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-context-menu {\r
  background: var(--npe-toolbar-bg);\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 4px;\r
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);\r
  min-width: 180px;\r
  padding: 4px 0;\r
  font-family: var(--npe-font);\r
  font-size: var(--npe-font-size);\r
}\r
\r
.npe-context-menu-item {\r
  display: block;\r
  width: 100%;\r
  padding: 7px 14px;\r
  text-align: left;\r
  background: none;\r
  border: none;\r
  color: var(--npe-chrome-text);\r
  cursor: pointer;\r
  font-family: var(--npe-font);\r
  font-size: var(--npe-font-size);\r
  white-space: nowrap;\r
}\r
\r
.npe-context-menu-item:hover,\r
.npe-context-menu-item:focus {\r
  background: var(--npe-toolbar-btn-hover-bg);\r
  outline: none;\r
}\r
\r
.npe-context-menu-item:focus-visible {\r
  box-shadow: inset var(--npe-focus-ring);\r
}\r
\r
.npe-context-menu-sep {\r
  height: 1px;\r
  background: var(--npe-chrome-border);\r
  margin: 4px 0;\r
}\r
\r
/* \u2500\u2500\u2500 Table Column Resize Handle \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-col-resize-handle {\r
  background: var(--npe-toolbar-btn-active-text);\r
  opacity: 0.5;\r
  pointer-events: all;\r
  transition: opacity 0.15s;\r
}\r
\r
.npe-col-resize-handle:hover {\r
  opacity: 0.9;\r
}\r
\r
/* \u2500\u2500\u2500 Find & Replace Modal (additional layout) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-find-replace-modal {\r
  min-width: 380px;\r
}\r
\r
.npe-fr-options {\r
  display: flex;\r
  gap: 16px;\r
  flex-wrap: wrap;\r
}\r
\r
/* \u2500\u2500\u2500 Source Modal (additional layout) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-source-modal {\r
  min-width: 520px;\r
  max-width: 80vw;\r
  width: 600px;\r
}\r
\r
.npe-source-panel {\r
  display: flex;\r
  flex-direction: column;\r
}\r
\r
.npe-source-textarea {\r
  width: 100%;\r
  min-height: 280px;\r
  resize: vertical;\r
  padding: 10px 12px;\r
  border: 1px solid var(--npe-chrome-border);\r
  border-radius: 4px;\r
  background: var(--npe-canvas-bg);\r
  color: var(--npe-chrome-text);\r
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;\r
  font-size: 12px;\r
  line-height: 1.5;\r
  tab-size: 2;\r
  box-sizing: border-box;\r
}\r
\r
.npe-source-textarea:focus-visible {\r
  outline: none;\r
  box-shadow: var(--npe-focus-ring);\r
  border-color: var(--npe-toolbar-btn-active-text);\r
}\r
\r
\r
/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\r
   TASK 7 \u2014 Overlays: Image/Video Resize, Floating Toolbar, Block Drag-Drop\r
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\r
\r
/* \u2500\u2500\u2500 Image / Video Selection Border \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-img-select-border {\r
  position: fixed;\r
  box-sizing: border-box;\r
  border: 2px solid var(--npe-toolbar-btn-active-text, #0057cc);\r
  border-radius: 2px;\r
  pointer-events: none;\r
  z-index: 10100;\r
}\r
\r
/* \u2500\u2500\u2500 Image / Video Resize Handles \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-img-resize-handle {\r
  position: fixed;\r
  width: 8px;\r
  height: 8px;\r
  background: var(--npe-toolbar-bg, #fff);\r
  border: 2px solid var(--npe-toolbar-btn-active-text, #0057cc);\r
  border-radius: 2px;\r
  box-sizing: border-box;\r
  z-index: 10101;\r
  pointer-events: all;\r
}\r
\r
/* Cursor per handle position */\r
.npe-img-handle-nw { cursor: nw-resize; }\r
.npe-img-handle-n  { cursor: n-resize;  }\r
.npe-img-handle-ne { cursor: ne-resize; }\r
.npe-img-handle-e  { cursor: e-resize;  }\r
.npe-img-handle-se { cursor: se-resize; }\r
.npe-img-handle-s  { cursor: s-resize;  }\r
.npe-img-handle-sw { cursor: sw-resize; }\r
.npe-img-handle-w  { cursor: w-resize;  }\r
\r
/* \u2500\u2500\u2500 Image / Video Live Size Label \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-img-size-label {\r
  position: fixed;\r
  background: rgba(0, 0, 0, 0.72);\r
  color: #fff;\r
  font-size: 11px;\r
  font-family: var(--npe-font, system-ui, sans-serif);\r
  padding: 2px 7px;\r
  border-radius: 3px;\r
  pointer-events: none;\r
  z-index: 10102;\r
  white-space: nowrap;\r
  user-select: none;\r
}\r
\r
/* \u2500\u2500\u2500 Image / Video Contextual Mini-Toolbar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-img-toolbar {\r
  position: fixed;\r
  display: flex;\r
  align-items: center;\r
  gap: 2px;\r
  background: var(--npe-toolbar-bg, #fff);\r
  border: 1px solid var(--npe-chrome-border, #d0d0d0);\r
  border-radius: 4px;\r
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);\r
  padding: 3px 5px;\r
  z-index: 10103;\r
  pointer-events: all;\r
  user-select: none;\r
}\r
\r
.npe-img-toolbar-btn {\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
  width: 26px;\r
  height: 26px;\r
  background: transparent;\r
  border: 1px solid transparent;\r
  border-radius: 3px;\r
  cursor: pointer;\r
  font-size: 14px;\r
  line-height: 1;\r
  color: var(--npe-chrome-text, #222);\r
  padding: 0;\r
  font-family: var(--npe-font, system-ui, sans-serif);\r
  transition: background 0.1s;\r
}\r
\r
.npe-img-toolbar-btn:hover {\r
  background: var(--npe-toolbar-btn-hover-bg, #e8e8e8);\r
  border-color: var(--npe-chrome-border, #d0d0d0);\r
}\r
\r
.npe-img-toolbar-btn:focus-visible {\r
  outline: none;\r
  box-shadow: var(--npe-focus-ring, 0 0 0 2px #0057cc66);\r
}\r
\r
.npe-img-drag-handle {\r
  cursor: grab;\r
  font-size: 16px;\r
  letter-spacing: -1px;\r
  color: var(--npe-chrome-text-muted, #666);\r
}\r
\r
.npe-img-drag-handle:active {\r
  cursor: grabbing;\r
}\r
\r
.npe-img-delete-btn:hover {\r
  background: #fde0e0;\r
  border-color: #cc3333;\r
  color: #cc3333;\r
}\r
\r
/* \u2500\u2500\u2500 Floating Selection Toolbar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-floating-toolbar {\r
  position: fixed;\r
  display: flex;\r
  align-items: center;\r
  gap: 2px;\r
  background: var(--npe-toolbar-bg, #fff);\r
  border: 1px solid var(--npe-chrome-border, #d0d0d0);\r
  border-radius: 5px;\r
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);\r
  padding: 3px 5px;\r
  z-index: 10200;\r
  pointer-events: all;\r
  user-select: none;\r
  /* Subtle entrance animation */\r
  animation: npe-ftb-appear 0.12s ease-out both;\r
}\r
\r
@keyframes npe-ftb-appear {\r
  from { opacity: 0; transform: translateY(4px); }\r
  to   { opacity: 1; transform: translateY(0);   }\r
}\r
\r
.npe-floating-toolbar-btn {\r
  display: inline-flex;\r
  align-items: center;\r
  justify-content: center;\r
  min-width: 26px;\r
  height: 26px;\r
  background: transparent;\r
  border: 1px solid transparent;\r
  border-radius: 3px;\r
  cursor: pointer;\r
  font-size: 13px;\r
  line-height: 1;\r
  color: var(--npe-chrome-text, #222);\r
  padding: 0 4px;\r
  font-family: var(--npe-font, system-ui, sans-serif);\r
  transition: background 0.1s;\r
}\r
\r
.npe-floating-toolbar-btn:hover {\r
  background: var(--npe-toolbar-btn-hover-bg, #e8e8e8);\r
  border-color: var(--npe-chrome-border, #d0d0d0);\r
}\r
\r
.npe-floating-toolbar-btn:focus-visible {\r
  outline: none;\r
  box-shadow: var(--npe-focus-ring, 0 0 0 2px #0057cc66);\r
}\r
\r
.npe-floating-toolbar-sep {\r
  display: inline-block;\r
  width: 1px;\r
  height: 18px;\r
  background: var(--npe-toolbar-separator, #d0d0d0);\r
  margin: 0 3px;\r
  flex-shrink: 0;\r
}\r
\r
/* \u2500\u2500\u2500 Block Drag Ghost \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-block-drag-ghost {\r
  background: var(--npe-toolbar-btn-active-bg, #d0e4ff);\r
  border: 2px dashed var(--npe-toolbar-btn-active-text, #0057cc);\r
  border-radius: 3px;\r
  opacity: 0.7;\r
  pointer-events: none;\r
  z-index: 20000;\r
}\r
\r
/* \u2500\u2500\u2500 Drop Placeholder (rendered inside iframe via injected style) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\r
   The placeholder itself is a <div> injected into the iframe document.\r
   Its styles must be applied inline (since we can't inject host CSS into iframe).\r
   The .npe-drop-placeholder class is kept here for documentation purposes only \u2014\r
   styles are set inline in BlockDragDrop._showPlaceholder().\r
   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
\r
\r
/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\r
   TASK 9 \u2014 Help / About Panel\r
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */\r
\r
.npe-help-panel {\r
  min-width: 300px;\r
  max-width: 380px;\r
}\r
\r
.npe-help-about {\r
  padding: 24px 20px;\r
  text-align: center;\r
}\r
\r
.npe-help-logo {\r
  width: 290px;\r
  height: auto;\r
  margin: 0 auto 16px;\r
  display: block;\r
}\r
\r
.npe-help-info {\r
  font-size: var(--npe-font-size);\r
  line-height: 2;\r
  color: var(--npe-chrome-text);\r
}\r
\r
.npe-help-info a {\r
  color: var(--npe-toolbar-btn-active-text, #0057cc);\r
}\r
\r
/* \u2500\u2500\u2500 Statusbar label/value spacing \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\r
.npe-statusbar-label {\r
  color: var(--npe-statusbar-text);\r
  margin-right: 4px;\r
}\r
\r
.npe-statusbar-value {\r
  color: var(--npe-chrome-text);\r
  font-weight: 500;\r
}\r
`;

// src/neiki-page-editor.js
var _plugins = [];
var _cssInjected = false;
function _injectCss() {
  if (_cssInjected || typeof document === "undefined") return;
  if (!EDITOR_CSS) return;
  _cssInjected = true;
  const style = document.createElement("style");
  style.id = "npe-editor-css";
  style.textContent = EDITOR_CSS;
  document.head.appendChild(style);
}
function _resolveTarget(target) {
  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el) throw new Error(`NeikiPageEditor: target element not found for selector "${target}"`);
    return el;
  }
  if (target instanceof Element) return target;
  throw new Error("NeikiPageEditor: target must be a CSS selector string or an Element");
}
var NeikiPageEditor = class {
  /**
   * @param {string|Element} selector — CSS selector or Element
   * @param {Partial<import('./core/Options').EditorOptions>} [options]
   */
  constructor(selector, options = {}) {
    _injectCss();
    const target = _resolveTarget(selector);
    const opts = normalizeOptions(options);
    this._editor = new Editor(target, opts);
    for (const plugin of _plugins) {
      try {
        plugin.init(this);
      } catch (e) {
      }
    }
    if (typeof opts.onReady === "function") {
      const publicEditor = this;
      const off = this._editor.getBus().on("editor:ready", () => {
        off();
        if (typeof opts.onReady === "function") {
          opts.onReady(publicEditor);
        }
      });
    }
  }
  // ─── Delegating public API ───────────────────────────────────────────────────
  /** @returns {string} Sanitized HTML of current canvas content */
  getContent() {
    return this._editor.getContent();
  }
  /** @param {string} html */
  setContent(html) {
    this._editor.setContent(html);
  }
  /** @returns {import('./core/Options').PagePayload} */
  getPage() {
    return this._editor.getPage();
  }
  /** @param {import('./core/Options').PagePayload} payload */
  setPage(payload) {
    this._editor.setPage(payload);
  }
  /** @returns {string} Current page CSS string */
  getStyles() {
    return this._editor.getStyles();
  }
  /** @param {string} css */
  setStyles(css) {
    this._editor.setStyles(css);
  }
  /** @returns {string} Plain text of canvas content */
  getText() {
    return this._editor.getText();
  }
  /** @returns {boolean} */
  isEmpty() {
    return this._editor.isEmpty();
  }
  focus() {
    this._editor.focus();
  }
  blur() {
    this._editor.blur();
  }
  enable() {
    this._editor.enable();
  }
  disable() {
    this._editor.disable();
  }
  /** @returns {Promise<void>} */
  triggerSave() {
    return this._editor.triggerSave();
  }
  toggleFullscreen() {
    this._editor.toggleFullscreen();
  }
  /** @param {string} name */
  setTheme(name) {
    this._editor.setTheme(name);
  }
  toggleTheme() {
    this._editor.toggleTheme();
  }
  /** @returns {string} */
  getTheme() {
    return this._editor.getTheme();
  }
  /**
   * Destroy this editor instance.
   * Removes all DOM, listeners, and iframe references. Idempotent.
   */
  destroy() {
    for (const plugin of _plugins) {
      if (typeof plugin.destroy === "function") {
        try {
          plugin.destroy();
        } catch (e) {
        }
      }
    }
    this._editor.destroy();
  }
  // ─── Static API ─────────────────────────────────────────────────────────────
  /**
   * Register a plugin for all future and existing editor instances.
   * @param {{ id: string, init(editor: NeikiPageEditor): void, destroy?(): void }} plugin
   */
  static registerPlugin(plugin) {
    if (!plugin || typeof plugin.id !== "string" || typeof plugin.init !== "function") {
      throw new Error("NeikiPageEditor.registerPlugin: plugin must have an id string and init function");
    }
    if (_plugins.find((p) => p.id === plugin.id)) return;
    _plugins.push(plugin);
  }
  /**
   * Get all registered plugins.
   * @returns {Array<{ id: string }>}
   */
  static getPlugins() {
    return _plugins.slice();
  }
  /**
   * Add or extend a language translation map.
   * @param {string} lang — language code, e.g. 'de'
   * @param {Record<string, string>} keys — translation key/value pairs
   */
  static addTranslation(lang, keys) {
    addTranslation(lang, keys);
  }
};
var neiki_page_editor_default = NeikiPageEditor;
export {
  NeikiPageEditor,
  neiki_page_editor_default as default
};
