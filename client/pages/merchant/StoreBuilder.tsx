import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { storeService } from '@/lib/firestore';
import { storeTemplates, getTemplateById, updateTemplateColors, generateTemplateCSS, StoreTemplate } from '@/lib/templates';
import { 
  Store, 
  Palette, 
  Layout, 
  Type, 
  Settings, 
  Eye,
  Save,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

export default function StoreBuilder() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [currentStep, setCurrentStep] = useState<'template' | 'customize' | 'settings' | 'preview'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<StoreTemplate | null>(null);
  const [customizedTemplate, setCustomizedTemplate] = useState<StoreTemplate | null>(null);
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    subdomain: '',
    customDomain: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const { userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const text = {
    ar: {
      title: 'منشئ المتجر',
      subtitle: 'اختر قالبك المثالي وخصصه حسب ذوقك',
      selectTemplate: 'اختيار القالب',
      customizeDesign: 'تخصيص التصميم',
      storeSettings: 'إعدادات المتجر',
      preview: 'معاينة',
      chooseTemplate: 'اختر القالب المناسب لمتجرك',
      templateFeatures: 'مميزات القالب',
      useTemplate: 'استخدم هذا القالب',
      colors: 'الألوان',
      typography: 'الخطوط',
      layout: 'التخطيط',
      components: 'المكونات',
      primaryColor: 'اللون الأساسي',
      secondaryColor: 'اللون الثانوي',
      backgroundColor: 'لون الخلفية',
      textColor: 'لون النص',
      accentColor: 'لون التمييز',
      primaryFont: 'الخط الأساسي',
      secondaryFont: 'الخط الثانوي',
      storeName: 'اسم المتجر',
      storeDescription: 'وصف المتجر',
      subdomain: 'النطاق الفرعي',
      customDomain: 'النطاق المخصص',
      saveStore: 'حفظ المتجر',
      saving: 'جاري الحفظ...',
      success: 'تم إنشاء المتجر بنجاح!',
      error: 'حدث خطأ في إنشاء المتجر',
      back: 'السابق',
      next: 'التالي',
      modern: 'عصري',
      classic: 'كلاسيكي',
      minimal: 'بسيط',
      bold: 'جريء',
      showCategories: 'إظهار الفئات',
      showSearch: 'إظهار البحث',
      showWishlist: 'إظهار قائمة الأماني',
      showCart: 'إظهار سلة التسوق',
      heroSection: 'قسم البطل',
      featuredProducts: 'المنتجات المميزة',
      testimonials: 'آراء العملاء',
      newsletter: 'النشرة الإخبارية',
      previewStore: 'معاينة المتجر',
      desktop: 'سطح المكتب',
      tablet: 'الجهاز اللوحي',
      mobile: 'الهاتف المحمول'
    },
    en: {
      title: 'Store Builder',
      subtitle: 'Choose your perfect template and customize it to your taste',
      selectTemplate: 'Select Template',
      customizeDesign: 'Customize Design',
      storeSettings: 'Store Settings',
      preview: 'Preview',
      chooseTemplate: 'Choose the right template for your store',
      templateFeatures: 'Template Features',
      useTemplate: 'Use This Template',
      colors: 'Colors',
      typography: 'Typography',
      layout: 'Layout',
      components: 'Components',
      primaryColor: 'Primary Color',
      secondaryColor: 'Secondary Color',
      backgroundColor: 'Background Color',
      textColor: 'Text Color',
      accentColor: 'Accent Color',
      primaryFont: 'Primary Font',
      secondaryFont: 'Secondary Font',
      storeName: 'Store Name',
      storeDescription: 'Store Description',
      subdomain: 'Subdomain',
      customDomain: 'Custom Domain',
      saveStore: 'Save Store',
      saving: 'Saving...',
      success: 'Store created successfully!',
      error: 'Error creating store',
      back: 'Back',
      next: 'Next',
      modern: 'Modern',
      classic: 'Classic',
      minimal: 'Minimal',
      bold: 'Bold',
      showCategories: 'Show Categories',
      showSearch: 'Show Search',
      showWishlist: 'Show Wishlist',
      showCart: 'Show Cart',
      heroSection: 'Hero Section',
      featuredProducts: 'Featured Products',
      testimonials: 'Testimonials',
      newsletter: 'Newsletter',
      previewStore: 'Preview Store',
      desktop: 'Desktop',
      tablet: 'Tablet',
      mobile: 'Mobile'
    }
  };

  const currentText = text[language];

  const categoryText = {
    ar: {
      modern: 'عصري',
      classic: 'كلاسيكي',
      minimal: 'بسيط',
      bold: 'جريء'
    },
    en: {
      modern: 'Modern',
      classic: 'Classic', 
      minimal: 'Minimal',
      bold: 'Bold'
    }
  };

  useEffect(() => {
    if (selectedTemplate) {
      setCustomizedTemplate({ ...selectedTemplate });
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template: StoreTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep('customize');
  };

  const handleColorChange = (colorKey: string, value: string) => {
    if (customizedTemplate) {
      const updatedTemplate = updateTemplateColors(customizedTemplate, { [colorKey]: value });
      setCustomizedTemplate(updatedTemplate);
    }
  };

  const handleLayoutChange = (layoutKey: string, value: any) => {
    if (customizedTemplate) {
      setCustomizedTemplate({
        ...customizedTemplate,
        customization: {
          ...customizedTemplate.customization,
          layout: {
            ...customizedTemplate.customization.layout,
            [layoutKey]: value
          }
        }
      });
    }
  };

  const handleStoreDataChange = (field: string, value: string) => {
    setStoreData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveStore = async () => {
    if (!customizedTemplate || !userData) return;

    setLoading(true);
    try {
      const storePayload = {
        ownerId: userData.uid,
        name: storeData.name || userData.businessName || `${userData.firstName}'s Store`,
        description: storeData.description,
        logo: '',
        subdomain: storeData.subdomain || `store_${userData.uid}`,
        template: customizedTemplate.id,
        customization: customizedTemplate.customization,
        settings: {
          currency: 'SAR',
          language: language,
          shipping: {
            enabled: false,
            freeShippingThreshold: 0,
            shippingCost: 0
          },
          payment: {
            cashOnDelivery: true,
            bankTransfer: false,
            creditCard: false
          }
        },
        contact: {
          phone: userData.phone || '',
          email: userData.email,
          address: '',
          city: userData.city || ''
        },
        status: 'pending' as const
      };

      await storeService.create(storePayload);

      toast({
        title: currentText.success,
        description: 'يمكنك الآن إدارة متجرك من لوحة التحكم',
      });

      navigate('/merchant/dashboard');
    } catch (error) {
      console.error('Error creating store:', error);
      toast({
        title: currentText.error,
        description: 'يرجى المحاولة مرة أخرى',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTemplateGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {storeTemplates.map((template) => (
        <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow card-shadow">
          <div className="relative">
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
              <Store className="h-16 w-16 text-gray-400" />
            </div>
            <Badge className="absolute top-2 right-2" variant="secondary">
              {categoryText[language][template.category]}
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-lg">{template.name[language]}</CardTitle>
            <CardDescription>{template.description[language]}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">{currentText.templateFeatures}:</p>
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => handleTemplateSelect(template)}
              >
                {currentText.useTemplate}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderCustomization = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Tabs defaultValue="colors">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="colors" className="flex items-center space-x-1">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{currentText.colors}</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center space-x-1">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline">{currentText.typography}</span>
            </TabsTrigger>
            <TabsTrigger value="layout" className="flex items-center space-x-1">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">{currentText.layout}</span>
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center space-x-1">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{currentText.components}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{currentText.primaryColor}</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    value={customizedTemplate?.customization.colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={customizedTemplate?.customization.colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>{currentText.secondaryColor}</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    value={customizedTemplate?.customization.colors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={customizedTemplate?.customization.colors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>{currentText.backgroundColor}</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    value={customizedTemplate?.customization.colors.background}
                    onChange={(e) => handleColorChange('background', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={customizedTemplate?.customization.colors.background}
                    onChange={(e) => handleColorChange('background', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>{currentText.textColor}</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    value={customizedTemplate?.customization.colors.text}
                    onChange={(e) => handleColorChange('text', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={customizedTemplate?.customization.colors.text}
                    onChange={(e) => handleColorChange('text', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div>
              <Label>{currentText.primaryFont}</Label>
              <Select
                value={customizedTemplate?.customization.fonts.primary}
                onValueChange={(value) => setCustomizedTemplate(prev => prev ? {
                  ...prev,
                  customization: {
                    ...prev.customization,
                    fonts: { ...prev.customization.fonts, primary: value }
                  }
                } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cairo">Cairo</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{currentText.secondaryFont}</Label>
              <Select
                value={customizedTemplate?.customization.fonts.secondary}
                onValueChange={(value) => setCustomizedTemplate(prev => prev ? {
                  ...prev,
                  customization: {
                    ...prev.customization,
                    fonts: { ...prev.customization.fonts, secondary: value }
                  }
                } : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cairo">Cairo</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showCategories"
                  checked={customizedTemplate?.customization.layout.showCategories}
                  onChange={(e) => handleLayoutChange('showCategories', e.target.checked)}
                />
                <Label htmlFor="showCategories">{currentText.showCategories}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showSearch"
                  checked={customizedTemplate?.customization.layout.showSearch}
                  onChange={(e) => handleLayoutChange('showSearch', e.target.checked)}
                />
                <Label htmlFor="showSearch">{currentText.showSearch}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showWishlist"
                  checked={customizedTemplate?.customization.layout.showWishlist}
                  onChange={(e) => handleLayoutChange('showWishlist', e.target.checked)}
                />
                <Label htmlFor="showWishlist">{currentText.showWishlist}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showCart"
                  checked={customizedTemplate?.customization.layout.showCart}
                  onChange={(e) => handleLayoutChange('showCart', e.target.checked)}
                />
                <Label htmlFor="showCart">{currentText.showCart}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="heroSection"
                  checked={customizedTemplate?.customization.layout.heroSection}
                  onChange={(e) => handleLayoutChange('heroSection', e.target.checked)}
                />
                <Label htmlFor="heroSection">{currentText.heroSection}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featuredProducts"
                  checked={customizedTemplate?.customization.layout.featuredProducts}
                  onChange={(e) => handleLayoutChange('featuredProducts', e.target.checked)}
                />
                <Label htmlFor="featuredProducts">{currentText.featuredProducts}</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="testimonials"
                  checked={customizedTemplate?.customization.layout.testimonials}
                  onChange={(e) => handleLayoutChange('testimonials', e.target.checked)}
                />
                <Label htmlFor="testimonials">{currentText.testimonials}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={customizedTemplate?.customization.layout.newsletter}
                  onChange={(e) => handleLayoutChange('newsletter', e.target.checked)}
                />
                <Label htmlFor="newsletter">{currentText.newsletter}</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Live Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{currentText.previewStore}</h3>
          <div className="flex space-x-2">
            <Button
              variant={previewDevice === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewDevice('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewDevice('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={previewDevice === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewDevice('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={`bg-white rounded border ${
          previewDevice === 'desktop' ? 'w-full h-96' :
          previewDevice === 'tablet' ? 'w-3/4 h-80 mx-auto' :
          'w-1/2 h-96 mx-auto'
        }`}>
          {customizedTemplate && (
            <div
              className="w-full h-full rounded overflow-hidden"
              style={{
                background: customizedTemplate.customization.colors.background,
                color: customizedTemplate.customization.colors.text,
                fontFamily: customizedTemplate.customization.fonts.primary
              }}
            >
              <div
                className="h-16 flex items-center justify-between px-4"
                style={{ backgroundColor: customizedTemplate.customization.colors.primary }}
              >
                <div className="text-white font-bold">
                  {storeData.name || userData?.businessName || 'متجري'}
                </div>
                {customizedTemplate.customization.layout.showCart && (
                  <div className="text-white">🛒</div>
                )}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="h-24 rounded"
                    style={{ backgroundColor: customizedTemplate.customization.colors.accent }}
                  >
                    <div className="p-2">
                      <div className="text-sm font-medium">منتج تجريبي</div>
                      <div className="text-xs text-gray-600">100 ريال</div>
                    </div>
                  </div>
                  <div
                    className="h-24 rounded"
                    style={{ backgroundColor: customizedTemplate.customization.colors.accent }}
                  >
                    <div className="p-2">
                      <div className="text-sm font-medium">منتج تجريبي</div>
                      <div className="text-xs text-gray-600">150 ريال</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <Label htmlFor="storeName">{currentText.storeName}</Label>
        <Input
          id="storeName"
          value={storeData.name}
          onChange={(e) => handleStoreDataChange('name', e.target.value)}
          placeholder={userData?.businessName || 'اسم متجرك'}
        />
      </div>

      <div>
        <Label htmlFor="storeDescription">{currentText.storeDescription}</Label>
        <Textarea
          id="storeDescription"
          value={storeData.description}
          onChange={(e) => handleStoreDataChange('description', e.target.value)}
          placeholder="وصف قصير عن متجرك ومنتجاتك"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="subdomain">{currentText.subdomain}</Label>
        <div className="flex">
          <Input
            id="subdomain"
            value={storeData.subdomain}
            onChange={(e) => handleStoreDataChange('subdomain', e.target.value)}
            placeholder="mystore"
            className="rounded-r-none"
          />
          <div className="bg-gray-100 border border-l-0 rounded-r px-3 py-2 text-sm text-gray-600">
            .platform.com
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="customDomain">{currentText.customDomain}</Label>
        <Input
          id="customDomain"
          value={storeData.customDomain}
          onChange={(e) => handleStoreDataChange('customDomain', e.target.value)}
          placeholder="www.mystore.com (اختياري)"
        />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentText.title}</h1>
            <p className="text-gray-600">{currentText.subtitle}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            >
              <Globe className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/merchant/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentText.back}
            </Button>
          </div>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['template', 'customize', 'settings', 'preview'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step ? 'bg-primary text-white' :
                  ['template', 'customize', 'settings'].indexOf(currentStep) > index ? 'bg-green-500 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {['template', 'customize', 'settings'].indexOf(currentStep) > index ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < 3 && <div className="w-12 h-1 bg-gray-300 mx-2"></div>}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-8 text-sm">
              <span className={currentStep === 'template' ? 'text-primary font-medium' : 'text-gray-600'}>
                {currentText.selectTemplate}
              </span>
              <span className={currentStep === 'customize' ? 'text-primary font-medium' : 'text-gray-600'}>
                {currentText.customizeDesign}
              </span>
              <span className={currentStep === 'settings' ? 'text-primary font-medium' : 'text-gray-600'}>
                {currentText.storeSettings}
              </span>
              <span className={currentStep === 'preview' ? 'text-primary font-medium' : 'text-gray-600'}>
                {currentText.preview}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {currentStep === 'template' && <Store className="h-5 w-5" />}
              {currentStep === 'customize' && <Palette className="h-5 w-5" />}
              {currentStep === 'settings' && <Settings className="h-5 w-5" />}
              {currentStep === 'preview' && <Eye className="h-5 w-5" />}
              <span>
                {currentStep === 'template' && currentText.selectTemplate}
                {currentStep === 'customize' && currentText.customizeDesign}
                {currentStep === 'settings' && currentText.storeSettings}
                {currentStep === 'preview' && currentText.preview}
              </span>
            </CardTitle>
            <CardDescription>
              {currentStep === 'template' && currentText.chooseTemplate}
              {currentStep === 'customize' && 'خصص ألوان وتخطيط متجرك'}
              {currentStep === 'settings' && 'أدخل معلومات متجرك الأساسية'}
              {currentStep === 'preview' && 'راجع متجرك قبل النشر'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {currentStep === 'template' && renderTemplateGrid()}
            {currentStep === 'customize' && renderCustomization()}
            {currentStep === 'settings' && renderSettings()}
            {currentStep === 'preview' && (
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">متجرك جاهز للنشر!</h3>
                <p className="text-gray-600 mb-6">يمكنك الآن نشر متجرك وبدء إضافة المنتجات</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 'customize') setCurrentStep('template');
              if (currentStep === 'settings') setCurrentStep('customize');
              if (currentStep === 'preview') setCurrentStep('settings');
            }}
            disabled={currentStep === 'template'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentText.back}
          </Button>

          <Button
            onClick={() => {
              if (currentStep === 'template') setCurrentStep('customize');
              else if (currentStep === 'customize') setCurrentStep('settings');
              else if (currentStep === 'settings') setCurrentStep('preview');
              else if (currentStep === 'preview') handleSaveStore();
            }}
            disabled={
              (currentStep === 'template' && !selectedTemplate) ||
              loading
            }
            className="btn-gradient"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {currentText.saving}
              </>
            ) : currentStep === 'preview' ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                {currentText.saveStore}
              </>
            ) : (
              <>
                {currentText.next}
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
