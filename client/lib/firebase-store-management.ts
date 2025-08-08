// Firebase-based Store Management System
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Store, Product, Category, StoreCustomization, StoreSettings } from './store-management';

// Firebase Collections
const COLLECTIONS = {
  STORES: 'stores',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  STORE_APPLICATIONS: 'storeApplications'
};

// Firebase-compatible Store interface
export interface FirebaseStore extends Omit<Store, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Store Management Functions
export const createStoreInFirebase = async (storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<Store> => {
  try {
    console.log('🔥 Creating store in Firebase:', storeData.name);
    
    const firebaseStoreData: Omit<FirebaseStore, 'id'> = {
      ...storeData,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.STORES), firebaseStoreData);
    
    // Get the created document to return with the Firebase ID
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as FirebaseStore;
      const store: Store = {
        id: docRef.id,
        ...data,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate()
          : (data.createdAt instanceof Date ? data.createdAt : new Date()),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate()
          : (data.updatedAt instanceof Date ? data.updatedAt : new Date())
      };
      
      console.log('✅ Store created in Firebase:', store.id);
      
      // Also save to localStorage for development fallback
      const localStores = getLocalStores();
      localStores.push(store);
      localStorage.setItem('stores', JSON.stringify(localStores));
      
      return store;
    } else {
      throw new Error('Failed to retrieve created store');
    }
  } catch (error) {
    console.error('❌ Error creating store in Firebase:', error);
    
    // Fallback to localStorage for development
    console.log('🔄 Falling back to localStorage...');
    return createStoreLocally(storeData);
  }
};

export const getStoresFromFirebase = async (): Promise<Store[]> => {
  try {
    console.log('🔥 Fetching stores from Firebase...');
    
    const storesCollection = collection(db, COLLECTIONS.STORES);
    const storesQuery = query(storesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(storesQuery);
    
    const stores: Store[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirebaseStore;
      stores.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate()
          : (data.createdAt instanceof Date ? data.createdAt : new Date()),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate()
          : (data.updatedAt instanceof Date ? data.updatedAt : new Date())
      });
    });
    
    console.log('✅ Fetched', stores.length, 'stores from Firebase');
    
    // Also save to localStorage for caching
    localStorage.setItem('stores', JSON.stringify(stores));
    
    return stores;
  } catch (error) {
    console.error('❌ Error fetching stores from Firebase:', error);

    // Fallback to localStorage
    console.log('🔄 Falling back to localStorage...');
    const localStores = getLocalStores();
    return Array.isArray(localStores) ? localStores : [];
  }
};

export const getStoreFromFirebase = async (storeId: string): Promise<Store | null> => {
  try {
    console.log('🔥 Fetching store from Firebase:', storeId);
    
    const storeDoc = doc(db, COLLECTIONS.STORES, storeId);
    const docSnap = await getDoc(storeDoc);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as FirebaseStore;
      const store: Store = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate()
          : (data.createdAt instanceof Date ? data.createdAt : new Date()),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate()
          : (data.updatedAt instanceof Date ? data.updatedAt : new Date())
      };
      
      console.log('✅ Store fetched from Firebase:', store.name);
      return store;
    } else {
      console.log('❌ Store not found in Firebase:', storeId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching store from Firebase:', error);
    
    // Fallback to localStorage
    const localStores = getLocalStores();
    return localStores.find(store => store.id === storeId) || null;
  }
};

export const getStoreByOwnerFromFirebase = async (ownerId: string): Promise<Store | null> => {
  try {
    console.log('🔥 Fetching store by owner from Firebase:', ownerId);
    
    const storesCollection = collection(db, COLLECTIONS.STORES);
    const storeQuery = query(storesCollection, where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(storeQuery);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data() as FirebaseStore;
      const store: Store = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt && typeof data.createdAt.toDate === 'function'
          ? data.createdAt.toDate()
          : (data.createdAt instanceof Date ? data.createdAt : new Date()),
        updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function'
          ? data.updatedAt.toDate()
          : (data.updatedAt instanceof Date ? data.updatedAt : new Date())
      };
      
      console.log('✅ Store found by owner in Firebase:', store.name);
      return store;
    } else {
      console.log('❌ No store found for owner in Firebase:', ownerId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching store by owner from Firebase:', error);
    
    // Fallback to localStorage
    const localStores = getLocalStores();
    return localStores.find(store => store.ownerId === ownerId) || null;
  }
};

export const updateStoreInFirebase = async (storeId: string, updates: Partial<Store>): Promise<Store | null> => {
  try {
    console.log('🔥 Updating store in Firebase:', storeId);
    
    const storeDoc = doc(db, COLLECTIONS.STORES, storeId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // Remove id, createdAt, updatedAt from updates to avoid conflicts
    delete updateData.id;
    delete updateData.createdAt;
    
    await updateDoc(storeDoc, updateData);
    
    // Fetch and return updated store
    const updatedStore = await getStoreFromFirebase(storeId);
    
    if (updatedStore) {
      console.log('✅ Store updated in Firebase:', updatedStore.name);
      
      // Update localStorage cache
      const localStores = getLocalStores();
      const index = localStores.findIndex(store => store.id === storeId);
      if (index !== -1) {
        localStores[index] = updatedStore;
        localStorage.setItem('stores', JSON.stringify(localStores));
      }
    }
    
    return updatedStore;
  } catch (error) {
    console.error('❌ Error updating store in Firebase:', error);
    
    // Fallback to localStorage
    return updateStoreLocally(storeId, updates);
  }
};

// Product Management Functions
export const createProductInFirebase = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  try {
    console.log('🔥 Creating product in Firebase:', productData.name);
    
    const firebaseProductData = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), firebaseProductData);
    
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const product: Product = {
        id: docRef.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Product;
      
      console.log('✅ Product created in Firebase:', product.id);
      return product;
    } else {
      throw new Error('Failed to retrieve created product');
    }
  } catch (error) {
    console.error('❌ Error creating product in Firebase:', error);
    throw error;
  }
};

