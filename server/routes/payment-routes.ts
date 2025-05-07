import express from 'express';
import { createPaymentIntent } from '../stripe-service';

const router = express.Router();

// Service bundles data
const serviceBundles = [
  // Buyer bundles
  {
    id: 1,
    title: "Basic Buyer",
    description: "Essential services for property search and purchase",
    price: 0,
    priceDisplay: "Free",
    type: "buyer",
    features: [
      "Property Search",
      "Basic AI Recommendations",
      "Seller Communication Tools",
      "Community Profile Access"
    ],
    recommendedFor: "First-time buyers exploring options"
  },
  {
    id: 2,
    title: "Premium Buyer",
    description: "Complete support for serious property buyers",
    price: 99.99,
    priceDisplay: "$99.99",
    type: "buyer",
    features: [
      "Everything in Basic Buyer",
      "Advanced AI Property Matching",
      "Market Analysis Reports",
      "Priority Expert Consultations",
      "Document Review Tools"
    ],
    highlighted: true,
    recommendedFor: "Active buyers ready to purchase"
  },
  {
    id: 3,
    title: "Elite Buyer",
    description: "Premium support with concierge services",
    price: 199.99,
    priceDisplay: "$199.99",
    type: "buyer",
    features: [
      "Everything in Premium Buyer",
      "Dedicated Real Estate Expert",
      "Unlimited Document Analysis",
      "VIP Property Tours",
      "Fast-track Mortgage Pre-approval",
      "Exclusive Listings Access"
    ],
    recommendedFor: "Luxury buyers needing white-glove service"
  },
  
  // Seller bundles
  {
    id: 4,
    title: "Basic Seller",
    description: "Essential tools to list and market your property",
    price: 0,
    priceDisplay: "Free",
    type: "seller",
    features: [
      "Property Listing Tools",
      "Basic Marketing Kit",
      "Buyer Communication Platform",
      "Simple CMA Reports"
    ]
  },
  {
    id: 5,
    title: "Premium Seller",
    description: "Enhanced visibility and expert support",
    price: 149.99,
    priceDisplay: "$149.99",
    type: "seller",
    features: [
      "Everything in Basic Seller",
      "Professional Photography",
      "Advanced Pricing Strategy",
      "Enhanced Listing Visibility",
      "Document Preparation Support",
      "Offer Management Tools"
    ],
    highlighted: true,
    recommendedFor: "Sellers wanting maximum exposure"
  },
  {
    id: 6,
    title: "Elite Seller",
    description: "Full-service selling experience",
    price: 299.99,
    priceDisplay: "$299.99",
    type: "seller",
    features: [
      "Everything in Premium Seller",
      "Dedicated Listing Agent",
      "Virtual Staging & 3D Tours",
      "Premium Marketing Campaign",
      "Social Media Promotion",
      "Negotiation & Closing Support"
    ],
    recommendedFor: "High-value properties requiring specialized marketing"
  },
  
  // Agent bundles
  {
    id: 7,
    title: "Agent Starter",
    description: "Essential tools for new real estate agents",
    price: 49.99,
    priceDisplay: "$49.99/mo",
    type: "agent",
    features: [
      "Client Management Dashboard",
      "Basic Listing Tools",
      "AI-Assisted Research",
      "Transaction Tracking",
      "Document Templates"
    ]
  },
  {
    id: 8,
    title: "Agent Professional",
    description: "Complete toolset for active agents",
    price: 99.99,
    priceDisplay: "$99.99/mo",
    type: "agent",
    features: [
      "Everything in Agent Starter",
      "Advanced Client Targeting",
      "Market Analysis Tools",
      "Lead Generation Features",
      "Document Automation",
      "Team Collaboration Tools"
    ],
    highlighted: true,
    recommendedFor: "Full-time agents handling multiple clients"
  },
  {
    id: 9,
    title: "Agent Enterprise",
    description: "Premium solutions for top-performing agents",
    price: 199.99,
    priceDisplay: "$199.99/mo",
    type: "agent",
    features: [
      "Everything in Agent Professional",
      "Unlimited Client Management",
      "AI-Powered Insights & Reports",
      "White-label Client Portal",
      "Priority Support",
      "API Integration Options",
      "Marketing Automation Suite"
    ],
    recommendedFor: "High-volume agents and small teams"
  },
  
  // Service Provider bundles
  {
    id: 10,
    title: "Provider Basic",
    description: "Essential presence for service providers",
    price: 0,
    priceDisplay: "Free Trial",
    type: "provider",
    features: [
      "Business Profile",
      "Service Listings",
      "Message Center",
      "Basic Analytics"
    ]
  },
  {
    id: 11,
    title: "Provider Premium",
    description: "Enhanced visibility and client access",
    price: 79.99,
    priceDisplay: "$79.99/mo",
    type: "provider",
    features: [
      "Everything in Provider Basic",
      "Featured Placement",
      "Advanced Analytics",
      "Document Sharing Tools",
      "Client Management Dashboard",
      "Promotional Tools"
    ],
    highlighted: true,
    recommendedFor: "Active service providers seeking growth"
  },
  {
    id: 12,
    title: "Provider Enterprise",
    description: "Complete solution for established businesses",
    price: 149.99,
    priceDisplay: "$149.99/mo",
    type: "provider",
    features: [
      "Everything in Provider Premium",
      "Priority Placement",
      "Brand Showcase",
      "Team Member Accounts",
      "API Access",
      "Lead Generation Tools",
      "Integration with CRM Systems"
    ],
    recommendedFor: "Full-service companies with multiple team members"
  }
];

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, planId, userId, email } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Create metadata for the payment intent
    const metadata = {
      planId: planId || '',
      userId: userId || '',
      email: email || ''
    };

    const paymentIntent = await createPaymentIntent(amount, metadata);
    
    res.json({
      clientSecret: paymentIntent.clientSecret,
      planId: planId
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred while processing payment' 
    });
  }
});

// Get all service bundles
router.get('/service-bundles', (req, res) => {
  try {
    res.json(serviceBundles);
  } catch (error: any) {
    console.error('Error fetching service bundles:', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred while fetching service bundles' 
    });
  }
});

// Get a specific service bundle by ID
router.get('/service-bundles/:id', (req, res) => {
  try {
    const bundleId = parseInt(req.params.id);
    const bundle = serviceBundles.find(b => b.id === bundleId);
    
    if (!bundle) {
      return res.status(404).json({ error: 'Service bundle not found' });
    }
    
    res.json(bundle);
  } catch (error: any) {
    console.error('Error fetching service bundle:', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred while fetching the service bundle' 
    });
  }
});

export default router;