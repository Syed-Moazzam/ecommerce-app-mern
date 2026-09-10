import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password);
      toast.success('Account created');
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Zap className="h-5 w-5" fill="currentColor" />
            </span>
            <span className="font-display text-2xl font-extrabold">Voltix</span>
          </Link>
        </div>
        <div className="card-surface p-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-ink-muted">Join Voltix to track orders and check out faster.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Full name" id="name" value={form.name} onChange={set('name')} placeholder="Jane Doe" autoComplete="name" required />
            <Input label="Email" id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" required />
            <Input label="Password" id="password" type="password" value={form.password} onChange={set('password')} placeholder="At least 6 characters" autoComplete="new-password" required />
            <Input label="Confirm password" id="confirm" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Re-enter password" autoComplete="new-password" required />
            <Button type="submit" size="lg" loading={loading} className="w-full">Create account</Button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
