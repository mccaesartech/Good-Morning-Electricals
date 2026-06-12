import EntityCrudPage from '@/components/crud/EntityCrudPage';
import { ENTITY_CONFIGS } from '@/lib/entity-config';

export default function CareersPage() {
  return (
    <EntityCrudPage
      config={ENTITY_CONFIGS.careers}
      description="Manage Career Opportunities cards on the public website."
    />
  );
}
