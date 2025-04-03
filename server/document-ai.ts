import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { log } from './vite';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Document AI client
let documentClient: DocumentProcessorServiceClient;

try {
  // Use credentials from environment variable
  documentClient = new DocumentProcessorServiceClient();
  log('Document AI initialized successfully', 'document-ai');
} catch (error) {
  log(`Error initializing Document AI: ${error}`, 'document-ai');
}

// Define types for OCR results
export interface DocumentAIResult {
  text: string;
  confidence: number;
  pages: number;
  entities?: DocumentEntity[];
  documentType?: string;
}

export interface DocumentEntity {
  type: string;
  text: string;
  confidence: number;
}

/**
 * Process a document using Google Document AI OCR
 * @param fileBuffer - Buffer containing the document file
 * @param mimeType - MIME type of the document (e.g., 'application/pdf', 'image/jpeg')
 * @param processorId - The Document AI processor ID to use
 * @param location - GCP region where the processor is located (default: 'us')
 * @returns Processed document information
 */
export async function processDocument(
  fileBuffer: Buffer,
  mimeType: string,
  processorId: string,
  location: string = 'us'
): Promise<DocumentAIResult> {
  try {
    // Get project ID from environment or configuration
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'robin-ai-400423';
    
    // Format the processor name
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // Configure the process request
    const request = {
      name,
      rawDocument: {
        content: fileBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    // Process the document
    const [result] = await documentClient.processDocument(request);
    const { document } = result;

    if (!document) {
      throw new Error('Document processing resulted in no document');
    }

    // Extract document text
    const documentText = document.text || '';
    
    // Extract entities if available
    const entities = document.entities?.map(entity => ({
      type: entity.type || 'UNKNOWN',
      text: entity.mentionText || '',
      confidence: entity.confidence || 0
    })) || [];

    // Return processed document information
    return {
      text: documentText,
      confidence: document.pages?.[0]?.detectedLanguages?.[0]?.confidence || 0,
      pages: document.pages?.length || 0,
      entities: entities,
      documentType: document.mimeType || mimeType
    };
  } catch (error) {
    log(`Error processing document: ${error}`, 'document-ai');
    throw error;
  }
}

/**
 * Extract real estate specific information from documents
 * @param documentResult - Result from Document AI processing
 * @returns Extracted property information
 */
export function extractPropertyInfo(documentResult: DocumentAIResult): any {
  // Extract property-related information based on entity types
  const propertyInfo: any = {};
  
  if (documentResult.entities && documentResult.entities.length > 0) {
    for (const entity of documentResult.entities) {
      switch (entity.type) {
        case 'ADDRESS':
          propertyInfo.address = entity.text;
          break;
        case 'PRICE':
        case 'MONEY':
          propertyInfo.price = entity.text;
          break;
        case 'SQUARE_FEET':
        case 'AREA':
          propertyInfo.squareFeet = entity.text;
          break;
        case 'DATE':
          if (!propertyInfo.date) propertyInfo.date = entity.text;
          break;
        case 'PERSON':
          if (!propertyInfo.contact) propertyInfo.contact = entity.text;
          break;
        // Add more entity types as needed
      }
    }
  }
  
  return propertyInfo;
}

/**
 * Parse property documents for listing information
 * @param fileBuffer - Document file as buffer
 * @param mimeType - Document MIME type
 * @param processorId - Document AI processor ID
 * @returns Extracted property listing information
 */
export async function parsePropertyDocument(
  fileBuffer: Buffer, 
  mimeType: string,
  processorId: string
): Promise<any> {
  // Process the document
  const result = await processDocument(fileBuffer, mimeType, processorId);
  
  // Extract property information
  const propertyInfo = extractPropertyInfo(result);
  
  // Add the full text for reference
  propertyInfo.fullText = result.text;
  
  return propertyInfo;
}

export default {
  processDocument,
  extractPropertyInfo,
  parsePropertyDocument
};