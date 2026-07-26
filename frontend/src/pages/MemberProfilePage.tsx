import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { StatusPill } from '../components/StatusPill';
import type { Member } from '../types';

export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['members', id],
    queryFn: async () => (await api.get<{ member: Member }>(`/members/${id}`)).data.member,
  });

  if (isLoading) return <p className="text-slate">Loading member…</p>;
  if (!data) return <p className="text-slate">Member not found.</p>;

  const joinDate = new Date(data.joinDate).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-medium text-ink">Member Profile</h1>

      {/* Membership card motif, echoing the login screen */}
      <div className="mt-6 rounded-t-xl bg-forest px-8 pt-6 pb-5 text-white">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-white/60">
          Club Membership Card
        </p>
        <h2 className="mt-1 font-display text-xl font-medium">
          {data.firstName} {data.lastName}
        </h2>
        <p className="text-sm text-white/70">{data.role}</p>
      </div>
      <div className="stitched-edge rounded-b-xl bg-white px-8 py-6 shadow-sm">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate">Email</dt>
            <dd className="mt-1 text-ink">{data.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate">Phone</dt>
            <dd className="mt-1 text-ink">{data.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate">Member since</dt>
            <dd className="mt-1 text-ink">{joinDate}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate">Status</dt>
            <dd className="mt-1">
              <StatusPill status={data.status} />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
