// Utility functions for generating valid subdomains

export const generateValidSubdomain = (storeName: string, fallback?: string): string => {
  let subdomain = '';
  
  // تحويل النص العربي إلى انجليزي
  const arabicToEnglish: { [key: string]: string } = {
    'متجر': 'store',
    'محل': 'shop',
    'مؤسسة': 'company',
    'شركة': 'company',
    'مكتب': 'office',
    'مركز': 'center'
  };
  
  // تطبيق التحويلات
  let processedName = storeName;
  for (const [arabic, english] of Object.entries(arabicToEnglish)) {
    processedName = processedName.replace(new RegExp(arabic, 'g'), english);
  }
  
  // تنظيف النص
  subdomain = processedName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')           // تحويل المساحات إلى شرطات
    .replace(/[^a-z0-9-]/g, '')     // حذف كل شيء عدا الحروف والأرقام والشرطات
    .replace(/-+/g, '-')            // تجميع الشرطات المتتالية
    .replace(/^-|-$/g, '');         // حذف الشرطات من البداية والنهاية
  
  // التحقق من صحة النتيجة
  if (!subdomain || subdomain.length < 3) {
    console.log('⚠️ Generated subdomain too short, using fallback');
    subdomain = fallback || `store-${Date.now()}`;
  }
  
  // التأكد من عدم بدء subdomain برقم
  if (/^\d/.test(subdomain)) {
    subdomain = 'store-' + subdomain;
  }
  
  console.log('🔧 Subdomain generation:', {
    original: storeName,
    processed: processedName,
    final: subdomain
  });
  
  return subdomain;
};

export const validateSubdomain = (subdomain: string): boolean => {
  // التحقق من صحة subdomain
  const isValid = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(subdomain) || 
                   /^[a-z0-9]{1,63}$/.test(subdomain);
  
  if (!isValid) {
    console.error('❌ Invalid subdomain:', subdomain);
  }
  
  return isValid;
};
