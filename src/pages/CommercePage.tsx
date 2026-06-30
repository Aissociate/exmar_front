import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Package, Wrench, Scale, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';
import CtaBanner from '../components/CtaBanner';

const inspections = [
  { title: 'Holds Inspection', desc: 'Inspection des cales avant chargement' },
  { title: 'Draft Survey', desc: 'Mesurage précis du tirant d\'eau' },
  { title: 'Gaz Free Certificate', desc: 'Certification dégazage cuves/citernes' },
  { title: 'Inertage & dégazage', desc: 'Contrôle opérations sécurisées' },
];

const cases = [
  {
    num: '01',
    title: 'Terminal Safety Officer (TSO)',
    subtitle: 'Conformité réglementaire',
    desc: "Le déchargement de produits pétroliers ou matières dangereuses est une opération à haut risque. La présence d'un TSO qualifié est une exigence réglementaire. EXMAR-OI assure 2 pétroliers/mois pour EDF Réunion via 4SA.",
    services: ["Conformité navire/terminal", "Surveillance déchargement", "Protocoles ISGOTT/MARPOL", "Gestion urgences", "Rapport d'opération"],
    cta: 'Demander une intervention TSO',
    icon: Shield,
    img: 'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
  {
    num: '02',
    title: 'Expertise de marchandises (cargo survey)',
    subtitle: 'Réception sécurisée',
    desc: "À la réception d'un conteneur, les dommages ne sont pas toujours visibles. Un constat établi trop tard peut rendre toute réclamation impossible.",
    services: ["Inspection à réception", "Constat état cargaison", "Identification dommages", "Détermination causes", "Rapport certifié opposable"],
    cta: 'Demander une expertise marchandises',
    icon: Package,
    img: 'https://images.pexels.com/photos/906982/pexels-photo-906982.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop',
  },
];

export default function CommercePage() {
  return (
    <div className="min-h-screen bg-navy-deep">
      <section className="relative pt-[74px] pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop" alt="Commerce & Industrie" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy-deep/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-deep" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <p className="text-gold text-[12px] font-semibold uppercase tracking-widest mb-3">Expertise Commerce & Industrie</p>
          <h1 className="font-bebas text-[52px] md:text-[80px] text-white leading-none tracking-wide mb-4">Commerce<br className="hidden md:block" /><span className="text-gold"> & Industrie</span></h1>
          <div className="h-px w-16 bg-gold mb-6" />
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            Dans le transport maritime commercial, chaque opération engage des responsabilités importantes. EXMAR-OI met son expertise au service des professionnels du commerce maritime dans l'Océan Indien.
          </p>
        </div>
      </section>

      <section className="bg-navy-deep py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-0">
          {cases.map((c, i) => (
            <div key={i} className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${i < 1 ? 'border-b border-navy-border' : ''}`}>
              <div className={`relative overflow-hidden h-72 lg:h-auto ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-navy-deep/40" />
                <span className="absolute top-6 left-6 font-bebas text-[80px] text-white/10 leading-none">{c.num}</span>
              </div>
              <div className={`bg-navy-mid p-10 lg:p-14 flex flex-col justify-center ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                    <c.icon className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-gold text-[11px] font-semibold uppercase tracking-widest">{c.subtitle}</span>
                </div>
                <h2 className="font-bebas text-[40px] text-white leading-none tracking-wide mb-4">{c.title}</h2>
                <p className="text-muted text-[14px] leading-relaxed mb-6">{c.desc}</p>
                <ul className="space-y-2 mb-8">
                  {c.services.map((s, j) => (
                    <li key={j} className="flex items-center gap-2 text-[13px] text-white/70">
                      <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />{s}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[14px] self-start">
                  {c.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inspections grid */}
      <section className="bg-navy-mid py-16 border-y border-navy-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 text-gold" />
            </div>
            <span className="text-gold text-[11px] font-semibold uppercase tracking-widest">Inspections techniques & certifications</span>
          </div>
          <h2 className="font-bebas text-[44px] text-white leading-none tracking-wide mb-8">03 — Inspections & Certifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {inspections.map((ins, i) => (
              <div key={i} className="bg-navy-card border border-navy-border rounded-xl p-6 hover:border-gold/40 transition-colors">
                <h3 className="text-white font-semibold text-[15px] mb-2">{ins.title}</h3>
                <p className="text-muted text-[13px]">{ins.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[14px]">
            Nous contacter pour une inspection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Judicial mandates */}
      <section className="bg-navy-deep py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-gold" />
                </div>
                <span className="text-gold text-[11px] font-semibold uppercase tracking-widest">Expert judiciaire agréé</span>
              </div>
              <h2 className="font-bebas text-[44px] text-white leading-none tracking-wide mb-4">04 — Mandats assureurs & expertises judiciaires</h2>
              <p className="text-muted text-[14px] leading-relaxed mb-6">
                Expert près la Cour d'appel de Saint-Denis de La Réunion, Yannick Durand est régulièrement mandaté par les assureurs et les tribunaux pour des expertises techniques dans l'Océan Indien.
              </p>
              <ul className="space-y-2 mb-8">
                {["Expertises mandatées assureurs", "Expertises judiciaires et contradictoires", "Expert Cour d'appel Saint-Denis", "Assistance audiences", "Normes : ISGOTT, MARPOL, La Haye-Visby"].map((s, j) => (
                  <li key={j} className="flex items-center gap-2 text-[13px] text-white/70">
                    <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />{s}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[14px]">
                Nous contacter pour un mandat <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-80">
              <img src="https://images.pexels.com/photos/3771097/pexels-photo-3771097.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop" alt="Judiciaire" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-navy-deep/40" />
            </div>
          </div>
        </div>
      </section>

      <CtaBanner title="Besoin d'une expertise commerciale ?" subtitle="TSO, cargo survey, inspections, mandats judiciaires — contactez-nous." />
      <Footer />
    </div>
  );
}
