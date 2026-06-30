import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';

export default function AdminsBanner() {
  return (
    <section className="bg-navy-mid border-y border-navy-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
            <FileText className="w-7 h-7 text-gold" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-gold text-[11px] font-semibold uppercase tracking-widest mb-1">Service 100% en ligne</p>
            <h3 className="text-white font-semibold text-lg">Démarches administratives — traitées par un vrai expert</h3>
            <p className="text-muted text-[13px] mt-1">Mutation · Enregistrement · Modification · Radiation — à distance, France entière</p>
          </div>
          <Link
            to="/demarches-administratives"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-deep font-semibold rounded-lg hover:bg-gold-light transition-colors text-[14px]"
          >
            Voir les tarifs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
