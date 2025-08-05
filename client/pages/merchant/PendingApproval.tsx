import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { signOutUser } from '../../lib/auth';
import { getStoreApplicationByMerchantId, type StoreApplication } from '../../lib/store-approval-system';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  Store,
  Palette,
  Layout,
  RefreshCw,
  LogOut,
  Eye
} from 'lucide-react';

const PendingApproval: React.FC = () => {
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<StoreApplication | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadApplication();
    }
  }, [user]);

  const loadApplication = () => {
    if (user) {
      const app = getStoreApplicationByMerchantId(user.uid);
      setApplication(app);

      // If approved, redirect to dashboard
      if (app && app.status === 'approved') {
        navigate('/merchant/dashboard');
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Check real approval status
    setTimeout(() => {
      loadApplication();
      setRefreshing(false);

      const status = application?.status;
      if (status === 'approved') {
        toast({
          title: 'تهانينا! تم قبول طلبك',
          description: 'يمكنك الآن الدخول لوحة التحكم'
        });
        navigate('/merchant/dashboard');
      } else if (status === 'rejected') {
        toast({
          title: 'تم رفض الطلب',
          description: 'يرجى مراجعة أسباب الرفض أدناه',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'تم التحديث',
          description: 'لا تزال حالة طلبك قيد المراجعة'
        });
      }
    }, 1000);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleContactSupport = () => {
    window.open('mailto:support@ecommerce-platform.com?subject=استفسار حول حالة الطلب', '_blank');
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

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">حالة طلب إنشاء المتجر</h1>
            <p className="text-gray-600 mt-2">تتبع حالة طلب إنشاء متجرك الإلكتروني</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث الحالة
            </Button>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>

        {/* Status Alert */}
        {application && (
          <Alert className={`mb-6 ${
            application.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
            application.status === 'approved' ? 'border-green-200 bg-green-50' :
            'border-red-200 bg-red-50'
          }`}>
            {application.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
            {application.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
            {application.status === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
            <AlertDescription className={
              application.status === 'pending' ? 'text-yellow-800' :
              application.status === 'approved' ? 'text-green-800' :
              'text-red-800'
            }>
              {application.status === 'pending' && (
                <>
                  <strong>طلبك قيد المراجعة:</strong> تم إرسال طلب إنشاء متجرك بنجاح. يتم حالياً مراجعة المعلومات والتصميم المقترح من قبل فريق المنصة. ستتلقى إشعاراً عبر البريد الإلكتروني عند اتخاذ قرار بشأن طلبك.
                </>
              )}
              {application.status === 'approved' && (
                <>
                  <strong>تهانينا! تم قبول طلبك:</strong> تم قبول طلب إنشاء متجرك بنجاح. يمكنك الآن الدخول لوحة التحكم وبدء إضافة المنتجات.
                </>
              )}
              {application.status === 'rejected' && (
                <>
                  <strong>تم رفض الطلب:</strong> للأسف تم رفض طلب إنشاء متجرك. يرجى مراجعة أسباب الرفض أدناه وإعادة التقديم بعد التعديل.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  تفاصيل الطلب
                </CardTitle>
                <CardDescription>
                  معلومات الطلب المقدم لإنشاء متجرك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {application && (
                  <>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium">حالة الطلب</h3>
                        <p className="text-sm text-gray-600">
                          آخر تحديث: {application.reviewedAt ?
                            new Date(application.reviewedAt).toLocaleDateString('ar-SA') :
                            'منذ ساعتين'
                          }
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                        {getStatusIcon(application.status)}
                        {application.status === 'pending' ? 'قيد المراجعة' :
                         application.status === 'approved' ? 'مقبول' : 'مرفوض'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">اسم التاجر</label>
                        <p className="font-medium">{application.merchantData.firstName} {application.merchantData.lastName}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">البريد الإلكتروني</label>
                        <p className="font-medium">{application.merchantData.email}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">تاريخ التقديم</label>
                        <p className="font-medium">{new Date(application.submittedAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">نوع النشاط</label>
                        <p className="font-medium">{application.merchantData.businessType}</p>
                      </div>
                    </div>

                    {application.status === 'rejected' && application.rejectionReason && (
                      <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>سبب الرفض:</strong> {application.rejectionReason}
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Store Configuration */}
            {application && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    تصميم المتجر المقترح
                  </CardTitle>
                  <CardDescription>
                    القالب والتخصيصات التي اخترتها لمتجرك
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">اسم المتجر</label>
                      <p className="font-medium">{application.storeConfig.customization.storeName}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">القالب المختار</label>
                      <p className="font-medium">{application.storeConfig.template}</p>
                    </div>
                  </div>

                  {application.storeConfig.customization.storeDescription && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">وصف المتجر</label>
                      <p className="text-sm bg-gray-50 p-3 rounded-lg">{application.storeConfig.customization.storeDescription}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">ألوان المتجر</label>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: application.storeConfig.customization.colors.primary }}
                        ></div>
                        <span className="text-xs">أساسي</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: application.storeConfig.customization.colors.secondary }}
                        ></div>
                        <span className="text-xs">ثانوي</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: application.storeConfig.customization.colors.background }}
                        ></div>
                        <span className="text-xs">خلفية</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  مراحل المراجعة
                </CardTitle>
                <CardDescription>
                  تتبع مراحل مراجعة طلبك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">تم استلام الطلب</h4>
                      <p className="text-sm text-gray-600">تم إرسال طلبك بنجاح</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date().toLocaleDateString('ar-SA')}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">قيد المراجعة</h4>
                      <p className="text-sm text-gray-600">يتم مراجعة المعلومات والتصميم</p>
                    </div>
                    <span className="text-xs text-gray-500">جارٍ الآن</span>
                  </div>
                  
                  <div className="flex items-center gap-4 opacity-50">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">الموافقة النهائية</h4>
                      <p className="text-sm text-gray-600">ستتلقى إشعار بالقرار النهائي</p>
                    </div>
                    <span className="text-xs text-gray-500">في الانتظار</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات مهمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">مدة المراجعة</h4>
                  <p className="text-sm text-blue-800">عادة ما تستغرق مراجعة الطلبات من 1-3 أيام عمل</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">بعد الموافقة</h4>
                  <p className="text-sm text-green-800">ستتمكن من الدخول لوحة التحكم وإضافة المنتجات</p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">في حالة الرفض</h4>
                  <p className="text-sm text-orange-800">ستتلقى تفاصيل أسباب الرفض مع إمكانية إعادة التقديم</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تحتاج مساعدة؟</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleContactSupport}
                >
                  <Mail className="w-4 h-4 ml-2" />
                  راسل الدعم الفني
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.open('tel:+966500000000')}
                >
                  <Phone className="w-4 h-4 ml-2" />
                  اتصل بنا
                </Button>
                
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-600">
                    ساعات العمل: الأحد - الخميس
                    <br />
                    9:00 ص - 5:00 م
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
