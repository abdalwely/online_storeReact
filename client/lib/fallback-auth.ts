// Fallback authentication for development when Firebase is unavailable

export interface FallbackUser {
  uid: string;
  email: string;
  displayName?: string;
}

export interface FallbackUserCredential {
  user: FallbackUser;
}

const FALLBACK_USERS = [
  {
    uid: 'admin_fallback',
    email: 'admin@ecommerce-platform.com',
    password: 'AdminPlatform2024!',
    userType: 'admin',
    displayName: 'مدير المنصة'
  },
  {
    uid: 'merchant_fallback',
    email: 'merchant@test.com',
    password: 'merchant123',
    userType: 'merchant',
    displayName: 'تاجر تجريبي'
  },
  {
    uid: 'customer_fallback',
    email: 'customer@test.com',
    password: 'customer123',
    userType: 'customer',
    displayName: '��ميل تجريبي'
  }
];

let currentUser: FallbackUser | null = null;

export const fallbackSignIn = async (email: string, password: string): Promise<FallbackUserCredential> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('🔍 === FALLBACK SIGN IN DEBUG ===');
      console.log('Input email:', JSON.stringify(email));
      console.log('Input password:', JSON.stringify(password));
      
      // In development mode, be very permissive
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode - trying multiple matching strategies');
        
        // Strategy 1: Exact match
        let user = FALLBACK_USERS.find(u => u.email === email && u.password === password);
        
        if (!user) {
          console.log('Strategy 1 failed, trying trimmed match...');
          // Strategy 2: Trimmed match
          const cleanEmail = email.trim();
          const cleanPassword = password.trim();
          user = FALLBACK_USERS.find(u => u.email === cleanEmail && u.password === cleanPassword);
        }
        
        if (!user) {
          console.log('Strategy 2 failed, trying case-insensitive match...');
          // Strategy 3: Case insensitive email
          const lowerEmail = email.trim().toLowerCase();
          user = FALLBACK_USERS.find(u => u.email.toLowerCase() === lowerEmail && u.password === password.trim());
        }
        
        if (!user) {
          console.log('Strategy 3 failed, trying partial match...');
          // Strategy 4: Check if email contains any known domain
          if (email.includes('admin') || email.includes('ecommerce-platform')) {
            user = FALLBACK_USERS[0]; // Admin
          } else if (email.includes('merchant') || email.includes('test')) {
            user = FALLBACK_USERS[1]; // Merchant
          } else if (email.includes('customer')) {
            user = FALLBACK_USERS[2]; // Customer
          }
        }
        
        if (!user) {
          console.log('All strategies failed, using emergency admin login...');
          // Emergency fallback - always use admin in development
          user = FALLBACK_USERS[0];
          console.log('🚨 Emergency admin login activated');
        }
        
        if (user) {
          currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          };

          localStorage.setItem('fallback_user', JSON.stringify({
            ...currentUser,
            userType: user.userType
          }));

          console.log('✅ Fallback sign in successful');
          console.log('User:', currentUser);
          resolve({ user: currentUser });
          return;
        }
      }
      
      // If we reach here, something went very wrong
      console.log('❌ Complete fallback failure');
      console.log('Available users:');
      FALLBACK_USERS.forEach(u => {
        console.log(`  ${u.email} / ${u.password}`);
      });
      reject(new Error('Invalid credentials'));
    }, 100);
  });
};

export const fallbackSignOut = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = null;
      localStorage.removeItem('fallback_user');
      console.log('✅ Fallback sign out successful');
      resolve();
    }, 100);
  });
};

export const fallbackCreateUser = async (email: string, password: string, userType?: string): Promise<FallbackUserCredential> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = {
        uid: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        displayName: 'New User'
      };
      
      currentUser = newUser;
      localStorage.setItem('fallback_user', JSON.stringify({
        ...currentUser,
        userType: userType || 'customer'
      }));
      
      console.log('✅ Fallback user created:', email);
      resolve({ user: newUser });
    }, 100);
  });
};

export const getCurrentFallbackUser = (): FallbackUser | null => {
  if (currentUser) return currentUser;

  const stored = localStorage.getItem('fallback_user');
  if (stored) {
    try {
      const userData = JSON.parse(stored);
      currentUser = {
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName
      };
      return currentUser;
    } catch (error) {
      console.error('Error parsing fallback user:', error);
      localStorage.removeItem('fallback_user');
    }
  }

  return null;
};

export const isFallbackMode = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const showAvailableCredentials = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Available Fallback Credentials:');
    FALLBACK_USERS.forEach(user => {
      console.log(`📧 ${user.email} | 🔑 ${user.password} | 👤 ${user.userType}`);
    });
  }
};
