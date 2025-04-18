import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertServiceRequestSchema, expertTypes } from '@shared/schema';

// Initialize router
const router = Router();

// Create a new service request
router.post('/api/service-requests', async (req, res) => {
  try {
    // Validate request body against schema
    const serviceRequestSchema = insertServiceRequestSchema.extend({
      propertyId: z.number().optional(),
    });
    
    const validatedData = serviceRequestSchema.parse(req.body);
    
    // In a real application, we'd get the user ID from the session
    // For now, we'll use a test user ID
    const userId = 1; // req.user?.id || 1
    
    // Find potential service providers based on service type and location
    const potentialProviders = await storage.getServiceExpertsByTypeAndLocation(
      validatedData.serviceType,
      validatedData.propertyZipCode
    );
    
    if (!potentialProviders || potentialProviders.length === 0) {
      return res.status(404).json({
        message: `No service providers found for ${validatedData.serviceType} in ${validatedData.propertyZipCode}.`
      });
    }
    
    // Filter providers by availability (basic implementation)
    // TODO: Implement more sophisticated availability filtering
    const availableProviders = potentialProviders;
    
    if (!availableProviders || availableProviders.length === 0) {
      return res.status(404).json({
        message: `No service providers available for ${validatedData.serviceType} on your preferred date and time.`
      });
    }
    
    // Sort providers (e.g., by rating, distance)
    // TODO: Implement provider sorting algorithm
    const sortedProviders = availableProviders.sort((a, b) => {
      return (b.rating || 0) - (a.rating || 0);
    });
    
    // Select the best matching provider
    const bestProvider = sortedProviders[0];
    
    // Create the service request
    const serviceRequest = await storage.createServiceRequest({
      ...validatedData,
      userId,
      serviceExpertId: bestProvider.id,
      status: 'pending',
    });
    
    // TODO: In a production environment, implement the notification logic here
    // For now, we'll just log the notifications
    console.log(`Service request created with ID: ${serviceRequest.id}`);
    console.log(`Notifying provider ${bestProvider.contactName} via email: ${bestProvider.contactEmail}`);
    console.log(`Notifying provider ${bestProvider.contactName} via phone: ${bestProvider.contactPhone}`);
    
    // Update notification flags
    await storage.updateServiceRequest(serviceRequest.id, {
      providerNotified: true,
      userNotified: true
    });
    
    return res.status(200).json({
      id: serviceRequest.id,
      message: "Service request initiated successfully. You'll be notified when the provider responds.",
      providerName: bestProvider.name
    });
  } catch (error) {
    console.error('Error creating service request:', error);
    return res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to create service request'
    });
  }
});

// Get all service requests (admin route)
router.get('/api/service-requests', async (req, res) => {
  try {
    const requests = await storage.getServiceRequests();
    
    // Enrich the service requests with user and provider details
    const enrichedRequests = await Promise.all(requests.map(async (request) => {
      const provider = await storage.getServiceExpert(request.serviceExpertId);
      
      // In a real app, we'd get actual user info
      // For now, we'll use placeholder user info
      const user = { 
        id: request.userId,
        name: `User ${request.userId}`,
        email: `user${request.userId}@example.com`,
        phone: '555-123-4567'
      };
      
      return {
        ...request,
        providerName: provider?.name || 'Unknown Provider',
        providerContact: provider?.contactEmail || 'No contact info',
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone
      };
    }));
    
    return res.status(200).json(enrichedRequests);
  } catch (error) {
    console.error('Error fetching service requests:', error);
    return res.status(500).json({
      message: 'Failed to fetch service requests'
    });
  }
});

// Get service requests for a specific user
router.get('/api/service-requests/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const requests = await storage.getServiceRequestsByUser(userId);
    
    // Enrich with provider details
    const enrichedRequests = await Promise.all(requests.map(async (request) => {
      const provider = await storage.getServiceExpert(request.serviceExpertId);
      
      return {
        ...request,
        providerName: provider?.name || 'Unknown Provider',
        providerContact: provider?.contactEmail || 'No contact info'
      };
    }));
    
    return res.status(200).json(enrichedRequests);
  } catch (error) {
    console.error('Error fetching user service requests:', error);
    return res.status(500).json({
      message: 'Failed to fetch service requests for this user'
    });
  }
});

