
// server/idx-key-validator.ts
// This file ensures our application correctly recognizes valid IDX Broker API key formats.

/**
 * Validates the format of an IDX Broker API key.
 *
 * @param apiKey The API key string to validate.
 * @returns True if the API key matches an expected format, false otherwise.
 */
export function isValidIdxApiKey(apiKey: string): boolean {
  // Regex for the traditional IDX Broker API key (starts with 'a', 32+ alphanumeric chars)
  const traditionalAFormatRegex = /^a[a-zA-Z0-9]{31,}$/;

  // Regex for the new IDX Broker API key format you received (starts with '@',
  // followed by alphanumeric characters, potentially including '@', '-', '_')
  // The example key is '@C1r6rrCR9VuUqT2gs@dUd', which has 20 characters after the initial '@'.
  // We'll enforce a minimum length of 20 characters after the '@' for this format.
  const newAtFormatRegex = /^@[a-zA-Z0-9@\-_]{20,}$/; // '@' + minimum 20 characters

  // Check if the API key matches either of the valid formats
  const matchesTraditionalA = traditionalAFormatRegex.test(apiKey);
  const matchesNewAtFormat = newAtFormatRegex.test(apiKey);

  if (matchesTraditionalA || matchesNewAtFormat) {
    return true;
  }

  // If validation fails, log a warning with expected formats
  console.warn(
    `Invalid IDX Broker API key format detected: "${apiKey}". ` +
    `Expected formats: ` +
    `1. Starts with 'a' followed by 31+ alphanumeric characters (e.g., 'a1b2c3d4e5f6g7h8l9j0k1l2m3n4o5p6') ` +
    `2. Starts with '@' followed by 20+ alphanumeric, hyphen, or underscore characters (e.g., '@C1r6rrCR9VuUqT2gs@dUd')`
  );
  return false;
}

// Legacy function for backwards compatibility
export function validateIdxApiKey(apiKey: string): { valid: boolean; issues: string[] } {
  const valid = isValidIdxApiKey(apiKey);
  return {
    valid,
    issues: valid ? [] : ['API key format is invalid']
  };
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
