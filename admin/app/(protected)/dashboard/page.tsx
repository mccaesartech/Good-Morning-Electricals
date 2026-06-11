import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PageHeader from '@/components/ui/PageHeader';

async function getCount(table: string) {
  const supabase = await createClient();
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
  return count ?? 0;
}

async function getRecentActivity() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('activity_log')
    .select('summary, action, entity, created_at, user_email')
    .order('created_at', { ascending: false })
    .limit(6);
  return data ?? [];
}

const QUICK_LINKS = [
  { href: '/programmes', label: 'Programmes' },
  { href: '/staff', label: 'Staff' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/settings', label: 'Site Settings' }
];

export default async function DashboardPage() {
  const [programmes, staff, gallery, testimonials, faq, activity] = await Promise.all([
    getCount('programmes'),
    getCount('staff'),
    getCount('gallery'),
    getCount('testimonials'),
    getCount('faq'),
    getRecentActivity()
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Manage your academy website content. Changes sync to Supabase instantly."
      />

      <div className="dash-stats">
        <div className="dash-card">
          <div className="dash-card__icon gold">🎓</div>
          <div><strong>{programmes}</strong><span>Programmes</span></div>
        </div>
        <div className="dash-card">
          <div className="dash-card__icon blue">👥</div>
          <div><strong>{staff}</strong><span>Staff</span></div>
        </div>
        <div className="dash-card">
          <div className="dash-card__icon green">🖼️</div>
          <div><strong>{gallery}</strong><span>Gallery Photos</span></div>
        </div>
        <div className="dash-card">
          <div className="dash-card__icon purple">💬</div>
          <div><strong>{testimonials}</strong><span>Testimonials</span></div>
        </div>
        <div className="dash-card">
          <div className="dash-card__icon gold">❓</div>
          <div><strong>{faq}</strong><span>FAQ Items</span></div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="quick-links">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="btn btn-secondary btn-sm">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>Publishing</h3>
          <ol>
            <li>Edit content in any section below.</li>
            <li>Set status to <strong>Published</strong> when ready.</li>
            <li>The public website loads published content automatically.</li>
          </ol>
        </div>
      </div>

      <div className="card">
        <h3>Recent Activity</h3>
        {activity.length === 0 ? (
          <p>No activity logged yet.</p>
        ) : (
          <ul className="activity-list">
            {activity.map((item, i) => (
              <li key={i}>
                <strong>{item.action}</strong> — {item.summary || item.entity}
                {item.user_email ? ` (${item.user_email})` : ''}
                <br />
                <small>{new Date(item.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
        <Link href="/activity" className="btn btn-ghost-dark btn-sm" style={{ marginTop: '1rem' }}>
          View full activity log →
        </Link>
      </div>
    </>
  );
}
