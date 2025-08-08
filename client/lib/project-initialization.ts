// Project Initialization for Firebase Integration
import { createStore, getStores } from './firebase-store-management';
import { submitStoreApplication, getStoreApplications } from './firebase-store-approval';
import { initializeSampleData } from './store-management';

export const initializeProject = async () => {
  console.log('🚀 Initializing project with Firebase integration...');

  try {
    // Check if we already have data
    const existingStores = await getStores();
    const existingApplications = await getStoreApplications();

    console.log('📊 Existing data:', {
      stores: existingStores.length,
      applications: existingApplications.length
    });

    // If no data exists, create sample data
    if (existingStores.length === 0 && existingApplications.length === 0) {
      console.log('🔧 No existing data found, creating sample data...');
      await createSampleData();
    } else {
      console.log('✅ Project already has data, skipping initialization');
    }
  } catch (error) {
    console.error('❌ Error during project initialization:', error);
    console.log('🔄 Falling back to localStorage mode...');
  }
};

const createSampleData = async () => {
  try {
    // Create a sample store
    console.log('🏪 Creating sample store...');
    const sampleStore = await createStore({
      name: 'المتجر النموذجي',
      description: 'متجر نموذجي لعرض المنصة',
      subdomain: 'sample-store',
      ownerId: 'sample_merchant_123',
      template: 'modern',
      customization: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          background: '#ffffff',
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
            { title: 'مرحباً بكم في المتجر النموذجي', subtitle: 'أفضل المنتجات بأسعار مميزة', buttonText: 'تسوق الآن' }
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

    console.log('✅ Sample store created:', sampleStore.id);

    // Initialize sample data for the store
    console.log('🔧 Adding sample products and categories...');
    initializeSampleData(sampleStore.id);

    // Create a sample application
    console.log('📝 Creating sample application...');
    await submitStoreApplication(
      'sample_merchant_456',
      {
        firstName: 'أحمد',
        lastName: 'محمد',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        city: 'الرياض',
        businessName: 'متجر أحمد للتجارة',
        businessType: 'تجارة إلكترونية'
      },
      {
        template: 'modern',
        customization: {
          storeName: 'متجر أحمد',
          storeDescription: 'متجر متخصص في بيع المنتجات عالية الجودة',
          colors: {
            primary: '#16a34a',
            secondary: '#6b7280',
            background: '#ffffff'
          }
        }
      }
    );

    console.log('✅ Project initialization completed successfully');
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
};

export const checkProjectHealth = async (): Promise<{
  firebase: boolean;
  stores: number;
  applications: number;
  error?: string;
}> => {
  try {
    const [stores, applications] = await Promise.all([
      getStores(),
      getStoreApplications()
    ]);

    return {
      firebase: true,
      stores: stores.length,
      applications: applications.length
    };
  } catch (error) {
    return {
      firebase: false,
      stores: 0,
      applications: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
