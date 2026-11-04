import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'حذاء رياضي كلاسيكي إير جوردان',
    description: 'حذاء رياضي مريح وخفيف الوزن مصمم للأنشطة اليومية والرياضية ببطانة طبية مريحة.',
    price: 1250,
    originalPrice: 1600,
    category: 'أحذية',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    stock: 15,
    rating: 4.8,
    reviewCount: 12,
    badge: 'الأكثر مبيعاً'
  },
  {
    id: 'prod-2',
    name: 'قميص قطني فاخر بأكمام طويلة',
    description: 'قميص رجالي مصنوع من القطن الصافي 100% بتصميم عصري يناسب المناسبات الرسمية واليومية.',
    price: 650,
    originalPrice: 850,
    category: 'ملابس',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    stock: 25,
    rating: 4.6,
    reviewCount: 8,
    badge: 'خصم 25%'
  },
  {
    id: 'prod-3',
    name: 'ساعة يد ذكية مقاومة للماء Pro',
    description: 'ساعة ذكية بشاشة AMOLED تدعم تتبع الأنشطة الرياضية وقياس نبضات القلب ونسبة الأكسجين.',
    price: 2100,
    originalPrice: 2800,
    category: 'إلكترونيات',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    stock: 10,
    rating: 4.9,
    reviewCount: 24,
    badge: 'جديد'
  },
  {
    id: 'prod-4',
    name: 'حقيبة ظهر جلدية للمحمول والأعمال',
    description: 'حقيبة متعددة الجيوب ومقاومة للماء تتسع لأجهزة اللابتوب حتى 15.6 بوصة بتصميم فخم.',
    price: 890,
    originalPrice: 1100,
    category: 'إكسسوارات',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    stock: 18,
    rating: 4.7,
    reviewCount: 15
  },
  {
    id: 'prod-5',
    name: 'جاكيت شتوي مبطن مقاوم للرياح',
    description: 'جاكيت دافئ مع غطاء رأس قابل للفصل، متين ومقاوم للمطر والبرودة الشديدة.',
    price: 1450,
    originalPrice: 1900,
    category: 'ملابس',
    imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=80',
    stock: 8,
    rating: 4.5,
    reviewCount: 6,
    badge: 'عرض الشتاء'
  },
  {
    id: 'prod-6',
    name: 'سماعات رأس لاسلكية بنقاء صوت عالي',
    description: 'سماعات عازلة للضوضاء بخاصية التوصيل السريع وبطارية تدوم حتى 30 ساعة تشغيل متواصل.',
    price: 1750,
    originalPrice: 2200,
    category: 'إلكترونيات',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    stock: 14,
    rating: 4.9,
    reviewCount: 31
  }
];

export const CATEGORIES = ['الكل', 'أحذية', 'ملابس', 'إلكترونيات', 'إكسسوارات'];
