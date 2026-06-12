import EntityCrudPage from '@/components/crud/EntityCrudPage';
import { ENTITY_CONFIGS } from '@/lib/entity-config';

export default function StaffPage() {
  return (
    <EntityCrudPage
      config={ENTITY_CONFIGS.staff}
      description="Add and edit instructors and staff for the Our Instructors & Staff section on the public website. Upload a photo, set status to Published, then Save."
    />
  );
}
