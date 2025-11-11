'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('demo@streamforge.io');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    setIsLoading(false);

    if (result?.error) {
      setError('Invalid credentials. Double-check your email and password.');
      return;
    }

    const redirectTo = params.get('callbackUrl') ?? '/dashboard/videos';
    router.replace(redirectTo);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <section className="w-full max-w-md space-y-8 rounded-xl border border-slate-800 bg-slate-900/60 p-10 shadow-xl">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-white">Admin Portal</h1>
          <p className="text-sm text-slate-400">
            Sign in to manage your video catalog and monitor streaming health.
          </p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wide text-slate-400" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-teal-400 focus:outline-none"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wide text-slate-400" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-teal-400 focus:outline-none"
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-teal-500 py-2 font-semibold text-slate-900 transition hover:bg-teal-300 disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-xs text-slate-500">
          Use the demo credentials `demo@streamforge.io` / `demo1234`.
        </p>
      </section>
    </main>
  );
}
