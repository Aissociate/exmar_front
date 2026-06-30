import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Anchor, Shield, FileText, User } from 'lucide-react';

const nav = [
  { label: 'Accueil', to: '/' },
  {
    label: 'Plaisance',
    to: '/plaisance',
    items: [
      { label: 'Expertise pré-achat', icon: Anchor },
      { label: 'Expertise pré-vente', icon: Anchor },
      { label: 'Expertise pré-assurance', icon: Shield },
      { label: "Constat d'avarie & Sinistre", icon: FileText },
    ],
  },
  {
    label: 'Pêche',
    to: '/peche',
    items: [
      { label: 'Achat / Vente navire de pêche', icon: Anchor },
      { label: 'Assurance corps & facultés', icon: Shield },
      { label: "Sinistre & constat d'avarie", icon: FileText },
      { label: 'Expertise judiciaire', icon: Shield },
    ],
  },
  {
    label: 'Commerce & Industrie',
    to: '/commerce-industrie',
    items: [
      { label: 'Terminal Safety Officer (TSO)', icon: Shield },
      { label: 'Expertise marchandises', icon: FileText },
      { label: 'Inspections techniques', icon: Anchor },
      { label: 'Mandats assureurs & tribunaux', icon: FileText },
    ],
  },
  {
    label: 'Démarches Admin.',
    to: '/demarches-administratives',
    items: [
      { label: 'Mutation de propriété — 90 €', icon: FileText },
      { label: "Certificat d'enregistrement — 120 €", icon: FileText },
      { label: 'Modification administrative — 60 €', icon: FileText },
      { label: 'Radiation / Cession — 80 €', icon: FileText },
    ],
  },
  { label: "L'Expert", to: '/l-expert' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDd, setOpenDd] = useState<string | null>(null);
  const ddTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDd(null);
  }, [location.pathname]);

  const over = (label: string) => {
    if (ddTimer.current) clearTimeout(ddTimer.current);
    setOpenDd(label);
  };
  const out = () => {
    ddTimer.current = setTimeout(() => setOpenDd(null), 160);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-navy-deep/96 backdrop-blur-md border-b border-navy-border shadow-xl shadow-black/30' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[74px]">
            <Link to="/" className="flex-shrink-0">
              <img src="/image.png" alt="EXMAR-OI" className="h-11 w-auto brightness-0 invert" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {nav.map((item) =>
                item.items ? (
                  <div key={item.label} className="relative" onMouseEnter={() => over(item.label)} onMouseLeave={out}>
                    <Link
                      to={item.to}
                      className={`flex items-center gap-1 px-3 py-2 text-[13px] font-medium rounded-md transition-colors duration-200 ${
                        location.pathname === item.to ? 'text-gold' : 'text-white/75 hover:text-gold'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDd === item.label ? 'rotate-180' : ''}`} />
                    </Link>
                    {openDd === item.label && (
                      <div
                        className="absolute top-full left-0 mt-0.5 w-64 bg-[#060e1a] border border-navy-border rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
                        onMouseEnter={() => over(item.label)}
                        onMouseLeave={out}
                      >
                        <div className="p-2">
                          {item.items.map((sub) => (
                            <Link
                              key={sub.label}
                              to={item.to}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-white/60 hover:text-white hover:bg-navy-card transition-all duration-150 group"
                            >
                              <span className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                                <sub.icon className="w-3.5 h-3.5 text-gold" />
                              </span>
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`px-3 py-2 text-[13px] font-medium rounded-md transition-colors duration-200 ${
                      location.pathname === item.to ? 'text-gold' : 'text-white/75 hover:text-gold'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            <div className="hidden xl:flex items-center gap-3">
              <a href="/admin" className="flex items-center gap-1.5 px-3.5 py-2 border border-gold/35 text-gold text-[13px] font-medium rounded-lg hover:bg-gold/10 transition-colors">
                <User className="w-3.5 h-3.5" />
                Admin
              </a>
              <Link to="/contact" className="px-5 py-2 bg-gold text-navy-deep text-[13px] font-semibold rounded-lg hover:bg-gold-light transition-colors">
                Demander une expertise
              </Link>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="xl:hidden p-2 text-white/80 hover:text-white transition-colors">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="xl:hidden bg-navy-deep border-t border-navy-border max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {nav.map((item) => (
                <div key={item.label}>
                  <Link to={item.to} className={`block px-4 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                    location.pathname === item.to ? 'text-gold bg-gold/5' : 'text-white/75 hover:text-gold hover:bg-navy-card'
                  }`}>
                    {item.label}
                  </Link>
                  {item.items && (
                    <div className="ml-4 mt-0.5 space-y-0.5">
                      {item.items.map((sub) => (
                        <Link key={sub.label} to={item.to} className="block px-4 py-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-navy-border space-y-2">
                <Link to="/contact" className="block w-full py-3 bg-gold text-navy-deep text-center text-[14px] font-semibold rounded-lg">
                  Demander une expertise
                </Link>
                <a href="/admin" className="flex items-center justify-center gap-2 py-2.5 border border-gold/40 text-gold text-[13px] font-medium rounded-lg">
                  <User className="w-3.5 h-3.5" /> Espace Admin
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* WhatsApp floating */}
      <a
        href="https://wa.me/262692860110?text=Bonjour%20EXMAR-OI%2C%20je%20souhaite%20des%20informations%20sur%20vos%20services."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-black/30 hover:scale-110 transition-transform duration-200 wa-pulse"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  );
}
