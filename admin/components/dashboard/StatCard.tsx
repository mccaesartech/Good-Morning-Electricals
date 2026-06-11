import Link from 'next/link';

type StatCardProps = {
  href: string;
  count: number;
  label: string;
  icon: string;
  variant: 'gold' | 'blue' | 'green' | 'purple';
};

export default function StatCard({ href, count, label, icon, variant }: StatCardProps) {
  return (
    <Link href={href} className={`dash-card dash-card--link dash-card--${variant}`}>
      <div className={`dash-card__icon ${variant}`}>{icon}</div>
      <div>
        <strong>{count}</strong>
        <span>{label}</span>
      </div>
      <span className="dash-card__arrow" aria-hidden="true">→</span>
    </Link>
  );
}
