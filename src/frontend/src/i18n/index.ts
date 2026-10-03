import { es } from './es';

// A language's translations, keyed by the English text. Text with no entry
// shows in English.
export type Catalog = Record<string, string>;

const catalogs: Record<string, Catalog> = { es };

// The browser's preferred languages in order, matched on the primary subtag
// (es-MX is es), then English.
export function resolveLocale(preferred: readonly string[]): string {
  for (const tag of preferred) {
    const primary = tag.toLowerCase().split('-')[0];
    if (Object.hasOwn(catalogs, primary)) {
      return primary;
    }
  }
  return 'en';
}

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in values ? String(values[name]) : placeholder,
  );

// Own entries only: "toString" is not a translation.
const lookup = (catalog: Catalog, text: string) =>
  Object.hasOwn(catalog, text) ? catalog[text] : undefined;

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Text the backend sends with a value already in it ("Failed to connect to
// example.org") matches a catalog template ("Failed to connect to {host}"):
// the values are read back out, each translated if the catalog has it as is
// ("Failed to add: Connection refused"), and put into the translation. The template
// with the most fixed text wins, so "{title}: {message}" never hides
// "Failed to connect to {host}: {error}".
// A linear scan over the templates: a map by first word would do if it gets slow.
function matchTemplate(catalog: Catalog, text: string): string | undefined {
  let best: { fixed: number; result: string } | undefined;
  for (const [template, translation] of Object.entries(catalog)) {
    if (!template.includes('{')) continue;
    const names = [...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    const parts = template.split(/\{\w+\}/);
    const fixed = parts.join('').length;
    if (best && best.fixed >= fixed) continue;
    const match = new RegExp(`^${parts.map(escape).join('(.+?)')}$`, 's').exec(text);
    if (match) {
      const values = Object.fromEntries(
        names.map((name, i) => [name, lookup(catalog, match[i + 1]) ?? match[i + 1]]),
      );
      best = { fixed, result: fill(translation, values) };
    }
  }
  return best?.result;
}

export function translate(
  catalog: Catalog,
  text: string,
  values?: Record<string, string | number>,
): string {
  const translation = lookup(catalog, text);
  if (translation !== undefined) return values ? fill(translation, values) : translation;
  if (values) return fill(text, values);
  return matchTemplate(catalog, text) ?? text;
}

// Read once, at load: changing the language is a reload.
export const locale = resolveLocale(navigator.languages);

const active = catalogs[locale] ?? {};

// The English text in the browser's language, each {name} replaced by values.name.
export function t(text: string, values?: Record<string, string | number>): string {
  return translate(active, text, values);
}
