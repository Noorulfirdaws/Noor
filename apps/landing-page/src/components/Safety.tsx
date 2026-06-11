import { ShieldCheck, MapPinned, Phone, BadgeCheck } from 'lucide-react';

const items = [
  { icon: BadgeCheck, title: 'Chauffeurs vérifiés', desc: 'Chaque chauffeur passe une vérification d\'identité, de permis et de casier judiciaire avant d\'être accepté.' },
  { icon: MapPinned, title: 'Suivi en temps réel', desc: 'Partagez votre trajet avec vos proches. Position GPS mise à jour en continu.' },
  { icon: Phone, title: 'Assistance d\'urgence', desc: 'Un bouton SOS disponible à tout moment pendant le trajet. Équipe de support locale 24h/7j.' },
  { icon: ShieldCheck, title: 'Prix transparents', desc: 'Le tarif est affiché avant la réservation. Aucun frais caché, aucune surprise.' },
];

export default function Safety() {
  return (
    <section id="safety" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <span className="text-brand text-sm font-semibold uppercase tracking-wide">Sécurité</span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark mt-2 mb-6">
              Votre sécurité,<br />notre priorité
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              DjiRide a été conçu avec la sécurité des passagers et chauffeurs comme fondement.
              Chaque fonctionnalité est pensée pour vous protéger à chaque trajet.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {items.map(item => (
              <div key={item.title} className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:border-brand/30 transition-colors">
                <item.icon size={22} className="text-brand mb-3" />
                <h3 className="font-bold text-dark mb-1">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
