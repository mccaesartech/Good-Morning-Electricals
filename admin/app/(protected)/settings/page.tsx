import SingletonEditor from '@/components/crud/SingletonEditor';

const FIELDS = [
  { name: 'academy_name', label: 'Academy Name', type: 'text' as const, col: 'full' as const },
  { name: 'logo_line_1', label: 'Logo Line 1', type: 'text' as const, col: 'half' as const },
  { name: 'logo_line_2', label: 'Logo Line 2', type: 'text' as const, col: 'half' as const },
  { name: 'tagline', label: 'Tagline', type: 'text' as const, col: 'full' as const },
  { name: 'established_year', label: 'Established Year', type: 'text' as const, col: 'half' as const },
  { name: 'logo_url', label: 'Logo URL', type: 'image' as const, imageFolder: 'branding', col: 'full' as const },
  { name: 'footer_description', label: 'Footer Description', type: 'textarea' as const, rows: 3, col: 'full' as const },
  { name: 'footer_copyright', label: 'Footer Copyright', type: 'text' as const, col: 'full' as const },
  { name: 'social_facebook', label: 'Facebook URL', type: 'text' as const, col: 'half' as const },
  { name: 'social_instagram', label: 'Instagram URL', type: 'text' as const, col: 'half' as const },
  { name: 'social_twitter', label: 'Twitter / X URL', type: 'text' as const, col: 'half' as const },
  { name: 'social_linkedin', label: 'LinkedIn URL', type: 'text' as const, col: 'half' as const },
  { name: 'social_youtube', label: 'YouTube URL', type: 'text' as const, col: 'half' as const },
  { name: 'meta_title', label: 'Meta Title', type: 'text' as const, col: 'full' as const },
  { name: 'meta_description', label: 'Meta Description', type: 'textarea' as const, rows: 2, col: 'full' as const },
  { name: 'meta_keywords', label: 'Meta Keywords', type: 'text' as const, col: 'full' as const },
  { name: 'status', label: 'Status', type: 'select' as const, col: 'half' as const }
];

export default function SettingsPage() {
  return (
    <SingletonEditor
      table="site_settings"
      title="Site Settings"
      description="Global branding, footer, social links, and SEO settings."
      fields={FIELDS}
      entityLabel="Site Settings"
    />
  );
}
