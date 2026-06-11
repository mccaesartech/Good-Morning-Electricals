import SingletonEditor from '@/components/crud/SingletonEditor';

const FIELDS = [
  { name: 'email', label: 'Email', type: 'text' as const, col: 'half' as const },
  { name: 'whatsapp', label: 'WhatsApp', type: 'text' as const, col: 'half' as const },
  { name: 'address', label: 'Address', type: 'textarea' as const, rows: 2, col: 'full' as const },
  { name: 'gps_code', label: 'GPS Code', type: 'text' as const, col: 'half' as const },
  { name: 'office_hours', label: 'Office Hours', type: 'text' as const, col: 'half' as const },
  { name: 'phones', label: 'Phone Numbers (one per line)', type: 'lines' as const, col: 'full' as const },
  { name: 'status', label: 'Status', type: 'select' as const, col: 'half' as const }
];

export default function ContactPage() {
  return (
    <SingletonEditor
      table="contact"
      title="Contact Info"
      description="Phone numbers, email, address, and office hours shown on the public site."
      fields={FIELDS}
      entityLabel="Contact Info"
    />
  );
}
