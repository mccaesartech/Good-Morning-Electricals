import SingletonEditor from '@/components/crud/SingletonEditor';

const FIELDS = [
  { name: 'section_label', label: 'Section Label', type: 'text' as const, col: 'half' as const },
  { name: 'title', label: 'Title', type: 'text' as const, col: 'full' as const },
  { name: 'description', label: 'Short Description', type: 'textarea' as const, rows: 2, col: 'full' as const },
  { name: 'lead_text', label: 'Lead Text', type: 'textarea' as const, rows: 3, col: 'full' as const },
  { name: 'paragraphs', label: 'Paragraphs (one per line)', type: 'lines' as const, col: 'full' as const },
  { name: 'feature_bullets', label: 'Feature Bullets (one per line)', type: 'lines' as const, col: 'full' as const },
  { name: 'image_badge', label: 'Image Badge', type: 'text' as const, col: 'half' as const },
  { name: 'image_url', label: 'Image', type: 'image' as const, imageFolder: 'about', col: 'full' as const },
  { name: 'status', label: 'Status', type: 'select' as const, col: 'half' as const }
];

export default function AboutPage() {
  return (
    <SingletonEditor
      table="about"
      title="About Section"
      description="Edit the About the Academy section on the public website."
      fields={FIELDS}
      entityLabel="About Section"
    />
  );
}
