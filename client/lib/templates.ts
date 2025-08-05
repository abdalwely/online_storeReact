export interface StoreTemplate {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  category: 'modern' | 'classic' | 'minimal' | 'bold';
  preview: string;
  thumbnail: string;
  features: string[];
  customization: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      accent: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
    layout: {
      headerStyle: 'modern' | 'classic' | 'minimal' | 'bold';
      productCardStyle: 'card' | 'minimal' | 'overlay' | 'modern';
      showCategories: boolean;
      showSearch: boolean;
      showWishlist: boolean;
      showCart: boolean;
      heroSection: boolean;
      featuredProducts: boolean;
      testimonials: boolean;
      newsletter: boolean;
    };
    components: {
      header: {
        transparent: boolean;
        sticky: boolean;
        centerLogo: boolean;
        showSocial: boolean;
      };
      footer: {
        style: 'simple' | 'detailed' | 'minimal';
        showSocial: boolean;
        showNewsletter: boolean;
      };
      productGrid: {
        columns: number;
        spacing: 'tight' | 'normal' | 'loose';
        showQuickView: boolean;
        showWishlist: boolean;
      };
    };
  };
}

export const storeTemplates: StoreTemplate[] = [
  {
    id: 'modern-ecommerce',
    name: { ar: 'متجر عصري', en: 'Modern Store' },
    description: { ar: 'تصميم عصري وأنيق مناسب لجميع أنواع المنتجات', en: 'Modern and elegant design suitable for all product types' },
    category: 'modern',
    preview: '/templates/modern-preview.jpg',
    thumbnail: '/templates/modern-thumb.jpg',
    features: ['responsive', 'seo-optimized', 'fast-loading', 'mobile-first'],
    customization: {
      colors: {
        primary: '#FF6B35',
        secondary: '#4A90E2',
        background: '#FFFFFF',
        text: '#333333',
        accent: '#F8F9FA'
      },
      fonts: {
        primary: 'Cairo',
        secondary: 'Inter'
      },
      layout: {
        headerStyle: 'modern',
        productCardStyle: 'card',
        showCategories: true,
        showSearch: true,
        showWishlist: true,
        showCart: true,
        heroSection: true,
        featuredProducts: true,
        testimonials: true,
        newsletter: true
      },
      components: {
        header: {
          transparent: false,
          sticky: true,
          centerLogo: false,
          showSocial: true
        },
        footer: {
          style: 'detailed',
          showSocial: true,
          showNewsletter: true
        },
        productGrid: {
          columns: 4,
          spacing: 'normal',
          showQuickView: true,
          showWishlist: true
        }
      }
    }
  },
  {
    id: 'minimal-clean',
    name: { ar: 'متجر بسيط', en: 'Minimal Clean' },
    description: { ar: 'تصميم بسيط ونظيف يركز على المنتجات', en: 'Simple and clean design focused on products' },
    category: 'minimal',
    preview: '/templates/minimal-preview.jpg',
    thumbnail: '/templates/minimal-thumb.jpg',
    features: ['minimal-design', 'fast-loading', 'clean-interface'],
    customization: {
      colors: {
        primary: '#2D3748',
        secondary: '#718096',
        background: '#FFFFFF',
        text: '#2D3748',
        accent: '#F7FAFC'
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Inter'
      },
      layout: {
        headerStyle: 'minimal',
        productCardStyle: 'minimal',
        showCategories: true,
        showSearch: true,
        showWishlist: false,
        showCart: true,
        heroSection: false,
        featuredProducts: true,
        testimonials: false,
        newsletter: false
      },
      components: {
        header: {
          transparent: true,
          sticky: true,
          centerLogo: true,
          showSocial: false
        },
        footer: {
          style: 'minimal',
          showSocial: false,
          showNewsletter: false
        },
        productGrid: {
          columns: 3,
          spacing: 'loose',
          showQuickView: false,
          showWishlist: false
        }
      }
    }
  },
  {
    id: 'classic-traditional',
    name: { ar: 'متجر كلاسيكي', en: 'Classic Traditional' },
    description: { ar: 'تصميم كلاسيكي مناسب للمتاجر التقليدية', en: 'Classic design suitable for traditional stores' },
    category: 'classic',
    preview: '/templates/classic-preview.jpg',
    thumbnail: '/templates/classic-thumb.jpg',
    features: ['classic-design', 'traditional-layout', 'reliable'],
    customization: {
      colors: {
        primary: '#8B4513',
        secondary: '#D2691E',
        background: '#FDF6E3',
        text: '#2F1B14',
        accent: '#F4F1DE'
      },
      fonts: {
        primary: 'Georgia',
        secondary: 'Times New Roman'
      },
      layout: {
        headerStyle: 'classic',
        productCardStyle: 'card',
        showCategories: true,
        showSearch: true,
        showWishlist: true,
        showCart: true,
        heroSection: true,
        featuredProducts: true,
        testimonials: true,
        newsletter: true
      },
      components: {
        header: {
          transparent: false,
          sticky: false,
          centerLogo: true,
          showSocial: true
        },
        footer: {
          style: 'detailed',
          showSocial: true,
          showNewsletter: true
        },
        productGrid: {
          columns: 3,
          spacing: 'normal',
          showQuickView: true,
          showWishlist: true
        }
      }
    }
  },
  {
    id: 'bold-fashion',
    name: { ar: 'متجر أزياء جريء', en: 'Bold Fashion' },
    description: { ar: 'تصميم جريء وملفت مناسب لمتاجر الأزياء', en: 'Bold and striking design perfect for fashion stores' },
    category: 'bold',
    preview: '/templates/bold-preview.jpg',
    thumbnail: '/templates/bold-thumb.jpg',
    features: ['bold-design', 'fashion-focused', 'visual-impact'],
    customization: {
      colors: {
        primary: '#E91E63',
        secondary: '#9C27B0',
        background: '#FFFFFF',
        text: '#212121',
        accent: '#F8BBD9'
      },
      fonts: {
        primary: 'Playfair Display',
        secondary: 'Open Sans'
      },
      layout: {
        headerStyle: 'bold',
        productCardStyle: 'overlay',
        showCategories: true,
        showSearch: true,
        showWishlist: true,
        showCart: true,
        heroSection: true,
        featuredProducts: true,
        testimonials: true,
        newsletter: true
      },
      components: {
        header: {
          transparent: true,
          sticky: true,
          centerLogo: false,
          showSocial: true
        },
        footer: {
          style: 'detailed',
          showSocial: true,
          showNewsletter: true
        },
        productGrid: {
          columns: 4,
          spacing: 'tight',
          showQuickView: true,
          showWishlist: true
        }
      }
    }
  },
  {
    id: 'tech-modern',
    name: { ar: 'متجر تقني حديث', en: 'Tech Modern' },
    description: { ar: 'تصميم تقني حديث مناسب لمتاجر الإلكترونيات', en: 'Modern tech design perfect for electronics stores' },
    category: 'modern',
    preview: '/templates/tech-preview.jpg',
    thumbnail: '/templates/tech-thumb.jpg',
    features: ['tech-design', 'modern-layout', 'sleek-interface'],
    customization: {
      colors: {
        primary: '#0F172A',
        secondary: '#3B82F6',
        background: '#FFFFFF',
        text: '#1E293B',
        accent: '#F1F5F9'
      },
      fonts: {
        primary: 'Roboto',
        secondary: 'Roboto'
      },
      layout: {
        headerStyle: 'modern',
        productCardStyle: 'modern',
        showCategories: true,
        showSearch: true,
        showWishlist: true,
        showCart: true,
        heroSection: true,
        featuredProducts: true,
        testimonials: false,
        newsletter: true
      },
      components: {
        header: {
          transparent: false,
          sticky: true,
          centerLogo: false,
          showSocial: false
        },
        footer: {
          style: 'simple',
          showSocial: false,
          showNewsletter: true
        },
        productGrid: {
          columns: 4,
          spacing: 'normal',
          showQuickView: true,
          showWishlist: true
        }
      }
    }
  },
  {
    id: 'food-delicious',
    name: { ar: 'متجر طعام لذيذ', en: 'Delicious Food' },
    description: { ar: 'تصميم شهي ومناسب لمتاجر الطعام والمشروبات', en: 'Appetizing design perfect for food and beverage stores' },
    category: 'modern',
    preview: '/templates/food-preview.jpg',
    thumbnail: '/templates/food-thumb.jpg',
    features: ['food-focused', 'appetizing-design', 'warm-colors'],
    customization: {
      colors: {
        primary: '#D97706',
        secondary: '#DC2626',
        background: '#FFFBEB',
        text: '#92400E',
        accent: '#FEF3C7'
      },
      fonts: {
        primary: 'Lobster',
        secondary: 'Open Sans'
      },
      layout: {
        headerStyle: 'modern',
        productCardStyle: 'card',
        showCategories: true,
        showSearch: true,
        showWishlist: true,
        showCart: true,
        heroSection: true,
        featuredProducts: true,
        testimonials: true,
        newsletter: true
      },
      components: {
        header: {
          transparent: false,
          sticky: true,
          centerLogo: true,
          showSocial: true
        },
        footer: {
          style: 'detailed',
          showSocial: true,
          showNewsletter: true
        },
        productGrid: {
          columns: 3,
          spacing: 'normal',
          showQuickView: true,
          showWishlist: true
        }
      }
    }
  }
];

