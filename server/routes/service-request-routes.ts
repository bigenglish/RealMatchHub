import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Get all service requests
router.get('/service-requests', async (req, res) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const expertId = req.query.expertId ? Number(req.query.expertId) : undefined;
    
    if (userId) {
      const requests = await storage.getServiceRequestsByUser(userId);
      return res.json(requests);
    } else if (expertId) {
      const requests = await storage.getServiceRequestsByExpert(expertId);
      return res.json(requests);
    } else {
      const requests = await storage.getServiceRequests();
      return res.json(requests);
    }
  } catch (error) {
    console.error('[express] Error fetching service requests:', error);
    return res.status(500).json({ message: 'Error fetching service requests' });
  }
});

// Get service experts by type and location
router.get('/service-experts/by-location', async (req, res) => {
  try {
    const serviceType = req.query.serviceType as string;
    const zipCode = req.query.zipCode as string;
    
    if (!serviceType || !zipCode) {
      return res.status(400).json({ message: 'Service type and ZIP code are required' });
    }
    
    const experts = await storage.getServiceExpertsByTypeAndLocation(serviceType, zipCode);
    
    // Sort by rating (highest first)
    const sortedExperts = experts.sort((a, b) => {
      return (b.rating || 0) - (a.rating || 0);
    });
    
    return res.json(sortedExperts);
  } catch (error) {
    console.error('[express] Error fetching service experts by location:', error);
    return res.status(500).json({ message: 'Error fetching service experts' });
  }
});

// Get service expert types by user type (buyer/seller)
router.get('/service-experts/types', async (req, res) => {
  try {
    const userType = req.query.userType as string;
    
    if (!userType) {
      return res.status(400).json({ message: 'User type is required (buyer or seller)' });
    }
    
    // Get all service experts
    const experts = await storage.getServiceExperts();
    
    // Extract unique service types based on user type
    const serviceTypes = new Set<string>();
    
    if (userType === 'buyer') {
      // Services typically needed by buyers
      const buyerServices = [
        'Mortgage Lender', 
        'Home Inspector', 
        'Real Estate Attorney', 
        'Insurance Agent',
        'Real Estate Agent'
      ];
      
      experts.forEach(expert => {
        if (buyerServices.includes(expert.serviceType)) {
          serviceTypes.add(expert.serviceType);
        }
      });
    } else if (userType === 'seller') {
      // Services typically needed by sellers
      const sellerServices = [
        'Real Estate Agent', 
        'Property Appraiser', 
        'Home Staging', 
        'Photography',
        'Virtual Tour',
        'Real Estate Attorney'
      ];
      
      experts.forEach(expert => {
        if (sellerServices.includes(expert.serviceType)) {
          serviceTypes.add(expert.serviceType);
        }
      });
    }
    
    return res.json(Array.from(serviceTypes));
  } catch (error) {
    console.error('[express] Error fetching service expert types:', error);
    return res.status(500).json({ message: 'Error fetching service expert types' });
  }
});

// Get a specific service request
router.get('/service-requests/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const request = await storage.getServiceRequest(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    return res.json(request);
  } catch (error) {
    console.error(`[express] Error fetching service request ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error fetching service request' });
  }
});

// Create a new service request
router.post('/service-requests', async (req, res) => {
  try {
    // Basic validation schema
    const schema = z.object({
      serviceType: z.string(),
      propertyZipCode: z.string(),
      preferredDate: z.string(),
      preferredTime: z.string(),
      propertyId: z.number().optional(),
      notes: z.string().optional(),
    });
    
    const validation = schema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: validation.error.format() 
      });
    }
    
    const data = validation.data;
    
    // Find available service experts for this service type and location
    const experts = await storage.getServiceExpertsByTypeAndLocation(
      data.serviceType, 
      data.propertyZipCode
    );
    
    if (experts.length === 0) {
      return res.status(404).json({ 
        message: 'No service providers found for this service type in your area' 
      });
    }
    
    // Assign to the highest-rated expert
    const assignedExpert = experts.sort((a, b) => 
      (b.rating || 0) - (a.rating || 0)
    )[0];
    
    // Create the service request
    const preferredDate = new Date(data.preferredDate);
    
    const serviceRequest = await storage.createServiceRequest({
      serviceType: data.serviceType,
      userId: 1, // In a real app, this would be the authenticated user's ID
      serviceExpertId: assignedExpert.id,
      propertyZipCode: data.propertyZipCode,
      preferredDate,
      preferredTime: data.preferredTime,
      notes: data.notes || null,
      propertyId: data.propertyId || null,
      status: 'pending',
    });
    
    return res.status(201).json(serviceRequest);
  } catch (error) {
    console.error('[express] Error creating service request:', error);
    return res.status(500).json({ 
      message: 'Error creating service request',
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Update a service request status (accept/decline/complete)
router.patch('/service-requests/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Validate status
    if (!['pending', 'accepted', 'declined', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Update the service request
    const updatedRequest = await storage.updateServiceRequest(id, { 
      status,
      notes: notes || undefined
    });
    
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    return res.json(updatedRequest);
  } catch (error) {
    console.error(`[express] Error updating service request status:`, error);
    return res.status(500).json({ message: 'Error updating service request status' });
  }
});

export default router;