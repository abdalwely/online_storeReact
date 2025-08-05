export interface StoreCustomization {
  // Visual Identity
  branding: {
    logo: string;
    favicon: string;
    brandName: string;
    brandDescription: { ar: string; en: string };
    brandColors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      textSecondary: string;
      border: string;
      success: string;
      warning: string;
      error: string;
    };
  };

  // Typography
  typography: {
    primaryFont: string;
    secondaryFont: string;
    fontSizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
  };

  // Layout and Structure
  layout: {
    containerWidth: 'container' | 'full' | 'wide';
    headerStyle: 'fixed' | 'static' | 'transparent' | 'minimal';
    footerStyle: 'simple' | 'detailed' | 'minimal' | 'corporate';
    sidebarEnabled: boolean;
    breadcrumbsEnabled: boolean;
    megaMenuEnabled: boolean;
  };

  // Homepage Components
  homepage: {
    heroSection: {
      enabled: boolean;
      style: 'banner' | 'video' | 'slideshow' | 'split' | 'minimal';
      backgroundImage: string;
      backgroundVideo: string;
      overlay: boolean;
      overlayOpacity: number;
      textAlignment: 'left' | 'center' | 'right';
      content: {
        title: { ar: string; en: string };
        subtitle: { ar: string; en: string };
        ctaText: { ar: string; en: string };
        ctaLink: string;
      };
    };
    
    featuredProducts: {
      enabled: boolean;
      title: { ar: string; en: string };
      limit: number;
      layout: 'grid' | 'carousel' | 'masonry';
      columns: number;
      showPrices: boolean;
      showRatings: boolean;
      showQuickView: boolean;
    };

    categories: {
      enabled: boolean;
      title: { ar: string; en: string };
      style: 'grid' | 'carousel' | 'list' | 'tiles';
      showImages: boolean;
      showProductCount: boolean;
      limit: number;
    };

    banners: {
      enabled: boolean;
      banners: Array<{
        id: string;
        image: string;
        title: { ar: string; en: string };
        description: { ar: string; en: string };
        link: string;
        position: 'top' | 'middle' | 'bottom';
      }>;
    };

    testimonials: {
      enabled: boolean;
      title: { ar: string; en: string };
      testimonials: Array<{
        id: string;
        name: string;
        rating: number;
        comment: { ar: string; en: string };
        avatar: string;
        location: string;
      }>;
      layout: 'carousel' | 'grid';
    };

    newsletter: {
      enabled: boolean;
      title: { ar: string; en: string };
      description: { ar: string; en: string };
      placeholder: { ar: string; en: string };
      buttonText: { ar: string; en: string };
      style: 'simple' | 'popup' | 'inline' | 'footer';
    };

    aboutSection: {
      enabled: boolean;
      title: { ar: string; en: string };
      content: { ar: string; en: string };
      image: string;
      features: Array<{
        icon: string;
        title: { ar: string; en: string };
        description: { ar: string; en: string };
      }>;
    };
  };

  // Product Pages
  productPage: {
    layout: 'sidebar' | 'full-width' | 'tabs';
    imageGallery: {
      style: 'thumbnails' | 'dots' | 'stack' | 'zoom';
      showZoom: boolean;
      showFullscreen: boolean;
      showVideo: boolean;
    };
    productInfo: {
      showSKU: boolean;
      showAvailability: boolean;
      showShipping: boolean;
      showWishlist: boolean;
      showCompare: boolean;
      showShare: boolean;
      showReviews: boolean;
      showRelatedProducts: boolean;
      showRecommendations: boolean;
    };
    reviews: {
      enabled: boolean;
      requirePurchase: boolean;
      moderationEnabled: boolean;
      allowPhotos: boolean;
      showVerifiedBadge: boolean;
    };
  };

  // Category Pages
  categoryPage: {
    layout: 'sidebar' | 'top-filters' | 'no-filters';
    productsPerPage: number;
    gridColumns: number;
    listView: boolean;
    sortOptions: string[];
    filters: {
      priceRange: boolean;
      brand: boolean;
      color: boolean;
      size: boolean;
      rating: boolean;
      availability: boolean;
      customAttributes: boolean;
    };
    pagination: 'numbers' | 'loadMore' | 'infinite';
  };

  // Shopping Cart
  cart: {
    style: 'sidebar' | 'page' | 'popup';
    showThumbnails: boolean;
    showContinueShopping: boolean;
    showShippingCalculator: boolean;
    showCouponCode: boolean;
    showEstimatedTotal: boolean;
    saveForLater: boolean;
    quickCheckout: boolean;
  };

  // Checkout Process
  checkout: {
    layout: 'single-page' | 'multi-step' | 'accordion';
    guestCheckout: boolean;
    accountCreation: 'required' | 'optional' | 'disabled';
    addressValidation: boolean;
    showOrderSummary: boolean;
    showTrustBadges: boolean;
    showSecurityInfo: boolean;
    paymentMethods: {
      cashOnDelivery: boolean;
      bankTransfer: boolean;
      creditCard: boolean;
      digitalWallet: boolean;
      installments: boolean;
    };
  };

  // Order Tracking
  orderTracking: {
    enabled: boolean;
    showMap: boolean;
    showEstimatedDelivery: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    statusSteps: Array<{
      key: string;
      title: { ar: string; en: string };
      description: { ar: string; en: string };
    }>;
  };

  // Static Pages
  staticPages: {
    aboutUs: {
      enabled: boolean;
      content: { ar: string; en: string };
    };
    privacyPolicy: {
      enabled: boolean;
      content: { ar: string; en: string };
    };
    termsOfService: {
      enabled: boolean;
      content: { ar: string; en: string };
    };
    returnPolicy: {
      enabled: boolean;
      content: { ar: string; en: string };
    };
    shippingInfo: {
      enabled: boolean;
      content: { ar: string; en: string };
    };
    faq: {
      enabled: boolean;
      faqs: Array<{
        question: { ar: string; en: string };
        answer: { ar: string; en: string };
        category: string;
      }>;
    };
    contactUs: {
      enabled: boolean;
      showMap: boolean;
      showContactForm: boolean;
      content: { ar: string; en: string };
    };
  };

  // SEO Settings
  seo: {
    metaTitle: { ar: string; en: string };
    metaDescription: { ar: string; en: string };
    keywords: { ar: string[]; en: string[] };
    ogImage: string;
    structuredData: boolean;
    sitemap: boolean;
    robotsTxt: string;
    analytics: {
      googleAnalytics: string;
      facebookPixel: string;
      customCode: string;
    };
  };

  // Social Media
  social: {
    enabled: boolean;
    platforms: {
      facebook: string;
      instagram: string;
      twitter: string;
      youtube: string;
      tiktok: string;
      snapchat: string;
      whatsapp: string;
    };
    showInHeader: boolean;
    showInFooter: boolean;
    socialLogin: boolean;
    socialSharing: boolean;
  };

  // Advanced Features
  advanced: {
    multiLanguage: boolean;
    multiCurrency: boolean;
    darkMode: boolean;
    rtlSupport: boolean;
    pwa: boolean;
    lazyLoading: boolean;
    imageOptimization: boolean;
    caching: boolean;
    cdnEnabled: boolean;
    customCSS: string;
    customJS: string;
  };
}

