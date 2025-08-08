import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, Database, Wifi, WifiOff } from 'lucide-react';
import { getStores } from '@/lib/firebase-store-management';
import { getStoreApplications } from '@/lib/firebase-store-approval';

export default function DatabaseStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    storesCount: number;
    applicationsCount: number;
    lastChecked?: Date;
    error?: string;
  }>({
    connected: false,
    storesCount: 0,
    applicationsCount: 0
  });

  const [checking, setChecking] = useState(false);

  const checkDatabaseStatus = async () => {
    setChecking(true);
    
    try {
      console.log('🔥 Checking Firebase database status...');
      
      const [stores, applications] = await Promise.all([
        getStores(),
        getStoreApplications()
      ]);

      setStatus({
        connected: true,
        storesCount: stores.length,
        applicationsCount: applications.length,
        lastChecked: new Date()
      });

      console.log('✅ Database status check successful:', {
        stores: stores.length,
        applications: applications.length
      });
    } catch (error) {
      console.error('❌ Database status check failed:', error);
      setStatus({
        connected: false,
        storesCount: 0,
        applicationsCount: 0,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Database connection failed'
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
      <Database className="h-4 w-4" />
      <span>قاعدة البيانات:</span>
      
      <Badge variant={status.connected ? 'default' : 'destructive'} className="flex items-center gap-1">
        {status.connected ? (
          <>
            <Wifi className="h-3 w-3" />
            متصلة
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            غير متصلة
          </>
        )}
      </Badge>

      {status.connected && (
        <>
          <span className="text-gray-600">|</span>
          <span>المتاجر: {status.storesCount}</span>
          <span>|</span>
          <span>الطلبات: {status.applicationsCount}</span>
        </>
      )}

      {status.error && (
        <>
          <span className="text-gray-600">|</span>
          <span className="text-red-600 text-xs">{status.error}</span>
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={checkDatabaseStatus}
        disabled={checking}
        className="h-6 w-6 p-0"
      >
        <RefreshCw className={`h-3 w-3 ${checking ? 'animate-spin' : ''}`} />
      </Button>

      {status.lastChecked && (
        <span className="text-xs text-gray-500">
          آخر فحص: {status.lastChecked.toLocaleTimeString('ar')}
        </span>
      )}
    </div>
  );
}
