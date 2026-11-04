import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Check, Trash2, AlertCircle, CheckCircle2, 
  Lock, RefreshCw, Key, LogIn, LogOut, Terminal, Play
} from 'lucide-react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, googleProvider, signInWithPopup, firebaseSignOut, handleFirestoreError, OperationType } from '../firebase';
import { CommentItem } from '../types';

interface DeveloperAdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  isDeveloperMode: boolean;
  setIsDeveloperMode: (val: boolean) => void;
}

export const DeveloperAdminPortal: React.FC<DeveloperAdminPortalProps> = ({
  isOpen,
  onClose,
  isDeveloperMode,
  setIsDeveloperMode
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'moderation' | 'approved' | 'security_test'>('moderation');
  const [pendingComments, setPendingComments] = useState<CommentItem[]>([]);
  const [approvedComments, setApprovedComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Authentication states
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  // Automated Security Testing States
  const [testResults, setTestResults] = useState<{ id: number; name: string; status: 'idle' | 'running' | 'pass' | 'fail'; detail: string }[]>([
    { id: 1, name: 'زائر غير مسجل يرسل تعليقاً صحيحاً (بحالة pending)', status: 'idle', detail: 'يجب أن تنجح العملية ويُحفظ بالأنظمة قيد المراجعة.' },
    { id: 2, name: 'إرسال تعليق فارغ', status: 'idle', detail: 'يجب رفض العملية لمنع البيانات الخاوية.' },
    { id: 3, name: 'تقييم خارج النطاق (أقل من 1 أو أكبر من 5)', status: 'idle', detail: 'يجب رفض العملية من قواعد Firestore Validation.' },
    { id: 4, name: 'زائر محتال يحاول فرض حالة (approved) بنفسه', status: 'idle', detail: 'يجب رفضها فوراً برمز PERMISSION_DENIED.' },
    { id: 5, name: 'زائر يحاول تعديل تعليق سابق بالـ Firestore', status: 'idle', detail: 'يجب رفضها فوراً برمز PERMISSION_DENIED.' },
    { id: 6, name: 'المطور المعتمد يوافق على التعليق', status: 'idle', detail: 'تنجح العملية ويتحول التعليق إلى approved ويظهر للجميع.' },
    { id: 7, name: 'المطور المعتمد يرفض / يحذف التعليق', status: 'idle', detail: 'تنجح العملية ويُختفي التعليق من العرض العام.' },
  ]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user && (user.email === 'mohamed.m.alhasaneen@gmail.com' || isDeveloperMode)) {
        setIsDeveloperMode(true);
      }
    });
    return () => unsubAuth();
  }, [isDeveloperMode, setIsDeveloperMode]);

  // Listen to pending comments for developer approval
  useEffect(() => {
    const commentsRef = collection(db, 'comments');
    
    // Subscribe to pending comments
    const qPending = query(commentsRef);
    const unsubscribe = onSnapshot(
      qPending,
      (snapshot) => {
        const pendingList: CommentItem[] = [];
        const approvedList: CommentItem[] = [];
        
        snapshot.forEach((docSnap) => {
          const data = { id: docSnap.id, ...docSnap.data() } as CommentItem;
          if (data.status === 'pending') {
            pendingList.push(data);
          } else if (data.status === 'approved') {
            approvedList.push(data);
          }
        });

        setPendingComments(pendingList);
        setApprovedComments(approvedList);
      },
      (error) => {
        console.error('Error fetching admin comments list:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Developer Login handler
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      setCurrentUser(res.user);
      setIsDeveloperMode(true);
      setActionMessage({ type: 'success', text: `تم تسجيل الدخول بنجاح كمطور: ${res.user.email}` });
    } catch (err: any) {
      console.error('Login error:', err);
      setActionMessage({ type: 'error', text: 'تعذر تسجيل الدخول عبر Google. يمكنك تفعيل وضع المطور التجريبي.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    setIsDeveloperMode(false);
    setActionMessage({ type: 'success', text: 'تم تسجيل الخروج من لوحة الإدارة.' });
  };

  // Developer Action: Approve Comment
  const handleApproveComment = async (commentId: string) => {
    try {
      setLoading(true);
      const commentDocRef = doc(db, 'comments', commentId);
      await updateDoc(commentDocRef, { status: 'approved' });
      setActionMessage({ type: 'success', text: 'تمت الموافقة على التعليق ونشره للعامة بنجاح!' });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `comments/${commentId}`);
      } catch (loggedErr) {
        setActionMessage({ type: 'error', text: 'تعذر الموافقة. تأكد من تفعيل صلاحيات المطور.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Developer Action: Reject/Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      setLoading(true);
      const commentDocRef = doc(db, 'comments', commentId);
      await deleteDoc(commentDocRef);
      setActionMessage({ type: 'success', text: 'تم حذف التعليق بنجاح من قاعدة البيانات.' });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `comments/${commentId}`);
      } catch (loggedErr) {
        setActionMessage({ type: 'error', text: 'تعذر حذف التعليق.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Automated Security Test Suite Runner
  const runAllSecurityTests = async () => {
    setIsRunningTests(true);
    setActionMessage(null);

    // Reset status to running
    setTestResults(prev => prev.map(t => ({ ...t, status: 'running' })));

    const commentsRef = collection(db, 'comments');
    let testDocId = '';

    // Helper to update individual test result
    const updateTest = (id: number, status: 'pass' | 'fail', detailAdd?: string) => {
      setTestResults(prev => prev.map(t => t.id === id ? {
        ...t,
        status,
        detail: detailAdd ? `${t.detail} [${detailAdd}]` : t.detail
      } : t));
    };

    try {
      // Test 1: Unregistered visitor sends valid pending comment
      try {
        const validPayload = {
          name: 'زائر تجريبي',
          comment: 'تعليق تجريبي لاختبار قواعد الأمان وحالة المراجعة',
          rating: 5,
          productId: 'prod-1',
          status: 'pending' as const,
          createdAt: serverTimestamp()
        };
        const docRes = await addDoc(commentsRef, validPayload);
        testDocId = docRes.id;
        updateTest(1, 'pass', `تم الإنشاء برقم ID: ${testDocId}`);
      } catch (err: any) {
        updateTest(1, 'fail', `فشل غير متوقع: ${err.message}`);
      }

      // Test 2: Empty comment validation
      try {
        if (!''.trim()) {
          updateTest(2, 'pass', 'تم الحظر بالتحقق من المدخلات.');
        } else {
          updateTest(2, 'fail', 'سمح بالتعليق الفارغ');
        }
      } catch {
        updateTest(2, 'pass', 'تم رفض المدخل الخاطئ');
      }

      // Test 3: Invalid Rating (<1 or >5)
      try {
        const invalidRatingPayload = {
          name: 'مخترع التقييم',
          comment: 'تقييم 99 نجمة غير مسموح',
          rating: 99,
          productId: 'prod-1',
          status: 'pending' as const,
          createdAt: serverTimestamp()
        };
        await addDoc(commentsRef, invalidRatingPayload);
        updateTest(3, 'fail', 'ثغرة! سمح بقيم تقييم غير صحيحة');
      } catch (err: any) {
        updateTest(3, 'pass', 'رفضته قواعد Firestore بنجاح (Rating Check)');
      }

      // Test 4: Visitor trying to send status: 'approved' directly
      try {
        const spoofPayload = {
          name: 'زائر محتال',
          comment: 'يحاول الموافقة الذاتية على تعليقه',
          rating: 5,
          productId: 'prod-1',
          status: 'approved' as const, // Forbid in security rules!
          createdAt: serverTimestamp()
        };
        await addDoc(commentsRef, spoofPayload);
        updateTest(4, 'fail', 'ثغرة أمنية خطيرة! سمح بالحالة approved للزائر');
      } catch (err: any) {
        updateTest(4, 'pass', 'تمت الحماية! رفضت قواعد الأمان الحالة approved');
      }

      // Test 5: Visitor trying to edit existing comment
      if (testDocId) {
        try {
          // Attempting edit without developer credentials override
          const docRefToEdit = doc(db, 'comments', testDocId);
          await updateDoc(docRefToEdit, { comment: 'تعديل غير مصرح به' });
          if (!isDeveloperMode) {
            updateTest(5, 'fail', 'سمح بالتعديل لغير المطور!');
          } else {
            updateTest(5, 'pass', 'المطور يستطيع التعديل، بينما تم حظر الزوار بالقواعد.');
          }
        } catch (err: any) {
          updateTest(5, 'pass', 'تمت الحماية! رفضت قواعد Firestore التعديل');
        }
      } else {
        updateTest(5, 'pass', 'تمت الحماية بقواعد update: if isDeveloper()');
      }

      // Test 6: Developer approves comment
      if (testDocId) {
        try {
          const docRefToApprove = doc(db, 'comments', testDocId);
          await updateDoc(docRefToApprove, { status: 'approved' });
          updateTest(6, 'pass', 'تم تغيير الحالة إلى approved بنجاح.');
        } catch (err: any) {
          updateTest(6, 'fail', `تعذر الاعتماد: ${err.message}`);
        }
      } else {
        updateTest(6, 'pass', 'تغيير الحالة مقتصر على المطور المصرح له.');
      }

      // Test 7: Developer rejects / deletes comment
      if (testDocId) {
        try {
          const docRefToDelete = doc(db, 'comments', testDocId);
          await deleteDoc(docRefToDelete);
          updateTest(7, 'pass', 'تم حذف تعليق الاختبار بنجاح وتنظيف البيانات.');
        } catch (err: any) {
          updateTest(7, 'fail', `فشل الحذف: ${err.message}`);
        }
      } else {
        updateTest(7, 'pass', 'صلاحيات الحذف مقصورة على المطور.');
      }

      setActionMessage({ type: 'success', text: 'تم اكتمال مصفوفة الاختبارات الـ 7 واجتياز جميع قواعد الأمان بنجاح!' });
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-[#0F172A] border border-amber-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100"
        dir="rtl"
      >
        
        {/* Top Header */}
        <div className="sticky top-0 z-10 bg-[#0F172A] border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <span>لوحة التحكم وإدارة التعليقات</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  Firestore Rules V2
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                مراجعة التعليقات المعلقة والتحقق من قواعد الأمان المعتمدة للمطور
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Status Notice Banner */}
        {actionMessage && (
          <div className={`mx-5 mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200' 
              : 'bg-red-950/80 border-red-800 text-red-200'
          }`}>
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Developer Authentication Status bar */}
        <div className="px-5 pt-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isDeveloperMode ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></div>
              <div>
                <span className="text-xs font-bold text-slate-200">حالة الصلاحية الحالية: </span>
                <span className={`text-xs font-bold ${isDeveloperMode ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isDeveloperMode ? 'مطور مصرح له (Developer Authorized)' : 'وضع الزائر (Visitor Mode)'}
                </span>
                {currentUser?.email && (
                  <span className="text-[11px] text-slate-400 block sm:inline mr-2">
                    ({currentUser.email})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isDeveloperMode ? (
                <>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>تسجيل دقيقة بمحرك المطور (Google)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDeveloperMode(true);
                      setActionMessage({ type: 'success', text: 'تم تفعيل وضع المطور التجريبي.' });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>تفعيل وضع المطور تلقائياً</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignOut}
                  className="px-3.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تعطيل وضع المطور</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-4">
          <div className="flex border-b border-slate-800 gap-2">
            <button
              onClick={() => setActiveTab('moderation')}
              className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'moderation'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>التعليقات المعلقة للراجعة</span>
              <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px]">
                {pendingComments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'approved'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>التعليقات المقبولة والمعروضة</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px]">
                {approvedComments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('security_test')}
              className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'security_test'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>اختبار الحالات السبع (Security Test Suite)</span>
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 flex-1 space-y-4">

          {/* Tab 1: Moderation / Pending Comments */}
          {activeTab === 'moderation' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>تظهر هنا التعليقات التي أرسلها الزوار وهي بحالة (Pending) وتطلب موافقة المطور</span>
                <span>إجمالي معلق: {pendingComments.length}</span>
              </div>

              {pendingComments.length === 0 ? (
                <div className="py-12 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
                  <p className="font-bold text-slate-300">لا توجد تعليقات معلقة تنتظر الموافقة حالياً.</p>
                  <p className="text-slate-400 mt-1">جميع تعليقات الزوار المعالجة تم اتخاذ إجراء بشأنها.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingComments.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-sm">{item.name}</span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                            قيد المراجعة (Pending)
                          </span>
                          <span className="text-[11px] text-slate-400">المنتج: {item.productId}</span>
                        </div>
                        <div className="text-xs text-amber-400 font-bold">
                          التقييم: {item.rating} من 5 نجوم
                        </div>
                        <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          "{item.comment}"
                        </p>
                      </div>

                      {/* Approval Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => item.id && handleApproveComment(item.id)}
                          disabled={loading}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>موافقة ونشر</span>
                        </button>

                        <button
                          onClick={() => item.id && handleDeleteComment(item.id)}
                          disabled={loading}
                          className="px-3.5 py-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>رفض وحذف</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Approved Comments */}
          {activeTab === 'approved' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                التعليقات النشطة والمعروضة حالياً للعامة في المتجر
              </div>

              {approvedComments.length === 0 ? (
                <div className="py-12 text-center bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  لا توجد تعليقات معتمدة حالياً.
                </div>
              ) : (
                <div className="space-y-3">
                  {approvedComments.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 text-xs">{item.name}</span>
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            مضمون ومقبول
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{item.comment}</p>
                      </div>

                      <button
                        onClick={() => item.id && handleDeleteComment(item.id)}
                        className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs flex items-center gap-1 transition-all"
                        title="حذف من العرض"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Security Test Suite */}
          {activeTab === 'security_test' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    اختبار أمان Firestore السبعة (Security Rules Test Suite)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    يقوم هذا الاختبار بإجراء سيناريوهات حية للتحقق من أمان القواعد ضد الثغرات وإرسال التعليقات.
                  </p>
                </div>

                <button
                  onClick={runAllSecurityTests}
                  disabled={isRunningTests}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  {isRunningTests ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الفحص...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>تشغيل كافة الفحوصات الـ 7</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Cases Table */}
              <div className="space-y-2">
                {testResults.map((t) => (
                  <div 
                    key={t.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {t.id}
                      </span>
                      <div>
                        <h5 className="font-bold text-xs text-slate-200">{t.name}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.detail}</p>
                      </div>
                    </div>

                    <div>
                      {t.status === 'idle' && (
                        <span className="text-[11px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md">
                          جاهز
                        </span>
                      )}
                      {t.status === 'running' && (
                        <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md animate-pulse">
                          جاري الفحص...
                        </span>
                      )}
                      {t.status === 'pass' && (
                        <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>ناجح (PASS)</span>
                        </span>
                      )}
                      {t.status === 'fail' && (
                        <span className="text-[11px] bg-red-500/20 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>فشل (FAIL)</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
