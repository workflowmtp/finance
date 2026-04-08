'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({ nom: '', identifiant: '', email: '', motDePasse: '', confirmer: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.motDePasse !== form.confirmer) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (form.motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          identifiant: form.identifiant,
          email: form.email,
          motDePasse: form.motDePasse,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'inscription.');
        setLoading(false);
        return;
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError('Erreur de connexion au serveur.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-body)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl mb-4">
            FA
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Créer un compte</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>FinanceAdvisor V4 - MULTIPRINT S.A.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nom complet</label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="Jean Dupont"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Identifiant</label>
            <input
              type="text"
              value={form.identifiant}
              onChange={(e) => setForm({ ...form, identifiant: e.target.value })}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="jdupont"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="jean@multiprint.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mot de passe</label>
            <input
              type="password"
              value={form.motDePasse}
              onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="Min. 6 caractères"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirmer le mot de passe</label>
            <input
              type="password"
              value={form.confirmer}
              onChange={(e) => setForm({ ...form, confirmer: e.target.value })}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              placeholder="Répétez le mot de passe"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 text-center py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-emerald-400 hover:underline">
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
