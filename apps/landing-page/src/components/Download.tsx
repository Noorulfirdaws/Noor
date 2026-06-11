import { Smartphone, Car, QrCode } from 'lucide-react';

export default function Download() {
  return (
    <section id="download" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Téléchargez DjiRide</h2>
          <p className="text-slate-500 text-lg">Disponible sur Android et iOS — gratuit à installer.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Passenger */}
          <div className="bg-dark rounded-2xl p-8 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center">
              <Smartphone size={28} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl mb-1">App Passager</p>
              <p className="text-slate-400 text-sm">Réservez, suivez, payez — tout en un.</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                <QrCode size={16} /> Google Play
              </button>
              <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                <QrCode size={16} /> App Store
              </button>
            </div>
          </div>

          {/* Driver */}
          <div className="bg-brand rounded-2xl p-8 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Car size={28} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl mb-1">App Chauffeur</p>
              <p className="text-white/70 text-sm">Acceptez des courses, gérez vos revenus.</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button className="w-full bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                <QrCode size={16} /> Google Play
              </button>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                <QrCode size={16} /> App Store
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
