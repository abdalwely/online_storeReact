import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  User,
  CreditCard,
  ArrowLeft
} from 'lucide-react';

interface Order {
  id: string;
  storeId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  shippingMethod: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    district: string;
    postalCode: string;
  };
  tracking?: {
    trackingNumber: string;
    courier: string;
    estimatedDelivery: string;
    currentLocation: string;
  };
}

interface OrderTrackingPageProps {
  store: any;
  onBack: () => void;
}

export default function OrderTrackingPage({ store, onBack }: OrderTrackingPageProps) {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const searchOrder = async () => {
    if (!orderId.trim()) return;
    
    setLoading(true);
    setNotFound(false);
    
    try {
      // Search in localStorage (in real app, this would be API call)
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const foundOrder = orders.find((o: Order) => 
        o.id.includes(orderId.toLowerCase()) || 
        o.id.slice(-8).toLowerCase() === orderId.toLowerCase()
      );
      
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setNotFound(true);
        setOrder(null);
      }
    } catch (error) {
      console.error('Error searching order:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'في انتظار التأكيد',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="h-4 w-4" />
        };
      case 'confirmed':
        return {
          label: 'تم تأكيد الطلب',
          color: 'bg-blue-100 text-blue-800',
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'processing':
        return {
          label: 'قيد التجهيز',
          color: 'bg-purple-100 text-purple-800',
          icon: <Package className="h-4 w-4" />
        };
      case 'shipped':
        return {
          label: 'تم الشحن',
          color: 'bg-indigo-100 text-indigo-800',
          icon: <Truck className="h-4 w-4" />
        };
      case 'delivered':
        return {
          label: 'تم التوصيل',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'cancelled':
        return {
          label: 'ملغي',
          color: 'bg-red-100 text-red-800',
          icon: <AlertCircle className="h-4 w-4" />
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800',
          icon: <Package className="h-4 w-4" />
        };
    }
  };

  const getOrderProgress = (status: string) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(status);
    
    if (status === 'cancelled') {
      return { progress: 0, steps: ['cancelled'] };
    }
    
    return {
      progress: ((currentIndex + 1) / steps.length) * 100,
      steps: steps.slice(0, currentIndex + 1)
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تتبع الطلب</h1>
            <p className="text-gray-600">تابع حالة طلبك خطوة بخطوة</p>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              البحث عن طلب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="أدخل رقم الطلب (مثال: ABC12345)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchOrder()}
                />
                <p className="text-sm text-gray-500 mt-2">
                  يمكنك العثور على رقم الطلب في رسالة التأكيد المرسلة إليك
                </p>
              </div>
              <Button 
                onClick={searchOrder}
                disabled={loading}
                style={{
                  backgroundColor: store?.customization.colors.primary || '#2563eb',
                  color: 'white'
                }}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                بحث
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Not Found Message */}
        {notFound && (
          <Card className="mb-8">
            <CardContent className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لم يتم العثور على الطلب</h3>
              <p className="text-gray-600 mb-4">
                تأكد من رقم الطلب وحاول مرة أخرى
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• تأكد من إدخال رقم الطلب كاملاً</p>
                <p>• تحقق من رسالة التأكيد المرسلة إليك</p>
                <p>• اتصل بخدمة العملاء للمساعد��</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      طلب #{order.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      تم الطلب في {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Badge className={getStatusInfo(order.status).color}>
                    {getStatusInfo(order.status).icon}
                    <span className="mr-1">{getStatusInfo(order.status).label}</span>
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Order Progress */}
            <Card>
              <CardHeader>
                <CardTitle>حالة الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="flex justify-between items-center">
                      <div className={`flex items-center ${order.status === 'pending' ? 'text-blue-600' : 'text-green-600'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'pending' ? 'bg-blue-600' : 'bg-green-600'} text-white`}>
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <span className="mr-2 font-medium">تم الطلب</span>
                      </div>
                      
                      <div className={`flex items-center ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-600' : 'bg-gray-200'} text-white`}>
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <span className="mr-2 font-medium">تم التأكيد</span>
                      </div>
                      
                      <div className={`flex items-center ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-600' : 'bg-gray-200'} text-white`}>
                          <Package className="h-5 w-5" />
                        </div>
                        <span className="mr-2 font-medium">قيد التجهيز</span>
                      </div>
                      
                      <div className={`flex items-center ${['shipped', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['shipped', 'delivered'].includes(order.status) ? 'bg-green-600' : 'bg-gray-200'} text-white`}>
                          <Truck className="h-5 w-5" />
                        </div>
                        <span className="mr-2 font-medium">تم الشحن</span>
                      </div>
                      
                      <div className={`flex items-center ${order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-green-600' : 'bg-gray-200'} text-white`}>
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <span className="mr-2 font-medium">تم التوصيل</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Status Details */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusInfo(order.status).icon}
                      <span className="font-semibold">{getStatusInfo(order.status).label}</span>
                    </div>
                    <p className="text-gray-600">
                      {order.status === 'pending' && 'طلبك في انتظار التأكيد من المتجر'}
                      {order.status === 'confirmed' && 'تم تأكيد طلبك وسيتم البدء في تجهيزه قريباً'}
                      {order.status === 'processing' && 'يتم تجهيز طلبك حالياً وسيتم شحنه قريباً'}
                      {order.status === 'shipped' && 'تم شحن طلبك وهو في طريقه إليك'}
                      {order.status === 'delivered' && 'تم توصيل طلبك بنجاح'}
                      {order.status === 'cancelled' && 'تم إلغاء طلبك'}
                    </p>
                  </div>

                  {/* Tracking Information */}
                  {order.tracking && order.status === 'shipped' && (
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">معلومات الشحن</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">رقم التتبع:</span>
                          <span className="font-medium mr-2">{order.tracking.trackingNumber}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">شركة الشحن:</span>
                          <span className="font-medium mr-2">{order.tracking.courier}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">الموقع الحالي:</span>
                          <span className="font-medium mr-2">{order.tracking.currentLocation}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">التوصيل المتوقع:</span>
                          <span className="font-medium mr-2">{order.tracking.estimatedDelivery}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>المنتجات المطلوبة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-gray-600">الكمية: {item.quantity}</p>
                          <p className="text-gray-600">السعر: {item.price} ر.س</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-lg">{item.total} ر.س</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    معلومات العميل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-gray-600">الاسم:</span>
                    <span className="font-medium mr-2">
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">البريد الإلكتروني:</span>
                    <span className="font-medium mr-2">{order.customerInfo.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">رقم الجوال:</span>
                    <span className="font-medium mr-2">{order.customerInfo.phone}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      عنوان الشحن
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.district}, {order.shippingAddress.city}</p>
                      {order.shippingAddress.postalCode && (
                        <p>الرمز البريدي: {order.shippingAddress.postalCode}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  ملخص الطلب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span>{order.subtotal} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>رسوم الشحن</span>
                    <span>{order.shippingCost === 0 ? 'مجاني' : `${order.shippingCost} ر.س`}</span>
                  </div>
                  {order.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span>ضريبة القيمة المضافة</span>
                      <span>{order.taxAmount.toFixed(2)} ر.س</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي</span>
                    <span 
                      style={{ color: store?.customization.colors.primary || '#16a34a' }}
                    >
                      {order.total.toFixed(2)} ر.س
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    طريقة الدفع: {
                      order.paymentMethod === 'cod' ? 'الدفع عند الاستلام' :
                      order.paymentMethod === 'bank' ? 'تحويل بنكي' :
                      order.paymentMethod === 'card' ? 'بطاقة ائتمانية' :
                      order.paymentMethod
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>تحتاج مساعدة؟</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">اتصل بنا</div>
                      <div className="text-sm text-gray-600">920012345</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">راسلنا</div>
                      <div className="text-sm text-gray-600">support@{store.subdomain}.com</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        {!order && !notFound && (
          <Card>
            <CardHeader>
              <CardTitle>كيفية تتبع طلبك</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">ابحث عن طلبك</h3>
                  <p className="text-sm text-gray-600">
                    أدخل رقم الطلب المرسل إليك في رسالة التأكيد
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">تابع الحالة</h3>
                  <p className="text-sm text-gray-600">
                    شاهد تطور طلبك خطوة بخطوة من التأكيد حتى التوصيل
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">معلومات الشحن</h3>
                  <p className="text-sm text-gray-600">
                    احصل على رقم التتبع ومعلومات شركة الشحن
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
