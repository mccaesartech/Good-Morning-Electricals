import SectionListPage from '@/components/crud/SectionListPage';
import { ENTITY_CONFIGS } from '@/lib/entity-config';

export default function FacilitiesPage() {
  return (
    <SectionListPage
      sectionTable="facilities_section"
      sectionTitle="Facilities & Practical Training"
      sectionDescription="Edit the section heading on the public website, then manage the facility cards below (workshops, tools, labs, and training spaces)."
      listConfig={ENTITY_CONFIGS.facilities}
      listDescription="Each card appears under Facilities & Practical Training on the public site. Upload a photo, write a title and description, set Status to Published, then Save."
      entityLabel="Facilities Section"
    />
  );
}
