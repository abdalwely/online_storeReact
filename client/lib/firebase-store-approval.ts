// Firebase-based Store Application System
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { generateValidSubdomain } from './subdomain-utils';
import { createStore } from './firebase-store-management';

export interface StoreApplication {
  id?: string;
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
  submittedAt: Timestamp | Date;
  reviewedAt?: Timestamp | Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Firebase-compatible interface
interface FirebaseStoreApplication extends Omit<StoreApplication, 'submittedAt' | 'reviewedAt'> {
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
}

const COLLECTION_NAME = 'storeApplications';

export const submitStoreApplication = async (
  merchantId: string,
  merchantData: StoreApplication['merchantData'],
  storeConfig: StoreApplication['storeConfig']
): Promise<string> => {
  try {
    console.log('🔥 Submitting store application to Firebase for:', merchantData.firstName);
    
    const application: Omit<FirebaseStoreApplication, 'id'> = {
      merchantId,
      merchantData,
      storeConfig,
      status: 'pending',
      submittedAt: serverTimestamp() as Timestamp
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), application);
    
    console.log('✅ Store application submitted to Firebase:', docRef.id);
    
    // Also save to localStorage for development fallback
    saveApplicationLocally({
      id: docRef.id,
      ...application,
      submittedAt: new Date()
    });
    
    // Notify other tabs
    window.postMessage({
      type: 'STORE_APPLICATION_SUBMITTED',
      applicationId: docRef.id,
      timestamp: Date.now()
    }, '*');
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error submitting application to Firebase:', error);
    
    // Fallback to localStorage
    console.log('🔄 Falling back to localStorage for application submission...');
    return submitApplicationLocally(merchantId, merchantData, storeConfig);
  }
};

