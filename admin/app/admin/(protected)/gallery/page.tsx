import EntityCrudPage from '@/components/crud/EntityCrudPage';
import { ENTITY_CONFIGS } from '@/lib/entity-config';

export default function GalleryPage() {
  return <EntityCrudPage config={ENTITY_CONFIGS.gallery} />;
}
