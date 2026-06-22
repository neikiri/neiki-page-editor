# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

## [0.1.0] - 2026-06-22

### Added

- Initial public release of Neiki's Page Editor.
- iframe canvas with `allow-same-origin` sandbox — page CSS renders with browser-accurate fidelity while the host page remains fully isolated.
- DOMParser-based allowlist HTML sanitizer (idempotent, XSS-safe).
- `FullHtmlParser` — loads a complete HTML document; extracts body HTML, `<style>` blocks, and validated `<link>` stylesheet URLs automatically.
- `StyleManager` — deterministic CSS injection order (`#npe-base` → external links → `#npe-page` → extracted style blocks → `#npe-helper`).
- `ContentSerializer` — `getContent()`, `setContent()`, `getText()`, `isEmpty()`.
- `SelectionManager` — save and restore iframe selections across modal open/close.
- Toolbar with full parity to Neiki's Editor: `viewCode`, `undo`, `redo`, `findReplace`, `bold`, `italic`, `underline`, `strikethrough`, `superscript`, `subscript`, `code`, `removeFormat`, `heading`, `fontFamily`, `fontSize`, `foreColor`, `backColor`, `alignLeft`, `alignCenter`, `alignRight`, `alignJustify`, `indent`, `outdent`, `bulletList`, `numberedList`, `blockquote`, `horizontalRule`, `insertDropdown`, `moreMenu`.
- `FontSizeWidget` — compound control with `−` / `+` buttons, numeric input, and preset dropdown.
- `ColorPickerButton` — floating panel with preset swatches, native `<input type="color">`, hex input, Apply and Reset.
- `HeadingSelect` and `FontFamilySelect` dropdowns.
- `InsertDropdown` — Link, Image, Video, Table, Emoji, Special Characters.
- `MoreMenu` — Save, Preview, Download, Print, Autosave toggle, Clear all, Change theme, Fullscreen, Help.
- Link, Image, Video, Table, Emoji Picker, Special Characters Picker, Source View, and Find & Replace modals.
- Image and video resize overlay with aspect-ratio lock, live size label, and mini-toolbar (replace, delete).
- Table column resize overlay (minimum 40 px column width).
- Table context menu (right-click): insert/delete rows and columns, merge/split cells.
- Floating selection toolbar: bold, italic, underline, link, move block up/down.
- `BlockDragDrop` — drag-and-drop block reordering inside the canvas.
- `StatusBar` — word count, character count, current block type, autosave state.
- `AutosaveManager` — configurable `autosaveKey`, stored as sanitized HTML in `localStorage`.
- `ThemeManager` — five built-in themes: `light`, `dark`, `blue`, `dark-blue`, `midnight`; optional `persistTheme` via `localStorage`.
- i18n system — flat dot-separated key lookup chain (per-instance overrides → language → `en` → key); built-in `en` and `cs` translations; `NeikiPageEditor.addTranslation(lang, keys)` for extensions.
- `CommandRegistry` — maps toolbar commands to `document.execCommand` and custom handlers.
- `EventBus` — instance-scoped pub/sub; destroyed with the editor instance.
- `Options` — full option normalization with defaults, type coercion, and validation.
- Plugin API — `NeikiPageEditor.registerPlugin({ id, init, destroy })`.
- Public instance API: `getContent`, `setContent`, `getText`, `isEmpty`, `getPage`, `setPage`, `getStyles`, `setStyles`, `focus`, `blur`, `enable`, `disable`, `triggerSave`, `destroy`, `toggleFullscreen`, `setTheme`, `toggleTheme`, `getTheme`.
- Static API: `NeikiPageEditor.registerPlugin`, `NeikiPageEditor.getPlugins`, `NeikiPageEditor.addTranslation`.
- `editMode: 'body'` (default) and `editMode: 'regions'` (`[data-npe-editable]` elements only).
- `allowDataUris` option — allows safe image/video `data:` URIs (explicit opt-in, SVG excluded).
- `stylesheetUrlValidator` — custom validator for external stylesheet URLs.
- `imageUploadHandler` / `videoUploadHandler` — async file upload callbacks.
- `loadHandler` / `saveHandler` — async CMS integration callbacks.
- Keyboard shortcuts: `Ctrl+B`, `Ctrl+I`, `Ctrl+U`, `Ctrl+K`, `Ctrl+S`, `Ctrl+Z`, `Ctrl+Y` / `Ctrl+Shift+Z`.
- CDN build (`neiki-page-editor.min.js` — CSS embedded), unminified UMD build, ESM build, and standalone CSS file.
- PHP sanitization helper (`php/NeikiPageEditorSanitizer.php`) — server-side allowlist sanitizer using PHP `DOMDocument`; no Composer dependencies.
- Unit tests for `Sanitizer`, `StyleManager`, `FullHtmlParser`, `ContentSerializer`, `Options`, `i18n`, `ThemeManager`.
- Property-based tests for sanitizer idempotency and safety, content/style round-trips, and host/page/instance isolation.
- Integration tests for editor lifecycle, toolbar rendering and state, modals, and multi-instance isolation.
- GitHub Actions workflows: CI checks, CodeQL security analysis, and npm + GitHub Packages publish on tag push.
- `demo/index.html` (CDN-style demo) and `demo/esm.html` (ESM import demo).

[Unreleased]: https://github.com/neikiri/neiki-page-editor/compare/0.1.0...HEAD
[0.1.0]: https://github.com/neikiri/neiki-page-editor/releases/tag/0.1.0
