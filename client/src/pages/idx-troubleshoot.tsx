import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface IDXStatus {
  apiKey: boolean;
  apiBaseUrl: string;
  apiResponse?: any;
}

const IDXTroubleshoot: React.FC = () => {
  const [accountId, setAccountId] = useState<string>('');
  const [widgetId, setWidgetId] = useState<string>('widget_1');
  const [status, setStatus] = useState<IDXStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [widgetScript, setWidgetScript] = useState<HTMLScriptElement | null>(null);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Fetch the IDX status when component mounts
    checkIDXStatus();

    // Clean up any widget script when component unmounts
    return () => {
      if (widgetScript) {
        document.body.removeChild(widgetScript);
      }
    };
  }, []);

  const checkIDXStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('GET', '/api/idx/status');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Error checking IDX status:', err);
      setError('Error checking IDX Broker status. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  const testWidgetScript = () => {
    setLoading(true);
    setError(null);
    setTestResult('');
    
    // Remove any existing script
    if (widgetScript) {
      document.body.removeChild(widgetScript);
      setWidgetScript(null);
    }
    
    try {
      // Test URL pattern 1 (diversesolutions.com)
      const script1 = document.createElement('script');
      script1.src = `https://idx.diversesolutions.com/scripts/controls.js?accountid=${accountId}&widgetid=${widgetId}`;
      script1.async = true;
      
      // Create a wrapper to test different URL patterns
      const testScript = (script: HTMLScriptElement, pattern: string) => {
        return new Promise((resolve, reject) => {
          script.onload = () => {
            setTestResult(prev => prev + `\n✅ SUCCESS: ${pattern} script loaded successfully.`);
            resolve(true);
          };
          
          script.onerror = () => {
            setTestResult(prev => prev + `\n❌ FAILED: ${pattern} script failed to load.`);
            resolve(false);
          };
          
          document.body.appendChild(script);
          setWidgetScript(script);
        });
      };
      
      testScript(script1, 'diversesolutions.com');
    } catch (err) {
      setError(`Error testing widget script: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">IDX Broker Integration Troubleshooting</h1>
      
      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>IDX Broker Diagnostic Tool</AlertTitle>
        <AlertDescription>
          This page helps diagnose issues with your IDX Broker integration. Use it to check API status
          and test different widget configurations.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Backend API Status</CardTitle>
            <CardDescription>Check the status of your IDX Broker API connection</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center p-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Checking IDX Broker status...</p>
              </div>
            ) : status ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${status.apiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p>IDX Broker API Key: {status.apiKey ? 'Present' : 'Missing'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">API Base URL:</p>
                  <code className="block p-2 bg-gray-100 rounded text-sm">{status.apiBaseUrl}</code>
                </div>
                
                {status.apiResponse && (
                  <div>
                    <p className="text-sm font-medium mb-1">Latest API Response:</p>
                    <pre className="p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(status.apiResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded">
                {error}
              </div>
            ) : (
              <p>No status information available.</p>
            )}
            
            <div className="mt-4">
              <Button onClick={checkIDXStatus} disabled={loading}>
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Widget Test</CardTitle>
            <CardDescription>Test the IDX Broker widget with different account IDs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountId">IDX Broker Account ID</Label>
                <Input 
                  id="accountId"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Enter your IDX Broker account ID"
                  className="mb-2"
                />
                <p className="text-sm text-gray-500">
                  Example: MRE001, DEMO_01, etc. You can find this in your IDX Broker dashboard.
                </p>
              </div>
              
              <div>
                <Label htmlFor="widgetId">Widget ID</Label>
                <Input 
                  id="widgetId"
                  value={widgetId}
                  onChange={(e) => setWidgetId(e.target.value)}
                  placeholder="Enter widget ID"
                />
              </div>
              
              <Button 
                onClick={testWidgetScript}
                disabled={!accountId || loading}
                className="w-full"
              >
                Test Widget Script
              </Button>
              
              {testResult && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Test Results:</p>
                  <pre className="p-3 bg-gray-100 rounded text-xs whitespace-pre-wrap">
                    {testResult || 'No results yet.'}
                  </pre>
                </div>
              )}
              
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Widget Container</CardTitle>
          <CardDescription>This container will display the IDX widget if configured correctly</CardDescription>
        </CardHeader>
        <CardContent>
          <div id={`IDX-${widgetId}`} className="min-h-[400px] border border-dashed border-gray-300 rounded p-4 flex items-center justify-center">
            {!accountId ? (
              <p className="text-gray-500">Enter an account ID and widget ID, then click "Test Widget Script" to display the widget here.</p>
            ) : (
              <p className="text-gray-500">Widget should appear here if configuration is correct...</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Make sure your IDX Broker account is active and properly configured.</li>
            <li>Verify you're using the correct IDX Broker account ID.</li>
            <li>Check that your IDX Broker account has at least one widget configured.</li>
            <li>Ensure your domain is authorized in the IDX Broker dashboard.</li>
            <li>Contact IDX Broker support if you continue to experience issues.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default IDXTroubleshoot;