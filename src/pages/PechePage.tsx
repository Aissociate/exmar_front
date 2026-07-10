import { Link } from 'react-router-dom';
import { ArrowRight, Anchor, Shield, FileText, Scale, CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';
import CtaBanner from '../components/CtaBanner';

const cases = [
  {
    num: '01',
    title: 'Achat / Vente navire de pêche',
    subtitle: 'Transaction sécurisée',
    desc: "Pour un professionnel de la pêche, le navire est l'outil de travail. Sa valeur, son état et sa conformité ont des conséquences directes sur l'activité.",
    services: ["Inspection coque & structure", "Contrôle humidité", "Bilan moteur", "Équipements pêche & sécurité", "Rapport certifié"],
    cta: 'Demander une expertise navire',
    icon: Anchor,
    img: '/survey-fishing-vessel.webp',
  },
  {
    num: '02',
    title: 'Assurance corps & facultés',
    subtitle: 'Couverture conforme',
    desc: "L'évaluation précise de la valeur de votre navire conditionne votre couverture assurantielle. Un rapport d'expert certifié est indispensable.",
    services: ["Évaluation valeur vénale & assurable", "État général certifié", "Rapport transmissible assureur"],
    cta: 'Demander une expertise pré-assurance',
    icon: Shield,
    img: '/survey-fishing-net.webp',
  },
  {
    num: '03',
    title: 'Sinistre & constat d\'avarie',
    subtitle: 'Défense de vos intérêts',
    desc: "Collision, avarie moteur, tempête... Un constat d'avarie établi rapidement par un expert indépendant protège vos droits à indemnisation.",
    services: ["Constat contradictoire", "Évaluation dommages", "Estimation remise en état", "Suivi travaux", "Rapport assureur"],
    cta: 'Déclarer un sinistre',
    icon: FileText,
    img: '/survey-fishing-dock.webp',
  },
  {
    num: '04',
    title: 'Litige & expertise judiciaire',
    subtitle: 'Expert agréé Cour d\'appel',
    desc: "Expert près la Cour d'appel de Saint-Denis de La Réunion, Yannick Durand intervient dans les litiges maritimes professionnels.",
    services: ["Expertise contradictoire ou amiable", "Rapport technique circonstancié", "Expert Cour d'appel Saint-Denis", "Assistance audiences"],
    cta: 'Nous contacter pour un litige',
    icon: Scale,
    img: '/survey-office-plans.webp',
  },
];

export default function PechePage() {
  return (
    <div className="min-h-screen bg-navy-deep">
      <section className="relative pt-[74px] pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/survey-fishing-dock.webp" alt="Pêche" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy-deep/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-deep" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <p className="text-gold text-[12px] font-semibold uppercase tracking-widest mb-3">Expertise Pêche Professionnelle</p>
          <h1 className="font-bebas text-[64px] md:text-[88px] text-white leading-none tracking-wide mb-4">Pêche</h1>
          <div className="h-px w-16 bg-gold mb-6" />
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            Pour un professionnel de la pêche, le navire est l'outil de travail. Sa valeur, son état et sa conformité ont des conséquences directes sur l'activité, la sécurité de l'équipage et les relations avec les assureurs.
          </p>
        </div>
      </section>

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

      <CtaBanner title="Besoin d'une expertise pêche ?" subtitle="Contactez-nous pour votre navire de pêche professionnel." />
      <Footer />
    </div>
  );
}
