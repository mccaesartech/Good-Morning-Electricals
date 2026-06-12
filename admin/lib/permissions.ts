export const PERMISSIONS = [
  'manage_programmes',
  'manage_staff',
  'manage_gallery',
  'manage_testimonials',
  'manage_faq',
  'manage_hero',
  'manage_facilities',
  'manage_contact',
  'manage_settings',
  'manage_users',
  'manage_enquiries',
  'manage_enrolments',
  'view_activity',
  'view_enquiries',
  'view_enrolments'
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type AdminRole =
  | 'superadmin'
  | 'content_manager'
  | 'staff_manager'
  | 'viewer'
  | 'editor';

export const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: 'Super Admin',
  content_manager: 'Content Manager',
  staff_manager: 'Staff Manager',
  viewer: 'Viewer',
  editor: 'Content Manager (legacy)'
};

export const ROUTE_PERMISSIONS: Record<string, Permission | Permission[] | 'any'> = {
  '/dashboard': 'any',
  '/programmes': 'manage_programmes',
  '/staff': 'manage_staff',
  '/gallery': 'manage_gallery',
  '/testimonials': 'manage_testimonials',
  '/faq': 'manage_faq',
  '/hero': 'manage_hero',
  '/about': 'manage_hero',
  '/features': 'manage_hero',
  '/admissions': 'manage_hero',
  '/journey': 'manage_programmes',
  '/careers': 'manage_programmes',
  '/facilities': 'manage_facilities',
  '/contact': 'manage_contact',
  '/settings': 'manage_settings',
  '/users': 'manage_users',
  '/enquiries': ['view_enquiries', 'manage_enquiries'],
  '/enrolments': ['view_enrolments', 'manage_enrolments'],
  '/activity': ['view_activity', 'manage_users']
};

export function hasPermission(
  permissions: string[] | undefined,
  required: Permission | Permission[] | 'any'
): boolean {
  if (!permissions) return false;
  if (required === 'any') return permissions.length > 0;
  const needed = Array.isArray(required) ? required : [required];
  return needed.some((p) => permissions.includes(p));
}

export function canManage(permissions: string[] | undefined, perm: Permission): boolean {
  return permissions?.includes(perm) ?? false;
}

export function permissionLabel(perm: string): string {
  return perm
    .replace(/^manage_/, 'Manage ')
    .replace(/^view_/, 'View ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