export interface EnhancedStoreTemplate {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  category: 'modern' | 'classic' | 'minimal' | 'bold' | 'luxury' | 'creative';
  industry: 'general' | 'fashion' | 'electronics' | 'food' | 'beauty' | 'sports' | 'books' | 'home';
  preview: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  thumbnail: string;
  features: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  customization: StoreCustomization;
  demoUrl: string;
  isPremium: boolean;
  price?: number;
}

export const enhancedStoreTemplates: EnhancedStoreTemplate[] = [
  {
    id: 'modern-comprehensive',
    name: { ar: 'متجر شامل عصري', en: 'Modern Comprehensive Store' },
    description: { ar: 'قالب شامل وعصري مع جميع الميزات المتقدمة للتجارة الإلكترونية', en: 'Comprehensive modern template with all advanced e-commerce features' },
    category: 'modern',
    industry: 'general',
    preview: {
      desktop: '/templates/modern-comprehensive/desktop.jpg',
      tablet: '/templates/modern-comprehensive/tablet.jpg',
      mobile: '/templates/modern-comprehensive/mobile.jpg'
    },
    thumbnail: '/templates/modern-comprehensive/thumb.jpg',
    features: [
      'responsive-design',
      'seo-optimized',
      'multi-language',
      'advanced-filters',
      'wishlist',
      'quick-view',
      'mega-menu',
      'ajax-cart',
      'product-zoom',
      'reviews-system',
      'newsletter',
      'social-login',
      'order-tracking',
      'multi-payment'
    ],
    difficulty: 'intermediate',
    customization: {
      branding: {
        logo: '',
        favicon: '',
        brandName: '',
        brandDescription: { ar: '', en: '' },
        brandColors: {
          primary: '#FF6B35',
          secondary: '#4A90E2',
          accent: '#F8F9FA',
          background: '#FFFFFF',
          text: '#333333',
          textSecondary: '#666666',
          border: '#E5E5E5',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444'
        }
      },
      typography: {
        primaryFont: 'Cairo',
        secondaryFont: 'Inter',
        fontSizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        }
      },
      layout: {
        containerWidth: 'container',
        headerStyle: 'fixed',
        footerStyle: 'detailed',
        sidebarEnabled: true,
        breadcrumbsEnabled: true,
        megaMenuEnabled: true
      },
      homepage: {
        heroSection: {
          enabled: true,
          style: 'slideshow',
          backgroundImage: '',
          backgroundVideo: '',
          overlay: true,
          overlayOpacity: 0.4,
          textAlignment: 'center',
          content: {
            title: { ar: 'مرحباً بك في متجرنا', en: 'Welcome to Our Store' },
            subtitle: { ar: 'اكتشف أفضل المنتجات بأسعار مميزة', en: 'Discover the best products at amazing prices' },
            ctaText: { ar: 'تسوق الآن', en: 'Shop Now' },
            ctaLink: '/products'
          }
        },
        featuredProducts: {
          enabled: true,
          title: { ar: 'المنتجات المميزة', en: 'Featured Products' },
          limit: 8,
          layout: 'grid',
          columns: 4,
          showPrices: true,
          showRatings: true,
          showQuickView: true
        },
        categories: {
          enabled: true,
          title: { ar: 'التصنيفات', en: 'Categories' },
          style: 'grid',
          showImages: true,
          showProductCount: true,
          limit: 6
        },
        banners: {
          enabled: true,
          banners: []
        },
        testimonials: {
          enabled: true,
          title: { ar: 'آراء العملاء', en: 'Customer Reviews' },
          testimonials: [],
          layout: 'carousel'
        },
        newsletter: {
          enabled: true,
          title: { ar: 'اشترك في النشرة الإخبارية', en: 'Subscribe to Newsletter' },
          description: { ar: 'احصل على أحدث العروض والمنتجات', en: 'Get latest offers and products' },
          placeholder: { ar: 'أدخل بريدك الإلكتروني', en: 'Enter your email' },
          buttonText: { ar: 'اشتراك', en: 'Subscribe' },
          style: 'inline'
        },
        aboutSection: {
          enabled: true,
          title: { ar: 'عن متجرنا', en: 'About Our Store' },
          content: { ar: '', en: '' },
          image: '',
          features: []
        }
      },
      productPage: {
        layout: 'sidebar',
        imageGallery: {
          style: 'thumbnails',
          showZoom: true,
          showFullscreen: true,
          showVideo: true
        },
        productInfo: {
          showSKU: true,
          showAvailability: true,
          showShipping: true,
          showWishlist: true,
          showCompare: true,
          showShare: true,
          showReviews: true,
          showRelatedProducts: true,
          showRecommendations: true
        },
        reviews: {
          enabled: true,
          requirePurchase: false,
          moderationEnabled: true,
          allowPhotos: true,
          showVerifiedBadge: true
        }
      },
      categoryPage: {
        layout: 'sidebar',
        productsPerPage: 20,
        gridColumns: 4,
        listView: true,
        sortOptions: ['newest', 'price-low', 'price-high', 'rating', 'popular'],
        filters: {
          priceRange: true,
          brand: true,
          color: true,
          size: true,
          rating: true,
          availability: true,
          customAttributes: true
        },
        pagination: 'numbers'
      },
      cart: {
        style: 'sidebar',
        showThumbnails: true,
        showContinueShopping: true,
        showShippingCalculator: true,
        showCouponCode: true,
        showEstimatedTotal: true,
        saveForLater: true,
        quickCheckout: true
      },
      checkout: {
        layout: 'multi-step',
        guestCheckout: true,
        accountCreation: 'optional',
        addressValidation: true,
        showOrderSummary: true,
        showTrustBadges: true,
        showSecurityInfo: true,
        paymentMethods: {
          cashOnDelivery: true,
          bankTransfer: true,
          creditCard: true,
          digitalWallet: true,
          installments: false
        }
      },
      orderTracking: {
        enabled: true,
        showMap: true,
        showEstimatedDelivery: true,
        emailNotifications: true,
        smsNotifications: true,
        statusSteps: [
          {
            key: 'pending',
            title: { ar: 'قيد المراجعة', en: 'Under Review' },
            description: { ar: 'تم استلام طلبك وهو قيد المراجعة', en: 'Your order has been received and is under review' }
          },
          {
            key: 'confirmed',
            title: { ar: 'تم التأكيد', en: 'Confirmed' },
            description: { ar: 'تم تأكيد طلبك وجاري التجهيز', en: 'Your order has been confirmed and is being prepared' }
          },
          {
            key: 'shipped',
            title: { ar: 'تم الشحن', en: 'Shipped' },
            description: { ar: 'تم شحن طلبك وهو في الطريق إليك', en: 'Your order has been shipped and is on the way' }
          },
          {
            key: 'delivered',
            title: { ar: 'تم التوصيل', en: 'Delivered' },
            description: { ar: 'تم توصيل طلبك بنجاح', en: 'Your order has been delivered successfully' }
          }
        ]
      },
      staticPages: {
        aboutUs: {
          enabled: true,
          content: { ar: '', en: '' }
        },
        privacyPolicy: {
          enabled: true,
          content: { ar: '', en: '' }
        },
        termsOfService: {
          enabled: true,
          content: { ar: '', en: '' }
        },
        returnPolicy: {
          enabled: true,
          content: { ar: '', en: '' }
        },
        shippingInfo: {
          enabled: true,
          content: { ar: '', en: '' }
        },
        faq: {
          enabled: true,
          faqs: []
        },
        contactUs: {
          enabled: true,
          showMap: true,
          showContactForm: true,
          content: { ar: '', en: '' }
        }
      },
      seo: {
        metaTitle: { ar: '', en: '' },
        metaDescription: { ar: '', en: '' },
        keywords: { ar: [], en: [] },
        ogImage: '',
        structuredData: true,
        sitemap: true,
        robotsTxt: '',
        analytics: {
          googleAnalytics: '',
          facebookPixel: '',
          customCode: ''
        }
      },
      social: {
        enabled: true,
        platforms: {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: '',
          tiktok: '',
          snapchat: '',
          whatsapp: ''
        },
        showInHeader: true,
        showInFooter: true,
        socialLogin: true,
        socialSharing: true
      },
      advanced: {
        multiLanguage: true,
        multiCurrency: false,
        darkMode: true,
        rtlSupport: true,
        pwa: true,
        lazyLoading: true,
        imageOptimization: true,
        caching: true,
        cdnEnabled: false,
        customCSS: '',
        customJS: ''
      }
    },
    demoUrl: '/demo/modern-comprehensive',
    isPremium: false,
    price: 0
  }
  // Additional templates would go here...
];

