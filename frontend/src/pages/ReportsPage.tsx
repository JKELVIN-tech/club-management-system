import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../lib/api';
import type { MembershipReport, FinancialReportData, EventsReportData } from '../types';

const monthFormatter = new Intl.DateTimeFormat('en-KE', { month: 'short', year: '2-digit' });
const COLORS = ['#1f5f4f', '#d98e2b', '#b3432f', '#5c6b64', '#2f7a52'];

export function ReportsPage() {
  const { data: membership } = useQuery({
    queryKey: ['reports', 'membership'],
    queryFn: async () => (await api.get<MembershipReport>('/reporting/membership')).data,
  });

  const { data: financial } = useQuery({
    queryKey: ['reports', 'financial'],
    queryFn: async () => (await api.get<FinancialReportData>('/reporting/financial')).data,
  });

  const { data: events } = useQuery({
    queryKey: ['reports', 'events'],
    queryFn: async () => (await api.get<EventsReportData>('/reporting/events')).data,
  });

  const growthData = membership?.growth.map((g) => ({
    month: monthFormatter.format(new Date(g.month)),
    count: g.count,
  }));

  const collectedData = financial?.monthlyCollected.map((m) => ({
    month: monthFormatter.format(new Date(m.month)),
    total: m.total,
  }));

  const statusPieData = membership?.byStatus.map((s) => ({ name: s.status, value: s._count }));

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">Reports</h1>
      <p className="mt-1 text-sm text-slate">
        Membership, financial, and event performance at a glance.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <ChartCard title="Membership growth (last 12 months)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcd8cc" />
              <XAxis dataKey="month" fontSize={12} stroke="#5c6b64" />
              <YAxis fontSize={12} stroke="#5c6b64" allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="New members" stroke="#1f5f4f" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Membership by status">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {statusPieData?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly collections (KES)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={collectedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcd8cc" />
              <XAxis dataKey="month" fontSize={12} stroke="#5c6b64" />
              <YAxis fontSize={12} stroke="#5c6b64" />
              <Tooltip />
              <Bar dataKey="total" name="Collected" fill="#d98e2b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Event attendance rate (recent events)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={events?.attendanceRates} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dcd8cc" />
              <XAxis type="number" domain={[0, 100]} fontSize={12} stroke="#5c6b64" />
              <YAxis
                type="category"
                dataKey="title"
                width={100}
                fontSize={11}
                stroke="#5c6b64"
              />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="attendanceRate" name="Attendance %" fill="#2f7a52" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <SummaryCard label="Total members" value={membership?.total ?? '—'} />
        <SummaryCard
          label="Total collected"
          value={`KES ${(financial?.totalCollected ?? 0).toLocaleString()}`}
        />
        <SummaryCard
          label="Outstanding"
          value={`KES ${(financial?.totalOutstanding ?? 0).toLocaleString()}`}
        />
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <h2 className="font-display text-sm font-medium text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-slate">{label}</p>
      <p className="mt-2 font-display text-2xl font-medium text-forest">{value}</p>
    </div>
  );
}
