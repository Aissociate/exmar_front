import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Linkedin } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="h-[3px] bg-gold w-full" />
      <div className="bg-navy-deep text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <img src="/image copy.png" alt="EXMAR-OI" className="h-28 w-auto mb-5 brightness-0 invert" />
              <p className="text-muted text-sm leading-relaxed mb-5">
                Expertise Maritime Océan Indien — 47 ans au service des professionnels de la mer.
              </p>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-navy-deep font-bold text-[11px] flex-shrink-0">FIN</div>
                <div>
                  <p className="text-gold font-semibold text-sm">Membre FIN 2026</p>
                  <p className="text-muted text-xs">Fédération des Industries Nautiques</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[Facebook, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full bg-navy-card border border-navy-border flex items-center justify-center text-muted hover:bg-gold hover:text-navy-deep hover:border-gold transition-colors duration-200">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-gold mb-5">Services</h4>
              <ul className="space-y-2.5 text-sm text-white/65">
                {[
                  { label: 'Expertise Plaisance', to: '/plaisance' },
                  { label: 'Expertise Pêche', to: '/peche' },
                  { label: 'Commerce & Industrie', to: '/commerce-industrie' },
                  { label: 'Terminal Safety Officer', to: '/commerce-industrie' },
                ].map((s) => (
                  <li key={s.label}>
                    <Link to={s.to} className="hover:text-gold transition-colors">{s.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-gold mb-5">Zone d'Intervention</h4>
              <ul className="space-y-2.5 text-sm text-white/65">
                {['La Réunion', 'Mayotte', 'Maurice', 'Seychelles', 'Madagascar'].map((lieu) => (
                  <li key={lieu} className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />{lieu}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-gold mb-5">Contact</h4>
              <ul className="space-y-4">
                <li>
                  <a href="tel:+262692860110" className="flex items-start gap-3 group">
                    <Phone className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white/85 group-hover:text-gold transition-colors">+262 692 86 01 10</p>
                      <p className="text-xs text-muted">Lun–Ven 08h–17h</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="mailto:contact@exmar-oi.com" className="flex items-start gap-3 group">
                    <Mail className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-white/70 group-hover:text-gold transition-colors break-all">contact@exmar-oi.com</p>
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/70">La Possession<br />La Réunion 97419</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-navy-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <p className="text-muted text-[13px]">© {year} EXMAR-OI — Expertise Maritime Océan Indien</p>
            <div className="flex items-center gap-4 text-[13px] text-muted">
              <a href="#" className="hover:text-gold transition-colors">Mentions légales</a>
              <span className="text-navy-border">|</span>
              <a href="#" className="hover:text-gold transition-colors">Confidentialité</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
