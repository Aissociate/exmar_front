import { MapPin, Globe, Clock, CheckCircle } from 'lucide-react';

const locations = [
  {
    name: 'La Réunion',
    description: 'Siège social - Port de la Pointe des Galets',
    flag: '🇷🇪',
    highlights: ['Port principal', 'Interventions 24/7', 'Base opérationnelle'],
  },
  {
    name: 'Mayotte',
    description: 'Port de Longoni - Mamoudzou',
    flag: '🇾🇹',
    highlights: ['Port en développement', 'Expertise locale', 'Réactivité garantie'],
  },
  {
    name: 'Maurice',
    description: 'Port Louis - Freeport',
    flag: '🇲🇺',
    highlights: ['Hub régional', 'Expertise locale', 'Services complets'],
  },
  {
    name: 'Madagascar',
    description: 'Toamasina - Mahajanga - Antsiranana',
    flag: '🇲🇬',
    highlights: ['Couverture nationale', 'Ports multiples', 'Expertise établie'],
  },
  {
    name: 'Seychelles',
    description: 'Port Victoria - Mahé',
    flag: '🇸🇨',
    highlights: ['Hub régional', 'Port franc', 'Services complets'],
  },
];

const advantages = [
  {
    icon: Globe,
    title: 'Couverture Régionale Complète',
    description: 'Présence dans tous les ports majeurs de l\'Océan Indien pour une intervention rapide.',
  },
  {
    icon: Clock,
    title: 'Disponibilité 24/7',
    description: 'Équipe mobilisable à tout moment pour répondre aux urgences maritimes.',
  },
  {
    icon: CheckCircle,
    title: 'Expertise Reconnue',
    description: '40 ans d\'expérience et membre de la Fédération des Industries Nautiques.',
  },
];

export default function Zone() {
  return (
    <section id="zone" className="py-24 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold mb-4">
            Notre Zone d'Intervention
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            L'Océan Indien, Notre Territoire
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            EXMAR-OI intervient sur l'ensemble des îles et territoires de l'Océan Indien, offrant une expertise de proximité à tous les acteurs du monde maritime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="relative rounded-3xl overflow-hidden h-full min-h-[400px]">
              <img
                src="/ChatGPT_Image_11_mai_2026,_15_04_18_(4).png"
                alt="Ocean Indien"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex flex-wrap gap-3">
                  {locations.map((loc) => (
                    <div
                      key={loc.name}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                    >
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium">{loc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {advantages.map((adv, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <adv.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{adv.title}</h3>
                    <p className="text-gray-400 text-sm">{adv.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {locations.map((location, index) => (
            <div
              key={index}
              className="group bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{location.flag}</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                {location.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{location.description}</p>
              <ul className="space-y-2">
                {location.highlights.map((highlight, hIndex) => (
                  <li key={hIndex} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
