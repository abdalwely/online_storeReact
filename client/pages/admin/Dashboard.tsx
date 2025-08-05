import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { storeService, Store } from '@/lib/firestore';
import { signOutUser } from '@/lib/auth';
import { 
  Shield, 
  Store as StoreIcon, 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Bell,
  Globe,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Loader2,
  Activity,
  Award,
  CreditCard
} from 'lucide-react';

export default function AdminDashboard() {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    pendingStores: 0,
    suspendedStores: 0,
    totalMerchants: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    platformCommission: 0
  });

  const { userData, currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const text = {
    ar: {
      adminDashboard: 'لوحة تحكم المشرف',
      welcome: 'مرحباً',
      platformOverview: 'نظرة عامة على المنصة',
      storeManagement: 'إدارة المتاجر',
      recentStores: 'المتاجر الحديثة',
      pendingApproval: 'في انتظار الموافقة',
      totalStores: 'إجمالي المتاجر',
      activeStores: 'المتاجر النشطة',
      pendingStores: 'متاجر معلقة',
      suspendedStores: 'متاجر معلقة',
      totalMerchants: 'إجمالي التجار',
      totalCustomers: 'إجمالي العملاء',
      totalRevenue: 'إجمالي الإيرادات',
      platformCommission: 'عمولة المنصة',
      quickActions: 'إجراءات سريعة',
      manageStores: 'إدارة المتاجر',
      manageMerchants: 'إدارة التجار',
      viewAnalytics: 'عرض التحليلات',
      platformSettings: 'إعدادات المنصة',
      searchStores: 'البحث في المتاجر',
      filterByStatus: 'تصفية بالحالة',
      allStores: 'جميع المتاجر',
      active: 'نشط',
      pending: 'معلق',
      suspended: 'معلق',
      storeName: 'اسم المتجر',
      owner: 'المالك',
      status: 'الحالة',
      createdDate: 'تاريخ الإنشاء',
      actions: 'الإجراءات',
      approve: 'موافقة',
      suspend: 'تعليق',
      view: 'عرض',
      edit: 'تعديل',
      delete: 'حذف',
      loading: 'جاري التحميل...',
      logout: 'تسجيل الخروج',
      notifications: 'الإشعارات',
      sar: 'ريال',
      noStores: 'لا توجد متاجر',
      approveStore: 'موافقة على المتجر',
      suspendStore: 'تعليق المتجر',
      deleteStore: 'حذف المتجر',
      confirmAction: 'تأكيد الإجراء',
      success: 'تم بنجاح',
      error: 'حدث خطأ'
    },
    en: {
      adminDashboard: 'Admin Dashboard',
      welcome: 'Welcome',
      platformOverview: 'Platform Overview',
      storeManagement: 'Store Management',
      recentStores: 'Recent Stores',
      pendingApproval: 'Pending Approval',
      totalStores: 'Total Stores',
      activeStores: 'Active Stores',
      pendingStores: 'Pending Stores',
      suspendedStores: 'Suspended Stores',
      totalMerchants: 'Total Merchants',
      totalCustomers: 'Total Customers',
      totalRevenue: 'Total Revenue',
      platformCommission: 'Platform Commission',
      quickActions: 'Quick Actions',
      manageStores: 'Manage Stores',
      manageMerchants: 'Manage Merchants',
      viewAnalytics: 'View Analytics',
      platformSettings: 'Platform Settings',
      searchStores: 'Search stores',
      filterByStatus: 'Filter by status',
      allStores: 'All Stores',
      active: 'Active',
      pending: 'Pending',
      suspended: 'Suspended',
      storeName: 'Store Name',
      owner: 'Owner',
      status: 'Status',
      createdDate: 'Created Date',
      actions: 'Actions',
      approve: 'Approve',
      suspend: 'Suspend',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      loading: 'Loading...',
      logout: 'Logout',
      notifications: 'Notifications',
      sar: 'SAR',
      noStores: 'No stores found',
      approveStore: 'Approve Store',
      suspendStore: 'Suspend Store',
      deleteStore: 'Delete Store',
      confirmAction: 'Confirm Action',
      success: 'Success',
      error: 'Error occurred'
    }
  };

  const currentText = text[language];

  useEffect(() => {
    loadDashboardData();
  }, [userData]);

  useEffect(() => {
    filterStores();
  }, [stores, searchTerm, statusFilter]);

  const loadDashboardData = async () => {
    if (!userData) return;

    setLoading(true);
    try {
      // Load all stores
      const storesData = await storeService.getAll(1, 100); // Increase limit for admin
      setStores(storesData);

      // Calculate stats
      const activeStores = storesData.filter(store => store.status === 'active').length;
      const pendingStores = storesData.filter(store => store.status === 'pending').length;
      const suspendedStores = storesData.filter(store => store.status === 'suspended').length;

      // Mock additional stats - in real app, fetch from respective services
      setStats({
        totalStores: storesData.length,
        activeStores,
        pendingStores,
        suspendedStores,
        totalMerchants: storesData.length, // Assuming 1 merchant per store
        totalCustomers: 2500, // Mock data
        totalRevenue: 1250000, // Mock data
        monthlyRevenue: 125000, // Mock data
        platformCommission: 25000 // Mock data
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: currentText.error,
        description: 'فشل في تحميل البيانات',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    let filtered = stores;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(store => store.status === statusFilter);
    }

    setFilteredStores(filtered);
  };

  const handleStoreAction = async (storeId: string, action: 'approve' | 'suspend' | 'delete') => {
    try {
      let confirmMessage = '';
      let newStatus: Store['status'] | null = null;

      switch (action) {
        case 'approve':
          confirmMessage = 'هل تريد الموافقة على هذا المتجر؟';
          newStatus = 'active';
          break;
        case 'suspend':
          confirmMessage = 'هل تريد تعليق هذا المتجر؟';
          newStatus = 'suspended';
          break;
        case 'delete':
          confirmMessage = 'هل تريد حذف هذا المتجر نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.';
          break;
      }

      if (!confirm(confirmMessage)) return;

      if (action === 'delete') {
        await storeService.delete(storeId);
      } else if (newStatus) {
        await storeService.update(storeId, { status: newStatus });
      }

      toast({
        title: currentText.success,
        description: `تم ${action === 'approve' ? 'الموافقة على' : action === 'suspend' ? 'تعليق' : 'حذف'} المتجر`
      });

      loadDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing store:`, error);
      toast({
        title: currentText.error,
        description: 'فشل في تنفيذ الإجراء',
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">{currentText.active}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{currentText.pending}</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">{currentText.suspended}</Badge>;
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="bg-gradient-to-r from-primary to-brand p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">لوحة المشرف</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
                {stats.pendingStores > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.pendingStores}
                  </span>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              >
                <Globe className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {language === 'ar' ? 'EN' : 'عر'}
              </Button>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {currentText.logout}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentText.welcome}, {userData?.firstName}!
          </h1>
          <p className="text-gray-600">{currentText.adminDashboard}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{currentText.totalStores}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalStores}</p>
                </div>
                <StoreIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{currentText.totalMerchants}</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalMerchants}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{currentText.totalRevenue}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalRevenue.toLocaleString()} {currentText.sar}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{currentText.platformCommission}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.platformCommission.toLocaleString()} {currentText.sar}
                  </p>
                </div>
                <Award className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{currentText.activeStores}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeStores}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{currentText.pendingStores}</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingStores}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{currentText.suspendedStores}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.suspendedStores}</p>
                </div>
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="card-shadow mb-8">
          <CardHeader>
            <CardTitle>{currentText.quickActions}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/stores">
                <Button className="w-full justify-start btn-gradient">
                  <StoreIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.manageStores}
                </Button>
              </Link>

              <Link to="/admin/merchants">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.manageMerchants}
                </Button>
              </Link>

              <Link to="/admin/analytics">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.viewAnalytics}
                </Button>
              </Link>

              <Link to="/admin/settings">
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  {currentText.platformSettings}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Store Management */}
        <Card className="card-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{currentText.storeManagement}</CardTitle>
                <CardDescription>إدارة ومراقبة جميع المتاجر على المنصة</CardDescription>
              </div>
              {stats.pendingStores > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <AlertTriangle className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                  {stats.pendingStores} {currentText.pendingApproval}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={currentText.searchStores}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">{currentText.allStores}</option>
                  <option value="active">{currentText.active}</option>
                  <option value="pending">{currentText.pending}</option>
                  <option value="suspended">{currentText.suspended}</option>
                </select>
              </div>
            </div>

            {/* Stores Table */}
            {filteredStores.length === 0 ? (
              <div className="text-center py-8">
                <StoreIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{currentText.noStores}</h3>
                <p className="text-gray-600">لا توجد متاجر مطابقة للمعايير المحددة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium text-gray-600">{currentText.storeName}</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">{currentText.owner}</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">{currentText.status}</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">{currentText.createdDate}</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">{currentText.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStores.map((store) => (
                      <tr key={store.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-brand/20 rounded-lg flex items-center justify-center">
                              {store.logo ? (
                                <img src={store.logo} alt={store.name} className="w-8 h-8 rounded" />
                              ) : (
                                <StoreIcon className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{store.name}</div>
                              <div className="text-sm text-gray-600 truncate max-w-32">
                                {store.subdomain}.platform.com
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm">
                            <div className="font-medium">{store.contact.email}</div>
                            <div className="text-gray-600">{store.contact.phone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-2">{getStatusBadge(store.status)}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">
                          {new Date(store.createdAt).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <Link to={`/store/${store.subdomain}`} target="_blank">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            
                            {store.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleStoreAction(store.id, 'approve')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {store.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-yellow-600 hover:text-yellow-700"
                                onClick={() => handleStoreAction(store.id, 'suspend')}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleStoreAction(store.id, 'delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
