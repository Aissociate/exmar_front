import { useState } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft, FileText, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

const services = [
  { id: 'mutation', title: 'Mutation de propriété', price: 90, desc: 'Changement de propriétaire d\'un navire immatriculé en France. Délai légal : 1 mois après acte de vente.', steps: 5 },
  { id: 'enregistrement', title: "Certificat d'enregistrement", price: 120, desc: 'Immatriculation d\'un navire neuf, d\'occasion ou importé. Francisation navire étranger : 150 €.', steps: 4 },
  { id: 'modification', title: 'Modification administrative', price: 60, desc: 'Changement d\'adresse, de nom, de port, de motorisation ou autre modification sur votre titre de navigation.', steps: 5 },
  { id: 'radiation', title: 'Radiation / Cession', price: 80, desc: 'Radiation d\'un navire du registre français : vente, destruction ou changement de pavillon.', steps: 5 },
];

type ServiceId = 'mutation' | 'enregistrement' | 'modification' | 'radiation' | null;

const inp = 'w-full px-4 py-3 rounded-lg bg-navy-mid border border-navy-border text-white placeholder-muted/40 focus:ring-2 focus:ring-gold/40 focus:border-gold/40 outline-none transition-all text-[14px]';
const lbl = 'block text-[11px] font-semibold uppercase tracking-widest text-muted mb-2';

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all ${
            i + 1 < current ? 'bg-gold text-navy-deep' : i + 1 === current ? 'bg-gold text-navy-deep ring-4 ring-gold/20' : 'bg-navy-border text-muted'
          }`}>
            {i + 1 < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && <div className={`h-px w-8 transition-all ${i + 1 < current ? 'bg-gold' : 'bg-navy-border'}`} />}
        </div>
      ))}
    </div>
  );
}

function MutationForm({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    acheteur_nom: '', acheteur_prenom: '', acheteur_naissance: '', acheteur_nationalite: '', acheteur_adresse: '', acheteur_email: '', acheteur_tel: '',
    vendeur_nom: '', vendeur_prenom: '', vendeur_adresse: '',
    navire_nom: '', navire_immat: '', navire_type: '', navire_longueur: '', navire_puissance: '', port_actuel: '', port_souhaite: '',
  });
  const set = (k: string, v: string) => setData((d) => ({ ...d, [k]: v }));

  const submit = async () => {
    setLoading(true);
    await supabase.from('dossiers_administratifs').insert([{ type: 'mutation', prix: 90, statut: 'recu', donnees: data }]);
    setLoading(false);
    onDone();
  };

  return (
    <div>
      <StepIndicator current={step} total={5} />
      {step === 1 && (
        <div>
          <h3 className="text-white font-semibold text-lg mb-6">Informations acheteur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={lbl}>Nom *</label><input className={inp} value={data.acheteur_nom} onChange={e => set('acheteur_nom', e.target.value)} placeholder="Dupont" /></div>
            <div><label className={lbl}>Prénom *</label><input className={inp} value={data.acheteur_prenom} onChange={e => set('acheteur_prenom', e.target.value)} placeholder="Jean" /></div>
            <div><label className={lbl}>Date de naissance *</label><input type="date" className={inp} value={data.acheteur_naissance} onChange={e => set('acheteur_naissance', e.target.value)} /></div>
            <div><label className={lbl}>Nationalité *</label><input className={inp} value={data.acheteur_nationalite} onChange={e => set('acheteur_nationalite', e.target.value)} placeholder="Française" /></div>
            <div className="md:col-span-2"><label className={lbl}>Adresse *</label><input className={inp} value={data.acheteur_adresse} onChange={e => set('acheteur_adresse', e.target.value)} placeholder="123 rue de la Mer, 97400 Saint-Denis" /></div>
            <div><label className={lbl}>Email *</label><input type="email" className={inp} value={data.acheteur_email} onChange={e => set('acheteur_email', e.target.value)} placeholder="jean@email.com" /></div>
            <div><label className={lbl}>Téléphone *</label><input className={inp} value={data.acheteur_tel} onChange={e => set('acheteur_tel', e.target.value)} placeholder="+262 692 XX XX XX" /></div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <h3 className="text-white font-semibold text-lg mb-6">Informations vendeur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={lbl}>Nom *</label><input className={inp} value={data.vendeur_nom} onChange={e => set('vendeur_nom', e.target.value)} placeholder="Martin" /></div>
            <div><label className={lbl}>Prénom *</label><input className={inp} value={data.vendeur_prenom} onChange={e => set('vendeur_prenom', e.target.value)} placeholder="Pierre" /></div>
            <div className="md:col-span-2"><label className={lbl}>Adresse *</label><input className={inp} value={data.vendeur_adresse} onChange={e => set('vendeur_adresse', e.target.value)} placeholder="45 avenue du Port, 97420 Le Port" /></div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <h3 className="text-white font-semibold text-lg mb-6">Informations du navire</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={lbl}>Nom du navire *</label><input className={inp} value={data.navire_nom} onChange={e => set('navire_nom', e.target.value)} placeholder="Horizon" /></div>
            <div><label className={lbl}>Numéro d'immatriculation *</label><input className={inp} value={data.navire_immat} onChange={e => set('navire_immat', e.target.value)} placeholder="974-XXX-XXX" /></div>
            <div><label className={lbl}>Type de navire *</label>
              <select className={inp} value={data.navire_type} onChange={e => set('navire_type', e.target.value)}>
                <option value="">Sélectionner</option>
                {['Voilier', 'Moteur', 'Semi-rigide', 'Catamaran', 'Pêche', 'Autre'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Longueur (m)</label><input className={inp} value={data.navire_longueur} onChange={e => set('navire_longueur', e.target.value)} placeholder="8.5" /></div>
            <div><label className={lbl}>Puissance (kW)</label><input className={inp} value={data.navire_puissance} onChange={e => set('navire_puissance', e.target.value)} placeholder="150" /></div>
            <div><label className={lbl}>Port actuel *</label><input className={inp} value={data.port_actuel} onChange={e => set('port_actuel', e.target.value)} placeholder="Port de la Pointe des Galets" /></div>
            <div><label className={lbl}>Port souhaité</label><input className={inp} value={data.port_souhaite} onChange={e => set('port_souhaite', e.target.value)} placeholder="Port de la Pointe des Galets" /></div>
          </div>
        </div>
      )}
      {step === 4 && (
        <div>
          <h3 className="text-white font-semibold text-lg mb-6">Documents à fournir</h3>
          <div className="space-y-4">
            {[
              { label: "Acte de vente signé *", required: true },
              { label: "Pièce d'identité acheteur *", required: true },
              { label: "Certificat d'enregistrement actuel *", required: true },
              { label: "Quitus fiscal (optionnel)", required: false },
            ].map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-navy-mid rounded-xl border border-navy-border">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gold flex-shrink-0" />
                  <span className="text-[14px] text-white/80">{doc.label}</span>
                </div>
                <label className="flex items-center gap-2 px-4 py-2 bg-navy-card border border-navy-border rounded-lg cursor-pointer hover:border-gold/40 transition-colors text-[13px] text-muted">
                  <Upload className="w-4 h-4" /> Choisir
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                </label>
              </div>
            ))}
            <p className="text-muted text-[12px]">Formats acceptés : PDF, JPG, PNG — max 10 Mo par fichier</p>
          </div>
        </div>
      )}
      {step === 5 && (
        <div>
          <h3 className="text-white font-semibold text-lg mb-6">Récapitulatif & paiement</h3>
          <div className="bg-navy-mid rounded-xl border border-navy-border p-6 mb-6">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-navy-border">
              <span className="text-white font-semibold">Mutation de propriété</span>
              <span className="font-bebas text-3xl text-gold">90 €</span>
            </div>
            <div className="space-y-2 text-[13px] text-muted">
              <p>Acheteur : {data.acheteur_prenom} {data.acheteur_nom}</p>
              <p>Vendeur : {data.vendeur_prenom} {data.vendeur_nom}</p>
              <p>Navire : {data.navire_nom} — {data.navire_immat}</p>
            </div>
          </div>
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 mb-6">
            <p className="text-white/80 text-[13px]">
              <strong className="text-gold">Paiement sécurisé :</strong> Après validation, vous serez redirigé vers notre interface de paiement sécurisé (CB, Apple Pay, Google Pay). Le dossier sera traité après confirmation du paiement.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-5 py-3 border border-navy-border text-muted rounded-lg hover:border-gold/40 hover:text-white transition-colors text-[14px]">
            <ArrowLeft className="w-4 h-4" /> Précédent
          </button>
        )}
        {step < 5 ? (
          <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-6 py-3 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[14px] ml-auto">
            Suivant <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={submit} disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[15px] ml-auto disabled:opacity-50">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</> : <>Confirmer & Payer 90 € <ArrowRight className="w-4 h-4" /></>}
          </button>
        )}
      </div>
    </div>
  );
}

function SimpleForm({ serviceId, price, onDone }: { serviceId: string; price: number; onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = serviceId === 'enregistrement' ? 4 : 5;

  const submit = async () => {
    setLoading(true);
    await supabase.from('dossiers_administratifs').insert([{ type: serviceId, prix: price, statut: 'recu', donnees: {} }]);
    setLoading(false);
    onDone();
  };

  const stepLabels: Record<string, string[]> = {
    enregistrement: ['Propriétaire', 'Navire', 'Documents', 'Récapitulatif'],
    modification: ['Propriétaire', 'Navire', 'Modifications', 'Documents', 'Récapitulatif'],
    radiation: ['Propriétaire', 'Navire', 'Motif', 'Documents', 'Récapitulatif'],
  };

  return (
    <div>
      <StepIndicator current={step} total={totalSteps} />
      <div className="text-center py-12">
        <p className="text-muted text-[14px] mb-3">Étape {step}/{totalSteps} — {stepLabels[serviceId]?.[step - 1]}</p>
        <p className="text-white/60 text-[13px]">Remplissez les informations de cette étape</p>
      </div>
      <div className="flex gap-3 mt-4">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-5 py-3 border border-navy-border text-muted rounded-lg hover:border-gold/40 hover:text-white transition-colors text-[14px]">
            <ArrowLeft className="w-4 h-4" /> Précédent
          </button>
        )}
        {step < totalSteps ? (
          <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-6 py-3 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[14px] ml-auto">
            Suivant <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={submit} disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[15px] ml-auto disabled:opacity-50">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</> : <>Confirmer & Payer {price} € <ArrowRight className="w-4 h-4" /></>}
          </button>
        )}
      </div>
    </div>
  );
}

export default function DemarchesPage() {
  const [selected, setSelected] = useState<ServiceId>(null);
  const [done, setDone] = useState(false);

  const selectedService = services.find(s => s.id === selected);

  return (
    <div className="min-h-screen bg-navy-deep">
      {/* Hero */}
      <section className="pt-[74px] bg-navy-mid border-b border-navy-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-gold text-[12px] font-semibold uppercase tracking-widest mb-3">Service 100% en ligne</p>
          <h1 className="font-bebas text-[52px] md:text-[80px] text-white leading-none tracking-wide mb-4">Démarches<br /><span className="text-gold">Administratives</span></h1>
          <div className="h-px w-16 bg-gold mb-6" />
          <p className="text-muted text-lg max-w-2xl">
            Les formalités administratives liées à un navire sont souvent perçues comme complexes. EXMAR-OI prend en charge l'ensemble de vos démarches maritimes à distance — France entière.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="px-4 py-2 bg-gold/10 border border-gold/30 text-gold text-[12px] font-semibold rounded-full">100% en ligne</span>
            <span className="px-4 py-2 bg-white/5 border border-navy-border text-white/70 text-[12px] rounded-full">France entière</span>
            <span className="px-4 py-2 bg-white/5 border border-navy-border text-white/70 text-[12px] rounded-full">Traité par un expert maritime</span>
          </div>
        </div>
      </section>

      {/* Differentiator */}
      <section className="bg-navy-deep border-b border-navy-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gold/10 border border-gold/30 rounded-2xl p-7 flex flex-col md:flex-row gap-6 items-center">
            <AlertCircle className="w-10 h-10 text-gold flex-shrink-0" />
            <div>
              <h3 className="text-white font-semibold text-[15px] mb-1">Vos démarches traitées par un vrai expert — pas un simple secrétariat</h3>
              <p className="text-muted text-[13px] leading-relaxed">Contrairement aux concurrents (secrétariats sans expertise), EXMAR-OI est un expert maritime certifié de 47 ans. Chaque dossier est suivi personnellement par Yannick Durand, Expert près la Cour d'appel de Saint-Denis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service selection or form */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {done ? (
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="w-20 h-20 rounded-full bg-green-900/30 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="font-bebas text-[48px] text-white leading-none tracking-wide mb-4">Dossier reçu !</h2>
              <p className="text-muted text-[14px] mb-8">Votre dossier a été enregistré. Vous recevrez une confirmation par email. Le paiement sécurisé vous sera communiqué sous 24h.</p>
              <button onClick={() => { setSelected(null); setDone(false); }} className="px-6 py-3 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors">
                Retour aux services
              </button>
            </div>
          ) : selected && selectedService ? (
            <div className="max-w-3xl mx-auto">
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-8 text-[13px]">
                <ArrowLeft className="w-4 h-4" /> Retour aux services
              </button>
              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <p className="text-gold text-[11px] font-semibold uppercase tracking-widest mb-1">Formulaire</p>
                  <h2 className="font-bebas text-[40px] text-white leading-none tracking-wide">{selectedService.title}</h2>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-bebas text-[52px] text-gold leading-none">{selectedService.price} €</span>
                  <p className="text-muted text-[12px]">TTC</p>
                </div>
              </div>
              <div className="bg-navy-card border border-navy-border rounded-2xl p-8">
                {selected === 'mutation' ? (
                  <MutationForm onDone={() => setDone(true)} />
                ) : (
                  <SimpleForm serviceId={selected} price={selectedService.price} onDone={() => setDone(true)} />
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-12">
                <p className="text-gold text-[12px] font-semibold uppercase tracking-widest mb-3">Grille tarifaire</p>
                <h2 className="font-bebas text-[52px] text-white leading-none tracking-wide">Choisissez votre démarche</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((s) => (
                  <div key={s.id} className="group bg-navy-card border border-navy-border rounded-2xl p-8 hover:border-gold/50 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-2xl" />
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg group-hover:text-gold transition-colors">{s.title}</h3>
                        <p className="text-muted text-[13px] mt-2 leading-relaxed">{s.desc}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bebas text-[44px] text-gold leading-none">{s.price}</span>
                        <p className="text-muted text-[11px]">€ TTC</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-muted mb-6">
                      <span>{s.steps} étapes</span>
                      <span>·</span>
                      <span>100% en ligne</span>
                    </div>
                    <button
                      onClick={() => setSelected(s.id as ServiceId)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[14px]"
                    >
                      Commencer <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
