import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { SendAnnouncementForm } from '../components/SendAnnouncementForm';
import { StatusPill } from '../components/StatusPill';
import type { InboxItem, SentNotification } from '../types';

const dateFormatter = new Intl.DateTimeFormat('en-KE', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function CommunicationPage() {
  const member = useAuthStore((s) => s.member);
  const canBroadcast = ['ADMIN', 'SECRETARY', 'TREASURER'].includes(member?.role ?? '');
  const queryClient = useQueryClient();

  const { data: inbox } = useQuery({
    queryKey: ['inbox'],
    queryFn: async () => (await api.get<{ items: InboxItem[] }>('/communication/inbox')).data.items,
  });

  const { data: sent } = useQuery({
    queryKey: ['sent-notifications'],
    queryFn: async () =>
      (await api.get<{ notifications: SentNotification[] }>('/communication/notifications')).data
        .notifications,
    enabled: canBroadcast,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/communication/inbox/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inbox'] }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-medium text-ink">Announcements</h1>

      {canBroadcast && (
        <div className="mt-6">
          <SendAnnouncementForm />
        </div>
      )}

      <div className="mt-6 rounded-lg border border-border bg-white p-5">
        <h2 className="font-display text-lg font-medium text-ink">Your inbox</h2>
        <div className="mt-3 divide-y divide-border">
          {inbox?.length === 0 && <p className="py-3 text-sm text-slate">Nothing here yet.</p>}
          {inbox?.map((item) => (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-4 py-3 ${!item.readAt ? 'bg-forest-light/40' : ''}`}
              onClick={() => !item.readAt && markReadMutation.mutate(item.id)}
            >
              <div className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink">{item.notification.title}</p>
                  {!item.readAt && <span className="h-1.5 w-1.5 rounded-full bg-amber" />}
                </div>
                <p className="mt-1 text-sm text-slate">{item.notification.body}</p>
                <p className="mt-1 text-xs text-slate">
                  {dateFormatter.format(new Date(item.notification.createdAt))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {canBroadcast && (
        <div className="mt-6 rounded-lg border border-border bg-white p-5">
          <h2 className="font-display text-lg font-medium text-ink">Sent history</h2>
          <div className="mt-3 divide-y divide-border">
            {sent?.length === 0 && <p className="py-3 text-sm text-slate">Nothing sent yet.</p>}
            {sent?.map((n) => (
              <div key={n.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <span className="font-medium text-ink">{n.title}</span>
                  <StatusPill status={n.type} />
                </div>
                <span className="text-xs text-slate">
                  {n._count.recipients} recipients · {dateFormatter.format(new Date(n.createdAt))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
