import {
  Ship,
  Anchor,
  Scale,
  ClipboardCheck,
  Wrench,
  Eye,
  FileCheck,
  Fuel,
  Fish
} from 'lucide-react';

const services = [
  {
    icon: Ship,
    title: 'Expertise Corps & Facultés',
    description: 'Évaluation complète des dommages aux navires et cargaisons pour les assureurs et armateurs.',
  },
  {
    icon: Fuel,
    title: 'Bunkers, On/Off Hire',
    description: 'Vérification des quantités de soutes lors des opérations de soutage et des prises/remises de navires.',
  },
  {
    icon: ClipboardCheck,
    title: 'Condition Surveys',
    description: 'Inspections détaillées de l\'état des navires avant affrètement ou transaction.',
  },
  {
    icon: Scale,
    title: 'Pesées Hydrostatiques',
    description: 'Détermination précise du poids des cargaisons par calcul de tirant d\'eau.',
  },
  {
    icon: Fish,
    title: 'Expertises Plaisance & Pêche',
    description: 'Services spécialisés pour les navires de plaisance et les bateaux de pêche.',
  },
  {
    icon: Eye,
    title: 'Surveillance Chargement/Déchargement',
    description: 'Pointage et contrôle des opérations de manutention pour sécuriser les cargaisons.',
  },
  {
    icon: FileCheck,
    title: 'Inspection Avant Embarquement',
    description: 'Vérification de conformité des marchandises avant leur chargement à bord.',
  },
  {
    icon: Wrench,
    title: 'Supervision Réparations',
    description: 'Suivi technique des réparations sur site ou en chantier naval.',
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-4">
            Nos Expertises
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Services d'Expertise Maritime
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fort de 40 ans d'expérience, EXMAR-OI propose une gamme complète de services d'expertise maritime adaptés aux besoins des professionnels de l'Océan Indien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative rounded-2xl overflow-hidden h-48 group">
            <img
              src="/WhatsApp_Image_2026-03-18_at_19.38.21.jpeg"
              alt="Bateau de pêche"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-sm font-semibold">Pêche</p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-48 group">
            <img
              src="/WhatsApp_Image_2026-03-18_at_19.34.40_(3).jpeg"
              alt="Navire commercial"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-sm font-semibold">Cargo</p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-48 group">
            <img
              src="/WhatsApp_Image_2026-03-18_at_19.49.41_(1).jpeg"
              alt="Équipements maritimes"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-sm font-semibold">Équipements</p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-48 group">
            <img
              src="/WhatsApp_Image_2026-03-18_at_19.49.41.jpeg"
              alt="Expertise portuaire"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-3 left-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-sm font-semibold">Port</p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-3xl p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <Anchor className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Besoin d'une expertise ?</h3>
                <p className="text-white/80">Notre équipe est disponible 24h/24, 7j/7 pour répondre à vos urgences.</p>
              </div>
            </div>
            <a
              href="tel:+262692860110"
              className="px-8 py-4 bg-white text-cyan-600 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              +262 692 86 01 10
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
