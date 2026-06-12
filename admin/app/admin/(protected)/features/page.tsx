import EntityCrudPage from '@/components/crud/EntityCrudPage';
import { ENTITY_CONFIGS } from '@/lib/entity-config';

export default function FeaturesPage() {
  return (
    <EntityCrudPage
      config={ENTITY_CONFIGS.features}
      description="Manage the Why Choose Us feature cards on the homepage."
    />
  );
}
