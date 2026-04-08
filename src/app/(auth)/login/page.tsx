'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      identifiant,
      motDePasse,
      redirect: false,
    });

    if (res?.error) {
      setError('Identifiant ou mot de passe incorrect.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const quickLogins = [
    { label: 'Admin', id: 'admin', pw: 'Admin@1234' },
    { label: 'DG', id: 'dg', pw: 'Dg@1234' },
    { label: 'DAF', id: 'daf', pw: 'Daf@1234' },
    { label: 'Chef', id: 'chef', pw: 'Chef@1234' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-body)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl mb-4">
            FA
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>FinanceAdvisor V4</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>MULTIPRINT S.A. — Cockpit de Direction Financière</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Identifiant</label>
            <input
              type="text"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="admin"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mot de passe</label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 text-center py-2">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>

        {/* Quick logins */}
        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>Connexion rapide (démo)</p>
          <div className="grid grid-cols-4 gap-2">
            {quickLogins.map((q) => (
              <button
                key={q.id}
                onClick={() => { setIdentifiant(q.id); setMotDePasse(q.pw); }}
                className="py-2 rounded-lg text-xs font-medium transition-all hover:border-emerald-500"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link href="/register" className="text-sm text-emerald-400 hover:underline">
            Pas de compte ? S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
