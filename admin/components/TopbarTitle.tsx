'use client';

import { usePathname } from 'next/navigation';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your academy website' },
  '/programmes': { title: 'Programmes', subtitle: 'Manage training programmes' },
  '/staff': { title: 'Staff', subtitle: 'Manage faculty and team members' },
  '/gallery': { title: 'Gallery', subtitle: 'Manage photo gallery' },
  '/testimonials': { title: 'Testimonials', subtitle: 'Manage student testimonials' },
  '/faq': { title: 'FAQ', subtitle: 'Manage frequently asked questions' },
  '/facilities': { title: 'Facilities', subtitle: 'Manage facility highlights' },
  '/hero': { title: 'Hero Section', subtitle: 'Edit homepage hero content' },
  '/settings': { title: 'Site Settings', subtitle: 'Global site configuration' },
  '/contact': { title: 'Contact Info', subtitle: 'Phone, email, and location' },
  '/activity': { title: 'Activity Log', subtitle: 'Admin audit trail' },
  '/enquiries': { title: 'Enquiries', subtitle: 'Contact form submissions' },
  '/enrolments': { title: 'Enrolments', subtitle: 'Online applications' },
  '/users': { title: 'User Management', subtitle: 'Admin accounts and roles' }
};

export default function TopbarTitle() {
  const pathname = usePathname();
  const meta = TITLES[pathname] ?? { title: 'Admin', subtitle: 'Content management' };

  return (
    <div className="topbar__title">
      <h2>{meta.title}</h2>
      <p>{meta.subtitle}</p>
    </div>
  );
}
