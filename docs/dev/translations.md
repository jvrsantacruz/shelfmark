# Translating the interface

Translations live in `src/frontend/src/i18n/`, one catalog per language. A catalog maps the
English text to its translation. English needs no catalog: text with no entry shows in English.
The language is picked from the browser's preferred languages, falling back to English.

## Add a language

1. Copy `src/frontend/src/i18n/es.ts` to `<code>.ts` and translate the values. `<code>` is the
   language's ISO 639-1 code, the first part of the tag the browser reports: `fr` for `fr-FR`.
   Codes are listed in the [IANA language subtag registry](https://www.iana.org/assignments/language-subtag-registry).
2. Register it in `src/frontend/src/i18n/index.ts`:

   ```ts
   import { fr } from './fr';

   const catalogs: Record<string, Catalog> = { es, fr };
   ```

3. Run `make frontend-checks frontend-test`.

## Make a component translatable

Wrap the English text in `t()`. A value goes in braces:

```tsx
import { t } from '../i18n';

<label htmlFor="password">{t('Password')}</label>;
<p>{t('{count} books selected', { count })}</p>;
```

Then add the text to every catalog:

```ts
Password: 'Contraseña',
'{count} books selected': '{count} libros seleccionados',
```

Text the backend sends needs no `t()`: settings labels and descriptions, and API errors, are
translated when they arrive. Add their English text to the catalogs the same way. A message with
a value in it, like `Failed to connect to example.org`, matches the entry
`'Failed to connect to {host}'`.

Every new text needs to be added to the other catalogs too; text a catalog lacks shows in
English.

Run `make frontend-test` to validate translations: it fails on any text passed to `t()` that
`es.ts` does not have.
