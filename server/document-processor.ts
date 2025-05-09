import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { readFile } from "fs/promises";
import { Readable } from "stream";

// Document Processor IDs for different document types
// These are example processor IDs - Google Cloud provides specific processors for each document type
const PROCESSOR_IDS = {
  PAY_STUB: process.env.DOCUMENT_AI_PAYSTUB_PROCESSOR_ID || "3c07700f0a77de4f", // Pay stub processor
  BANK_STATEMENT:
    process.env.DOCUMENT_AI_BANK_STATEMENT_PROCESSOR_ID || "bb07e0a7c534fc88", // Bank statement processor
  TAX_RETURN:
    process.env.DOCUMENT_AI_TAX_RETURN_PROCESSOR_ID || "5fd7da23c6419a2c", // Tax return (Form 1040) processor
  W2_FORM: process.env.DOCUMENT_AI_W2_PROCESSOR_ID || "bf7ac0ec32a0588d", // W-2 form processor
};

// Initialize Document AI client
let documentProcessorClient: DocumentProcessorServiceClient;

/**
 * Initialize Document AI client
 */
export async function initDocumentProcessor() {
  try {
    documentProcessorClient = new DocumentProcessorServiceClient();
    console.log(
      "[document-processor] Document AI processor client initialized",
    );

    // Log available processor IDs for debugging
    console.log("[document-processor] Available processor IDs:");
    Object.entries(PROCESSOR_IDS).forEach(([key, value]) => {
      console.log(
        `[document-processor] - ${key}: ${value || "Not configured"}`,
      );
    });

    return true;
  } catch (error) {
    console.error(
      "[document-processor] Failed to initialize Document AI client:",
      error,
    );
    return false;
  }
}

/**
 * Process a document using Google Document AI
 * @param fileBuffer Buffer containing the document file content
 * @param mimeType MIME type of the document (e.g., 'application/pdf')
 * @param documentType Type of document (paystub, bank_statement, tax_return, w2)
 * @returns Processed document data with extracted fields
 */
