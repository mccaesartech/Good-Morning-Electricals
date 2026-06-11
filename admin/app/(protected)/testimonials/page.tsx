import EntityCrudPage from '@/components/crud/EntityCrudPage';
import { ENTITY_CONFIGS } from '@/lib/entity-config';

export default function TestimonialsPage() {
  return <EntityCrudPage config={ENTITY_CONFIGS.testimonials} />;
}
