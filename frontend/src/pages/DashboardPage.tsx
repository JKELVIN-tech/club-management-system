import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface StatsResponse {
  total: number;
  byStatus: { status: string; _count: number }[];
  byRole: { role: string; _count: number }[];
}

export function DashboardPage() {
  const member = useAuthStore((s) => s.member);
  const canViewStats = member?.role === 'ADMIN' || member?.role === 'SECRETARY';

  const { data: stats } = useQuery({
    queryKey: ['members', 'stats'],
    queryFn: async () => (await api.get<StatsResponse>('/members/stats')).data,
    enabled: canViewStats,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">
        Welcome back, {member?.firstName}
      </h1>
      <p className="mt-1 text-sm text-slate">
        Here's what's happening with the club today.
      </p>

      {canViewStats && stats && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <StatCard label="Total members" value={stats.total} />
          <StatCard
            label="Active members"
            value={stats.byStatus.find((s) => s.status === 'ACTIVE')?._count ?? 0}
          />
          <StatCard
            label="Pending approval"
            value={stats.byStatus.find((s) => s.status === 'PENDING')?._count ?? 0}
          />
        </div>
      )}

      {!canViewStats && (
        <div className="mt-8 rounded-lg border border-border bg-white p-6">
          <p className="text-sm text-slate">
            Use the navigation on the left to view events, announcements, and your
            membership details.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-slate">{label}</p>
      <p className="mt-2 font-display text-3xl font-medium text-forest">{value}</p>
    </div>
  );
}
