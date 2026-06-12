'use client';

import SingletonEditor, { type SingletonField } from '@/components/crud/SingletonEditor';
import EntityCrudPage from '@/components/crud/EntityCrudPage';
import type { EntityConfig } from '@/lib/entity-config';

const SECTION_FIELDS: SingletonField[] = [
  { name: 'section_label', label: 'Section Label', type: 'text', col: 'half', placeholder: 'Our Campus' },
  { name: 'title', label: 'Section Title', type: 'text', col: 'full' },
  { name: 'description', label: 'Section Description', type: 'textarea', rows: 2, col: 'full' },
  { name: 'status', label: 'Status', type: 'select', col: 'half' }
];

type SectionListPageProps = {
  sectionTable: 'facilities_section' | 'staff_section' | 'gallery_section';
  sectionTitle: string;
  sectionDescription: string;
  listConfig: EntityConfig;
  listDescription: string;
  entityLabel: string;
};

export default function SectionListPage({
  sectionTable,
  sectionTitle,
  sectionDescription,
  listConfig,
  listDescription,
  entityLabel
}: SectionListPageProps) {
  return (
    <div className="section-list-page">
      <p className="section-list-page__hint">
        Section text only appears on the live site after <strong>Save &amp; Publish</strong>.
        Photos and profiles below must have <strong>Status: Published</strong> before they show on the website.
      </p>
      <SingletonEditor
        table={sectionTable}
        title={sectionTitle}
        description={sectionDescription}
        fields={SECTION_FIELDS}
        entityLabel={entityLabel}
      />
      <div className="section-list-page__divider" />
      <EntityCrudPage config={listConfig} description={listDescription} />
    </div>
  );
}