export const getTemplateById = (id: string): StoreTemplate | null => {
  return storeTemplates.find(template => template.id === id) || null;
};

export const getTemplatesByCategory = (category: StoreTemplate['category']): StoreTemplate[] => {
  return storeTemplates.filter(template => template.category === category);
};

// Template customization functions
export const updateTemplateColors = (template: StoreTemplate, colors: Partial<StoreTemplate['customization']['colors']>): StoreTemplate => {
  return {
    ...template,
    customization: {
      ...template.customization,
      colors: {
        ...template.customization.colors,
        ...colors
      }
    }
  };
};

export const updateTemplateLayout = (template: StoreTemplate, layout: Partial<StoreTemplate['customization']['layout']>): StoreTemplate => {
  return {
    ...template,
    customization: {
      ...template.customization,
      layout: {
        ...template.customization.layout,
        ...layout
      }
    }
  };
};

export const updateTemplateComponents = (template: StoreTemplate, components: Partial<StoreTemplate['customization']['components']>): StoreTemplate => {
  return {
    ...template,
    customization: {
      ...template.customization,
      components: {
        ...template.customization.components,
        ...components
      }
    }
  };
};

// Generate CSS variables from template
export const generateTemplateCSS = (template: StoreTemplate): string => {
  const { colors, fonts } = template.customization;
  
  return `
    :root {
      --template-primary: ${colors.primary};
      --template-secondary: ${colors.secondary};
      --template-background: ${colors.background};
      --template-text: ${colors.text};
      --template-accent: ${colors.accent};
      --template-font-primary: ${fonts.primary};
      --template-font-secondary: ${fonts.secondary};
    }
  `;
};

// Validate template configuration
export const validateTemplate = (template: StoreTemplate): boolean => {
  // Check required fields
  if (!template.id || !template.name || !template.customization) {
    return false;
  }

  // Check color format (basic hex validation)
  const colorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const colors = template.customization.colors;
  
  if (!colorPattern.test(colors.primary) || 
      !colorPattern.test(colors.secondary) || 
      !colorPattern.test(colors.background) || 
      !colorPattern.test(colors.text) || 
      !colorPattern.test(colors.accent)) {
    return false;
  }

  return true;
};
