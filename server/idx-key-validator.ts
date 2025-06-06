
export function validateIdxApiKey(apiKey: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!apiKey) {
    issues.push("API key is missing");
    return { valid: false, issues };
  }
  
  if (apiKey.length !== 22) {
    issues.push(`API key length is ${apiKey.length}, expected 22 characters`);
  }
  
  if (!apiKey.startsWith('@') && !apiKey.startsWith('a')) {
    issues.push(`API key should start with '@' or 'a', got '${apiKey.charAt(0)}'`);
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(apiKey)) {
    issues.push("API key contains invalid characters (should be alphanumeric only)");
  }
  
  // Common invalid patterns
  if (apiKey.includes('...') || apiKey === 'your_api_key_here') {
    issues.push("API key appears to be a placeholder value");
  }
  
  return { valid: issues.length === 0, issues };
}

export function getApiKeyDiagnostics(): { 
  keyPresent: boolean;
  keyValue: string;
  validation: { valid: boolean; issues: string[] };
  recommendation: string;
} {
  const apiKey = process.env.IDX_BROKER_API_KEY || '';
  const validation = validateIdxApiKey(apiKey);
  
  let recommendation = '';
  if (!apiKey) {
    recommendation = "Set IDX_BROKER_API_KEY environment variable with your valid API key";
  } else if (!validation.valid) {
    recommendation = "Check your IDX Broker account settings and regenerate your API key";
  } else {
    recommendation = "API key format is valid, check account permissions and subscription status";
  }
  
  return {
    keyPresent: !!apiKey,
    keyValue: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(-4)}` : 'NOT_SET',
    validation,
    recommendation
  };
}
