import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Store, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  CreditCard,
  Truck,
  BarChart3,
  Heart,
  Gift,
  ShoppingBag,
  Smartphone,
  CheckCircle,
  Star,
  Eye,
  MessageCircle,
  Play,
  Sparkles,
  Target,
  Award,
  Banknote
} from 'lucide-react';

export default function Index() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  
  const isArabic = language === 'ar';

  const text = {
    ar: {
      // Hero Section
      heroTitle: 'منصة التجارة الإلكترونية الذكية',
      heroSubtitle: 'نظام متكامل متعدد البائعين',
      heroDescription: 'أنشئ متجرك الإلكتروني الاحترافي في دقائق، مع إدارة شاملة للمنتجات والطلبات والمدفوعات والشحن. منصة واحدة تضم آلاف المتاجر مع تحكم كامل وخصوصية تامة لكل تاجر.',
      startJourney: 'ابدأ رحلتك التجارية',
      browseStores: 'تصفح المتاجر كعميل',
      watchDemo: 'شاهد العرض التوضيحي',
      trustedBy: 'يثق بنا أكثر من',
      activeMerchants: 'تاجر نشط',
      
      // Features Section
      featuresTitle: 'مميزات تقنية متطورة',
      featuresSubtitle: 'كل ما تحتاجه لإدارة تجارتك الإلكترونية بنجاح',
      
      multiVendor: 'متعدد البائعين',
      multiVendorDesc: 'كل تاجر له متجر مستقل بالكامل مع إدارة منفصلة للمنتجات والعملاء والطلبات',
      
      smartDesign: 'تصميم ذكي قابل للتخصيص',
      smartDesignDesc: 'خصص متجرك بالكامل: الألوان، الخطوط، الشعار، والتخطيط دون معرفة برمجية',
      
      analytics: 'تحليلات ذكية',
      analyticsDesc: 'تقارير مفصلة عن المبيعات والعملاء والمنتجات مع رؤى تحليلية متقدمة',
      
      payments: 'مدفوعات آمنة',
      paymentsDesc: 'تكامل مع جميع بوابات الدفع المحلية والعالمية مع أعلى معايير الأمان',
      
      shipping: 'شحن ذكي',
      shippingDesc: 'إدارة الشحن مع شركاء الشحن المحليين والعالميين وتتبع الطلبات فوري',
      
      loyalty: 'برنامج الولاء',
      loyaltyDesc: 'نظام نقاط مكافآت متقدم لزيادة ولاء العملاء وتكرار الشراء',
      
      affiliate: 'التسويق بالعمولة',
      affiliateDesc: 'نظام تسويق تابع شامل لزيادة المبيعات عبر المسوقين والشركاء',
      
      mobile: 'تطبيق جوال',
      mobileDesc: 'تطبيق جوال احترافي لنظامي iOS و Android مع تجربة سلسة',
      
      // Pricing Section
      pricingTitle: 'خطط مرنة تناسب جميع الأحجام',
      pricingSubtitle: 'ابدأ مجاناً ونمّ مع نمو أعمالك',
      
      freePlan: 'الخطة المجانية',
      freePrice: 'مجاناً',
      freeDesc: 'مثالية للمبتدئين',
      
      proPlan: 'الخطة الاحترافية',
      proPrice: '99 ريال/شهر',
      proDesc: 'للأعمال المتنامية',
      
      enterprisePlan: 'خطة الشركات',
      enterprisePrice: 'حسب الطلب',
      enterpriseDesc: 'للشركات الكبيرة',
      
      // CTA Section
      ctaTitle: 'ابدأ متجرك الإلكتروني اليوم',
      ctaDescription: 'انضم إلى آلاف التجار الناجحين وا��صل على متجرك الاحترافي في دقائق',
      getStarted: 'ابدأ الآن مجاناً',
      
      // User Types
      merchantsTitle: 'للتجار',
      customersTitle: 'للعملاء',
      adminTitle: 'للمشرفين',
      
      // Stats
      stores: 'متجر',
      orders: 'طلب',
      revenue: 'مليون ريال حجم تداول'
    },
    en: {
      // Hero Section
      heroTitle: 'Smart E-Commerce Platform',
      heroSubtitle: 'Integrated Multi-Vendor System',
      heroDescription: 'Create your professional online store in minutes with comprehensive management for products, orders, payments, and shipping. One platform hosting thousands of stores with complete control and privacy for each merchant.',
      startJourney: 'Start Your Journey',
      browseStores: 'Browse Stores as Customer',
      watchDemo: 'Watch Demo',
      trustedBy: 'Trusted by over',
      activeMerchants: 'active merchants',
      
      // Features Section
      featuresTitle: 'Advanced Technical Features',
      featuresSubtitle: 'Everything you need to successfully manage your e-commerce business',
      
      multiVendor: 'Multi-Vendor',
      multiVendorDesc: 'Each merchant has a completely independent store with separate management for products, customers, and orders',
      
      smartDesign: 'Smart Customizable Design',
      smartDesignDesc: 'Fully customize your store: colors, fonts, logo, and layout without programming knowledge',
      
      analytics: 'Smart Analytics',
      analyticsDesc: 'Detailed reports on sales, customers, and products with advanced analytical insights',
      
      payments: 'Secure Payments',
      paymentsDesc: 'Integration with all local and global payment gateways with highest security standards',
      
      shipping: 'Smart Shipping',
      shippingDesc: 'Shipping management with local and global shipping partners and real-time order tracking',
      
      loyalty: 'Loyalty Program',
      loyaltyDesc: 'Advanced rewards points system to increase customer loyalty and repeat purchases',
      
      affiliate: 'Affiliate Marketing',
      affiliateDesc: 'Comprehensive affiliate marketing system to increase sales through marketers and partners',
      
      mobile: 'Mobile App',
      mobileDesc: 'Professional mobile app for iOS and Android with seamless experience',
      
      // Pricing Section
      pricingTitle: 'Flexible Plans for All Sizes',
      pricingSubtitle: 'Start free and grow as your business grows',
      
      freePlan: 'Free Plan',
      freePrice: 'Free',
      freeDesc: 'Perfect for beginners',
      
      proPlan: 'Professional Plan',
      proPrice: '$29/month',
      proDesc: 'For growing businesses',
      
      enterprisePlan: 'Enterprise Plan',
      enterprisePrice: 'Custom',
      enterpriseDesc: 'For large companies',
      
      // CTA Section
      ctaTitle: 'Start Your Online Store Today',
      ctaDescription: 'Join thousands of successful merchants and get your professional store in minutes',
      getStarted: 'Get Started Free',
      
      // User Types
      merchantsTitle: 'For Merchants',
      customersTitle: 'For Customers',
      adminTitle: 'For Admins',
      
      // Stats
      stores: 'stores',
      orders: 'orders',
      revenue: 'million in revenue'
    }
  };

  const currentText = text[language];

  const features = [
    {
      icon: Store,
      title: currentText.multiVendor,
      description: currentText.multiVendorDesc,
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: Sparkles,
      title: currentText.smartDesign,
      description: currentText.smartDesignDesc,
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: BarChart3,
      title: currentText.analytics,
      description: currentText.analyticsDesc,
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: CreditCard,
      title: currentText.payments,
      description: currentText.paymentsDesc,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: Truck,
      title: currentText.shipping,
      description: currentText.shippingDesc,
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: Heart,
      title: currentText.loyalty,
      description: currentText.loyaltyDesc,
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: Target,
      title: currentText.affiliate,
      description: currentText.affiliateDesc,
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: Smartphone,
      title: currentText.mobile,
      description: currentText.mobileDesc,
      color: 'from-teal-500 to-cyan-600'
    }
  ];

  const stats = [
    { number: '10,000+', label: currentText.stores, icon: Store },
    { number: '500K+', label: currentText.orders, icon: ShoppingBag },
    { number: '50+', label: currentText.revenue, icon: Banknote },
    { number: '25,000+', label: currentText.activeMerchants, icon: Users }
  ];

  const pricingPlans = [
    {
      name: currentText.freePlan,
      price: currentText.freePrice,
      description: currentText.freeDesc,
      features: [
        isArabic ? 'حتى 10 منتجات' : 'Up to 10 products',
        isArabic ? 'متجر فرعي مجاني' : 'Free subdomain',
        isArabic ? 'دعم أساسي' : 'Basic support',
        isArabic ? 'تحليلات أساسية' : 'Basic analytics'
      ],
      popular: false
    },
    {
      name: currentText.proPlan,
      price: currentText.proPrice,
      description: currentText.proDesc,
      features: [
        isArabic ? 'منتجات غير محدودة' : 'Unlimited products',
        isArabic ? 'دومين مخصص' : 'Custom domain',
        isArabic ? 'دعم متقدم' : 'Priority support',
        isArabic ? 'تحليلات متقدمة' : 'Advanced analytics',
        isArabic ? 'برنامج الولاء' : 'Loyalty program',
        isArabic ? 'تكامل كامل للشحن' : 'Full shipping integration'
      ],
      popular: true
    },
    {
      name: currentText.enterprisePlan,
      price: currentText.enterprisePrice,
      description: currentText.enterpriseDesc,
      features: [
        isArabic ? 'كل مميزات Pro' : 'All Pro features',
        isArabic ? 'API مخصص' : 'Custom API',
        isArabic ? 'دعم مخصص' : 'Dedicated support',
        isArabic ? 'تدريب متقدم' : 'Advanced training',
        isArabic ? 'تخصيص كامل' : 'Full customization'
      ],
      popular: false
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isArabic ? 'rtl' : 'ltr'}`}>
      <Navigation language={language} onLanguageChange={setLanguage} />
      
      {/* Hero Section */}
      <section className="pt-20 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-brand/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-primary to-brand text-white">
              <Zap className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {isArabic ? 'الجيل الجديد من منصات التجارة الإلكترونية' : 'Next Generation E-Commerce Platform'}
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="text-gradient">{currentText.heroTitle}</span>
              <br />
              <span className="text-3xl md:text-4xl text-gray-600">{currentText.heroSubtitle}</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              {currentText.heroDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="btn-gradient text-lg px-8 py-6">
                  <TrendingUp className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.startJourney}
                  <ArrowRight className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </Link>

              <Link to="/customer/stores">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-blue-50 hover:bg-blue-100 border-blue-200">
                  <ShoppingBag className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.browseStores}
                  <ArrowRight className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" />
                </Button>
              </Link>

              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Play className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {currentText.watchDemo}
              </Button>
            </div>
            
            <div className="mt-16">
              <p className="text-gray-500 mb-4">{currentText.trustedBy}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <stat.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {currentText.featuresTitle}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {currentText.featuresSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-shadow hover:shadow-xl transition-all duration-300 border-0 group">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {currentText.pricingTitle}
            </h2>
            <p className="text-xl text-gray-600">
              {currentText.pricingSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`card-shadow hover:shadow-xl transition-all duration-300 ${plan.popular ? 'ring-2 ring-primary scale-105' : ''}`}>
                <CardHeader className="text-center">
                  {plan.popular && (
                    <Badge className="mb-4 bg-gradient-to-r from-primary to-brand text-white">
                      <Star className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                      {isArabic ? 'الأكثر شعبية' : 'Most Popular'}
                    </Badge>
                  )}
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary my-4">{plan.price}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 rtl:ml-3 rtl:mr-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.popular ? 'btn-gradient' : 'border-primary text-primary hover:bg-primary hover:text-white'}`} variant={plan.popular ? 'default' : 'outline'}>
                    {currentText.getStarted}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-brand text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">
            {currentText.ctaTitle}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {currentText.ctaDescription}
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-primary hover:bg-gray-100">
              <Award className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
              {currentText.getStarted}
              <ArrowRight className="h-5 w-5 ml-2 rtl:mr-2 rtl:ml-0" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <div className="bg-gradient-to-r from-primary to-brand p-2 rounded-lg">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">{currentText.heroTitle}</span>
              </div>
              <p className="text-gray-400">
                {isArabic ? 'منصة التجارة الإلكترونية الرائدة في المنطقة' : 'Leading e-commerce platform in the region'}
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">{isArabic ? 'المنصة' : 'Platform'}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white transition-colors">{currentText.features}</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">{currentText.pricing}</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">{currentText.about}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">{isArabic ? 'الدعم' : 'Support'}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">{isArabic ? 'مركز المساعدة' : 'Help Center'}</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">{currentText.contact}</Link></li>
                <li><Link to="/docs" className="hover:text-white transition-colors">{isArabic ? 'الدليل التقني' : 'Documentation'}</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">{isArabic ? 'الشركة' : 'Company'}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">{isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">{isArabic ? 'الشروط والأحكام' : 'Terms of Service'}</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">{isArabic ? 'الوظائف' : 'Careers'}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {currentText.heroTitle}. {isArabic ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
