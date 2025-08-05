import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

// Store interface
export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  logo: string;
  subdomain: string;
  customDomain?: string;
  template: string;
  customization: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
    layout: {
      headerStyle: string;
      productCardStyle: string;
      showCategories: boolean;
      showSearch: boolean;
    };
  };
  settings: {
    currency: string;
    language: string;
    shipping: {
      enabled: boolean;
      freeShippingThreshold: number;
      shippingCost: number;
    };
    payment: {
      cashOnDelivery: boolean;
      bankTransfer: boolean;
      creditCard: boolean;
    };
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  status: 'pending' | 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

// Product interface
export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  inventory: {
    quantity: number;
    sku: string;
    trackInventory: boolean;
  };
  variants?: {
    name: string;
    options: string[];
  }[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  status: 'draft' | 'active' | 'inactive';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order interface
export interface Order {
  id: string;
  storeId: string;
  customerId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    variant?: string;
    image: string;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category interface
export interface Category {
  id: string;
  storeId: string;
  name: string;
  description: string;
  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Store Services
export const storeService = {
  // Create store
  async create(storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const cleanedData = cleanFirestoreData({
      ...storeData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const docRef = await addDoc(collection(db, 'stores'), cleanedData);
    return docRef.id;
  },

  // Get store by ID
  async getById(storeId: string): Promise<Store | null> {
    const docSnap = await getDoc(doc(db, 'stores', storeId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Store;
    }
    return null;
  },

  // Get store by subdomain
  async getBySubdomain(subdomain: string): Promise<Store | null> {
    try {
      const q = query(collection(db, 'stores'), where('subdomain', '==', subdomain));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Store;
      }
      return null;
    } catch (error) {
      console.error('Error getting store by subdomain:', error);
      return null;
    }
  },

  // Get stores by owner
  async getByOwner(ownerId: string): Promise<Store[]> {
    try {
      const q = query(collection(db, 'stores'), where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
    } catch (error) {
      console.error('Error getting stores by owner:', error);
      return [];
    }
  },

  // Update store
  async update(storeId: string, data: Partial<Store>): Promise<void> {
    const cleanedData = cleanFirestoreData({
      ...data,
      updatedAt: new Date()
    });

    await updateDoc(doc(db, 'stores', storeId), cleanedData);
  },

  // Delete store
  async delete(storeId: string): Promise<void> {
    await deleteDoc(doc(db, 'stores', storeId));
  },

  // Get all stores (admin)
  async getAll(page = 1, pageSize = 20): Promise<Store[]> {
    try {
      const q = query(
        collection(db, 'stores'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Store));
    } catch (error) {
      console.error('Error getting all stores:', error);
      return [];
    }
  }
};

// Helper function to remove undefined values
const cleanFirestoreData = (data: any): any => {
  if (data === null || data === undefined) {
    return null;
  }

  if (Array.isArray(data)) {
    return data.map(cleanFirestoreData);
  }

  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned;
  }

  return data;
};

// Product Services
export const productService = {
  // Create product
  async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const cleanedData = cleanFirestoreData({
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const docRef = await addDoc(collection(db, 'products'), cleanedData);
    return docRef.id;
  },

  // Get product by ID
  async getById(productId: string): Promise<Product | null> {
    const docSnap = await getDoc(doc(db, 'products', productId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  },

  // Get products by store
  async getByStore(storeId: string, status: 'active' | 'all' = 'active'): Promise<Product[]> {
    try {
      // Use simpler query without orderBy to avoid composite index requirement
      const q = query(
        collection(db, 'products'),
        where('storeId', '==', storeId)
      );

      const querySnapshot = await getDocs(q);
      let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

      // Filter and sort in client to avoid composite index
      if (status === 'active') {
        products = products.filter(product => product.status === 'active');
      }

      // Sort by createdAt in client
      products.sort((a, b) => {
        const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return bDate.getTime() - aDate.getTime();
      });

      return products;
    } catch (error) {
      console.error('Error getting products by store:', error);
      return [];
    }
  },

  // Get featured products
  async getFeatured(storeId: string, limitCount = 8): Promise<Product[]> {
    try {
      // Use simpler query to avoid composite index requirement
      const q = query(
        collection(db, 'products'),
        where('storeId', '==', storeId)
      );

      const querySnapshot = await getDocs(q);
      let products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

      // Filter in client to avoid composite index
      products = products
        .filter(product => product.featured === true && product.status === 'active')
        .slice(0, limitCount);

      return products;
    } catch (error) {
      console.error('Error getting featured products:', error);
      return [];
    }
  },

  // Update product
  async update(productId: string, data: Partial<Product>): Promise<void> {
    const cleanedData = cleanFirestoreData({
      ...data,
      updatedAt: new Date()
    });

    await updateDoc(doc(db, 'products', productId), cleanedData);
  },

  // Delete product
  async delete(productId: string): Promise<void> {
    await deleteDoc(doc(db, 'products', productId));
  },

  // Search products
  async search(storeId: string, searchTerm: string): Promise<Product[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a simplified version. For production, consider using Algolia or Elasticsearch
    const q = query(
      collection(db, 'products'),
      where('storeId', '==', storeId),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
};

// Order Services
export const orderService = {
  // Create order
  async create(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const cleanedData = cleanFirestoreData({
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const docRef = await addDoc(collection(db, 'orders'), cleanedData);
    return docRef.id;
  },

  // Get order by ID
  async getById(orderId: string): Promise<Order | null> {
    const docSnap = await getDoc(doc(db, 'orders', orderId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order;
    }
    return null;
  },

  // Get orders by store
  async getByStore(storeId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('storeId', '==', storeId)
      );
      const querySnapshot = await getDocs(q);
      let orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

      // Sort by createdAt in client to avoid composite index
      orders.sort((a, b) => {
        const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return bDate.getTime() - aDate.getTime();
      });

      return orders;
    } catch (error) {
      console.error('Error getting orders by store:', error);
      return [];
    }
  },

  // Get orders by customer
  async getByCustomer(customerId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('customerId', '==', customerId)
      );
      const querySnapshot = await getDocs(q);
      let orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

      // Sort by createdAt in client to avoid composite index
      orders.sort((a, b) => {
        const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return bDate.getTime() - aDate.getTime();
      });

      return orders;
    } catch (error) {
      console.error('Error getting orders by customer:', error);
      return [];
    }
  },

  // Update order
  async update(orderId: string, data: Partial<Order>): Promise<void> {
    const cleanedData = cleanFirestoreData({
      ...data,
      updatedAt: new Date()
    });

    await updateDoc(doc(db, 'orders', orderId), cleanedData);
  },

  // Update order status
  async updateStatus(orderId: string, status: Order['orderStatus']): Promise<void> {
    const cleanedData = cleanFirestoreData({
      orderStatus: status,
      updatedAt: new Date()
    });

    await updateDoc(doc(db, 'orders', orderId), cleanedData);
  }
};

// Category Services
export const categoryService = {
  // Create category
  async create(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const cleanedData = cleanFirestoreData({
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const docRef = await addDoc(collection(db, 'categories'), cleanedData);
    return docRef.id;
  },

  // Get categories by store
  async getByStore(storeId: string): Promise<Category[]> {
    try {
      const q = query(
        collection(db, 'categories'),
        where('storeId', '==', storeId)
      );
      const querySnapshot = await getDocs(q);
      let categories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));

      // Filter and sort in client to avoid composite index
      categories = categories
        .filter(category => category.isActive)
        .sort((a, b) => a.order - b.order);

      return categories;
    } catch (error) {
      console.error('Error getting categories by store:', error);
      return [];
    }
  },

  // Update category
  async update(categoryId: string, data: Partial<Category>): Promise<void> {
    const cleanedData = cleanFirestoreData({
      ...data,
      updatedAt: new Date()
    });

    await updateDoc(doc(db, 'categories', categoryId), cleanedData);
  },

  // Delete category
  async delete(categoryId: string): Promise<void> {
    await deleteDoc(doc(db, 'categories', categoryId));
  }
};

// File Upload Service
export const uploadService = {
  // Upload image
  async uploadImage(file: File, path: string): Promise<string> {
    const fileRef = ref(storage, `images/${path}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  },

  // Delete image
  async deleteImage(url: string): Promise<void> {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  }
};

// Export convenience functions for backwards compatibility
export const createStore = storeService.create;
export const getStoreById = storeService.getById;
export const getStoreByOwnerId = async (ownerId: string): Promise<Store | null> => {
  const stores = await storeService.getByOwner(ownerId);
  return stores.length > 0 ? stores[0] : null;
};
export const getStoreBySubdomain = storeService.getBySubdomain;
export const updateStore = storeService.update;
export const deleteStore = storeService.delete;

export const createProduct = productService.create;
export const getProductById = productService.getById;
export const getProductsByStoreId = productService.getByStore;
export const updateProduct = productService.update;
export const deleteProduct = productService.delete;

export const createOrder = orderService.create;
export const getOrderById = orderService.getById;
export const getOrdersByStoreId = orderService.getByStore;
export const updateOrder = orderService.update;
export const updateOrderStatus = orderService.updateStatus;

export const createCategory = categoryService.create;
export const getCategoryById = categoryService.getById;
export const getStoreCategoriesByStoreId = categoryService.getByStore;
export const updateCategory = categoryService.update;
export const deleteCategory = categoryService.delete;
