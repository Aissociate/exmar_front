import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Shield, Ship, Fish, Container, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';
import CtaBanner from '../components/CtaBanner';

const slides = [
  {
    img: '/ChatGPT_Image_11_mai_2026,_21_57_42.jpg',
    eyebrow: 'Expertise Maritime Océan Indien',
    title: 'Votre Cap,',
    titleGold: 'Notre Expertise',
    text: "Des expertises claires, rigoureuses et indépendantes. Professionnels de la mer ou plaisanciers, nous mettons nos 47 ans d'expérience maritime à votre meilleur service !",
    primary: { label: 'Demander une expertise', to: '/contact' },
    secondary: { label: 'Voir nos domaines', to: '/plaisance' },
  },
  {
    img: '/ChatGPT_Image_11_mai_2026,_15_04_16_(1).png',
    eyebrow: 'Commerce & Industrie',
    title: 'Une avarie sur',
    titleGold: 'votre marchandise ?',
    text: "Faites constater les dommages par un expert maritime indépendant et obtenez un rapport opposable face à votre assureur.",
    primary: { label: 'Expertise marchandises', to: '/commerce-industrie' },
    secondary: { label: 'Nous contacter', to: '/contact' },
  },
  {
    img: '/ChatGPT_Image_11_mai_2026,_15_04_18_(4).png',
    eyebrow: 'Plaisance',
    title: 'Vous achetez',
    titleGold: 'un bateau ?',
    text: "Sécurisez votre acquisition avec une expertise pré-achat complète et indépendante avant de signer.",
    primary: { label: 'Expertise pré-achat', to: '/plaisance' },
    secondary: { label: 'Nous contacter', to: '/contact' },
  },
  {
    img: '/WhatsApp_Image_2026-03-18_at_19.49.41.jpeg',
    eyebrow: 'Pêche & Sinistres',
    title: 'Un sinistre',
    titleGold: 'à bord ?',
    text: "Constat d'avarie et défense de vos intérêts face à l'assureur — pêche, plaisance ou commerce, un expert à vos côtés.",
    primary: { label: 'Nous contacter', to: '/contact' },
    secondary: { label: 'Voir nos domaines', to: '/peche' },
  },
];

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
  { label: 'Zone Océan Indien', value: 'Réunion · Mayotte · Maurice · Seychelles · Madagascar' },
  { label: 'Téléphone', value: '+262 692 86 01 10' },
  { label: 'Email', value: 'contact@exmar-oi.com' },
];

export default function HomePage() {
  const [current, setCurrent] = useState(0);
  const count = slides.length;
  const go = useCallback((dir: number) => setCurrent((c) => (c + dir + count) % count), [count]);

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  return (
    <div className="min-h-screen bg-navy-deep">
      {/* Hero carousel */}
      <section className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0">
          {slides.map((s, i) => (
            <img
              key={i}
              src={s.img}
              alt={s.eyebrow}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          {/* Lightened overlay — left side readable, right side reveals the photo */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 via-navy-deep/55 to-navy-deep/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/30 via-transparent to-navy-deep/85" />
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

              {slides.map((s, i) => (
                <div key={i} className={i === current ? 'block animate-fadein' : 'hidden'}>
                  <h1 className="font-bebas leading-none mb-5">
                    <span className="block text-[54px] md:text-[80px] lg:text-[100px] text-white tracking-wide">{s.title}</span>
                    <span className="block text-[54px] md:text-[80px] lg:text-[100px] text-gold tracking-wide">{s.titleGold}</span>
                  </h1>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-12 bg-gold" />
                    <span className="text-muted text-[13px] font-semibold uppercase tracking-widest">{s.eyebrow}</span>
                  </div>
                  <p className="text-white/75 text-lg leading-relaxed mb-10 max-w-xl">{s.text}</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to={s.primary.to} className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-all text-[15px] shadow-lg shadow-gold/20">
                      {s.primary.label} <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to={s.secondary.to} className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-all text-[15px]">
                      {s.secondary.label} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}

              {/* Carousel controls */}
              <div className="flex items-center gap-4 mt-12">
                <button onClick={() => go(-1)} aria-label="Précédent" className="w-10 h-10 rounded-full border border-white/25 text-white/80 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      aria-label={`Aller au slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-gold' : 'w-3 bg-white/30 hover:bg-white/50'}`}
                    />
                  ))}
                </div>
                <button onClick={() => go(1)} aria-label="Suivant" className="w-10 h-10 rounded-full border border-white/25 text-white/80 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
