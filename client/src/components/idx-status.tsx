import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface IdxStatusProps {
  className?: string;
}

interface IdxStatusResponse {
  enabled: boolean;
  message: string;
}

interface ApiTestResponse {
  success: boolean;
  message: string;
}

export default function IdxStatus({ className = "" }: IdxStatusProps) {
  const [showStatus, setShowStatus] = useState(false);
  
  // Get basic API key status
  const { data: idxStatus, isLoading: isStatusLoading } = useQuery<IdxStatusResponse>({
    queryKey: ['/api/idx-status'],
    staleTime: Infinity, // This won't change during the session
  });
  
  // Get API connection test results when needed
  const { data: testResult, isLoading: isTestLoading, refetch: retestConnection } = useQuery<ApiTestResponse>({
    queryKey: ['/api/idx-test'],
    enabled: false, // Don't run automatically, we'll trigger it manually
  });
  
  // Test the connection when the API status shows it's enabled
  useEffect(() => {
    if (idxStatus?.enabled && !testResult) {
      retestConnection();
    }
  }, [idxStatus?.enabled, testResult, retestConnection]);
  
  // Decide if we should show the status banner
  useEffect(() => {
    // Show status if we have any information about the connection
    if (idxStatus || testResult) {
      setShowStatus(true);
    }
  }, [testResult, idxStatus]);
  
  // Always render the component for demonstration purposes
  // In a production app, you might want to hide success messages
  // if (!showStatus) return null;
  
  // If still loading, show a loading message
  if (isStatusLoading || (testResult === undefined && isTestLoading)) {
    return (
      <Alert className={`${className} bg-muted/80`}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking IDX Broker API status</AlertTitle>
        <AlertDescription>
          Please wait while we verify the connection to IDX Broker...
        </AlertDescription>
      </Alert>
    );
  }
  
  // If API key is not configured
  if (idxStatus && !idxStatus.enabled) {
    return (
      <Alert className={`${className} bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800`}>
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle>IDX Broker Integration</AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p>The IDX Broker API key is not configured. External property listings are unavailable.</p>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator to enable this feature.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  // If API test failed
  if (testResult && !testResult.success) {
    return (
      <Alert className={`${className} bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800`}>
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle>IDX Broker Connection Issue</AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p>{testResult.message}</p>
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => retestConnection()}
                disabled={isTestLoading}
              >
                {isTestLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                    Retesting...
                  </>
                ) : (
                  'Test Connection Again'
                )}
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  // If everything is good, we shouldn't reach here since showStatus would be false
  return (
    <Alert className={`${className} bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800`}>
      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertTitle>IDX Broker Connected</AlertTitle>
      <AlertDescription>
        Successfully connected to IDX Broker API. Property listings are available.
      </AlertDescription>
    </Alert>
  );
}