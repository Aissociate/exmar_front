import { ArrowRight } from 'lucide-react';
import { Ship, ClipboardList, Users, Globe } from 'lucide-react';

interface HeroProps {
  onNavigate: (section: string) => void;
}

const highlights = [
  {
    icon: Ship,
    title: 'Expertises maritimes',
    desc: 'Expertises de sinistres, avaries, marchandises et nautiques par des experts qualifiés.',
  },
  {
    icon: ClipboardList,
    title: 'Inspections',
    desc: "Inspections rigoureuses pour évaluer l'état, la conformité et les risques.",
  },
  {
    icon: Users,
    title: 'Conseils & assistance',
    desc: 'Accompagnement technique et stratégique pour des décisions éclairées.',
  },
  {
    icon: Globe,
    title: 'Zone Océan Indien',
    desc: "Présence et connaissance approfondie du contexte maritime de l'Océan Indien.",
  },
];

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <>
      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-white pt-[70px]">
        <div className="relative min-h-[480px] flex items-center">
          {/* Background image right side */}
          <div className="absolute inset-0">
            <img
              src="/WhatsApp_Image_2026-05-11_at_17.19.10.jpeg"
              alt="Navire porte-conteneurs"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/20" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold text-[#1a2e4a] leading-tight mb-3">
                L'expertise maritime,<br />
                claire comme votre route
              </h1>

              {/* Amber underline */}
              <div className="w-16 h-[3px] bg-amber-500 rounded-full mb-5" />

              {/* Slogan */}
              <p className="text-lg font-semibold text-amber-600 mb-3 tracking-wide uppercase text-sm">
                Votre cap, notre expertise
              </p>

              <p className="text-gray-600 text-[17px] leading-relaxed mb-8">
                Des expertises, inspections et conseils<br />
                sans complication pour les acteurs du monde maritime.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => onNavigate('contact')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a2e4a] text-white font-semibold rounded-lg hover:bg-[#243d61] transition-colors duration-200 text-[15px]"
                >
                  Contactez-nous
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('services')}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[#1a2e4a] text-[#1a2e4a] font-semibold rounded-lg hover:bg-[#1a2e4a]/5 transition-colors duration-200 text-[15px]"
                >
                  Nos expertises
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-column highlights strip */}
        <div className="relative z-10 bg-white border-t border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
              {highlights.map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center px-6 py-8 gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#1a2e4a]/8 flex items-center justify-center mb-1">
                    <item.icon className="w-6 h-6 text-[#1a2e4a]" />
                  </div>
                  <div className="w-8 h-[2px] bg-amber-500 rounded-full" />
                  <h3 className="font-bold text-[#1a2e4a] text-[15px]">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
