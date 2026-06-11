import { createClient } from '@/lib/supabase/server';

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

export default async function DashboardPage() {
  const [programmes, staff, gallery, testimonials, activity] = await Promise.all([
    getCount('programmes'),
    getCount('staff'),
    getCount('gallery'),
    getCount('testimonials'),
    getRecentActivity()
  ]);

  return (
    <>
      <div className="dash-stats">
        <div className="dash-card">
          <div className="dash-card__icon gold">🎓</div>
          <div>
            <strong>{programmes}</strong>
            <span>Programmes</span>
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card__icon blue">👥</div>
          <div>
            <strong>{staff}</strong>
            <span>Staff</span>
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card__icon green">🖼️</div>
          <div>
            <strong>{gallery}</strong>
            <span>Gallery Photos</span>
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card__icon purple">💬</div>
          <div>
            <strong>{testimonials}</strong>
            <span>Testimonials</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Quick Actions</h3>
          <p>Content editing modules will be available in Phase D.</p>
          <ul style={{ marginTop: '0.75rem' }}>
            <li>Site Settings, Hero, Programmes, and more</li>
            <li>Image uploads to Supabase Storage</li>
            <li>Draft / Publish workflow</li>
          </ul>
        </div>
        <div className="card">
          <h3>Publishing</h3>
          <ol>
            <li>Edit content in the admin dashboard (Phase D).</li>
            <li>Changes save to Supabase instantly.</li>
            <li>The public website loads published content automatically.</li>
          </ol>
        </div>
      </div>

      <div className="card">
        <h3>Recent Activity</h3>
        {activity.length === 0 ? (
          <p>No activity logged yet.</p>
        ) : (
          <ul>
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
      </div>
    </>
  );
}