// Template management functions
export const getEnhancedTemplateById = (id: string): EnhancedStoreTemplate | null => {
  return enhancedStoreTemplates.find(template => template.id === id) || null;
};

export const getTemplatesByIndustry = (industry: string): EnhancedStoreTemplate[] => {
  return enhancedStoreTemplates.filter(template => 
    template.industry === industry || template.industry === 'general'
  );
};

export const applyTemplateCustomization = (
  baseTemplate: EnhancedStoreTemplate,
  customization: Partial<StoreCustomization>
): EnhancedStoreTemplate => {
  return {
    ...baseTemplate,
    customization: {
      ...baseTemplate.customization,
      ...customization
    }
  };
};

export const generateStoreCSS = (customization: StoreCustomization): string => {
  const { branding, typography } = customization;
  
  return `
    :root {
      /* Brand Colors */
      --brand-primary: ${branding.brandColors.primary};
      --brand-secondary: ${branding.brandColors.secondary};
      --brand-accent: ${branding.brandColors.accent};
      --brand-background: ${branding.brandColors.background};
      --brand-text: ${branding.brandColors.text};
      --brand-text-secondary: ${branding.brandColors.textSecondary};
      --brand-border: ${branding.brandColors.border};
      --brand-success: ${branding.brandColors.success};
      --brand-warning: ${branding.brandColors.warning};
      --brand-error: ${branding.brandColors.error};
      
      /* Typography */
      --font-primary: '${typography.primaryFont}', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-secondary: '${typography.secondaryFont}', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-size-xs: ${typography.fontSizes.xs};
      --font-size-sm: ${typography.fontSizes.sm};
      --font-size-base: ${typography.fontSizes.base};
      --font-size-lg: ${typography.fontSizes.lg};
      --font-size-xl: ${typography.fontSizes.xl};
      --font-size-2xl: ${typography.fontSizes['2xl']};
      --font-size-3xl: ${typography.fontSizes['3xl']};
      --font-size-4xl: ${typography.fontSizes['4xl']};
    }

    body {
      font-family: var(--font-primary);
      color: var(--brand-text);
      background-color: var(--brand-background);
      direction: ${customization.advanced.rtlSupport ? 'rtl' : 'ltr'};
    }

    .btn-primary {
      background-color: var(--brand-primary);
      border-color: var(--brand-primary);
      color: white;
    }

    .btn-secondary {
      background-color: var(--brand-secondary);
      border-color: var(--brand-secondary);
      color: white;
    }

    .text-primary {
      color: var(--brand-primary) !important;
    }

    .bg-primary {
      background-color: var(--brand-primary) !important;
    }

    .border-primary {
      border-color: var(--brand-primary) !important;
    }
  `;
};
