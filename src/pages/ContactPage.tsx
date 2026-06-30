import { useState } from 'react';
import { Send, Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';
import type { ContactFormData } from '../types';

const locationOptions = ['La Réunion', 'Mayotte', 'Maurice', 'Seychelles', 'Madagascar', 'Autre'];
const subjectOptions = [
  'Expertise plaisance',
  'Expertise pêche',
  'Commerce & Industrie',
  'Mission judiciaire / assureur',
  'Autre / renseignement',
];

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '', email: '', phone: '', company: '', subject: '', message: '', location: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const { error } = await supabase.from('contact_submissions').insert([formData]);
    if (error) {
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    } else {
      // Best-effort email notification (does not block the submission).
      supabase.functions.invoke('send-contact-email', { body: formData }).catch(() => {});
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', company: '', subject: '', message: '', location: '' });
    }
  };

  const inp = 'w-full px-4 py-3 rounded-lg bg-navy-mid border border-navy-border text-white placeholder-muted/40 focus:ring-2 focus:ring-gold/40 focus:border-gold/40 outline-none transition-all text-[14px]';
  const lbl = 'block text-[11px] font-semibold uppercase tracking-widest text-muted mb-2';

  return (
    <div className="min-h-screen bg-navy-deep">
      {/* Hero */}
      <section className="pt-[74px] bg-navy-mid border-b border-navy-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-gold text-[12px] font-semibold uppercase tracking-widest mb-3">Contact</p>
          <h1 className="font-bebas text-[64px] md:text-[88px] text-white leading-none tracking-wide mb-4">Demandez une expertise</h1>
          <div className="h-px w-16 bg-gold mb-4" />
          <p className="text-muted text-lg max-w-xl">Vous avez un projet d'expertise, une question ou une urgence ? Contactez-nous directement.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-navy-card border border-navy-border rounded-2xl p-8 md:p-10">
                {status === 'success' && (
                  <div className="mb-7 p-4 bg-green-900/20 border border-green-500/30 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-green-300 text-[14px]">Message envoyé. Nous vous recontacterons rapidement.</p>
                  </div>
                )}
                {status === 'error' && (
                  <div className="mb-7 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-[14px]">{errorMessage}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div><label className={lbl}>Nom et prénom *</label><input type="text" name="name" required value={formData.name} onChange={handleChange} className={inp} placeholder="Votre nom complet" /></div>
                  <div><label className={lbl}>Email *</label><input type="email" name="email" required value={formData.email} onChange={handleChange} className={inp} placeholder="votre@email.com" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div><label className={lbl}>Téléphone *</label><input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={inp} placeholder="+262 692 XX XX XX" /></div>
                  <div>
                    <label className={lbl}>Île / Pays *</label>
                    <select name="location" required value={formData.location} onChange={handleChange} className={inp}>
                      <option value="">Sélectionnez une zone</option>
                      {locationOptions.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-5">
                  <label className={lbl}>Type de demande *</label>
                  <select name="subject" required value={formData.subject} onChange={handleChange} className={inp}>
                    <option value="">Sélectionnez un type</option>
                    {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {formData.subject === 'Mission judiciaire / assureur' && (
                    <p className="mt-2 text-muted text-[12px]">Joignez le document de mission si possible dans votre message.</p>
                  )}
                </div>
                <div className="mb-8">
                  <label className={lbl}>Message *</label>
                  <textarea name="message" required rows={5} value={formData.message} onChange={handleChange} className={inp + ' resize-none'} placeholder="Décrivez votre demande..." />
                </div>
                <button type="submit" disabled={status === 'loading'} className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-all text-[15px] disabled:opacity-50 shadow-lg shadow-gold/20">
                  {status === 'loading' ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi...</> : <><Send className="w-5 h-5" /> Envoyer ma demande</>}
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-navy-card border border-navy-border rounded-2xl p-7">
                <h3 className="text-white font-semibold text-lg mb-6 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gold rounded-full" />Coordonnées
                </h3>
                <div className="space-y-5">
                  {[
                    { Icon: Phone, label: 'Téléphone', value: '+262 692 86 01 10', href: 'tel:+262692860110' },
                    { Icon: Mail, label: 'Email', value: 'contact@exmar-oi.com', href: 'mailto:contact@exmar-oi.com' },
                  ].map(({ Icon, label, value, href }) => (
                    <a key={label} href={href} className="flex items-start gap-4 group hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                        <Icon className="w-4 h-4 text-gold" />
                      </div>
                      <div><p className="text-muted text-[11px] uppercase tracking-wider mb-0.5">{label}</p><p className="text-white font-medium text-[14px]">{value}</p></div>
                    </a>
                  ))}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0"><MapPin className="w-4 h-4 text-gold" /></div>
                    <div><p className="text-muted text-[11px] uppercase tracking-wider mb-0.5">Adresse</p><p className="text-white font-medium text-[14px]">La Possession, La Réunion 97419</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0"><Clock className="w-4 h-4 text-gold" /></div>
                    <div><p className="text-muted text-[11px] uppercase tracking-wider mb-0.5">Horaires</p><p className="text-white font-medium text-[14px]">Lun–Ven 08h00–17h00</p><p className="text-muted text-[12px]">Réponse dans les meilleurs délais</p></div>
                  </div>
                </div>
              </div>

              <div className="bg-gold/10 border border-gold/30 rounded-2xl p-7">
                <h3 className="text-gold font-semibold text-[15px] mb-4">Pourquoi EXMAR-OI ?</h3>
                <ul className="space-y-3">
                  {['Expert judiciaire indépendant', "47 ans d'expérience maritime", 'Zone Océan Indien complète', 'Rapports certifiés & opposables', 'Membre FIN 2026'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[13px] text-white/80">
                      <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-navy-card border border-navy-border rounded-2xl p-7 text-center">
                <p className="text-muted text-[13px] mb-4">Besoin d'une réponse immédiate ?</p>
                <a href="tel:+262692860110" className="block w-full py-3 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[14px]">
                  Appeler maintenant
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zone */}
      <section className="bg-navy-mid border-t border-navy-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-center">
            <p className="text-muted text-[13px] font-semibold uppercase tracking-widest">Zone d'intervention :</p>
            {['La Réunion', 'Mayotte', 'Maurice', 'Seychelles', 'Madagascar'].map((z) => (
              <span key={z} className="flex items-center gap-2 text-white/70 text-[14px]">
                <MapPin className="w-3.5 h-3.5 text-gold" />{z}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
