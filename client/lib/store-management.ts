// Store Management System for Local Development

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subCategory?: string;
  brand?: string;
  sku: string;
  stock: number;
  specifications: Record<string, string>;
  variants?: ProductVariant[];
  tags: string[];
  rating: number;
  reviewCount: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured: boolean;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: Record<string, string>; // size: 'L', color: 'red'
  price?: number;
  sku?: string;
  stock?: number;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  storeId: string;
  sort: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeId: string;
  isActive: boolean;
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  description: string;
  logo?: string;
  cover?: string;
  subdomain: string;
  ownerId: string;
  template: string;
  customization: StoreCustomization;
  settings: StoreSettings;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreCustomization {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    headerBackground: string;
    footerBackground: string;
    cardBackground: string;
    borderColor: string;
  };
  fonts: {
    heading: string;
    body: string;
    size: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
  };
  layout: {
    headerStyle: 'modern' | 'classic' | 'minimal' | 'elegant';
    footerStyle: 'simple' | 'detailed' | 'compact' | 'mega';
    productGridColumns: number;
    containerWidth: 'full' | 'wide' | 'normal' | 'narrow';
    borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
    spacing: 'tight' | 'normal' | 'relaxed' | 'loose';
  };
  homepage: {
    showHeroSlider: boolean;
    showFeaturedProducts: boolean;
    showCategories: boolean;
    showNewsletter: boolean;
    showTestimonials: boolean;
    showStats: boolean;
    showBrands: boolean;
    heroImages: string[];
    heroTexts: { title: string; subtitle: string; buttonText: string }[];
    sectionsOrder: string[];
  };
  pages: {
    enableBlog: boolean;
    enableReviews: boolean;
    enableWishlist: boolean;
    enableCompare: boolean;
    enableLiveChat: boolean;
    enableFAQ: boolean;
    enableAboutUs: boolean;
    enableContactUs: boolean;
  };
  branding: {
    logo: string;
    favicon: string;
    watermark: string;
    showPoweredBy: boolean;
  };
  effects: {
    animations: boolean;
    transitions: boolean;
    shadows: boolean;
    gradients: boolean;
  };
}

export interface StoreSettings {
  currency: string;
  language: string;
  timezone: string;
  shipping: {
    enabled: boolean;
    freeShippingThreshold: number;
    defaultCost: number;
    zones: ShippingZone[];
  };
  payment: {
    cashOnDelivery: boolean;
    bankTransfer: boolean;
    creditCard: boolean;
    paypal: boolean;
    stripe: boolean;
  };
  taxes: {
    enabled: boolean;
    rate: number;
    includeInPrice: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
}

export interface ShippingZone {
  id: string;
  name: string;
  cities: string[];
  cost: number;
  estimatedDays: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  billingAddress: Address;
  tracking?: {
    trackingNumber: string;
    courier: string;
    trackingUrl: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addresses: Address[];
  wishlist: string[]; // product IDs
  orders: string[]; // order IDs
  totalSpent: number;
  orderCount: number;
  createdAt: Date;
  lastOrderAt?: Date;
}

// Local Storage Management
const STORAGE_KEYS = {
  STORES: 'stores',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  CUSTOMERS: 'customers'
};

// Cross-window communication functions
export const broadcastDataChange = (type: string, data: any) => {
  // Send message to all other windows/tabs
  try {
    window.postMessage({
      type: 'DATA_UPDATE',
      dataType: type,
      data: data,
      timestamp: Date.now()
    }, '*');

    // Also trigger storage event for same-origin tabs
    localStorage.setItem(`sync_${type}`, JSON.stringify({
      data: data,
      timestamp: Date.now()
    }));

    console.log(`📡 Broadcasting ${type} data change:`, data.length || Object.keys(data).length, 'items');
  } catch (error) {
    console.error('Error broadcasting data change:', error);
  }
};

// Listen for storage changes from other tabs
export const setupStorageListener = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('storage', (e) => {
    if (e.key?.startsWith('sync_')) {
      const dataType = e.key.replace('sync_', '');
      console.log(`📡 Received storage sync for ${dataType}`);

      // Force reload of specific data type
      if (dataType === 'stores') {
        window.dispatchEvent(new CustomEvent('storesUpdated'));
      }
    }
  });

