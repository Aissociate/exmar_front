import { Link } from 'react-router-dom';
import { ArrowRight, Anchor, Shield, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';
import CtaBanner from '../components/CtaBanner';

const cases = [
  {
    num: '01',
    title: 'Vous achetez un bateau',
    subtitle: 'Achetez en toute confiance',
    desc: "Un bateau peut paraître impeccable et cacher des défauts structurels importants. Avant de signer, faites inspecter le navire par un expert indépendant.",
    services: ["Inspection coque & structure", "Contrôle humidité", "Bilan moteur", "Équipements sécurité", "Rapport certifié"],
    cta: 'Demander une expertise pré-achat',
    icon: Anchor,
    img: '/survey-hull-moisture.webp',
  },
  {
    num: '02',
    title: 'Vous vendez votre bateau',
    subtitle: 'Vendez plus vite, au bon prix',
    desc: "Un rapport d'expertise indépendant est le meilleur argument de vente. Il rassure l'acheteur, justifie votre prix.",
    services: ["État général certifié", "Contrôle points clés", "Estimation valeur vénale", "Rapport communicable"],
    cta: 'Faire expertiser mon bateau',
    icon: Shield,
    img: '/survey-yacht-hull.webp',
  },
  {
    num: '03',
    title: 'Vous assurez votre bateau',
    subtitle: 'Assurez-vous dans les règles',
    desc: "La plupart des compagnies d'assurance exigent une expertise maritime. Ce rapport conditionne votre couverture.",
    services: ["Évaluation valeur assurable", "Contrôle état général", "Rapport certifié transmissible à l'assureur"],
    cta: 'Demander une expertise pré-assurance',
    icon: FileText,
    img: '/survey-marina-pontoon.webp',
  },
  {
    num: '04',
    title: 'Vous avez subi un sinistre',
    subtitle: 'Un expert indépendant à vos côtés',
    desc: "Collision, échouage, tempête, incendie... Un expert indépendant défend vos intérêts — pas ceux de l'assureur.",
    services: ["Constat d'avarie contradictoire", "Évaluation dommages", "Estimation remise en état", "Suivi travaux optionnel"],
    cta: 'Déclarer un sinistre',
    icon: AlertTriangle,
    img: '/survey-yacht-hull.webp',
  },
];

export default function PlaisancePage() {
  return (
    <div className="min-h-screen bg-navy-deep">
      {/* Page hero */}
      <section className="relative pt-[74px] pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/survey-marina-tablet.webp" alt="Plaisance" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy-deep/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-deep" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <p className="text-gold text-[12px] font-semibold uppercase tracking-widest mb-3">Expertise Plaisance</p>
          <h1 className="font-bebas text-[64px] md:text-[88px] text-white leading-none tracking-wide mb-4">
            Plaisance
          </h1>
          <div className="h-px w-16 bg-gold mb-6" />
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            Dans l'Océan Indien, le marché de la plaisance est vivant — mais acheter ou vendre un bateau reste une démarche complexe où les apparences peuvent être trompeuses. Humidité cachée, moteur en fin de vie, structure fatiguée : ce que l'œil non averti ne voit pas peut coûter très cher.
          </p>
          <p className="text-muted mt-3 text-[14px]">Expert maritime depuis 47 ans, EXMAR-OI accompagne les plaisanciers de La Réunion, Mayotte, Maurice et des Seychelles à chaque étape.</p>
        </div>
      </section>

      {/* Cases */}
      <section className="bg-navy-deep py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-0">
          {cases.map((c, i) => (
            <div key={i} className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${i < cases.length - 1 ? 'border-b border-navy-border' : ''}`}>
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
                <h2 className="font-bebas text-[44px] text-white leading-none tracking-wide mb-4">{c.title}</h2>
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

      <CtaBanner title="Besoin d'une expertise plaisance ?" subtitle="Contactez-nous pour votre bateau de plaisance dans l'Océan Indien." />
      <Footer />
    </div>
  );
}
