import SingletonEditor from '@/components/crud/SingletonEditor';

const FIELDS = [
  { name: 'title', label: 'Title', type: 'text' as const, col: 'full' as const },
  { name: 'body', label: 'Body Text', type: 'textarea' as const, rows: 4, col: 'full' as const },
  { name: 'btn_apply_text', label: 'Apply Button Text', type: 'text' as const, col: 'half' as const },
  { name: 'btn_call_text', label: 'Call Button Text', type: 'text' as const, col: 'half' as const },
  { name: 'checklist', label: 'Checklist Items (one per line)', type: 'lines' as const, col: 'full' as const },
  { name: 'bg_image_url', label: 'Background Image', type: 'image' as const, imageFolder: 'admissions', col: 'full' as const },
  { name: 'status', label: 'Status', type: 'select' as const, col: 'half' as const }
];

export default function AdmissionsPage() {
  return (
    <SingletonEditor
      table="admissions"
      title="Admissions Section"
      description="Edit the admissions call-to-action section on the public website."
      fields={FIELDS}
      entityLabel="Admissions Section"
    />
  );
}
