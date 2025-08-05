// Helper functions for user routing based on authentication state

export const getUserTypeFromStorage = (): string => {
  // Try to get user type from localStorage
  const stored = localStorage.getItem('fallback_user');
  if (stored) {
    try {
      const userData = JSON.parse(stored);
      return userData.userType || 'admin';
    } catch (error) {
      console.warn('Error parsing user data from localStorage:', error);
    }
  }
  
  // Default to admin
  return 'admin';
};

export const getRedirectPath = (userType?: string): string => {
  const actualUserType = userType || getUserTypeFromStorage();
  
  console.log('🔄 Determining redirect path for user type:', actualUserType);
  
  switch (actualUserType) {
    case 'merchant':
      return '/merchant/dashboard';
    case 'customer':
      return '/customer/dashboard';
    case 'admin':
    default:
      return '/admin/dashboard';
  }
};

export const redirectUserAfterLogin = (navigate: any, location: any, userType?: string) => {
  const actualUserType = userType || getUserTypeFromStorage();
  const from = location.state?.from?.pathname || getRedirectPath(actualUserType);
  
  console.log('🚀 Redirecting user after login:', {
    userType: actualUserType,
    redirectTo: from
  });
  
  navigate(from, { replace: true });
};
