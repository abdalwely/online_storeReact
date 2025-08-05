import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  getStores,
  getProducts,
  getCategories,
  Store,
  Product,
  Category
} from '@/lib/store-management';

// Test function to check localStorage
const testLocalStorageData = () => {
  console.log('🧪 Testing localStorage data...');
  console.log('🧪 Raw stores data:', localStorage.getItem('stores'));
  console.log('🧪 Raw products data:', localStorage.getItem('products'));
  console.log('🧪 Raw categories data:', localStorage.getItem('categories'));

  try {
    const stores = JSON.parse(localStorage.getItem('stores') || '[]');
    console.log('🧪 Parsed stores:', stores);
  } catch (e) {
    console.error('🧪 Error parsing stores:', e);
  }
};
import { 
  Search,
  ShoppingCart,
  Heart,
  Star,
  Package,
  Home,
  ShoppingBag,
  Menu,
  X,
  User,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface CartItem {
  productId: string;
  quantity: number;
}

export default function WorkingStorefront() {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    loadStoreData();
  }, [subdomain]);

  const loadStoreData = () => {
    try {
      // Check for debug mode
      const urlParams = new URLSearchParams(window.location.search);
      const isDebugMode = urlParams.get('debug') === 'true';

      if (isDebugMode) {
        console.log('🐛 DEBUG MODE: WorkingStorefront');
        console.log('🐛 URL Params:', Object.fromEntries(urlParams));
        console.log('🐛 Window location:', window.location.href);
      }

      console.log('📊 Loading store data for subdomain:', subdomain);

      // Test localStorage data
      testLocalStorageData();

      // Get all stores
      const stores = getStores();
      console.log('🔍 Total available stores:', stores.length);
      console.log('🔍 Available stores:', stores.map(s => ({
        id: s.id,
        name: s.name,
        subdomain: s.subdomain,
        status: s.status
      })));

      if (stores.length === 0) {
        console.warn('❌ No stores found in localStorage');
        setLoading(false);
        return;
      }

      // Find store by subdomain
      let foundStore = stores.find(s => s.subdomain === subdomain);
      console.log('🔍 Exact subdomain match:', foundStore ? foundStore.name : 'Not found');

      // If not found by exact subdomain, try alternatives
      if (!foundStore) {
        console.log('🔍 Trying alternative matching for subdomain:', subdomain);

        // Try partial match
        foundStore = stores.find(s =>
          s.subdomain?.includes(subdomain || '') && subdomain !== ''
        );

        if (!foundStore) {
          // Try name match
          foundStore = stores.find(s =>
            s.name.toLowerCase().includes(subdomain?.toLowerCase() || '') && subdomain !== ''
          );
        }

        console.log('🔍 Alternative match result:', foundStore ? foundStore.name : 'Still not found');
      }

      // If still not found, use the first available active store
      if (!foundStore && stores.length > 0) {
        console.log('🔍 Using first available store as fallback...');
        foundStore = stores.find(s => s.status === 'active') || stores[0];
        console.log('🔍 Fallback store:', foundStore ? foundStore.name : 'None available');
      }

      if (!foundStore) {
        console.error('❌ No stores available after all attempts');
        console.error('Subdomain requested:', subdomain);
        console.error('Available stores:', stores);
        setLoading(false);
        return;
      }

      console.log('✅ Found store:', {
        id: foundStore.id,
        name: foundStore.name,
        subdomain: foundStore.subdomain,
        status: foundStore.status
      });

      setStore(foundStore);

      // Load products and categories
      const storeProducts = getProducts(foundStore.id);
      const storeCategories = getCategories(foundStore.id);

      setProducts(storeProducts);
      setCategories(storeCategories);

      console.log('✅ Store data loaded successfully:', {
        store: foundStore.name,
        products: storeProducts.length,
        categories: storeCategories.length
      });

    } catch (error) {
      console.error('❌ Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { productId, quantity }];
      }
    });
    
    toast({
      title: 'تم إضافة المنتج للسلة',
      description: 'يمكنك مراجعة سلة التسوق الآن'
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.productId !== productId));
      return;
    }
    
    setCart(prev => prev.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    product.status === 'active'
  );

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل المتجر...</p>
          <p className="text-sm text-gray-500 mt-2">المطلوب: {subdomain}</p>
        </div>
      </div>
    );
  }

  if (!store) {
    // Debug information
    const stores = getStores();

    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-2xl mx-auto p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">المتجر غير متوفر</h1>
          <p className="text-gray-600 mb-4">
            لم يتم العثور على متجر بالرابط: <strong>{subdomain}</strong>
          </p>

          {stores.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <p className="text-yellow-800 mb-4">لا توجد متاجر في النظام حالياً</p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => {
                    // Create a test store directly
                    const testStore = {
                      name: 'متجر تجريبي',
                      description: 'متجر للاختبار والمعاينة',
                      subdomain: subdomain || 'test-store',
                      ownerId: 'test-user',
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
                          heroImages: [],
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
                          zones: []
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
                      },
                      status: 'active'
                    };

                    // Import the functions we need
                    import('@/lib/store-management').then(({ createStore, initializeSampleData }) => {
                      console.log('🔧 Creating test store with subdomain:', subdomain);
                      const newStore = createStore({
                        ...testStore,
                        subdomain: subdomain || 'test-store' // Use the actual subdomain from URL
                      });
                      initializeSampleData(newStore.id);
                      console.log('✅ Test store created:', newStore);
                      toast({
                        title: 'تم إنشاء المتجر التجريبي',
                        description: 'سيتم إعادة تحميل الصفحة لعرض المتجر'
                      });
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    }).catch(error => {
                      console.error('Error creating test store:', error);
                      toast({
                        title: 'خطأ في إنشاء المتجر',
                        description: 'حدث خطأ أثناء إنشاء المتجر التجريبي',
                        variant: 'destructive'
                      });
                    });
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  إنشاء متجر تجريبي
                </Button>
                <Button onClick={() => navigate('/merchant/dashboard')} className="bg-blue-600 hover:bg-blue-700">
                  إنشاء متجر جديد
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-blue-800 mb-4">المتاجر المتاحة:</p>
              <div className="grid gap-2">
                {stores.slice(0, 5).map(store => (
                  <div key={store.id} className="text-sm">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/store/${store.subdomain}`)}
                      className="w-full text-left justify-start"
                    >
                      {store.name} - {store.subdomain}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </Button>
            <Button
              onClick={() => navigate('/customer/stores')}
              className="bg-green-600 hover:bg-green-700"
            >
              تصفح جميع المتاجر
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group cursor-pointer hover:shadow-lg transition-all">
      <div onClick={() => setSelectedProduct(product)}>
        <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
            <span className="text-sm text-gray-600">({product.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-green-600">{product.price} ر.س</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through mr-2">{product.originalPrice} ر.س</span>
              )}
            </div>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product.id);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-2 text-sm border-b">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">مرحباً بكم في {store.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">التوصيل المجاني للطلبات أكثر من {store.settings.shipping.freeShippingThreshold} ر.س</span>
            </div>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div 
              onClick={() => {
                setCurrentPage('home');
                setSelectedProduct(null);
              }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">{store.name}</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Input
                  placeholder="ابحث عن المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage('cart')}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="pb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant={currentPage === 'home' ? 'default' : 'ghost'}
                onClick={() => {
                  setCurrentPage('home');
                  setSelectedProduct(null);
                }}
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                الرئيسية
              </Button>
              <Button 
                variant={currentPage === 'products' ? 'default' : 'ghost'}
                onClick={() => {
                  setCurrentPage('products');
                  setSelectedProduct(null);
                }}
                size="sm"
              >
                <Package className="h-4 w-4 mr-2" />
                ��لمنتجات
              </Button>
              {categories.map(category => (
                <Button 
                  key={category.id}
                  variant="ghost"
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Homepage */}
        {currentPage === 'home' && !selectedProduct && (
          <div className="space-y-8">
            {/* Hero Section */}
            <section className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-white text-center">
                <div>
                  <h1 className="text-4xl font-bold mb-4">مرحباً بكم في {store.name}</h1>
                  <p className="text-xl mb-6">أفضل المنتجات بأسعار مميزة</p>
                  <Button 
                    size="lg"
                    onClick={() => setCurrentPage('products')}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    تسوق الآن
                  </Button>
                </div>
              </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">تسوق حسب الفئة</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {categories.map(category => (
                    <Card 
                      key={category.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-600" />
                        </div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Featured Products */}
            <section>
              <h2 className="text-2xl font-bold mb-6">المنتجات المميزة</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.filter(p => p.featured && p.status === 'active').slice(0, 8).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Products Page */}
        {currentPage === 'products' && !selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">جميع المنتجات</h1>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-600">لم يتم العثور على منتجات تطابق البحث</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Product Details */}
        {selectedProduct && (
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button onClick={() => setCurrentPage('home')}>الرئيسية</button>
              <ArrowLeft className="h-4 w-4" />
              <button onClick={() => setCurrentPage('products')}>المنتجات</button>
              <ArrowLeft className="h-4 w-4" />
              <span>{selectedProduct.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div>
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-400" />
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{selectedProduct.name}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(selectedProduct.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({selectedProduct.reviewCount} تقييم)</span>
                    <Badge>{selectedProduct.category}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold text-green-600">{selectedProduct.price} ر.س</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-xl text-gray-500 line-through">{selectedProduct.originalPrice} ر.س</span>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">الحالة:</span>
                  {selectedProduct.stock > 0 ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      متوفر ({selectedProduct.stock} قطعة)
                    </Badge>
                  ) : (
                    <Badge variant="destructive">نفد المخزون</Badge>
                  )}
                </div>

                {/* Add to Cart */}
                <div className="flex gap-4">
                  <Button 
                    className="flex-1"
                    onClick={() => addToCart(selectedProduct.id)}
                    disabled={selectedProduct.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    إضافة للسلة
                  </Button>
                  <Button variant="outline">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Page */}
        {currentPage === 'cart' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">سلة التسوق</h1>
            
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">سلة التسوق فارغة</h3>
                <p className="text-gray-600 mb-4">أضف بعض المن��جات للمتابعة</p>
                <Button onClick={() => setCurrentPage('products')}>
                  تصفح المنتجات
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;
                    
                    return (
                      <Card key={item.productId}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-1">{product.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{product.price} ر.س</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center border rounded-lg">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="px-4 py-2 min-w-[60px] text-center">{item.quantity}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                    disabled={item.quantity >= product.stock}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold">{product.price * item.quantity} ر.س</p>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => updateCartQuantity(item.productId, 0)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    حذف
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Order Summary */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>ملخص الطلب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>المجموع الفرعي</span>
                        <span>{getCartTotal()} ر.س</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الشحن</span>
                        <span>
                          {getCartTotal() >= store.settings.shipping.freeShippingThreshold 
                            ? 'مجاني' 
                            : `${store.settings.shipping.defaultCost} ر.س`
                          }
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>الإجمالي</span>
                          <span>
                            {getCartTotal() + (getCartTotal() >= store.settings.shipping.freeShippingThreshold ? 0 : store.settings.shipping.defaultCost)} ر.س
                          </span>
                        </div>
                      </div>
                      <Button className="w-full">
                        متابعة للدفع
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">{store.name}</h3>
              <p className="text-gray-300">{store.description}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <button onClick={() => setCurrentPage('home')} className="hover:text-white">
                    الرئيسية
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentPage('products')} className="hover:text-white">
                    المنتجات
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <div className="space-y-2 text-gray-300">
                <p>info@{store.subdomain}.com</p>
                <p>+966 50 123 4567</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 {store.name}. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
