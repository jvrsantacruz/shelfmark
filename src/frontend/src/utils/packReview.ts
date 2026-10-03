import { t } from '../i18n';
import type { PackBook } from '../types';

/** Return a copy of `books` with one entry patched; the input is not mutated. */
export function updateReviewBook(
  books: PackBook[],
  index: number,
  patch: Partial<PackBook>,
): PackBook[] {
  return books.map((book, i) => (i === index ? { ...book, ...patch } : book));
}

/** Parse a series-position text field: "3" → 3, "2.5" → 2.5, blank/junk → null. */
export function parseSeriesPositionInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** The plan sent with the download: trimmed titles, untitled books dropped. */
export function toBookPlanPayload(books: PackBook[]): PackBook[] {
  return books
    .map((book) => ({ ...book, title: book.title.trim() }))
    .filter((book) => book.title.length > 0 && book.files.length > 0);
}

const booksText = (count: number): string =>
  count === 1 ? t('1 book') : t('{count} books', { count });

const filesText = (count: number): string =>
  count === 1 ? t('1 file') : t('{count} files', { count });

const ignoredText = (count: number): string =>
  count === 1 ? t('1 file ignored') : t('{count} files ignored', { count });

/** "2 books · 3 files · 2 files ignored" */
export function describePackPlan(books: PackBook[], ignored: string[]): string {
  const fileCount = books.reduce((sum, book) => sum + book.files.length, 0);
  const parts = [booksText(books.length), filesText(fileCount)];
  if (ignored.length > 0) {
    parts.push(ignoredText(ignored.length));
  }
  return parts.join(' · ');
}
