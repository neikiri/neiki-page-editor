/**
 * Unit tests for i18n module.
 */
import { createI18n, addTranslation, getAvailableLanguages } from '../../src/i18n/i18n.js';

describe('i18n', () => {
  test('returns English translation for known key', () => {
    const i18n = createI18n('en');
    expect(i18n.t('toolbar.bold')).toBe('Bold');
  });

  test('returns Czech translation for known key', () => {
    const i18n = createI18n('cs');
    expect(i18n.t('toolbar.bold')).toBe('Tučné');
  });

  test('falls back to English for unknown language', () => {
    const i18n = createI18n('de');
    expect(i18n.t('toolbar.bold')).toBe('Bold');
  });

  test('returns the key itself when no translation exists', () => {
    const i18n = createI18n('en');
    expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
  });

  test('per-instance custom translations override built-in', () => {
    const i18n = createI18n('en', { 'toolbar.bold': 'BOLD OVERRIDE' });
    expect(i18n.t('toolbar.bold')).toBe('BOLD OVERRIDE');
  });

  test('per-instance overrides do not affect other instances', () => {
    const i18n1 = createI18n('en', { 'toolbar.bold': 'OVERRIDE' });
    const i18n2 = createI18n('en');
    expect(i18n1.t('toolbar.bold')).toBe('OVERRIDE');
    expect(i18n2.t('toolbar.bold')).toBe('Bold');
  });

  test('variable interpolation works', () => {
    const i18n = createI18n('en');
    expect(i18n.t('error.uploadFailed', { file: 'photo.jpg' })).toBe('Upload failed: photo.jpg');
  });

  test('missing variable placeholder is preserved', () => {
    const i18n = createI18n('en');
    const result = i18n.t('error.uploadFailed', {});
    expect(result).toBe('Upload failed: {file}');
  });

  test('addTranslation registers a new language', () => {
    addTranslation('de', { 'toolbar.bold': 'Fett' });
    const i18n = createI18n('de');
    expect(i18n.t('toolbar.bold')).toBe('Fett');
    // Unknown key in de falls back to en
    expect(i18n.t('toolbar.italic')).toBe('Italic');
  });

  test('getAvailableLanguages includes en and cs', () => {
    const langs = getAvailableLanguages();
    expect(langs).toContain('en');
    expect(langs).toContain('cs');
  });
});