  // Also listen for direct window messages
  window.addEventListener('message', (e) => {
    if (e.data.type === 'DATA_UPDATE') {
      console.log(`📡 Received data update for ${e.data.dataType}`);
      window.dispatchEvent(new CustomEvent(`${e.data.dataType}Updated`, {
        detail: e.data.data
      }));
    }
  });
};

// Enhanced sync function for stores specifically
export const syncStoresData = (): Store[] => {
  try {
    // Try localStorage first
    let stores = getStores();

    // If no stores in localStorage, try sessionStorage
    if (stores.length === 0) {
      const sessionData = sessionStorage.getItem(STORAGE_KEYS.STORES);
      if (sessionData) {
        console.log('🔄 Syncing stores from sessionStorage to localStorage');
        localStorage.setItem(STORAGE_KEYS.STORES, sessionData);
        stores = getStores(); // Re-fetch after sync
      }
    }

    // Request data from parent window if available
    if (stores.length === 0 && window.opener && !window.opener.closed) {
      console.log('🔄 Requesting stores data from parent window');
      window.opener.postMessage({
        type: 'REQUEST_STORE_DATA',
        timestamp: Date.now()
      }, '*');
    }

    return stores;
  } catch (error) {
    console.error('Error syncing stores data:', error);
    return [];
  }
};

// Store Management Functions
export const createStore = (storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Store => {
  const stores = getStores();
  const store: Store = {
    ...storeData,
    id: `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  stores.push(store);

  // Save to multiple storage locations for reliability
  const storeDataString = JSON.stringify(stores);
  localStorage.setItem(STORAGE_KEYS.STORES, storeDataString);
  sessionStorage.setItem(STORAGE_KEYS.STORES, storeDataString);

  // Also save individual store for quick lookup
  localStorage.setItem(`store_${store.subdomain}`, JSON.stringify(store));
  sessionStorage.setItem(`store_${store.subdomain}`, JSON.stringify(store));

  // تحقق من الحفظ
  const savedStores = localStorage.getItem(STORAGE_KEYS.STORES);
  const parsedSaved = savedStores ? JSON.parse(savedStores) : [];
  console.log('💾 Stores saved verification - Total stored:', parsedSaved.length);
  console.log('💾 Individual store saved:', localStorage.getItem(`store_${store.subdomain}`) ? 'Yes' : 'No');

  // Enhanced broadcasting with immediate effect
  broadcastDataChange('stores', stores);

  // Additional immediate broadcast for new store
  window.postMessage({
    type: 'STORE_CREATED_IMMEDIATE',
    store: store,
    allStores: stores,
    timestamp: Date.now()
  }, '*');

  console.log('✅ Store created successfully:', {
    id: store.id,
    name: store.name,
    subdomain: store.subdomain,
    ownerId: store.ownerId,
    totalStores: stores.length
  });
  return store;
};

export const getStores = (): Store[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.STORES);
  if (stored) {
    try {
      const stores = JSON.parse(stored);
      return stores.map((store: any) => ({
        ...store,
        createdAt: new Date(store.createdAt),
        updatedAt: new Date(store.updatedAt)
      }));
    } catch (error) {
      console.error('Error parsing stores:', error);
    }
  }
  return [];
};

export const getStoreByOwnerId = (ownerId: string): Store | null => {
  const stores = getStores();
  return stores.find(store => store.ownerId === ownerId) || null;
};

export const getStoreBySubdomain = (subdomain: string): Store | null => {
  console.log('🔍 getStoreBySubdomain called for:', subdomain);

  // Try individual store lookup from localStorage first
  const individualStoreLocal = localStorage.getItem(`store_${subdomain}`);
  if (individualStoreLocal) {
    try {
      const store = JSON.parse(individualStoreLocal);
      console.log('✅ Found store in localStorage individual storage:', store.name);
      return {
        ...store,
        createdAt: new Date(store.createdAt),
        updatedAt: new Date(store.updatedAt)
      };
    } catch (error) {
      console.error('Error parsing individual store from localStorage:', error);
    }
  }

  // Try individual store lookup from sessionStorage
  const individualStoreSession = sessionStorage.getItem(`store_${subdomain}`);
  if (individualStoreSession) {
    try {
      const store = JSON.parse(individualStoreSession);
      console.log('✅ Found store in sessionStorage individual storage:', store.name);
      // Also save to localStorage for future use
      localStorage.setItem(`store_${subdomain}`, individualStoreSession);
      return {
        ...store,
        createdAt: new Date(store.createdAt),
        updatedAt: new Date(store.updatedAt)
      };
    } catch (error) {
      console.error('Error parsing individual store from sessionStorage:', error);
    }
  }

  // Fallback to searching all stores from localStorage
  const stores = getStores();
  console.log('🔍 Searching through', stores.length, 'stores for subdomain:', subdomain);

  const foundStore = stores.find(store => {
    const match = store.subdomain === subdomain;
    console.log(`🔍 Checking store ${store.name} (${store.subdomain}): ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
    return match;
  });

  if (foundStore) {
    console.log('✅ Found store in stores list:', foundStore.name);
    // Cache it for future fast lookups
    localStorage.setItem(`store_${subdomain}`, JSON.stringify(foundStore));
    sessionStorage.setItem(`store_${subdomain}`, JSON.stringify(foundStore));
  } else {
    console.log('❌ Store not found in any storage location');
  }

  return foundStore || null;
};

export const getStoreById = (storeId: string): Store | null => {
  const stores = getStores();
  return stores.find(store => store.id === storeId) || null;
};

export const updateStore = (storeId: string, updates: Partial<Store>): Store | null => {
  const stores = getStores();
  const index = stores.findIndex(store => store.id === storeId);

  if (index !== -1) {
    stores[index] = {
      ...stores[index],
      ...updates,
      updatedAt: new Date()
    };

    // Save to both localStorage and sessionStorage
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
    sessionStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));

