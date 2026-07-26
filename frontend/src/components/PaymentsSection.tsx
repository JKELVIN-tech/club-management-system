import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { StatusPill } from '../components/StatusPill';
import type { FeeSchedule, PaginatedMembers, PaginatedPayments, PaymentMethod } from '../types';

const METHODS: PaymentMethod[] = ['CASH', 'MPESA', 'BANK_TRANSFER', 'CARD', 'OTHER'];

export function PaymentsSection() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    memberId: '',
    feeScheduleId: '',
    amount: '',
    amountPaid: '',
    method: 'CASH' as PaymentMethod,
  });
  const [error, setError] = useState('');

  const { data: members } = useQuery({
    queryKey: ['members', { search: '', status: 'ACTIVE' }],
    queryFn: async () =>
      (await api.get<PaginatedMembers>('/members', { params: { status: 'ACTIVE', pageSize: 100 } })).data
        .members,
  });

  const { data: feeSchedules } = useQuery({
    queryKey: ['fee-schedules'],
    queryFn: async () => (await api.get<{ feeSchedules: FeeSchedule[] }>('/finance/fee-schedules')).data
      .feeSchedules,
  });

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => (await api.get<PaginatedPayments>('/finance/payments')).data,
  });

  const recordMutation = useMutation({
    mutationFn: async () =>
      api.post('/finance/payments', {
        memberId: form.memberId,
        feeScheduleId: form.feeScheduleId || undefined,
        amount: parseFloat(form.amount),
        amountPaid: form.amountPaid ? parseFloat(form.amountPaid) : parseFloat(form.amount),
        method: form.method,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['defaulters'] });
      setForm({ memberId: '', feeScheduleId: '', amount: '', amountPaid: '', method: 'CASH' });
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Could not record payment'),
  });

  function handleFeeScheduleSelect(id: string) {
    const fs = feeSchedules?.find((f) => f.id === id);
    setForm((f) => ({ ...f, feeScheduleId: id, amount: fs ? fs.amount : f.amount }));
  }

  return (
    <div className="mt-6 rounded-lg border border-border bg-white p-5">
      <h2 className="font-display text-lg font-medium text-ink">Record a payment</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          recordMutation.mutate();
        }}
        className="mt-4 grid grid-cols-5 gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Member</label>
          <select
            value={form.memberId}
            onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
            required
          >
            <option value="">Select…</option>
            {members?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Fee schedule</label>
          <select
            value={form.feeScheduleId}
            onChange={(e) => handleFeeScheduleSelect(e.target.value)}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="">None (ad hoc)</option>
            {feeSchedules?.map((fs) => (
              <option key={fs.id} value={fs.id}>
                {fs.name}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Amount due (KES)"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          required
        />
        <Input
          label="Amount paid (KES)"
          type="number"
          min="0"
          step="0.01"
          placeholder="Same as due if blank"
          value={form.amountPaid}
          onChange={(e) => setForm((f) => ({ ...f, amountPaid: e.target.value }))}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Method</label>
          <select
            value={form.method}
            onChange={(e) => setForm((f) => ({ ...f, method: e.target.value as PaymentMethod }))}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-5">
          {error && <p className="mb-2 text-sm text-danger">{error}</p>}
          <Button type="submit" isLoading={recordMutation.isPending}>
            Record payment
          </Button>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-forest-light text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments?.payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate">
                  No payments recorded yet.
                </td>
              </tr>
            )}
            {payments?.payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  {p.member.firstName} {p.member.lastName}
                </td>
                <td className="px-4 py-3 text-slate">{p.feeSchedule?.name ?? 'Ad hoc'}</td>
                <td className="px-4 py-3 font-mono text-ink">
                  KES {Number(p.amountPaid).toLocaleString()} / {Number(p.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={p.status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate">
                  {p.receiptNumber ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
