import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { getStoreBySubdomain, getProductsByStoreId, getStoreCategoriesByStoreId } from '../../lib/firestore';
import { generateStoreCSS, StoreCustomization } from '../../lib/enhanced-templates';
import { 
  Search, ShoppingCart, Heart, User, Menu, Star, Plus, Minus, 
  Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin,
  Filter, Grid, List, ChevronDown, Share2, Eye, TruckIcon
} from 'lucide-react';

const EnhancedStoreFrontend: React.FC = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const navigate = useNavigate();
  
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadStoreData();
  }, [subdomain]);

  useEffect(() => {
    if (store?.customization) {
      applyCustomStyles(store.customization);
    }
  }, [store]);

  const loadStoreData = async () => {
    if (!subdomain) return;

    try {
      setLoading(true);
      const storeData = await getStoreBySubdomain(subdomain);
      if (!storeData) {
        navigate('/404');
        return;
      }

      setStore(storeData);
      
      const [productsData, categoriesData] = await Promise.all([
        getProductsByStoreId(storeData.id),
        getStoreCategoriesByStoreId(storeData.id)
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading store data:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const applyCustomStyles = (customization: StoreCustomization) => {
    const css = generateStoreCSS(customization);
    const styleElement = document.createElement('style');
    styleElement.innerHTML = css;
    document.head.appendChild(styleElement);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'popular':
        return (b.sales || 0) - (a.sales || 0);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const addToWishlist = (product: any) => {
    setWishlistItems(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600">المتجر غير موجود</p>
        </div>
      </div>
    );
  }

  const customization = store.customization as StoreCustomization;

  return (
    <div className="min-h-screen bg-[var(--brand-background)] text-[var(--brand-text)]" dir="rtl">
      {/* Header */}
      <header className={`${
        customization?.layout?.headerStyle === 'fixed' ? 'fixed top-0 z-50' : ''
      } w-full bg-white shadow-sm border-b`}>
        {/* Top Bar */}
        <div className="bg-[var(--brand-primary)] text-white py-2 px-4">
          <div className="container mx-auto flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {store.contact?.phone}
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {store.contact?.email}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {customization?.social?.platforms?.facebook && (
                <a href={customization.social.platforms.facebook} className="hover:opacity-80">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {customization?.social?.platforms?.instagram && (
                <a href={customization.social.platforms.instagram} className="hover:opacity-80">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {customization?.social?.platforms?.twitter && (
                <a href={customization.social.platforms.twitter} className="hover:opacity-80">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              {store.logo ? (
                <img src={store.logo} alt={store.name} className="h-12 w-auto" />
              ) : (
                <h1 className="text-2xl font-bold text-[var(--brand-primary)]">{store.name}</h1>
              )}
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="ابحث عن المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 py-2 rounded-full border-2 border-gray-200 focus:border-[var(--brand-primary)]"
                />
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <Badge className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-1">
                    {wishlistItems.length}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-2 -left-2 bg-[var(--brand-primary)] text-white text-xs px-1">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button variant="ghost" onClick={() => setSelectedCategory('all')}>
                  جميع المنتجات
                </Button>
                {categories.map(category => (
                  <Button 
                    key={category.id}
                    variant="ghost"
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? 'text-[var(--brand-primary)]' : ''}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {customization?.homepage?.heroSection?.enabled && (
        <section className="relative py-20 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              {customization.homepage.heroSection.content.title.ar}
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {customization.homepage.heroSection.content.subtitle.ar}
            </p>
            <Button size="lg" className="bg-white text-[var(--brand-primary)] hover:bg-gray-100">
              {customization.homepage.heroSection.content.ctaText.ar}
            </Button>
          </div>
        </section>
      )}

      {/* Products Section */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters and Sort */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 ml-2" />
              تصفية
            </Button>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="price-low">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value="price-high">السعر: من الأعلى للأقل</SelectItem>
                <SelectItem value="rating">الأعلى تقييماً</SelectItem>
                <SelectItem value="popular">الأكثر مبيعاً</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {sortedProducts.map(product => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative overflow-hidden">
                <img 
                  src={product.images?.[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-2 right-2 space-y-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 rounded-full"
                    onClick={() => addToWishlist(product)}
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''
                      }`} 
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 rounded-full"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                {product.discount && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    خصم {product.discount}%
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--brand-primary)] transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-[var(--brand-primary)]">
                      {product.price} ر.س
                    </span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through mr-2">
                        {product.originalPrice} ر.س
                      </span>
                    )}
                  </div>
                  {product.rating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600 mr-1">{product.rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)]"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 ml-2" />
                    أضف للسلة
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد منتجات متاحة</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Store Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">{store.name}</h3>
              <p className="text-gray-400 mb-4">{store.description}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{store.contact?.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{store.contact?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{store.contact?.address || store.contact?.city}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">عن المتجر</a></li>
                <li><a href="#" className="hover:text-white">الشروط والأحكام</a></li>
                <li><a href="#" className="hover:text-white">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-white">سياسة الاسترجاع</a></li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-lg font-semibold mb-4">الفئات</h4>
              <ul className="space-y-2 text-gray-400">
                {categories.slice(0, 5).map(category => (
                  <li key={category.id}>
                    <a href="#" className="hover:text-white">{category.name}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            {customization?.homepage?.newsletter?.enabled && (
              <div>
                <h4 className="text-lg font-semibold mb-4">
                  {customization.homepage.newsletter.title.ar}
                </h4>
                <p className="text-gray-400 mb-4">
                  {customization.homepage.newsletter.description.ar}
                </p>
                <div className="flex gap-2">
                  <Input 
                    placeholder={customization.homepage.newsletter.placeholder.ar}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Button className="bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)]">
                    {customization.homepage.newsletter.buttonText.ar}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-800 pt-6 text-center text-gray-400">
            <p>&copy; 2024 {store.name}. جميع الحقو�� محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedStoreFrontend;
