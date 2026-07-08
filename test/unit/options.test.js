/**
 * Unit tests for Options normalization.
 */
import { jest } from '@jest/globals';
import { normalizeOptions, DEFAULT_TOOLBAR, VALID_THEMES } from '../../src/core/Options.js';

describe('normalizeOptions', () => {
  test('returns all defaults when called with no arguments', () => {
    const opts = normalizeOptions();
    expect(opts.minHeight).toBe(300);
    expect(opts.maxHeight).toBeNull();
    expect(opts.autofocus).toBe(false);
    expect(opts.spellcheck).toBe(true);
    expect(opts.readonly).toBe(false);
    expect(opts.editMode).toBe('body');
    expect(opts.editableSelector).toBe('[data-npe-editable]');
    expect(opts.theme).toBe('light');
    expect(opts.persistTheme).toBe(false);
    expect(opts.language).toBe('en');
    expect(opts.toolbar).toEqual(DEFAULT_TOOLBAR);
    expect(opts.allowDataUris).toBe(false);
    expect(opts.autosaveKey).toBeNull();
  });

  test('applies valid user-supplied values', () => {
    const opts = normalizeOptions({
      minHeight: 500,
      maxHeight: 800,
      theme: 'dark',
      language: 'cs',
      autofocus: true,
      readonly: true,
      allowDataUris: true,
      autosaveKey: 'my-page',
    });
    expect(opts.minHeight).toBe(500);
    expect(opts.maxHeight).toBe(800);
    expect(opts.theme).toBe('dark');
    expect(opts.language).toBe('cs');
    expect(opts.autofocus).toBe(true);
    expect(opts.readonly).toBe(true);
    expect(opts.allowDataUris).toBe(true);
    expect(opts.autosaveKey).toBe('my-page');
  });

  test('ignores invalid theme, falls back to default', () => {
    const opts = normalizeOptions({ theme: 'invalid-theme' });
    expect(opts.theme).toBe('light');
  });

  test('ignores invalid editMode, falls back to default', () => {
    const opts = normalizeOptions({ editMode: 'wysiwyg' });
    expect(opts.editMode).toBe('body');
  });

  test('accepts valid editMode values', () => {
    expect(normalizeOptions({ editMode: 'body' }).editMode).toBe('body');
    expect(normalizeOptions({ editMode: 'regions' }).editMode).toBe('regions');
  });

  test('filters non-string cssUrls', () => {
    const opts = normalizeOptions({ cssUrls: ['https://a.com/a.css', 42, null, 'https://b.com/b.css'] });
    expect(opts.cssUrls).toEqual(['https://a.com/a.css', 'https://b.com/b.css']);
  });

  test('accepts custom toolbar array', () => {
    const custom = ['bold', 'italic', '|', 'undo'];
    const opts = normalizeOptions({ toolbar: custom });
    expect(opts.toolbar).toEqual(custom);
  });

  test('ignores empty toolbar array, keeps default', () => {
    const opts = normalizeOptions({ toolbar: [] });
    expect(opts.toolbar).toEqual(DEFAULT_TOOLBAR);
  });

  test('coerces invalid callback to null', () => {
    const opts = normalizeOptions({ onReady: 'not-a-function' });
    expect(opts.onReady).toBeNull();
  });

  test('accepts valid callback function', () => {
    const cb = jest.fn();
    const opts = normalizeOptions({ onReady: cb });
    expect(opts.onReady).toBe(cb);
  });

  test('normalizes translations option', () => {
    const trans = { 'toolbar.bold': 'Fett' };
    const opts = normalizeOptions({ translations: trans });
    expect(opts.translations).toEqual(trans);
  });

  test('VALID_THEMES contains all 6 themes', () => {
    expect(VALID_THEMES).toEqual(['light', 'dark', 'blue', 'dark-blue', 'midnight', 'void']);
  });
});
