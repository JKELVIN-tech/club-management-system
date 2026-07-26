import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function CreateEventForm() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    capacity: '',
  });
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: async () =>
      api.post('/events', {
        title: form.title,
        description: form.description || undefined,
        location: form.location || undefined,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        capacity: form.capacity ? parseInt(form.capacity, 10) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setForm({ title: '', description: '', location: '', startTime: '', endTime: '', capacity: '' });
      setOpen(false);
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Could not create event'),
  });

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        + New event
      </Button>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError('');
        createMutation.mutate();
      }}
      className="rounded-lg border border-border bg-white p-5"
    >
      <h2 className="font-display text-lg font-medium text-ink">New event</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div className="col-span-2">
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
        </div>
        <Input
          label="Starts"
          type="datetime-local"
          value={form.startTime}
          onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          required
        />
        <Input
          label="Ends"
          type="datetime-local"
          value={form.endTime}
          onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
          required
        />
        <Input
          label="Capacity (optional)"
          type="number"
          min="1"
          value={form.capacity}
          onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
        />
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button type="submit" isLoading={createMutation.isPending}>
          Create as draft
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
