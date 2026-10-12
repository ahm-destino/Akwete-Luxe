import React, { useState } from 'react';
import { X, Store, Loader2, AlertCircle, CheckCircle2, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageUploader } from './ImageUploader';

// Full-screen-safe modal that lets a signed-in buyer apply to sell their weaving.
// On success the weaver account is created in a "pending" state and an admin
// approves it before the pieces can go live.
export const ProducerApplyModal: React.FC = () => {
  const {
    isProducerApplyOpen,
    setIsProducerApplyOpen,
    user,
    applyAsProducer,
    setIsAuthModalOpen,
    setAuthModalMode,
    setIsProducerConsoleOpen,
  } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [nativeTitle, setNativeTitle] = useState('Master Weaver');
  const [village, setVillage] = useState('Akwete Town, Ukwa East, Abia State');
  const [years, setYears] = useState<number>(10);
  const [specialtyMotif, setSpecialtyMotif] = useState('Ikaki (Royal Tortoise)');
  const [loomType, setLoomType] = useState('Traditional Upright Wooden Loom');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/images/akwaete_weaver_mama_grace_1790722126050.jpg');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!isProducerApplyOpen) return null;

  const close = () => {
    setIsProducerApplyOpen(false);
    setDone(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !village) return;
    setSubmitting(true);
    setError(null);
    const { error } = await applyAsProducer({
      name,
      nativeTitle,
      village,
      yearsOfExperience: years,
      specialtyMotif,
      loomType,
      bio,
      phone,
      whatsapp,
      avatarUrl,
    });
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-200">

        <button
          onClick={close}
          className="absolute top-4 right-4 z-20 p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Not signed in */}
        {!user ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950 text-white flex items-center justify-center mx-auto">
              <Store className="w-7 h-7" />
            </div>
            <h3 className="font-serif-display text-2xl font-bold text-stone-900">Sell your weaving on Akwete</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Please sign in or create a free account first — then you can submit your weaver application for cooperative review.
            </p>
            <button
              onClick={() => { setIsProducerApplyOpen(false); setAuthModalMode('signup'); setIsAuthModalOpen(true); }}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Sign in / Create account
            </button>
          </div>
        ) : done ? (
          /* Success */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif-display text-2xl font-bold text-stone-900">Application received</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Thank you, {name.split(' ')[0]}. The Akwete Weavers Cooperative will review your application. Once approved,
              your Weaver Studio unlocks and you can publish your cloths to the storefront.
            </p>
            <button
              onClick={() => { close(); setIsProducerConsoleOpen(true); }}
              className="w-full py-2.5 bg-amber-950 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Open my Weaver Studio
            </button>
          </div>
        ) : (
          /* Application form */
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-950 text-white flex items-center justify-center mx-auto mb-3">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="font-serif-display text-2xl font-bold text-stone-900">Become an Akwete Weaver</h3>
              <p className="text-xs text-stone-500 mt-1">
                Tell us about your loom. Applications are reviewed by the cooperative before going live.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                  <input required value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900" />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Native Title</label>
                  <input value={nativeTitle} onChange={e => setNativeTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Village / Compound</label>
                  <input required value={village} onChange={e => setVillage(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900" />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Years at Loom</label>
                  <input type="number" value={years} onChange={e => setYears(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Signature Motif</label>
                  <input value={specialtyMotif} onChange={e => setSpecialtyMotif(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900" />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Loom Type</label>
                  <input value={loomType} onChange={e => setLoomType(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900" />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">WhatsApp (digits)</label>
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="2348..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">About your weaving</label>
                <textarea rows={2} value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Where you learned, what you specialize in, your loom story..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-amber-900" />
              </div>

              <ImageUploader value={avatarUrl} onChange={setAvatarUrl} folder="weavers" label="Portrait photo" compact />

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-amber-950 hover:bg-amber-900 disabled:opacity-60 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-xs mt-2 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
                {submitting ? 'Submitting…' : 'Submit weaver application'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
