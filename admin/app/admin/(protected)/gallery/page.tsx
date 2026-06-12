import EntityCrudPage from '@/components/crud/EntityCrudPage';
import { ENTITY_CONFIGS } from '@/lib/entity-config';

export default function GalleryPage() {
  return (
    <EntityCrudPage
      config={ENTITY_CONFIGS.gallery}
      description="Upload photos for the Photo Gallery section on the public website. Click Add New, upload an image, set status to Published, then Save."
    />
  );
}
