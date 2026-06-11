/**
 * PaymentMethods — section Moyens de paiement disponibles à Djibouti
 * Méthodes : WAAFI · D-Money · E-Dahab · Dahabshiil · CIB · Espèces
 */

type Method = {
  name: string;
  abbr: string;
  desc: string;
  color: string;       // bg
  text: string;        // text
  badge?: string;      // optional tag
};

const methods: Method[] = [
  {
    name: 'WAAFI',
    abbr: 'W',
    desc: 'Paiement mobile Telesom',
    color: '#006633',
    text: '#ffffff',
    badge: 'Populaire',
  },
  {
    name: 'D-Money',
    abbr: 'DM',
    desc: 'Paiement mobile Salaam',
    color: '#E8431A',
    text: '#ffffff',
    badge: 'Recommandé',
  },
  {
    name: 'Espèces',
    abbr: '💵',
    desc: 'Paiement en main propre',
    color: '#1e293b',
    text: '#f97316',
  },
];

export default function PaymentMethods() {
  return (
    <section className="py-16 md:py-24 bg-dark border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-brand text-sm font-semibold uppercase tracking-widest">
            Paiements 100 % locaux
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3 mb-3">
            Payez comme vous voulez
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            DjiRide accepte tous les moyens de paiement disponibles à Djibouti.
            Aucune carte internationale requise.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-3 max-w-lg mx-auto gap-4 mb-10">
          {methods.map((m) => (
            <div
              key={m.name}
              className="relative flex flex-col items-center text-center rounded-2xl p-5 gap-3 transition-transform hover:-translate-y-1 hover:shadow-xl"
              style={{ background: m.color + '18', border: `1px solid ${m.color}44` }}
            >
              {/* Badge */}
              {m.badge && (
                <span
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: m.color, color: m.text }}
                >
                  {m.badge}
                </span>
              )}

              {/* Logo circle */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg shadow-md"
                style={{ background: m.color, color: m.text }}
              >
                {m.abbr}
              </div>

              <div>
                <p className="text-white font-bold text-sm">{m.name}</p>
                <p className="text-slate-400 text-xs mt-0.5 leading-snug">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap justify-center gap-6 text-slate-500 text-xs">
          {[
            '🔒 Transactions chiffrées',
            '⚡ Paiement instantané',
            '🇩🇯 100 % fait à Djibouti',
            '📲 Sans carte internationale',
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              {item}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