export const getProductsFromFirebase = async (storeId?: string): Promise<Product[]> => {
  try {
    console.log('🔥 Fetching products from Firebase for store:', storeId);

    const productsCollection = collection(db, COLLECTIONS.PRODUCTS);
    let productsQuery;

    if (storeId) {
      // Use only the storeId filter to avoid composite index requirement
      productsQuery = query(productsCollection, where('storeId', '==', storeId));
    } else {
      // For all products, use simple orderBy
      productsQuery = query(productsCollection, orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(productsQuery);

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Handle timestamp conversion safely
      let createdAt = new Date();
      let updatedAt = new Date();

      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAt = data.createdAt.toDate();
      } else if (data.createdAt) {
        createdAt = new Date(data.createdAt);
      }

      if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        updatedAt = data.updatedAt.toDate();
      } else if (data.updatedAt) {
        updatedAt = new Date(data.updatedAt);
      }

      products.push({
        id: doc.id,
        ...data,
        createdAt,
        updatedAt
      } as Product);
    });

    // Sort by createdAt on client side if we filtered by storeId
    if (storeId) {
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    console.log('✅ Fetched', products.length, 'products from Firebase');
    return products;
  } catch (error) {
    console.error('❌ Error fetching products from Firebase:', error);

    // Try to get products from localStorage as fallback
    try {
      const localProducts = localStorage.getItem('products');
      if (localProducts) {
        const parsedProducts = JSON.parse(localProducts);
        if (Array.isArray(parsedProducts)) {
          const filteredProducts = storeId
            ? parsedProducts.filter((p: any) => p.storeId === storeId)
            : parsedProducts;
          console.log('🔄 Using products from localStorage as fallback:', filteredProducts.length);
          return filteredProducts.map((product: any) => ({
            ...product,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt)
          }));
        }
      }
    } catch (localError) {
      console.error('❌ Error reading products from localStorage:', localError);
    }

    return [];
  }
};

// Local Storage Fallback Functions
const getLocalStores = (): Store[] => {
  try {
    const stored = localStorage.getItem('stores');
    if (stored) {
      const stores = JSON.parse(stored);
      if (Array.isArray(stores)) {
        return stores.map((store: any) => ({
          ...store,
          createdAt: new Date(store.createdAt),
          updatedAt: new Date(store.updatedAt)
        }));
      }
    }
  } catch (error) {
    console.error('Error parsing local stores:', error);
  }
  return [];
};

const createStoreLocally = (storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Store => {
  const localStores = getLocalStores();
  const store: Store = {
    ...storeData,
    id: `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  localStores.push(store);
  localStorage.setItem('stores', JSON.stringify(localStores));
  
  console.log('✅ Store created locally:', store.id);
  return store;
};

const updateStoreLocally = (storeId: string, updates: Partial<Store>): Store | null => {
  const localStores = getLocalStores();
  const index = localStores.findIndex(store => store.id === storeId);

  if (index !== -1) {
    localStores[index] = {
      ...localStores[index],
      ...updates,
      updatedAt: new Date()
    };

    localStorage.setItem('stores', JSON.stringify(localStores));
    console.log('✅ Store updated locally:', localStores[index].id);
    return localStores[index];
  }

  return null;
};

// Hybrid functions that try Firebase first, fallback to localStorage
export const createStore = createStoreInFirebase;
export const getStores = getStoresFromFirebase;
export const getStoreById = getStoreFromFirebase;
export const getStoreByOwnerId = getStoreByOwnerFromFirebase;
export const updateStore = updateStoreInFirebase;
export const createProduct = createProductInFirebase;
export const getProducts = getProductsFromFirebase;
