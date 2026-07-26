const STYLES: Record<string, string> = {
  ACTIVE: 'bg-success-light text-success',
  PAID: 'bg-success-light text-success',
  ATTENDED: 'bg-success-light text-success',
  COMPLETED: 'bg-success-light text-success',
  PUBLISHED: 'bg-success-light text-success',

  PENDING: 'bg-amber-light text-amber',
  PARTIAL: 'bg-amber-light text-amber',
  REGISTERED: 'bg-amber-light text-amber',
  DRAFT: 'bg-amber-light text-amber',

  SUSPENDED: 'bg-danger-light text-danger',
  INACTIVE: 'bg-danger-light text-danger',
  EXPELLED: 'bg-danger-light text-danger',
  OVERDUE: 'bg-danger-light text-danger',
  CANCELLED: 'bg-danger-light text-danger',
  ABSENT: 'bg-danger-light text-danger',
};

export function StatusPill({ status }: { status: string }) {
  const style = STYLES[status] ?? 'bg-forest-light text-forest';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${style}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
