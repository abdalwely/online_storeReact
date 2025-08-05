import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  getStores,
  getProducts,
  Store
} from '@/lib/store-management';
import { 
  Store as StoreIcon,
  Search,
  ShoppingBag,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  Grid3X3,
  Users,
  Package
} from 'lucide-react';

export default function StoreSelection() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    filterStores();
  }, [searchTerm, stores]);

  const loadStores = () => {
    try {
      // Get all active stores
      const allStores = getStores().filter(store => store.status === 'active');
      
      // Add additional metadata for each store
      const storesWithMetadata = allStores.map(store => {
        const products = getProducts(store.id);
        return {
          ...store,
          productCount: products.length,
          averageRating: products.length > 0 
            ? products.reduce((sum, product) => sum + product.rating, 0) / products.length 
            : 0,
          reviewCount: products.reduce((sum, product) => sum + product.reviewCount, 0)
        };
      });

      setStores(storesWithMetadata);
      setFilteredStores(storesWithMetadata);
    } catch (error) {
      console.error('Error loading stores:', error);
      toast({
        title: 'خطأ في تحميل المتاجر',
        description: 'حدث خطأ أثناء تحميل قائمة المتاجر',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    if (!searchTerm.trim()) {
      setFilteredStores(stores);
      return;
    }

    const filtered = stores.filter(store =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredStores(filtered);
  };

  const handleStoreSelect = (store: Store & { productCount: number; averageRating: number; reviewCount: number }) => {
    // Save selected store in localStorage for customer session
    localStorage.setItem('selectedStoreId', store.id);
    localStorage.setItem('selectedStoreData', JSON.stringify(store));
    
    toast({
      title: `مرحباً بك في ${store.name}! 🎉`,
      description: 'تم اختيار المتجر بنجاح، يمكنك الآن تصفح المنتجات'
    });

    // Navigate to the store
    navigate(`/store/${store.subdomain}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل المتاجر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">اختر متجرك المفضل</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            اكتشف مجموعة متنوعة من المتاجر الإلكترونية واختر المتجر الذي يناسب احتياجاتك
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="ابحث في المتاجر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StoreIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stores.length}</h3>
              <p className="text-gray-600">متجر متاح</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stores.reduce((sum, store) => sum + (store as any).productCount, 0)}
              </h3>
              <p className="text-gray-600">منتج متوفر</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stores.reduce((sum, store) => sum + (store as any).reviewCount, 0)}
              </h3>
              <p className="text-gray-600">تقييم وتعليق</p>
            </CardContent>
          </Card>
        </div>

        {/* Stores Grid */}
        {filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <StoreIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد متاجر</h3>
            <p className="text-gray-600">
              {searchTerm ? 'لم يتم العثور على متاجر تطابق بحثك' : 'لا توجد متاجر متاحة حالياً'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => {
              const storeWithMeta = store as Store & { productCount: number; averageRating: number; reviewCount: number };
              
              return (
                <Card key={store.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{store.name}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {store.description}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="default" 
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        نشط
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Store Preview Colors */}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: store.customization?.colors?.primary || '#2563eb' }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: store.customization?.colors?.secondary || '#64748b' }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: store.customization?.colors?.accent || '#f59e0b' }}
                      />
                      <span className="text-xs text-gray-500 mr-2">ألوان المتجر</span>
                    </div>

                    {/* Store Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span>{storeWithMeta.productCount} منتج</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{storeWithMeta.averageRating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Store Info */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{store.subdomain}.store.com</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>تم الإنشاء: {new Date(store.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {store.customization?.pages?.enableReviews && (
                        <Badge variant="outline" className="text-xs">تقييمات</Badge>
                      )}
                      {store.customization?.pages?.enableWishlist && (
                        <Badge variant="outline" className="text-xs">قائمة الرغبات</Badge>
                      )}
                      {store.settings?.payment?.cashOnDelivery && (
                        <Badge variant="outline" className="text-xs">الدفع عند الاستلام</Badge>
                      )}
                      {store.settings?.shipping?.enabled && (
                        <Badge variant="outline" className="text-xs">شحن متاح</Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button 
                        onClick={() => handleStoreSelect(storeWithMeta)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        دخول المتجر
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.open(`/store/${store.subdomain}`, '_blank')}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-blue-50 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">هل تريد إنشاء متجرك الخاص؟</h3>
          <p className="text-gray-600 mb-6">
            انضم إلى منصتنا وأنشئ متجرك الإلكتروني في دقائق معدودة
          </p>
          <Button 
            onClick={() => navigate('/signup')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <StoreIcon className="h-5 w-5 mr-2" />
            إنشاء متجر جديد
          </Button>
        </div>
      </div>
    </div>
  );
}
