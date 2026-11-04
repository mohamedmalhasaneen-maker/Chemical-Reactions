import React from 'react';
import { Star, MessageSquare, Plus, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isAdded: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  isAdded
}) => {
  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-amber-500/5">
      
      {/* Product Image & Badges */}
      <div 
        className="relative h-48 sm:h-56 overflow-hidden bg-slate-950 cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60"></div>
        
        {product.badge && (
          <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg">
            {product.badge}
          </span>
        )}
        
        <span className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-200 text-[11px] font-medium px-2.5 py-1 rounded-lg">
          {product.category}
        </span>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-right" dir="rtl">
        <div>
          <h3 
            onClick={() => onSelectProduct(product)}
            className="text-slate-100 font-bold text-base hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </h3>
          <p className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Rating and Price */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1">
              <span className="text-amber-400 font-extrabold text-sm">{product.price}</span>
              <span className="text-amber-400/90 text-xs font-semibold">ج.م</span>
            </div>
            {product.originalPrice && (
              <span className="text-slate-500 text-[11px] line-through">
                {product.originalPrice} ج.م
              </span>
            )}
          </div>

          <button
            onClick={() => onSelectProduct(product)}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/20 transition-all"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating || 4.8}</span>
            <span className="text-slate-400 font-normal">({product.reviewCount || 0})</span>
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onSelectProduct(product)}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/80 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>التعليقات</span>
          </button>

          <button
            onClick={() => onAddToCart(product)}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              isAdded
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/15'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>تمت الإضافة</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>شراء الآن</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
