import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { toast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { createStore, updateStore, getStoreByOwnerId } from '../../lib/firestore';
import { enhancedStoreTemplates, getTemplatesByIndustry, EnhancedStoreTemplate, StoreCustomization } from '../../lib/enhanced-templates';
import { Palette, Layout, Type, Globe, Settings, Eye, Smartphone, Tablet, Monitor } from 'lucide-react';

const StoreBuilder: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedStoreTemplate | null>(null);
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    subdomain: '',
    industry: 'general',
    logo: '',
    customization: {} as StoreCustomization
  });
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const [existingStore, setExistingStore] = useState<any>(null);

  const steps = [
    { id: 1, title: 'اختيار القالب', description: 'اختر القالب المناسب لمتجرك' },
    { id: 2, title: 'معلومات المتجر', description: 'أدخل معلومات متجرك الأساسية' },
    { id: 3, title: 'تخصيص التصميم', description: 'خصص ألوان وخطوط متجرك' },
    { id: 4, title: 'إعدادات الصفحات', description: 'اختر الصفحات والمكونات' },
    { id: 5, title: 'المعاينة والحفظ', description: 'راجع متجرك واحفظ الإعدادات' }
  ];

  const industries = [
    { value: 'general', label: { ar: 'عام', en: 'General' } },
    { value: 'fashion', label: { ar: 'أزياء', en: 'Fashion' } },
    { value: 'electronics', label: { ar: 'إلكترونيات', en: 'Electronics' } },
    { value: 'food', label: { ar: 'طعام ومشروبات', en: 'Food & Beverages' } },
    { value: 'beauty', label: { ar: 'جمال وعناية', en: 'Beauty & Care' } },
    { value: 'sports', label: { ar: 'رياضة', en: 'Sports' } },
    { value: 'books', label: { ar: 'كتب', en: 'Books' } },
    { value: 'home', label: { ar: 'منزل وحديقة', en: 'Home & Garden' } }
  ];

  useEffect(() => {
    loadExistingStore();
  }, [user]);

  const loadExistingStore = async () => {
    if (user) {
      try {
        const store = await getStoreByOwnerId(user.uid);
        if (store) {
          setExistingStore(store);
          setStoreData({
            name: store.name,
            description: store.description,
            subdomain: store.subdomain,
            industry: store.industry || 'general',
            logo: store.logo || '',
            customization: store.customization || {}
          });
          
          const template = enhancedStoreTemplates.find(t => t.id === store.template);
          if (template) {
            setSelectedTemplate(template);
          }
        }
      } catch (error) {
        console.error('Error loading store:', error);
      }
    }
  };

  const handleTemplateSelect = (template: EnhancedStoreTemplate) => {
    setSelectedTemplate(template);
    setStoreData(prev => ({
      ...prev,
      customization: template.customization
    }));
  };

  const handleStoreInfoChange = (field: string, value: string) => {
    setStoreData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'name' && !storeData.subdomain) {
      const subdomain = value.toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setStoreData(prev => ({
        ...prev,
        subdomain: `store-${subdomain}`
      }));
    }
  };

  const handleCustomizationChange = (section: keyof StoreCustomization, field: string, value: any) => {
    setStoreData(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [section]: {
          ...prev.customization[section],
          [field]: value
        }
      }
    }));
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setStoreData(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        branding: {
          ...prev.customization.branding,
          brandColors: {
            ...prev.customization.branding?.brandColors,
            [colorKey]: value
          }
        }
      }
    }));
  };

  const saveStore = async () => {
    if (!user || !selectedTemplate) return;

    setLoading(true);
    try {
      const storePayload = {
        name: storeData.name,
        description: storeData.description,
        subdomain: storeData.subdomain,
        industry: storeData.industry,
        logo: storeData.logo,
        template: selectedTemplate.id,
        customization: storeData.customization,
        ownerId: user.uid,
        status: 'active',
        settings: {
          currency: 'SAR',
          language: 'ar',
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
        }
      };

      if (existingStore) {
        await updateStore(existingStore.id, storePayload);
        toast({
          title: 'تم تحديث المتجر',
          description: 'تم تحديث إعدادات متجرك بنجاح'
        });
      } else {
        await createStore(storePayload);
        toast({
          title: 'تم إنشاء المتجر',
          description: 'تم إنشاء متجرك بنجاح'
        });
      }

      navigate('/merchant/dashboard');
    } catch (error) {
      console.error('Error saving store:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ المتجر',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = getTemplatesByIndustry(storeData.industry);

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="industry" className="text-base font-medium">نوع المتجر</Label>
        <Select value={storeData.industry} onValueChange={(value) => setStoreData(prev => ({ ...prev, industry: value }))}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="اختر نوع متجرك" />
          </SelectTrigger>
          <SelectContent>
            {industries.map(industry => (
              <SelectItem key={industry.value} value={industry.value}>
                {industry.label.ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="relative">
              <img 
                src={template.preview.desktop} 
                alt={template.name.ar}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              {template.isPremium && (
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                  مميز
                </Badge>
              )}
            </div>
            <CardHeader className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name.ar}</CardTitle>
                  <CardDescription className="mt-1">
                    {template.description.ar}
                  </CardDescription>
                </div>
                {selectedTemplate?.id === template.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {template.features.slice(0, 3).map(feature => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStoreInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="storeName" className="text-base font-medium">اسم المتجر</Label>
          <Input
            id="storeName"
            value={storeData.name}
            onChange={(e) => handleStoreInfoChange('name', e.target.value)}
            placeholder="اسم متجرك"
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="subdomain" className="text-base font-medium">رابط المتجر</Label>
          <div className="mt-2 flex">
            <Input
              id="subdomain"
              value={storeData.subdomain}
              onChange={(e) => handleStoreInfoChange('subdomain', e.target.value)}
              placeholder="store-name"
              className="rounded-l-md"
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              .platform.com
            </span>
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description" className="text-base font-medium">وصف المتجر</Label>
        <Textarea
          id="description"
          value={storeData.description}
          onChange={(e) => handleStoreInfoChange('description', e.target.value)}
          placeholder="وصف مختصر عن متجرك ومنتجاتك"
          className="mt-2 min-h-[100px]"
        />
      </div>

      <div>
        <Label htmlFor="logo" className="text-base font-medium">شعار المتجر (اختياري)</Label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          className="mt-2"
        />
      </div>
    </div>
  );

  const renderDesignCustomization = () => (
    <div className="space-y-6">
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            الألوان
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            الخطوط
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            التخطيط
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(storeData.customization?.branding?.brandColors || {}).map(([key, value]) => (
              <div key={key}>
                <Label className="text-sm font-medium">
                  {key === 'primary' ? 'اللون الأساسي' :
                   key === 'secondary' ? 'اللون الثانوي' :
                   key === 'accent' ? 'لون التمييز' :
                   key === 'background' ? 'لون الخلفية' :
                   key === 'text' ? 'لون النص' : key}
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-10 h-10 rounded border"
                  />
                  <Input
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">الخط الأساسي</Label>
              <Select 
                value={storeData.customization?.typography?.primaryFont || 'Cairo'}
                onValueChange={(value) => handleCustomizationChange('typography', 'primaryFont', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cairo">Cairo</SelectItem>
                  <SelectItem value="Tajawal">Tajawal</SelectItem>
                  <SelectItem value="Amiri">Amiri</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">الخط الثانوي</Label>
              <Select 
                value={storeData.customization?.typography?.secondaryFont || 'Inter'}
                onValueChange={(value) => handleCustomizationChange('typography', 'secondaryFont', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cairo">Cairo</SelectItem>
                  <SelectItem value="Tajawal">Tajawal</SelectItem>
                  <SelectItem value="Amiri">Amiri</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium">نمط الهيدر</Label>
              <RadioGroup 
                value={storeData.customization?.layout?.headerStyle || 'fixed'}
                onValueChange={(value) => handleCustomizationChange('layout', 'headerStyle', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="header-fixed" />
                  <Label htmlFor="header-fixed">ثابت</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="static" id="header-static" />
                  <Label htmlFor="header-static">عادي</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transparent" id="header-transparent" />
                  <Label htmlFor="header-transparent">شفاف</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-sm font-medium">نمط الفوتر</Label>
              <RadioGroup 
                value={storeData.customization?.layout?.footerStyle || 'detailed'}
                onValueChange={(value) => handleCustomizationChange('layout', 'footerStyle', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simple" id="footer-simple" />
                  <Label htmlFor="footer-simple">بسيط</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="detailed" id="footer-detailed" />
                  <Label htmlFor="footer-detailed">مفصل</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimal" id="footer-minimal" />
                  <Label htmlFor="footer-minimal">أدنى</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderPageSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">صفحات المتجر</CardTitle>
            <CardDescription>اختر الصفحات التي تريد إظهارها في متجرك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(storeData.customization?.staticPages || {}).map(([key, page]) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="text-sm">
                  {key === 'aboutUs' ? 'عن المتجر' :
                   key === 'privacyPolicy' ? 'سياسة الخصوصية' :
                   key === 'termsOfService' ? 'الشروط والأحكام' :
                   key === 'returnPolicy' ? 'سياسة الاسترجاع' :
                   key === 'shippingInfo' ? 'معلومات الشحن' :
                   key === 'faq' ? 'الأسئلة الشائعة' :
                   key === 'contactUs' ? 'اتصل بنا' : key}
                </Label>
                <Switch
                  checked={page?.enabled || false}
                  onCheckedChange={(checked) => 
                    handleCustomizationChange('staticPages', key, { ...page, enabled: checked })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">مكونات الصفحة الرئيسية</CardTitle>
            <CardDescription>اختر المكونات التي تريد إظهارها</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(storeData.customization?.homepage || {}).map(([key, component]) => (
              key !== 'banners' && typeof component === 'object' && 'enabled' in component && (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm">
                    {key === 'heroSection' ? 'قسم البطل' :
                     key === 'featuredProducts' ? 'المنتجات المميزة' :
                     key === 'categories' ? 'التصنيفات' :
                     key === 'testimonials' ? 'آر��ء العملاء' :
                     key === 'newsletter' ? 'النشرة الإخبارية' :
                     key === 'aboutSection' ? 'عن المتجر' : key}
                  </Label>
                  <Switch
                    checked={component.enabled || false}
                    onCheckedChange={(checked) => 
                      handleCustomizationChange('homepage', key, { ...component, enabled: checked })
                    }
                  />
                </div>
              )
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">معاينة المتجر</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={previewDevice === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewDevice('desktop')}
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            variant={previewDevice === 'tablet' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewDevice('tablet')}
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            variant={previewDevice === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewDevice('mobile')}
          >
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <div className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${
          previewDevice === 'desktop' ? 'w-full' :
          previewDevice === 'tablet' ? 'w-3/4' : 'w-96'
        }`}>
          {selectedTemplate && (
            <img 
              src={selectedTemplate.preview[previewDevice]}
              alt="Store Preview"
              className="w-full h-auto"
            />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ملخص المتجر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">اسم المتجر</Label>
              <p className="text-sm">{storeData.name || 'غير محدد'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">رابط المتجر</Label>
              <p className="text-sm">{storeData.subdomain || 'غير محدد'}.platform.com</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">القالب</Label>
              <p className="text-sm">{selectedTemplate?.name.ar || 'غير محدد'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">نوع المتجر</Label>
              <p className="text-sm">
                {industries.find(i => i.value === storeData.industry)?.label.ar || 'عام'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {existingStore ? 'تحديث المتجر' : 'إنشاء متجر جديد'}
          </h1>
          <p className="text-gray-600 mt-2">
            اتبع الخطوات لإنشاء متجرك الإلكتروني المخصص
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              <div className="ml-3 hidden md:block">
                <div className="text-sm font-medium text-gray-900">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-full border-t border-gray-300 mx-4"></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {currentStep === 1 && renderTemplateSelection()}
            {currentStep === 2 && renderStoreInfo()}
            {currentStep === 3 && renderDesignCustomization()}
            {currentStep === 4 && renderPageSettings()}
            {currentStep === 5 && renderPreview()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            السابق
          </Button>
          
          <div className="flex gap-2">
            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                disabled={currentStep === 1 && !selectedTemplate}
              >
                التالي
              </Button>
            ) : (
              <Button
                onClick={saveStore}
                disabled={loading || !selectedTemplate || !storeData.name}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'جاري الحفظ...' : existingStore ? 'تحديث المتجر' : 'إنشاء المتجر'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreBuilder;
