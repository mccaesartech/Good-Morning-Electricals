import SingletonEditor from '@/components/crud/SingletonEditor';

const FIELDS = [
  { name: 'badge', label: 'Badge Text', type: 'text' as const, col: 'half' as const },
  { name: 'title', label: 'Title', type: 'textarea' as const, rows: 2, col: 'full' as const },
  { name: 'subtitle', label: 'Subtitle', type: 'textarea' as const, rows: 3, col: 'full' as const },
  { name: 'highlights', label: 'Highlights (one per line)', type: 'lines' as const, col: 'full' as const },
  { name: 'panel_cta', label: 'Panel CTA', type: 'text' as const, col: 'half' as const },
  { name: 'cta_primary', label: 'Primary Button Text', type: 'text' as const, col: 'half' as const },
  { name: 'cta_secondary', label: 'Secondary Button Text', type: 'text' as const, col: 'half' as const },
  { name: 'bg_image_url', label: 'Background Image', type: 'image' as const, imageFolder: 'hero', col: 'full' as const },
  {
    name: 'statistics',
    label: 'Statistics (JSON array)',
    type: 'json' as const,
    col: 'full' as const,
    placeholder: '[{"number":"500+","label":"Students Trained","count":500}]'
  },
  { name: 'status', label: 'Status', type: 'select' as const, col: 'half' as const }
];

export default function HeroPage() {
  return (
    <SingletonEditor
      table="hero"
      title="Hero Section"
      description="Edit the homepage hero banner, headlines, and call-to-action buttons."
      fields={FIELDS}
      entityLabel="Hero Section"
    />
  );
}
