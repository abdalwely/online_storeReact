// دالة لإصلاح بيانات التجار وضمان استخدام الأسماء الحقيقية

export const fixMerchantUserData = (email: string): { firstName: string; lastName: string } | null => {
  try {
    // البحث عن بيانات التاجر من طلبات الموافقة
    const storedApplications = localStorage.getItem('storeApplications');
    if (!storedApplications) {
      console.log('No store applications found');
      return null;
    }

    const applications = JSON.parse(storedApplications);
    const merchantApp = applications.find((app: any) => 
      app.merchantData.email.toLowerCase() === email.toLowerCase()
    );

    if (merchantApp) {
      console.log('✅ Found merchant data:', {
        firstName: merchantApp.merchantData.firstName,
        lastName: merchantApp.merchantData.lastName,
        email: merchantApp.merchantData.email
      });
      
      return {
        firstName: merchantApp.merchantData.firstName,
        lastName: merchantApp.merchantData.lastName
      };
    }

    console.log('❌ No matching merchant application found for:', email);
    return null;
  } catch (error) {
    console.error('Error fixing merchant data:', error);
    return null;
  }
};

export const updateFallbackUserData = (email: string, firstName: string, lastName: string, userType: string = 'merchant') => {
  try {
    const stored = localStorage.getItem('fallback_user');
    let currentData: any = {};
    
    if (stored) {
      currentData = JSON.parse(stored);
    }

    const updatedData = {
      ...currentData,
      email: email,
      firstName: firstName,
      lastName: lastName,
      userType: userType,
      displayName: firstName
    };

    localStorage.setItem('fallback_user', JSON.stringify(updatedData));
    console.log('✅ Updated fallback user data:', updatedData);
    
    return updatedData;
  } catch (error) {
    console.error('Error updating fallback user data:', error);
    return null;
  }
};

export const ensureMerchantDataIntegrity = (email: string): boolean => {
  const merchantData = fixMerchantUserData(email);
  
  if (merchantData) {
    updateFallbackUserData(email, merchantData.firstName, merchantData.lastName, 'merchant');
    return true;
  }
  
  return false;
};
