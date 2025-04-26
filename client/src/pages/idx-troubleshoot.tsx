import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';

interface IDXStatus {
  apiKey: boolean;
  apiBaseUrl: string;
  apiResponse?: any;
}

interface IDXTestResult {
  success: boolean;
  accountId: string;
  apiKeyValid: boolean;
  message: string;
  results: Array<{
    endpoint: string;
    status?: number;
    statusText?: string;
    error?: string;
    dataType?: string;
    hasData?: boolean;
    isWidget?: boolean;
    widgetWorks?: boolean;
  }>;
}

const IDXTroubleshoot: React.FC = () => {
  const [accountId, setAccountId] = useState<string>('58882');
  const [widgetId, setWidgetId] = useState<string>('widget_1');
  const [status, setStatus] = useState<IDXStatus | null>(null);
  const [testResults, setTestResults] = useState<IDXTestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [widgetScript, setWidgetScript] = useState<HTMLScriptElement | null>(null);
  const [widgetTestResult, setWidgetTestResult] = useState<string>('');

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

  const runComprehensiveTest = async () => {
    setTestLoading(true);
    setError(null);
    setTestResults(null);
    
    try {
      const url = `/api/idx/test${accountId ? `?accountId=${accountId}` : ''}`;
      const response = await apiRequest('GET', url);
      const data = await response.json();
      setTestResults(data);
    } catch (err) {
      console.error('Error running IDX tests:', err);
      setError('Error testing IDX Broker connection. See console for details.');
    } finally {
      setTestLoading(false);
    }
  };

  const testWidgetScript = () => {
    setLoading(true);
    setError(null);
    setWidgetTestResult('');
    
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
            setWidgetTestResult(prev => prev + `\n✅ SUCCESS: ${pattern} script loaded successfully.`);
            resolve(true);
          };
          
          script.onerror = () => {
            setWidgetTestResult(prev => prev + `\n❌ FAILED: ${pattern} script failed to load.`);
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
            <CardTitle>Comprehensive Test Suite</CardTitle>
            <CardDescription>Test all possible IDX Broker endpoints and widgets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountIdTest">IDX Broker Account ID</Label>
                <Input 
                  id="accountIdTest"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Enter your IDX Broker account ID"
                  className="mb-2"
                />
                <p className="text-sm text-gray-500">
                  Default is 58882 as specified. Try other account IDs if this doesn't work.
                </p>
              </div>
              
              <Button 
                onClick={runComprehensiveTest}
                disabled={testLoading}
                className="w-full"
                variant="default"
              >
                {testLoading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span> Running tests...
                  </>
                ) : (
                  'Run Comprehensive Test'
                )}
              </Button>
              
              {testResults && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center space-x-2">
                    {testResults.success ? (
                      <CheckCircle className="text-green-500 h-5 w-5" />
                    ) : (
                      <XCircle className="text-red-500 h-5 w-5" />
                    )}
                    <p className={testResults.success ? 'text-green-700' : 'text-red-700'}>
                      {testResults.message}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Test Results</h3>
                    <div className="space-y-3">
                      {testResults.results.map((result, index) => (
                        <div key={index} className="border rounded p-3 text-sm">
                          <div className="flex justify-between items-start">
                            <code className="text-xs break-all">{result.endpoint}</code>
                            <Badge variant={
                              result.hasData ? "success" : 
                              (result.status === 200 || result.status === 204) ? "outline" : "destructive"
                            }>
                              {result.status || 'Error'}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            {result.status ? (
                              <p>Status: {result.status} {result.statusText}</p>
                            ) : (
                              <p className="text-red-600">{result.error}</p>
                            )}
                            {result.hasData === false && result.status === 204 && (
                              <p className="text-amber-600 mt-1">No content returned (204 response)</p>
                            )}
                            {result.isWidget && (
                              <p className={result.widgetWorks ? 'text-green-600' : 'text-red-600'}>
                                Widget script: {result.widgetWorks ? 'Available' : 'Not available'}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
                    <h3 className="font-medium text-amber-800 mb-2">Diagnosis</h3>
                    <p className="text-amber-700">
                      {testResults.success 
                        ? 'Successfully connected to at least one IDX endpoint. Try implementing the working approach in your application.'
                        : 'All endpoints returned errors or no data. This suggests one of the following issues:'}
                    </p>
                    {!testResults.success && (
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-amber-700">
                        <li>The account ID {testResults.accountId} may not be correct</li>
                        <li>Your IDX Broker account doesn't have any active listings</li>
                        <li>Your IDX Broker account may need additional configuration</li>
                        <li>Your API key may not have the correct permissions</li>
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Widget Script Test</CardTitle>
          <CardDescription>Test loading the IDX widget script directly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountIdWidget">IDX Broker Account ID</Label>
                <Input 
                  id="accountIdWidget"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Enter your IDX Broker account ID"
                />
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
            </div>
            
            <Button 
              onClick={testWidgetScript}
              disabled={!accountId || loading}
              className="w-full"
            >
              Test Widget Script
            </Button>
            
            {widgetTestResult && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Widget Script Test Results:</p>
                <pre className="p-3 bg-gray-100 rounded text-xs whitespace-pre-wrap">
                  {widgetTestResult || 'No results yet.'}
                </pre>
              </div>
            )}
          </div>
          
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
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Based on Testing Results</h3>
              <p className="mb-3">Our comprehensive testing shows:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>API Key Status:</strong> Valid and properly configured</li>
                <li><strong>Account ID 58882:</strong> Responds with 204 No Content or 400 Bad Request errors</li>
                <li><strong>Widget Script:</strong> Not found (404) for the tested account ID</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Recommended Actions</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Double-check your IDX Broker account ID (current value: {accountId})</li>
                <li>Verify your IDX Broker account has active listings</li>
                <li>Check if you need to enable the "API Access" feature in your IDX Broker account</li>
                <li>Try using a different widget ID (the default is usually "widget_1")</li>
                <li>Consider contacting IDX Broker support to verify your account configuration</li>
                <li>Look for alternative integration methods if the API doesn't return listings</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">About 204 No Content Responses</h3>
              <p className="text-blue-700">
                A 204 No Content response means your API call is valid, but there is no data to return.
                This might happen if your IDX Broker account doesn't have any featured listings or
                if the account ID is incorrect. Try different endpoints or account IDs to troubleshoot.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IDXTroubleshoot;