import { Car, UtensilsCrossed, Briefcase, Users } from 'lucide-react';

const services = [
  {
    icon: Car,
    title: 'Trajets',
    desc: 'Réservez un véhicule en quelques secondes. Confort, économie ou premium — choisissez selon vos besoins.',
    badge: 'Disponible 24h/24',
  },
  {
    icon: UtensilsCrossed,
    title: 'Livraison Repas',
    desc: 'Vos restaurants préférés de Djibouti-Ville livrés directement chez vous. Rapide et suivi en temps réel.',
    badge: 'Nouveau',
  },
  {
    icon: Users,
    title: 'Chauffeur Partenaire',
    desc: 'Gagnez de l\'argent en conduisant à votre rythme. Flexibilité totale, revenus transparents.',
    badge: 'Rejoindre',
  },
  {
    icon: Briefcase,
    title: 'Transport Pro',
    desc: 'Solutions de mobilité pour entreprises. Gestion de flotte, facturation centralisée et rapports détaillés.',
    badge: 'Entreprises',
  },
];

export default function Services() {
  return (
    <section id="services" className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Nos services</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Tout ce dont vous avez besoin pour vous déplacer ou livrer à Djibouti.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(s => (
            <div key={s.title}
              className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-brand hover:shadow-lg transition-all group cursor-pointer">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand transition-colors">
                <s.icon size={22} className="text-brand group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-full">{s.badge}</span>
              <h3 className="text-dark font-bold text-lg mt-3 mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
