import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, it, expect } from 'vitest';

import { es } from '../i18n/es';
import { resolveLocale, translate } from '../i18n/index';

// Every literal passed to t() in the source, the way a translator sees them.
const sourceStrings = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'tests' ? [] : sourceStrings(path);
    if (!/\.tsx?$/.test(entry.name)) return [];
    return [...readFileSync(path, 'utf8').matchAll(/\bt\(\s*(['"])((?:\\.|(?!\1).)*)\1/g)].map(
      (match) => match[2].replace(/\\(['"\\])/g, '$1'),
    );
  });

describe('i18n', () => {
  it('picks the first browser language with a catalog, by primary subtag, else English', () => {
    expect(resolveLocale(['fr-FR', 'es-MX', 'en'])).toBe('es');
    expect(resolveLocale(['ES-es'])).toBe('es');
    expect(resolveLocale(['fr', 'de'])).toBe('en');
    expect(resolveLocale([])).toBe('en');
  });

  it('translates, fills values, and matches a backend message to its template', () => {
    const catalog = {
      Hide: 'Ocultar',
      timeout: 'tiempo agotado',
      '{count} books': '{count} libros',
      '{title}: {message}': '{title}: {message}',
      'Failed to reach {host}': 'No se pudo llegar a {host}',
    };
    expect(translate(catalog, 'Hide')).toBe('Ocultar');
    expect(translate(catalog, '{count} books', { count: 3 })).toBe('3 libros');
    expect(translate(catalog, 'Failed to reach example.org')).toBe(
      'No se pudo llegar a example.org',
    );
    expect(translate(catalog, 'Failed to reach example.org: timeout')).toBe(
      'No se pudo llegar a example.org: timeout',
    );
    expect(translate(catalog, 'Hide: timeout')).toBe('Ocultar: tiempo agotado');
    expect(translate(catalog, 'toString')).toBe('toString');
    expect(translate(catalog, 'Untranslated {x}', { x: 1 })).toBe('Untranslated 1');
    expect(translate(catalog, 'Nothing like it')).toBe('Nothing like it');
  });

  it('has a Spanish translation for every string the interface passes to t()', () => {
    const missing = [...new Set(sourceStrings(join(__dirname, '..')))].filter((s) => !(s in es));
    expect(missing).toEqual([]);
  });
});
