import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, CheckCircle2, ArrowRight } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMsg('يرجى ملء جميع البيانات المطلوبة للتوصيل.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg('سلة التسوق فارغة.');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const ordersRef = collection(db, 'orders');
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        items: cartItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: Number(totalAmount),
        status: 'pending' as const,
        createdAt: serverTimestamp()
      };

      await addDoc(ordersRef, orderPayload);
      onClearCart();
      setOrderSuccess(true);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'orders');
      } catch (loggingErr) {
        console.error('Logged Firestore Order Error:', loggingErr);
      }
      setErrorMsg('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-start animate-in fade-in duration-200">
      <div 
        className="bg-[#0F172A] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-800 text-slate-100"
        dir="rtl"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-slate-100">سلة التسوق</h2>
            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
              {cartItems.length} منتجات
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {orderSuccess ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-slate-100">تم استلام طلبك بنجاح!</h3>
              <p className="text-xs text-slate-300 leading-relaxed px-4">
                شكراً لتسوقك من متجر المحلاوي. سيقوم فريق خدمة العملاء بالتواصل معك لتأكيد الشحن والتوصيل.
              </p>
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  onClose();
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                متابعة التسوق
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300">سلة التسوق فارغة حالياً</p>
              <p className="text-xs">اختر المنتجات المفضلة لديك وأضفها للسلة.</p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div 
                    key={item.product.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3"
                  >
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-14 h-14 rounded-lg object-cover bg-slate-950 border border-slate-800"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-200 truncate">{item.product.name}</h4>
                      <div className="text-xs text-amber-400 font-bold mt-0.5">
                        {item.product.price} ج.م
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-700"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-100">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center hover:bg-slate-700"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Form */}
              <form onSubmit={handleCheckout} className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="font-bold text-xs text-amber-400">بيانات التوصيل وإتمام الشراء</h4>

                {errorMsg && (
                  <div className="p-2.5 bg-red-950 border border-red-800 text-red-200 text-xs rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="الاسم بالكامل *"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="رقم الهاتف للتواصل *"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="عنوان الشحن والتوصيل التفصيلي *"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-100 mb-3">
                    <span>إجمالي المشتريات:</span>
                    <span className="text-amber-400 text-lg">{totalAmount} ج.م</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  >
                    {isSubmittingOrder ? (
                      <span>جاري إرسال الطلب...</span>
                    ) : (
                      <>
                        <span>إرسال وتأكيد الطلب الآن</span>
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
