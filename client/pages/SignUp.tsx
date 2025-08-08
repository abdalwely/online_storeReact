import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createAccountEnhanced } from '@/lib/auth-enhanced';
import { enhancedStoreTemplates } from '@/lib/enhanced-templates';
import { submitStoreApplication } from '@/lib/firebase-store-approval';
import { 
  Store, 
  ShoppingBag, 
  Shield, 
  Mail, 
  Lock, 
  User,
  Phone,
  MapPin,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Palette,
  Layout,
  Sparkles
} from 'lucide-react';

export default function SignUp() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('merchant');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // For merchants: 1=info, 2=template, 3=customization
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customization, setCustomization] = useState({
    colors: {
      primary: '#FF6B35',
      secondary: '#4A90E2',
      background: '#FFFFFF'
    },
    storeName: '',
    storeDescription: ''
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    businessName: '',
    businessType: ''
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const text = {
    ar: {
      title: 'إنشاء حساب جديد',
      subtitle: 'انضم إلينا اليوم',
      description: 'أنشئ حسابك للبدء في رحلة التجارة الإلكترونية',
      merchant: 'تاجر',
      customer: 'عميل',
      admin: 'مشرف',
      firstName: 'الاسم الأول',
      lastName: 'الاسم الأخير',
      email: 'البريد الإلكتروني',
      phone: 'رقم الجوال',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      city: 'المدينة',
      businessName: 'اسم النشاط التجاري',
      businessType: 'نوع النشاط',
      createAccount: 'إنشاء الحساب',
      creating: 'جاري الإنشاء...',
      haveAccount: 'لديك حساب بالفعل؟',
      signIn: 'تسجيل الدخول',
      merchantDesc: 'للتجار وأصحاب المتاجر',
      customerDesc: 'للعملاء والمشترين',
      adminDesc: 'للمشرفين والمديرين',
      stepInfo: 'المعلومات الأساسية',
      stepTemplate: 'اختيار القالب',
      stepCustomization: 'التخصيص',
      selectTemplate: 'اختر قالب متجرك',
      customizeStore: 'خصص متجرك',
      primaryColor: 'اللون الأساسي',
      secondaryColor: 'اللون الثانوي',
      backgroundColor: 'ل��ن الخلفية',
      storeNameLabel: 'اسم المتجر',
      storeDescLabel: 'وصف المتجر',
      next: 'التالي',
      previous: 'السابق',
      submit: 'إرسال للموافقة',
      pending: 'في انتظار الموافقة',
      success: 'تم إنشاء الحساب بنجاح!',
      pendingMessage: 'تم إرسال طلبك للمراجعة. ستتلقى إشعار عند الموافقة.',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      selectTemplateFirst: 'يرجى اختيار قالب أولاً',
      allFieldsRequired: 'جميع الحقول مطلوبة'
    },
    en: {
      title: 'Create New Account',
      subtitle: 'Join us today',
      description: 'Create your account to start your e-commerce journey',
      merchant: 'Merchant',
      customer: 'Customer',
      admin: 'Admin',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      city: 'City',
      businessName: 'Business Name',
      businessType: 'Business Type',
      createAccount: 'Create Account',
      creating: 'Creating...',
      haveAccount: 'Already have an account?',
      signIn: 'Sign In',
      merchantDesc: 'For merchants and store owners',
      customerDesc: 'For customers and buyers',
      adminDesc: 'For administrators and managers',
      stepInfo: 'Basic Information',
      stepTemplate: 'Template Selection',
      stepCustomization: 'Customization',
      selectTemplate: 'Choose your store template',
      customizeStore: 'Customize your store',
      primaryColor: 'Primary Color',
      secondaryColor: 'Secondary Color',
      backgroundColor: 'Background Color',
      storeNameLabel: 'Store Name',
      storeDescLabel: 'Store Description',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit for Approval',
      pending: 'Pending Approval',
      success: 'Account created successfully!',
      pendingMessage: 'Your request has been sent for review. You will be notified upon approval.',
      passwordMismatch: 'Passwords do not match',
      selectTemplateFirst: 'Please select a template first',
      allFieldsRequired: 'All fields are required'
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
    }
  ];

  const businessTypes = [
    { value: 'fashion', label: { ar: 'أزياء', en: 'Fashion' } },
    { value: 'electronics', label: { ar: 'إلكترونيات', en: 'Electronics' } },
    { value: 'food', label: { ar: 'طعام ومشروبات', en: 'Food & Beverages' } },
    { value: 'beauty', label: { ar: 'جمال وعناية', en: 'Beauty & Care' } },
    { value: 'sports', label: { ar: 'رياضة', en: 'Sports' } },
    { value: 'books', label: { ar: 'كتب', en: 'Books' } },
    { value: 'home', label: { ar: 'منزل وحديقة', en: 'Home & Garden' } },
    { value: 'general', label: { ar: 'عام', en: 'General' } }
  ];

  const cities = [
    'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'تبوك', 'أبها', 'الطائف', 'بريدة'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomizationChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCustomization(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setCustomization(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateStep1 = () => {
    const required = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    if (activeTab === 'merchant') {
      required.push('phone', 'city', 'businessName', 'businessType');
    }
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: 'خطأ',
          description: currentText.allFieldsRequired,
          variant: 'destructive'
        });
        return false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'خطأ',
        description: currentText.passwordMismatch,
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!selectedTemplate) {
      toast({
        title: 'خطأ',
        description: currentText.selectTemplateFirst,
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For merchants, only allow submission on step 3 (after customization)
    if (activeTab === 'merchant' && currentStep !== 3) {
      return;
    }

    if (activeTab === 'customer' && !validateStep1()) {
      return;
    }

    // For merchants on step 3, validate customization fields
    if (activeTab === 'merchant' && currentStep === 3) {
      if (!customization.storeName.trim() || !customization.storeDescription.trim()) {
        toast({
          title: 'خطأ',
          description: 'يرجى ملء اسم المتجر ووصفه',
          variant: 'destructive'
        });
        return;
      }
    }

    setLoading(true);

    try {
      const userData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        userType: activeTab as 'merchant' | 'customer',
        city: formData.city,
        businessName: formData.businessName,
        businessType: formData.businessType
      };

      const result = await createAccountEnhanced(formData.email, formData.password, userData);

      if (result.success) {
        // For merchants, submit store application only after all steps are completed
        if (activeTab === 'merchant') {
          try {
            const applicationId = await submitStoreApplication(
              result.user?.user.uid || 'fallback_user_id',
              {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                businessName: formData.businessName,
                businessType: formData.businessType
              },
              {
                template: selectedTemplate,
                customization
              }
            );

            console.log('Store application submitted with ID:', applicationId);
          } catch (error) {
            console.error('Error submitting store application:', error);
          }
        }

        toast({
          title: currentText.success,
          description: activeTab === 'merchant' ? currentText.pendingMessage : 'مرحباً بك في المنصة',
          duration: 5000
        });

        if (activeTab === 'merchant') {
          navigate('/merchant/pending');
        } else {
          navigate('/customer/dashboard');
        }
      } else {
        toast({
          title: 'خطأ في إنشاء الحساب',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    if (activeTab !== 'merchant') return null;

    const steps = [
      { number: 1, title: currentText.stepInfo },
      { number: 2, title: currentText.stepTemplate },
      { number: 3, title: currentText.stepCustomization }
    ];

    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.number 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.number}
              </div>
              <div className="mr-2 rtl:ml-2 rtl:mr-0 hidden md:block">
                <div className="text-xs font-medium">{step.title}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 border-t border-gray-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{currentText.firstName}</Label>
          <div className="relative">
            <User className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="pl-10 rtl:pr-10 rtl:pl-3"
              required
              disabled={loading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{currentText.lastName}</Label>
          <div className="relative">
            <User className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="pl-10 rtl:pr-10 rtl:pl-3"
              required
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{currentText.email}</Label>
        <div className="relative">
          <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="pl-10 rtl:pr-10 rtl:pl-3"
            required
            disabled={loading}
          />
        </div>
      </div>

      {activeTab === 'merchant' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="phone">{currentText.phone}</Label>
            <div className="relative">
              <Phone className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="pl-10 rtl:pr-10 rtl:pl-3"
                placeholder="+966xxxxxxxxx"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{currentText.city}</Label>
              <Select value={formData.city} onValueChange={(value) => handleSelectChange('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessType">{currentText.businessType}</Label>
              <Select value={formData.businessType} onValueChange={(value) => handleSelectChange('businessType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع النشاط" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label.ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">{currentText.businessName}</Label>
            <div className="relative">
              <Building className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                className="pl-10 rtl:pr-10 rtl:pl-3"
                required
                disabled={loading}
              />
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">{currentText.password}</Label>
          <div className="relative">
            <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
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
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{currentText.confirmPassword}</Label>
          <div className="relative">
            <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
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
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{currentText.selectTemplate}</h3>
        <p className="text-gray-600 text-sm">اختر القالب الذي يناسب نوع متجرك</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {enhancedStoreTemplates.map(template => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Layout className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{template.name.ar}</h4>
                  <p className="text-gray-600 text-xs mt-1">{template.description.ar}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.features.slice(0, 2).map(feature => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedTemplate === template.id && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCustomization = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{currentText.customizeStore}</h3>
        <p className="text-gray-600 text-sm">خصص ألوان ومعلومات متجرك</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{currentText.storeNameLabel}</Label>
          <Input
            value={customization.storeName}
            onChange={(e) => handleCustomizationChange('storeName', e.target.value)}
            placeholder="اسم متجرك"
          />
        </div>

        <div className="space-y-2">
          <Label>{currentText.storeDescLabel}</Label>
          <Textarea
            value={customization.storeDescription}
            onChange={(e) => handleCustomizationChange('storeDescription', e.target.value)}
            placeholder="وصف مختصر عن متجرك"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{currentText.primaryColor}</Label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="color"
                value={customization.colors.primary}
                onChange={(e) => handleCustomizationChange('colors.primary', e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={customization.colors.primary}
                onChange={(e) => handleCustomizationChange('colors.primary', e.target.value)}
                placeholder="#FF6B35"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{currentText.secondaryColor}</Label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="color"
                value={customization.colors.secondary}
                onChange={(e) => handleCustomizationChange('colors.secondary', e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={customization.colors.secondary}
                onChange={(e) => handleCustomizationChange('colors.secondary', e.target.value)}
                placeholder="#4A90E2"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{currentText.backgroundColor}</Label>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="color"
                value={customization.colors.background}
                onChange={(e) => handleCustomizationChange('colors.background', e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <Input
                value={customization.colors.background}
                onChange={(e) => handleCustomizationChange('colors.background', e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">معاينة الألوان</h4>
          <div className="flex space-x-4 rtl:space-x-reverse">
            <div 
              className="w-16 h-16 rounded-lg shadow"
              style={{ backgroundColor: customization.colors.primary }}
            ></div>
            <div 
              className="w-16 h-16 rounded-lg shadow"
              style={{ backgroundColor: customization.colors.secondary }}
            ></div>
            <div 
              className="w-16 h-16 rounded-lg shadow border"
              style={{ backgroundColor: customization.colors.background }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 rtl:space-x-reverse mb-6">
            <div className="bg-gradient-to-r from-primary to-brand p-2 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">منصة التجارة الذكية</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentText.title}</h1>
          <p className="text-gray-600">{currentText.description}</p>
          
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
              <TabsList className="grid w-full grid-cols-2 mb-6">
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

                  {activeTab === 'merchant' && renderStepIndicator()}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {(activeTab === 'customer' || currentStep === 1) && renderBasicInfo()}
                    {activeTab === 'merchant' && currentStep === 2 && renderTemplateSelection()}
                    {activeTab === 'merchant' && currentStep === 3 && renderCustomization()}

                    <div className="flex justify-between">
                      {activeTab === 'merchant' && currentStep > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(prev => prev - 1)}
                          disabled={loading}
                        >
                          {currentText.previous}
                        </Button>
                      )}
                      
                      <div className="flex-1"></div>

                      {activeTab === 'customer' || currentStep === 3 ? (
                        <Button type="submit" className="btn-gradient" disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                              {currentText.creating}
                            </>
                          ) : (
                            <>
                              {activeTab === 'merchant' ? currentText.submit : currentText.createAccount}
                              <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={loading}
                          className="btn-gradient"
                        >
                          {currentText.next}
                          <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                        </Button>
                      )}
                    </div>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      {currentText.haveAccount}{' '}
                      <Link to="/login" className="text-primary font-medium hover:underline">
                        {currentText.signIn}
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
