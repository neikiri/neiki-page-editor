/**
 * Unit tests for ThemeManager.
 */
import { ThemeManager } from '../../src/themes/ThemeManager.js';

function makeShell() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
}

describe('ThemeManager', () => {
  let shell;

  beforeEach(() => {
    shell = makeShell();
  });

  afterEach(() => {
    shell.remove();
  });

  test('initializes with light theme (no class added)', () => {
    const tm = new ThemeManager(shell, 'light');
    expect(shell.className).toBe('');
    tm.destroy();
  });

  test('initializes with dark theme (npe-dark class)', () => {
    const tm = new ThemeManager(shell, 'dark');
    expect(shell.classList.contains('npe-dark')).toBe(true);
    tm.destroy();
  });

  test('setTheme() changes theme class', () => {
    const tm = new ThemeManager(shell, 'light');
    tm.setTheme('dark');
    expect(shell.classList.contains('npe-dark')).toBe(true);
    expect(tm.getTheme()).toBe('dark');
    tm.destroy();
  });

  test('setTheme() removes previous theme class', () => {
    const tm = new ThemeManager(shell, 'dark');
    tm.setTheme('blue');
    expect(shell.classList.contains('npe-dark')).toBe(false);
    expect(shell.classList.contains('npe-theme-blue')).toBe(true);
    tm.destroy();
  });

  test('setTheme() ignores unknown theme', () => {
    const tm = new ThemeManager(shell, 'light');
    tm.setTheme('invalid');
    expect(tm.getTheme()).toBe('light');
    tm.destroy();
  });

  test('toggleTheme() cycles through all themes', () => {
    const tm = new ThemeManager(shell, 'light');
    const expected = ['dark', 'blue', 'dark-blue', 'midnight', 'void', 'autumn', 'light'];
    for (const theme of expected) {
      tm.toggleTheme();
      expect(tm.getTheme()).toBe(theme);
    }
    tm.destroy();
  });

  test('destroy() removes theme classes', () => {
    const tm = new ThemeManager(shell, 'dark');
    tm.destroy();
    expect(shell.classList.contains('npe-dark')).toBe(false);
  });

  test('unknown initial theme falls back to light', () => {
    const tm = new ThemeManager(shell, 'neon');
    expect(tm.getTheme()).toBe('light');
    tm.destroy();
  });
});
