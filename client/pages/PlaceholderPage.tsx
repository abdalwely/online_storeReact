import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Construction,
  MessageCircle,
  Lightbulb,
  Store,
  ShoppingBag,
  Shield,
  BarChart3,
  Users,
  Settings,
  CreditCard,
  Truck,
  Heart,
  MapPin,
  Star,
  Search,
  Grid3X3,
  Percent,
  FileText,
  HelpCircle,
  Mail,
  Phone,
  BookOpen,
  Briefcase,
  Lock,
  Eye,
  Package,
  ShoppingCart,
  Palette,
  UserPlus,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface PlaceholderPageProps {
  type: string;
}

export default function PlaceholderPage({ type }: PlaceholderPageProps) {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  
  const isArabic = language === 'ar';

  // Page configurations
  const pageConfigs: Record<string, {
    title: { ar: string; en: string };
    description: { ar: string; en: string };
    icon: React.ComponentType<any>;
    color: string;
    category: 'public' | 'merchant' | 'customer' | 'admin' | 'store';
    features?: { ar: string; en: string }[];
  }> = {
    // Public Pages
    features: {
      title: { ar: 'المميزات', en: 'Features' },
      description: { ar: 'اكتشف جميع مميزات منصة التجارة الذكية', en: 'Discover all Smart Commerce Platform features' },
      icon: Star,
      color: 'from-blue-500 to-purple-600',
      category: 'public',
      features: [
        { ar: 'نظام متعدد البائعين', en: 'Multi-vendor system' },
        { ar: 'تصميم قابل للتخصيص', en: 'Customizable design' },
        { ar: 'تحليلات متقدمة', en: 'Advanced analytics' },
        { ar: 'مدفوعات آمنة', en: 'Secure payments' }
      ]
    },
    pricing: {
      title: { ar: 'الأسعار', en: 'Pricing' },
      description: { ar: 'اختر الخطة المناسبة لعملك', en: 'Choose the right plan for your business' },
      icon: CreditCard,
      color: 'from-green-500 to-teal-600',
      category: 'public'
    },
    about: {
      title: { ar: 'من نحن', en: 'About Us' },
      description: { ar: 'تعرف على قصة منصة التجارة الذكية', en: 'Learn about Smart Commerce Platform story' },
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      category: 'public'
    },
    contact: {
      title: { ar: 'تواصل معنا', en: 'Contact Us' },
      description: { ar: 'نحن هنا لمساعدتك', en: 'We are here to help you' },
      icon: Mail,
      color: 'from-orange-500 to-red-600',
      category: 'public'
    },
    help: {
      title: { ar: 'مركز المساعدة', en: 'Help Center' },
      description: { ar: 'احصل على المساعدة والدعم', en: 'Get help and support' },
      icon: HelpCircle,
      color: 'from-indigo-500 to-blue-600',
      category: 'public'
    },
    docs: {
      title: { ar: 'الدليل التقني', en: 'Documentation' },
      description: { ar: 'دليل المطورين والتقنيين', en: 'Developer and technical guide' },
      icon: BookOpen,
      color: 'from-teal-500 to-cyan-600',
      category: 'public'
    },
    privacy: {
      title: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
      description: { ar: 'كيف نحمي بياناتك', en: 'How we protect your data' },
      icon: Lock,
      color: 'from-gray-500 to-gray-600',
      category: 'public'
    },
    terms: {
      title: { ar: 'الشروط والأحكام', en: 'Terms of Service' },
      description: { ar: 'شروط استخدام المنصة', en: 'Platform terms of use' },
      icon: FileText,
      color: 'from-gray-500 to-gray-600',
      category: 'public'
    },
    careers: {
      title: { ar: 'الوظائف', en: 'Careers' },
      description: { ar: 'انضم لفريق العمل', en: 'Join our team' },
      icon: Briefcase,
      color: 'from-emerald-500 to-green-600',
      category: 'public'
    },
    'forgot-password': {
      title: { ar: 'استعادة كلمة المرور', en: 'Forgot Password' },
      description: { ar: 'أعد تعيين كلمة المرور', en: 'Reset your password' },
      icon: Lock,
      color: 'from-yellow-500 to-orange-600',
      category: 'public'
    },
    'reset-password': {
      title: { ar: 'إعادة تعيين كلمة المرور', en: 'Reset Password' },
      description: { ar: 'أدخل كلمة المرور الجديدة', en: 'Enter your new password' },
      icon: Lock,
      color: 'from-yellow-500 to-orange-600',
      category: 'public'
    },

    // Merchant Dashboard
    'merchant-dashboard': {
      title: { ar: 'لوحة تحكم التاجر', en: 'Merchant Dashboard' },
      description: { ar: 'إدارة متجرك ومنتجاتك', en: 'Manage your store and products' },
      icon: Store,
      color: 'from-blue-500 to-purple-600',
      category: 'merchant'
    },
    'merchant-products': {
      title: { ar: 'إدارة المنتجات', en: 'Product Management' },
      description: { ar: 'أضف وعدّل منتجاتك', en: 'Add and edit your products' },
      icon: Package,
      color: 'from-green-500 to-teal-600',
      category: 'merchant'
    },
    'merchant-orders': {
      title: { ar: 'إدارة الطلبات', en: 'Order Management' },
      description: { ar: 'تتبع وإدارة طلبات العملاء', en: 'Track and manage customer orders' },
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-600',
      category: 'merchant'
    },
    'merchant-customers': {
      title: { ar: 'إدارة العملاء', en: 'Customer Management' },
      description: { ar: 'تفاعل مع عملائك', en: 'Interact with your customers' },
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      category: 'merchant'
    },
    'merchant-analytics': {
      title: { ar: 'التحليلات والتقارير', en: 'Analytics & Reports' },
      description: { ar: 'تحليل أداء متجرك', en: 'Analyze your store performance' },
      icon: BarChart3,
      color: 'from-indigo-500 to-blue-600',
      category: 'merchant'
    },
    'merchant-payments': {
      title: { ar: 'إدارة المدفوعات', en: 'Payment Management' },
      description: { ar: 'تتبع إيراداتك والمدفوعات', en: 'Track your revenue and payments' },
      icon: CreditCard,
      color: 'from-emerald-500 to-green-600',
      category: 'merchant'
    },
    'merchant-shipping': {
      title: { ar: 'إدارة الشحن', en: 'Shipping Management' },
      description: { ar: 'إعداد خيارات الشحن', en: 'Configure shipping options' },
      icon: Truck,
      color: 'from-cyan-500 to-teal-600',
      category: 'merchant'
    },
    'merchant-settings': {
      title: { ar: 'إعدادات المتجر', en: 'Store Settings' },
      description: { ar: 'تخصيص إعدادات متجرك', en: 'Customize your store settings' },
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      category: 'merchant'
    },
    'merchant-store-design': {
      title: { ar: 'تصميم المتجر', en: 'Store Design' },
      description: { ar: 'خصص تصميم متجرك', en: 'Customize your store design' },
      icon: Palette,
      color: 'from-pink-500 to-rose-600',
      category: 'merchant'
    },

    // Customer Dashboard
    'customer-dashboard': {
      title: { ar: 'لوحة تحكم العميل', en: 'Customer Dashboard' },
      description: { ar: 'تتبع طلباتك ومشترياتك', en: 'Track your orders and purchases' },
      icon: ShoppingBag,
      color: 'from-green-500 to-teal-600',
      category: 'customer'
    },
    'customer-orders': {
      title: { ar: 'طلباتي', en: 'My Orders' },
      description: { ar: 'تتبع حالة طلباتك', en: 'Track your order status' },
      icon: ShoppingCart,
      color: 'from-blue-500 to-purple-600',
      category: 'customer'
    },
    'customer-wishlist': {
      title: { ar: 'قائمة الأمنيات', en: 'Wishlist' },
      description: { ar: 'المنتجات المفضلة لديك', en: 'Your favorite products' },
      icon: Heart,
      color: 'from-red-500 to-pink-600',
      category: 'customer'
    },
    'customer-profile': {
      title: { ar: 'الملف الشخصي', en: 'Profile' },
      description: { ar: 'إدارة معلوماتك الشخصية', en: 'Manage your personal information' },
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      category: 'customer'
    },
    'customer-addresses': {
      title: { ar: 'العناوين', en: 'Addresses' },
      description: { ar: 'إدارة عناوين الشحن', en: 'Manage shipping addresses' },
      icon: MapPin,
      color: 'from-orange-500 to-red-600',
      category: 'customer'
    },
    'customer-loyalty': {
      title: { ar: 'برنامج الولاء', en: 'Loyalty Program' },
      description: { ar: 'نقاط المكافآت والعروض', en: 'Reward points and offers' },
      icon: Star,
      color: 'from-yellow-500 to-orange-600',
      category: 'customer'
    },

    // Admin Dashboard
    'admin-dashboard': {
      title: { ar: 'لوحة تحكم المشرف', en: 'Admin Dashboard' },
      description: { ar: 'إدارة المنصة والنظام', en: 'Manage platform and system' },
      icon: Shield,
      color: 'from-red-500 to-pink-600',
      category: 'admin'
    },
    'admin-merchants': {
      title: { ar: 'إدارة التجار', en: 'Merchant Management' },
      description: { ar: 'إدارة حسابات التجار', en: 'Manage merchant accounts' },
      icon: Store,
      color: 'from-blue-500 to-purple-600',
      category: 'admin'
    },
    'admin-customers': {
      title: { ar: 'إدارة العملاء', en: 'Customer Management' },
      description: { ar: 'إدارة حسابات العملاء', en: 'Manage customer accounts' },
      icon: Users,
      color: 'from-green-500 to-teal-600',
      category: 'admin'
    },
    'admin-stores': {
      title: { ar: 'إدارة المتاجر', en: 'Store Management' },
      description: { ar: 'مراقبة وإدارة المتاجر', en: 'Monitor and manage stores' },
      icon: Store,
      color: 'from-purple-500 to-pink-600',
      category: 'admin'
    },
    'admin-analytics': {
      title: { ar: 'تحليلات المنصة', en: 'Platform Analytics' },
      description: { ar: 'تحليل أداء المنصة العام', en: 'Analyze overall platform performance' },
      icon: BarChart3,
      color: 'from-indigo-500 to-blue-600',
      category: 'admin'
    },
    'admin-payments': {
      title: { ar: 'إدارة المدفوعات', en: 'Payment Management' },
      description: { ar: 'مراقبة المعاملات المالية', en: 'Monitor financial transactions' },
      icon: CreditCard,
      color: 'from-emerald-500 to-green-600',
      category: 'admin'
    },
    'admin-settings': {
      title: { ar: 'إعدادات النظام', en: 'System Settings' },
      description: { ar: 'إد��رة إعدادات المنصة', en: 'Manage platform settings' },
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      category: 'admin'
    },
    'admin-reports': {
      title: { ar: 'التقارير', en: 'Reports' },
      description: { ar: 'تقارير مفصلة عن النشاط', en: 'Detailed activity reports' },
      icon: FileText,
      color: 'from-teal-500 to-cyan-600',
      category: 'admin'
    },
    'admin-subscriptions': {
      title: { ar: 'إدارة الاشتراكات', en: 'Subscription Management' },
      description: { ar: 'إدارة خطط الاشتراك', en: 'Manage subscription plans' },
      icon: CreditCard,
      color: 'from-orange-500 to-red-600',
      category: 'admin'
    },

    // Store Pages
    'store-front': {
      title: { ar: 'واجهة المتجر', en: 'Store Front' },
      description: { ar: 'الصفحة الرئيسية للمتجر', en: 'Store homepage' },
      icon: Store,
      color: 'from-blue-500 to-purple-600',
      category: 'store'
    },
    'store-product': {
      title: { ar: 'صفحة المنتج', en: 'Product Page' },
      description: { ar: 'تفاصيل المنتج', en: 'Product details' },
      icon: Package,
      color: 'from-green-500 to-teal-600',
      category: 'store'
    },
    'store-category': {
      title: { ar: 'صفحة الفئة', en: 'Category Page' },
      description: { ar: 'منتجات الفئة', en: 'Category products' },
      icon: Grid3X3,
      color: 'from-purple-500 to-pink-600',
      category: 'store'
    },
    'store-cart': {
      title: { ar: 'سلة التسوق', en: 'Shopping Cart' },
      description: { ar: 'مراجعة المنتجات المختارة', en: 'Review selected products' },
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-600',
      category: 'store'
    },
    'store-checkout': {
      title: { ar: 'إتمام الطلب', en: 'Checkout' },
      description: { ar: 'إكمال عملية الشراء', en: 'Complete purchase process' },
      icon: CreditCard,
      color: 'from-emerald-500 to-green-600',
      category: 'store'
    },

    // Marketplace
    marketplace: {
      title: { ar: 'السوق العام', en: 'Marketplace' },
      description: { ar: 'تصفح جميع المتاجر والمنتجات', en: 'Browse all stores and products' },
      icon: Store,
      color: 'from-indigo-500 to-blue-600',
      category: 'public'
    },
    'marketplace-search': {
      title: { ar: 'البحث في السوق', en: 'Marketplace Search' },
      description: { ar: 'ابحث عن المنتجات', en: 'Search for products' },
      icon: Search,
      color: 'from-teal-500 to-cyan-600',
      category: 'public'
    },
    'marketplace-categories': {
      title: { ar: 'فئات السوق', en: 'Marketplace Categories' },
      description: { ar: 'تصفح حسب الفئات', en: 'Browse by categories' },
      icon: Grid3X3,
      color: 'from-purple-500 to-pink-600',
      category: 'public'
    },
    'marketplace-deals': {
      title: { ar: 'العروض والخصومات', en: 'Deals & Offers' },
      description: { ar: 'أفضل العروض المتاحة', en: 'Best available deals' },
      icon: Percent,
      color: 'from-red-500 to-pink-600',
      category: 'public'
    }
  };

  const config = pageConfigs[type] || {
    title: { ar: 'صفحة غير موجودة', en: 'Page Not Found' },
    description: { ar: 'هذه الصفحة غير متوفرة حالياً', en: 'This page is not available' },
    icon: Construction,
    color: 'from-gray-500 to-gray-600',
    category: 'public' as const
  };

  const currentTitle = config.title[language];
  const currentDescription = config.description[language];
  const IconComponent = config.icon;

  const text = {
    ar: {
      comingSoon: 'قريباً',
      inDevelopment: 'هذه الصفحة قيد التطوير',
      helpUs: 'ساعدنا في تطويرها',
      suggestFeature: 'اقتراح ميزة',
      backHome: 'العودة للرئيسية',
      needHelp: 'تحتاج مساعدة؟',
      contactSupport: 'تواصل مع الدعم',
      keyFeatures: 'المميزات الرئيسية',
      platformName: 'منصة التجارة الذكية'
    },
    en: {
      comingSoon: 'Coming Soon',
      inDevelopment: 'This page is under development',
      helpUs: 'Help us develop it',
      suggestFeature: 'Suggest a Feature',
      backHome: 'Back to Home',
      needHelp: 'Need Help?',
      contactSupport: 'Contact Support',
      keyFeatures: 'Key Features',
      platformName: 'Smart Commerce Platform'
    }
  };

  const currentText = text[language];

  const shouldShowNavigation = config.category === 'public';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isArabic ? 'rtl' : 'ltr'}`}>
      {shouldShowNavigation && <Navigation language={language} onLanguageChange={setLanguage} />}
      
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-2xl">
          <Card className="card-shadow">
            <CardHeader className="text-center pb-8">
              <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center mb-6`}>
                <IconComponent className="h-12 w-12 text-white" />
              </div>
              
              <Badge className="mb-4 bg-gradient-to-r from-primary to-brand text-white">
                <Construction className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {currentText.comingSoon}
              </Badge>
              
              <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                {currentTitle}
              </CardTitle>
              
              <CardDescription className="text-lg text-gray-600 mb-6">
                {currentDescription}
              </CardDescription>
              
              <p className="text-gray-500">
                {currentText.inDevelopment}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {config.features && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center">
                    <Star className="h-5 w-5 text-primary mr-2 rtl:ml-2 rtl:mr-0" />
                    {currentText.keyFeatures}
                  </h3>
                  <ul className="space-y-3">
                    {config.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature[language]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link to="/" className="flex-1">
                  <Button className="w-full" variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {currentText.backHome}
                  </Button>
                </Link>
                
                <Button className="flex-1 btn-gradient">
                  <MessageCircle className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.suggestFeature}
                </Button>
              </div>
              
              <div className="border-t pt-6 flex items-center justify-center">
                <div className="flex items-center space-x-4 rtl:space-x-reverse text-gray-500">
                  <Lightbulb className="h-5 w-5" />
                  <span>{currentText.helpUs}</span>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    {currentText.contactSupport}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
