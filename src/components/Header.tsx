import React from 'react';
import { ShoppingBag, ShieldCheck, Sparkles, Search } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDeveloperMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenAdmin,
  searchQuery,
  setSearchQuery,
  isDeveloperMode
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-md shadow-amber-500/20">
              م
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
                متجر المحلاوي
              </h1>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Al Mahlawy Store</span>
                <span className="inline-block w-1 h-1 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-400">متجر رسمي معتمد</span>
              </p>
            </div>
          </div>

          {/* Mobile Admin & Cart Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenAdmin}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all ${
                isDeveloperMode 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="لوحة المطور والمراجعة"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isDeveloperMode ? 'المطور' : 'الإدارة'}</span>
            </button>
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن المنتجات، الأحذية، الملابس..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl py-2 pr-10 pl-4 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-right"
            dir="rtl"
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Desktop Admin & Cart Controls */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              isDeveloperMode 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10' 
                : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{isDeveloperMode ? 'لوحة المطور (مُنَشَّطة)' : 'بوابة المطور والتعليقات'}</span>
            {isDeveloperMode && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
          </button>

          <button
            onClick={onOpenCart}
            className="relative px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 hover:from-amber-400 hover:to-amber-300 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>سلة التسوق</span>
            {cartCount > 0 && (
              <span className="bg-slate-950 text-amber-400 text-[11px] px-2 py-0.5 rounded-full font-extrabold mr-1">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
