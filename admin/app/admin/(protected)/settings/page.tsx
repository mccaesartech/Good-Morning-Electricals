import SingletonEditor from '@/components/crud/SingletonEditor';

const FIELDS = [
  {
    name: 'header_section',
    label: 'School name in header (next to logo)',
    type: 'section' as const,
    col: 'full' as const,
    hint: 'This text appears at the very top of every page, beside your logo — before the homepage "Admissions Open" banner. To edit that banner text, go to Hero Section.'
  },
  {
    name: 'logo_line_1',
    label: 'School name — main line',
    type: 'text' as const,
    col: 'half' as const,
    placeholder: 'e.g. Good Morning',
    hint: 'Large text on the first line next to the logo.'
  },
  {
    name: 'logo_line_2',
    label: 'School name — subtitle',
    type: 'text' as const,
    col: 'half' as const,
    placeholder: 'e.g. Electrical Engineering Academy',
    hint: 'Smaller text shown underneath the main line.'
  },
  { name: 'logo_url', label: 'Logo image', type: 'image' as const, imageFolder: 'branding', col: 'full' as const },
  {
    name: 'general_section',
    label: 'Academy details & footer',
    type: 'section' as const,
    col: 'full' as const
  },
  {
    name: 'academy_name',
    label: 'Full academy name',
    type: 'text' as const,
    col: 'full' as const,
    hint: 'Used in the browser tab title, SEO, and accessibility labels (not shown as the two-line header text).'
  },
  { name: 'tagline', label: 'Tagline', type: 'text' as const, col: 'full' as const },
  { name: 'established_year', label: 'Established Year', type: 'text' as const, col: 'half' as const },
  { name: 'favicon_url', label: 'Favicon URL', type: 'image' as const, imageFolder: 'branding', col: 'half' as const },
  { name: 'og_image_url', label: 'Social Share Image (OG)', type: 'image' as const, imageFolder: 'branding', col: 'half' as const },
  { name: 'footer_description', label: 'Footer Description', type: 'textarea' as const, rows: 3, col: 'full' as const },
  { name: 'footer_copyright', label: 'Footer Copyright', type: 'text' as const, col: 'full' as const },
  {
    name: 'social_section',
    label: 'Social media links',
    type: 'section' as const,
    col: 'full' as const
  },
  { name: 'social_facebook', label: 'Facebook URL', type: 'text' as const, col: 'half' as const },
  { name: 'social_instagram', label: 'Instagram URL', type: 'text' as const, col: 'half' as const },
  { name: 'social_twitter', label: 'Twitter / X URL', type: 'text' as const, col: 'half' as const },
  { name: 'social_linkedin', label: 'LinkedIn URL', type: 'text' as const, col: 'half' as const },
  { name: 'social_youtube', label: 'YouTube URL', type: 'text' as const, col: 'half' as const },
  {
    name: 'seo_section',
    label: 'SEO & search engines',
    type: 'section' as const,
    col: 'full' as const
  },
  { name: 'meta_title', label: 'Meta Title', type: 'text' as const, col: 'full' as const },
  { name: 'meta_description', label: 'Meta Description', type: 'textarea' as const, rows: 2, col: 'full' as const },
  { name: 'meta_keywords', label: 'Meta Keywords', type: 'text' as const, col: 'full' as const },
  { name: 'status', label: 'Status', type: 'select' as const, col: 'half' as const }
];

export default function SettingsPage() {
  return (
    <SingletonEditor
      table="site_settings"
      title="Header, Logo & Site Settings"
      description="Edit the school name beside the logo at the top of the website, upload your logo, and manage footer, social, and SEO settings."
      fields={FIELDS}
      entityLabel="Site Settings"
    />
  );
}
