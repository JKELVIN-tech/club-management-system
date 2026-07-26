import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { StatusPill } from './StatusPill';
import { Button } from './Button';
import type { ClubEvent } from '../types';

const dateFormatter = new Intl.DateTimeFormat('en-KE', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function EventCard({ event, canManage }: { event: ClubEvent; canManage: boolean }) {
  const queryClient = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: async () => api.post(`/events/${event.id}/publish`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const registerMutation = useMutation({
    mutationFn: async () => api.post(`/events/${event.id}/register`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-white p-4">
      <div>
        <div className="flex items-center gap-2">
          <Link to={`/events/${event.id}`} className="font-medium text-ink hover:text-forest">
            {event.title}
          </Link>
          <StatusPill status={event.status} />
        </div>
        <p className="mt-1 text-sm text-slate">
          {dateFormatter.format(new Date(event.startTime))}
          {event.location ? ` · ${event.location}` : ''}
        </p>
        <p className="mt-1 text-xs text-slate">
          {event._count.attendance} registered
          {event.capacity ? ` / ${event.capacity} capacity` : ''}
        </p>
      </div>
      <div className="flex gap-2">
        {canManage && event.status === 'DRAFT' && (
          <Button variant="secondary" onClick={() => publishMutation.mutate()} isLoading={publishMutation.isPending}>
            Publish
          </Button>
        )}
        {!canManage && event.status === 'PUBLISHED' && (
          <Button onClick={() => registerMutation.mutate()} isLoading={registerMutation.isPending}>
            RSVP
          </Button>
        )}
      </div>
    </div>
  );
}
