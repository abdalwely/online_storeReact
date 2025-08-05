import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Initialize platform with admin user
import { initializeApp } from "./lib/app-initialization";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

// Dashboard Pages
import MerchantDashboard from "./pages/merchant/Dashboard";
import EnhancedMerchantDashboard from "./pages/merchant/EnhancedDashboard";
import StoreBuilder from "./pages/merchant/StoreBuilder";
import EnhancedStoreBuilder from "./pages/merchant/EnhancedStoreBuilder";
import ProductManagement from "./pages/merchant/ProductManagement";
import AddProduct from "./pages/merchant/AddProduct";
import OrderManagement from "./pages/merchant/OrderManagement";
import StoreSettings from "./pages/merchant/StoreSettings";
import PendingApproval from "./pages/merchant/PendingApproval\";;val\";oval\";pproval";;

import CustomerDashboard from "./pages/customer/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import EnhancedAdminDashboard from "./pages/admin/EnhancedDashboard";

// Store Frontend
import StoreFrontend from "./pages/store/StoreFrontend";
import EnhancedStoreFrontend from "./pages/store/EnhancedStoreFrontend";
import ComprehensiveStorefront from "./pages/store/ComprehensiveStorefront";

// Placeholder pages
import PlaceholderPage from "./pages/PlaceholderPage";

// Connection status for debugging
import ConnectionStatus from "./components/ConnectionStatus";

// Initialize the platform on app start
initializeApp();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ConnectionStatus />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Static Pages */}
            <Route path="/features" element={<PlaceholderPage type="features" />} />
            <Route path="/pricing" element={<PlaceholderPage type="pricing" />} />
            <Route path="/about" element={<PlaceholderPage type="about" />} />
            <Route path="/contact" element={<PlaceholderPage type="contact" />} />
            <Route path="/help" element={<PlaceholderPage type="help" />} />
            <Route path="/docs" element={<PlaceholderPage type="docs" />} />
            <Route path="/privacy" element={<PlaceholderPage type="privacy" />} />
            <Route path="/terms" element={<PlaceholderPage type="terms" />} />
            <Route path="/careers" element={<PlaceholderPage type="careers" />} />
            
            {/* Auth Recovery */}
            <Route path="/forgot-password" element={<PlaceholderPage type="forgot-password" />} />
            <Route path="/reset-password" element={<PlaceholderPage type="reset-password" />} />
            
            {/* Merchant Dashboard Routes */}
            <Route path="/merchant/dashboard" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <EnhancedMerchantDashboard />
              </ProtectedRoute>
            } />
            <Route path="/merchant/store-builder" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <EnhancedStoreBuilder />
              </ProtectedRoute>
            } />
            <Route path="/merchant/products" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <ProductManagement />
              </ProtectedRoute>
            } />
            <Route path="/merchant/products/new" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <PlaceholderPage type="merchant-add-product" />
              </ProtectedRoute>
            } />
            <Route path="/merchant/orders" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <OrderManagement />
              </ProtectedRoute>
            } />
            <Route path="/merchant/settings" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <StoreSettings />
              </ProtectedRoute>
            } />
            <Route path="/merchant/customers" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <PlaceholderPage type="merchant-customers" />
              </ProtectedRoute>
            } />
            <Route path="/merchant/analytics" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <PlaceholderPage type="merchant-analytics" />
              </ProtectedRoute>
            } />
            <Route path="/merchant/payments" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <PlaceholderPage type="merchant-payments" />
              </ProtectedRoute>
            } />
            <Route path="/merchant/shipping" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <PlaceholderPage type="merchant-shipping" />
              </ProtectedRoute>
            } />
            
            {/* Customer Dashboard Routes */}
            <Route path="/customer/dashboard" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/customer/orders" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PlaceholderPage type="customer-orders" />
              </ProtectedRoute>
            } />
            <Route path="/customer/wishlist" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PlaceholderPage type="customer-wishlist" />
              </ProtectedRoute>
            } />
            <Route path="/customer/profile" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PlaceholderPage type="customer-profile" />
              </ProtectedRoute>
            } />
            <Route path="/customer/addresses" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PlaceholderPage type="customer-addresses" />
              </ProtectedRoute>
            } />
            <Route path="/customer/loyalty" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <PlaceholderPage type="customer-loyalty" />
              </ProtectedRoute>
            } />
            
            {/* Merchant Pending Route */}
            <Route path="/merchant/pending" element={
              <ProtectedRoute allowedRoles={['merchant']}>
                <PendingApproval />
              </ProtectedRoute>
            } />

            {/* Admin Dashboard Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EnhancedAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/merchants" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlaceholderPage type="admin-merchants" />
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlaceholderPage type="admin-customers" />
              </ProtectedRoute>
            } />
            <Route path="/admin/stores" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlaceholderPage type="admin-stores" />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlaceholderPage type="admin-analytics" />
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlaceholderPage type="admin-payments" />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlaceholderPage type="admin-settings" />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlaceholderPage type="admin-reports" />
              </ProtectedRoute>
            } />
            <Route path="/admin/subscriptions" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PlaceholderPage type="admin-subscriptions" />
              </ProtectedRoute>
            } />
            
            {/* Store Pages (Public store fronts) */}
            <Route path="/store/:subdomain" element={<ComprehensiveStorefront />} />
            <Route path="/store/:storeName/product/:productId" element={<PlaceholderPage type="store-product" />} />
            <Route path="/store/:storeName/category/:categoryId" element={<PlaceholderPage type="store-category" />} />
            <Route path="/store/:storeName/cart" element={<PlaceholderPage type="store-cart" />} />
            <Route path="/store/:storeName/checkout" element={<PlaceholderPage type="store-checkout" />} />
            
            {/* Marketplace Pages */}
            <Route path="/marketplace" element={<PlaceholderPage type="marketplace" />} />
            <Route path="/marketplace/search" element={<PlaceholderPage type="marketplace-search" />} />
            <Route path="/marketplace/categories" element={<PlaceholderPage type="marketplace-categories" />} />
            <Route path="/marketplace/deals" element={<PlaceholderPage type="marketplace-deals" />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
