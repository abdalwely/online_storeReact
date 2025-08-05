import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has selected a store
    const selectedStoreId = localStorage.getItem('selectedStoreId');
    
    if (!selectedStoreId) {
      // Redirect to store selection if no store is selected
      navigate('/customer/stores');
    } else {
      // User has selected a store, redirect to store dashboard
      navigate('/customer/store-dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg">جاري التحويل...</p>
      </div>
    </div>
  );
}
