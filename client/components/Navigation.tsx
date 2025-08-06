import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Globe, 
  ShoppingBag, 
  Store, 
  Users, 
  TrendingUp,
  Star,
  Zap
} from 'lucide-react';

interface NavigationProps {
  language: 'ar' | 'en';
  onLanguageChange: (lang: 'ar' | 'en') => void;
}

export default function Navigation({ language, onLanguageChange }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isArabic = language === 'ar';
  
  const text = {
    ar: {
      home: 'الرئيسية',
      features: 'المميزات',
      pricing: 'الأسعار',
      about: 'من نحن',
      contact: 'تواصل معنا',
      login: 'تسجيل الدخول',
      signup: 'إنشاء حساب',
      startStore: 'ابدأ متجرك',
      platformName: 'منصة التجارة الذكية',
      forMerchants: 'للتجار',
      forCustomers: 'للعملاء',
      adminPanel: 'لوحة الإدارة'
    },
    en: {
      home: 'Home',
      features: 'Features',
      pricing: 'Pricing',
      about: 'About',
      contact: 'Contact',
      login: 'Login',
      signup: 'Sign Up',
      startStore: 'Start Your Store',
      platformName: 'Smart Commerce Platform',
      forMerchants: 'For Merchants',
      forCustomers: 'For Customers',
      adminPanel: 'Admin Panel'
    }
  };

  const currentText = text[language];

  return (
    <nav className={`bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="bg-gradient-to-r from-primary to-brand p-2 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gradient">
                {currentText.platformName}
              </h1>
              <Badge variant="secondary" className="text-xs">
                v2.0 <Zap className="h-3 w-3 ml-1" />
              </Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
            <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
              {currentText.home}
            </Link>
            <Link to="/features" className="text-gray-600 hover:text-primary transition-colors">
              {currentText.features}
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-primary transition-colors">
              {currentText.pricing}
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-primary transition-colors">
              {currentText.about}
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">
              {currentText.contact}
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center space-x-1 rtl:space-x-reverse"
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'ar' ? 'EN' : 'عر'}</span>
            </Button>

            {/* Quick Access Buttons */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Link to="/merchant/dashboard">
                <Button variant="outline" size="sm" className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Users className="h-4 w-4" />
                  <span>{currentText.forMerchants}</span>
                </Button>
              </Link>
              
              <Link to="/customer/dashboard">
                <Button variant="outline" size="sm" className="flex items-center space-x-1 rtl:space-x-reverse">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{currentText.forCustomers}</span>
                </Button>
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  {currentText.login}
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="btn-gradient">
                  <TrendingUp className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.startStore}
                </Button>
              </Link>

              {process.env.NODE_ENV === 'development' && (
                <Link to="/diagnostics">
                  <Button variant="outline" size="sm" className="bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100">
                    <Zap className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    تشخيص
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-600 hover:text-primary transition-colors">
                {currentText.home}
              </Link>
              <Link to="/features" className="text-gray-600 hover:text-primary transition-colors">
                {currentText.features}
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-primary transition-colors">
                {currentText.pricing}
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-primary transition-colors">
                {currentText.about}
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-primary transition-colors">
                {currentText.contact}
              </Link>
              
              <div className="pt-4 border-t flex flex-col space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
                  className="justify-start"
                >
                  <Globe className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {language === 'ar' ? 'English' : 'العربية'}
                </Button>
                
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    {currentText.login}
                  </Button>
                </Link>
                
                <Link to="/signup">
                  <Button className="w-full btn-gradient">
                    <Star className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {currentText.startStore}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
