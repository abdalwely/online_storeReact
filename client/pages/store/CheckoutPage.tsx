import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  Banknote,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Lock
} from 'lucide-react';

interface CheckoutPageProps {
  cart: any[];
  products: any[];
  store: any;
  onOrderComplete: (orderId: string) => void;
  onBack: () => void;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage({ cart, products, store, onOrderComplete, onBack }: CheckoutPageProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    district: '',
    postalCode: '',
    country: 'SA'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, bank, card
  const [shippingMethod, setShippingMethod] = useState('standard');

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const getShippingCost = () => {
    const total = getCartTotal();
    if (total >= store.settings.shipping.freeShippingThreshold) return 0;
    
    switch (shippingMethod) {
      case 'express': return store.settings.shipping.defaultCost * 2;
      case 'standard': return store.settings.shipping.defaultCost;
      default: return store.settings.shipping.defaultCost;
    }
  };

  const getTaxAmount = () => {
    const subtotal = getCartTotal();
    if (store.settings.taxes.enabled) {
      return (subtotal * store.settings.taxes.rate) / 100;
    }
    return 0;
  };

  const getFinalTotal = () => {
    return getCartTotal() + getShippingCost() + getTaxAmount();
  };

  const validateStep1 = () => {
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: 'معلومات مطلوبة',
        description: 'يرجى إكمال جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.district) {
      toast({
        title: 'عنوان مطلوب',
        description: 'يرجى إكمال عنوان الشحن',
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save order to localStorage (in real app, this would be API call)
      const order = {
        id: orderId,
        storeId: store.id,
        customerInfo,
        shippingAddress,
        items: cart.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            productName: product?.name || '',
            quantity: item.quantity,
            price: product?.price || 0,
            total: (product?.price || 0) * item.quantity
          };
        }),
        subtotal: getCartTotal(),
        shippingCost: getShippingCost(),
        taxAmount: getTaxAmount(),
        total: getFinalTotal(),
        paymentMethod,
        shippingMethod,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      toast({
        title: 'تم إنشاء الطلب بنجاح! 🎉',
        description: `رقم الطلب: ${orderId.slice(-8).toUpperCase()}`
      });
      
      onOrderComplete(orderId);
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'خطأ في إنشاء الطلب',
        description: 'حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saudiCities = [
    'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران',
    'الطائف', 'بريدة', 'تبوك', 'خميس مشيط', 'حائل', 'المجمعة', 'الجبيل', 'الخرج',
    'ينبع', 'الأحساء', 'عرعر', 'سكاكا', 'جيزان', 'نجران', 'الباحة', 'القصيم'
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            العودة للسلة
          </Button>
          <div>
            <h1 className="text-3xl font-bold">إتمام الطلب</h1>
            <p className="text-gray-600">اكمل بياناتك لإتمام عملية الشراء</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {step > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <span className="mr-2 font-medium">المعلومات الشخصية</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {step > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
              </div>
              <span className="mr-2 font-medium">الدفع والشحن</span>
            </div>
            <div className="w-12 h-px bg-gray-300"></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {step > 3 ? <CheckCircle className="h-5 w-5" /> : '3'}
              </div>
              <span className="mr-2 font-medium">تأكيد الطلب</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      المعلومات الشخصية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">الاسم الأول *</Label>
                        <Input
                          id="firstName"
                          value={customerInfo.firstName}
                          onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                          placeholder="أدخل الاسم الأول"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">اسم العائلة *</Label>
                        <Input
                          id="lastName"
                          value={customerInfo.lastName}
                          onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                          placeholder="أدخل اسم العائلة"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        placeholder="example@domain.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">رقم الجوال *</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      عنوان الشحن
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="street">العنوان التفصيلي *</Label>
                      <Input
                        id="street"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        placeholder="رقم المبنى، اسم الشارع، الحي"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">المدينة *</Label>
                        <Select 
                          value={shippingAddress.city} 
                          onValueChange={(value) => setShippingAddress({...shippingAddress, city: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المدينة" />
                          </SelectTrigger>
                          <SelectContent>
                            {saudiCities.map(city => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="district">الحي *</Label>
                        <Input
                          id="district"
                          value={shippingAddress.district}
                          onChange={(e) => setShippingAddress({...shippingAddress, district: e.target.value})}
                          placeholder="اسم الحي"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="postalCode">الرمز البريدي</Label>
                      <Input
                        id="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                        placeholder="12345"
                        dir="ltr"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    if (validateStep1()) {
                      setStep(2);
                    }
                  }}
                  style={{
                    backgroundColor: store?.customization.colors.primary || '#2563eb',
                    color: 'white'
                  }}
                >
                  متابعة للدفع
                  <ArrowLeft className="h-4 w-4 mr-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Shipping Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      طريقة الشحن
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse border rounded-lg p-4">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">شحن عادي</div>
                              <div className="text-sm text-gray-600">3-5 أيام عمل</div>
                            </div>
                            <div className="font-semibold">
                              {getCartTotal() >= store.settings.shipping.freeShippingThreshold ? (
                                <span className="text-green-600">مجاني</span>
                              ) : (
                                `${store.settings.shipping.defaultCost} ر.س`
                              )}
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse border rounded-lg p-4">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express" className="flex-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">شحن سريع</div>
                              <div className="text-sm text-gray-600">1-2 أيام عمل</div>
                            </div>
                            <div className="font-semibold">{store.settings.shipping.defaultCost * 2} ر.س</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      طريقة الدفع
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      {store.settings.payment.cashOnDelivery && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse border rounded-lg p-4">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="flex-1">
                            <div className="flex items-center gap-3">
                              <Banknote className="h-6 w-6 text-green-600" />
                              <div>
                                <div className="font-medium">الدفع عند الاستلام</div>
                                <div className="text-sm text-gray-600">ادفع نقداً عند وصول الطلب</div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      )}
                      
                      {store.settings.payment.bankTransfer && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse border rounded-lg p-4">
                          <RadioGroupItem value="bank" id="bank" />
                          <Label htmlFor="bank" className="flex-1">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-6 w-6 text-blue-600" />
                              <div>
                                <div className="font-medium">تحويل بنكي</div>
                                <div className="text-sm text-gray-600">تحويل للحساب البنكي</div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      )}
                      
                      {store.settings.payment.creditCard && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse border rounded-lg p-4">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="flex-1">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-6 w-6 text-purple-600" />
                              <div>
                                <div className="font-medium">بطاقة ائتمانية</div>
                                <div className="text-sm text-gray-600">فيزا، ماستركارد، مدى</div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      )}
                    </RadioGroup>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    السابق
                  </Button>
                  <Button 
                    className="flex-1" 
                    size="lg"
                    onClick={() => setStep(3)}
                    style={{
                      backgroundColor: store?.customization.colors.primary || '#2563eb',
                      color: 'white'
                    }}
                  >
                    مراجعة الطلب
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    مراجعة وتأكيد الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Info Review */}
                  <div>
                    <h3 className="font-semibold mb-2">معلومات العميل</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p><strong>الاسم:</strong> {customerInfo.firstName} {customerInfo.lastName}</p>
                      <p><strong>البريد الإلكتروني:</strong> {customerInfo.email}</p>
                      <p><strong>الجوال:</strong> {customerInfo.phone}</p>
                    </div>
                  </div>

                  {/* Address Review */}
                  <div>
                    <h3 className="font-semibold mb-2">عنوان الشحن</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>{shippingAddress.street}</p>
                      <p>{shippingAddress.district}, {shippingAddress.city}</p>
                      {shippingAddress.postalCode && <p>الرمز البريدي: {shippingAddress.postalCode}</p>}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold mb-2">المنتجات المطلوبة</h3>
                    <div className="space-y-2">
                      {cart.map(item => {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) return null;
                        return (
                          <div key={item.productId} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                            <div>
                              <span className="font-medium">{product.name}</span>
                              <span className="text-gray-600 mr-2">× {item.quantity}</span>
                            </div>
                            <span className="font-semibold">{product.price * item.quantity} ر.س</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      السابق
                    </Button>
                    <Button 
                      className="flex-1" 
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      style={{
                        backgroundColor: store?.customization.colors.primary || '#2563eb',
                        color: 'white'
                      }}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          جاري معالجة الطلب...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          تأكيد وإرسال الطلب
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2">
                  {cart.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={item.productId} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{product.name}</span>
                          <span className="text-gray-600 mr-1">× {item.quantity}</span>
                        </div>
                        <span>{product.price * item.quantity} ر.س</span>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span>{getCartTotal()} ر.س</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>الشحن</span>
                    <span>
                      {getShippingCost() === 0 ? (
                        <span className="text-green-600">مجاني</span>
                      ) : (
                        `${getShippingCost()} ر.س`
                      )}
                    </span>
                  </div>
                  
                  {store.settings.taxes.enabled && (
                    <div className="flex justify-between">
                      <span>ضريبة القيمة المضافة ({store.settings.taxes.rate}%)</span>
                      <span>{getTaxAmount().toFixed(2)} ر.س</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span 
                    style={{ color: store?.customization.colors.primary || '#16a34a' }}
                  >
                    {getFinalTotal().toFixed(2)} ر.س
                  </span>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>معاملة آمنة ومشفرة</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
