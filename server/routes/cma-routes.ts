import express from 'express';
import { z } from 'zod';
import { 
  generateCmaReport, 
  getCmaReportById, 
  getCmaComparables, 
  getCmaMarketInsights,
  getUserCmaReports,
  getCompleteCmaReport
} from '../services/cma-service';

const router = express.Router();

// Validation schema for CMA request
const cmaRequestSchema = z.object({
  propertyId: z.number().optional(),
  zipCode: z.string().min(5),
  propertyType: z.string().min(1),
  bedrooms: z.number().min(1),
  bathrooms: z.number().min(1),
  sqft: z.number().min(100),
  yearBuilt: z.number().optional(),
  lotSize: z.number().optional(),
  pricingTier: z.enum(['basic', 'premium', 'enterprise']).default('basic'),
  maxComparables: z.number().min(3).max(10).optional()
});

// Create a new CMA report
router.post('/generate', async (req, res) => {
  try {
    // For authenticated users, use their user ID
    // For demo/testing purposes, use a default ID
    const userId = req.user?.id || 1;

    // Validate request data
    const validatedData = cmaRequestSchema.parse(req.body);
    
    // Generate CMA report
    const report = await generateCmaReport({
      userId,
      propertyId: validatedData.propertyId,
      propertyData: {
        zipCode: validatedData.zipCode,
        propertyType: validatedData.propertyType,
        bedrooms: validatedData.bedrooms,
        bathrooms: validatedData.bathrooms,
        sqft: validatedData.sqft,
        yearBuilt: validatedData.yearBuilt,
        lotSize: validatedData.lotSize
      },
      pricingTier: validatedData.pricingTier,
      maxComparables: validatedData.maxComparables
    });
    
    res.status(201).json(report);
  } catch (error) {
    console.error('Error generating CMA report:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      message: 'Failed to generate CMA report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get a CMA report by ID
router.get('/reports/:id', async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    if (isNaN(reportId)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }
    
    const report = await getCmaReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'CMA report not found' });
    }
    
    // Check if user is authorized
    // For demo/testing, skip this check
    // if (req.user?.id !== report.userId) {
    //   return res.status(403).json({ message: 'Not authorized to access this report' });
    // }
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching CMA report:', error);
    res.status(500).json({
      message: 'Failed to fetch CMA report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get comparables for a CMA report
router.get('/reports/:id/comparables', async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    if (isNaN(reportId)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }
    
    const report = await getCmaReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'CMA report not found' });
    }
    
    // Check if user is authorized
    // For demo/testing, skip this check
    
    const comparables = await getCmaComparables(reportId);
    res.json(comparables);
  } catch (error) {
    console.error('Error fetching CMA comparables:', error);
    res.status(500).json({
      message: 'Failed to fetch comparables',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get market insights for a CMA report
router.get('/reports/:id/insights', async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    if (isNaN(reportId)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }
    
    const report = await getCmaReportById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'CMA report not found' });
    }
    
    // Check if user is authorized
    // For demo/testing, skip this check
    
    const insights = await getCmaMarketInsights(reportId);
    res.json(insights);
  } catch (error) {
    console.error('Error fetching CMA insights:', error);
    res.status(500).json({
      message: 'Failed to fetch market insights',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get complete CMA report data (report, comparables, and insights)
router.get('/reports/:id/complete', async (req, res) => {
  try {
    const reportId = parseInt(req.params.id);
    if (isNaN(reportId)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }
    
    const completeReport = await getCompleteCmaReport(reportId);
    if (!completeReport) {
      return res.status(404).json({ message: 'CMA report not found' });
    }
    
    // Check if user is authorized
    // For demo/testing, skip this check
    
    res.json(completeReport);
  } catch (error) {
    console.error('Error fetching complete CMA report:', error);
    res.status(500).json({
      message: 'Failed to fetch complete CMA report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all CMA reports for a user
router.get('/user/reports', async (req, res) => {
  try {
    // For authenticated users, use their user ID
    // For demo/testing purposes, use a default ID
    const userId = req.user?.id || 1;
    
    const reports = await getUserCmaReports(userId);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching user CMA reports:', error);
    res.status(500).json({
      message: 'Failed to fetch user reports',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;