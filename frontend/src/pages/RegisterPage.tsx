import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-forest-dark px-4">
        <div className="max-w-sm rounded-xl bg-white p-8 text-center shadow-xl">
          <h1 className="font-display text-xl font-medium text-ink">Request received</h1>
          <p className="mt-2 text-sm text-slate">
            Your registration is pending approval from a club official. Redirecting you to
            sign in…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-dark px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-t-xl bg-forest px-8 pt-8 pb-6 text-center">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-white/70">
            New Membership
          </p>
          <h1 className="mt-1 font-display text-2xl font-medium text-white">
            Register to Join
          </h1>
        </div>
        <div className="stitched-edge rounded-b-xl bg-white px-8 pb-8 pt-6 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={form.firstName} onChange={update('firstName')} required />
              <Input label="Last name" value={form.lastName} onChange={update('lastName')} required />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={update('email')} required />
            <Input label="Phone (optional)" value={form.phone} onChange={update('phone')} />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={update('password')}
              minLength={8}
              required
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
              Submit registration
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate">
            Already a member?{' '}
            <Link to="/login" className="font-medium text-forest hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
