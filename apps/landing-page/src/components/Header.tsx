import { useState } from 'react';
import { Menu, X, MapPin, Download } from 'lucide-react';
import { usePage } from '../context/PageContext';

const nav = [
  { label: 'Trajets',   slug: 'trajets',   href: null },
  { label: 'Conduire',  slug: null,         href: '#driver' },
  { label: 'Livraison', slug: 'livraison',  href: null },
  { label: 'Sécurité',  slug: null,         href: '#safety' },
  { label: 'Aide',      slug: 'aide',       href: null },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { openPage } = usePage();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-dark/95 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-bold text-xl text-white">
          <span className="bg-brand text-white rounded-lg px-2 py-0.5 text-sm font-black tracking-tight">Djib</span>
          <span className="text-white">Ride</span>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          {nav.map(n => n.slug
            ? <button key={n.label} onClick={() => openPage(n.slug!)}
                className="text-slate-300 hover:text-brand text-sm font-medium transition-colors">
                {n.label}
              </button>
            : <a key={n.label} href={n.href!}
                className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                {n.label}
              </a>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400 text-sm">
            <MapPin size={14} className="text-brand" /> Djibouti
          </span>
          <a href="#download"
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
            <Download size={14} /> Télécharger
          </a>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-1">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-dark border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          {nav.map(n => n.slug
            ? <button key={n.label} onClick={() => { openPage(n.slug!); setOpen(false); }}
                className="text-slate-300 text-sm font-medium text-left">
                {n.label}
              </button>
            : <a key={n.label} href={n.href!} onClick={() => setOpen(false)}
                className="text-slate-300 text-sm font-medium">
                {n.label}
              </a>
          )}
          <a href="#download" onClick={() => setOpen(false)}
            className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-full text-center">
            Télécharger l'app
          </a>
        </div>
      )}
    </header>
  );
}
