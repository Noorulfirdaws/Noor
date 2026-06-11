import { useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { usePage } from '../context/PageContext';
import { getPageContent } from '../content/pages';

export default function PageDrawer() {
  const { activePage, closePage } = usePage();
  const page = activePage ? getPageContent(activePage) : null;

  useEffect(() => {
    if (activePage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activePage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePage(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closePage]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closePage}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300
          ${activePage ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer panel */}
      <div className={`fixed top-0 right-0 z-[70] h-full w-full sm:w-[560px] lg:w-[680px]
        bg-[#0f172a] border-l border-white/10 shadow-2xl
        flex flex-col transition-transform duration-300 ease-in-out
        ${activePage ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <button
            onClick={closePage}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            {page?.category || 'DjiRide'}
          </span>
          <button
            onClick={closePage}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 prose-custom">
          {page ? <page.Component /> : null}
        </div>
      </div>
    </>
  );
}
