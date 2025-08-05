import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { storeService, orderService, Store, Order } from '@/lib/firestore';
import { 
  Package, 
  Search, 
  Filter, 
  Eye,
  ArrowLeft,
  Loader2,
  Globe,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export default function OrderManagement() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

  const { userData } = useAuth();
  const { toast } = useToast();
  const isArabic = language === 'ar';

  const text = {
    ar: {
      orderManagement: 'إدارة الطلبات',
      searchOrders: 'البحث في الطلبات',
      filterByStatus: 'تصفية بالحالة',
      allOrders: 'جميع الطلبات',
      pending: 'معلق',
      processing: 'قيد التنفيذ',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
      orderNumber: 'رقم الطلب',
      customer: 'العميل',
      items: 'المنتجات',
      total: 'المجموع',
      status: 'الحالة',
      date: 'التاريخ',
      actions: 'الإجراءات',
      view: 'عرض',
      updateStatus: 'تحديث الحالة',
      loading: 'جاري التحميل...',
      noOrders: 'لا توجد طلبات',
      noOrdersDesc: 'لم تتلق أي طلبات بعد',
      back: 'رجوع',
      sar: 'ريال',
      orderDetails: 'تفاصيل الطلب',
      customerInfo: 'معلومات العميل',
      shippingAddress: 'عنوان الشحن',
      paymentMethod: 'طريقة الدفع',
      orderItems: 'عناصر الطلب',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      tax: 'الضريبة',
      totalAmount: 'المبلغ الإجمالي',
      updateOrderStatus: 'تحديث حالة الطلب',
      save: 'حفظ',
      cancel: 'إلغاء'
    },
    en: {
      orderManagement: 'Order Management',
      searchOrders: 'Search orders',
      filterByStatus: 'Filter by status',
      allOrders: 'All Orders',
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      orderNumber: 'Order #',
      customer: 'Customer',
      items: 'Items',
      total: 'Total',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',
      view: 'View',
      updateStatus: 'Update Status',
      loading: 'Loading...',
      noOrders: 'No orders found',
      noOrdersDesc: "You haven't received any orders yet",
      back: 'Back',
      sar: 'SAR',
      orderDetails: 'Order Details',
      customerInfo: 'Customer Information',
      shippingAddress: 'Shipping Address',
      paymentMethod: 'Payment Method',
      orderItems: 'Order Items',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      totalAmount: 'Total Amount',
      updateOrderStatus: 'Update Order Status',
      save: 'Save',
      cancel: 'Cancel'
    }
  };

  const currentText = text[language];

  useEffect(() => {
    loadData();
  }, [userData]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadData = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      // Load store
      const stores = await storeService.getByOwner(userData.uid);
      if (stores.length > 0) {
        const storeData = stores[0];
        setStore(storeData);

        // Load orders
        const ordersData = await orderService.getByStore(storeData.id);
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'خطأ في تحميل البيانات',
        description: 'فشل في تحميل الطلبات',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      
      toast({
        title: 'تم تحديث الحالة',
        description: 'تم تحديث حالة الطلب بنجاح'
      });

      loadData();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'خطأ في التحدي��',
        description: 'فشل في تحديث حالة الطلب',
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: currentText.pending, className: 'bg-yellow-100 text-yellow-800' },
      processing: { text: currentText.processing, className: 'bg-blue-100 text-blue-800' },
      shipped: { text: currentText.shipped, className: 'bg-purple-100 text-purple-800' },
      delivered: { text: currentText.delivered, className: 'bg-green-100 text-green-800' },
      cancelled: { text: currentText.cancelled, className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { text: status, className: 'bg-gray-100 text-gray-800' };

    return <Badge className={config.className}>{config.text}</Badge>;
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
                <h1 className="text-2xl font-bold text-gray-900">{currentText.orderManagement}</h1>
                <p className="text-gray-600">{store?.name}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            >
              <Globe className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {language === 'ar' ? 'EN' : 'عر'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="card-shadow mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={currentText.searchOrders}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rtl:pr-10 rtl:pl-3"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    <SelectValue placeholder={currentText.filterByStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{currentText.allOrders}</SelectItem>
                    <SelectItem value="pending">{currentText.pending}</SelectItem>
                    <SelectItem value="processing">{currentText.processing}</SelectItem>
                    <SelectItem value="shipped">{currentText.shipped}</SelectItem>
                    <SelectItem value="delivered">{currentText.delivered}</SelectItem>
                    <SelectItem value="cancelled">{currentText.cancelled}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="card-shadow text-center py-16">
            <CardContent>
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentText.noOrders}</h3>
              <p className="text-gray-600">{currentText.noOrdersDesc}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="card-shadow hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span>#{order.id.slice(-6)}</span>
                        {getStatusBadge(order.orderStatus)}
                      </CardTitle>
                      <CardDescription>
                        {new Date(order.createdAt).toLocaleDateString('ar-SA')} • {order.items.length} منتج
                      </CardDescription>
                    </div>
                    <div className="text-right rtl:text-left">
                      <div className="text-xl font-bold text-gray-900">
                        {order.total.toLocaleString()} {currentText.sar}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {currentText.customerInfo}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>{order.customerInfo.firstName} {order.customerInfo.lastName}</div>
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-2 rtl:ml-2 rtl:mr-0" />
                          {order.customerInfo.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2 rtl:ml-2 rtl:mr-0" />
                          {order.customerInfo.phone}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Package className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {currentText.orderItems}
                      </h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex justify-between">
                              <span className="truncate">{item.name}</span>
                              <span>×{item.quantity}</span>
                            </div>
                            <div className="text-gray-600">
                              {item.price.toLocaleString()} {currentText.sar}
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{order.items.length - 3} منتجات أخرى
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h4 className="font-medium mb-3">{currentText.actions}</h4>
                      <div className="space-y-2">
                        <Select
                          value={order.orderStatus}
                          onValueChange={(value: any) => handleUpdateStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{currentText.pending}</SelectItem>
                            <SelectItem value="processing">{currentText.processing}</SelectItem>
                            <SelectItem value="shipped">{currentText.shipped}</SelectItem>
                            <SelectItem value="delivered">{currentText.delivered}</SelectItem>
                            <SelectItem value="cancelled">{currentText.cancelled}</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                          {currentText.view}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