export const getStoreApplications = async (status?: 'pending' | 'approved' | 'rejected'): Promise<StoreApplication[]> => {
  try {
    console.log('🔥 Fetching store applications from Firebase...');
    
    const applicationsCollection = collection(db, COLLECTION_NAME);
    let applicationsQuery = query(applicationsCollection, orderBy('submittedAt', 'desc'));
    
    if (status) {
      applicationsQuery = query(
        applicationsCollection, 
        where('status', '==', status), 
        orderBy('submittedAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(applicationsQuery);
    
    const applications: StoreApplication[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirebaseStoreApplication;
      applications.push({
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt && typeof data.submittedAt.toDate === 'function'
          ? data.submittedAt.toDate()
          : (data.submittedAt instanceof Date ? data.submittedAt : new Date()),
        reviewedAt: data.reviewedAt && typeof data.reviewedAt.toDate === 'function'
          ? data.reviewedAt.toDate()
          : (data.reviewedAt instanceof Date ? data.reviewedAt : undefined)
      });
    });
    
    console.log('✅ Fetched', applications.length, 'applications from Firebase');
    
    // Also save to localStorage for caching
    localStorage.setItem('storeApplications', JSON.stringify(applications));
    
    return applications;
  } catch (error) {
    console.error('❌ Error fetching applications from Firebase:', error);
    
    // Fallback to localStorage
    console.log('🔄 Falling back to localStorage for applications...');
    return getApplicationsLocally(status);
  }
};

export const getStoreApplicationById = async (id: string): Promise<StoreApplication | null> => {
  try {
    console.log('🔥 Fetching application from Firebase:', id);
    
    const applicationDoc = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(applicationDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as FirebaseStoreApplication;
      const application: StoreApplication = {
        id: docSnap.id,
        ...data,
        submittedAt: data.submittedAt && typeof data.submittedAt.toDate === 'function'
          ? data.submittedAt.toDate()
          : (data.submittedAt instanceof Date ? data.submittedAt : new Date()),
        reviewedAt: data.reviewedAt && typeof data.reviewedAt.toDate === 'function'
          ? data.reviewedAt.toDate()
          : (data.reviewedAt instanceof Date ? data.reviewedAt : undefined)
      };
      
      console.log('✅ Application fetched from Firebase');
      return application;
    } else {
      console.log('❌ Application not found in Firebase:', id);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching application from Firebase:', error);
    
    // Fallback to localStorage
    const localApps = getApplicationsLocally();
    return localApps.find(app => app.id === id) || null;
  }
};

export const getStoreApplicationByMerchantId = async (merchantId: string): Promise<StoreApplication | null> => {
  try {
    console.log('🔥 Fetching application by merchant from Firebase:', merchantId);
    
    const applicationsCollection = collection(db, COLLECTION_NAME);
    const applicationQuery = query(applicationsCollection, where('merchantId', '==', merchantId));
    const querySnapshot = await getDocs(applicationQuery);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data() as FirebaseStoreApplication;
      const application: StoreApplication = {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt && typeof data.submittedAt.toDate === 'function'
          ? data.submittedAt.toDate()
          : (data.submittedAt instanceof Date ? data.submittedAt : new Date()),
        reviewedAt: data.reviewedAt && typeof data.reviewedAt.toDate === 'function'
          ? data.reviewedAt.toDate()
          : (data.reviewedAt instanceof Date ? data.reviewedAt : undefined)
      };
      
      console.log('✅ Application found by merchant in Firebase');
      return application;
    } else {
      console.log('❌ No application found for merchant in Firebase:', merchantId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching application by merchant from Firebase:', error);
    
    // Fallback to localStorage
    const localApps = getApplicationsLocally();
    return localApps.find(app => app.merchantId === merchantId) || null;
  }
};

export const approveStoreApplication = async (
  applicationId: string,
  reviewerId: string
): Promise<boolean> => {
  try {
    console.log('🔥 Approving application in Firebase:', applicationId);
    
    // First get the application
    const application = await getStoreApplicationById(applicationId);
    if (!application) {
      console.error('❌ Application not found for approval:', applicationId);
      return false;
    }
    
    // Update application status in Firebase
    const applicationDoc = doc(db, COLLECTION_NAME, applicationId);
    await updateDoc(applicationDoc, {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: reviewerId
    });
    
    console.log('✅ Application approved in Firebase');
    
    // Create the actual store in Firebase
    const subdomain = generateValidSubdomain(
      application.storeConfig.customization.storeName,
      `store-${Date.now()}`
    );

    const newStore = await createStore({
      name: application.storeConfig.customization.storeName || application.merchantData.businessName,
      description: application.storeConfig.customization.storeDescription || `متجر ${application.merchantData.firstName} للتجارة الإلكترونية`,
      subdomain: subdomain,
      ownerId: application.merchantId,
      template: application.storeConfig.template,
      customization: {
        colors: {
          primary: application.storeConfig.customization.colors.primary,
          secondary: application.storeConfig.customization.colors.secondary,
          background: application.storeConfig.customization.colors.background,
          text: '#1e293b',
          accent: '#3b82f6',
          headerBackground: '#ffffff',
          footerBackground: '#f8fafc',
          cardBackground: '#ffffff',
          borderColor: '#e5e7eb'
        },
        fonts: {
          heading: 'Cairo',
          body: 'Cairo',
          size: {
            small: '14px',
            medium: '16px',
            large: '18px',
            xlarge: '24px'
          }
        },
        layout: {
          headerStyle: 'modern' as const,
          footerStyle: 'detailed' as const,
          productGridColumns: 4,
          containerWidth: 'normal' as const,
          borderRadius: 'medium' as const,
          spacing: 'normal' as const
        },
        homepage: {
          showHeroSlider: true,
          showFeaturedProducts: true,
          showCategories: true,
          showNewsletter: true,
          showTestimonials: false,
          showStats: true,
          showBrands: false,
          heroImages: [],
          heroTexts: [
            { title: `مرحباً بكم في ${application.storeConfig.customization.storeName}`, subtitle: 'أف��ل المنتجات بأسعار مميزة', buttonText: 'تسوق الآن' }
          ],
          sectionsOrder: ['hero', 'categories', 'featured', 'stats']
        },
        pages: {
          enableBlog: false,
          enableReviews: true,
          enableWishlist: true,
          enableCompare: false,
          enableLiveChat: false,
          enableFAQ: true,
          enableAboutUs: true,
          enableContactUs: true
        },
        branding: {
          logo: '',
          favicon: '',
          watermark: '',
          showPoweredBy: true
        },
        effects: {
          animations: true,
          transitions: true,
          shadows: true,
          gradients: true
        }
      },
      settings: {
        currency: 'SAR',
        language: 'ar',
        timezone: 'Asia/Riyadh',
        shipping: {
          enabled: true,
          freeShippingThreshold: 200,
          defaultCost: 25,
          zones: []
        },
        payment: {
          cashOnDelivery: true,
          bankTransfer: false,
          creditCard: false,
          paypal: false,
          stripe: false
        },
        taxes: {
          enabled: false,
          rate: 0,
          includeInPrice: false
        },
        notifications: {
          emailNotifications: false,
          smsNotifications: false,
          pushNotifications: false
        }
      },
      status: 'active'
    });
    
    console.log('✅ Store created successfully for approved application:', newStore.id);
    
    // Notify other tabs
    window.postMessage({
      type: 'STORE_APPLICATION_APPROVED',
      applicationId: applicationId,
      storeId: newStore.id,
      timestamp: Date.now()
    }, '*');
    
    return true;
  } catch (error) {
    console.error('❌ Error approving application in Firebase:', error);
    
    // Fallback to localStorage
    return approveApplicationLocally(applicationId, reviewerId);
  }
};

// Local Storage Fallback Functions
const getApplicationsLocally = (status?: 'pending' | 'approved' | 'rejected'): StoreApplication[] => {
  try {
    const stored = localStorage.getItem('storeApplications');
    if (stored) {
      let applications = JSON.parse(stored) as StoreApplication[];
      
      // Convert date strings back to Date objects
      applications = applications.map(app => ({
        ...app,
        submittedAt: new Date(app.submittedAt),
        reviewedAt: app.reviewedAt ? new Date(app.reviewedAt) : undefined
      }));
      
      if (status) {
        return applications.filter(app => app.status === status);
      }
      return applications;
    }
  } catch (error) {
    console.error('Error loading local applications:', error);
  }
  return [];
};

const saveApplicationLocally = (application: StoreApplication) => {
  const applications = getApplicationsLocally();
  applications.push(application);
  localStorage.setItem('storeApplications', JSON.stringify(applications));
};

const submitApplicationLocally = (
  merchantId: string,
  merchantData: StoreApplication['merchantData'],
  storeConfig: StoreApplication['storeConfig']
): string => {
  const application: StoreApplication = {
    id: `app_${Date.now()}`,
    merchantId,
    merchantData,
    storeConfig,
    status: 'pending',
    submittedAt: new Date()
  };

  saveApplicationLocally(application);
  
  console.log('✅ Store application submitted locally:', application.id);
  return application.id;
};

const approveApplicationLocally = (applicationId: string, reviewerId: string): boolean => {
  const applications = getApplicationsLocally();
  const appIndex = applications.findIndex(app => app.id === applicationId);
  
  if (appIndex === -1) return false;
  
  applications[appIndex] = {
    ...applications[appIndex],
    status: 'approved',
    reviewedAt: new Date(),
    reviewedBy: reviewerId
  };
  
  localStorage.setItem('storeApplications', JSON.stringify(applications));
  console.log('✅ Application approved locally:', applicationId);
  return true;
};
