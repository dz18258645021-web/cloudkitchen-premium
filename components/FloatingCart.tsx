
import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartProps {
  count: number;
  total: number;
  onViewCart: () => void;
  onCheckout: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ count, total, onViewCart, onCheckout }) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 z-40 animate-fade-in">
      <div className="bg-gray-800 dark:bg-gray-700 rounded-full shadow-xl flex items-center justify-between p-2 pr-2 h-14 border border-gray-700">
        <div 
          className="flex items-center gap-3 pl-2 flex-1 cursor-pointer"
          onClick={onViewCart}
        >
          <div className="relative">
            <div className="bg-primary p-3 rounded-full text-white -mt-6 border-4 border-gray-50 dark:border-gray-900 shadow-sm">
              <ShoppingCart size={24} />
            </div>
            <div className="absolute -top-6 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800">
              {count}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg">¥{total.toFixed(2)}</span>
            <span className="text-gray-400 text-xs">未含配送费</span>
          </div>
        </div>
        
        <button 
          onClick={onCheckout}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-2 rounded-full h-full transition-colors"
        >
          去结算
        </button>
      </div>
    </div>
  );
};
