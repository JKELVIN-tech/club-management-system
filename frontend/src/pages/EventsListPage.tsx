import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { EventCard } from '../components/EventCard';
import { CreateEventForm } from '../components/CreateEventForm';
import type { ClubEvent } from '../types';

export function EventsListPage() {
  const member = useAuthStore((s) => s.member);
  const canManage = member?.role === 'ADMIN' || member?.role === 'SECRETARY';

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => (await api.get<{ events: ClubEvent[] }>('/events')).data.events,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-medium text-ink">Events</h1>
      </div>

      {canManage && (
        <div className="mt-6">
          <CreateEventForm />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {isLoading && <p className="text-sm text-slate">Loading events…</p>}
        {data?.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center">
            <p className="text-sm text-slate">
              {canManage ? 'No events yet — create the first one above.' : 'No upcoming events right now.'}
            </p>
          </div>
        )}
        {data?.map((event) => (
          <EventCard key={event.id} event={event} canManage={canManage} />
        ))}
      </div>
    </div>
  );
}
