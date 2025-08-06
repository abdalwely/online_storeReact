// Store Data Synchronization Utilities
// This file helps manage store data sync across different windows and tabs

import { Store } from './store-management';

export class StoreSyncManager {
  private static instance: StoreSyncManager;
  private listeners: Map<string, Function[]> = new Map();

  static getInstance(): StoreSyncManager {
    if (!StoreSyncManager.instance) {
      StoreSyncManager.instance = new StoreSyncManager();
    }
    return StoreSyncManager.instance;
  }

  constructor() {
    this.setupGlobalListeners();
  }

  private setupGlobalListeners() {
    if (typeof window === 'undefined') return;

    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'stores' && e.newValue) {
        console.log('📡 StoreSyncManager: Stores storage changed, notifying listeners');
        this.notifyListeners('stores-updated', JSON.parse(e.newValue));
      } else if (e.key === 'products' && e.newValue) {
        console.log('📡 StoreSyncManager: Products storage changed, notifying listeners');
        this.notifyListeners('products-updated', JSON.parse(e.newValue));
      } else if (e.key === 'categories' && e.newValue) {
        console.log('📡 StoreSyncManager: Categories storage changed, notifying listeners');
        this.notifyListeners('categories-updated', JSON.parse(e.newValue));
      }
    });

    // Listen for postMessage from parent/child windows
    window.addEventListener('message', (e) => {
      if (e.data.type === 'STORE_DATA_RESPONSE' && e.data.stores) {
        console.log('📡 StoreSyncManager: Received store data from external window');
        this.syncStoreData(e.data.stores);
        this.notifyListeners('stores-updated', e.data.stores);
      }
    });
  }

  // Sync store data to both localStorage and sessionStorage
  syncStoreData(stores: Store[]) {
    try {
      const storesJson = JSON.stringify(stores);
      localStorage.setItem('stores', storesJson);
      sessionStorage.setItem('stores', storesJson);
      console.log('✅ StoreSyncManager: Data synced to both storages');
    } catch (error) {
      console.error('❌ StoreSyncManager: Error syncing data:', error);
    }
  }

  // Get stores with fallback mechanisms
  getStoresWithFallback(): Store[] {
    try {
      // Try localStorage first
      let storesData = localStorage.getItem('stores');
      
      // Fallback to sessionStorage
      if (!storesData || storesData === '[]') {
        storesData = sessionStorage.getItem('stores');
        if (storesData) {
          console.log('🔄 StoreSyncManager: Using sessionStorage data');
          localStorage.setItem('stores', storesData);
        }
      }

      if (storesData) {
        const stores = JSON.parse(storesData);
        return stores.map((store: any) => ({
          ...store,
          createdAt: new Date(store.createdAt),
          updatedAt: new Date(store.updatedAt)
        }));
      }
    } catch (error) {
      console.error('❌ StoreSyncManager: Error parsing stores:', error);
    }

    return [];
  }

  // Request data from parent window
  requestDataFromParent(subdomain?: string) {
    if (window.opener && !window.opener.closed) {
      console.log('📤 StoreSyncManager: Requesting data from parent window');
      window.opener.postMessage({
        type: 'REQUEST_STORE_DATA',
        subdomain: subdomain,
        timestamp: Date.now()
      }, '*');
    }

    if (window.parent !== window) {
      console.log('📤 StoreSyncManager: Requesting data from parent iframe');
      window.parent.postMessage({
        type: 'REQUEST_STORE_DATA',
        subdomain: subdomain,
        timestamp: Date.now()
      }, '*');
    }
  }

  // Add listener for data updates
  addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Remove listener
  removeEventListener(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Notify all listeners of an event
  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Create a new store and broadcast the change
  createAndBroadcastStore(storeData: Store) {
    const stores = this.getStoresWithFallback();
    stores.push(storeData);
    this.syncStoreData(stores);
    this.notifyListeners('stores-updated', stores);

    // Also broadcast to other windows
    this.broadcastToOtherWindows('STORE_DATA_RESPONSE', { stores });
  }

  // Broadcast data to other windows
  private broadcastToOtherWindows(type: string, data: any) {
    try {
      // Send to all frames in current window
      window.postMessage({ type, ...data }, '*');
      
      // If this is a child window, send to parent
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type, ...data }, '*');
      }

      // If this is in an iframe, send to parent
      if (window.parent !== window) {
        window.parent.postMessage({ type, ...data }, '*');
      }
    } catch (error) {
      console.error('Error broadcasting to other windows:', error);
    }
  }

  // Wait for stores data to be available
  async waitForStores(subdomain?: string, maxWaitTime: number = 5000): Promise<Store[]> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkStores = () => {
        const stores = this.getStoresWithFallback();
        
        if (stores.length > 0) {
          if (subdomain) {
            const targetStore = stores.find(s => s.subdomain === subdomain);
            if (targetStore) {
              console.log('✅ StoreSyncManager: Found target store:', targetStore.name);
              resolve(stores);
              return;
            }
          } else {
            console.log('✅ StoreSyncManager: Found stores:', stores.length);
            resolve(stores);
            return;
          }
        }

        // Check if we've exceeded max wait time
        if (Date.now() - startTime > maxWaitTime) {
          console.log('⏰ StoreSyncManager: Max wait time exceeded, returning current stores');
          resolve(stores);
          return;
        }

        // Try requesting data from parent again
        if (stores.length === 0) {
          this.requestDataFromParent(subdomain);
        }

        // Continue checking
        setTimeout(checkStores, 500);
      };

      // Start checking immediately
      checkStores();
    });
  }
}

// Export singleton instance
export const storeSyncManager = StoreSyncManager.getInstance();

// Helper function for backward compatibility
export const waitForStoreData = (subdomain?: string, maxWaitTime?: number) => {
  return storeSyncManager.waitForStores(subdomain, maxWaitTime);
};
