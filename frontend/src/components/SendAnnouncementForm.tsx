import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import type { NotificationType } from '../types';

const TYPES: NotificationType[] = ['ANNOUNCEMENT', 'REMINDER', 'FINANCIAL_ALERT', 'EVENT_UPDATE'];

export function SendAnnouncementForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', body: '', type: 'ANNOUNCEMENT' as NotificationType });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const sendMutation = useMutation({
    mutationFn: async () => api.post('/communication/notifications', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-notifications'] });
      setForm({ title: '', body: '', type: 'ANNOUNCEMENT' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => setError(err.response?.data?.error || 'Could not send announcement'),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError('');
        sendMutation.mutate();
      }}
      className="rounded-lg border border-border bg-white p-5"
    >
      <h2 className="font-display text-lg font-medium text-ink">Send an announcement</h2>
      <p className="mt-1 text-sm text-slate">Delivered to every active member's inbox.</p>

      <div className="mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as NotificationType }))}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Message</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            required
            rows={3}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      {success && <p className="mt-3 text-sm text-success">Announcement sent.</p>}

      <Button type="submit" isLoading={sendMutation.isPending} className="mt-4">
        Send to all active members
      </Button>
    </form>
  );
}
