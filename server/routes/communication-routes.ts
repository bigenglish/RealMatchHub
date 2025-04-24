import { Router } from "express";
import { communicationService } from "../communication-service";
import { 
  insertCommunicationLogSchema,
  insertPropertyShowingSchema,
  insertPropertyOfferSchema,
  insertPropertyDocumentSchema,
  insertTransactionProgressSchema,
  insertValuationTimeSlotSchema
} from "@shared/schema";
import { z } from "zod";

const router = Router();

// === Communication Logs (Messages) ===

// Get all communication logs for a property
router.get('/communication/:propertyId/:userId', async (req, res) => {
  try {
    const { propertyId, userId } = req.params;
    
    if (!propertyId || !userId) {
      return res.status(400).json({ message: 'Property ID and User ID are required' });
    }
    
    const logs = await communicationService.getCommunicationLogs(propertyId, userId);
    res.json(logs);
  } catch (error) {
    console.error('[communication-routes] Error fetching communication logs:', error);
    res.status(500).json({ 
      message: 'Failed to fetch communication logs',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Add a new message
router.post('/communication/:propertyId/:userId', async (req, res) => {
  try {
    const { propertyId, userId } = req.params;
    
    // Validate the request body
    const validatedData = insertCommunicationLogSchema.parse({
      ...req.body,
      propertyId,
      userId
    });
    
    const newLog = await communicationService.addCommunicationLog(validatedData);
    res.status(201).json(newLog);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid message data',
        errors: error.errors
      });
    }
    
    console.error('[communication-routes] Error adding communication log:', error);
    res.status(500).json({ 
      message: 'Failed to add communication log',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Mark messages as read
router.put('/communication/:propertyId/:userId/read/:senderId', async (req, res) => {
  try {
    const { propertyId, userId, senderId } = req.params;
    
    await communicationService.markCommunicationLogsAsRead(propertyId, userId, senderId);
    res.json({ success: true });
  } catch (error) {
    console.error('[communication-routes] Error marking messages as read:', error);
    res.status(500).json({ 
      message: 'Failed to mark messages as read',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// === Property Showings ===

// Get all showings for a property
router.get('/showings/:propertyId/:userId', async (req, res) => {
  try {
    const { propertyId, userId } = req.params;
    
    if (!propertyId || !userId) {
      return res.status(400).json({ message: 'Property ID and User ID are required' });
    }
    
    const showings = await communicationService.getPropertyShowings(propertyId, userId);
    res.json(showings);
  } catch (error) {
    console.error('[communication-routes] Error fetching property showings:', error);
    res.status(500).json({ 
      message: 'Failed to fetch property showings',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create a new showing
router.post('/showings/:propertyId/:userId', async (req, res) => {
  try {
    const { propertyId, userId } = req.params;
    
    // Validate the request body
    const { showingId, ...validatedData } = insertPropertyShowingSchema.parse({
      ...req.body,
      propertyId,
      userId
    });
    
    const newShowing = await communicationService.createPropertyShowing(validatedData);
    res.status(201).json(newShowing);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid showing data',
        errors: error.errors
      });
    }
    
    console.error('[communication-routes] Error creating property showing:', error);
    res.status(500).json({ 
      message: 'Failed to create property showing',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update showing status
router.put('/showings/:showingId/status', async (req, res) => {
  try {
    const { showingId } = req.params;
    const { status, feedback } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const updatedShowing = await communicationService.updatePropertyShowingStatus(
      showingId,
      status,
      feedback
    );
    
    res.json(updatedShowing);
  } catch (error) {
    console.error('[communication-routes] Error updating showing status:', error);
    res.status(500).json({ 
      message: 'Failed to update showing status',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// === Property Offers ===

// Get all offers for a property
router.get('/offers/:propertyId/:userId', async (req, res) => {
  try {
    const { propertyId, userId } = req.params;
    
    if (!propertyId || !userId) {
      return res.status(400).json({ message: 'Property ID and User ID are required' });
    }
    
    const offers = await communicationService.getPropertyOffers(propertyId, userId);
    res.json(offers);
  } catch (error) {
    console.error('[communication-routes] Error fetching property offers:', error);
    res.status(500).json({ 
      message: 'Failed to fetch property offers',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create a new offer
router.post('/offers/:propertyId/:userId', async (req, res) => {
  try {
    const { propertyId, userId } = req.params;
    
    // Validate the request body
    const { offerId, ...validatedData } = insertPropertyOfferSchema.parse({
      ...req.body,
      propertyId,
      userId
    });
    
    const newOffer = await communicationService.createPropertyOffer(validatedData);
    res.status(201).json(newOffer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid offer data',
        errors: error.errors
      });
    }
    
    console.error('[communication-routes] Error creating property offer:', error);
    res.status(500).json({ 
      message: 'Failed to create property offer',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update offer status
router.put('/offers/:offerId/status', async (req, res) => {
  try {
    const { offerId } = req.params;
    const { status, expertReviewSummary } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const updatedOffer = await communicationService.updatePropertyOfferStatus(
      offerId,
      status,
      expertReviewSummary
    );
    
    res.json(updatedOffer);
  } catch (error) {
    console.error('[communication-routes] Error updating offer status:', error);
    res.status(500).json({ 
      message: 'Failed to update offer status',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// === Property Documents ===

// Get all documents for a property
router.get('/documents/:propertyId/:userId', async (req, res) => {
  try {
    const { propertyId, userId } = req.params;
    
    if (!propertyId || !userId) {
      return res.status(400).json({ message: 'Property ID and User ID are required' });
    }
    
    const documents = await communicationService.getPropertyDocuments(propertyId, userId);
    res.json(documents);
  } catch (error) {
    console.error('[communication-routes] Error fetching property documents:', error);
    res.status(500).json({ 
      message: 'Failed to fetch property documents',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Add a new document
router.post('/documents/:propertyId/:userId', async (req, res) => {
  try {
    const { propertyId, userId } = req.params;
    
    // Validate the request body
    const { documentId, ...validatedData } = insertPropertyDocumentSchema.parse({
      ...req.body,
      propertyId,
      userId
    });
    
    const newDocument = await communicationService.addPropertyDocument(validatedData);
    res.status(201).json(newDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid document data',
        errors: error.errors
      });
    }
    
    console.error('[communication-routes] Error adding property document:', error);
    res.status(500).json({ 
      message: 'Failed to add property document',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Archive a document
router.put('/documents/:documentId/archive', async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const archivedDocument = await communicationService.archivePropertyDocument(documentId);
    res.json(archivedDocument);
  } catch (error) {
    console.error('[communication-routes] Error archiving document:', error);
    res.status(500).json({ 
      message: 'Failed to archive document',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// === Transaction Progress ===

// Get transaction progress for a property
router.get('/progress/:propertyId/:userId', async (req, res) => {
  try {
    const { propertyId, userId } = req.params;
    
    if (!propertyId || !userId) {
      return res.status(400).json({ message: 'Property ID and User ID are required' });
    }
    
    const progress = await communicationService.getTransactionProgress(propertyId, userId);
    
    if (!progress) {
      return res.status(404).json({ message: 'Transaction progress not found' });
    }
    
    res.json(progress);
  } catch (error) {
    console.error('[communication-routes] Error fetching transaction progress:', error);
    res.status(500).json({ 
      message: 'Failed to fetch transaction progress',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create or update transaction progress
router.post('/progress/:propertyId/:userId', async (req, res) => {
  try {
    const { propertyId, userId } = req.params;
    
    // Validate the request body
    const validatedData = insertTransactionProgressSchema.parse({
      ...req.body,
      propertyId,
      userId
    });
    
    const progress = await communicationService.createOrUpdateTransactionProgress(validatedData);
    res.status(201).json(progress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid progress data',
        errors: error.errors
      });
    }
    
    console.error('[communication-routes] Error creating/updating transaction progress:', error);
    res.status(500).json({ 
      message: 'Failed to create/update transaction progress',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// === Valuation Time Slots ===

// Get available valuation time slots for a property
router.get('/valuation/time/:propertyId/:userId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }
    
    const slots = await communicationService.getValuationTimeSlots(propertyId);
    res.json(slots);
  } catch (error) {
    console.error('[communication-routes] Error fetching valuation time slots:', error);
    res.status(500).json({ 
      message: 'Failed to fetch valuation time slots',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create a new valuation time slot
router.post('/valuation/time/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Validate the request body
    const validatedData = insertValuationTimeSlotSchema.parse({
      ...req.body,
      propertyId
    });
    
    const newSlot = await communicationService.createValuationTimeSlot(validatedData);
    res.status(201).json(newSlot);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid valuation time slot data',
        errors: error.errors
      });
    }
    
    console.error('[communication-routes] Error creating valuation time slot:', error);
    res.status(500).json({ 
      message: 'Failed to create valuation time slot',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Book a valuation time slot
router.put('/valuation/time/:slotId/book', async (req, res) => {
  try {
    const { slotId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to book a slot' });
    }
    
    const bookedSlot = await communicationService.bookValuationTimeSlot(parseInt(slotId), userId);
    res.json(bookedSlot);
  } catch (error) {
    console.error('[communication-routes] Error booking valuation time slot:', error);
    res.status(500).json({ 
      message: 'Failed to book valuation time slot',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export const communicationRoutes = router;