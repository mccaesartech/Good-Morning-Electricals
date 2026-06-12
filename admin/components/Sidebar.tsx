'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AdminProfile } from '@/lib/auth';
import { hasPermission, type Permission } from '@/lib/permissions';
import { adminPath, publicSiteUrl } from '@/lib/constants';
import Logo from './Logo';
import LogoutButton from './LogoutButton';

type NavItem = { href: string; label: string; permission: Permission | Permission[] | 'any' };

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', permission: 'any' },
      { href: '/enquiries', label: 'Enquiries', permission: ['view_enquiries', 'manage_enquiries'] },
      { href: '/enrolments', label: 'Enrolments', permission: ['view_enrolments', 'manage_enrolments'] },
      { href: '/activity', label: 'Activity Log', permission: ['view_activity', 'manage_users'] }
    ]
  },
  {
    group: 'Content',
    items: [
      { href: '/hero', label: 'Hero Section', permission: 'manage_hero' },
      { href: '/about', label: 'About', permission: 'manage_hero' },
      { href: '/features', label: 'Why Choose Us', permission: 'manage_hero' },
      { href: '/programmes', label: 'Programmes', permission: 'manage_programmes' },
      { href: '/facilities', label: 'Facilities', permission: 'manage_facilities' },
      { href: '/journey', label: 'Student Journey', permission: 'manage_programmes' },
      { href: '/careers', label: 'Career Paths', permission: 'manage_programmes' },
      { href: '/admissions', label: 'Admissions', permission: 'manage_hero' },
      { href: '/staff', label: 'Staff', permission: 'manage_staff' },
      { href: '/gallery', label: 'Gallery', permission: 'manage_gallery' },
      { href: '/testimonials', label: 'Testimonials', permission: 'manage_testimonials' },
      { href: '/faq', label: 'FAQ', permission: 'manage_faq' }
    ]
  },
  {
    group: 'Settings',
    items: [
      { href: '/settings', label: 'Site Settings', permission: 'manage_settings' },
      { href: '/contact', label: 'Contact Info', permission: 'manage_contact' },
      { href: '/users', label: 'User Management', permission: 'manage_users' }
    ]
  }
];

function isActive(pathname: string, href: string): boolean {
  const full = adminPath(href);
  return pathname === full || (href !== '/dashboard' && pathname.startsWith(`${full}/`));
}

export default function Sidebar({
  profile,
  open,
  onClose
}: {
  profile: AdminProfile;
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const perms = profile.permissions;

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="sidebar__brand">
        <Logo width={40} height={40} style={{ borderRadius: 8 }} alt="" />
        <div>
          <strong>GME Admin</strong>
          <span>Content Manager</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV.map((section) => {
          const visible = section.items.filter((item) =>
            hasPermission(perms, item.permission)
          );
          if (visible.length === 0) return null;

          return (
            <div key={section.group}>
              <p className="sidebar__group">{section.group}</p>
              {visible.map((item) => (
                <Link
                  key={item.href}
                  href={adminPath(item.href)}
                  className={`nav-item${isActive(pathname, item.href) ? ' active' : ''}`}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <a
          href={publicSiteUrl(true)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm sidebar-view-site"
        >
          View Live Site
        </a>
        <LogoutButton />
      </div>
    </aside>
  );
}
