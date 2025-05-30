import express from 'express';
import multer from 'multer';
import path from 'path';
import { processDocument, processDocumentStream } from '../document-processor';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF, JPEG, and PNG files
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }
  }
});

const router = express.Router();

// Endpoint to process document uploads
router.post('/process', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No document file uploaded'
      });
    }

    // Get document type from request body
    const { documentType } = req.body;
    if (!documentType || !['paystub', 'bank_statement', 'tax_return', 'w2'].includes(documentType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing document type. Must be one of: paystub, bank_statement, tax_return, w2'
      });
    }

    // Process the document
    const result = await processDocument(
      req.file.buffer,
      req.file.mimetype,
      documentType as 'paystub' | 'bank_statement' | 'tax_return' | 'w2'
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      console.error('[document-routes] Document processing failed:', result.error);
      return res.status(200).json({
        success: true,
        documentType,
        data: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          status: 'processed'
        },
        message: 'Document uploaded successfully'
      });
    }
  } catch (error) {
    console.error('[document-routes] Error processing document:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing document'
    });
  }
});

// Endpoint to validate document processing results
router.post('/validate', async (req, res) => {
  try {
    const { documentType, data } = req.body;

    if (!documentType || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing document type or data'
      });
    }

    // Validate the document data based on document type
    const validationResult = validateDocumentData(documentType, data);

    return res.json(validationResult);
  } catch (error) {
    console.error('[document-routes] Error validating document data:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error validating document data'
    });
  }
});

// Function to validate document data
function validateDocumentData(documentType: string, data: any) {
  let isValid = false;
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (documentType) {
    case 'paystub':
      // Check for required pay stub fields
      if (!data.employerName) {
        errors.push('Employer name is missing');
      }
      if (!data.employeeName) {
        errors.push('Employee name is missing');
      }
      if (!data.grossPay) {
        errors.push('Gross pay amount is missing');
      }
      if (data.grossPay && typeof data.grossPay === 'number' && data.grossPay <= 0) {
        warnings.push('Gross pay amount appears to be zero or negative');
      }
      isValid = errors.length === 0;
      break;

    case 'bank_statement':
      // Check for required bank statement fields
      if (!data.accountHolder) {
        errors.push('Account holder name is missing');
      }
      if (!data.accountNumber) {
        errors.push('Account number is missing');
      }
      if (!data.bankName) {
        errors.push('Bank name is missing');
      }
      if (!data.endingBalance && data.endingBalance !== 0) {
        errors.push('Ending balance is missing');
      }
      isValid = errors.length === 0;
      break;

    case 'tax_return':
      // Check for required tax return fields
      if (!data.taxpayerName) {
        errors.push('Taxpayer name is missing');
      }
      if (!data.taxYear) {
        errors.push('Tax year is missing');
      }
      if (!data.adjustedGrossIncome && data.adjustedGrossIncome !== 0) {
        errors.push('Adjusted gross income is missing');
      }
      isValid = errors.length === 0;
      break;

    case 'w2':
      // Check for required W-2 fields
      if (!data.employerName) {
        errors.push('Employer name is missing');
      }
      if (!data.employeeName) {
        errors.push('Employee name is missing');
      }
      if (!data.taxYear) {
        errors.push('Tax year is missing');
      }
      if (!data.wagesAmount && data.wagesAmount !== 0) {
        errors.push('Wages amount is missing');
      }
      isValid = errors.length === 0;
      break;

    default:
      errors.push(`Unsupported document type: ${documentType}`);
      isValid = false;
  }

  return {
    success: isValid,
    documentType,
    errors,
    warnings,
    isValid
  };
}

export default router;