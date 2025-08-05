import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { storeService, productService, Store, Product } from '@/lib/firestore';
import { generateTemplateCSS } from '@/lib/templates';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Star, 
  Grid3X3, 
  List,
  Filter,
  SortAsc,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Loader2,
  Home,
  DollarSign
} from 'lucide-react';

export default function StoreFrontend() {
  const { storeName } = useParams();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('newest');

  const categories = [
    { id: 'all', name: 'جميع المنتجات', nameEn: 'All Products' },
    { id: 'electronics', name: 'إلكترونيات', nameEn: 'Electronics' },
    { id: 'fashion', name: 'أزياء', nameEn: 'Fashion' },
    { id: 'home', name: 'منزل وحديقة', nameEn: 'Home & Garden' },
    { id: 'sports', name: 'رياضة', nameEn: 'Sports' },
    { id: 'books', name: 'كتب', nameEn: 'Books' }
  ];

  useEffect(() => {
    loadStoreData();
  }, [storeName]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const loadStoreData = async () => {
    if (!storeName) return;

    setLoading(true);
    try {
      // Load store by subdomain
      const storeData = await storeService.getBySubdomain(storeName);
      if (storeData) {
        setStore(storeData);

        // Apply template CSS
        if (storeData.customization) {
          const css = generateTemplateCSS({ 
            id: storeData.template, 
            customization: storeData.customization 
          } as any);
          
          // Create or update style element
          let styleElement = document.getElementById('store-template-styles');
          if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'store-template-styles';
            document.head.appendChild(styleElement);
          }
          styleElement.textContent = css;
        }

        // Load products
        const productsData = await productService.getByStore(storeData.id, 'active');
        setProducts(productsData);

        // Load featured products
        const featuredData = await productService.getFeatured(storeData.id, 8);
        setFeaturedProducts(featuredData);
      }
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
        default:
          const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return bDate.getTime() - aDate.getTime();
      }
    });

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">المتجر غير موجود</h1>
          <p className="text-gray-600">لم يتم العثور على المتجر المطلوب</p>
        </div>
      </div>
    );
  }

  const storeColors = store.customization?.colors || {
    primary: '#FF6B35',
    secondary: '#4A90E2',
    background: '#FFFFFF',
    text: '#333333',
    accent: '#F8F9FA'
  };

  return (
    <div 
      className="min-h-screen rtl"
      style={{ 
        backgroundColor: storeColors.background,
        color: storeColors.text,
        fontFamily: store.customization?.fonts?.primary || 'Cairo'
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 shadow-sm"
        style={{ backgroundColor: storeColors.primary }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Store Name */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-10 w-10 rounded" />
              ) : (
                <div 
                  className="h-10 w-10 rounded flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: storeColors.secondary }}
                >
                  {store.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-white">{store.name}</h1>
                {store.description && (
                  <p className="text-sm text-white/80 hidden sm:block">{store.description}</p>
                )}
              </div>
            </div>

            {/* Search and Cart */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {store.customization?.layout?.showSearch && (
                <div className="hidden sm:block">
                  <div className="relative">
                    <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="البحث في المنتجات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rtl:pr-10 rtl:pl-3 w-64 bg-white/10 border-white/20 text-white placeholder-white/60"
                    />
                  </div>
                </div>
              )}

              {store.customization?.layout?.showWishlist && (
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <Heart className="h-5 w-5" />
                </Button>
              )}

              {store.customization?.layout?.showCart && (
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="ml-1 rtl:mr-1 rtl:ml-0">0</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation/Categories */}
      {store.customization?.layout?.showCategories && (
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8 rtl:space-x-reverse h-12 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap text-sm font-medium border-b-2 py-3 transition-colors ${
                    selectedCategory === category.id
                      ? 'border-current text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  style={{
                    color: selectedCategory === category.id ? storeColors.primary : undefined
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      {store.customization?.layout?.heroSection && (
        <section 
          className="py-16 text-center"
          style={{ backgroundColor: storeColors.accent }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-4">مرحباً بك في {store.name}</h2>
            <p className="text-xl text-gray-600 mb-8">
              {store.description || 'اكتشف مجموعة رائعة من المنتجات عالية الجودة'}
            </p>
            <Button 
              size="lg" 
              className="text-white"
              style={{ backgroundColor: storeColors.primary }}
            >
              تسوق الآن
            </Button>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {store.customization?.layout?.featuredProducts && featuredProducts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">المنتجات المميزة</h2>
              <p className="text-gray-600">اختيارنا المميز من أفضل المنتجات</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                          <p className="text-sm">بدون صورة</p>
                        </div>
                      )}
                    </div>
                    <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      مميز
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                    {product.description && (
                      <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <DollarSign className="h-4 w-4" style={{ color: storeColors.primary }} />
                          <span className="font-bold text-lg">
                            {product.price.toLocaleString()} ريال
                          </span>
                        </div>
                        {product.salePrice && (
                          <div className="text-sm text-gray-500 line-through">
                            {product.salePrice.toLocaleString()} ريال
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full text-white"
                      style={{ backgroundColor: storeColors.primary }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                      أضف للسلة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-12" style={{ backgroundColor: storeColors.accent }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header and Filters */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">جميع المنتجات</h2>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: storeColors.primary,
                  '--tw-ring-color': storeColors.primary 
                } as any}
              >
                <option value="newest">الأحدث</option>
                <option value="name">الاسم</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
              </select>

              {/* View Mode */}
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                  style={{ 
                    backgroundColor: viewMode === 'grid' ? storeColors.primary : 'transparent',
                    color: viewMode === 'grid' ? 'white' : storeColors.primary
                  }}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                  style={{ 
                    backgroundColor: viewMode === 'list' ? storeColors.primary : 'transparent',
                    color: viewMode === 'list' ? 'white' : storeColors.primary
                  }}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          {store.customization?.layout?.showSearch && (
            <div className="sm:hidden mb-6">
              <div className="relative">
                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="البحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rtl:pr-10 rtl:pl-3"
                />
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد منتجات</h3>
              <p className="text-gray-600">لم يتم العثور على منتجات مطابقة لبحثك</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-6'
            }>
              {filteredProducts.map((product) => (
                <Card key={product.id} className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}>
                  <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                    <div className={`bg-gray-100 flex items-center justify-center ${
                      viewMode === 'list' ? 'h-32 rounded-l-lg' : 'h-48 rounded-t-lg'
                    }`}>
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className={`w-full h-full object-cover ${
                            viewMode === 'list' ? 'rounded-l-lg' : 'rounded-t-lg'
                          }`}
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                          <p className="text-sm">بدون صورة</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                      {product.description && (
                        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <DollarSign className="h-4 w-4" style={{ color: storeColors.primary }} />
                            <span className="font-bold text-lg">
                              {product.price.toLocaleString()} ريال
                            </span>
                          </div>
                          {product.salePrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {product.salePrice.toLocaleString()} ريال
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`flex space-x-2 rtl:space-x-reverse ${
                        viewMode === 'list' ? 'flex-col space-y-2 space-x-0' : ''
                      }`}>
                        <Button 
                          className={`text-white ${viewMode === 'list' ? 'w-full' : 'flex-1'}`}
                          style={{ backgroundColor: storeColors.primary }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                          أضف للسلة
                        </Button>
                        {store.customization?.layout?.showWishlist && (
                          <Button 
                            variant="outline" 
                            className={viewMode === 'list' ? 'w-full' : ''}
                            style={{ borderColor: storeColors.primary, color: storeColors.primary }}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Store Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">{store.name}</h3>
              {store.description && (
                <p className="text-gray-300 mb-4">{store.description}</p>
              )}
              <div className="space-y-2">
                {store.contact.phone && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Phone className="h-4 w-4" />
                    <span>{store.contact.phone}</span>
                  </div>
                )}
                {store.contact.email && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Mail className="h-4 w-4" />
                    <span>{store.contact.email}</span>
                  </div>
                )}
                {store.contact.address && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <MapPin className="h-4 w-4" />
                    <span>{store.contact.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-300 hover:text-white">من نحن</a>
                <a href="#" className="block text-gray-300 hover:text-white">سياسة الخصوصية</a>
                <a href="#" className="block text-gray-300 hover:text-white">شروط الخدمة</a>
                <a href="#" className="block text-gray-300 hover:text-white">سياسة الإرجاع</a>
                <a href="#" className="block text-gray-300 hover:text-white">اتصل بنا</a>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-xl font-bold mb-4">تابعنا</h3>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <a href="#" className="text-gray-300 hover:text-white">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {store.name}. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
