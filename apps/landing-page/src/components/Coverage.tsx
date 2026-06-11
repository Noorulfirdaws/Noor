import { MapPin, CheckCircle2 } from 'lucide-react';

const zones = [
  { name: 'Djibouti-Ville', desc: 'Capitale — couverture complète', active: true },
  { name: 'Balbala', desc: 'Zone urbaine en expansion', active: true },
  { name: 'Tadjoura', desc: 'Région nord du golfe', active: true },
  { name: 'Ali Sabieh', desc: 'Ville du sud-est', active: true },
  { name: 'Dikhil', desc: 'Région centrale', active: false },
  { name: 'Obock', desc: 'Côte nord — bientôt disponible', active: false },
];

export default function Coverage() {
  return (
    <section className="py-24 bg-dark">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Zones de couverture</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            DjiRide opère <strong className="text-brand">uniquement à Djibouti</strong> — nous connaissons chaque quartier.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map(z => (
            <div key={z.name}
              className={`flex items-start gap-4 rounded-xl p-5 border transition-all
                ${z.active
                  ? 'bg-white/5 border-brand/30 hover:border-brand'
                  : 'bg-white/[0.02] border-white/10 opacity-60'}`}>
              <div className={`mt-0.5 ${z.active ? 'text-brand' : 'text-slate-600'}`}>
                {z.active ? <CheckCircle2 size={20} /> : <MapPin size={20} />}
              </div>
              <div>
                <p className="text-white font-semibold">{z.name}</p>
                <p className="text-slate-400 text-sm">{z.desc}</p>
                {!z.active && <span className="text-xs text-brand/70 font-medium mt-1 inline-block">Prochainement</span>}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm mt-10">
          DjiRide est un service 100% djiboutien. Aucune extension internationale prévue.
        </p>
      </div>
    </section>
  );
}
