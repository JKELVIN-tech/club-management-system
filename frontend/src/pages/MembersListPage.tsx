import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { StatusPill } from '../components/StatusPill';
import { Input } from '../components/Input';
import type { PaginatedMembers } from '../types';

export function MembersListPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['members', { search, status }],
    queryFn: async () =>
      (
        await api.get<PaginatedMembers>('/members', {
          params: { search: search || undefined, status: status || undefined },
        })
      ).data,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) =>
      api.patch(`/members/${id}/status`, { status: 'ACTIVE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ink">Members</h1>
      </div>

      <div className="mt-6 flex gap-3">
        <div className="w-64">
          <Input
            label="Search"
            placeholder="Name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-forest-light text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate">
                  Loading members…
                </td>
              </tr>
            )}
            {data?.members.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate">
                  No members match those filters.
                </td>
              </tr>
            )}
            {data?.members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3">
                  <Link to={`/members/${m.id}`} className="font-medium text-forest hover:underline">
                    {m.firstName} {m.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate">{m.email}</td>
                <td className="px-4 py-3 text-slate">{m.role}</td>
                <td className="px-4 py-3">
                  <StatusPill status={m.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {m.status === 'PENDING' && (
                    <button
                      onClick={() => approveMutation.mutate(m.id)}
                      className="text-xs font-medium text-forest hover:underline"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && (
        <p className="mt-3 text-xs text-slate">
          Showing {data.members.length} of {data.pagination.total} members
        </p>
      )}
    </div>
  );
}
