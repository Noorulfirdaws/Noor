import { ArrowRight, Star, Clock, Shield } from 'lucide-react';

const pins = [
  { label: 'Djibouti-Ville', top: '52%', left: '48%', active: true },
  { label: 'Balbala', top: '62%', left: '38%', active: false },
  { label: 'Tadjoura', top: '28%', left: '30%', active: false },
  { label: 'Ali Sabieh', top: '78%', left: '65%', active: false },
];

export default function Hero() {
  return (
    <section className="min-h-screen bg-dark flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-4 w-full py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        {/* Left */}
        <div>
          <span className="inline-block bg-brand/10 text-brand text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-brand/20">
            🇩🇯 Disponible uniquement à Djibouti
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Bougez librement<br />
            <span className="text-brand">à Djibouti</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Réservez un trajet, commandez un repas ou devenez chauffeur partenaire.
            DjiRide connecte Djibouti en toute sécurité.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <a href="#download"
              className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-full transition-colors">
              Réserver un trajet <ArrowRight size={16} />
            </a>
            <a href="#driver"
              className="flex items-center gap-2 border border-white/20 hover:border-brand text-white font-semibold px-6 py-3 rounded-full transition-colors">
              Devenir Chauffeur
            </a>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Star size={14} className="text-brand" /> 4.8 / 5 note moyenne</span>
            <span className="flex items-center gap-1.5"><Clock size={14} className="text-brand" /> Arrivée en moins de 5 min</span>
            <span className="flex items-center gap-1.5"><Shield size={14} className="text-brand" /> Chauffeurs vérifiés</span>
          </div>
        </div>

        {/* Right – map card — hidden on small phones, visible from sm up */}
        <div className="hidden sm:block relative bg-mid rounded-2xl overflow-hidden h-72 md:h-96 border border-white/10">
          {/* grid bg */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #f9731640 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          {/* glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand/20 rounded-full blur-3xl" />

          {/* pins */}
          {pins.map(p => (
            <div key={p.label} className="absolute flex flex-col items-center gap-1"
              style={{ top: p.top, left: p.left, transform: 'translate(-50%,-100%)' }}>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap
                ${p.active ? 'bg-brand text-white' : 'bg-mid border border-white/20 text-slate-300'}`}>
                {p.label}
              </span>
              <div className={`w-2 h-2 rounded-full ${p.active ? 'bg-brand' : 'bg-slate-500'}`} />
            </div>
          ))}

          {/* ride card */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-xs bg-dark/90 backdrop-blur border border-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-semibold">Trajet en cours</span>
              <span className="text-brand text-xs font-bold">2 min</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
              <div>
                <p className="text-white text-xs font-medium">Ahmed M.</p>
                <p className="text-slate-400 text-xs">Toyota Corolla · DJ-1234</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={10} className="fill-brand text-brand" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
