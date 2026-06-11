import type { ContentStatus } from '@/lib/constants';

const STYLES: Record<ContentStatus, string> = {
  published: 'status-badge status-badge--published',
  draft: 'status-badge status-badge--draft'
};

export default function StatusBadge({ status }: { status: ContentStatus | string }) {
  const key = (status in STYLES ? status : 'draft') as ContentStatus;
  return <span className={STYLES[key]}>{status}</span>;
}
