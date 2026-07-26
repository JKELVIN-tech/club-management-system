import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Unable to sign in. Check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-dark px-4">
      <div className="w-full max-w-sm">
        {/* Signature: membership-card styled auth panel */}
        <div className="rounded-t-xl bg-forest px-8 pt-8 pb-6 text-center">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-white/70">
            Member Access
          </p>
          <h1 className="mt-1 font-display text-2xl font-medium text-white">
            Club Management System
          </h1>
        </div>
        <div className="stitched-edge rounded-b-xl bg-white px-8 pb-8 pt-6 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" isLoading={isLoading} className="mt-2 w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate">
            New here?{' '}
            <Link to="/register" className="font-medium text-forest hover:underline">
              Register for membership
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
