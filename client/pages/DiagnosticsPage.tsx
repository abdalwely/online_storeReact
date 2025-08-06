import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getStores, getProducts, createStore, initializeSampleData, updateStore } from '@/lib/store-management';
import { getStoreApplications, approveStoreApplication } from '@/lib/store-approval-system';

export default function DiagnosticsPage() {
  const { userData } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const allStores = getStores();
      const allApplications = getStoreApplications();
      const allProducts = getProducts();
      
      setStores(allStores);
      setApplications(allApplications);
      setProducts(allProducts);

      const logs = [
        `المتاجر المحفوظة: ${allStores.length}`,
        `طلبات الموافقة: ${allApplications.length}`,
        `المنتجات: ${allProducts.length}`,
        `المستخدم الحالي: ${userData?.email || 'غير مسجل'}`,
        `نوع المستخدم: ${userData?.userType || 'غير محدد'}`,
        `معرف المستخدم: ${userData?.uid || 'غير محدد'}`
      ];

      setDiagnostics(logs);
    } catch (error) {
      console.error('Error loading diagnostics:', error);
    }
  };

  const createTestStore = () => {
    if (!userData) return;

    try {
      const testStore = createStore({
        name: `متجر تجريبي - ${Date.now()}`,
        description: 'متجر للاختبار',
        subdomain: `test-${Date.now()}`,
        ownerId: userData.uid,
        template: 'modern-ecommerce',
        customization: {
          colors: {
            primary: '#ff0000',
            secondary: '#00ff00',
            background: '#ffffff',
            text: '#1e293b',
            accent: '#0000ff',
            headerBackground: '#ffffff',
            footerBackground: '#f8fafc',
            cardBackground: '#ffffff',
            borderColor: '#e5e7eb'
          },
          fonts: {
            heading: 'Cairo',
            body: 'Cairo',
            size: {
              small: '14px',
              medium: '16px',
              large: '18px',
              xlarge: '24px'
            }
          },
          layout: {
            headerStyle: 'modern' as const,
            footerStyle: 'detailed' as const,
            productGridColumns: 4,
            containerWidth: 'normal' as const,
            borderRadius: 'medium' as const,
            spacing: 'normal' as const
          },
          homepage: {
            showHeroSlider: true,
            showFeaturedProducts: true,
            showCategories: true,
            showNewsletter: true,
            showTestimonials: false,
            showStats: true,
            showBrands: false,
            heroImages: [],
            heroTexts: [
              { title: 'متجر تجريبي', subtitle: 'للاختبار فقط', buttonText: 'تسوق الآن' }
            ],
            sectionsOrder: ['hero', 'categories', 'featured', 'stats']
          },
          pages: {
            enableBlog: false,
            enableReviews: true,
            enableWishlist: true,
            enableCompare: false,
            enableLiveChat: false,
            enableFAQ: true,
            enableAboutUs: true,
            enableContactUs: true
          },
          branding: {
            logo: '',
            favicon: '',
            watermark: '',
            showPoweredBy: true
          },
          effects: {
            animations: true,
            transitions: true,
            shadows: true,
            gradients: true
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
            zones: []
          },
          payment: {
            cashOnDelivery: true,
            bankTransfer: false,
            creditCard: false,
            paypal: false,
            stripe: false
          },
          taxes: {
            enabled: false,
            rate: 0,
            includeInPrice: false
          },
          notifications: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: false
          }
        },
        status: 'active' as const
      });

      // إضافة منتجات نموذجية
      initializeSampleData(testStore.id);
      
      loadData();
      console.log('تم إنشاء متجر تجريبي:', testStore);
    } catch (error) {
      console.error('خطأ في إنشاء المتجر التجريبي:', error);
    }
  };

  const clearAllData = () => {
    localStorage.clear();
    sessionStorage.clear();
    loadData();
    console.log('تم مسح جميع البيانات');
  };

  const refreshUserData = () => {
    if (!userData) return;

    try {
      // Force refresh of auth context
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const fixMerchantNames = () => {
    try {
      // إصلاح أسماء التجار في المتاجر
      const allStores = getStores();
      const applications = getStoreApplications();

      let updatedCount = 0;

      console.log('🔧 Starting merchant names fix...');
      console.log('Available stores:', allStores.length);
      console.log('Available applications:', applications.length);

      allStores.forEach(store => {
        console.log(`Checking store: ${store.name} (owner: ${store.ownerId})`);

        const merchantApp = applications.find((app: any) => app.merchantId === store.ownerId);
        if (merchantApp) {
          const newName = `متجر ${merchantApp.merchantData.firstName}`;
          console.log(`Found merchant data: ${merchantApp.merchantData.firstName} ${merchantApp.merchantData.lastName}`);

          if (store.name !== newName) {
            console.log(`✏️ Updating store name from "${store.name}" to "${newName}"`);
            // تحديث اسم المتجر
            updateStore(store.id, {
              name: newName,
              description: `متجر ${merchantApp.merchantData.firstName} للتجارة الإلكترونية`
            });
            updatedCount++;
          } else {
            console.log(`✅ Store name already correct: ${store.name}`);
          }
        } else {
          console.log(`❌ No merchant application found for owner: ${store.ownerId}`);
        }
      });

      // إصلاح بيانات المستخدم الحالي
      if (userData && userData.userType === 'merchant') {
        console.log('🔧 Fixing current user data...');
        const merchantApp = applications.find((app: any) =>
          app.merchantData.email.toLowerCase() === userData.email?.toLowerCase()
        );

        if (merchantApp) {
          console.log(`Found current user's merchant data: ${merchantApp.merchantData.firstName}`);

          // تحديث بيانات fallback_user
          localStorage.setItem('fallback_user', JSON.stringify({
            uid: userData.uid,
            email: userData.email,
            displayName: merchantApp.merchantData.firstName,
            userType: userData.userType,
            firstName: merchantApp.merchantData.firstName,
            lastName: merchantApp.merchantData.lastName
          }));

          console.log('✅ تم إصلاح بيانات المستخدم:', merchantApp.merchantData.firstName);
        } else {
          console.log('❌ No merchant application found for current user');
        }
      }

      loadData();
      console.log(`✅ Fix completed: ${updatedCount} stores updated`);
      alert(`تم إصلاح ${updatedCount} متجر. قم بتحديث الصفحة لرؤية التغييرات.`);
    } catch (error) {
      console.error('Error fixing merchant names:', error);
      alert('حدث خطأ أثناء إصلاح الأسماء');
    }
  };

  const fixDataSync = () => {
    try {
      console.log('🔧 بدء إصلاح مشكلة التزامن...');

      // التأكد من تزامن البيانات بين localStorage و sessionStorage
      const stores = getStores();
      if (stores.length > 0) {
        // نسخ البيانات إلى sessionStorage أيضاً
        sessionStorage.setItem('stores', JSON.stringify(stores));

        // نسخ المنتجات
        const products = getProducts();
        sessionStorage.setItem('products', JSON.stringify(products));

        console.log('✅ تم تزامن البيانات:', {
          stores: stores.length,
          products: products.length
        });

        // إجبار تحديث نظام التزامن
        window.postMessage({
          type: 'FORCE_DATA_SYNC',
          timestamp: Date.now()
        }, '*');

        loadData();
        alert('تم إصلاح مشكلة التزامن. جرب فتح المتجر الآن.');
      } else {
        alert('لا توجد متاجر محفوظة لإصلاحها');
      }
    } catch (error) {
      console.error('Error fixing data sync:', error);
      alert('حدث خطأ أثناء إصلاح التزامن');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">صفحة التشخيص</h1>
          <p className="text-gray-600 mt-2">أدوات لاختبار وتشخيص مشاكل النظام</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* معلومات التشخيص */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات النظام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {diagnostics.map((log, index) => (
                  <div key={index} className="text-sm bg-gray-100 p-2 rounded">
                    {log}
                  </div>
                ))}
              </div>
              <Button onClick={loadData} className="mt-4 w-full">
                تحديث المعلومات
              </Button>
            </CardContent>
          </Card>

          {/* أدوات الاختبار */}
          <Card>
            <CardHeader>
              <CardTitle>أدوات الاختبار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={createTestStore} className="w-full">
                إنشاء متجر تجريبي
              </Button>

              <Button onClick={refreshUserData} className="w-full" variant="outline">
                تحديث بيانات المستخدم
              </Button>

              <Button onClick={fixMerchantNames} className="w-full bg-green-600 hover:bg-green-700">
                إصلاح أسماء التجار
              </Button>

              <Button onClick={fixDataSync} className="w-full bg-purple-600 hover:bg-purple-700">
                إصلاح مشكلة التزامن
              </Button>

              <Button
                onClick={() => {
                  fixMerchantNames();
                  setTimeout(() => window.location.reload(), 2000);
                }}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                إصلاح الأسماء وإعادة التحميل
              </Button>

              <Button
                onClick={clearAllData}
                variant="destructive"
                className="w-full"
              >
                مسح جميع البيانات
              </Button>
            </CardContent>
          </Card>

          {/* المتاجر */}
          <Card>
            <CardHeader>
              <CardTitle>المتاجر ({stores.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {stores.map((store) => (
                  <div key={store.id} className="p-2 bg-gray-100 rounded text-sm">
                    <div><strong>الاسم:</strong> {store.name}</div>
                    <div><strong>الرابط:</strong> {store.subdomain}</div>
                    <div><strong>المالك:</strong> {store.ownerId}</div>
                    <div><strong>الألوان:</strong> {store.customization?.colors?.primary || 'غير محدد'}</div>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.open(`/store/${store.subdomain}`, '_blank')}
                    >
                      فتح المتجر
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* الطلبات */}
          <Card>
            <CardHeader>
              <CardTitle>طلبات الموافقة ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {applications.map((app) => (
                  <div key={app.id} className="p-2 bg-gray-100 rounded text-sm">
                    <div><strong>المتجر:</strong> {app.storeConfig.customization.storeName}</div>
                    <div><strong>التاجر:</strong> {app.merchantData.firstName}</div>
                    <div><strong>الحالة:</strong> {app.status}</div>
                    {app.status === 'pending' && (
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={async () => {
                          const success = await approveStoreApplication(app.id, 'admin_test');
                          if (success) {
                            loadData();
                            console.log('تم قبول الطلب');
                          }
                        }}
                      >
                        موافقة
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
