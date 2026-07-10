import { Link } from 'react-router-dom';
import { ArrowRight, Award, Anchor, Shield, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';
import CtaBanner from '../components/CtaBanner';

const timeline = [
  { period: '1976 – 1980', role: 'Marin-pêcheur, pêche côtière', location: 'Île de Noirmoutier' },
  { period: '1981 – 1996', role: "Maître de port — Port de plaisance de l'Herbaudière", location: 'Île de Noirmoutier' },
  { period: '1996 – 1998', role: 'Technicien en expertise maritime — Cabexmar (500h)', location: 'La Réunion' },
  { period: '1998 – 2009', role: 'Capitaine / Mécanicien — Commandant de pousseur sur la Loire, convois pétroliers, opérateur EDF Cordemais', location: 'Nantes / Loire' },
  { period: '2009 – 2015', role: 'Officier de Port Adjoint L1 — Grand Port Maritime du Havre', location: 'Le Havre' },
  { period: '2015 – 2019', role: 'Adjoint au Commandant de Port — Capitainerie de Dzaoudzi', location: 'Port de Mayotte' },
  { period: "2019 – Aujourd'hui", role: 'Expert Maritime Indépendant — EXMAR·OI · Expert Cour d\'appel', location: 'La Réunion', current: true },
];

const certifications = [
  { label: "Expert Cour d'appel", year: '2019' },
  { label: 'Capitaine 500 UMS', year: '2008' },
  { label: 'ASIP', year: '2011' },
  { label: 'Navires citernes / pétroliers', year: '2011' },
  { label: 'CEDRE hydrocarbures', year: '2011' },
  { label: 'Marchandises dangereuses', year: '2013' },
  { label: 'Formation expertise 500h Cabexmar', year: '1996' },
  { label: 'Convois poussés ADNR', year: '2000' },
  { label: 'Formateur mécanique PCMM 250kW', year: '2019' },
];

const values = ['Indépendance', 'Précision', 'Réactivité', 'Transmission'];

export default function ExpertPage() {
  return (
    <div className="min-h-screen bg-navy-deep">
      {/* Hero split */}
      <section className="pt-[74px] bg-navy-mid border-b border-navy-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div>
              <p className="text-gold text-[12px] font-semibold uppercase tracking-widest mb-4">L'Expert</p>
              <h1 className="font-cormorant text-[64px] md:text-[80px] text-white font-light italic leading-none mb-2">Yannick Durand</h1>
              <div className="h-px w-16 bg-gold mb-6" />
              <p className="text-muted text-[14px] mb-8 italic">De marin-pêcheur à expert judiciaire maritime — 47 ans au service de la mer.</p>

              <div className="flex flex-wrap gap-2 mb-8">
                {['Expert judiciaire', 'Membre FIN 2026', 'Capitaine 500 UMS', 'ASIP certifié', 'Anglais professionnel'].map((b) => (
                  <span key={b} className="px-3 py-1 bg-navy-card border border-navy-border text-[12px] text-muted rounded-full">{b}</span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[{ n: '47', l: "ans d'expérience" }, { n: '5', l: 'ports majeurs' }, { n: '2', l: 'pétroliers EDF/mois' }].map((s, i) => (
                  <div key={i} className="bg-navy-card border border-navy-border rounded-xl p-4 text-center">
                    <span className="font-bebas text-[40px] text-gold leading-none">{s.n}</span>
                    <p className="text-muted text-[11px] mt-1 leading-tight">{s.l}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                {values.map((v) => (
                  <span key={v} className="flex items-center gap-2 text-[13px] text-white/70">
                    <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />{v}
                  </span>
                ))}
              </div>

              <Link to="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[14px]">
                Demander une expertise <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right — photo */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl shadow-black/50">
                <img
                  src="/WhatsApp_Image_2026-05-11_at_17.19.10.jpeg"
                  alt="Yannick Durand"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/10 to-transparent" />
                <blockquote className="absolute bottom-0 left-0 right-0 p-8 font-cormorant text-xl text-white/90 italic leading-relaxed">
                  "Je n'expertise pas des bateaux. J'expertise des décisions — celles que vous allez prendre, et pour lesquelles vous avez besoin d'une certitude."
                </blockquote>
              </div>
              <div className="absolute -bottom-5 -right-5 w-28 h-28 bg-gold rounded-2xl flex-col items-center justify-center shadow-xl shadow-gold/20 hidden lg:flex">
                <span className="font-bebas text-5xl text-navy-deep leading-none">47</span>
                <p className="text-[11px] font-bold text-navy-deep uppercase tracking-wider">ans d'exp.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative */}
      <section className="bg-navy-deep py-16 border-b border-navy-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-cormorant text-2xl text-white/80 italic leading-relaxed">
            Tout a commencé en 1976 sur les eaux de l'île de Noirmoutier. À 17 ans, Yannick Durand prend la mer comme marin-pêcheur. C'est le début d'une vie entièrement dédiée au monde maritime — des ports fluviaux de la Loire aux capitaineries de Mayotte, en passant par le Grand Port Maritime du Havre.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-navy-mid py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gold text-[12px] font-semibold uppercase tracking-widest mb-3">Parcours</p>
            <h2 className="font-cormorant text-[52px] text-white font-light italic">47 ans de mer</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-navy-border md:-translate-x-px" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className={`flex gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'} pl-10 md:pl-0`}>
                    <div className={`inline-block bg-navy-card border rounded-xl p-5 max-w-sm ${item.current ? 'border-gold/50 bg-gold/5' : 'border-navy-border'}`}>
                      <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1 ${item.current ? 'text-gold' : 'text-muted'}`}>{item.period}</p>
                      <p className="text-white font-medium text-[13px] mb-1">{item.role}</p>
                      <p className="text-muted text-[12px] flex items-center gap-1"><Anchor className="w-3 h-3 flex-shrink-0" />{item.location}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-gold bg-navy-deep mt-5 flex-shrink-0 z-10" />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-navy-deep py-20 border-t border-navy-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gold text-[12px] font-semibold uppercase tracking-widest mb-3">Qualifications</p>
            <h2 className="font-cormorant text-[52px] text-white font-light italic">Certifications</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {certifications.map((cert, i) => (
              <div key={i} className="bg-navy-card border border-navy-border rounded-xl p-5 hover:border-gold/40 transition-colors flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-white font-medium text-[13px] leading-tight mb-1">{cert.label}</p>
                  <p className="text-muted text-[12px]">{cert.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TSO EDF */}
      <section className="bg-navy-mid py-14 border-y border-navy-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-8 h-8 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-xl mb-2">Terminal Safety Officer — EDF Réunion</h3>
              <p className="text-muted text-[14px] leading-relaxed">
                EXMAR-OI supervise <strong className="text-white">2 pétroliers par mois</strong> pour EDF Réunion via 4SA. Zéro incident depuis la prise de mission. Conformité totale aux protocoles ISGOTT et MARPOL.
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <span className="font-bebas text-[56px] text-gold leading-none block">0</span>
              <p className="text-muted text-[12px] uppercase tracking-wider">incident</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-navy-deep py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { src: '/survey-fishing-vessel.webp', label: 'Inspection Navire Pêche' },
              { src: '/survey-hull-moisture.webp', label: 'Expertise Corps & Plaisance' },
              { src: '/survey-cargo-container.webp', label: 'Expertise des Facultés' },
            ].map((img, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden h-56 group">
                <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent" />
                <p className="absolute bottom-4 left-4 text-white font-semibold text-[14px]">{img.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner title="Travailler avec un vrai expert" subtitle="47 ans d'expérience à votre service dans l'Océan Indien." />
      <Footer />
    </div>
  );
}
