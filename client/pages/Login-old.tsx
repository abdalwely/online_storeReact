import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { signInUserEnhanced } from '@/lib/auth-enhanced';
import { testFirebaseConnection } from '@/lib/firebase-diagnostics';
import { signInUserDev } from '@/lib/auth-dev';
import { showAvailableCredentials } from '@/lib/fallback-auth\';-auth\';;k-auth\';/lib/fallback-auth';
import { 
  Store, 
  ShoppingBag, 
  Shield, 
  Mail, 
  Lock, 
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Loader2
} from 'lucide-react';

export default function Login() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('merchant');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isArabic = language === 'ar';

  const text = {
    ar: {
      title: 'تسجيل الدخول',
      subtitle: 'مرحباً بك مرة أخرى',
      description: 'سجل دخولك للوصول إلى لوحة التحكل الخاصة بك',
      merchant: 'تاجر',
      customer: 'عميل', 
      admin: 'مشرف',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      login: 'تسجيل الدخول',
      signingIn: 'جاري تسجيل الدخول...',
      forgotPassword: 'نسيت كلمة المرور؟',
      noAccount: 'ليس لديك ��ساب؟',
      signUp: 'إنشاء حساب',
      merchantDesc: 'للتجار وأصحاب المتاجر',
      customerDesc: 'للعملاء والمشترين',
      adminDesc: 'للمشرفين والمديرين',
      emailPlaceholder: 'أدخل بريدك الإلكتروني',
      passwordPlaceholder: 'أدخل كلمة المرور',
      rememberMe: 'تذكرني',
      or: 'أو',
      continueWith: 'المتابعة باستخدام',
      google: 'جوجل',
      apple: 'آبل',
      platformName: 'منصة التجارة الذكية',
      success: 'تم تسجيل ��لدخول بنجاح!',
      redirecting: 'جاري التوجيه...',
      errorTitle: 'خطأ في تسجيل الدخول',
      invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      userNotFound: 'المستخدم غير موجود',
      wrongPassword: 'كلمة المرور غير صحيحة',
      tooManyRequests: 'تم إيقاف الحساب مؤقتاً بسبب محاولات كثيرة',
      unexpectedError: 'حدث خطأ غير متوقع'
    },
    en: {
      title: 'Sign In',
      subtitle: 'Welcome Back',
      description: 'Sign in to access your dashboard',
      merchant: 'Merchant',
      customer: 'Customer',
      admin: 'Admin',
      email: 'Email',
      password: 'Password',
      login: 'Sign In',
      signingIn: 'Signing In...',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
      merchantDesc: 'For merchants and store owners',
      customerDesc: 'For customers and buyers',
      adminDesc: 'For administrators and managers',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      rememberMe: 'Remember me',
      or: 'Or',
      continueWith: 'Continue with',
      google: 'Google',
      apple: 'Apple',
      platformName: 'Smart Commerce Platform',
      success: 'Signed in successfully!',
      redirecting: 'Redirecting...',
      errorTitle: 'Sign In Error',
      invalidCredentials: 'Invalid email or password',
      userNotFound: 'User not found',
      wrongPassword: 'Wrong password',
      tooManyRequests: 'Account temporarily locked due to too many attempts',
      unexpectedError: 'An unexpected error occurred'
    }
  };

  const currentText = text[language];

  const userTypes = [
    {
      id: 'merchant',
      label: currentText.merchant,
      description: currentText.merchantDesc,
      icon: Store,
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'customer',
      label: currentText.customer,
      description: currentText.customerDesc,
      icon: ShoppingBag,
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 'admin',
      label: currentText.admin,
      description: currentText.adminDesc,
      icon: Shield,
      color: 'from-red-500 to-pink-600'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🚀 Starting login process...');

      // Check if Firebase is disabled (development mode)
      const isFirebaseDisabled = process.env.NODE_ENV === 'development' ||
                                (typeof window !== 'undefined' && (window as any).__FIREBASE_DISABLED__);

      let result;

      if (isFirebaseDisabled) {
        console.log('🔧 Using development auth');
        // Use development auth directly
        try {
          const devResult = await signInUserDev(formData.email, formData.password);
          result = {
            success: true,
            user: devResult
          };
        } catch (devError: any) {
          result = {
            success: false,
            error: devError.message || 'Invalid credentials (development mode)'
          };
        }
      } else {
        // Test Firebase connection first
        const connectionTest = await testFirebaseConnection();
        console.log('🔍 Firebase connection test:', connectionTest);

        // Use enhanced sign in
        result = await signInUserEnhanced(formData.email, formData.password);
      }

      if (result.success && result.user) {
        console.log('✅ Login successful');
        toast({
          title: currentText.success,
          description: currentText.redirecting,
        });

        // Get redirect path from location state or default based on user type
        const from = location.state?.from?.pathname || `/${activeTab}/dashboard`;

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500); // Reduced delay for better UX
      } else {
        console.error('❌ Login failed:', result.error);
        console.log('🔍 Diagnostics:', result.diagnostics);

        let detailedError = result.error || currentText.unexpectedError;

        // If we have diagnostics, provide more helpful information
        if (result.diagnostics) {
          if (!result.diagnostics.authConnected) {
            detailedError += '\n\n🔧 تفاصيل الخطأ:\n';
            if (result.diagnostics.suggestion) {
              detailedError += result.diagnostics.suggestion;
            }
            detailedError += '\n\n💡 حلول مقترحة:\n';
            detailedError += '• تحقق من اتصالك بالإنترنت\n';
            detailedError += '• أعد تحميل الصفحة\n';
            detailedError += '• تأكد من صحة إعدادات Firebase';
          }
        }

        toast({
          title: currentText.errorTitle,
          description: detailedError,
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('❌ Unexpected login error:', error);

      let errorMessage = currentText.unexpectedError;

      // Handle network-specific errors
      if (error.message && error.message.includes('network')) {
        errorMessage = 'فشل الاتصال بالشبكة. يرجى التح��ق من الاتصال بالإنترنت والمحاولة مرة أخرى.';
      } else if (error.code) {
        switch (error.code) {
          case 'auth/network-request-failed':
            errorMessage = 'فشل الاتصال بالشبكة. يرجى التحقق من الاتصال بالإنترنت.';
            break;
          case 'auth/user-not-found':
            errorMessage = currentText.userNotFound;
            break;
          case 'auth/wrong-password':
            errorMessage = currentText.wrongPassword;
            break;
          case 'auth/invalid-credential':
            errorMessage = currentText.invalidCredentials;
            break;
          case 'auth/too-many-requests':
            errorMessage = currentText.tooManyRequests;
            break;
        }
      }

      toast({
        title: currentText.errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 rtl:space-x-reverse mb-6">
            <div className="bg-gradient-to-r from-primary to-brand p-2 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">{currentText.platformName}</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentText.title}</h1>
          <p className="text-gray-600">{currentText.description}</p>
          
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="mt-4 flex items-center space-x-1 rtl:space-x-reverse mx-auto"
          >
            <Globe className="h-4 w-4" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </Button>
        </div>

        <Card className="card-shadow">
          <CardHeader className="space-y-4">
            <div className="text-center">
              <CardTitle className="text-2xl">{currentText.subtitle}</CardTitle>
              <CardDescription>{currentText.description}</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                {userTypes.map((type) => (
                  <TabsTrigger key={type.id} value={type.id} className="flex flex-col items-center space-y-1 p-3">
                    <type.icon className="h-4 w-4" />
                    <span className="text-xs">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {userTypes.map((type) => (
                <TabsContent key={type.id} value={type.id}>
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center mb-3`}>
                      <type.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">{type.label}</h3>
                    <p className="text-gray-600 text-sm">{type.description}</p>
                  </div>

                  {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">🔧 Development Mode</h4>
                      <p className="text-xs text-blue-700 mb-2">Quick login credentials:</p>
                      <div className="space-y-1 text-xs text-blue-600">
                        <div><strong>Admin:</strong> admin@ecommerce-platform.com / AdminPlatform2024!</div>
                        <div><strong>Merchant:</strong> merchant@test.com / merchant123</div>
                        <div><strong>Customer:</strong> customer@test.com / customer123</div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{currentText.email}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={currentText.emailPlaceholder}
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 rtl:pr-10 rtl:pl-3"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">{currentText.password}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={currentText.passwordPlaceholder}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 rtl:pr-10 rtl:pl-10"
                          required
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 rtl:left-2 rtl:right-auto top-2 h-6 w-6 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <input type="checkbox" id="remember" className="rounded" disabled={loading} />
                        <Label htmlFor="remember" className="text-sm">{currentText.rememberMe}</Label>
                      </div>
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        {currentText.forgotPassword}
                      </Link>
                    </div>

                    <Button type="submit" className="w-full btn-gradient" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                          {currentText.signingIn}
                        </>
                      ) : (
                        <>
                          {currentText.login}
                          <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">{currentText.or}</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Button variant="outline" className="w-full" disabled={loading}>
                        <svg className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {currentText.google}
                      </Button>
                      <Button variant="outline" className="w-full" disabled={loading}>
                        <svg className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        {currentText.apple}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      {currentText.noAccount}{' '}
                      <Link to="/signup" className="text-primary font-medium hover:underline">
                        {currentText.signUp}
                      </Link>
                    </p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
