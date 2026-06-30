import { Link } from 'react-router-dom';
import { ArrowRight, Award, Shield, Ship, Fish, Container, FileText, Star } from 'lucide-react';
import Footer from '../components/Footer';
import CtaBanner from '../components/CtaBanner';

const sectors = [
  {
    icon: Ship,
    title: 'Plaisance',
    desc: "Expertise pré-achat, pré-vente, pré-assurance et sinistres pour les navires de plaisance.",
    to: '/plaisance',
    img: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  },
  {
    icon: Fish,
    title: 'Pêche',
    desc: "Expertises pour navires de pêche professionnels — achat, vente, assurance, sinistres et litiges.",
    to: '/peche',
    img: 'https://images.pexels.com/photos/2249959/pexels-photo-2249959.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  },
  {
    icon: Container,
    title: 'Commerce & Industrie',
    desc: "TSO, cargo survey, inspections techniques, holds inspection, draft survey — opérateurs portuaires.",
    to: '/commerce-industrie',
    img: 'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  },
  {
    icon: FileText,
    title: 'Démarches Administratives',
    desc: "100% en ligne. Mutation, enregistrement, modification, radiation. Traité par un vrai expert.",
    to: '/demarches-administratives',
    img: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  },
];

const pillars = [
  { n: '47', label: "Ans d'expérience", desc: 'Depuis 1976, une vie entièrement dédiée au monde maritime.' },
  { n: '∞', label: 'Réactivité', desc: 'Disponible pour toute urgence. Réponse rapide sur toute la zone OI.' },
  { n: '100%', label: 'Indépendance', desc: 'Expert judiciaire agréé. Rapports certifiés, opposables, transmissibles.' },
];

const testimonials = [
  {
    stars: 5,
    text: "Yannick Durand a expertisé mon voilier avant achat. Rapport complet, professionnel et livré rapidement. J'ai pu négocier sereinement.",
    name: 'Pierre M.',
    role: 'Plaisancier — La Réunion',
  },
  {
    stars: 5,
    text: "Expert mandaté pour un sinistre sur notre navire de pêche. Constat rigoureux, défense efficace face à l'assureur. Je recommande.",
    name: 'Serge T.',
    role: 'Pêcheur professionnel — Mayotte',
  },
  {
    stars: 5,
    text: "EXMAR-OI assure le TSO de nos pétroliers depuis plusieurs années. Zéro incident, professionnalisme exemplaire, conformité ISGOTT totale.",
    name: 'Direction technique',
    role: 'Opérateur portuaire — La Réunion',
  },
];

const strip = [
  { label: 'Membre FIN 2026', value: 'Fédération des Industries Nautiques' },
  { label: 'Zone Océan Indien', value: 'Réunion · Mayotte · Maurice · Seychelles' },
  { label: 'Téléphone', value: '+262 692 86 01 10' },
  { label: 'Email', value: 'exmar.oi.contact@gmail.com' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-deep">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="Port maritime"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy-deep/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/50 via-transparent to-navy-deep" />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(#7a9bbf 1px, transparent 1px), linear-gradient(90deg, #7a9bbf 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative z-10 flex-1 flex items-center pt-[74px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/15 border border-gold/30 text-gold text-[12px] font-semibold rounded-full tracking-wider uppercase">
                  <Award className="w-3.5 h-3.5" /> Membre FIN 2026
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 text-white text-[12px] font-semibold rounded-full tracking-wider uppercase">
                  <Shield className="w-3.5 h-3.5" /> Expert Judiciaire
                </span>
              </div>
              <h1 className="font-bebas leading-none mb-5">
                <span className="block text-[76px] md:text-[100px] lg:text-[124px] text-white tracking-wide">Votre Cap,</span>
                <span className="block text-[76px] md:text-[100px] lg:text-[124px] text-gold tracking-wide">Notre Expertise</span>
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-gold" />
                <span className="text-muted text-[13px] font-semibold uppercase tracking-widest">Expertise Maritime Océan Indien</span>
              </div>
              <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl">
                Des solutions d'expertise maritime claires, rigoureuses et indépendantes pour les professionnels de l'Océan Indien. 47 ans d'expérience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-all text-[15px] shadow-lg shadow-gold/20">
                  Demander une expertise <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/plaisance" className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-all text-[15px]">
                  Voir nos domaines <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-navy-mid/85 backdrop-blur-md border-t border-navy-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-navy-border">
              {strip.map((item, i) => (
                <div key={i} className="px-6 py-5">
                  <p className="text-gold text-[11px] font-semibold uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-white/80 text-[13px] font-medium leading-tight">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="bg-navy-mid py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold text-[12px] font-semibold uppercase tracking-widest mb-3">Choisissez votre situation</p>
            <h2 className="font-bebas text-[52px] md:text-[72px] text-white leading-none tracking-wide">Nos Domaines d'Expertise</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sectors.map((s, i) => (
              <Link key={i} to={s.to} className="group relative bg-navy-card border border-navy-border rounded-xl overflow-hidden hover:border-gold/50 transition-all duration-300 flex flex-col">
                <div className="relative h-44 overflow-hidden flex-shrink-0">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-card via-navy-card/50 to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30">
                    <s.icon className="w-5 h-5 text-gold" />
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-gold transition-colors">{s.title}</h3>
                  <p className="text-muted text-[13px] leading-relaxed mb-4 flex-1">{s.desc}</p>
                  <span className="text-gold text-[12px] font-semibold uppercase tracking-wider flex items-center gap-1">
                    En savoir plus <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-navy-deep border-y border-navy-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-navy-border">
            {pillars.map((p, i) => (
              <div key={i} className="flex flex-col items-center text-center px-12 py-12">
                <span className="font-bebas text-[80px] text-gold leading-none">{p.n}</span>
                <div className="w-10 h-[2px] bg-gold rounded-full my-3" />
                <h3 className="text-white font-semibold text-lg mb-2">{p.label}</h3>
                <p className="text-muted text-[13px] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#f5f7fa] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold text-[12px] font-semibold uppercase tracking-widest mb-3">Témoignages</p>
            <h2 className="font-bebas text-[48px] md:text-[64px] text-navy-deep leading-none tracking-wide">Ils nous font confiance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-gray-600 italic text-[14px] leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-mid flex items-center justify-center text-gold font-bold text-sm flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-navy-deep font-semibold text-[14px]">{t.name}</p>
                    <p className="text-gray-400 text-[12px]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
      <Footer />
    </div>
  );
}
