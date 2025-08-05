import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useToast } from '../../hooks/use-toast';
import {
  getStoreApplications,
  approveStoreApplication,
  rejectStoreApplication,
  getApplicationStats,
  initializeSampleApplications,
  type StoreApplication
} from '../../lib/store-approval-system';
import {
  Store,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Phone,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Palette,
  Layout,
  AlertTriangle
} from 'lucide-react';

const EnhancedAdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<StoreApplication[]>([]);

  const [selectedApplication, setSelectedApplication] = useState<StoreApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Initialize sample applications for demo
    initializeSampleApplications();

    // Load applications
    loadApplications();
  }, []);

  const loadApplications = () => {
    const apps = getStoreApplications();
    setApplications(apps);
  };

  const stats = getApplicationStats();

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const merchantName = `${app.merchantData.firstName} ${app.merchantData.lastName}`;
    const matchesSearch = merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.storeConfig.customization.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.merchantData.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApproveApplication = async (application: StoreApplication) => {
    try {
      const success = await approveStoreApplication(application.id, 'admin_user');
      if (success) {
        loadApplications(); // Reload applications
        toast({
          title: 'تم قبول الطلب',
          description: `تم قبول طلب إنشاء متجر ${application.storeConfig.customization.storeName} بنجاح`,
        });
      }
    } catch (error) {
      toast({
        title: '��طأ',
        description: 'حدث خطأ أثناء قبول الطلب',
        variant: 'destructive'
      });
    }
  };

  const handleRejectApplication = async (application: StoreApplication) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال سبب الرفض',
        variant: 'destructive'
      });
      return;
    }

    try {
      const success = await rejectStoreApplication(application.id, 'admin_user', rejectionReason);
      if (success) {
        loadApplications(); // Reload applications
        setRejectionReason('');
        setSelectedApplication(null);

        toast({
          title: 'تم رفض الطلب',
          description: `تم رفض طلب إنشاء متجر ${application.storeConfig.customization.storeName}`,
        });
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفض الطلب',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getBusinessTypeLabel = (type: string) => {
    const types = {
      'fashion': 'أزياء',
      'electronics': 'إلكترونيات',
      'food': 'طعام ومشروبات',
      'beauty': 'جمال وعناية',
      'sports': 'رياضة',
      'books': 'كتب',
      'home': 'منزل وحديقة',
      'general': 'عام'
    };
    return types[type as keyof typeof types] || type;
  };

  const formatDate = (date: Date | string | number) => {
    try {
      let targetDate: Date;

      // Handle different date formats
      if (date instanceof Date) {
        targetDate = date;
      } else if (typeof date === 'string') {
        targetDate = new Date(date);
      } else if (typeof date === 'number') {
        targetDate = new Date(date);
      } else {
        return 'تاريخ غير محدد';
      }

      // Check if date is valid
      if (isNaN(targetDate.getTime())) {
        return 'تاريخ غير محدد';
      }

      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(targetDate);
    } catch (error) {
      console.warn('Error in formatDate:', error);
      return 'تاريخ غير محدد';
    }
  };

  const getTimeAgo = (date: Date | string | number) => {
    try {
      const now = new Date();
      let targetDate: Date;

      // Handle different date formats
      if (date instanceof Date) {
        targetDate = date;
      } else if (typeof date === 'string') {
        targetDate = new Date(date);
      } else if (typeof date === 'number') {
        targetDate = new Date(date);
      } else {
        // Fallback for invalid dates
        return 'منذ وقت غير محدد';
      }

      // Check if date is valid
      if (isNaN(targetDate.getTime())) {
        return 'منذ وقت غير محدد';
      }

      const diffInHours = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) {
        return 'منذ أقل من ساعة';
      } else if (diffInHours < 24) {
        return `منذ ${diffInHours} ساعة`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `منذ ${diffInDays} يوم`;
      }
    } catch (error) {
      console.warn('Error in getTimeAgo:', error);
      return 'منذ وقت غير محدد';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم المدير</h1>
          <p className="text-gray-600 mt-2">إدارة طلبات إنشاء المتاجر والموافقة عليها</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">تم القبول</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedApplications}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">تم الرفض</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedApplications}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">طلبات إنشاء المتاجر</CardTitle>
                <CardDescription>راجع واتخذ قرار بشأن طلبات إنشاء المتاجر الجديدة</CardDescription>
              </div>
              
              {stats.pendingApplications > 0 && (
                <Alert className="w-auto border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    يوجد {stats.pendingApplications} طلب في انتظار المراجعة
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في الطلبات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  size="sm"
                >
                  الكل ({stats.totalApplications})
                </Button>
                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setFilter('pending')}
                  size="sm"
                >
                  في الانتظار ({stats.pendingApplications})
                </Button>
                <Button
                  variant={filter === 'approved' ? 'default' : 'outline'}
                  onClick={() => setFilter('approved')}
                  size="sm"
                >
                  مقبول ({stats.approvedApplications})
                </Button>
                <Button
                  variant={filter === 'rejected' ? 'default' : 'outline'}
                  onClick={() => setFilter('rejected')}
                  size="sm"
                >
                  مرفوض ({stats.rejectedApplications})
                </Button>
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">{application.storeConfig.customization.storeName}</h3>
                          <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                            {getStatusIcon(application.status)}
                            {application.status === 'pending' ? 'في الانتظار' :
                             application.status === 'approved' ? 'مقبول' : 'مرفوض'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">اسم التاجر</p>
                            <p className="font-medium">{application.merchantData.firstName} {application.merchantData.lastName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">نوع النشاط</p>
                            <p className="font-medium">{getBusinessTypeLabel(application.merchantData.businessType)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">المدينة</p>
                            <p className="font-medium">{application.merchantData.city}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {application.merchantData.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {application.merchantData.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {getTimeAgo(application.submittedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 ml-1" />
                              عرض التفاصيل
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl" dir="rtl">
                            <DialogHeader>
                              <DialogTitle>تفاصيل طلب إنشاء المتجر</DialogTitle>
                              <DialogDescription>
                                مراجعة تفاصيل طلب {application.storeConfig.customization.storeName}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Merchant Info */}
                              <div>
                                <h4 className="font-semibold mb-3">معلومات التاجر</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>الاسم</Label>
                                    <p className="mt-1">{application.merchantData.firstName} {application.merchantData.lastName}</p>
                                  </div>
                                  <div>
                                    <Label>البريد الإلكتروني</Label>
                                    <p className="mt-1">{application.merchantData.email}</p>
                                  </div>
                                  <div>
                                    <Label>رقم الجوال</Label>
                                    <p className="mt-1">{application.merchantData.phone}</p>
                                  </div>
                                  <div>
                                    <Label>المدينة</Label>
                                    <p className="mt-1">{application.merchantData.city}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Store Info */}
                              <div>
                                <h4 className="font-semibold mb-3">معلومات المتجر</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>اسم المتجر</Label>
                                    <p className="mt-1">{application.storeConfig.customization.storeName}</p>
                                  </div>
                                  <div>
                                    <Label>نوع النشاط</Label>
                                    <p className="mt-1">{getBusinessTypeLabel(application.merchantData.businessType)}</p>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <Label>وصف المتجر</Label>
                                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">{application.storeConfig.customization.storeDescription}</p>
                                </div>
                              </div>

                              {/* Design Customization */}
                              <div>
                                <h4 className="font-semibold mb-3">التصميم المقترح</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>القالب المختار</Label>
                                    <p className="mt-1">{application.storeConfig.template}</p>
                                  </div>
                                  <div>
                                    <Label>ألوان المتجر</Label>
                                    <div className="flex gap-2 mt-1">
                                      <div className="flex items-center gap-1">
                                        <div
                                          className="w-6 h-6 rounded border"
                                          style={{ backgroundColor: application.storeConfig.customization.colors.primary }}
                                        ></div>
                                        <span className="text-xs">أساسي</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div
                                          className="w-6 h-6 rounded border"
                                          style={{ backgroundColor: application.storeConfig.customization.colors.secondary }}
                                        ></div>
                                        <span className="text-xs">ثانوي</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              {application.status === 'pending' && (
                                <div className="flex gap-3 pt-4 border-t">
                                  <Button 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApproveApplication(application)}
                                  >
                                    <CheckCircle className="w-4 h-4 ml-1" />
                                    قبول الطلب
                                  </Button>
                                  
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="destructive">
                                        <XCircle className="w-4 h-4 ml-1" />
                                        رفض الطلب
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent dir="rtl">
                                      <DialogHeader>
                                        <DialogTitle>رفض طلب إنشاء المتجر</DialogTitle>
                                        <DialogDescription>
                                          يرجى إدخال سبب رفض الطلب لإرساله للتاجر
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="rejectionReason">سبب الرفض</Label>
                                          <Textarea
                                            id="rejectionReason"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="اذكر سبب رفض الطلب..."
                                            className="mt-1"
                                            rows={4}
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button 
                                            variant="destructive"
                                            onClick={() => handleRejectApplication(application)}
                                          >
                                            تأكيد الرفض
                                          </Button>
                                          <Button variant="outline">إلغاء</Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}

                              {application.status === 'rejected' && application.rejectionReason && (
                                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                  <h5 className="font-medium text-red-800 mb-2">سبب الرفض:</h5>
                                  <p className="text-red-700">{application.rejectionReason}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveApplication(application)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent dir="rtl">
                                <DialogHeader>
                                  <DialogTitle>رفض طلب إنشاء المتجر</DialogTitle>
                                  <DialogDescription>
                                  يرجى إدخال سبب رفض طلب {application.storeConfig.customization.storeName}
                                </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="rejectionReason">سبب الرفض</Label>
                                    <Textarea
                                      id="rejectionReason"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="اذكر سبب رفض الطلب..."
                                      className="mt-1"
                                      rows={4}
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="destructive"
                                      onClick={() => handleRejectApplication(application)}
                                    >
                                      تأكيد الرفض
                                    </Button>
                                    <Button variant="outline">إلغاء</Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
                  <p className="text-gray-600">
                    {filter === 'all' ? 'لا توجد طلبات إنشاء متاجر حالياً' :
                     filter === 'pending' ? 'لا توجد طلبات في انتظار المراجعة' :
                     filter === 'approved' ? 'لا توجد طلبات مقبولة' :
                     'لا توجد طلبات مرفوضة'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
