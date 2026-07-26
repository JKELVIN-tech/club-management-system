import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { FeeScheduleSection } from '../components/FeeScheduleSection';
import { PaymentsSection } from '../components/PaymentsSection';
import type { FinancialSummary, Payment } from '../types';

export function FinancePage() {
  const { data: summary } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => (await api.get<FinancialSummary>('/finance/summary')).data,
  });

  const { data: defaulters } = useQuery({
    queryKey: ['defaulters'],
    queryFn: async () => (await api.get<{ defaulters: Payment[] }>('/finance/defaulters')).data.defaulters,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">Finance</h1>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate">Total collected</p>
          <p className="mt-2 font-display text-3xl font-medium text-success">
            KES {(summary?.totalCollected ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-slate">Outstanding</p>
          <p className="mt-2 font-display text-3xl font-medium text-danger">
            KES {(summary?.totalOutstanding ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      {defaulters && defaulters.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber/40 bg-amber-light p-5">
          <h2 className="font-display text-lg font-medium text-ink">
            Outstanding balances ({defaulters.length})
          </h2>
          <div className="mt-3 divide-y divide-border/60">
            {defaulters.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink">
                  {d.member.firstName} {d.member.lastName}
                </span>
                <span className="font-mono text-ink">
                  KES {(Number(d.amount) - Number(d.amountPaid)).toLocaleString()} owed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <FeeScheduleSection />
      </div>

      <PaymentsSection />
    </div>
  );
}
