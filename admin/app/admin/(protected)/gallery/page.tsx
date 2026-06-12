import SectionListPage from '@/components/crud/SectionListPage';
import { ENTITY_CONFIGS } from '@/lib/entity-config';

export default function GalleryPage() {
  return (
    <SectionListPage
      sectionTable="gallery_section"
      sectionTitle="Photo Gallery"
      sectionDescription="Edit the gallery section heading, then upload photos of school practicals, field work, and hands-on training."
      listConfig={ENTITY_CONFIGS.gallery}
      listDescription="Use this for photos of students working on site, workshop sessions, and real practical training — not the facility cards above. Set Status to Published, then Save."
      entityLabel="Gallery Section"
    />
  );
}
