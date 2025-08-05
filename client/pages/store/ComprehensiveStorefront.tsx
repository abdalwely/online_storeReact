import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  getStoreById, 
  getProducts, 
  getCategories, 
  Store, 
  Product, 
  Category,
  createOrder,
  Address
} from '@/lib/store-management';
import { 
  Search,
  ShoppingCart,
  Heart,
  Star,
  Filter,
  Grid,
  List,
  Plus,
  Minus,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  User,
  Eye,
  ChevronDown,
  Home,
  Package,
  ShoppingBag,
  Calendar,
  CheckCircle
} from 'lucide-react';

interface CartItem {
  productId: string;
  quantity: number;
  variantId?: string;
}

export default function ComprehensiveStorefront() {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Filters
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Checkout
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Saudi Arabia'
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    loadStoreData();
  }, [subdomain]);

  useEffect(() => {
    const page = searchParams.get('page') || 'home';
    const productId = searchParams.get('product');
    
    setCurrentPage(page);
    
    if (productId) {
      const product = products.find(p => p.id === productId);
      setSelectedProduct(product || null);
    }
  }, [searchParams, products]);

  const loadStoreData = async () => {
    try {
      console.log('📊 Loading store data for subdomain:', subdomain);
      
      // Find store by subdomain
      const stores = JSON.parse(localStorage.getItem('stores') || '[]');
      const foundStore = stores.find((s: Store) => s.subdomain === subdomain);
      
      if (!foundStore) {
        console.error('Store not found for subdomain:', subdomain);
        setLoading(false);
        return;
      }
      
      setStore(foundStore);
      
      // Load products and categories
      const storeProducts = getProducts(foundStore.id);
      const storeCategories = getCategories(foundStore.id);
      
      setProducts(storeProducts);
      setCategories(storeCategories);
      
      console.log('✅ Store data loaded:', {
        store: foundStore.name,
        products: storeProducts.length,
        categories: storeCategories.length
      });
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const isActive = product.status === 'active';
    
    return matchesSearch && matchesCategory && matchesPrice && isActive;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const addToCart = (productId: string, quantity: number = 1, variantId?: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => 
        item.productId === productId && item.variantId === variantId
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { productId, quantity, variantId }];
      }
    });
    
    toast({
      title: 'تم إضافة المنتج للسلة',
      description: 'يمكنك مراجعة سلة التسوق الآن'
    });
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart(prev => prev.filter(item => 
      !(item.productId === productId && item.variantId === variantId)
    ));
  };

  const updateCartQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    
    setCart(prev => prev.map(item =>
      item.productId === productId && item.variantId === variantId
        ? { ...item, quantity }
        : item
    ));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
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

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: 'السلة فا��غة',
        description: 'يرجى إضافة منتجات للسلة أولاً',
        variant: 'destructive'
      });
      return;
    }

    try {
      const orderItems = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product?.name || '',
          productImage: product?.images[0] || '',
          variantId: item.variantId,
          variantName: item.variantId ? 'variant' : undefined,
          price: product?.price || 0,
          quantity: item.quantity,
          total: (product?.price || 0) * item.quantity
        };
      });

      const subtotal = getCartTotal();
      const taxAmount = store?.settings.taxes.enabled ? subtotal * (store.settings.taxes.rate / 100) : 0;
      const shippingCost = subtotal >= (store?.settings.shipping.freeShippingThreshold || 0) ? 0 : (store?.settings.shipping.defaultCost || 0);
      const total = subtotal + taxAmount + shippingCost;

      const order = await createOrder({
        storeId: store?.id || '',
        customerId: 'guest_customer',
        items: orderItems,
        subtotal,
        taxAmount,
        shippingCost,
        discountAmount: 0,
        total,
        status: 'pending',
        paymentMethod,
        paymentStatus: 'pending',
        shippingAddress,
        billingAddress: shippingAddress
      });

      toast({
        title: 'تم تأكيد الطلب بنجاح! 🎉',
        description: `رقم الطلب: ${order.orderNumber}`
      });

      // Clear cart and redirect to order confirmation
      setCart([]);
      setSearchParams({ page: 'order-confirmation', order: order.id });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'خطأ في معالجة الطلب',
        description: 'حدث خطأ أثناء معالجة طلبك، يرجى المحاولة مرة أخرى',
        variant: 'destructive'
      });
    }
  };

  const renderHeader = () => (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 text-sm border-b">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">مرحباً بكم في {store?.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">التوصيل المجاني للطلبات أكثر من {store?.settings.shipping.freeShippingThreshold} ر.س</span>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div 
              onClick={() => setSearchParams({ page: 'home' })}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">{store?.name}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
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
              onClick={() => setSearchParams({ page: 'wishlist' })}
              className="relative"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSearchParams({ page: 'cart' })}
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
        <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block pb-4`}>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Button 
              variant={currentPage === 'home' ? 'default' : 'ghost'}
              onClick={() => setSearchParams({ page: 'home' })}
              size="sm"
            >
              <Home className="h-4 w-4 mr-2" />
              الرئيسية
            </Button>
            <Button 
              variant={currentPage === 'products' ? 'default' : 'ghost'}
              onClick={() => setSearchParams({ page: 'products' })}
              size="sm"
            >
              <Package className="h-4 w-4 mr-2" />
              المنتجات
            </Button>
            {categories.map(category => (
              <Button 
                key={category.id}
                variant="ghost"
                onClick={() => {
                  setSelectedCategory(category.name);
                  setSearchParams({ page: 'products', category: category.name });
                }}
                size="sm"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );

  const renderHomepage = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      {store?.customization.homepage.showHeroSlider && (
        <section className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-white text-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                {store.customization.homepage.heroTexts[0]?.title || 'مرحباً بكم في متجرنا'}
              </h1>
              <p className="text-xl mb-6">
                {store.customization.homepage.heroTexts[0]?.subtitle || 'أفضل المنتجات بأسعار مميزة'}
              </p>
              <Button 
                size="lg"
                onClick={() => setSearchParams({ page: 'products' })}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                {store.customization.homepage.heroTexts[0]?.buttonText || 'تسوق الآن'}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {store?.customization.homepage.showCategories && categories.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">تسوق حسب الفئة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map(category => (
              <Card 
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedCategory(category.name);
                  setSearchParams({ page: 'products', category: category.name });
                }}
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
      {store?.customization.homepage.showFeaturedProducts && (
        <section>
          <h2 className="text-2xl font-bold mb-6">المنتجات المميزة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.filter(p => p.featured && p.status === 'active').slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      {store?.customization.homepage.showNewsletter && (
        <section className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">اشترك في النشرة البريدية</h2>
          <p className="text-gray-600 mb-6">احصل على أحدث العروض والمنتجات الجديدة</p>
          <div className="flex max-w-md mx-auto gap-2">
            <Input placeholder="البريد الإلكتروني" className="flex-1" />
            <Button>اشتراك</Button>
          </div>
        </section>
      )}
    </div>
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group cursor-pointer hover:shadow-lg transition-all">
      <div 
        onClick={() => setSearchParams({ page: 'product', product: product.id })}
        className="relative"
      >
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
              <span className="text-lg font-bold">{product.price} ر.س</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through mr-2">{product.originalPrice} ر.س</span>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
              >
                <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'text-red-500 fill-current' : ''}`} />
              </Button>
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
          </div>
        </CardContent>
      </div>
    </Card>
  );

  const renderProductListing = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {selectedCategory ? `منتجات ${selectedCategory}` : 'جميع المنتجات'}
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="price_low">السعر: من الأقل للأعلى</SelectItem>
              <SelectItem value="price_high">السعر: من الأعلى للأقل</SelectItem>
              <SelectItem value="rating">الأعلى تقييماً</SelectItem>
              <SelectItem value="name">الاسم</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                الفلاتر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">البحث</label>
                <Input
                  placeholder="ابحث في المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div>
                <label className="text-sm font-medium mb-2 block">الفئة</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الفئات</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">نطاق السعر</label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={5000}
                  step={50}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{priceRange[0]} ر.س</span>
                  <span>{priceRange[1]} ر.س</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid/List */}
        <div className="lg:col-span-3">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد منتجات</h3>
              <p className="text-gray-600">لم يتم العثور على منتجات تطابق معايير البحث</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {sortedProducts.map(product => (
                viewMode === 'grid' ? (
                  <ProductCard key={product.id} product={product} />
                ) : (
                  <Card key={product.id} className="flex">
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <CardContent className="flex-1 p-4">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-sm text-gray-600">({product.reviewCount})</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold">{product.price} ر.س</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">{product.originalPrice} ر.س</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSearchParams({ page: 'product', product: product.id })}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            عرض
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(product.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            إضافة
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProductDetails = () => {
    if (!selectedProduct) return <div>المنتج غير موجود</div>;

    return (
      <div className="space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <button onClick={() => setSearchParams({ page: 'home' })}>الرئيسية</button>
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          <button onClick={() => setSearchParams({ page: 'products' })}>المنتجات</button>
          <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          <span>{selectedProduct.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <Package className="h-24 w-24 text-gray-400" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
              ))}
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

            {/* Specifications */}
            {Object.keys(selectedProduct.specifications).length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">المواصفات</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              <div className="flex items-center border rounded-lg">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const currentItem = cart.find(item => item.productId === selectedProduct.id);
                    if (currentItem && currentItem.quantity > 1) {
                      updateCartQuantity(selectedProduct.id, currentItem.quantity - 1);
                    }
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 min-w-[60px] text-center">
                  {cart.find(item => item.productId === selectedProduct.id)?.quantity || 1}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const currentItem = cart.find(item => item.productId === selectedProduct.id);
                    const newQuantity = currentItem ? currentItem.quantity + 1 : 2;
                    if (newQuantity <= selectedProduct.stock) {
                      updateCartQuantity(selectedProduct.id, newQuantity);
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                className="flex-1"
                onClick={() => addToCart(selectedProduct.id)}
                disabled={selectedProduct.stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                إضافة للسلة
              </Button>
              <Button 
                variant="outline"
                onClick={() => toggleWishlist(selectedProduct.id)}
              >
                <Heart className={`h-4 w-4 ${wishlist.includes(selectedProduct.id) ? 'text-red-500 fill-current' : ''}`} />
              </Button>
            </div>

            {/* Share */}
            <div>
              <h3 className="font-semibold mb-3">مشاركة المنتج</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section>
          <h2 className="text-2xl font-bold mb-6">منتجات مشابهة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id && p.status === 'active')
              .slice(0, 4)
              .map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </section>
      </div>
    );
  };

  const renderCart = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">سلة التسوق</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">سلة التسوق فارغة</h3>
          <p className="text-gray-600 mb-4">أضف بعض المنتجات للمتابعة</p>
          <Button onClick={() => setSearchParams({ page: 'products' })}>
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
                <Card key={`${item.productId}-${item.variantId}`}>
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
                              onClick={() => updateCartQuantity(item.productId, item.quantity - 1, item.variantId)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 py-2 min-w-[60px] text-center">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => updateCartQuantity(item.productId, item.quantity + 1, item.variantId)}
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
                              onClick={() => removeFromCart(item.productId, item.variantId)}
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
                {store?.settings.taxes.enabled && (
                  <div className="flex justify-between">
                    <span>الضريبة ({store.settings.taxes.rate}%)</span>
                    <span>{(getCartTotal() * store.settings.taxes.rate / 100).toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>الشحن</span>
                  <span>
                    {getCartTotal() >= (store?.settings.shipping.freeShippingThreshold || 0) 
                      ? 'مجاني' 
                      : `${store?.settings.shipping.defaultCost || 0} ر.س`
                    }
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي</span>
                    <span>
                      {(() => {
                        const subtotal = getCartTotal();
                        const tax = store?.settings.taxes.enabled ? subtotal * (store.settings.taxes.rate / 100) : 0;
                        const shipping = subtotal >= (store?.settings.shipping.freeShippingThreshold || 0) ? 0 : (store?.settings.shipping.defaultCost || 0);
                        return (subtotal + tax + shipping).toFixed(2);
                      })()} ر.س
                    </span>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => setSearchParams({ page: 'checkout' })}
                >
                  متابعة للدفع
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  const renderCheckout = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">إتمام الطلب</h1>
      
      {/* Checkout Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {[
            { step: 1, title: 'معلومات العميل' },
            { step: 2, title: 'عنوان الشحن' },
            { step: 3, title: 'طريقة الدفع' },
            { step: 4, title: 'مراجعة الطلب' }
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                checkoutStep >= item.step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {item.step}
              </div>
              <div className="mr-2 rtl:ml-2 rtl:mr-0 hidden md:block">
                <div className="text-xs font-medium">{item.title}</div>
              </div>
              {index < 3 && (
                <div className="w-8 border-t border-gray-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              {checkoutStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">معلومات العميل</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">الاسم الأول</label>
                      <Input
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="الاسم الأول"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الاسم الأخير</label>
                      <Input
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="الاسم الأخير"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                    <Input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="البريد الإلكتروني"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الجوال</label>
                    <Input
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="رقم الجوال"
                    />
                  </div>
                </div>
              )}

              {checkoutStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">عنوان الشحن</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">الاسم الأول</label>
                      <Input
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="الاسم الأول"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الاسم الأخير</label>
                      <Input
                        value={shippingAddress.lastName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="الاسم الأخير"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">العنوان</label>
                    <Input
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                      placeholder="العنوان الكامل"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">المدينة</label>
                      <Select 
                        value={shippingAddress.city}
                        onValueChange={(value) => setShippingAddress(prev => ({ ...prev, city: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المدينة" />
                        </SelectTrigger>
                        <SelectContent>
                          {store?.settings.shipping.zones.map(zone => 
                            zone.cities.map(city => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الرمز البريدي</label>
                      <Input
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                        placeholder="الرمز البريدي"
                      />
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">طريقة الدفع</h3>
                  <div className="space-y-3">
                    {store?.settings.payment.cashOnDelivery && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox 
                          id="cod"
                          checked={paymentMethod === 'cod'}
                          onCheckedChange={() => setPaymentMethod('cod')}
                        />
                        <label htmlFor="cod" className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          الدفع عند الاستلام
                        </label>
                      </div>
                    )}
                    {store?.settings.payment.bankTransfer && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox 
                          id="bank"
                          checked={paymentMethod === 'bank'}
                          onCheckedChange={() => setPaymentMethod('bank')}
                        />
                        <label htmlFor="bank" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          تحويل بنكي
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {checkoutStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">مراجعة الطلب</h3>
                  
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-3">منتجات الطلب</h4>
                    <div className="space-y-2">
                      {cart.map((item) => {
                        const product = products.find(p => p.id === item.productId);
                        if (!product) return null;
                        
                        return (
                          <div key={`${item.productId}-${item.variantId}`} className="flex justify-between">
                            <span>{product.name} × {item.quantity}</span>
                            <span>{product.price * item.quantity} ر.س</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium mb-3">معلومات العميل</h4>
                    <p>{customerInfo.firstName} {customerInfo.lastName}</p>
                    <p>{customerInfo.email}</p>
                    <p>{customerInfo.phone}</p>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-medium mb-3">عنوان الشحن</h4>
                    <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p>{shippingAddress.street}</p>
                    <p>{shippingAddress.city}, {shippingAddress.postalCode}</p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h4 className="font-medium mb-3">طريقة الدفع</h4>
                    <p>{paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'تحويل بنكي'}</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCheckoutStep(prev => Math.max(1, prev - 1))}
                  disabled={checkoutStep === 1}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  السابق
                </Button>
                
                {checkoutStep < 4 ? (
                  <Button
                    onClick={() => setCheckoutStep(prev => Math.min(4, prev + 1))}
                  >
                    التالي
                    <ArrowLeft className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCheckout}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    تأكيد الطلب
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                
                return (
                  <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                    <span>{product.name} × {item.quantity}</span>
                    <span>{product.price * item.quantity} ر.س</span>
                  </div>
                );
              })}
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span>{getCartTotal()} ر.س</span>
                </div>
                {store?.settings.taxes.enabled && (
                  <div className="flex justify-between">
                    <span>الضريبة</span>
                    <span>{(getCartTotal() * store.settings.taxes.rate / 100).toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>الشحن</span>
                  <span>
                    {getCartTotal() >= (store?.settings.shipping.freeShippingThreshold || 0) 
                      ? 'مجاني' 
                      : `${store?.settings.shipping.defaultCost || 0} ر.س`
                    }
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>الإجمالي</span>
                  <span>
                    {(() => {
                      const subtotal = getCartTotal();
                      const tax = store?.settings.taxes.enabled ? subtotal * (store.settings.taxes.rate / 100) : 0;
                      const shipping = subtotal >= (store?.settings.shipping.freeShippingThreshold || 0) ? 0 : (store?.settings.shipping.defaultCost || 0);
                      return (subtotal + tax + shipping).toFixed(2);
                    })()} ر.س
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderOrderConfirmation = () => {
    const orderId = searchParams.get('order');
    
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">تم تأكيد طلبك بنجاح!</h1>
        <p className="text-gray-600">
          شكراً لك على طلبك. سيتم التواصل معك قريباً لتأكيد التفاصيل
        </p>
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-sm text-gray-600">رقم الطلب</p>
            <p className="text-lg font-mono font-bold">#{orderId.slice(-8).toUpperCase()}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setSearchParams({ page: 'home' })}>
            <Home className="h-4 w-4 mr-2" />
            الرجوع للرئيسية
          </Button>
          <Button 
            variant="outline"
            onClick={() => setSearchParams({ page: 'products' })}
          >
            متابعة التسوق
          </Button>
        </div>
      </div>
    );
  };

  const renderWishlist = () => {
    const wishlistProducts = products.filter(p => wishlist.includes(p.id));
    
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">قائمة الأمنيات</h1>
        
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">قائمة الأمنيات فارغة</h3>
            <p className="text-gray-600 mb-4">أضف منتجات تعجبك لحفظها هنا</p>
            <Button onClick={() => setSearchParams({ page: 'products' })}>
              تصفح المنتجات
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFooter = () => (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Store Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">{store?.name}</h3>
            <p className="text-gray-300 mb-4">{store?.description}</p>
            <div className="flex gap-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button onClick={() => setSearchParams({ page: 'home' })} className="hover:text-white">
                  الرئيسية
                </button>
              </li>
              <li>
                <button onClick={() => setSearchParams({ page: 'products' })} className="hover:text-white">
                  المنتجات
                </button>
              </li>
              <li>
                <button onClick={() => setSearchParams({ page: 'about' })} className="hover:text-white">
                  عن المتجر
                </button>
              </li>
              <li>
                <button onClick={() => setSearchParams({ page: 'contact' })} className="hover:text-white">
                  اتصل بنا
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">الفئات</h4>
            <ul className="space-y-2 text-gray-300">
              {categories.slice(0, 4).map(category => (
                <li key={category.id}>
                  <button 
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setSearchParams({ page: 'products', category: category.name });
                    }}
                    className="hover:text-white"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">تواصل معنا</h4>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@{store?.subdomain}.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+966 50 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© 2024 {store?.name}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
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

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">المتجر غير موجود</h1>
          <p className="text-gray-600">لم يتم العثور على المتجر المطلوب</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {renderHeader()}
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'home' && renderHomepage()}
        {currentPage === 'products' && renderProductListing()}
        {currentPage === 'product' && renderProductDetails()}
        {currentPage === 'cart' && renderCart()}
        {currentPage === 'checkout' && renderCheckout()}
        {currentPage === 'order-confirmation' && renderOrderConfirmation()}
        {currentPage === 'wishlist' && renderWishlist()}
      </main>

      {renderFooter()}
    </div>
  );
}