    // Notify other windows about the data change
    broadcastDataChange('stores', stores);

    console.log('✅ Store updated:', stores[index]);
    return stores[index];
  }

  return null;
};

// Product Management Functions
export const createProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
  const products = getProducts();
  const product: Product = {
    ...productData,
    id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  products.push(product);

  // Save to both localStorage and sessionStorage
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  sessionStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

  // Notify other windows about the data change
  broadcastDataChange('products', products);

  console.log('✅ Product created:', product);
  return product;
};

export const getProducts = (storeId?: string): Product[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  let products: Product[] = [];
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      products = parsed.map((product: any) => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      }));
    } catch (error) {
      console.error('Error parsing products:', error);
    }
  }
  
  return storeId ? products.filter(product => product.storeId === storeId) : products;
};

export const getProductById = (productId: string): Product | null => {
  const products = getProducts();
  return products.find(product => product.id === productId) || null;
};

export const updateProduct = (productId: string, updates: Partial<Product>): Product | null => {
  const products = getProducts();
  const index = products.findIndex(product => product.id === productId);

  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date()
    };

    // Save to both localStorage and sessionStorage
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    sessionStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Notify other windows about the data change
    broadcastDataChange('products', products);

    console.log('✅ Product updated:', products[index]);
    return products[index];
  }

  return null;
};

export const deleteProduct = (productId: string): boolean => {
  const products = getProducts();
  const filteredProducts = products.filter(product => product.id !== productId);
  
  if (filteredProducts.length !== products.length) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filteredProducts));
    console.log('✅ Product deleted:', productId);
    return true;
  }
  
  return false;
};

// Category Management Functions
export const createCategory = (categoryData: Omit<Category, 'id'>): Category => {
  const categories = getCategories();
  const category: Category = {
    ...categoryData,
    id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  categories.push(category);

  // Save to both localStorage and sessionStorage
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  sessionStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));

  // Notify other windows about the data change
  broadcastDataChange('categories', categories);

  console.log('✅ Category created:', category);
  return category;
};

export const getCategories = (storeId?: string): Category[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  let categories: Category[] = [];
  
  if (stored) {
    try {
      categories = JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing categories:', error);
    }
  }
  
  return storeId ? categories.filter(category => category.storeId === storeId) : categories;
};