export async function processDocument(
  fileBuffer: Buffer,
  mimeType: string,
  documentType: "paystub" | "bank_statement" | "tax_return" | "w2",
) {
  try {
    if (!documentProcessorClient) {
      throw new Error("Document AI client not initialized");
    }

    // Select the appropriate processor ID based on document type
    let processorId: string | undefined;
    switch (documentType) {
      case "paystub":
        processorId = PROCESSOR_IDS.PAY_STUB;
        break;
      case "bank_statement":
        processorId = PROCESSOR_IDS.BANK_STATEMENT;
        break;
      case "tax_return":
        processorId = PROCESSOR_IDS.TAX_RETURN;
        break;
      case "w2":
        processorId = PROCESSOR_IDS.W2_FORM;
        break;
      default:
        throw new Error(`Unsupported document type: ${documentType}`);
    }

    if (!processorId) {
      throw new Error(
        `Processor ID not configured for document type: ${documentType}`,
      );
    }

    // Project ID and location from environment variables or default
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "robin-ai-400423";
    const location = "us"; // Default to US location

    // Format the resource name
    const resourceName = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // Prepare the document for processing
    const document = {
      content: fileBuffer.toString("base64"),
      mimeType: mimeType,
    };

    // Process the document
    const [result] = await documentProcessorClient.processDocument({
      name: resourceName,
      rawDocument: document,
    });

    // Extract and structure key document information
    const extractedData = {
      text: result.document?.text || "",
      entities:
        result.document?.entities?.map((entity) => ({
          type: entity.type || "",
          mentionText: entity.mentionText || "",
          confidence: entity.confidence || 0,
          pageAnchor: entity.pageAnchor
            ? {
                pageRefs:
                  entity.pageAnchor.pageRefs?.map((ref) => ({
                    page: ref.page || 0,
                  })) || [],
              }
            : undefined,
          properties:
            entity.properties?.map((prop) => ({
              type: prop.type || "",
              mentionText: prop.mentionText || "",
            })) || [],
        })) || [],
      pages:
        result.document?.pages?.map((page) => ({
          pageNumber: page.pageNumber || 0,
        })) || [],
    };

    // Process and format the entities into a more usable structure
    const formattedData = formatExtractedData(extractedData, documentType);

    return {
      success: true,
      documentType,
      data: formattedData,
      rawExtraction: extractedData,
    };
  } catch (error) {
    console.error(
      `[document-processor] Error processing ${documentType}:`,
      error,
    );
    return {
      success: false,
      documentType,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Format extracted document data based on document type
 * @param extractedData Raw extracted data from Document AI
 * @param documentType Type of document
 * @returns Formatted data specific to the document type
 */
function formatExtractedData(extractedData: any, documentType: string) {
  const entities = extractedData.entities || [];
  const result: Record<string, any> = {};

  // Format data based on document type
  switch (documentType) {
    case "paystub":
      // Extract key fields from pay stub
      const employerName = findEntityByType(entities, "employer_name");
      const employeeName = findEntityByType(entities, "employee_name");
      const payPeriodStart = findEntityByType(entities, "pay_period_start");
      const payPeriodEnd = findEntityByType(entities, "pay_period_end");
      const payDate = findEntityByType(entities, "pay_date");
      const grossPay = findEntityByType(entities, "gross_pay_amount");
      const netPay = findEntityByType(entities, "net_pay_amount");

      result.employerName = employerName?.mentionText;
      result.employeeName = employeeName?.mentionText;
      result.payPeriodStart = payPeriodStart?.mentionText;
      result.payPeriodEnd = payPeriodEnd?.mentionText;
      result.payDate = payDate?.mentionText;
      result.grossPay = parseFloat(grossPay?.mentionText || "0");
      result.netPay = parseFloat(netPay?.mentionText || "0");
      break;

    case "bank_statement":
      // Extract key fields from bank statement
      const accountHolder = findEntityByType(entities, "account_holder_name");
      const accountNumber = findEntityByType(entities, "account_number");
      const bankName = findEntityByType(entities, "bank_name");
      const statementDate = findEntityByType(entities, "statement_date");
      const endingBalance = findEntityByType(entities, "ending_balance");

      result.accountHolder = accountHolder?.mentionText;
      result.accountNumber = accountNumber?.mentionText;
      result.bankName = bankName?.mentionText;
      result.statementDate = statementDate?.mentionText;
      result.endingBalance = parseFloat(endingBalance?.mentionText || "0");
      break;

    case "tax_return":
      // Extract key fields from tax return
      const taxpayerName = findEntityByType(entities, "taxpayer_name");
      const taxYear = findEntityByType(entities, "tax_year");
      const adjustedGrossIncome = findEntityByType(
        entities,
        "adjusted_gross_income",
      );
      const totalTaxableIncome = findEntityByType(
        entities,
        "total_taxable_income",
      );

      result.taxpayerName = taxpayerName?.mentionText;
      result.taxYear = taxYear?.mentionText;
      result.adjustedGrossIncome = parseFloat(
        adjustedGrossIncome?.mentionText || "0",
      );
      result.totalTaxableIncome = parseFloat(
        totalTaxableIncome?.mentionText || "0",
      );
      break;

    case "w2":
      // Extract key fields from W-2 form
      const w2EmployerName = findEntityByType(entities, "employer_name");
      const w2EmployeeName = findEntityByType(entities, "employee_name");
      const w2Year = findEntityByType(entities, "tax_year");
      const wagesAmount = findEntityByType(entities, "wages_amount");
      const federalIncomeTax = findEntityByType(
        entities,
        "federal_income_tax_withheld",
      );

      result.employerName = w2EmployerName?.mentionText;
      result.employeeName = w2EmployeeName?.mentionText;
      result.taxYear = w2Year?.mentionText;
      result.wagesAmount = parseFloat(wagesAmount?.mentionText || "0");
      result.federalIncomeTax = parseFloat(
        federalIncomeTax?.mentionText || "0",
      );
      break;

    default:
      // For other document types, just return a generic collection of entities
      entities.forEach((entity: any) => {
        if (entity.type && entity.mentionText) {
          result[entity.type] = entity.mentionText;
        }
      });
  }

  return result;
}

/**
 * Find an entity by its type in the entities array
 * @param entities Array of entities
 * @param type Entity type to find
 * @returns The matching entity or undefined
 */
function findEntityByType(entities: any[], type: string) {
  return entities.find((entity) => entity.type === type);
}

/**
 * Process a document file from disk
 * @param filePath Path to the document file
 * @param mimeType MIME type of the document
 * @param documentType Type of document
 * @returns Processed document data
 */
export async function processDocumentFile(
  filePath: string,
  mimeType: string,
  documentType: "paystub" | "bank_statement" | "tax_return" | "w2",
) {
  try {
    const fileBuffer = await readFile(filePath);
    return processDocument(fileBuffer, mimeType, documentType);
  } catch (error) {
    console.error(
      `[document-processor] Error reading file ${filePath}:`,
      error,
    );
    return {
      success: false,
      documentType,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process a document from a readable stream
 * @param stream Readable stream containing the document data
 * @param mimeType MIME type of the document
 * @param documentType Type of document
 * @returns Processed document data
 */
export async function processDocumentStream(
  stream: Readable,
  mimeType: string,
  documentType: "paystub" | "bank_statement" | "tax_return" | "w2",
) {
  return new Promise<any>((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

    stream.on("end", async () => {
      const fileBuffer = Buffer.concat(chunks);
      try {
        const result = await processDocument(
          fileBuffer,
          mimeType,
          documentType,
        );
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
}

const processDocumentBuffer = async (buffer: Buffer) => {
  try {
    // Process in chunks to avoid memory issues
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks

    // Mock processor object with a processDocument function
    const processor = {
        processDocument: async (chunk: Buffer) => {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 50));
            return `Processed chunk of size: ${chunk.length}`;
        }
    };

    const chunks = [];

    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      const result = await processor.processDocument(chunk);
      chunks.push(result);
    }

    return chunks.flat();
  } catch (error) {
    console.error('Document processing error:', error);
    throw error;
  }
};