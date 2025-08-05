import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getStoreByOwnerId, 
  updateStore,
  Store
} from '@/lib/store-management';
import { 
  Palette, 
  Layout, 
  Type, 
  Globe, 
  Settings, 
  Eye, 
  Smartphone, 
  Tablet, 
  Monitor,
  Save,
  ArrowLeft,
  Home,
  ShoppingBag,
  Image,
  Truck,
  CreditCard
} from 'lucide-react';

export default function StoreCustomization() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    customization: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        background: '#ffffff',
        text: '#1e293b',
        accent: '#f59e0b'
      },
      fonts: {
        heading: 'Cairo',
        body: 'Inter'
      },
      layout: {
        headerStyle: 'modern',
        footerStyle: 'detailed',
        productGridColumns: 3
      },
      homepage: {
        showHeroSlider: true,
        showFeaturedProducts: true,
        showCategories: true,
        showNewsletter: true,
        heroImages: [] as string[],
        heroTexts: [
          { title: 'مرحباً بكم في متجرنا', subtitle: 'أفضل المنتجات بأسعار مميزة', buttonText: 'تسوق الآن' }
        ]
      },
      pages: {
        enableBlog: false,
        enableReviews: true,
        enableWishlist: true,
        enableCompare: false
      }
    },
    settings: {
      currency: 'SAR',
      language: 'ar',
      timezone: 'Asia/Riyadh',
      shipping: {
        enabled: true,
        freeShippingThreshold: 200,
        defaultCost: 15,
        zones: [] as any[]
      },
      payment: {
        cashOnDelivery: true,
        bankTransfer: true,
        creditCard: false,
        paypal: false,
        stripe: false
      },
      taxes: {
        enabled: true,
        rate: 15,
        includeInPrice: false
      }
    }
  });

  useEffect(() => {
    if (userData) {
      loadStoreData();
    }
  }, [userData]);

  const loadStoreData = () => {
    try {
      const merchantStore = getStoreByOwnerId(userData?.uid || '');
      
      if (merchantStore) {
        setStore(merchantStore);
        setStoreData({
          name: merchantStore.name,
          description: merchantStore.description,
          customization: merchantStore.customization || storeData.customization,
          settings: merchantStore.settings || storeData.settings
        });
      } else {
        toast({
          title: 'لم يتم العثور على المتجر',
          description: 'يرجى إنشاء متجر أولاً من لوحة التحكم',
          variant: 'destructive'
        });
        navigate('/merchant/dashboard');
      }
    } catch (error) {
      console.error('Error loading store:', error);
      toast({
        title: 'خطأ في تحميل بيانات المتجر',
        description: 'حدث خطأ أثناء تحميل بيانات المتجر',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!store) return;
    
    setSaving(true);
    try {
      updateStore(store.id, {
        name: storeData.name,
        description: storeData.description,
        customization: storeData.customization,
        settings: storeData.settings,
        updatedAt: new Date()
      });

      toast({
        title: 'تم حفظ التغييرات بنجاح! 🎉',
        description: 'تم تحديث إعدادات متجرك بنجاح'
      });

      // Reload store data to reflect changes
      loadStoreData();
    } catch (error) {
      console.error('Error saving store:', error);
      toast({
        title: 'خطأ في حفظ التغييرات',
        description: 'حدث خطأ أثناء حفظ التغييرات، يرجى المحاولة مرة أخرى',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCustomization = (section: string, key: string, value: any) => {
    setStoreData(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [section]: {
          ...prev.customization[section as keyof typeof prev.customization],
          [key]: value
        }
      }
    }));
  };

  const updateSettings = (section: string, key: string, value: any) => {
    setStoreData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [section]: {
          ...prev.settings[section as keyof typeof prev.settings],
          [key]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل بيانات المتجر...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>لم يتم العثور على المتجر</CardTitle>
            <CardDescription>
              يرجى إنشاء متجر أولاً من لوحة التحكم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/merchant/dashboard')}
              className="w-full"
            >
              العودة إلى لوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/merchant/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">تخصيص المتجر</h1>
                <p className="text-gray-600 mt-2">خصص مظهر وإعدادات متجرك - {store.name}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => window.open(`/store/${store.subdomain}`, '_blank')}
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                معاينة المتجر
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">معلومات أساسية</TabsTrigger>
                <TabsTrigger value="design">التصميم</TabsTrigger>
                <TabsTrigger value="homepage">الصفحة الرئيسية</TabsTrigger>
                <TabsTrigger value="pages">الصفحات</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>

              {/* Basic Info */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      المعلومات الأساسية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="storeName">اسم المتجر</Label>
                        <Input
                          id="storeName"
                          value={storeData.name}
                          onChange={(e) => setStoreData({...storeData, name: e.target.value})}
                          placeholder="اسم متجرك"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subdomain">رابط المتجر</Label>
                        <Input
                          id="subdomain"
                          value={store.subdomain}
                          disabled
                          className="bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير رابط المتجر بعد الإنشاء</p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">وصف المتجر</Label>
                      <Textarea
                        id="description"
                        value={storeData.description}
                        onChange={(e) => setStoreData({...storeData, description: e.target.value})}
                        placeholder="وصف مختصر عن متجرك ومنتجاته"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Design Customization */}
              <TabsContent value="design">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      تخصيص التصميم
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">الألوان</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label>اللون الأساسي</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={storeData.customization.colors.primary}
                              onChange={(e) => updateCustomization('colors', 'primary', e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              value={storeData.customization.colors.primary}
                              onChange={(e) => updateCustomization('colors', 'primary', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>اللون الثانوي</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={storeData.customization.colors.secondary}
                              onChange={(e) => updateCustomization('colors', 'secondary', e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              value={storeData.customization.colors.secondary}
                              onChange={(e) => updateCustomization('colors', 'secondary', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>لون الخلفية</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={storeData.customization.colors.background}
                              onChange={(e) => updateCustomization('colors', 'background', e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              value={storeData.customization.colors.background}
                              onChange={(e) => updateCustomization('colors', 'background', e.target.value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">الخطوط</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>خط العناوين</Label>
                          <Select
                            value={storeData.customization.fonts.heading}
                            onValueChange={(value) => updateCustomization('fonts', 'heading', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cairo">Cairo</SelectItem>
                              <SelectItem value="Amiri">Amiri</SelectItem>
                              <SelectItem value="Tajawal">Tajawal</SelectItem>
                              <SelectItem value="Almarai">Almarai</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>خط النصوص</Label>
                          <Select
                            value={storeData.customization.fonts.body}
                            onValueChange={(value) => updateCustomization('fonts', 'body', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Cairo">Cairo</SelectItem>
                              <SelectItem value="Tajawal">Tajawal</SelectItem>
                              <SelectItem value="Almarai">Almarai</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">تخطيط الصفحة</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>نمط الهيدر</Label>
                          <Select
                            value={storeData.customization.layout.headerStyle}
                            onValueChange={(value) => updateCustomization('layout', 'headerStyle', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="modern">عصري</SelectItem>
                              <SelectItem value="classic">كلاسيكي</SelectItem>
                              <SelectItem value="minimal">بسيط</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>عدد أعمدة المنتجات</Label>
                          <Select
                            value={storeData.customization.layout.productGridColumns.toString()}
                            onValueChange={(value) => updateCustomization('layout', 'productGridColumns', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">عمودين</SelectItem>
                              <SelectItem value="3">ثلاثة أعمدة</SelectItem>
                              <SelectItem value="4">أربعة أعمدة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Homepage Settings */}
              <TabsContent value="homepage">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      إعدادات الصفحة الرئيسية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">عرض صور البانر</h4>
                          <p className="text-sm text-gray-600">إظهار صور البانر في أعلى الصفحة</p>
                        </div>
                        <Switch
                          checked={storeData.customization.homepage.showHeroSlider}
                          onCheckedChange={(checked) => updateCustomization('homepage', 'showHeroSlider', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">عرض المنتجات المميزة</h4>
                          <p className="text-sm text-gray-600">إظهار قسم المنتجات المميزة</p>
                        </div>
                        <Switch
                          checked={storeData.customization.homepage.showFeaturedProducts}
                          onCheckedChange={(checked) => updateCustomization('homepage', 'showFeaturedProducts', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">عرض الفئات</h4>
                          <p className="text-sm text-gray-600">إظهار قسم فئات المنتجات</p>
                        </div>
                        <Switch
                          checked={storeData.customization.homepage.showCategories}
                          onCheckedChange={(checked) => updateCustomization('homepage', 'showCategories', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">نموذج النشرة الإخبارية</h4>
                          <p className="text-sm text-gray-600">إظهار نموذج الاشتراك في النشرة</p>
                        </div>
                        <Switch
                          checked={storeData.customization.homepage.showNewsletter}
                          onCheckedChange={(checked) => updateCustomization('homepage', 'showNewsletter', checked)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-4">نص البانر الرئيسي</h4>
                      <div className="space-y-4">
                        <div>
                          <Label>العنوان الرئيسي</Label>
                          <Input
                            value={storeData.customization.homepage.heroTexts[0]?.title || ''}
                            onChange={(e) => {
                              const heroTexts = [...storeData.customization.homepage.heroTexts];
                              heroTexts[0] = { ...heroTexts[0], title: e.target.value };
                              updateCustomization('homepage', 'heroTexts', heroTexts);
                            }}
                            placeholder="مرحباً بكم في متجرنا"
                          />
                        </div>
                        <div>
                          <Label>العنوان الفرعي</Label>
                          <Input
                            value={storeData.customization.homepage.heroTexts[0]?.subtitle || ''}
                            onChange={(e) => {
                              const heroTexts = [...storeData.customization.homepage.heroTexts];
                              heroTexts[0] = { ...heroTexts[0], subtitle: e.target.value };
                              updateCustomization('homepage', 'heroTexts', heroTexts);
                            }}
                            placeholder="أفضل المنتجات بأسعار مميزة"
                          />
                        </div>
                        <div>
                          <Label>نص الزر</Label>
                          <Input
                            value={storeData.customization.homepage.heroTexts[0]?.buttonText || ''}
                            onChange={(e) => {
                              const heroTexts = [...storeData.customization.homepage.heroTexts];
                              heroTexts[0] = { ...heroTexts[0], buttonText: e.target.value };
                              updateCustomization('homepage', 'heroTexts', heroTexts);
                            }}
                            placeholder="تسوق الآن"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pages Settings */}
              <TabsContent value="pages">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="h-5 w-5" />
                      إعدادات الصفحات والمميزات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">نظام التقييمات</h4>
                          <p className="text-sm text-gray-600">السماح للعملاء بتقييم المنتجات</p>
                        </div>
                        <Switch
                          checked={storeData.customization.pages.enableReviews}
                          onCheckedChange={(checked) => updateCustomization('pages', 'enableReviews', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">قائمة الرغبات</h4>
                          <p className="text-sm text-gray-600">السماح للعملاء بحفظ المنتجات المفضلة</p>
                        </div>
                        <Switch
                          checked={storeData.customization.pages.enableWishlist}
                          onCheckedChange={(checked) => updateCustomization('pages', 'enableWishlist', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">مقارنة المنتجات</h4>
                          <p className="text-sm text-gray-600">السماح للعملاء بمقارنة المنتجات</p>
                        </div>
                        <Switch
                          checked={storeData.customization.pages.enableCompare}
                          onCheckedChange={(checked) => updateCustomization('pages', 'enableCompare', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">صفحة المدونة</h4>
                          <p className="text-sm text-gray-600">إضافة صفحة مدونة للمحتوى والأخبار</p>
                        </div>
                        <Switch
                          checked={storeData.customization.pages.enableBlog}
                          onCheckedChange={(checked) => updateCustomization('pages', 'enableBlog', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Store Settings */}
              <TabsContent value="settings">
                <div className="space-y-6">
                  {/* Payment Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        إعدادات الدفع
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">الدفع عند الاستلام</h4>
                          <p className="text-sm text-gray-600">تفعيل الدفع النقدي عند الاستلام</p>
                        </div>
                        <Switch
                          checked={storeData.settings.payment.cashOnDelivery}
                          onCheckedChange={(checked) => updateSettings('payment', 'cashOnDelivery', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">التحويل البنكي</h4>
                          <p className="text-sm text-gray-600">قبول المدفوعات عبر التحويل البنكي</p>
                        </div>
                        <Switch
                          checked={storeData.settings.payment.bankTransfer}
                          onCheckedChange={(checked) => updateSettings('payment', 'bankTransfer', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">البطاقات الائتمانية</h4>
                          <p className="text-sm text-gray-600">قبول الدفع بالبطاقات الائتمانية</p>
                        </div>
                        <Switch
                          checked={storeData.settings.payment.creditCard}
                          onCheckedChange={(checked) => updateSettings('payment', 'creditCard', checked)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipping Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        إعدادات الشحن
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">تفعيل الشحن</h4>
                          <p className="text-sm text-gray-600">تفعيل خدمة الشحن للطلبات</p>
                        </div>
                        <Switch
                          checked={storeData.settings.shipping.enabled}
                          onCheckedChange={(checked) => updateSettings('shipping', 'enabled', checked)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>تكلفة الشحن الافتراضية</Label>
                          <Input
                            type="number"
                            value={storeData.settings.shipping.defaultCost}
                            onChange={(e) => updateSettings('shipping', 'defaultCost', Number(e.target.value))}
                            placeholder="15"
                          />
                        </div>
                        <div>
                          <Label>الحد الأدنى للشحن المجاني</Label>
                          <Input
                            type="number"
                            value={storeData.settings.shipping.freeShippingThreshold}
                            onChange={(e) => updateSettings('shipping', 'freeShippingThreshold', Number(e.target.value))}
                            placeholder="200"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tax Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>إعدادات الضرائب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">تفعيل الضريبة</h4>
                          <p className="text-sm text-gray-600">إضافة ضريبة القيمة المضافة</p>
                        </div>
                        <Switch
                          checked={storeData.settings.taxes.enabled}
                          onCheckedChange={(checked) => updateSettings('taxes', 'enabled', checked)}
                        />
                      </div>
                      {storeData.settings.taxes.enabled && (
                        <div>
                          <Label>نسبة الضريبة (%)</Label>
                          <Input
                            type="number"
                            value={storeData.settings.taxes.rate}
                            onChange={(e) => updateSettings('taxes', 'rate', Number(e.target.value))}
                            placeholder="15"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  معاينة المتجر
                </CardTitle>
                <div className="flex gap-2">
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
              </CardHeader>
              <CardContent>
                <div className={`mx-auto bg-white rounded-lg border overflow-hidden ${
                  previewDevice === 'desktop' ? 'w-full h-96' :
                  previewDevice === 'tablet' ? 'w-80 h-96' : 'w-64 h-96'
                }`}>
                  <div 
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(135deg, ${storeData.customization.colors.primary} 0%, ${storeData.customization.colors.secondary} 100%)`,
                      fontFamily: storeData.customization.fonts.heading
                    }}
                  >
                    <div className="p-4 text-white text-center">
                      <h3 className="text-lg font-bold">{storeData.name}</h3>
                      <p className="text-sm opacity-90">{storeData.description}</p>
                    </div>
                    <div className="p-4 bg-white h-full">
                      <div className="text-center">
                        <h4 className="font-bold mb-2" style={{color: storeData.customization.colors.primary}}>
                          {storeData.customization.homepage.heroTexts[0]?.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {storeData.customization.homepage.heroTexts[0]?.subtitle}
                        </p>
                        <Button 
                          size="sm" 
                          style={{backgroundColor: storeData.customization.colors.accent}}
                        >
                          {storeData.customization.homepage.heroTexts[0]?.buttonText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>معلومات المتجر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">رابط المتجر</p>
                  <p className="font-medium">{store.subdomain}.store.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                  <p className="font-medium">{new Date(store.createdAt).toLocaleDateString('ar-SA')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">آخر تحديث</p>
                  <p className="font-medium">{new Date(store.updatedAt).toLocaleDateString('ar-SA')}</p>
                </div>
                <Badge variant="default">متجر نشط</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
