import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';

async function getCount(table: string) {
  const supabase = await createClient();
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
  return count ?? 0;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const profile = await requireAdmin(supabase);
  if (!profile) return null;

  const [programmes, staff, gallery, testimonials, faq, enquiries, enrolments] =
    await Promise.all([
      getCount('programmes'),
      getCount('staff'),
      getCount('gallery'),
      getCount('testimonials'),
      getCount('faq'),
      getCount('contact_enquiries'),
      getCount('enrolments')
    ]);

  const perms = profile.permissions;

  return (
    <>
      <WelcomeBanner profile={profile} />

      <PageHeader
        title="Dashboard"
        description="Overview of your academy website and incoming applications."
      />

      <div className="dash-stats">
        {hasPermission(perms, 'manage_programmes') && (
          <StatCard href="/programmes" count={programmes} label="Programmes" icon="🎓" variant="gold" />
        )}
        {hasPermission(perms, 'manage_staff') && (
          <StatCard href="/staff" count={staff} label="Staff" icon="👥" variant="blue" />
        )}
        {hasPermission(perms, 'manage_gallery') && (
          <StatCard href="/gallery" count={gallery} label="Gallery Photos" icon="🖼️" variant="green" />
        )}
        {hasPermission(perms, 'manage_testimonials') && (
          <StatCard href="/testimonials" count={testimonials} label="Testimonials" icon="💬" variant="purple" />
        )}
        {hasPermission(perms, 'manage_faq') && (
          <StatCard href="/faq" count={faq} label="FAQ Items" icon="❓" variant="gold" />
        )}
        {hasPermission(perms, ['view_enquiries', 'manage_enquiries']) && (
          <StatCard href="/enquiries" count={enquiries} label="Enquiries" icon="📩" variant="blue" />
        )}
        {hasPermission(perms, ['view_enrolments', 'manage_enrolments']) && (
          <StatCard href="/enrolments" count={enrolments} label="Enrolments" icon="📋" variant="green" />
        )}
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="quick-links">
            {hasPermission(perms, 'manage_programmes') && (
              <Link href="/programmes" className="btn btn-secondary btn-sm">Programmes</Link>
            )}
            {hasPermission(perms, ['view_enquiries', 'manage_enquiries']) && (
              <Link href="/enquiries" className="btn btn-secondary btn-sm">View Enquiries</Link>
            )}
            {hasPermission(perms, ['view_enrolments', 'manage_enrolments']) && (
              <Link href="/enrolments" className="btn btn-secondary btn-sm">View Enrolments</Link>
            )}
            {hasPermission(perms, 'manage_settings') && (
              <Link href="/settings" className="btn btn-secondary btn-sm">Site Settings</Link>
            )}
          </div>
        </div>
        <div className="card">
          <h3>Workflow</h3>
          <ol>
            <li>Visitors submit enquiries and enrolments on the public site.</li>
            <li>Applicants receive an automatic confirmation email.</li>
            <li>Review submissions under <strong>Enquiries</strong> or <strong>Enrolments</strong>.</li>
            <li>Publish content changes when ready for the live website.</li>
          </ol>
        </div>
      </div>

      {hasPermission(perms, ['view_activity', 'manage_users']) && (
        <div className="card">
          <h3>Audit Trail</h3>
          <p>All admin actions are recorded in the Activity Log for compliance and review.</p>
          <Link href="/activity" className="btn btn-ghost-dark btn-sm" style={{ marginTop: '0.75rem' }}>
            Open Activity Log →
          </Link>
        </div>
      )}
    </>
  );
}