// Order Management Functions
export const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order => {
  const orders = getOrders();
  const order: Order = {
    ...orderData,
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orderNumber: `ORD-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  orders.push(order);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  console.log('✅ Order created:', order);
  return order;
};

export const getOrders = (storeId?: string): Order[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
  let orders: Order[] = [];
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      orders = parsed.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt)
      }));
    } catch (error) {
      console.error('Error parsing orders:', error);
    }
  }
  
  return storeId ? orders.filter(order => order.storeId === storeId) : orders;
};

export const updateOrderStatus = (orderId: string, status: Order['status']): Order | null => {
  const orders = getOrders();
  const index = orders.findIndex(order => order.id === orderId);
  
  if (index !== -1) {
    orders[index] = {
      ...orders[index],
      status,
      updatedAt: new Date()
    };
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    console.log('✅ Order status updated:', orders[index]);
    return orders[index];
  }
  
  return null;
};

// Customer Management Functions
export const getCustomers = (storeId?: string): Customer[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  let customers: Customer[] = [];

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      customers = parsed.map((customer: any) => ({
        ...customer,
        createdAt: new Date(customer.createdAt),
        updatedAt: new Date(customer.updatedAt),
        lastOrderDate: customer.lastOrderDate ? new Date(customer.lastOrderDate) : undefined
      }));
    } catch (error) {
      console.error('Error parsing customers:', error);
    }
  }

  return storeId ? customers.filter(customer => customer.storeId === storeId) : customers;
};

export const createCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
  const customers = getCustomers();
  const customer: Customer = {
    ...customerData,
    id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  customers.push(customer);
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  console.log('✅ Customer created:', customer);
  return customer;
};

export const updateCustomer = (customerId: string, updates: Partial<Customer>): Customer | null => {
  const customers = getCustomers();
  const index = customers.findIndex(customer => customer.id === customerId);

  if (index !== -1) {
    customers[index] = {
      ...customers[index],
      ...updates,
      updatedAt: new Date()
    };
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    console.log('✅ Customer updated:', customers[index]);
    return customers[index];
  }

  return null;
};

// Initialize sample data
export const initializeSampleData = (storeId: string) => {
  console.log('🔧 Initializing sample data for store:', storeId);
  
  // Sample categories
  const categories = [
    { name: 'الإلكترونيا��', description: 'أجهزة ��لكترونية وتقنية', sort: 1 },
    { name: 'الأزياء', description: 'ملابس وأحذية وإكسسوارات', sort: 2 },
    { name: 'المن��ل والحديقة', description: 'أدوات منزلية وديكور', sort: 3 },
    { name: 'الكتب', description: 'كتب ومراجع علمية', sort: 4 }
  ];
  
  categories.forEach(cat => {
    createCategory({
      ...cat,
      storeId,
      isActive: true
    });
  });
  
  // Sample products
  const products = [
    {
      name: 'هاتف ذكي متطور',
      description: 'هاتف ذكي بمواصفات عالية وكاميرا ممتازة',
      price: 1999,
      originalPrice: 2299,
      category: 'الإلكترونيات',
      sku: 'PHONE-001',
      stock: 15,
      specifications: {
        'الشاشة': '6.7 بوصة AMOLED',
        'المعالج': 'Snapdragon 8 Gen 2',
        'الذاكرة': '256GB',
        'الكاميرا': '108MP'
      },
      tags: ['هاتف', 'ذكي', 'كاميرا'],
      rating: 4.5,
      reviewCount: 127,
      featured: true
    },
    {
      name: 'قميص قطني راقي',
      description: 'قميص رجالي من القطن الخالص بتصميم عصري',
      price: 149,
      category: 'الأزياء',
      sku: 'SHIRT-001',
      stock: 30,
      specifications: {
        'المادة': 'قطن 100%',
        'الألوان المتاحة': 'أبيض، أزرق، أسود',
        'المقاسات': 'S, M, L, XL, XXL'
      },
      tags: ['قميص', 'رجالي', 'قطن'],
      rating: 4.2,
      reviewCount: 89,
      featured: true
    },
    {
      name: 'مصباح LED ذكي',
      description: 'مصباح LED قابل للتحكم عبر التطبيق مع إضاءة متغيرة',
      price: 89,
      category: 'المنزل والحديقة',
      sku: 'LAMP-001',
      stock: 25,
      specifications: {
        'الطاقة': '12W',
        'التحكم': 'Wi-Fi + Bluetooth',
        'الألوان': '16 مليون لون',
        'العمر الافتراضي': '25,000 ساعة'
      },
      tags: ['مصباح', 'ذكي', 'LED'],
      rating: 4.7,
      reviewCount: 45,
      featured: false
    }
  ];
  
  products.forEach(product => {
    createProduct({
      ...product,
      images: ['/placeholder-product.jpg'],
      storeId,
      status: 'active'
    });
  });

  // Sample customers
  const customers = [
    {
      name: 'أحمد محم�� علي',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      totalOrders: 5,
      totalSpent: 2850,
      isActive: true
    },
    {
      name: 'فاطمة سعد الدين',
      email: 'fatima@example.com',
      phone: '+966507654321',
      totalOrders: 3,
      totalSpent: 1200,
      isActive: true
    },
    {
      name: 'محمد عبدالعزيز',
      email: 'mohammed@example.com',
      phone: '+966502468135',
      totalOrders: 8,
      totalSpent: 4500,
      isActive: true
    },
    {
      name: 'سارة أحمد خالد',
      email: 'sara@example.com',
      phone: '+966509876543',
      totalOrders: 2,
      totalSpent: 580,
      isActive: false
    }
  ];

  customers.forEach(customer => {
    createCustomer({
      ...customer,
      storeId,
      lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
    });
  });

  console.log('✅ Sample data initialized');
};
