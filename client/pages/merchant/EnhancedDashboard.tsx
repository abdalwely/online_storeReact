import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getStoreByOwnerId, 
  getProducts, 
  getOrders, 
  createStore,
  initializeSampleData,
  Store, 
  Product, 
  Order 
} from '@/lib/store-management';
import { 
  Store as StoreIcon,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Settings,
  Plus,
  Eye,
  Edit,
  BarChart3,
  DollarSign,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck
} from 'lucide-react';

export default function EnhancedMerchantDashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (userData) {
      loadMerchantData();
    }
  }, [userData]);

  const loadMerchantData = () => {
    try {
      console.log('📊 Loading merchant data for user:', userData?.uid);
      
      // Load store
      let merchantStore = getStoreByOwnerId(userData?.uid || '');

      // تحديث اسم المتجر إذا كان مختلفاً عن الاسم الحقيقي للتاجر
      if (merchantStore && userData?.firstName && userData.firstName !== 'تاجر') {
        const expectedStoreName = `متجر ${userData.firstName}`;
        if (merchantStore.name !== expectedStoreName) {
          console.log('🔧 Updating store name from', merchantStore.name, 'to', expectedStoreName);
          const updatedStore = updateStore(merchantStore.id, {
            name: expectedStoreName,
            description: `متجر ${userData.firstName} للتجارة الإلكترونية`
          });

          if (updatedStore) {
            merchantStore = updatedStore;
            console.log('✅ Store name updated successfully');
            toast({
              title: 'تم تحديث اسم المتجر',
              description: `اسم متجرك الآن: ${expectedStoreName}`
            });
          }
        }
      }

      setStore(merchantStore);

      if (merchantStore) {
        // Load products
        const storeProducts = getProducts(merchantStore.id);
        setProducts(storeProducts);

        // Load orders
        const storeOrders = getOrders(merchantStore.id);
        setOrders(storeOrders);

        // Calculate stats
        const revenue = storeOrders
          .filter(order => order.status === 'delivered')
          .reduce((sum, order) => sum + order.total, 0);

        const pendingOrdersCount = storeOrders.filter(order => 
          ['pending', 'confirmed', 'processing'].includes(order.status)
        ).length;

        const lowStockCount = storeProducts.filter(product => 
          product.stock <= 5 && product.status === 'active'
        ).length;

        const avgRating = storeProducts.length > 0 
          ? storeProducts.reduce((sum, product) => sum + product.rating, 0) / storeProducts.length
          : 0;

        setStats({
          totalRevenue: revenue,
          totalOrders: storeOrders.length,
          totalProducts: storeProducts.length,
          pendingOrders: pendingOrdersCount,
          lowStockProducts: lowStockCount,
          averageRating: avgRating
        });
      }
    } catch (error) {
      console.error('Error loading merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = () => {
    console.log('🚀 Creating new store for merchant:', userData?.uid);
    
    if (!userData) {
      toast({
        title: 'خطأ',
        description: 'بيانات المستخدم غ��ر متوفرة',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create new store with default settings
      const newStore = createStore({
        name: `متجر ${userData.firstName || 'التاجر'}`,
        description: 'متجر إلكتروني متميز',
        subdomain: `store-${userData.uid.slice(-8)}`,
        ownerId: userData.uid,
        template: 'modern-ecommerce',
        customization: {
          colors: {
            primary: '#2563eb',
            secondary: '#64748b',
            background: '#ffffff',
            text: '#1e293b',
            accent: '#f59e0b',
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
              { title: 'مرحباً بكم في متجرنا', subtitle: 'أفضل المنتجات بأسعار مميزة', buttonText: 'تسوق الآن' }
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
            zones: [
              { id: '1', name: 'الرياض', cities: ['الرياض'], cost: 15, estimatedDays: '1-2 يوم' },
              { id: '2', name: 'المنطقة الشرقية', cities: ['الدمام', 'الخبر', 'الجبيل'], cost: 25, estimatedDays: '2-3 أيام' },
              { id: '3', name: 'مكة المكرمة', cities: ['مكة', 'جدة', 'الطائف'], cost: 20, estimatedDays: '2-3 أيام' }
            ]
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
          },
          notifications: {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true
          }
        },
        status: 'active'
      });

      // Initialize sample data
      initializeSampleData(newStore.id);

      toast({
        title: 'تم إنشاء المتجر بنجاح! 🎉',
        description: 'تم إنشاء متجرك مع منتجات تجريبية يمكنك تعديلها'
      });

      // Reload data
      loadMerchantData();
    } catch (error) {
      console.error('Error creating store:', error);
      toast({
        title: 'خطأ في إنشاء المتجر',
        description: 'حدث خطأ أثناء إنشاء المتجر، يرجى المحاولة مرة أخرى',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'في الانتظار', variant: 'outline' as const },
      'confirmed': { label: 'مؤكد', variant: 'default' as const },
      'processing': { label: 'قيد المعالجة', variant: 'secondary' as const },
      'shipped': { label: 'تم الشحن', variant: 'default' as const },
      'delivered': { label: 'تم التوصيل', variant: 'default' as const },
      'cancelled': { label: 'ملغي', variant: 'destructive' as const },
      'active': { label: 'نشط', variant: 'default' as const },
      'inactive': { label: 'غير نشط', variant: 'secondary' as const },
      'out_of_stock': { label: 'نفد المخزون', variant: 'destructive' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <StoreIcon className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>مرحباً بك في لوحة التحكم</CardTitle>
            <CardDescription>
              لم يتم إنشاء متجرك بعد. ابدأ رحلتك التجارية الآن!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCreateStore}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              إنشاء متجري الإلكتروني
            </Button>
            <p className="text-sm text-gray-500 text-center mt-4">
              سيتم إنشاء متجرك مع منتجات تجريبية يمكنك تعديلها لاحقاً
            </p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم التاجر</h1>
              <p className="text-gray-600 mt-2">مرحباً {userData?.firstName}، إدر متجرك بكل سهولة</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/merchant/store-builder')}
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                إعدادات ال��تجر
              </Button>
              <Button 
                onClick={() => window.open(`/store/${store.subdomain}`, '_blank')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                معاينة المتجر
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue} ر.س</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">طلبات معلقة</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Store Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StoreIcon className="h-5 w-5" />
                    معلومات المتجر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{store.name}</h3>
                      <p className="text-gray-600">{store.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-500">رابط المتجر</p>
                        <p className="font-medium">{store.subdomain}.store.com</p>
                      </div>
                      <Badge>{getStatusBadge(store.status)}</Badge>
                    </div>
                    <Button 
                      onClick={() => navigate('/merchant/store-builder')}
                      variant="outline" 
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      تعديل المتجر
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    أحدث الط��بات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">طلب #{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.total} ر.س</p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-gray-500 text-center py-4">لا توجد طلبات بعد</p>
                    )}
                    <Button 
                      onClick={() => navigate('/merchant/orders')}
                      variant="outline" 
                      className="w-full"
                    >
                      عرض جميع الطلبات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {(stats.lowStockProducts > 0 || stats.pendingOrders > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    تنبيهات مهمة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.lowStockProducts > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <Package className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium">منتجات قاربت على النفاد</p>
                          <p className="text-sm text-gray-600">{stats.lowStockProducts} منتج بحاجة لإعادة تخزين</p>
                        </div>
                      </div>
                    )}
                    {stats.pendingOrders > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">طلبات في انتظار المعالجة</p>
                          <p className="text-sm text-gray-600">{stats.pendingOrders} طلب بحاجة لمتابعة</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
              <Button 
                onClick={() => navigate('/merchant/products/new')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة منتج جديد
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.price} ر.س</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(product.status)}
                            <span className="text-xs text-gray-500">مخزون: {product.stock}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">لا توجد منتجات ��عد</p>
                      <Button 
                        onClick={() => navigate('/merchant/products/new')}
                        className="mt-4"
                      >
                        إضافة منتج جديد
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
              <div className="flex gap-2">
                <Button variant="outline">تصدير</Button>
                <Button variant="outline">فلترة</Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">طلب #{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {order.items.length} منتج - {order.total} ر.س
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <Button variant="outline" size="sm">
                          عرض التفاصيل
                        </Button>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">لا توجد طلبات بعد</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>نظرة عامة على الأداء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>متوسط التقييم</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{stats.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل إتمام الطلبات</span>
                      <span>
                        {stats.totalOrders > 0 
                          ? ((orders.filter(o => o.status === 'delivered').length / stats.totalOrders) * 100).toFixed(1)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الإجراءات السريعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/merchant/products/new')}
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة منتج جديد
                    </Button>
                    <Button 
                      onClick={() => navigate('/merchant/store-builder')}
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      تخصيص المتجر
                    </Button>
                    <Button 
                      onClick={() => window.open(`/store/${store.subdomain}`, '_blank')}
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      معاينة المتجر
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
