import EntityCrudPage from '@/components/crud/EntityCrudPage';
import { ENTITY_CONFIGS } from '@/lib/entity-config';

export default function JourneyPage() {
  return (
    <EntityCrudPage
      config={ENTITY_CONFIGS.journey}
      description="Manage Student Journey timeline steps on the public website."
    />
  );
}
