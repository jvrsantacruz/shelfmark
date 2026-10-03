import { t } from '../i18n';
import type { MetadataSearchField, QueryTargetOption, SearchMode, TextSearchField } from '../types';

const makeDirectField = (
  key: 'isbn' | 'author' | 'title',
  label: string,
  description: string,
): TextSearchField => ({
  key,
  label,
  type: 'TextSearchField',
  placeholder: `${label}…`,
  description,
});

// Built on each call, so the labels are translated when they are shown.
const generalQueryTarget = (): QueryTargetOption => ({
  key: 'general',
  label: t('General'),
  description: t('Search across all supported fields.'),
  source: 'general',
});

const directQueryTargets = (): QueryTargetOption[] => [
  generalQueryTarget(),
  {
    key: 'isbn',
    label: 'ISBN',
    description: t('Search for an exact ISBN.'),
    source: 'direct-field',
    field: makeDirectField('isbn', 'ISBN', t('Search by ISBN')),
  },
  {
    key: 'author',
    label: t('Author'),
    description: t('Search by author name.'),
    source: 'direct-field',
    field: makeDirectField('author', t('Author'), t('Search by author name')),
  },
  {
    key: 'title',
    label: t('Title'),
    description: t('Search by title.'),
    source: 'direct-field',
    field: makeDirectField('title', t('Title'), t('Search by title')),
  },
];

const mapMetadataFieldToTarget = (field: MetadataSearchField): QueryTargetOption => ({
  key: field.key,
  label: field.label,
  description: field.description,
  source: 'provider-field',
  field,
});

export const buildQueryTargets = ({
  searchMode,
  metadataSearchFields = [],
  manualSearchAllowed = false,
}: {
  searchMode: SearchMode;
  metadataSearchFields?: MetadataSearchField[];
  manualSearchAllowed?: boolean;
}): QueryTargetOption[] => {
  if (searchMode === 'direct') {
    return directQueryTargets();
  }

  const targets: QueryTargetOption[] = [
    generalQueryTarget(),
    ...metadataSearchFields.map(mapMetadataFieldToTarget),
  ];

  if (manualSearchAllowed) {
    targets.push({
      key: 'manual',
      label: t('Manual'),
      description: t('Search release sources directly.'),
      source: 'manual',
    });
  }

  return targets;
};

export const getDefaultQueryTargetKey = (targets: QueryTargetOption[]): string => {
  return targets[0]?.key || 'general';
};

/**
 * Resolve a "Search By" key (e.g. from a URL hash) against the live targets.
 *
 * Exact match first, then case-insensitive: built-in keys are lowercase, but a
 * custom metadata provider can declare a camelCase field key.
 */
export const findQueryTarget = (
  targets: QueryTargetOption[],
  key: string | undefined,
): QueryTargetOption | undefined => {
  if (!key) {
    return undefined;
  }
  const exact = targets.find((target) => target.key === key);
  if (exact) {
    return exact;
  }
  const lowered = key.toLowerCase();
  return targets.find((target) => target.key.toLowerCase() === lowered);
};
