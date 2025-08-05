import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { storeService, productService, orderService, Store, Product, Order } from '@/lib/firestore';
import { signOutUser } from '@/lib/auth';
import { 
  Store as StoreIcon, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Eye,
  Settings,
  Plus,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  Globe,
  LogOut,
  Bell
} from 'lucide-react';

export default function MerchantDashboard() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    todayOrders: 0
  });

  const { userData, currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const text = {
    ar: {
      dashboard: 'لوحة التحكل',
      welcome: 'مرحباً',
      storeOverview: 'نظرة عامة على المتجر',
      quickActions: 'إجراءات سريعة',
      recentOrders: 'الطلبات الأخيرة',
      storeStats: 'إحصائيات المتجر',
      totalProducts: 'إجمالي المنتجات',
      totalOrders: 'إجمالي الطلبات',
      pendingOrders: 'الطلبات المعلقة',
      totalRevenue: 'إجمالي الإيرادات',
      monthlyRevenue: 'إيرادات الشهر',
      todayOrders: 'طلبات اليوم',
      addProduct: 'إضافة منتج',
      manageProducts: 'إدارة المنتجات',
      viewOrders: 'عرض الطلبات',
      storeSettings: 'إعدادات المتجر',
      viewStore: 'عرض المتجر',
      storeAnalytics: 'تحليلات المتجر',
      createStore: 'إنشاء متجر',
      noStore: 'لم يتم إنشاء متجر بعد',
      createStoreDesc: 'ابدأ بإنشاء متجرك الإلكتروني الأول',
      storeStatus: 'حالة المتجر',
      active: 'نشط',
      pending: 'قيد المراجعة',
      suspended: 'معلق',
      orderNumber: 'رقم الطلب',
      customer: 'العميل',
      amount: 'المبلغ',
      status: 'الحالة',
      date: 'التاريخ',
      viewAll: 'عرض الكل',
      noOrders: 'لا توجد طلبات',
      noOrdersDesc: 'ستظهر طلباتك هنا عند وصولها',
      loading: 'جاري التحميل...',
      error: 'خطأ في تحميل البيانات',
      logout: 'تسجيل الخروج',
      notifications: 'الإشعارات',
      sar: 'ريال'
    },
    en: {
      dashboard: 'Dashboard',
      welcome: 'Welcome',
      storeOverview: 'Store Overview',
      quickActions: 'Quick Actions',
      recentOrders: 'Recent Orders',
      storeStats: 'Store Statistics',
      totalProducts: 'Total Products',
      totalOrders: 'Total Orders',
      pendingOrders: 'Pending Orders',
      totalRevenue: 'Total Revenue',
      monthlyRevenue: 'Monthly Revenue',
      todayOrders: 'Today Orders',
      addProduct: 'Add Product',
      manageProducts: 'Manage Products',
      viewOrders: 'View Orders',
      storeSettings: 'Store Settings',
      viewStore: 'View Store',
      storeAnalytics: 'Store Analytics',
      createStore: 'Create Store',
      noStore: 'No store created yet',
      createStoreDesc: 'Start by creating your first online store',
      storeStatus: 'Store Status',
      active: 'Active',
      pending: 'Pending Review',
      suspended: 'Suspended',
      orderNumber: 'Order #',
      customer: 'Customer',
      amount: 'Amount',
      status: 'Status',
      date: 'Date',
      viewAll: 'View All',
      noOrders: 'No orders yet',
      noOrdersDesc: 'Your orders will appear here when they arrive',
      loading: 'Loading...',
      error: 'Error loading data',
      logout: 'Logout',
      notifications: 'Notifications',
      sar: 'SAR'
    }
  };

  const currentText = text[language];

  useEffect(() => {
    loadDashboardData();
  }, [userData]);

  const loadDashboardData = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      // Load store data
      const stores = await storeService.getByOwner(userData.uid);
      if (stores.length > 0) {
        const storeData = stores[0];
        setStore(storeData);

        // Load products
        const productsData = await productService.getByStore(storeData.id, 'all');
        setProducts(productsData);

        // Load orders
        const ordersData = await orderService.getByStore(storeData.id);
        setOrders(ordersData);

        // Calculate stats
        const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = ordersData
          .filter(order => {
            const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
          })
          .reduce((sum, order) => sum + order.total, 0);

        const today = new Date().toDateString();
        const todayOrders = ordersData.filter(order => {
          const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
          return orderDate.toDateString() === today;
        }).length;

        setStats({
          totalProducts: productsData.length,
          totalOrders: ordersData.length,
          pendingOrders: ordersData.filter(order => order.orderStatus === 'pending').length,
          totalRevenue,
          monthlyRevenue,
          todayOrders
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: currentText.error,
        description: 'يرجى المحاولة مرة أخرى',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">{currentText.active}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{currentText.pending}</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">{currentText.suspended}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{isArabic ? 'معلق' : 'Pending'}</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">{isArabic ? 'قيد التنفيذ' : 'Processing'}</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800">{isArabic ? 'تم الشحن' : 'Shipped'}</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">{isArabic ? 'تم التوصيل' : 'Delivered'}</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">{isArabic ? 'ملغي' : 'Cancelled'}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="bg-gradient-to-r from-primary to-brand p-2 rounded-lg">
                  <StoreIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">منصة التجارة الذكية</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              >
                <Globe className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {language === 'ar' ? 'EN' : 'عر'}
              </Button>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {currentText.logout}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentText.welcome}, {userData?.firstName}!
          </h1>
          <p className="text-gray-600">{currentText.dashboard}</p>
        </div>

        {!store ? (
          /* No Store Created */
          <Card className="card-shadow text-center py-16">
            <CardHeader>
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <StoreIcon className="h-12 w-12 text-gray-400" />
              </div>
              <CardTitle className="text-2xl">{currentText.noStore}</CardTitle>
              <CardDescription className="text-lg">{currentText.createStoreDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/merchant/store-builder">
                <Button size="lg" className="btn-gradient">
                  <Plus className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.createStore}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          /* Store Exists - Dashboard Content */
          <div className="space-y-8">
            {/* Store Overview */}
            <Card className="card-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <StoreIcon className="h-5 w-5" />
                      <span>{store.name}</span>
                    </CardTitle>
                    <CardDescription>{store.description || 'متجر إلكتروني'}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {getStatusBadge(store.status)}
                    <Link to={`/store/${store.subdomain}`} target="_blank">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {currentText.viewStore}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="card-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{currentText.totalProducts}</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{currentText.totalOrders}</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{currentText.totalRevenue}</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.totalRevenue.toLocaleString()} {currentText.sar}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{currentText.pendingOrders}</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>{currentText.quickActions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link to="/merchant/products">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {currentText.addProduct}
                    </Button>
                  </Link>

                  <Link to="/merchant/products">
                    <Button className="w-full justify-start" variant="outline">
                      <Package className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {currentText.manageProducts}
                    </Button>
                  </Link>

                  <Link to="/merchant/orders">
                    <Button className="w-full justify-start" variant="outline">
                      <ShoppingCart className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {currentText.viewOrders}
                    </Button>
                  </Link>

                  <Link to="/merchant/settings">
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      {currentText.storeSettings}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="card-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{currentText.recentOrders}</CardTitle>
                  <Link to="/merchant/orders">
                    <Button variant="ghost" size="sm">
                      {currentText.viewAll}
                      <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{currentText.noOrders}</h3>
                    <p className="text-gray-600">{currentText.noOrdersDesc}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">{currentText.orderNumber}</th>
                          <th className="text-left py-3 px-2">{currentText.customer}</th>
                          <th className="text-left py-3 px-2">{currentText.amount}</th>
                          <th className="text-left py-3 px-2">{currentText.status}</th>
                          <th className="text-left py-3 px-2">{currentText.date}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 font-medium">#{order.id.slice(-6)}</td>
                            <td className="py-3 px-2">
                              {order.customerInfo.firstName} {order.customerInfo.lastName}
                            </td>
                            <td className="py-3 px-2">
                              {order.total.toLocaleString()} {currentText.sar}
                            </td>
                            <td className="py-3 px-2">{getOrderStatusBadge(order.orderStatus)}</td>
                            <td className="py-3 px-2">
                              {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
