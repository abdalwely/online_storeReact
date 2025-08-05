import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  getStoreById,
  getProducts,
  getOrders,
  Store,
  Product,
  Order
} from '@/lib/store-management';
import { 
  Store as StoreIcon,
  Package,
  ShoppingCart,
  Heart,
  Star,
  Search,
  Filter,
  Grid3X3,
  List,
  ArrowLeft,
  Eye,
  Plus,
  Minus,
  ShoppingBag,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function CustomerStoreDashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<{[productId: string]: number}>({});
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    loadSelectedStore();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const loadSelectedStore = () => {
    try {
      const selectedStoreId = localStorage.getItem('selectedStoreId');
      
      if (!selectedStoreId) {
        toast({
          title: 'لم يتم اختيار متجر',
          description: 'يرجى اختيار متجر من القائمة المتاحة',
          variant: 'destructive'
        });
        navigate('/customer/stores');
        return;
      }

      const store = getStoreById(selectedStoreId);
      
      if (!store) {
        toast({
          title: 'المتجر غير موجود',
          description: 'المتجر المختار لم يعد متاحاً',
          variant: 'destructive'
        });
        navigate('/customer/stores');
        return;
      }

      setSelectedStore(store);
      
      // Load store products
      const storeProducts = getProducts(store.id);
      setProducts(storeProducts);
      setFilteredProducts(storeProducts);

      // Load customer orders for this store
      const allOrders = getOrders(store.id);
      const customerStoreOrders = allOrders.filter(order => 
        order.customer.email === userData?.email
      );
      setCustomerOrders(customerStoreOrders);

      // Load cart from localStorage
      const savedCart = localStorage.getItem(`cart_${store.id}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      // Load wishlist from localStorage
      const savedWishlist = localStorage.getItem(`wishlist_${store.id}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }

    } catch (error) {
      console.error('Error loading selected store:', error);
      toast({
        title: 'خطأ في تحميل المتجر',
        description: 'حدث خطأ أثناء تحميل بيانات المتجر',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!selectedStore) return;
    
    const newCart = { ...cart };
    newCart[product.id] = (newCart[product.id] || 0) + quantity;
    
    setCart(newCart);
    localStorage.setItem(`cart_${selectedStore.id}`, JSON.stringify(newCart));
    
    toast({
      title: 'تم إضافة المنتج للسلة',
      description: `تم إضافة ${product.name} إلى سلة التسوق`
    });
  };

  const removeFromCart = (productId: string) => {
    if (!selectedStore) return;
    
    const newCart = { ...cart };
    if (newCart[productId] > 1) {
      newCart[productId]--;
    } else {
      delete newCart[productId];
    }
    
    setCart(newCart);
    localStorage.setItem(`cart_${selectedStore.id}`, JSON.stringify(newCart));
  };

  const toggleWishlist = (productId: string) => {
    if (!selectedStore) return;
    
    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    
    setWishlist(newWishlist);
    localStorage.setItem(`wishlist_${selectedStore.id}`, JSON.stringify(newWishlist));
    
    toast({
      title: wishlist.includes(productId) ? 'تم إزالة المنتج من المفضلة' : 'تم إضافة المنتج للمفضلة',
      description: 'تم تحديث قائمة المفضلة بنجاح'
    });
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories;
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const getCartItemsCount = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>لم يتم اختيار متجر</CardTitle>
            <CardDescription>
              يرجى اختيار متجر من القائمة المتاحة أولاً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/customer/stores')}
              className="w-full"
            >
              اختيار متجر
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
                onClick={() => navigate('/customer/stores')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                تغيير المتجر
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedStore.name}</h1>
                <p className="text-gray-600 mt-2">{selectedStore.description}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-center">
                <Button 
                  variant="outline"
                  className="relative"
                  onClick={() => navigate(`/store/${selectedStore.subdomain}/cart`)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  الس��ة
                  {getCartItemsCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1">
                      {getCartItemsCount()}
                    </Badge>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-1">{getCartTotal()} ر.س</p>
              </div>
              <Button 
                onClick={() => window.open(`/store/${selectedStore.subdomain}`, '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                عرض المتجر الكامل
              </Button>
            </div>
          </div>
        </div>

        {/* Store Info Banner */}
        <Card className="mb-8" style={{
          background: `linear-gradient(135deg, ${selectedStore.customization?.colors?.primary || '#2563eb'} 0%, ${selectedStore.customization?.colors?.secondary || '#64748b'} 100%)`
        }}>
          <CardContent className="p-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm opacity-90">منتج متاح</p>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {products.length > 0 
                    ? (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)
                    : '0'
                  }
                </p>
                <p className="text-sm opacity-90">متوسط التقييم</p>
              </div>
              <div className="text-center">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{customerOrders.length}</p>
                <p className="text-sm opacity-90">طلباتي</p>
              </div>
              <div className="text-center">
                <Heart className="h-8 w-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{wishlist.length}</p>
                <p className="text-sm opacity-90">المفضلة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="orders">طلباتي</TabsTrigger>
            <TabsTrigger value="wishlist">المفضلة</TabsTrigger>
            <TabsTrigger value="profile">ملفي الشخصي</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">منتجات {selectedStore.name}</h2>
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
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">جميع الفئات</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'لم يتم العثور ��لى منتجات تطابق بحثك' : 'لا توجد منتجات في هذا المتجر حالياً'}
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'}>
                      {viewMode === 'grid' ? (
                        <div className="space-y-4">
                          <div className="relative">
                            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                              {product.images?.[0] ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-16 w-16 text-gray-400" />
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => toggleWishlist(product.id)}
                            >
                              <Heart 
                                className={`h-4 w-4 ${wishlist.includes(product.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-gray-400'
                                }`} 
                              />
                            </Button>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            <Badge variant="outline" className="mt-2">{product.category}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-green-600">{product.price} ر.س</p>
                              {product.originalPrice && (
                                <p className="text-sm text-gray-500 line-through">{product.originalPrice} ر.س</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm">{product.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {cart[product.id] ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromCart(product.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-medium">{cart[product.id]}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addToCart(product)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                onClick={() => addToCart(product)}
                                className="flex-1"
                                disabled={product.stock === 0}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                {product.stock === 0 ? 'نفد المخزون' : 'إضافة للسلة'}
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 text-center">
                            متوفر: {product.stock} قطعة
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            {product.images?.[0] ? (
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{product.name}</h3>
                                <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                                <Badge variant="outline" className="mt-1">{product.category}</Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleWishlist(product.id)}
                              >
                                <Heart 
                                  className={`h-4 w-4 ${wishlist.includes(product.id) 
                                    ? 'fill-red-500 text-red-500' 
                                    : 'text-gray-400'
                                  }`} 
                                />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="text-xl font-bold text-green-600">{product.price} ر.س</p>
                                  {product.originalPrice && (
                                    <p className="text-sm text-gray-500 line-through">{product.originalPrice} ر.س</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm">{product.rating}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {cart[product.id] ? (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeFromCart(product.id)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-medium">{cart[product.id]}</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addToCart(product)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button 
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock === 0}
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    {product.stock === 0 ? 'نفد المخزون' : 'إضافة للسلة'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">طلباتي من {selectedStore.name}</h2>
            
            {customerOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
                <p className="text-gray-600">لم تقم بأي طلبات من هذا المتجر بعد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">طلب #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">
                            {order.items.length} منتج - {order.total} ر.س
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={order.status === 'delivered' ? 'default' : 'outline'}
                          >
                            {order.status === 'pending' && 'في الانتظار'}
                            {order.status === 'confirmed' && 'مؤكد'}
                            {order.status === 'processing' && 'قيد المعالجة'}
                            {order.status === 'shipped' && 'تم الشحن'}
                            {order.status === 'delivered' && 'تم التوصيل'}
                            {order.status === 'cancelled' && 'ملغي'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <h2 className="text-2xl font-bold">قائمة المفضلة</h2>
            
            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">قائمة المفضلة فارغة</h3>
                <p className="text-gray-600">لم تضف أي منتجات إلى قائمة المفضلة بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map((productId) => {
                  const product = products.find(p => p.id === productId);
                  if (!product) return null;
                  
                  return (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="relative">
                            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                              {product.images?.[0] ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-16 w-16 text-gray-400" />
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => toggleWishlist(product.id)}
                            >
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </Button>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold text-green-600">{product.price} ر.س</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm">{product.rating}</span>
                            </div>
                          </div>
                          <Button 
                            onClick={() => addToCart(product)}
                            className="w-full"
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.stock === 0 ? 'نفد المخزون' : 'إضافة للسلة'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold">ملفي الشخصي في {selectedStore.name}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    معلوماتي الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">الاسم</p>
                      <p className="font-medium">{userData?.firstName} {userData?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                      <p className="font-medium">{userData?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">تاريخ الانضمام</p>
                      <p className="font-medium">
                        {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('ar-SA') : 'غير متوفر'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    إحصائياتي في المتجر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{customerOrders.length}</p>
                      <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {customerOrders.reduce((sum, order) => sum + order.total, 0)} ر.س
                      </p>
                      <p className="text-sm text-gray-600">إجمالي المشتريات</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{wishlist.length}</p>
                      <p className="text-sm text-gray-600">المنتجات المفضلة</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{getCartItemsCount()}</p>
                      <p className="text-sm text-gray-600">في السلة حالياً</p>
                    </div>
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
