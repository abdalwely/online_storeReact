import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { storeService, Store } from '@/lib/firestore';
import { 
  Settings, 
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  Store as StoreIcon,
  Palette,
  CreditCard,
  Truck,
  Bell,
  Shield
} from 'lucide-react';

export default function StoreSettings() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subdomain: '',
    customDomain: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    currency: 'SAR',
    language: 'ar',
    cashOnDelivery: true,
    bankTransfer: false,
    creditCard: false,
    shippingEnabled: false,
    freeShippingThreshold: 0,
    shippingCost: 0
  });

  const { userData } = useAuth();
  const { toast } = useToast();
  const isArabic = language === 'ar';

  const text = {
    ar: {
      storeSettings: 'إعدادات المتجر',
      generalSettings: 'الإعدادات العامة',
      paymentSettings: 'إعدادات الدفع',
      shippingSettings: 'إعدادات الشحن',
      notificationSettings: 'إعدادات الإشعارات',
      storeName: 'اسم المتجر',
      storeDescription: 'وصف المتجر',
      subdomain: 'النطاق الفرعي',
      customDomain: 'النطاق المخصص',
      contactInfo: 'معلومات التواصل',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      address: 'العنوان',
      city: 'المدينة',
      storeLanguage: 'لغة المتجر',
      currency: 'العملة',
      paymentMethods: 'طرق الدفع',
      cashOnDelivery: 'الدفع عند الاستلام',
      bankTransfer: 'التحويل البنكي',
      creditCard: 'بطاقة ائتمان',
      shippingOptions: 'خيارات الشحن',
      enableShipping: 'تفعيل الشحن',
      shippingCost: 'تكلفة الشحن',
      freeShippingThreshold: 'حد الشحن المجاني',
      notifications: 'الإشعارات',
      emailNotifications: 'إشعارات البريد الإلكتروني',
      smsNotifications: 'إشعارات الرسائل النصية',
      save: 'حفظ التغييرات',
      saving: 'جاري الحفظ...',
      loading: 'جاري التحميل...',
      back: 'رجوع',
      success: 'تم حفظ الإعدادات بنجاح',
      error: 'خطأ في حفظ الإعدادات',
      sar: 'ريال سعودي',
      aed: 'درهم إماراتي',
      kwd: 'دينار كويتي',
      arabic: 'العربية',
      english: 'الإنجليزية'
    },
    en: {
      storeSettings: 'Store Settings',
      generalSettings: 'General Settings',
      paymentSettings: 'Payment Settings',
      shippingSettings: 'Shipping Settings',
      notificationSettings: 'Notification Settings',
      storeName: 'Store Name',
      storeDescription: 'Store Description',
      subdomain: 'Subdomain',
      customDomain: 'Custom Domain',
      contactInfo: 'Contact Information',
      phone: 'Phone Number',
      email: 'Email',
      address: 'Address',
      city: 'City',
      storeLanguage: 'Store Language',
      currency: 'Currency',
      paymentMethods: 'Payment Methods',
      cashOnDelivery: 'Cash on Delivery',
      bankTransfer: 'Bank Transfer',
      creditCard: 'Credit Card',
      shippingOptions: 'Shipping Options',
      enableShipping: 'Enable Shipping',
      shippingCost: 'Shipping Cost',
      freeShippingThreshold: 'Free Shipping Threshold',
      notifications: 'Notifications',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      save: 'Save Changes',
      saving: 'Saving...',
      loading: 'Loading...',
      back: 'Back',
      success: 'Settings saved successfully',
      error: 'Error saving settings',
      sar: 'Saudi Riyal',
      aed: 'UAE Dirham',
      kwd: 'Kuwaiti Dinar',
      arabic: 'Arabic',
      english: 'English'
    }
  };

  const currentText = text[language];

  useEffect(() => {
    loadStoreSettings();
  }, [userData]);

  const loadStoreSettings = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      const stores = await storeService.getByOwner(userData.uid);
      if (stores.length > 0) {
        const storeData = stores[0];
        setStore(storeData);
        
        setFormData({
          name: storeData.name,
          description: storeData.description,
          subdomain: storeData.subdomain,
          customDomain: storeData.customDomain || '',
          phone: storeData.contact.phone,
          email: storeData.contact.email,
          address: storeData.contact.address,
          city: storeData.contact.city,
          currency: storeData.settings.currency,
          language: storeData.settings.language,
          cashOnDelivery: storeData.settings.payment.cashOnDelivery,
          bankTransfer: storeData.settings.payment.bankTransfer,
          creditCard: storeData.settings.payment.creditCard,
          shippingEnabled: storeData.settings.shipping.enabled,
          freeShippingThreshold: storeData.settings.shipping.freeShippingThreshold,
          shippingCost: storeData.settings.shipping.shippingCost
        });
      }
    } catch (error) {
      console.error('Error loading store settings:', error);
      toast({
        title: currentText.error,
        description: 'فشل في تحميل الإعدادات',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!store) return;

    setSaving(true);
    try {
      const updatedStore = {
        name: formData.name,
        description: formData.description,
        subdomain: formData.subdomain,
        customDomain: formData.customDomain || undefined,
        contact: {
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city
        },
        settings: {
          currency: formData.currency,
          language: formData.language,
          shipping: {
            enabled: formData.shippingEnabled,
            freeShippingThreshold: formData.freeShippingThreshold,
            shippingCost: formData.shippingCost
          },
          payment: {
            cashOnDelivery: formData.cashOnDelivery,
            bankTransfer: formData.bankTransfer,
            creditCard: formData.creditCard
          }
        }
      };

      await storeService.update(store.id, updatedStore);

      toast({
        title: currentText.success,
        description: 'تم تحديث إعدادات المتجر'
      });

      loadStoreSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: currentText.error,
        description: 'فشل في حفظ الإعدادات',
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">{currentText.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to="/merchant/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.back}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentText.storeSettings}</h1>
                <p className="text-gray-600">{store?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              >
                <Globe className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {language === 'ar' ? 'EN' : 'عر'}
              </Button>
              
              <Button onClick={handleSaveSettings} disabled={saving} className="btn-gradient">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                    {currentText.saving}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {currentText.save}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center space-x-2 rtl:space-x-reverse">
              <StoreIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{currentText.generalSettings}</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center space-x-2 rtl:space-x-reverse">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">{currentText.paymentSettings}</span>
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">{currentText.shippingSettings}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2 rtl:space-x-reverse">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">{currentText.notificationSettings}</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>{currentText.generalSettings}</CardTitle>
                <CardDescription>إعدادات المتجر الأساسية ومعلومات التواصل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="storeName">{currentText.storeName}</Label>
                    <Input
                      id="storeName"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="اسم متجرك"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subdomain">{currentText.subdomain}</Label>
                    <div className="flex">
                      <Input
                        id="subdomain"
                        value={formData.subdomain}
                        onChange={(e) => handleInputChange('subdomain', e.target.value)}
                        placeholder="mystore"
                        className="rounded-r-none"
                      />
                      <div className="bg-gray-100 border border-l-0 rounded-r px-3 py-2 text-sm text-gray-600">
                        .platform.com
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="storeDescription">{currentText.storeDescription}</Label>
                  <Textarea
                    id="storeDescription"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="وصف قصير عن متجرك ومنتجاتك"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="customDomain">{currentText.customDomain}</Label>
                  <Input
                    id="customDomain"
                    value={formData.customDomain}
                    onChange={(e) => handleInputChange('customDomain', e.target.value)}
                    placeholder="www.mystore.com (اختياري)"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">{currentText.contactInfo}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">{currentText.phone}</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+966 50 123 4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">{currentText.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="info@mystore.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">{currentText.address}</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="عنوان المتجر"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">{currentText.city}</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="المدينة"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="language">{currentText.storeLanguage}</Label>
                      <select
                        id="language"
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="ar">{currentText.arabic}</option>
                        <option value="en">{currentText.english}</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="currency">{currentText.currency}</Label>
                      <select
                        id="currency"
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="SAR">{currentText.sar}</option>
                        <option value="AED">{currentText.aed}</option>
                        <option value="KWD">{currentText.kwd}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>{currentText.paymentSettings}</CardTitle>
                <CardDescription>إعداد طرق الدفع المتاحة لعملائك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{currentText.paymentMethods}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{currentText.cashOnDelivery}</div>
                        <div className="text-sm text-gray-600">الدفع عند استلام الطلب</div>
                      </div>
                      <Switch
                        checked={formData.cashOnDelivery}
                        onCheckedChange={(checked) => handleInputChange('cashOnDelivery', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{currentText.bankTransfer}</div>
                        <div className="text-sm text-gray-600">التحويل البنكي المباشر</div>
                      </div>
                      <Switch
                        checked={formData.bankTransfer}
                        onCheckedChange={(checked) => handleInputChange('bankTransfer', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{currentText.creditCard}</div>
                        <div className="text-sm text-gray-600">الدفع بالبطاقة الائتمانية</div>
                      </div>
                      <Switch
                        checked={formData.creditCard}
                        onCheckedChange={(checked) => handleInputChange('creditCard', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping Settings */}
          <TabsContent value="shipping">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>{currentText.shippingSettings}</CardTitle>
                <CardDescription>إعداد خيارات الشحن والتوصيل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{currentText.enableShipping}</div>
                    <div className="text-sm text-gray-600">تفعيل خدمة الشحن للعملاء</div>
                  </div>
                  <Switch
                    checked={formData.shippingEnabled}
                    onCheckedChange={(checked) => handleInputChange('shippingEnabled', checked)}
                  />
                </div>

                {formData.shippingEnabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="shippingCost">{currentText.shippingCost} (ريال)</Label>
                        <Input
                          id="shippingCost"
                          type="number"
                          value={formData.shippingCost}
                          onChange={(e) => handleInputChange('shippingCost', parseFloat(e.target.value) || 0)}
                          placeholder="25"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <Label htmlFor="freeShippingThreshold">{currentText.freeShippingThreshold} (ريال)</Label>
                        <Input
                          id="freeShippingThreshold"
                          type="number"
                          value={formData.freeShippingThreshold}
                          onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                          placeholder="200"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                      <strong>ملاحظة:</strong> إذا تم تعيين حد الشحن المجاني، فسيكون الشحن مجانياً للطلبات التي تتجاوز هذا المبلغ.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>{currentText.notificationSettings}</CardTitle>
                <CardDescription>إعداد تفضيلات الإشعارات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{currentText.emailNotifications}</div>
                      <div className="text-sm text-gray-600">تلقي إشعارات الطلبات والمبيعات عبر البريد الإلكتروني</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{currentText.smsNotifications}</div>
                      <div className="text-sm text-gray-600">تلقي إشعارات عاجلة عبر الرسائل النصية</div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
