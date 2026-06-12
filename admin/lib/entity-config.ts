export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'image' | 'lines';

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  imageFolder?: string;
  rows?: number;
  col?: 'full' | 'half';
};

export type ColumnDef = {
  key: string;
  label: string;
};

export type EntityConfig = {
  table: string;
  label: string;
  labelSingular: string;
  imageFolder?: string;
  columns: ColumnDef[];
  fields: FormField[];
  defaultValues?: Record<string, unknown>;
};

function linesToJson(value: string): string[] {
  return value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function jsonToLines(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value.map(String).join('\n');
}

export function serializeFieldValue(field: FormField, value: unknown): unknown {
  if (field.type === 'lines') return linesToJson(String(value ?? ''));
  if (field.type === 'number') return value === '' || value === undefined ? null : Number(value);
  return value;
}

export function deserializeFieldValue(field: FormField, value: unknown): string | number {
  if (field.type === 'lines') return jsonToLines(value);
  if (field.type === 'number') return value === null || value === undefined ? '' : Number(value);
  return String(value ?? '');
}

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  programmes: {
    table: 'programmes',
    label: 'Programmes',
    labelSingular: 'Programme',
    imageFolder: 'programmes',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'duration', label: 'Duration' },
      { key: 'sort_order', label: 'Order' },
      { key: 'status', label: 'Status' }
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, col: 'full' },
      { name: 'slug', label: 'Slug', type: 'text', placeholder: 'auto-generated-if-empty', col: 'half' },
      { name: 'icon', label: 'Icon (Font Awesome class)', type: 'text', placeholder: 'fa-plug', col: 'half' },
      { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 4, col: 'full' },
      { name: 'duration', label: 'Duration', type: 'text', col: 'half' },
      { name: 'certificate', label: 'Certificate', type: 'text', col: 'half' },
      { name: 'badge', label: 'Badge', type: 'text', col: 'half' },
      { name: 'sort_order', label: 'Sort Order', type: 'number', col: 'half' },
      { name: 'image_url', label: 'Image', type: 'image', imageFolder: 'programmes', col: 'full' },
      { name: 'careers', label: 'Career Paths (one per line)', type: 'lines', col: 'full' },
      { name: 'status', label: 'Status', type: 'select', col: 'half' }
    ],
    defaultValues: { icon: 'fa-plug', sort_order: 0, status: 'published', careers: [] }
  },
  staff: {
    table: 'staff',
    label: 'Instructors & Staff',
    labelSingular: 'Staff Member',
    imageFolder: 'staff',
    columns: [
      { key: 'full_name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'sort_order', label: 'Order' },
      { key: 'status', label: 'Status' }
    ],
    fields: [
      { name: 'full_name', label: 'Full Name', type: 'text', required: true, col: 'half' },
      { name: 'role', label: 'Role', type: 'text', required: true, col: 'half' },
      { name: 'initials', label: 'Initials', type: 'text', placeholder: 'KA', col: 'half' },
      { name: 'sort_order', label: 'Sort Order', type: 'number', col: 'half' },
      { name: 'qualifications', label: 'Qualifications', type: 'text', col: 'full' },
      { name: 'bio', label: 'Bio', type: 'textarea', rows: 4, col: 'full' },
      { name: 'photo_url', label: 'Photo', type: 'image', imageFolder: 'staff', col: 'full' },
      { name: 'status', label: 'Status', type: 'select', col: 'half' }
    ],
    defaultValues: { sort_order: 0, status: 'published' }
  },
  gallery: {
    table: 'gallery',
    label: 'Practical & Field Photos',
    labelSingular: 'Gallery Photo',
    imageFolder: 'gallery',
    columns: [
      { key: 'caption', label: 'Caption' },
      { key: 'sort_order', label: 'Order' },
      { key: 'status', label: 'Status' }
    ],
    fields: [
      { name: 'caption', label: 'Caption', type: 'text', required: true, col: 'full', placeholder: 'e.g. Students during workshop practical' },
      { name: 'alt_text', label: 'Alt Text', type: 'text', col: 'full' },
      { name: 'image_url', label: 'Image', type: 'image', imageFolder: 'gallery', required: true, col: 'full' },
      { name: 'sort_order', label: 'Sort Order', type: 'number', col: 'half' },
      { name: 'status', label: 'Status', type: 'select', col: 'half' }
    ],
    defaultValues: { sort_order: 0, status: 'published', image_url: '' }
  },
  testimonials: {
    table: 'testimonials',
    label: 'Testimonials',
    labelSingular: 'Testimonial',
    columns: [
      { key: 'author_name', label: 'Author' },
      { key: 'programme', label: 'Programme' },
      { key: 'stars', label: 'Stars' },
      { key: 'status', label: 'Status' }
    ],
    fields: [
      { name: 'author_name', label: 'Author Name', type: 'text', required: true, col: 'half' },
      { name: 'initials', label: 'Initials', type: 'text', required: true, col: 'half' },
      { name: 'programme', label: 'Programme', type: 'text', col: 'half' },
      { name: 'stars', label: 'Stars (1–5)', type: 'number', col: 'half' },
      { name: 'quote', label: 'Quote', type: 'textarea', required: true, rows: 4, col: 'full' },
      { name: 'sort_order', label: 'Sort Order', type: 'number', col: 'half' },
      { name: 'status', label: 'Status', type: 'select', col: 'half' }
    ],
    defaultValues: { stars: 5, sort_order: 0, status: 'published' }
  },
  faq: {
    table: 'faq',
    label: 'FAQ',
    labelSingular: 'FAQ Item',
    columns: [
      { key: 'question', label: 'Question' },
      { key: 'sort_order', label: 'Order' },
      { key: 'status', label: 'Status' }
    ],
    fields: [
      { name: 'question', label: 'Question', type: 'text', required: true, col: 'full' },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true, rows: 5, col: 'full' },
      { name: 'sort_order', label: 'Sort Order', type: 'number', col: 'half' },
      { name: 'status', label: 'Status', type: 'select', col: 'half' }
    ],
    defaultValues: { sort_order: 0, status: 'published' }
  },
  facilities: {
    table: 'facilities',
    label: 'Facility Cards',
    labelSingular: 'Facility Card',
    imageFolder: 'facilities',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'sort_order', label: 'Order' },
      { key: 'status', label: 'Status' }
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, col: 'full' },
      { name: 'icon', label: 'Icon (Font Awesome class)', type: 'text', placeholder: 'fa-toolbox', col: 'half' },
      { name: 'sort_order', label: 'Sort Order', type: 'number', col: 'half' },
      { name: 'body', label: 'Description', type: 'textarea', required: true, rows: 4, col: 'full' },
      { name: 'image_url', label: 'Image', type: 'image', imageFolder: 'facilities', col: 'full' },
      { name: 'status', label: 'Status', type: 'select', col: 'half' }
    ],
    defaultValues: { icon: 'fa-toolbox', sort_order: 0, status: 'published' }
  },
  features: {
    table: 'features',
    label: 'Why Choose Us',
    labelSingular: 'Feature',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'sort_order', label: 'Order' },
      { key: 'status', label: 'Status' }
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, col: 'full' },
      { name: 'icon', label: 'Icon (Font Awesome class)', type: 'text', placeholder: 'fa-star', col: 'half' },
      { name: 'sort_order', label: 'Sort Order', type: 'number', col: 'half' },
      { name: 'body', label: 'Description', type: 'textarea', required: true, rows: 3, col: 'full' },
      { name: 'status', label: 'Status', type: 'select', col: 'half' }
    ],
    defaultValues: { icon: 'fa-star', sort_order: 0, status: 'published' }
  },
  journey: {
    table: 'journey',
    label: 'Student Journey',
    labelSingular: 'Journey Step',
    columns: [
      { key: 'step_label', label: 'Step' },
      { key: 'title', label: 'Title' },
      { key: 'sort_order', label: 'Order' },
      { key: 'status', label: 'Status' }
    ],
    fields: [
      { name: 'step_label', label: 'Step Label', type: 'text', required: true, placeholder: 'Step 1', col: 'half' },
      { name: 'icon', label: 'Icon (Font Awesome class)', type: 'text', placeholder: 'fa-user-plus', col: 'half' },
      { name: 'title', label: 'Title', type: 'text', required: true, col: 'full' },
      { name: 'body', label: 'Description', type: 'textarea', required: true, rows: 3, col: 'full' },
      { name: 'sort_order', label: 'Sort Order', type: 'number', col: 'half' },
      { name: 'status', label: 'Status', type: 'select', col: 'half' }
    ],
    defaultValues: { icon: 'fa-circle', sort_order: 0, status: 'published' }
  },
  careers: {
    table: 'careers',
    label: 'Career Paths',
    labelSingular: 'Career Path',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'sort_order', label: 'Order' },
      { key: 'status', label: 'Status' }
    ],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, col: 'full' },
      { name: 'icon', label: 'Icon (Font Awesome class)', type: 'text', placeholder: 'fa-bolt', col: 'half' },
      { name: 'sort_order', label: 'Sort Order', type: 'number', col: 'half' },
      { name: 'body', label: 'Description', type: 'textarea', required: true, rows: 3, col: 'full' },
      { name: 'status', label: 'Status', type: 'select', col: 'half' }
    ],
    defaultValues: { icon: 'fa-bolt', sort_order: 0, status: 'published' }
  }
};
