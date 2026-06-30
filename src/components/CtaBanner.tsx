import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Props {
  title?: string;
  subtitle?: string;
  cta?: string;
}

export default function CtaBanner({
  title = "Besoin d'une expertise ?",
  subtitle = "Contactez-nous pour discuter de votre projet. Réponse rapide garantie.",
  cta = 'Nous contacter',
}: Props) {
  return (
    <section className="bg-gold py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="font-bebas text-[40px] md:text-[52px] text-navy-deep leading-none tracking-wide">{title}</h2>
          <p className="text-navy-deep/70 mt-1 text-[15px]">{subtitle}</p>
        </div>
        <Link
          to="/contact"
          className="flex-shrink-0 inline-flex items-center gap-2 px-8 py-4 bg-navy-deep text-white font-semibold rounded-lg hover:bg-navy-mid transition-colors text-[15px] shadow-lg"
        >
          {cta} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
