import { ArrowRight, CreditCard, FileText, Car, Smartphone } from 'lucide-react';

const reqs = [
  { icon: CreditCard, label: 'Carte d\'identité nationale valide' },
  { icon: FileText, label: 'Permis de conduire en cours de validité' },
  { icon: Car, label: 'Carte grise du véhicule + Contrat DjibRide accepté' },
  { icon: Smartphone, label: 'Smartphone Android ou iOS' },
];

export default function DriverSignup() {
  return (
    <section id="driver" className="py-16 md:py-24 bg-dark">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <span className="text-brand text-sm font-semibold uppercase tracking-wide">Devenez partenaire</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-6">
            Commencez à gagner<br />avec DjiRide
          </h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Rejoignez des centaines de chauffeurs à Djibouti. Choisissez vos horaires,
            acceptez les courses qui vous conviennent et recevez vos paiements rapidement.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand">+500</p>
              <p className="text-slate-400 text-sm">Chauffeurs actifs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-brand">15 DJF</p>
              <p className="text-slate-400 text-sm">Km de base</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-brand">48h</p>
              <p className="text-slate-400 text-sm">Validation dossier</p>
            </div>
          </div>

          <a href="#download"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-full transition-colors">
            Commencer maintenant <ArrowRight size={16} />
          </a>
        </div>

        <div className="bg-mid rounded-2xl p-8 border border-white/10">
          <h3 className="text-white font-bold text-lg mb-6">Documents requis</h3>
          <div className="flex flex-col gap-4">
            {reqs.map(r => (
              <div key={r.label} className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3">
                <div className="w-9 h-9 bg-brand/10 rounded-lg flex items-center justify-center shrink-0">
                  <r.icon size={17} className="text-brand" />
                </div>
                <span className="text-slate-300 text-sm">{r.label}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-6 leading-relaxed">
            Tous les documents sont vérifiés par notre équipe sous 48h. Une fois approuvé,
            vous pouvez commencer à accepter des courses immédiatement.
          </p>
        </div>
      </div>
    </section>
  );
}
