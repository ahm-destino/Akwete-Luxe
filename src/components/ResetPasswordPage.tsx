import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); setMessage(null);
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirmPassword) return setError('The passwords do not match.');
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) return setError('This recovery link is invalid or has expired. Request a new one from sign in.');
    setMessage('Password updated. You can now return to the store and sign in.');
  };

  return <main className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-5">
    <form onSubmit={submit} className="w-full max-w-md bg-white border border-stone-200 shadow-xl rounded-2xl p-7 space-y-4">
      <a href="/" className="text-sm font-semibold text-amber-900">← Akwete Luxe</a>
      <div><h1 className="font-serif-display text-3xl font-bold text-stone-900">Set a new password</h1><p className="text-sm text-stone-600 mt-1">Choose a new password for your account.</p></div>
      <label className="block text-sm font-semibold text-stone-700">New password<input type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full p-3 border border-stone-300 rounded-lg" /></label>
      <label className="block text-sm font-semibold text-stone-700">Confirm password<input type="password" autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 w-full p-3 border border-stone-300 rounded-lg" /></label>
      {error && <p className="text-sm text-red-700">{error}</p>}{message && <p className="text-sm text-emerald-700">{message}</p>}
      <button disabled={saving} className="w-full py-3 bg-stone-900 text-white rounded-lg font-semibold disabled:opacity-60">{saving ? 'Updating…' : 'Update password'}</button>
    </form>
  </main>;
};
