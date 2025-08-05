import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { testFirebaseConnection, FirebaseDiagnostics } from '../lib/firebase-diagnostics';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<FirebaseDiagnostics | null>(null);
  const [testing, setTesting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    try {
      // Always show offline mode in development
      console.log('🔧 Development mode: Offline mode active');
      setDiagnostics({
        authConnected: false,
        firestoreConnected: false,
        error: 'Development offline mode - Firebase disabled',
        suggestion: 'Application running in offline mode for development.\nAll authentication uses local fallback system.\nNo Firebase network requests are made.'
      });
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
      setDiagnostics({
        authConnected: false,
        firestoreConnected: false,
        error: `Offline mode: ${error}`
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    // Always set to offline mode in development
    setDiagnostics({
      authConnected: false,
      firestoreConnected: false,
      error: 'Development offline mode - Firebase disabled',
      suggestion: 'Application running in offline mode for development.\nAll authentication uses local fallback system.'
    });
  }, []);

  const isConnected = diagnostics?.authConnected && diagnostics?.firestoreConnected;
  const hasPartialConnection = diagnostics?.authConnected || diagnostics?.firestoreConnected;

  if (!diagnostics && !testing) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge 
          variant={isConnected ? "default" : hasPartialConnection ? "secondary" : "destructive"}
          className="flex items-center gap-2"
        >
          {isConnected ? (
            <Wifi className="w-3 h-3" />
          ) : hasPartialConnection ? (
            <AlertTriangle className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          Firebase {isConnected ? 'Connected' : hasPartialConnection ? 'Partial' : 'Disconnected'}
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={runDiagnostics}
          disabled={testing}
          className="p-1 h-8 w-8"
        >
          <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="p-1 h-8 w-8 text-xs"
        >
          ?
        </Button>
      </div>

      {/* Detailed Status */}
      {showDetails && diagnostics && (
        <Alert className="bg-white border shadow-lg">
          <AlertDescription className="space-y-2">
            <div className="text-sm font-medium">Firebase Services:</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Auth:</span>
                <Badge variant={diagnostics.authConnected ? "default" : "destructive"} className="text-xs">
                  {diagnostics.authConnected ? "✓" : "✗"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Firestore:</span>
                <Badge variant={diagnostics.firestoreConnected ? "default" : "destructive"} className="text-xs">
                  {diagnostics.firestoreConnected ? "✓" : "✗"}
                </Badge>
              </div>
            </div>
            
            {diagnostics.error && (
              <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                <div className="font-medium text-red-800">Error:</div>
                <div className="text-red-600">{diagnostics.error}</div>
              </div>
            )}
            
            {diagnostics.suggestion && (
              <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                <div className="font-medium text-yellow-800">Suggestions:</div>
                <div className="text-yellow-600 whitespace-pre-line">{diagnostics.suggestion}</div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ConnectionStatus;
