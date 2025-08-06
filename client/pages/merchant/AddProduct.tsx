import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createProduct, 
  getStoreByOwnerId, 
  getCategories,
  createCategory 
} from '@/lib/store-management';
import { 
  Package,
  Upload,
  Plus,
  X,
  ArrowLeft,
  Save,
  Eye,
  Star,
  Tag,
  Palette,
  Settings
} from 'lucide-react';

export default function AddProduct() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState(() => {
    return userData ? getStoreByOwnerId(userData.uid) : null;
  });
  
  const [categories] = useState(() => {
    return store ? getCategories(store.id) : [];
  });

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    subCategory: '',
    brand: '',
    sku: '',
    stock: 0,
    specifications: {} as Record<string, string>,
    tags: [] as string[],
    featured: false,
    status: 'active' as 'active' | 'inactive' | 'out_of_stock'
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [showVariants, setShowVariants] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>لا يوجد متجر</CardTitle>
            <CardDescription>
              يجب إنشاء متجر أولاً قبل إضافة المنتجات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/merchant/dashboard')}
              className="w-full"
            >
              الرجوع للوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !productData.tags.includes(newTag.trim())) {
      setProductData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProductData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSpecification = () => {
    if (newSpec.key.trim() && newSpec.value.trim()) {
      setProductData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpec.key.trim()]: newSpec.value.trim()
        }
      }));
      setNewSpec({ key: '', value: '' });
    }
  };

  const removeSpecification = (keyToRemove: string) => {
    setProductData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[keyToRemove];
      return {
        ...prev,
        specifications: newSpecs
      };
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    setUploadingImages(true);

    // Convert files to base64 URLs for preview
    const promises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64Images => {
      setImages(prev => [...prev, ...base64Images]);
      setImageFiles(prev => [...prev, ...files]);
      setUploadingImages(false);

      toast({
        title: 'تم رفع الصور بنجاح',
        description: `تم رفع ${files.length} صور`
      });
    }).catch(error => {
      console.error('Error uploading images:', error);
      setUploadingImages(false);
      toast({
        title: 'خطأ في رفع الصور',
        description: 'حدث خطأ أثناء رفع الصور',
        variant: 'destructive'
      });
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async () => {
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      toast({
        title: 'بيانات ناقصة',
        description: 'يرجى تعبئة جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    if (!productData.sku) {
      productData.sku = `SKU-${Date.now()}`;
    }

    setLoading(true);
    
    try {
      const newProduct = createProduct({
        ...productData,
        images: images.length > 0 ? images : ['/placeholder-product.jpg'],
        storeId: store.id,
        rating: 0,
        reviewCount: 0
      });

      // Broadcast product creation to other windows/tabs
      window.postMessage({
        type: 'PRODUCT_CREATED',
        product: newProduct,
        storeId: store.id,
        timestamp: Date.now()
      }, '*');

      // Also trigger storage event for same-origin tabs
      localStorage.setItem('product_creation_sync', JSON.stringify({
        product: newProduct,
        storeId: store.id,
        timestamp: Date.now()
      }));

      toast({
        title: 'تم إنشاء المنتج بنجاح! 🎉',
        description: `تم إضافة ${productData.name} إلى متجرك. يمكنك الآن مشاهدته في المتجر.`
      });

      navigate('/merchant/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'خطأ في إنشاء المنتج',
        description: 'حدث خطأ أثناء إنشاء المنتج، يرجى المحاولة مرة أخرى',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إضافة منتج جديد</h1>
              <p className="text-gray-600 mt-2">أضف منتج جديد إلى متجر {store.name}</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/merchant/products')}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                الرجوع
              </Button>
              <Button 
                onClick={handleSaveProduct}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم المنتج *</Label>
                  <Input
                    id="name"
                    value={productData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="أدخل اسم المنتج"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">وصف المنتج *</Label>
                  <Textarea
                    id="description"
                    value={productData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="أدخل وصف تفصيلي للمنتج"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">الفئة *</Label>
                    <Select 
                      value={productData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brand">العلامة التجارية</Label>
                    <Input
                      id="brand"
                      value={productData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="العلامة التجارية"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">رمز المنتج (SKU)</Label>
                    <Input
                      id="sku"
                      value={productData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="سيتم إنشاؤه تلقائياً"
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock">المخزون *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={productData.stock}
                      onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                      placeholder="الكمية المتوفرة"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  الأسعار
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">السعر الحالي (ر.س) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={productData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="originalPrice">السعر الأصلي (ر.س)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={productData.originalPrice}
                      onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                {productData.originalPrice > productData.price && productData.originalPrice > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-green-800 font-medium">
                        خصم {Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  المواصفات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="المواصفة (مثال: الحجم)"
                    value={newSpec.key}
                    onChange={(e) => setNewSpec(prev => ({ ...prev, key: e.target.value }))}
                  />
                  <Input
                    placeholder="القيمة (مثال: كبير)"
                    value={newSpec.value}
                    onChange={(e) => setNewSpec(prev => ({ ...prev, value: e.target.value }))}
                  />
                  <Button onClick={addSpecification} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {Object.entries(productData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span><strong>{key}:</strong> {value}</span>
                      <Button 
                        onClick={() => removeSpecification(key)}
                        variant="ghost" 
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  الكلم��ت المفتاحية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="أضف كلمة مفتاحية"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {productData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المنتج</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">حالة المنتج</Label>
                  <Select 
                    value={productData.status}
                    onValueChange={(value: any) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                      <SelectItem value="out_of_stock">نفد المخزون</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">منتج مميز</Label>
                  <Switch
                    id="featured"
                    checked={productData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  صور المنتج
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImages}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className={`h-8 w-8 mx-auto mb-2 ${uploadingImages ? 'animate-pulse text-blue-500' : 'text-gray-400'}`} />
                      <p className="text-sm text-gray-600">
                        {uploadingImages ? 'جاري رفع الصور...' : 'اسحب الصور هنا أو انقر لاختيار'}
                      </p>
                      <Button variant="outline" size="sm" className="mt-2" disabled={uploadingImages}>
                        {uploadingImages ? 'جاري الرفع...' : 'اختيار الصور'}
                      </Button>
                    </label>
                  </div>

                  {/* عرض الصور المرفوعة */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {index === 0 && (
                            <Badge className="absolute bottom-1 left-1 text-xs bg-blue-500">
                              الصورة الرئيسية
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {images.length === 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        سيتم استخدام صورة افتراضية للمنتج
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  معاينة المنتج
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {productData.name || 'اسم المنتج'}
                  </h3>
                  <div className="flex items-center gap-1 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-gray-300" />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600">
                      {productData.price > 0 ? `${productData.price} ر.س` : 'السعر'}
                    </span>
                    {productData.originalPrice > productData.price && productData.originalPrice > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        {productData.originalPrice} ر.س
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
