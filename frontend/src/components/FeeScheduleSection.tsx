import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import type { FeeSchedule, FeeType } from '../types';

const FEE_TYPES: FeeType[] = ['MEMBERSHIP_DUE', 'LEVY', 'EVENT_FEE', 'FINE', 'OTHER'];

export function FeeScheduleSection() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', type: 'MEMBERSHIP_DUE' as FeeType, amount: '', dueDate: '' });
  const [error, setError] = useState('');

  const { data } = useQuery({
    queryKey: ['fee-schedules'],
    queryFn: async () => (await api.get<{ feeSchedules: FeeSchedule[] }>('/finance/fee-schedules')).data
      .feeSchedules,
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post('/finance/fee-schedules', {
        name: form.name,
        type: form.type,
        amount: parseFloat(form.amount),
        dueDate: form.dueDate || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-schedules'] });
      setForm({ name: '', type: 'MEMBERSHIP_DUE', amount: '', dueDate: '' });
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Could not create fee schedule'),
  });

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <h2 className="font-display text-lg font-medium text-ink">Fee schedules</h2>
      <p className="mt-1 text-sm text-slate">Dues, levies, and fees members are billed against.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          createMutation.mutate();
        }}
        className="mt-4 grid grid-cols-4 gap-3"
      >
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FeeType }))}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
          >
            {FEE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Amount (KES)"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          required
        />
        <Input
          label="Due date (optional)"
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
        />
        <div className="col-span-4">
          {error && <p className="mb-2 text-sm text-danger">{error}</p>}
          <Button type="submit" isLoading={createMutation.isPending}>
            Add fee schedule
          </Button>
        </div>
      </form>

      <div className="mt-5 divide-y divide-border">
        {data?.length === 0 && <p className="py-3 text-sm text-slate">No fee schedules yet.</p>}
        {data?.map((fs) => (
          <div key={fs.id} className="flex items-center justify-between py-2.5 text-sm">
            <div>
              <span className="font-medium text-ink">{fs.name}</span>
              <span className="ml-2 text-xs text-slate">{fs.type.replace('_', ' ')}</span>
            </div>
            <span className="font-mono text-ink">KES {Number(fs.amount).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
