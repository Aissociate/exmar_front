import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Email ou mot de passe incorrect');
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-navy-deep flex items-center justify-center px-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(#7a9bbf 1px, transparent 1px), linear-gradient(90deg, #7a9bbf 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & title */}
        <div className="text-center mb-8">
          <img src="/image.png" alt="EXMAR-OI" className="h-12 w-auto mx-auto mb-5 brightness-0 invert" />
          <h1 className="font-bebas text-[40px] text-white tracking-wide leading-none">Espace Administrateur</h1>
          <p className="text-muted text-[13px] mt-2">Accès réservé à l'équipe EXMAR-OI</p>
        </div>

        {/* Card */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-gold rounded-full" />
            <h2 className="text-white font-semibold text-lg">Connexion</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-[14px]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-navy-mid border border-navy-border text-white placeholder-muted/40 focus:ring-2 focus:ring-gold/40 focus:border-gold/40 outline-none transition-all text-[14px]"
                  placeholder="admin@exmar-oi.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-navy-mid border border-navy-border text-white placeholder-muted/40 focus:ring-2 focus:ring-gold/40 focus:border-gold/40 outline-none transition-all text-[14px]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-[15px] mt-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion...</> : 'Se connecter'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors text-[13px]">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
