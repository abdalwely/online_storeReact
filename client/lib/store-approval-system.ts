// Store approval system for managing merchant applications

export interface StoreApplication {
  id: string;
  merchantId: string;
  merchantData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    businessName: string;
    businessType: string;
  };
  storeConfig: {
    template: string;
    customization: {
      storeName: string;
      storeDescription: string;
      colors: {
        primary: string;
        secondary: string;
        background: string;
      };
    };
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

// In-memory storage for development (replace with Firebase in production)
let applications: StoreApplication[] = [];

export const submitStoreApplication = async (
  merchantId: string,
  merchantData: StoreApplication['merchantData'],
  storeConfig: StoreApplication['storeConfig']
): Promise<string> => {
  const application: StoreApplication = {
    id: `app_${Date.now()}`,
    merchantId,
    merchantData,
    storeConfig,
    status: 'pending',
    submittedAt: new Date()
  };

  applications.push(application);
  
  // Store in localStorage for persistence in development
  localStorage.setItem('storeApplications', JSON.stringify(applications));
  
  console.log('✅ Store application submitted:', application);
  return application.id;
};

export const getStoreApplications = (status?: 'pending' | 'approved' | 'rejected'): StoreApplication[] => {
  // Load from localStorage in development
  const stored = localStorage.getItem('storeApplications');
  if (stored) {
    try {
      applications = JSON.parse(stored);

      // Convert date strings back to Date objects
      applications = applications.map(app => ({
        ...app,
        submittedAt: new Date(app.submittedAt),
        reviewedAt: app.reviewedAt ? new Date(app.reviewedAt) : undefined
      }));
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  }

  if (status) {
    return applications.filter(app => app.status === status);
  }
  return applications;
};

export const getStoreApplicationById = (id: string): StoreApplication | null => {
  const stored = localStorage.getItem('storeApplications');
  if (stored) {
    try {
      applications = JSON.parse(stored);

      // Convert date strings back to Date objects
      applications = applications.map(app => ({
        ...app,
        submittedAt: new Date(app.submittedAt),
        reviewedAt: app.reviewedAt ? new Date(app.reviewedAt) : undefined
      }));
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  }

  return applications.find(app => app.id === id) || null;
};

export const getStoreApplicationByMerchantId = (merchantId: string): StoreApplication | null => {
  const stored = localStorage.getItem('storeApplications');
  if (stored) {
    try {
      applications = JSON.parse(stored);

      // Convert date strings back to Date objects
      applications = applications.map(app => ({
        ...app,
        submittedAt: new Date(app.submittedAt),
        reviewedAt: app.reviewedAt ? new Date(app.reviewedAt) : undefined
      }));
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  }

  return applications.find(app => app.merchantId === merchantId) || null;
};

export const approveStoreApplication = async (
  applicationId: string,
  reviewerId: string
): Promise<boolean> => {
  const stored = localStorage.getItem('storeApplications');
  if (stored) {
    try {
      applications = JSON.parse(stored);
    } catch (error) {
      console.error('Error loading applications:', error);
      return false;
    }
  }

  const appIndex = applications.findIndex(app => app.id === applicationId);
  if (appIndex === -1) return false;

  applications[appIndex] = {
    ...applications[appIndex],
    status: 'approved',
    reviewedAt: new Date(),
    reviewedBy: reviewerId
  };

  localStorage.setItem('storeApplications', JSON.stringify(applications));
  
  // Here you would typically:
  // 1. Create the actual store in the database
  // 2. Update user permissions
  // 3. Send approval email
  
  console.log('✅ Store application approved:', applications[appIndex]);
  return true;
};

export const rejectStoreApplication = async (
  applicationId: string,
  reviewerId: string,
  reason: string
): Promise<boolean> => {
  const stored = localStorage.getItem('storeApplications');
  if (stored) {
    try {
      applications = JSON.parse(stored);
    } catch (error) {
      console.error('Error loading applications:', error);
      return false;
    }
  }

  const appIndex = applications.findIndex(app => app.id === applicationId);
  if (appIndex === -1) return false;

  applications[appIndex] = {
    ...applications[appIndex],
    status: 'rejected',
    reviewedAt: new Date(),
    reviewedBy: reviewerId,
    rejectionReason: reason
  };

  localStorage.setItem('storeApplications', JSON.stringify(applications));
  
  // Here you would typically:
  // 1. Send rejection email with reason
  // 2. Log the rejection for audit
  
  console.log('❌ Store application rejected:', applications[appIndex]);
  return true;
};

export const getApplicationStats = () => {
  const stored = localStorage.getItem('storeApplications');
  if (stored) {
    try {
      applications = JSON.parse(stored);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  }

  return {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };
};

// Initialize with some sample data for demonstration
export const initializeSampleApplications = () => {
  const stored = localStorage.getItem('storeApplications');
  if (!stored) {
    const sampleApplications: StoreApplication[] = [
      {
        id: 'app_1',
        merchantId: 'merchant_1',
        merchantData: {
          firstName: 'أحمد',
          lastName: 'محمد',
          email: 'ahmed@example.com',
          phone: '+966501234567',
          city: 'الرياض',
          businessName: 'متجر الأزياء العصرية',
          businessType: 'fashion'
        },
        storeConfig: {
          template: 'modern-comprehensive',
          customization: {
            storeName: 'متجر الأزياء العصرية',
            storeDescription: 'متجر متخصص في الأزياء النسائية والرجالية العصرية',
            colors: {
              primary: '#FF6B35',
              secondary: '#4A90E2',
              background: '#FFFFFF'
            }
          }
        },
        status: 'pending',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: 'app_2',
        merchantId: 'merchant_2',
        merchantData: {
          firstName: 'فاطمة',
          lastName: 'عبدالله',
          email: 'fatima@example.com',
          phone: '+966507654321',
          city: 'جدة',
          businessName: 'متجر الإلكترونيات الذكية',
          businessType: 'electronics'
        },
        storeConfig: {
          template: 'tech-modern',
          customization: {
            storeName: 'تقنيات المستقبل',
            storeDescription: 'أحدث الأجهزة الإلكترونية والتقنيات الذكية',
            colors: {
              primary: '#0F172A',
              secondary: '#3B82F6',
              background: '#FFFFFF'
            }
          }
        },
        status: 'pending',
        submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      }
    ];
    
    localStorage.setItem('storeApplications', JSON.stringify(sampleApplications));
    applications = sampleApplications;
    console.log('📝 Sample store applications initialized');
  }
};