// Get service requests for a specific provider
router.get('/api/service-requests/provider/:providerId', async (req, res) => {
  try {
    const providerId = parseInt(req.params.providerId);
    
    if (isNaN(providerId)) {
      return res.status(400).json({ message: 'Invalid provider ID' });
    }
    
    const requests = await storage.getServiceRequestsByExpert(providerId);
    
    // Enrich with user details
    const enrichedRequests = await Promise.all(requests.map(async (request) => {
      // In a real app, we'd get actual user info
      const user = { 
        id: request.userId,
        name: `User ${request.userId}`,
        email: `user${request.userId}@example.com`,
        phone: '555-123-4567'
      };
      
      return {
        ...request,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone
      };
    }));
    
    return res.status(200).json(enrichedRequests);
  } catch (error) {
    console.error('Error fetching provider service requests:', error);
    return res.status(500).json({
      message: 'Failed to fetch service requests for this provider'
    });
  }
});

// Get a single service request by ID
router.get('/api/service-requests/:id', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    
    if (isNaN(requestId)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }
    
    const request = await storage.getServiceRequest(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    // Enrich with provider and user details
    const provider = await storage.getServiceExpert(request.serviceExpertId);
    
    // In a real app, we'd get actual user info
    const user = { 
      id: request.userId,
      name: `User ${request.userId}`,
      email: `user${request.userId}@example.com`,
      phone: '555-123-4567'
    };
    
    const enrichedRequest = {
      ...request,
      providerName: provider?.name || 'Unknown Provider',
      providerContact: provider?.contactEmail || 'No contact info',
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone
    };
    
    return res.status(200).json(enrichedRequest);
  } catch (error) {
    console.error('Error fetching service request:', error);
    return res.status(500).json({
      message: 'Failed to fetch service request details'
    });
  }
});

// Provider responding to a service request
router.post('/api/service-requests/:id/response', async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const { providerId, accepted, responseNote } = req.body;
    
    if (isNaN(requestId) || !providerId) {
      return res.status(400).json({ message: 'Invalid request or provider ID' });
    }
    
    const request = await storage.getServiceRequest(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    
    // Verify that this request is assigned to this provider
    if (request.serviceExpertId !== providerId) {
      return res.status(403).json({ 
        message: 'This service request is not assigned to the specified provider' 
      });
    }
    
    // Update the request status
    const newStatus = accepted ? 'accepted' : 'declined';
    const updatedRequest = await storage.updateServiceRequestStatus(requestId, newStatus);
    
    if (!updatedRequest) {
      return res.status(500).json({ message: 'Failed to update service request status' });
    }
    
    // TODO: In a production environment, implement the notification logic here
    console.log(`Service request ${requestId} was ${newStatus} by provider ${providerId}`);
    console.log(`Response note: ${responseNote || 'No note provided'}`);
    console.log(`Notifying user ${request.userId} about the ${newStatus} request`);
    
    return res.status(200).json({
      message: `Service request successfully ${newStatus}`,
      requestId,
      status: newStatus
    });
  } catch (error) {
    console.error('Error updating service request:', error);
    return res.status(500).json({
      message: 'Failed to process service request response'
    });
  }
});

// Get service expert types based on user type (buyer or seller)
router.get('/api/service-experts/types', (req, res) => {
  try {
    const userType = req.query.userType as string;
    
    let filteredTypes: string[] = [];
    
    if (userType === 'buyer') {
      filteredTypes = [
        'Mortgage Lender',
        'Home Inspector',
        'Real Estate Attorney',
        'Insurance Agent',
        'Real Estate Agent',
        'Appraiser'
      ];
    } else if (userType === 'seller') {
      filteredTypes = [
        'Real Estate Agent',
        'Property Manager',
        'Appraiser',
        'Real Estate Attorney',
        'Home Renovation Contractor',
        'Interior Designer',
        'Photography Services'
      ];
    } else {
      // Return all expert types if user type not specified
      filteredTypes = expertTypes as unknown as string[];
    }
    
    return res.status(200).json(filteredTypes);
  } catch (error) {
    console.error('Error fetching service expert types:', error);
    return res.status(500).json({
      message: 'Failed to fetch service expert types'
    });
  }
});

export default router;