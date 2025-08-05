import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { storeService, productService, categoryService, Store, Product, Category } from '@/lib/firestore';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  ArrowLeft,
  Save,
  Loader2,
  Image,
  Globe,
  Star,
  DollarSign
} from 'lucide-react';

export default function ProductManagement() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    category: '',
    subcategory: '',
    tags: '',
    sku: '',
    quantity: '',
    trackInventory: true,
    status: 'active' as 'draft' | 'active' | 'inactive',
    featured: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const { userData } = useAuth();
  const { toast } = useToast();
  const isArabic = language === 'ar';

  const text = {
    ar: {
      productManagement: 'إدارة المنتجات',
      addProduct: 'إضافة منتج',
      searchProducts: 'البحث في المنتجات',
      filterByStatus: 'تصفية بالحالة',
      allProducts: 'جميع المنتجات',
      active: 'نشط',
      inactive: 'غير نشط',
      draft: 'مسودة',
      productName: 'اسم المنتج',
      description: 'الوصف',
      price: 'السعر',
      salePrice: 'سعر التخفيض',
      category: 'الفئة',
      subcategory: 'الفئة الفرعية',
      tags: 'العلامات',
      inventory: 'المخزون',
      sku: 'رمز المنتج',
      quantity: 'الكمية',
      trackInventory: 'تتبع المخزون',
      status: 'الحالة',
      featured: 'منتج مميز',
      seoSettings: 'إعدادات SEO',
      seoTitle: 'عنوان SEO',
      seoDescription: 'وصف SEO',
      seoKeywords: 'كلمات مفتاحية',
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      view: 'عرض',
      saving: 'جاري الحفظ...',
      loading: 'جاري التحميل...',
      noProducts: 'لا توجد منتجات',
      noProductsDesc: 'ابدأ بإضافة منتجك الأول',
      success: 'تم حفظ المنتج بنجاح',
      error: 'خطأ في حفظ المنتج',
      deleteConfirm: 'هل أنت متأكد من حذف هذا المنتج؟',
      back: 'رجوع',
      sar: 'ريال',
      selectCategory: 'اختر الفئة',
      enterTags: 'أدخل العلامات مفصولة بفاصلة',
      productDetails: 'تفاصيل المنتج',
      pricing: 'التسعير',
      seo: 'تحسين محركات البحث'
    },
    en: {
      productManagement: 'Product Management',
      addProduct: 'Add Product',
      searchProducts: 'Search products',
      filterByStatus: 'Filter by status',
      allProducts: 'All Products',
      active: 'Active',
      inactive: 'Inactive',
      draft: 'Draft',
      productName: 'Product Name',
      description: 'Description',
      price: 'Price',
      salePrice: 'Sale Price',
      category: 'Category',
      subcategory: 'Subcategory',
      tags: 'Tags',
      inventory: 'Inventory',
      sku: 'SKU',
      quantity: 'Quantity',
      trackInventory: 'Track Inventory',
      status: 'Status',
      featured: 'Featured Product',
      seoSettings: 'SEO Settings',
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description',
      seoKeywords: 'SEO Keywords',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      saving: 'Saving...',
      loading: 'Loading...',
      noProducts: 'No products yet',
      noProductsDesc: 'Start by adding your first product',
      success: 'Product saved successfully',
      error: 'Error saving product',
      deleteConfirm: 'Are you sure you want to delete this product?',
      back: 'Back',
      sar: 'SAR',
      selectCategory: 'Select category',
      enterTags: 'Enter tags separated by commas',
      productDetails: 'Product Details',
      pricing: 'Pricing',
      seo: 'SEO'
    }
  };

  const currentText = text[language];

  useEffect(() => {
    loadData();
  }, [userData]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter]);

  const loadData = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      // Load store
      const stores = await storeService.getByOwner(userData.uid);
      if (stores.length > 0) {
        const storeData = stores[0];
        setStore(storeData);

        // Load products
        const productsData = await productService.getByStore(storeData.id, 'all');
        setProducts(productsData);

        // Load categories
        const categoriesData = await categoryService.getByStore(storeData.id);
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: currentText.error,
        description: 'فشل في تحميل البيانات',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleFormChange = (field: string, value: any) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      category: '',
      subcategory: '',
      tags: '',
      sku: '',
      quantity: '',
      trackInventory: true,
      status: 'active',
      featured: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: ''
    });
    setEditingProduct(null);
  };

  const handleSaveProduct = async () => {
    if (!store) return;

    setSaving(true);
    try {
      const productData = {
        storeId: store.id,
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price) || 0,
        salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : undefined,
        images: [],
        category: productForm.category,
        subcategory: productForm.subcategory || undefined,
        tags: productForm.tags ? productForm.tags.split(',').map(tag => tag.trim()) : [],
        inventory: {
          quantity: parseInt(productForm.quantity) || 0,
          sku: productForm.sku,
          trackInventory: productForm.trackInventory
        },
        seo: {
          title: productForm.seoTitle || productForm.name,
          description: productForm.seoDescription || productForm.description,
          keywords: productForm.seoKeywords ? productForm.seoKeywords.split(',').map(k => k.trim()) : []
        },
        status: productForm.status,
        featured: productForm.featured
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, productData);
      } else {
        await productService.create(productData);
      }

      toast({
        title: currentText.success,
        description: editingProduct ? 'تم تحديث المنتج' : 'تم إضافة المنتج الجديد'
      });

      setShowAddDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: currentText.error,
        description: 'يرجى المحاولة مرة أخرى',
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || '',
      category: product.category,
      subcategory: product.subcategory || '',
      tags: product.tags.join(', '),
      sku: product.inventory.sku,
      quantity: product.inventory.quantity.toString(),
      trackInventory: product.inventory.trackInventory,
      status: product.status,
      featured: product.featured,
      seoTitle: product.seo.title,
      seoDescription: product.seo.description,
      seoKeywords: product.seo.keywords.join(', ')
    });
    setEditingProduct(product);
    setShowAddDialog(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(currentText.deleteConfirm)) return;

    try {
      await productService.delete(productId);
      toast({
        title: 'تم حذف المنتج',
        description: 'تم حذف المنتج بنجاح'
      });
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'خطأ في الحذف',
        description: 'فشل في حذف المنتج',
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">{currentText.active}</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">{currentText.inactive}</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">{currentText.draft}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
                <h1 className="text-2xl font-bold text-gray-900">{currentText.productManagement}</h1>
                <p className="text-gray-600">{store?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              >
                <Globe className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {language === 'ar' ? 'EN' : 'عر'}
              </Button>
              
              <Dialog open={showAddDialog} onOpenChange={(open) => {
                setShowAddDialog(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="btn-gradient">
                    <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    {currentText.addProduct}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'تعديل المنتج' : currentText.addProduct}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct ? 'قم بتعديل تفاصيل المنتج' : 'أضف منتج جديد إلى متجرك'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Product Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">{currentText.productDetails}</h3>
                      
                      <div>
                        <Label htmlFor="name">{currentText.productName}</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => handleFormChange('name', e.target.value)}
                          placeholder="أدخل اسم المنتج"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">{currentText.description}</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => handleFormChange('description', e.target.value)}
                          placeholder="وصف مفصل للمنتج"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">{currentText.category}</Label>
                          <Select
                            value={productForm.category}
                            onValueChange={(value) => handleFormChange('category', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={currentText.selectCategory} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="electronics">إلكترونيات</SelectItem>
                              <SelectItem value="fashion">أزياء</SelectItem>
                              <SelectItem value="home">منزل وحديقة</SelectItem>
                              <SelectItem value="sports">رياضة</SelectItem>
                              <SelectItem value="books">كتب</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="status">{currentText.status}</Label>
                          <Select
                            value={productForm.status}
                            onValueChange={(value) => handleFormChange('status', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">{currentText.active}</SelectItem>
                              <SelectItem value="inactive">{currentText.inactive}</SelectItem>
                              <SelectItem value="draft">{currentText.draft}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="tags">{currentText.tags}</Label>
                        <Input
                          id="tags"
                          value={productForm.tags}
                          onChange={(e) => handleFormChange('tags', e.target.value)}
                          placeholder={currentText.enterTags}
                        />
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={productForm.featured}
                          onChange={(e) => handleFormChange('featured', e.target.checked)}
                        />
                        <Label htmlFor="featured">{currentText.featured}</Label>
                      </div>
                    </div>

                    {/* Pricing & Inventory */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">{currentText.pricing}</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">{currentText.price} ({currentText.sar})</Label>
                          <Input
                            id="price"
                            type="number"
                            value={productForm.price}
                            onChange={(e) => handleFormChange('price', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        <div>
                          <Label htmlFor="salePrice">{currentText.salePrice} ({currentText.sar})</Label>
                          <Input
                            id="salePrice"
                            type="number"
                            value={productForm.salePrice}
                            onChange={(e) => handleFormChange('salePrice', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <h3 className="font-semibold text-lg mt-6">{currentText.inventory}</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="sku">{currentText.sku}</Label>
                          <Input
                            id="sku"
                            value={productForm.sku}
                            onChange={(e) => handleFormChange('sku', e.target.value)}
                            placeholder="SKU123"
                          />
                        </div>

                        <div>
                          <Label htmlFor="quantity">{currentText.quantity}</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={productForm.quantity}
                            onChange={(e) => handleFormChange('quantity', e.target.value)}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <input
                          type="checkbox"
                          id="trackInventory"
                          checked={productForm.trackInventory}
                          onChange={(e) => handleFormChange('trackInventory', e.target.checked)}
                        />
                        <Label htmlFor="trackInventory">{currentText.trackInventory}</Label>
                      </div>

                      <h3 className="font-semibold text-lg mt-6">{currentText.seo}</h3>
                      
                      <div>
                        <Label htmlFor="seoTitle">{currentText.seoTitle}</Label>
                        <Input
                          id="seoTitle"
                          value={productForm.seoTitle}
                          onChange={(e) => handleFormChange('seoTitle', e.target.value)}
                          placeholder="عنوان محسن لمحركات البحث"
                        />
                      </div>

                      <div>
                        <Label htmlFor="seoDescription">{currentText.seoDescription}</Label>
                        <Textarea
                          id="seoDescription"
                          value={productForm.seoDescription}
                          onChange={(e) => handleFormChange('seoDescription', e.target.value)}
                          placeholder="وصف محسن لمحركات البحث"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="seoKeywords">{currentText.seoKeywords}</Label>
                        <Input
                          id="seoKeywords"
                          value={productForm.seoKeywords}
                          onChange={(e) => handleFormChange('seoKeywords', e.target.value)}
                          placeholder="كلمة مفتاحية 1, كلمة مفتاحية 2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-6">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      {currentText.cancel}
                    </Button>
                    <Button onClick={handleSaveProduct} disabled={saving} className="btn-gradient">
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                          {currentText.saving}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                          {currentText.save}
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
                    placeholder={currentText.searchProducts}
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
                    <SelectItem value="all">{currentText.allProducts}</SelectItem>
                    <SelectItem value="active">{currentText.active}</SelectItem>
                    <SelectItem value="inactive">{currentText.inactive}</SelectItem>
                    <SelectItem value="draft">{currentText.draft}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="card-shadow text-center py-16">
            <CardContent>
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentText.noProducts}</h3>
              <p className="text-gray-600">{currentText.noProductsDesc}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="card-shadow hover:shadow-xl transition-shadow">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                    {product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <Image className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {product.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        مميز
                      </Badge>
                    )}
                    {getStatusBadge(product.status)}
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-lg">
                          {product.price.toLocaleString()} {currentText.sar}
                        </span>
                      </div>
                      {product.salePrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {product.salePrice.toLocaleString()} {currentText.sar}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      المخزون: {product.inventory.quantity}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
