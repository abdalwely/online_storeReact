import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  getStores,
  getStoreByOwnerId,
  getStoreById,
  getProducts,
  getOrders,
  createStore,
  updateStore,
  initializeSampleData,
  updateOrderStatus,
  updateProduct,
  Store,
  Product,
  Order,
  getCustomers,
  Customer
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
  Truck,
  CreditCard,
  FileText,
  Mail,
  UserX,
  Upload,
  Filter,
  Search,
  Download,
  MessageSquare,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Monitor,
  Target,
  TrendingDown,
  PieChart,
  Activity,
  Archive,
  UserPlus,
  BookOpen
} from 'lucide-react';

export default function ComprehensiveMerchantDashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [storePreviewOpen, setStorePreviewOpen] = useState(false);
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    averageRating: 0,
    activeCustomers: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    returnRate: 0,
    topSellingProducts: [] as Product[],
    salesByMonth: [] as { month: string; sales: number }[],
    visitorsCount: 856,
    bounceRate: 34.5
  });

  const [paymentSettings, setPaymentSettings] = useState({
    bankAccount: '',
    paypalEmail: '',
    stripeKey: '',
    cashOnDelivery: true,
    bankTransfer: true
  });

  useEffect(() => {
    if (userData) {
      loadMerchantData();
    }
  }, [userData]);

  // Listen for store data requests from child windows (store pages)
  useEffect(() => {
    const messageHandler = (event) => {
      if (event.data.type === 'REQUEST_STORE_DATA') {
        console.log('🔗 Child window requesting store data for:', event.data.subdomain);
        const stores = getStores();
        const requestedStore = stores.find(s => s.subdomain === event.data.subdomain);

        if (requestedStore) {
          console.log('✅ Sending store data to child window');
          event.source.postMessage({
            type: 'STORE_DATA_RESPONSE',
            stores: stores,
            requestedStore: requestedStore
          }, '*');
        }
      }
    };

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  const loadMerchantData = () => {
    try {
      console.log('📊 Loading comprehensive merchant data for user:', userData?.uid);

      // Clean up any duplicate or incorrect stores first
      const allStores = getStores();
      console.log('🧹 All stores before cleanup:', allStores.length);

      // Remove old test/fallback stores that might conflict, but keep user's actual stores
      const cleanedStores = allStores.filter(store => {
        const isOldTestStore = (store.subdomain === 'store-fallback' ||
                              store.name === 'متجر تجريبي' ||
                              store.ownerId === 'merchant_fallback') &&
                              store.ownerId !== userData?.uid; // Don't remove if it belongs to current user

        if (isOldTestStore) {
          console.log('🧹 Removing old test store:', store.name, store.subdomain);
          return false;
        }
        return true;
      });

      if (cleanedStores.length !== allStores.length) {
        localStorage.setItem('stores', JSON.stringify(cleanedStores));
        console.log('🧹 Cleaned stores, new count:', cleanedStores.length);
      }

      let merchantStore = getStoreByOwnerId(userData?.uid || '');

      // Debug current state
      console.log('🔍 Current user ID:', userData?.uid);
      console.log('🔍 Available stores after cleanup:', cleanedStores.length);
      cleanedStores.forEach(store => {
        console.log(`  - ${store.name} (${store.subdomain}) owned by ${store.ownerId}`);
      });

      // If no store exists for this merchant, create one automatically
      if (!merchantStore && userData?.uid) {
        console.log('🔧 No store found for merchant, creating one...');
        merchantStore = handleCreateStore();

        // Verify the store was created and saved
        if (merchantStore) {
          console.log('✅ Store created successfully:', merchantStore.subdomain);

          // Force save to localStorage to ensure it persists
          const currentStores = getStores();
          const storeExists = currentStores.find(s => s.id === merchantStore.id);
          if (!storeExists) {
            console.log('⚠️ Store not found in localStorage after creation, force saving...');
            currentStores.push(merchantStore);
            localStorage.setItem('stores', JSON.stringify(currentStores));
          }
        }
      }

      // If store exists but has incorrect subdomain, fix it
      else if (merchantStore && (
        merchantStore.subdomain === 'store-fallback' ||
        !merchantStore.subdomain.includes('store-') ||
        merchantStore.subdomain.includes('fallback') ||
        merchantStore.ownerId === 'merchant_fallback' ||
        merchantStore.ownerId !== userData?.uid
      )) {
        const correctSubdomain = `store-${userData?.uid?.slice(-8) || 'default'}`;
        console.log('🔧 Fixing store data:', {
          oldSubdomain: merchantStore.subdomain,
          newSubdomain: correctSubdomain,
          oldOwnerId: merchantStore.ownerId,
          newOwnerId: userData?.uid
        });

        const updatedStore = updateStore(merchantStore.id, {
          subdomain: correctSubdomain,
          ownerId: userData?.uid || '',
          updatedAt: new Date()
        });

        if (updatedStore) {
          merchantStore = updatedStore;
          console.log('✅ Store data fixed successfully:', updatedStore);
          toast({
            title: 'تم إصلاح بيانات المتجر',
            description: `رابط متجرك الآن: ${correctSubdomain}`
          });
        }
      }

      setStore(merchantStore);

      if (merchantStore) {
        const storeProducts = getProducts(merchantStore.id);
        setProducts(storeProducts);

        const storeOrders = getOrders(merchantStore.id);
        setOrders(storeOrders);

        const storeCustomers = getCustomers(merchantStore.id);
        setCustomers(storeCustomers);

        // Calculate comprehensive stats
        const revenue = storeOrders
          .filter(order => order.status === 'delivered')
          .reduce((sum, order) => sum + order.total, 0);

        const thisMonth = new Date().getMonth();
        const monthlyRevenue = storeOrders
          .filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === thisMonth && order.status === 'delivered';
          })
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

        const avgOrderValue = storeOrders.length > 0 ? revenue / storeOrders.length : 0;
        
        const deliveredOrders = storeOrders.filter(order => order.status === 'delivered').length;
        const returnedOrders = storeOrders.filter(order => order.status === 'cancelled').length;
        const returnRate = deliveredOrders > 0 ? (returnedOrders / deliveredOrders) * 100 : 0;

        // Top selling products (mock calculation)
        const topProducts = storeProducts
          .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
          .slice(0, 5);

        // Sales by month (mock data for last 6 months)
        const salesByMonth = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            month: date.toLocaleDateString('ar-SA', { month: 'long' }),
            sales: Math.floor(Math.random() * 50000) + 10000
          };
        }).reverse();

        setStats({
          totalRevenue: revenue,
          totalOrders: storeOrders.length,
          totalProducts: storeProducts.length,
          pendingOrders: pendingOrdersCount,
          lowStockProducts: lowStockCount,
          averageRating: avgRating,
          activeCustomers: storeCustomers.filter(c => c.isActive).length,
          monthlyRevenue,
          conversionRate: 3.4, // Mock data
          averageOrderValue: avgOrderValue,
          returnRate,
          topSellingProducts: topProducts,
          salesByMonth,
          visitorsCount: 856,
          bounceRate: 34.5
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
        description: 'بيانات المستخدم غير متوفر��',
        variant: 'destructive'
      });
      return null;
    }

    try {
      // Clean up old test stores only, not user's actual stores
      const storesBeforeCreation = getStores();
      const cleanedStores = storesBeforeCreation.filter(s => {
        // Only remove test stores that don't belong to current user
        const isTestStore = (s.subdomain === 'store-fallback' ||
                           s.name === 'متجر تجريبي' ||
                           s.ownerId === 'merchant_fallback') &&
                           s.ownerId !== userData?.uid;
        return !isTestStore;
      });

      if (cleanedStores.length !== storesBeforeCreation.length) {
        localStorage.setItem('stores', JSON.stringify(cleanedStores));
        console.log('🧹 Cleaned old test stores before creating new one');
      }

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
            heroImages: ['/hero-1.jpg', '/hero-2.jpg'],
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
            zones: [
              { id: '1', name: 'الرياض', cities: ['الرياض'], cost: 15, estimatedDays: '1-2 يوم' },
              { id: '2', name: 'المنطقة الشرقية', cities: ['الدمام', 'الخبر', 'الجبيل'], cost: 25, estimatedDays: '2-3 أيام' },
              { id: '3', name: 'مكة المك��مة', cities: ['مكة', 'جدة', 'الطائف'], cost: 20, estimatedDays: '2-3 أيام' }
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

      initializeSampleData(newStore.id);

      // Verify data was saved
      console.log('✅ Store created successfully:', newStore);
      console.log('✅ All stores after creation:', getStores());
      console.log('✅ Products after sample data:', getProducts(newStore.id));

      // Double-check localStorage was updated
      const storedStores = localStorage.getItem('stores');
      console.log('✅ Raw localStorage stores after creation:', storedStores);

      // Verify specific store exists
      const verificationStores = getStores();
      const foundStore = verificationStores.find(s => s.id === newStore.id);
      console.log('✅ Verification - store found in localStorage:', foundStore ? 'YES' : 'NO');

      if (foundStore) {
        console.log('✅ Store details in localStorage:', {
          id: foundStore.id,
          name: foundStore.name,
          subdomain: foundStore.subdomain,
          ownerId: foundStore.ownerId
        });
      }

      toast({
        title: '��م إنشاء المتجر بنجاح! 🎉',
        description: `تم إنشاء متجرك: ${newStore.subdomain}`
      });

      return newStore;
    } catch (error) {
      console.error('Error creating store:', error);
      toast({
        title: 'خطأ في إنشاء المتجر',
        description: 'حدث خطأ أثناء إن��اء المتجر، يرجى المحاولة مرة أخرى',
        variant: 'destructive'
      });
      return null;
    }
  };

  const handleOrderStatusUpdate = (orderId: string, newStatus: string) => {
    try {
      updateOrderStatus(orderId, newStatus);
      loadMerchantData();
      toast({
        title: 'تم تحديث حالة الطلب',
        description: `تم تغيير حالة الطلب ��لى ${getStatusLabel(newStatus)}`
      });
    } catch (error) {
      toast({
        title: 'خطأ في تحديث الطلب',
        description: 'حدث خطأ أثناء �����ح��يث حالة الطلب',
        variant: 'destructive'
      });
    }
  };

  const handleProductUpdate = (productId: string, updates: Partial<Product>) => {
    try {
      updateProduct(productId, updates);
      loadMerchantData();
      toast({
        title: 'تم تحديث المنتج',
        description: 'تم حفظ التغييرات بنجاح'
      });
    } catch (error) {
      toast({
        title: 'خطأ في تحديث المنتج',
        description: 'حدث خطأ أثن��ء تحديث المنتج',
        variant: 'destructive'
      });
    }
  };

  const handleSendPromotionalMessage = (customerId: string, message: string) => {
    // Mock implementation
    toast({
      title: 'تم إرسال الرسالة',
      description: 'تم إرسال الرسالة الترويجية بن��اح'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: '��ي الانتظار', variant: 'outline' as const },
      'confirmed': { label: '������د', variant: 'default' as const },
      'processing': { label: 'قيد ��لمعالجة', variant: 'secondary' as const },
      'shipped': { label: 'تم الشحن', variant: 'default' as const },
      'delivered': { label: 'تم التوصيل', variant: 'default' as const },
      'cancelled': { label: 'ملغي', variant: 'destructive' as const },
      'active': { label: 'نشط', variant: 'default' as const },
      'inactive': { label: 'غير نشط', variant: 'secondary' as const },
      'out_of_stock': { label: 'نفد المخ��ون', variant: 'destructive' as const }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      'pending': 'في الانتظار',
      'confirmed': 'مؤكد',
      'processing': 'قيد المعا��جة',
      'shipped': 'تم الشحن',
      'delivered': 'تم التوصيل',
      'cancelled': 'ملغي'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredProducts = products.filter(product => {
    return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
            <CardTitle>مرحباً بك في لوحة التحكم الشاملة</CardTitle>
            <CardDescription>
              لم يتم إنشاء متجرك بعد. ابدأ رحلتك التجارية الآن مع أدوات إدارة متقدمة!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCreateStore}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              إنشاء متجري الإلكتروني المتطور
            </Button>
            <p className="text-sm text-gray-500 text-center mt-4">
              سيتم إنشاء متجرك مع منتجات تجريبية ولوحة تحكم شاملة
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
              <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الشاملة</h1>
              <p className="text-gray-600 mt-2">مرحباً {userData?.firstName}، إدر متجرك بكل احترافية</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/merchant/store-builder')}
                variant="outline"
              >
                <Palette className="h-4 w-4 mr-2" />
                تخصيص المتجر
              </Button>
              <Dialog open={storePreviewOpen} onOpenChange={setStorePreviewOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Eye className="h-4 w-4 mr-2" />
                    معاينة المتجر
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>معاينة المتجر - {store.name}</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 bg-white rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b text-sm space-y-2">
                      <div><strong>معلومات التشخيص:</strong></div>
                      <div>رابط المتجر الم��لي: /store/{store.subdomain}</div>
                      <div>رابط المتجر الكامل: {window.location.origin}/store/{store.subdomain}</div>
                      <div>معرف المتجر: {store.id}</div>
                      <div>اسم المتجر: {store.name}</div>
                      <div>معرف المالك: {store.ownerId}</div>
                      <div className="flex items-center justify-between">
                        <div>
                          حالة ا��رابط:
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          store.subdomain === 'store-fallback' || store.subdomain.includes('fallback') || store.ownerId === 'merchant_fallback' || store.ownerId !== userData?.uid
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                            {store.subdomain === 'store-fallback' || store.subdomain.includes('fallback') || store.ownerId === 'merchant_fallback' || store.ownerId !== userData?.uid
                              ? 'يحتاج إصلاح'
                              : 'صحيح'}
                          </span>
                        </div>
                        {(store.subdomain === 'store-fallback' || store.subdomain.includes('fallback') || store.ownerId === 'merchant_fallback' || store.ownerId !== userData?.uid) && (
                          <Button
                            size="sm"
                            onClick={() => {
                              const correctSubdomain = `store-${userData?.uid?.slice(-8) || 'default'}`;
                              console.log('🔧 Preview fix: updating store', store.id);

                              const updatedStore = updateStore(store.id, {
                                subdomain: correctSubdomain,
                                ownerId: userData?.uid || '',
                                updatedAt: new Date()
                              });

                              if (updatedStore) {
                                console.log('✅ Store updated in preview:', updatedStore);
                                setStore(updatedStore);
                                toast({
                                  title: 'تم إصلاح الرابط',
                                  description: `رابط متجرك الآن: ${updatedStore.subdomain}`
                                });
                                setTimeout(() => {
                                  setStorePreviewOpen(false);
                                  loadMerchantData();
                                }, 1000);
                              } else {
                                console.error('❌ Failed to update store in preview');
                                toast({
                                  title: 'خطأ في الإصلاح',
                                  description: 'فشل في تحديث المتجر',
                                  variant: 'destructive'
                                });
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            إصلاح الآن
                          </Button>
                        )}
                      </div>
                    </div>
                    <iframe
                      src={`/store/${store.subdomain}?debug=true`}
                      className="w-full h-full border-0"
                      title="معاينة المتجر"
                      onLoad={() => {
                        console.log('🔍 Store preview iframe loaded for:', store.subdomain);
                        console.log('🔍 Store data:', store);
                        console.log('🔍 All stores in localStorage:', getStores());
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue} ر.س</p>
                  <p className="text-xs text-green-600">+12% من الشهر الماضي</p>
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
                  <p className="text-xs text-blue-600">+{stats.pendingOrders} طلب معلق</p>
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
                  <p className="text-xs text-orange-600">{stats.lowStockProducts} قارب على النفاد</p>
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
                  <p className="text-sm font-medium text-gray-600">العملاء الن��طون</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
                  <p className="text-xs text-indigo-600">+5 عميل جديد اليوم</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">عدد الزوار</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.visitorsCount}</p>
                  <p className="text-xs text-red-600">معدل الارتداد: {stats.bounceRate}%</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
            <TabsTrigger value="orders">إدارة ��لطلبات</TabsTrigger>
            <TabsTrigger value="customers">إدارة العملاء</TabsTrigger>
            <TabsTrigger value="payments">إعدادات الدفع</TabsTrigger>
            <TabsTrigger value="analytics">التقا��ير والإحصائيات</TabsTrigger>
            <TabsTrigger value="store">إدارة المتجر</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Store Info Card */}
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
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">رابط المتجر</p>
                        <p className="font-medium">{store.subdomain}.store.com</p>
                        {(store.subdomain === 'store-fallback' || !store.subdomain.includes('store-') || store.subdomain.includes('fallback') || store.ownerId === 'merchant_fallback' || store.ownerId !== userData?.uid) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 text-xs bg-yellow-50 border-yellow-200 text-yellow-800"
                            onClick={() => {
                              const correctSubdomain = `store-${userData?.uid?.slice(-8) || 'default'}`;
                              console.log('🔧 Manual fix: changing store data');
                              console.log('🔧 Old data:', {
                                subdomain: store.subdomain,
                                ownerId: store.ownerId,
                                id: store.id
                              });
                              console.log('🔧 New data:', {
                                subdomain: correctSubdomain,
                                ownerId: userData?.uid
                              });

                              const updatedStore = updateStore(store.id, {
                                subdomain: correctSubdomain,
                                ownerId: userData?.uid || '',
                                updatedAt: new Date()
                              });

                              console.log('🔧 Update result:', updatedStore);

                              if (updatedStore) {
                                console.log('✅ Store updated successfully, setting state...');
                                setStore(updatedStore);

                                // Verify the update
                                const verifyStore = getStoreById(store.id);
                                console.log('🔍 Verification check:', verifyStore);

                                toast({
                                  title: 'تم إصلاح بيانات المتجر',
                                  description: `رابط متجرك الآن: ${updatedStore.subdomain}`
                                });

                                // Reload data to ensure consistency
                                setTimeout(() => {
                                  loadMerchantData();
                                }, 1000);
                              } else {
                                console.error('❌ Failed to update store');
                                toast({
                                  title: 'خطأ في الإصلاح',
                                  description: 'فشل في تحديث بيانات المتجر',
                                  variant: 'destructive'
                                });
                              }
                            }}
                          >
                            إصلاح رابط المتجر
                          </Button>
                        )}

                        {/* إعادة إنشاء المتجر كحل أخير */}
                        {(store.subdomain === 'store-fallback' || !store.subdomain.includes('store-') || store.subdomain.includes('fallback') || store.ownerId === 'merchant_fallback' || store.ownerId !== userData?.uid) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 text-xs bg-red-50 border-red-200 text-red-800"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من إعادة إنشاء المتجر؟ سيتم حذف البيانات الحالية.')) {
                                console.log('🔄 Recreating store for user:', userData?.uid);

                                // Delete current store data
                                const existingStores = getStores();
                                const filteredStores = existingStores.filter(s => s.id !== store.id);
                                localStorage.setItem('stores', JSON.stringify(filteredStores));

                                // Create new store
                                const newStore = handleCreateStore();
                                if (newStore) {
                                  setStore(newStore);
                                  toast({
                                    title: 'تم إعادة إنشاء المتجر بنجاح',
                                    description: `رابط متجرك الجديد: ${newStore.subdomain}`
                                  });

                                  setTimeout(() => {
                                    loadMerchantData();
                                  }, 1000);
                                }
                              }
                            }}
                          >
                            إعادة إنشاء المتجر
                          </Button>
                        )}

                        {/* زر إعادة التعيين الشاملة */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs bg-purple-50 border-purple-200 text-purple-800"
                          onClick={() => {
                            if (confirm('هل أنت متأ��د من إعادة تعيين جميع البيانات؟ سيتم تسجيل الخروج وإعادة إنشا�� حساب جديد.')) {
                              console.log('🧹 Resetting all data...');

                              // Clear all localStorage data
                              localStorage.clear();

                              toast({
                                title: 'تم مسح البيانات',
                                description: 'سيتم إعادة تحميل الصفحة وإنشاء حساب جديد'
                              });

                              // Reload page to restart with fresh data
                              setTimeout(() => {
                                window.location.reload();
                              }, 1500);
                            }
                          }}
                        >
                          إعادة تعيين شاملة
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs bg-orange-50 border-orange-200 text-orange-800"
                          onClick={() => {
                            console.log('🧹 Cleaning old stores...');

                            const currentStores = getStores();
                            const before = currentStores.length;

                            const cleanedStores = currentStores.filter(s => {
                              const isTestStore = (s.subdomain === 'store-fallback' ||
                                                 s.name === 'متجر تجريبي' ||
                                                 s.ownerId === 'merchant_fallback') &&
                                                 s.ownerId !== userData?.uid;
                              return !isTestStore;
                            });

                            localStorage.setItem('stores', JSON.stringify(cleanedStores));

                            toast({
                              title: 'تم تنظيف المتاجر القديمة',
                              description: `تم حذف ${before - cleanedStores.length} متجر قديم`
                            });

                            setTimeout(() => {
                              loadMerchantData();
                            }, 1000);
                          }}
                        >
                          تنظيف المتاجر القديمة
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs bg-blue-50 border-blue-200 text-blue-800"
                          onClick={() => {
                            console.log('🔍 localStorage Diagnostic...');
                            console.log('🔍 Raw stores:', localStorage.getItem('stores'));
                            console.log('🔍 Parsed stores:', getStores());
                            console.log('🔍 Current user:', userData?.uid);
                            console.log('🔍 Current store in state:', store);

                            // Force save current store if it exists in state but not in localStorage
                            if (store && userData?.uid) {
                              const currentStores = getStores();
                              const storeExists = currentStores.find(s => s.id === store.id);

                              if (!storeExists) {
                                console.log('🔧 Force saving store to localStorage...');
                                currentStores.push(store);
                                localStorage.setItem('stores', JSON.stringify(currentStores));

                                toast({
                                  title: 'تم حفظ المتجر',
                                  description: 'تم إصلاح مشكلة حفظ المتجر في المتصفح'
                                });
                              } else {
                                toast({
                                  title: 'المتجر محفوظ بالفعل',
                                  description: 'لا توجد مشكلة في البيانات'
                                });
                              }
                            }
                          }}
                        >
                          فحص localStorage
                        </Button>
                      </div>
                      {getStatusBadge(store.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        onClick={() => navigate('/merchant/store-builder')}
                        variant="outline" 
                        className="w-full"
                      >
                        <Palette className="h-4 w-4 mr-2" />
                        تخصيص المتجر
                      </Button>
                      <Button 
                        onClick={() => setStorePreviewOpen(true)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        معاينة المتجر
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    مؤشرات الأداء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">متوسط قيمة الطلب</span>
                      <span className="font-bold">{stats.averageOrderValue.toFixed(0)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">معدل التحويل</span>
                      <span className="font-bold text-green-600">{stats.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">معدل الإرجاع</span>
                      <span className="font-bold text-red-600">{stats.returnRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">متوسط التقييم</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-bold">{stats.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    أحدث الطلبات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">طلب #{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.customer.name} - {order.total} ر.س</p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-gray-500 text-center py-4">لا توجد طلبات بعد</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    ال��نتجات الأعل���� مبيعاً
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topSellingProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.price} ر.س</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{product.reviewCount} مبيعة</p>
                        </div>
                      </div>
                    ))}
                    {stats.topSellingProducts.length === 0 && (
                      <p className="text-gray-500 text-center py-4">لا توجد بيانات مبيعات</p>
                    )}
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
                    ت��بيهات مهم��
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.lowStockProducts > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <Package className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium">منتجات قا��بت على النفاد</p>
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

          {/* Products Management Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إد��رة المنتجات</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="ابحث في المنتجات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button 
                  onClick={() => navigate('/merchant/products/new')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة ��نتج جديد
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.price} ر.س</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(product.status)}
                            <span className="text-xs text-gray-500">مخزون: {product.stock}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs">{product.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedProduct(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>تعديل المنتج</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>السعر</Label>
                                <Input
                                  type="number"
                                  defaultValue={selectedProduct?.price}
                                  onChange={(e) => {
                                    if (selectedProduct) {
                                      handleProductUpdate(selectedProduct.id, { price: Number(e.target.value) });
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <Label>المخزون</Label>
                                <Input
                                  type="number"
                                  defaultValue={selectedProduct?.stock}
                                  onChange={(e) => {
                                    if (selectedProduct) {
                                      handleProductUpdate(selectedProduct.id, { stock: Number(e.target.value) });
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <Label>الحالة</Label>
                                <Select
                                  defaultValue={selectedProduct?.status}
                                  onValueChange={(value) => {
                                    if (selectedProduct) {
                                      handleProductUpdate(selectedProduct.id, { status: value as any });
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">نش��</SelectItem>
                                    <SelectItem value="inactive">غير نشط</SelectItem>
                                    <SelectItem value="out_of_stock">نفد المخزون</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/store/${store.subdomain}/product/${product.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">لا توجد منتجات</p>
                      <Button 
                        onClick={() => navigate('/merchant/products/new')}
                        className="mt-4"
                      >
                        إضاف�� منتج جديد
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Management Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة الطلبات</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="ابحث في الطلبات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="فلترة بالحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الطلبات</SelectItem>
                    <SelectItem value="pending">في الانتظار</SelectItem>
                    <SelectItem value="confirmed">مؤكد</SelectItem>
                    <SelectItem value="processing">قيد المعالجة</SelectItem>
                    <SelectItem value="shipped">تم الشحن</SelectItem>
                    <SelectItem value="delivered">تم التوصيل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold">طلب #{order.orderNumber}</h3>
                            <p className="text-sm text-gray-600">
                              {order.customer.name} - {order.items.length} منتج
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{order.total} ر.س</p>
                            <p className="text-sm text-gray-600">{order.paymentMethod}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleOrderStatusUpdate(order.id, value)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">في الانتظار</SelectItem>
                            <SelectItem value="confirmed">مؤكد</SelectItem>
                            <SelectItem value="processing">قيد المعالجة</SelectItem>
                            <SelectItem value="shipped">تم الشحن</SelectItem>
                            <SelectItem value="delivered">تم التوصيل</SelectItem>
                            <SelectItem value="cancelled">ملغي</SelectItem>
                          </SelectContent>
                        </Select>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>تفا��يل الطلب #{selectedOrder?.orderNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>اسم العميل</Label>
                                  <p className="font-medium">{selectedOrder?.customer.name}</p>
                                </div>
                                <div>
                                  <Label>رقم الهاتف</Label>
                                  <p className="font-medium">{selectedOrder?.customer.phone}</p>
                                </div>
                                <div>
                                  <Label>العنوان</Label>
                                  <p className="font-medium">{selectedOrder?.shippingAddress.street}</p>
                                </div>
                                <div>
                                  <Label>طريقة الدفع</Label>
                                  <p className="font-medium">{selectedOrder?.paymentMethod}</p>
                                </div>
                              </div>
                              <div>
                                <Label>المنتجات</Label>
                                <div className="space-y-2 mt-2">
                                  {selectedOrder?.items.map((item, index) => (
                                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                      <span>{item.name} x {item.quantity}</span>
                                      <span>{item.price * item.quantity} ر.س</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span>الإجمالي</span>
                                <span>{selectedOrder?.total} ر.س</span>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">لا توج�� طلبات</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Management Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة العملاء</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="ابحث في العملاء..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير قائمة العملاء
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{customer.name}</h3>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                          <p className="font-bold">{customer.totalOrders || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">إجمالي المشتريات</p>
                          <p className="font-bold">{customer.totalSpent || 0} ر.س</p>
                        </div>
                        <Badge variant={customer.isActive ? "default" : "secondary"}>
                          {customer.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>إرسال رسالة ترويجية</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>الرسالة</Label>
                                <Textarea placeholder="اكتب رسالتك الت��ويجية هنا..." />
                              </div>
                              <Button 
                                onClick={() => handleSendPromotionalMessage(customer.id, 'رسالة ترويجية')}
                                className="w-full"
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                إر��ال الرسالة
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {customers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">لا يوجد عملاء بعد</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إعدادات الدفع</h2>
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                حفظ الإعدادات
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    طرق الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>الدفع عند الاستل��م</Label>
                      <p className="text-sm text-gray-600">تفعيل الدفع النقدي عند ال��ستلام</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>التحويل البنك��</Label>
                      <p className="text-sm text-gray-600">استقبال المدفوعات عبر التح��يل البنكي</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>فيزا/ماستركارد</Label>
                      <p className="text-sm text-gray-600">قبول البطاقات الائتمانية</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>PayPal</Label>
                      <p className="text-sm text-gray-600">استقبال المدفوعات عبر PayPal</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    معلومات الحساب البنكي
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>رقم الحساب الب��كي</Label>
                    <Input 
                      placeholder="��دخل رقم الحساب البنكي"
                      value={paymentSettings.bankAccount}
                      onChange={(e) => setPaymentSettings({...paymentSettings, bankAccount: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>بريد PayPal الإلكتروني</Label>
                    <Input 
                      placeholder="أدخل بريد PayPal الإلكتروني"
                      value={paymentSettings.paypalEmail}
                      onChange={(e) => setPaymentSettings({...paymentSettings, paypalEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>مفتاح Stripe API</Label>
                    <Input 
                      placeholder="أدخل مفتاح Stripe API"
                      type="password"
                      value={paymentSettings.stripeKey}
                      onChange={(e) => setPaymentSettings({...paymentSettings, stripeKey: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics and Reports Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">التقارير والإ��صائيات</h2>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  اختر التاريخ
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير ا��تقرير
                </Button>
              </div>
            </div>

            {/* Sales Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    المبيعات الشهرية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.salesByMonth.slice(0, 6).map((month, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{month.month}</span>
                        <span className="font-bold">{month.sales.toLocaleString()} ر.س</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    توزيع المبيعات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">الطلبا�� المكتملة</span>
                      <span className="font-bold text-green-600">
                        {orders.filter(o => o.status === 'delivered').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">الطلبات قيد المعالجة</span>
                      <span className="font-bold text-orange-600">
                        {orders.filter(o => ['processing', 'shipped'].includes(o.status)).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">��لطلبات الملغية</span>
                      <span className="font-bold text-red-600">
                        {orders.filter(o => o.status === 'cancelled').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    مؤشرات الأداء الرئيسية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">معدل التحويل</span>
                      <span className="font-bold text-green-600">{stats.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">متوسط قيمة الطلب</span>
                      <span className="font-bold">{stats.averageOrderValue.toFixed(0)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">معدل الارتداد</span>
                      <span className="font-bold text-red-600">{stats.bounceRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">العملاء المتكررون</span>
                      <span className="font-bold text-blue-600">
                        {Math.floor(stats.activeCustomers * 0.3)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  المنتجات الأعلى مبيعاً هذا الشهر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topSellingProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{product.reviewCount} مبيعة</p>
                        <p className="text-sm text-green-600">+{Math.floor(Math.random() * 20 + 5)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  تحليل العملاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.visitorsCount}</p>
                    <p className="text-sm text-gray-600">زائ�� هذا الشهر</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.activeCustomers}</p>
                    <p className="text-sm text-gray-600">عميل نشط</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {Math.floor(stats.activeCustomers * 0.7)}
                    </p>
                    <p className="text-sm text-gray-600">عميل جديد</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.floor(stats.activeCustomers * 0.3)}
                    </p>
                    <p className="text-sm text-gray-600">عميل متكرر</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Store Management Tab */}
          <TabsContent value="store" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">إدارة المتجر</h2>
              <Button onClick={() => setStorePreviewOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Eye className="h-4 w-4 mr-2" />
                معاينة شاملة للمتجر
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Store Customization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    تخصيص المظهر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => navigate('/merchant/store-builder')}
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    تخصيص الألوان والخطوط
                  </Button>
                  <Button 
                    onClick={() => navigate('/merchant/store-builder')}
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    تخصيص تخطيط الصفحات
                  </Button>
                  <Button 
                    onClick={() => navigate('/merchant/store-builder')}
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    ت��سين العرض للجوال
                  </Button>
                </CardContent>
              </Card>

              {/* Store Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    إعدادات المتجر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>اسم ال��تجر</Label>
                    <Input defaultValue={store.name} />
                  </div>
                  <div>
                    <Label>وصف المتجر</Label>
                    <Textarea defaultValue={store.description} />
                  </div>
                  <div>
                    <Label>ر��بط المتجر</Label>
                    <Input defaultValue={`${store.subdomain}.store.com`} disabled />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Store Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  أداء المتجر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">{stats.visitorsCount}</p>
                    <p className="text-sm text-gray-600">زائر هذا الشهر</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                    <p className="text-sm text-gray-600">معدل التحويل</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingDown className="h-8 w-8 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold">{stats.bounceRate}%</p>
                    <p className="text-sm text-gray-600">معدل الارتداد</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">متوسط التقييم</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  الإجراءات السريعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => navigate('/merchant/products/new')}
                    variant="outline" 
                    className="w-full justify-start h-12"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    إضافة منتج جديد
                  </Button>
                  <Button 
                    onClick={() => navigate('/merchant/store-builder')}
                    variant="outline" 
                    className="w-full justify-start h-12"
                  >
                    <Palette className="h-5 w-5 mr-2" />
                    تخصيص المتجر
                  </Button>
                  <Button
                    onClick={() => setStorePreviewOpen(true)}
                    variant="outline"
                    className="w-full justify-start h-12"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    معاينة المتجر
                  </Button>
                  <Button
                    onClick={() => {
                      // Ensure data is available in both storages before opening
                      const stores = getStores();
                      localStorage.setItem('stores', JSON.stringify(stores));
                      sessionStorage.setItem('stores', JSON.stringify(stores));

                      console.log('🚀 Opening store with guaranteed data:', store.subdomain);
                      console.log('🚀 Available stores count:', stores.length);

                      window.open(`/store/${store.subdomain}`, '_blank');
                    }}
                    variant="outline"
                    className="w-full justify-start h-12"
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    فتح المتجر مع البيانات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
