import { Award, BookOpen, Scale, Ship, Anchor, CheckCircle } from 'lucide-react';

const qualifications = [
  {
    icon: Scale,
    title: 'Expert près la Cour d\'Appel',
    description: 'Expert judiciaire agréé près la Cour d\'Appel de Saint-Denis de La Réunion',
  },
  {
    icon: Ship,
    title: 'Capitaine Fluviaux Maritime',
    description: 'Formation et expérience en navigation fluviale, maritime et commandement de navires',
  },
  {
    icon: Award,
    title: '40 ans d\'Expérience',
    description: 'Expertise maritime reconnue dans l\'ensemble de l\'Océan Indien',
  },
  {
    icon: BookOpen,
    title: 'Formation Continue',
    description: 'Veille technique et réglementaire permanente sur les normes maritimes',
  },
];

const expertise = [
  'Expertise Corps & Facultés',
  'Expertises Plaisance & Pêche',
  'Bunkers, On/Off Hire',
  'Expert Chimiste agréé',
  'Gaz Free Certificate',
  'Condition Surveys',
  'Pesées Hydrostatiques',
  'Surveillance Chargement et Déchargement',
];

export default function Expert() {
  return (
    <section id="expert" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-4">
            Notre Expert
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Yannick Durand
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert Maritime - Expert près la Cour d'Appel de Saint-Denis de La Réunion
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/WhatsApp_Image_2026-03-18_at_19.49.41.jpeg"
                alt="Yannick Durand - Expert maritime en inspection"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <div className="text-center text-white font-bold">
                      <div className="text-lg leading-tight">FIN</div>
                      <div className="text-xs">2026</div>
                    </div>
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">Yannick Durand</h3>
                    <p className="text-cyan-300">Expert Maritime Principal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-500 rounded-2xl flex items-center justify-center shadow-xl">
              <div className="text-center text-white">
                <span className="text-4xl font-bold">40</span>
                <p className="text-sm">ans d'exp.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Un Expert de Confiance pour Vos Besoins Maritimes
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Fort de plus de 40 années d'expérience dans le monde maritime, Yannick Durand
              met son expertise au service des armateurs, assureurs, avocats et tribunaux
              de l'Océan Indien. Ancien Capitaine de la Marine Marchande, il possède une
              connaissance approfondie des navires et des enjeux maritimes.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Agréé Expert près la Cour d'Appel de Saint-Denis de La Réunion, il intervient
              régulièrement dans le cadre de procédures judiciaires et d'arbitrages maritimes,
              apportant une analyse technique rigoureuse et impartiale.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {expertise.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {qualifications.map((qual, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:border-cyan-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                <qual.icon className="w-7 h-7 text-cyan-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{qual.title}</h4>
              <p className="text-gray-600 text-sm">{qual.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative rounded-2xl overflow-hidden h-64 group">
            <img
              src="/ChatGPT_Image_11_mai_2026,_15_04_17_(2).png"
              alt="Inspection Navire Pêche"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-semibold">Inspection Navire Pêche</p>
              <p className="text-sm text-gray-300">En intervention</p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-64 group">
            <img
              src="/ChatGPT_Image_11_mai_2026,_15_04_17_(3).png"
              alt="Expertise Corps et Plaisance"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-semibold">Expertise Corps et Plaisance</p>
              <p className="text-sm text-gray-300">Inspection navire commercial</p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-64 group">
            <img
              src="/ChatGPT_Image_11_mai_2026,_15_04_16_(1).png"
              alt="Expertise des Facultés"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-semibold">Expertise des Facultés</p>
              <p className="text-sm text-gray-300">Conteneurs, Vrac liquide et solide, Biomasse</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
