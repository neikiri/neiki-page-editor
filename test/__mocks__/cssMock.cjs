/**
 * CSS module mock for Jest (CJS format, required for jest moduleNameMapper).
 * Returns an empty CSS string so test environment doesn't choke on CSS imports.
 */
const EDITOR_CSS = '';
module.exports = { EDITOR_CSS };
