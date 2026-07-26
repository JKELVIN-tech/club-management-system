import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { StatusPill } from '../components/StatusPill';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import type { EventDetail, AttendanceStatus } from '../types';

const dateFormatter = new Intl.DateTimeFormat('en-KE', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const member = useAuthStore((s) => s.member);
  const canManage = member?.role === 'ADMIN' || member?.role === 'SECRETARY';

  const { data: event, isLoading } = useQuery({
    queryKey: ['events', id],
    queryFn: async () => (await api.get<{ event: EventDetail }>(`/events/${id}`)).data.event,
  });

  const attendanceMutation = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: AttendanceStatus }) =>
      api.post(`/events/${id}/attendance`, { memberId, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', id] }),
  });

  const [reportForm, setReportForm] = useState({ attendeeCount: '', summary: '', challenges: '', recommendations: '' });
  const [reportError, setReportError] = useState('');

  const reportMutation = useMutation({
    mutationFn: async () =>
      api.post(`/events/${id}/report`, {
        attendeeCount: parseInt(reportForm.attendeeCount, 10),
        summary: reportForm.summary,
        challenges: reportForm.challenges || undefined,
        recommendations: reportForm.recommendations || undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', id] }),
    onError: (err: any) => setReportError(err.response?.data?.error || 'Could not save report'),
  });

  if (isLoading) return <p className="text-slate">Loading event…</p>;
  if (!event) return <p className="text-slate">Event not found.</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-2xl font-medium text-ink">{event.title}</h1>
        <StatusPill status={event.status} />
      </div>
      <p className="mt-1 text-sm text-slate">
        {dateFormatter.format(new Date(event.startTime))}
        {event.location ? ` · ${event.location}` : ''}
      </p>
      {event.description && <p className="mt-3 text-sm text-ink">{event.description}</p>}

      {canManage && (
        <div className="mt-6 rounded-lg border border-border bg-white p-5">
          <h2 className="font-display text-lg font-medium text-ink">
            Roster ({event.attendance.length})
          </h2>
          <div className="mt-3 divide-y divide-border">
            {event.attendance.length === 0 && (
              <p className="py-3 text-sm text-slate">No registrations yet.</p>
            )}
            {event.attendance.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-ink">
                  {a.member.firstName} {a.member.lastName}
                </span>
                <div className="flex items-center gap-3">
                  <StatusPill status={a.status} />
                  {a.status !== 'CANCELLED' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          attendanceMutation.mutate({ memberId: a.memberId, status: 'ATTENDED' })
                        }
                        className="text-xs font-medium text-forest hover:underline"
                      >
                        Mark attended
                      </button>
                      <button
                        onClick={() =>
                          attendanceMutation.mutate({ memberId: a.memberId, status: 'ABSENT' })
                        }
                        className="text-xs font-medium text-danger hover:underline"
                      >
                        Mark absent
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {canManage && !event.postEventReport && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setReportError('');
            reportMutation.mutate();
          }}
          className="mt-6 rounded-lg border border-border bg-white p-5"
        >
          <h2 className="font-display text-lg font-medium text-ink">Post-event report</h2>
          <div className="mt-4 flex flex-col gap-3">
            <Input
              label="Attendee count"
              type="number"
              min="0"
              value={reportForm.attendeeCount}
              onChange={(e) => setReportForm((f) => ({ ...f, attendeeCount: e.target.value }))}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Summary</label>
              <textarea
                value={reportForm.summary}
                onChange={(e) => setReportForm((f) => ({ ...f, summary: e.target.value }))}
                required
                rows={3}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Challenges (optional)</label>
              <textarea
                value={reportForm.challenges}
                onChange={(e) => setReportForm((f) => ({ ...f, challenges: e.target.value }))}
                rows={2}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink">Recommendations (optional)</label>
              <textarea
                value={reportForm.recommendations}
                onChange={(e) => setReportForm((f) => ({ ...f, recommendations: e.target.value }))}
                rows={2}
                className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
              />
            </div>
          </div>
          {reportError && <p className="mt-3 text-sm text-danger">{reportError}</p>}
          <Button type="submit" isLoading={reportMutation.isPending} className="mt-4">
            Submit report &amp; mark completed
          </Button>
        </form>
      )}

      {event.postEventReport && (
        <div className="mt-6 rounded-lg border border-success/30 bg-success-light p-5">
          <h2 className="font-display text-lg font-medium text-ink">Post-event report</h2>
          <p className="mt-2 text-sm text-ink">{event.postEventReport.summary}</p>
          <p className="mt-2 text-xs text-slate">
            {event.postEventReport.attendeeCount} attendees
          </p>
        </div>
      )}
    </div>
  );
}
