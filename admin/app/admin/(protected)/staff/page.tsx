import SectionListPage from '@/components/crud/SectionListPage';
import { ENTITY_CONFIGS } from '@/lib/entity-config';

export default function StaffPage() {
  return (
    <SectionListPage
      sectionTable="staff_section"
      sectionTitle="Our Instructors & Staff"
      sectionDescription="Edit the section heading (label, title, description), then add team members with photos and bios below."
      listConfig={ENTITY_CONFIGS.staff}
      listDescription="Each person appears as a card on the public site. Upload a photo, fill in name, role, and bio, set Status to Published, then click Save."
      entityLabel="Staff Section"
    />
  );
}
