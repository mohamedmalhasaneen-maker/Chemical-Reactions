import React, { useState, useEffect } from 'react';
import { 
  X, Star, Send, ShieldCheck, CheckCircle2, AlertCircle, 
  Clock, MessageSquare, User, Lock, Sparkles
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, CommentItem } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  // Form states for comment submission
  const [visitorName, setVisitorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string | null>(null);

  // Approved comments list state
  const [approvedComments, setApprovedComments] = useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  // Subscribe to approved comments for this product from Firestore
  useEffect(() => {
    setIsLoadingComments(true);
    const commentsRef = collection(db, 'comments');
    
    // Strict query: ONLY comments where productId == product.id AND status == 'approved'
    const q = query(
      commentsRef,
      where('productId', '==', product.id),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: CommentItem[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as CommentItem);
        });
        setApprovedComments(list);
        setIsLoadingComments(false);
      },
      (error) => {
        console.error('Error listening to approved comments:', error);
        // Log detailed security context using handleFirestoreError
        try {
          handleFirestoreError(error, OperationType.LIST, `comments/${product.id}`);
        } catch {
          // Catch handled re-throw to avoid unhandled promise rejection in listener
        }
        setIsLoadingComments(false);
      }
    );

    return () => unsubscribe();
  }, [product.id]);

  // Handle comment form submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccessMsg(null);
    setSubmitErrorMsg(null);

    // Front-end validation
    const trimmedName = visitorName.trim();
    const trimmedComment = commentText.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setSubmitErrorMsg('يرجى كتابة الاسم بشكل صحيح (أطول من حرفين).');
      return;
    }

    if (!trimmedComment || trimmedComment.length < 2) {
      setSubmitErrorMsg('يرجى كتابة تعليق مفيد لا يقل عن حرفين.');
      return;
    }

    if (rating < 1 || rating > 5) {
      setSubmitErrorMsg('يرجى اختيار تقييم صحيح من 1 إلى 5 نجوم.');
      return;
    }

    setIsSubmitting(true);

    try {
      const commentsRef = collection(db, 'comments');
      
      // CRITICAL PAYLOAD: Visitors send pending status by default, fulfilling rule isValidNewComment
      const newCommentPayload = {
        name: trimmedName,
        comment: trimmedComment,
        rating: Number(rating),
        productId: product.id,
        status: 'pending' as const, // Strict pending status for safety!
        createdAt: serverTimestamp()
      };

      await addDoc(commentsRef, newCommentPayload);

      // Reset form and present success message in Arabic
      setVisitorName('');
      setCommentText('');
      setRating(5);
      setSubmitSuccessMsg('تم إرسال تعليقك بنجاح! يسعدنا مشاركتك، وسيظهر للعامة فور مراجعة المطور له.');
    } catch (err: any) {
      // Log full detailed JSON error in console for developer debugging
      try {
        handleFirestoreError(err, OperationType.CREATE, 'comments');
      } catch (loggingErr) {
        console.error('Logged Firestore Error Details:', loggingErr);
      }
      
      // Clear Arabic user-facing message
      setSubmitErrorMsg('تعذر إرسال التعليق بسبب قيود الأمان أو خلل في الاتصال. تم تسجيل تفاصيل الخطأ للمطور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100"
        dir="rtl"
      >
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-[#0F172A]/95 border-b border-slate-800 px-5 py-4 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-lg text-slate-100 line-clamp-1">
              تفاصيل المنتج والتعليقات: {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6">

          {/* Product Overview Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            <div className="md:col-span-5 h-56 rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:col-span-7 flex flex-col justify-between space-y-3">
              <div>
                <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-md font-semibold">
                  {product.category}
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-2">{product.name}</h3>
                <p className="text-slate-300 text-sm mt-2 leading-relaxed">{product.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div>
                  <div className="text-2xl font-black text-amber-400">{product.price} ج.م</div>
                  {product.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">{product.originalPrice} ج.م</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    onAddToCart(product);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95"
                >
                  إضافة لسلة التسوق
                </button>
              </div>
            </div>
          </div>

          {/* Comments & Reviews Title & Notice */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>تعليقات وتقييمات الزوار المعروضة</span>
                <span className="text-xs font-normal text-slate-400">({approvedComments.length})</span>
              </h3>
              <span className="text-xs text-amber-400/90 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>إرسال التعليقات متاح مجاناً للجميع دون تسجيل دخول</span>
              </span>
            </div>
          </div>

          {/* Add Visitor Comment Form */}
          <form 
            onSubmit={handleSubmitComment}
            className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 space-y-4 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500"></div>

            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                أضف تعليقك أو تقييمك للزيارة
              </h4>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>التعليق يمر بمراجعة الأمان التلقائية</span>
              </span>
            </div>

            {/* Error & Success Feedback Banners */}
            {submitErrorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{submitErrorMsg}</span>
              </div>
            )}

            {submitSuccessMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{submitSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Visitor Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسمك أو اسم مستعار <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="مثال: أحمد المحلاوي"
                    maxLength={50}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pr-9 pl-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اختر تقييمك للمنتج <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-1 py-1.5 px-3 bg-slate-950 border border-slate-700 rounded-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-amber-400 font-bold mr-2">
                    {rating} من 5 نجوم
                  </span>
                </div>
              </div>
            </div>

            {/* Comment Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                نص التعليق أو الرأي <span className="text-red-400">*</span>
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="اكتب تجربتك وانطباعك عن المنتج بحرية..."
                rows={3}
                maxLength={500}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <div className="text-[10px] text-slate-400 text-left mt-0.5">
                {commentText.length} / 500 حرف
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>حماية متطورة بواسطة Firestore Security Rules (الحالة: Pending تلقائياً)</span>
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <span>جاري الإرسال والأمان...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال التعليق الآن</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Approved Public Comments List */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-sm text-slate-300 border-b border-slate-800 pb-2">
              التعليقات المعتمدة والمقبولة من الإدارة
            </h4>

            {isLoadingComments ? (
              <div className="text-center py-6 text-slate-400 text-xs animate-pulse">
                جاري تحميل تعليقات الزوار من Firestore...
              </div>
            ) : approvedComments.length === 0 ? (
              <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-slate-800/80 text-slate-400 text-xs space-y-1">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">لا توجد تعليقات معتمدة معروضة لهذا المنتج حالياً.</p>
                <p className="text-slate-400">كن أول من يكتب تعليقاً وسيتم مراجعته ونشره سريعاً!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedComments.map((comment) => (
                  <div 
                    key={comment.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                          {comment.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-200">{comment.name}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded mr-2 border border-emerald-500/20">
                            مُعْتَمَد
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= comment.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pr-9">
                      {comment.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
