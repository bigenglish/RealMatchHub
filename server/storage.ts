import { 
  Property, ServiceProvider, InsertProperty, InsertServiceProvider, 
  ServiceExpert, InsertServiceExpert, ServiceBundle, InsertServiceBundle,
  ServiceOffering, InsertServiceOffering, BundleService, InsertBundleService,
  ServiceRequest, InsertServiceRequest, ServiceAvailability,
  MarketTrend, InsertMarketTrend, PropertyWithGeo, MarketTrendData 
} from "@shared/schema";

import {
  ChatConversation, InsertChatConversation, ChatParticipant, InsertChatParticipant,
  ChatMessage, InsertChatMessage, Appointment, InsertAppointment,
  ChatConversationWithDetails, AppointmentDetails
} from "@shared/chat-schema";

export interface IStorage {
  // Properties
  getProperties(page?: number, limit?: number): Promise<Property[]> | Property[];
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  getPropertiesWithGeo(): Promise<PropertyWithGeo[]>;

  // Market Trends
  getMarketTrends(): Promise<MarketTrend[]>;
  getMarketTrendsByYear(year: number): Promise<MarketTrend[]>;
  getMarketTrendsByNeighborhood(neighborhood: string): Promise<MarketTrend[]>;
  getMarketTrendData(): Promise<MarketTrendData[]>;
  createMarketTrend(trend: InsertMarketTrend): Promise<MarketTrend>;

  // Service Providers
  getServiceProviders(): Promise<ServiceProvider[]>;
  getServiceProvider(id: number): Promise<ServiceProvider | undefined>;
  getServiceProvidersByType(type: string): Promise<ServiceProvider[]>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;

  // Service Experts
  getServiceExperts(): Promise<ServiceExpert[]>;
  getServiceExpert(id: number): Promise<ServiceExpert | undefined>;
  getServiceExpertByProviderId(providerId: string): Promise<ServiceExpert | undefined>;
  getServiceExpertsByService(service: string): Promise<ServiceExpert[]>;
  createServiceExpert(provider: InsertServiceExpert): Promise<ServiceExpert>;
  updateServiceExpert(id: number, provider: Partial<InsertServiceExpert>): Promise<ServiceExpert | undefined>;
  deleteServiceExpert(id: number): Promise<boolean>;
  getServiceExpertsByLocation(location: string, radius: number): Promise<ServiceExpert[]>;
  getServiceExpertsByAvailability(date: Date): Promise<ServiceExpert[]>;

  // Service Bundles (packages)
  getServiceBundles(): Promise<ServiceBundle[]>;
  getServiceBundle(id: number): Promise<ServiceBundle | undefined>;
  createServiceBundle(bundle: InsertServiceBundle): ServiceBundle; // Modified to non-Promise for sample data
  updateServiceBundle(id: number, bundle: Partial<InsertServiceBundle>): Promise<ServiceBundle | undefined>;
  deleteServiceBundle(id: number): Promise<boolean>;

  // Service Offerings (individual services)
  getServiceOfferings(): Promise<ServiceOffering[]>;
  getServiceOffering(id: number): Promise<ServiceOffering | undefined>;
  getServiceOfferingsByType(type: string): Promise<ServiceOffering[]>;
  createServiceOffering(offering: InsertServiceOffering): ServiceOffering; // Modified to non-Promise for sample data
  updateServiceOffering(id: number, offering: Partial<InsertServiceOffering>): Promise<ServiceOffering | undefined>;
  deleteServiceOffering(id: number): Promise<boolean>;

  // Bundle Services (many-to-many relationship)
  getServicesInBundle(bundleId: number): Promise<ServiceOffering[]>;
  addServiceToBundle(bundleId: number, serviceId: number): BundleService; // Modified to non-Promise for sample data
  removeServiceFromBundle(bundleId: number, serviceId: number): Promise<boolean>;

  // Service Requests (marketplace)
  getServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
  getServiceRequestsByUser(userId: number): Promise<ServiceRequest[]>;
  getServiceRequestsByExpert(expertId: number): Promise<ServiceRequest[]>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined>;
  updateServiceRequest(id: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest | undefined>;
  getServiceExpertsByTypeAndLocation(serviceType: string, zipCode: string): Promise<ServiceExpert[]>;

  // Chat Conversations
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getChatConversation(id: number): Promise<ChatConversation | undefined>;
  getChatConversations(): Promise<ChatConversation[]>;
  getChatConversationsByUserId(userId: number): Promise<ChatConversationWithDetails[]>;
  addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant>;
  removeChatParticipant(conversationId: number, userId: number): Promise<boolean>;

  // Chat Messages
  saveChatMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage>;
  getChatMessages(conversationId: number): Promise<ChatMessage[]>;
  getChatUnreadMessages(userId: number): Promise<{ conversationId: number, count: number }[]>;
  markChatMessagesAsRead(conversationId: number, userId: number): Promise<boolean>;

  // Appointments
  createAppointment(appointment: AppointmentDetails): Promise<Appointment>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUser(userId: number): Promise<Appointment[]>;
  getAppointmentsByExpert(expertId: number): Promise<Appointment[]>;
  getAppointmentsByProperty(propertyId: number): Promise<Appointment[]>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
}

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private serviceProviders: Map<number, ServiceProvider>;
  private serviceExperts: Map<number, ServiceExpert>;
  private serviceBundles: Map<number, ServiceBundle>;
  private serviceOfferings: Map<number, ServiceOffering>;
  private bundleServices: Map<number, BundleService>;
  private serviceRequests: Map<number, ServiceRequest>;
  private marketTrends: Map<number, MarketTrend>;
  // Chat and Appointment storage maps
  private chatConversations: Map<number, ChatConversation>;
  private chatParticipants: Map<number, ChatParticipant>;
  private chatMessages: Map<number, ChatMessage>;
  private appointments: Map<number, Appointment>;
  // IDs for auto-increment
  private propertyId: number;
  private providerId: number;
  private serviceExpertId: number;
  private serviceBundleId: number;
  private serviceOfferingId: number;
  private bundleServiceId: number;
  private serviceRequestId: number;
  private marketTrendId: number;
  private chatConversationId: number;
  private chatParticipantId: number;
  private chatMessageId: number;
  private appointmentId: number;

  constructor() {
    this.properties = new Map();
    this.serviceProviders = new Map();
    this.serviceExperts = new Map();
    this.serviceBundles = new Map();
    this.serviceOfferings = new Map();
    this.bundleServices = new Map();
    this.serviceRequests = new Map();
    this.marketTrends = new Map();
    this.chatConversations = new Map();
    this.chatParticipants = new Map();
    this.chatMessages = new Map();
    this.appointments = new Map();

    this.propertyId = 1;
    this.providerId = 1;
    this.serviceExpertId = 1;
    this.serviceBundleId = 1;
    this.serviceOfferingId = 1;
    this.bundleServiceId = 1;
    this.serviceRequestId = 1;
    this.marketTrendId = 1;
    this.chatConversationId = 1;
    this.chatParticipantId = 1;
    this.chatMessageId = 1;
    this.appointmentId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize market trends
    this.initializeSampleMarketTrends();

    // Sample service experts
    const sampleServiceExperts: InsertServiceExpert[] = [
      {
        providerId: "se-001",
        name: "Prime Mortgage Solutions",
        contactName: "Alex Johnson",
        contactEmail: "alex.johnson@primemortgage.example.com",
        contactPhone: "555-100-1234",
        website: "https://primemortgage.example.com",
        description: "Leading provider of mortgage solutions with competitive rates and flexible terms for all types of home buyers.",
        servicesOffered: ["Mortgages", "Refinancing", "Home Equity Loans", "FHA Loans", "VA Loans"],
        areasServed: ["California", "Nevada", "Arizona"],
        logoUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?auto=format&fit=crop&w=300&q=80",
        rating: 5,
        verified: true,
        serviceType: "Mortgage Lender",
        specialOffers: ["First-time homebuyer discount", "No closing costs option"]
      },
      {
        providerId: "se-002",
        name: "Heritage Financial",
        contactName: "Maria Rodriguez",
        contactEmail: "maria@heritagefinancial.example.com",
        contactPhone: "555-200-5678",
        website: "https://heritagefinancial.example.com",
        description: "Family-owned mortgage company specializing in personalized service and local expertise for over 30 years.",
        servicesOffered: ["Mortgages", "Jumbo Loans", "Construction Loans", "Conventional Loans"],
        areasServed: ["Texas", "Oklahoma", "Louisiana"],
        logoUrl: "https://images.unsplash.com/photo-1565514158740-064f34bd6cfd?auto=format&fit=crop&w=300&q=80",
        rating: 4,
        verified: true,
        serviceType: "Mortgage Lender"
      },
      {
        providerId: "se-003",
        name: "NextGen Lending",
        contactName: "Jason Kim",
        contactEmail: "jkim@nextgenlending.example.com",
        contactPhone: "555-300-9012",
        website: "https://nextgenlending.example.com",
        description: "Modern digital lending platform offering streamlined application process and quick approvals with minimal paperwork.",
        servicesOffered: ["Mortgages", "Refinancing", "Fixed-Rate Loans", "Adjustable-Rate Loans"],
        areasServed: ["Nationwide"],
        logoUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=300&q=80",
        rating: 5,
        verified: true,
        serviceType: "Mortgage Lender",
        specialOffers: ["Digital-only discount", "Rate match guarantee"]
      },
      {
        providerId: "se-004",
        name: "Wilson Home Inspections",
        contactName: "Robert Wilson",
        contactEmail: "rwilson@wilsoninspections.example.com",
        contactPhone: "555-400-7890",
        website: "https://wilsoninspections.example.com",
        description: "Thorough home inspection services with detailed reports and same-day availability in most markets.",
        servicesOffered: ["Home Inspections", "Radon Testing", "Termite Inspections", "Mold Assessments"],
        areasServed: ["Colorado", "Wyoming", "Utah"],
        logoUrl: "https://images.unsplash.com/photo-1581141849291-1125c7b692b5?auto=format&fit=crop&w=300&q=80",
        rating: 5,
        verified: true,
        serviceType: "Home Inspector"
      },
      {
        providerId: "se-005",
        name: "Thompson & Associates Legal",
        contactName: "Sarah Thompson",
        contactEmail: "sthompson@thompsonlegal.example.com",
        contactPhone: "555-500-2345",
        website: "https://thompsonlegal.example.com",
        description: "Experienced real estate attorneys specializing in closing services, title review, and contract preparation.",
        servicesOffered: ["Closing Services", "Title Review", "Contract Review", "Real Estate Litigation"],
        areasServed: ["New York", "Connecticut", "New Jersey"],
        logoUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80",
        rating: 4,
        verified: true,
        serviceType: "Real Estate Attorney"
      }
    ];

    // Sample properties
    const sampleProperties: InsertProperty[] = [
      {
        title: "Luxury Waterfront Villa",
        description: "Stunning waterfront property with panoramic views, private dock, and premium finishes throughout. Perfect for entertaining with spacious outdoor areas and a gourmet kitchen.",
        price: 1250000,
        address: "123 Harbor View, Miami, FL 33101",
        bedrooms: 4,
        bathrooms: 3,
        sqft: 3200,
        propertyType: "Single Family Home",
        images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"],
        listedDate: "2024-02-15",
      },
      {
        title: "Modern Downtown Condo",
        description: "Sleek, contemporary condo in the heart of downtown. Floor-to-ceiling windows, modern kitchen with stainless steel appliances, and access to premium building amenities.",
        price: 525000,
        address: "456 Urban Center Ave, New York, NY 10001",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1100,
        propertyType: "Condo",
        images: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80"],
        listedDate: "2024-03-01",
      },
      {
        title: "Charming Suburban Townhouse",
        description: "Beautiful townhouse in a quiet suburban neighborhood. Recently updated with new flooring, fresh paint, and a renovated kitchen. Close to schools and parks.",
        price: 375000,
        address: "789 Pleasant Lane, Austin, TX 78701",
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 1800,
        propertyType: "Townhouse",
        images: ["https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=800&q=80"],
        listedDate: "2024-02-28",
      },
      {
        title: "Mountain View Retreat",
        description: "Spectacular mountain property with breathtaking views. Open concept living with vaulted ceilings, stone fireplace, and wrap-around deck. Perfect vacation home or permanent residence.",
        price: 850000,
        address: "101 Summit Ridge, Denver, CO 80201",
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2900,
        propertyType: "Single Family Home",
        images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"],
        listedDate: "2024-03-10",
      },
      {
        title: "Urban Loft Apartment",
        description: "Stylish loft in a converted industrial building. Exposed brick walls, high ceilings, and large windows. Updated with modern amenities while preserving historic charm.",
        price: 420000,
        address: "202 Warehouse District, Chicago, IL 60601",
        bedrooms: 1,
        bathrooms: 1,
        sqft: 950,
        propertyType: "Apartment",
        images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80"],
        listedDate: "2024-03-05",
      },
      {
        title: "Elegant Victorian Home",
        description: "Beautifully maintained Victorian with original woodwork and period details. Updated systems throughout, gourmet kitchen, and landscaped garden. A perfect blend of historic charm and modern convenience.",
        price: 975000,
        address: "303 Heritage St, San Francisco, CA 94101",
        bedrooms: 5,
        bathrooms: 3,
        sqft: 3500,
        propertyType: "Single Family Home",
        images: ["https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80"],
        listedDate: "2024-02-20",
      }
    ];

    // Sample service providers
    const sampleProviders: InsertServiceProvider[] = [
      {
        name: "Sarah Johnson",
        type: "Real Estate Agent",
        description: "Experienced real estate agent specializing in luxury properties with 15 years in the industry. Consistently ranked in the top 1% of agents nationwide.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
        experience: 15,
        rating: 5,
        contact: "555-123-4567",
      },
      {
        name: "Michael Chen",
        type: "Real Estate Agent",
        description: "First-time homebuyer specialist with extensive knowledge of urban markets and investment properties. Known for patient guidance and strong negotiation skills.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
        experience: 8,
        rating: 4,
        contact: "555-987-6543",
      },
      {
        name: "Robert Williams",
        type: "Property Inspector",
        description: "Certified property inspector with background in construction. Thorough inspections with detailed reports and practical advice for addressing issues.",
        image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=800&q=80",
        experience: 20,
        rating: 5,
        contact: "555-456-7890",
      },
      {
        name: "Jennifer Martinez",
        type: "Mortgage Broker",
        description: "Dedicated mortgage broker with expertise in conventional, FHA, and VA loans. Works tirelessly to secure the best rates and terms for clients.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
        experience: 12,
        rating: 5,
        contact: "555-321-0987",
      },
      {
        name: "David Thompson",
        type: "Property Lawyer",
        description: "Real estate attorney specializing in property transactions, contract review, and dispute resolution. Clear communication and attention to detail.",
        image: "https://images.unsplash.com/photo-1556157382-97eda2f9e69d?auto=format&fit=crop&w=800&q=80",
        experience: 18,
        rating: 4,
        contact: "555-234-5678",
      },
      {
        name: "Sophia Rodriguez",
        type: "Interior Designer",
        description: "Award-winning interior designer with expertise in both contemporary and traditional styles. Creates beautiful, functional spaces that reflect each client's personality.",
        image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80",
        experience: 10,
        rating: 5,
        contact: "555-345-6789",
      },
      {
        name: "James Wilson",
        type: "Mortgage Broker",
        description: "Mortgage specialist focusing on jumbo loans and complex financial situations. Committed to finding creative solutions for challenging scenarios.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
        experience: 15,
        rating: 4,
        contact: "555-654-3210",
      },
      {
        name: "Emily Park",
        type: "Interior Designer",
        description: "Eco-conscious interior designer specializing in sustainable materials and energy-efficient designs without sacrificing style or comfort.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        experience: 8,
        rating: 5,
        contact: "555-789-0123",
      }
    ];

    // Add properties to storage
    sampleProperties.forEach(property => {
      this.createProperty(property);
    });

    // Add service providers to storage
    sampleProviders.forEach(provider => {
      this.createServiceProvider(provider);
    });

    // Add service experts to storage
    sampleServiceExperts.forEach(expert => {
      this.createServiceExpert(expert);
    });

    // Add sample service bundles based on the pricing tiers
    const bundle1 = this.createServiceBundle({
      name: "FREE",
      description: "Get a quick valuation and connect with potential buyers",
      price: "$0",
      savings: "",
      popularityRank: 3,
      featuredImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3",
      isActive: true,
      features: [
        "AI-powered property valuation",
        "Communicate, schedule virtual & in-person tours",
        "Listing creation with direct connection to buyers",
        "Market Trend Reports (local market data)"
      ]
    });

    const bundle2 = this.createServiceBundle({
      name: "BASIC",
      description: "Expert virtual guidance on offers and due diligence",
      price: "As low as $1,500",
      savings: "Save time and money",
      popularityRank: 2,
      featuredImage: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3",
      isActive: true,
      features: [
        "All 'Free' features",
        "Craft competitive offers and navigate negotiations with Realty AI tools and guidance",
        "Market analysis reports (comparable sales data) and purchase strategies",
        "Offer negotiation guidance (email/chat support) with a real estate expert",
        "Document review, digital signing and AI assistant to simplify and explain all terms and conditions",
        "Neighborhood insights",
        "Due Diligence Checklist & Support (guidance through the due diligence process)",
        "2 expert sign offs (detailed notes)"
      ]
    });

    const bundle3 = this.createServiceBundle({
      name: "PREMIUM",
      description: "Full virtual support from offer to post-closing",
      price: "As low as $2,500",
      savings: "Peace of mind",
      popularityRank: 1,
      featuredImage: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3",
      isActive: true,
      features: [
        "All 'Basic' features",
        "Offer Strategy Consultation (phone/video call with a real estate expert)",
        "24/7 phone support",
        "Inspection/appraisal coordination Expert review (scheduling and vendor recommendations)",
        "Preferred Vendor pricing for repairs",
        "Dedicated Buyer Advocate (phone/in-person support throughout the transaction)",
        "Closing Coordination (assistance with paperwork and logistics)",
        "Post-Closing Support (referrals to local service providers, utility setup assistance)",
        "4 expert sign off (detailed notes, viewing, inspection/staging, contingencies & compliance, negotiation & credits)"
      ]
    });

    // Add sample service offerings
    const offering1 = this.createServiceOffering({
      name: "Home Inspection",
      description: "Comprehensive inspection of all property systems and structure",
      price: "$499",
      serviceType: "Inspection Services",
      estimatedDuration: "3-4 hours",
      typicalTimingInTransaction: "After offer acceptance, before closing",
      isActive: true,
      requiredDocuments: ["Property disclosure statement", "Access authorization"]
    });

    const offering2 = this.createServiceOffering({
      name: "Mortgage Pre-Approval",
      description: "Complete financial assessment and pre-approval letter",
      price: "$299",
      serviceType: "Financing",
      estimatedDuration: "1-2 business days",
      typicalTimingInTransaction: "Before making offers",
      isActive: true,
      requiredDocuments: ["Income verification", "Credit history", "Asset documentation"]
    });

    const offering3 = this.createServiceOffering({
      name: "Title Search & Insurance",
      description: "Property title research and insurance policy",
      price: "$799",
      serviceType: "Legal & Closing",
      estimatedDuration: "3-5 business days",
      typicalTimingInTransaction: "During closing process",
      isActive: true,
      requiredDocuments: ["Property details", "Purchase agreement"]
    });

    const offering4 = this.createServiceOffering({
      name: "Real Estate Photography",
      description: "Professional photography package with virtual tour",
      price: "$399",
      serviceType: "Marketing",
      estimatedDuration: "1-2 hours on-site",
      typicalTimingInTransaction: "Before listing",
      isActive: true,
      requiredDocuments: ["Property access authorization"]
    });

    const offering5 = this.createServiceOffering({
      name: "Moving Services",
      description: "Full-service packing and moving with insurance",
      price: "$1,299",
      serviceType: "Relocation",
      estimatedDuration: "1 day",
      typicalTimingInTransaction: "After closing",
      isActive: true,
      requiredDocuments: ["Inventory list", "Moving date confirmation"]
    });

    const offering6 = this.createServiceOffering({
      name: "Legal Document Review",
      description: "Attorney review of all transaction documents",
      price: "$599",
      serviceType: "Legal & Closing",
      estimatedDuration: "1-2 business days",
      typicalTimingInTransaction: "Before signing final documents",
      isActive: true,
      requiredDocuments: ["Purchase agreement", "Disclosure forms", "Loan documents"]
    });

    // Connect services to bundles
    this.addServiceToBundle(bundle1.id, offering1.id);
    this.addServiceToBundle(bundle1.id, offering2.id);
    this.addServiceToBundle(bundle1.id, offering3.id);

    this.addServiceToBundle(bundle2.id, offering1.id);
    this.addServiceToBundle(bundle2.id, offering3.id);
    this.addServiceToBundle(bundle2.id, offering4.id);
    this.addServiceToBundle(bundle2.id, offering6.id);

    this.addServiceToBundle(bundle3.id, offering1.id);
    this.addServiceToBundle(bundle3.id, offering2.id);
    this.addServiceToBundle(bundle3.id, offering3.id);
    this.addServiceToBundle(bundle3.id, offering6.id);
  }

  async getProperties(page = 1, limit = 20): Promise<Property[]> {
    // Simulate pagination and relations inclusion for memory storage
    const offset = (page - 1) * limit;
    const propertiesArray = Array.from(this.properties.values());
    const paginatedProperties = propertiesArray.slice(offset, offset + limit);

    return paginatedProperties;
  }

  // Non-promise version for AI search
  getProperties(): Property[] {
    return Array.from(this.properties.values()).map(property => ({
      ...property,
      style: this.getPropertyStyle(property),
      features: this.getPropertyFeatures(property),
      location: property.address  // For simplicity in the demo
    }));
  }

  private getPropertyStyle(property: Property): string {
    // Extract architectural style from property details
    if (property.title.toLowerCase().includes('modern')) return 'modern';
    if (property.title.toLowerCase().includes('traditional')) return 'traditional';
    if (property.title.toLowerCase().includes('victorian')) return 'victorian';
    if (property.title.toLowerCase().includes('farmhouse')) return 'farmhouse';
    if (property.title.toLowerCase().includes('colonial')) return 'colonial';
    if (property.title.toLowerCase().includes('craftsman')) return 'craftsman';
    if (property.title.toLowerCase().includes('mediterranean')) return 'mediterranean';
    if (property.title.toLowerCase().includes('contemporary')) return 'contemporary';

    // Check description for style hints
    const desc = property.description.toLowerCase();
    if (desc.includes('modern')) return 'modern';
    if (desc.includes('traditional')) return 'traditional';
    if (desc.includes('victorian')) return 'victorian';
    if (desc.includes('farmhouse')) return 'farmhouse';
    if (desc.includes('colonial')) return 'colonial';
    if (desc.includes('craftsman')) return 'craftsman';
    if (desc.includes('mediterranean')) return 'mediterranean';
    if (desc.includes('contemporary')) return 'contemporary';
    if (desc.includes('industrial') || desc.includes('loft')) return 'industrial';

    // Default based on property type
    if (property.propertyType === 'Condo' || property.propertyType === 'Apartment') return 'contemporary';
    return 'traditional';
  }

  private getPropertyFeatures(property: Property): string[] {
    const features: string[] = [];
    const desc = property.description.toLowerCase();

    // Extract features from description
    if (desc.includes('garage') || desc.includes('parking')) features.push('garage');
    if (desc.includes('garden') || desc.includes('yard') || desc.includes('outdoor')) features.push('garden');
    if (desc.includes('pool') || desc.includes('swimming')) features.push('pool');
    if (desc.includes('air conditioning') || desc.includes('a/c')) features.push('ac');
    if (desc.includes('fireplace')) features.push('fireplace');
    if (desc.includes('balcony') || desc.includes('terrace') || desc.includes('patio')) features.push('balcony');
    if (desc.includes('basement')) features.push('basement');
    if (desc.includes('view') || desc.includes('panoramic')) features.push('view');
    if (desc.includes('security') || desc.includes('alarm')) features.push('security');

    // Add basic features based on property type
    if (property.propertyType === 'Single Family Home') {
      features.push('private entrance');
      features.push('garden');
    }

    if (property.propertyType === 'Condo') {
      features.push('elevator');
      features.push('gym access');
    }

    return features;
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyId++;
    // Ensure optional fields are handled properly
    const property: Property = { 
      ...insertProperty, 
      id,
      city: insertProperty.city || null,
      state: insertProperty.state || null,
      zipCode: insertProperty.zipCode || null
    };
    this.properties.set(id, property);
    return property;
  }

  async getServiceProviders(): Promise<ServiceProvider[]> {
    return Array.from(this.serviceProviders.values());
  }

  async getServiceProvider(id: number): Promise<ServiceProvider | undefined> {
    return this.serviceProviders.get(id);
    }

  async getServiceProvidersByType(type: string): Promise<ServiceProvider[]> {
    return Array.from(this.serviceProviders.values()).filter(
      (provider) => provider.type === type
    );
  }

  async createServiceProvider(insertProvider: InsertServiceProvider): Promise<ServiceProvider> {
    const id = this.providerId++;
    // Ensure rating is never undefined, use null as fallback
    const rating = insertProvider.rating === undefined ? null : insertProvider.rating;
    const provider: ServiceProvider = { ...insertProvider, id, rating };
    this.serviceProviders.set(id, provider);
    return provider;
  }

  // Service Experts methods
  async getServiceExperts(): Promise<ServiceExpert[]> {
    return Array.from(this.serviceExperts.values());
  }

  async getServiceExpert(id: number): Promise<ServiceExpert | undefined> {
    return this.serviceExperts.get(id);
  }

  async getServiceExpertByProviderId(providerId: string): Promise<ServiceExpert | undefined> {
    return Array.from(this.serviceExperts.values()).find(
      (expert) => expert.providerId === providerId
    );
  }

  async getServiceExpertsByService(service: string): Promise<ServiceExpert[]> {
    return Array.from(this.serviceExperts.values()).filter(
      (expert) => expert.servicesOffered.includes(service)
    );
  }

  async createServiceExpert(insertExpert: InsertServiceExpert): Promise<ServiceExpert> {
    const id = this.serviceExpertId++;
    // Ensure optional fields are handled properly
    const expert: ServiceExpert = { 
      ...insertExpert, 
      id,
      rating: insertExpert.rating || null,
      website: insertExpert.website || null,
      logoUrl: insertExpert.logoUrl || null,
      specialOffers: insertExpert.specialOffers || [],
      userType: insertExpert.userType || "vendor",
      verified: insertExpert?.verified || false,
      address: insertExpert?.address || '',
      placeId: insertExpert?.placeId || '',
      businessHours: insertExpert.businessHours || null,
      location: insertExpert?.location || null,
      serviceArea: insertExpert.serviceArea || null,
      availabilityJson: insertExpert.availabilityJson || null
    };
    this.serviceExperts.set(id, expert);
    return expert;
  }

  async updateServiceExpert(id: number, updates: Partial<InsertServiceExpert>): Promise<ServiceExpert | undefined> {
    const existingExpert = this.serviceExperts.get(id);
    if (!existingExpert) {
      return undefined;
    }

    // Create a new expert object with the updates
    const updatedExpert: ServiceExpert = {
      ...existingExpert,
      ...updates,
      // Make sure id doesn't get overwritten
      id
    };

    this.serviceExperts.set(id, updatedExpert);
    return updatedExpert;
  }

  async deleteServiceExpert(id: number): Promise<boolean> {
    return this.serviceExperts.delete(id);
  }

  // New methods for location and availability-based expert search
  async getServiceExpertsByLocation(location: string, radius: number): Promise<ServiceExpert[]> {
    // For now, just return all experts since we're not doing real geocoding calculations
    // In a real implementation, this would filter by distance from the provided location
    return this.getServiceExperts();
  }

  async getServiceExpertsByAvailability(date: Date): Promise<ServiceExpert[]> {
    // For now, just return all experts
    // In a real implementation, this would check the availabilityJson field
    return this.getServiceExperts();
  }

  // Service Bundles methods
  async getServiceBundles(): Promise<ServiceBundle[]> {
    return Array.from(this.serviceBundles.values());
  }

  async getServiceBundle(id: number): Promise<ServiceBundle | undefined> {
    return this.serviceBundles.get(id);
  }

  // This method is special for sample data - it returns non-Promise for use in initializeSampleData
  createServiceBundle(bundle: InsertServiceBundle): ServiceBundle {
    const id = this.serviceBundleId++;
    const createdAt = new Date();

    const serviceBundle: ServiceBundle = {
      id,
      name: bundle.name,
      description: bundle.description,
      price: bundle.price,
      savings: bundle.savings || null,
      popularityRank: bundle.popularityRank || null,
      featuredImage: bundle.featuredImage || null,
      isActive: bundle.isActive ?? true,
      createdAt,
      features: bundle.features || null
    };

    this.serviceBundles.set(id, serviceBundle);
    return serviceBundle;
  }

  async updateServiceBundle(id: number, updates: Partial<InsertServiceBundle>): Promise<ServiceBundle | undefined> {
    const existingBundle = this.serviceBundles.get(id);
    if (!existingBundle) {
      return undefined;
    }

    const updatedBundle: ServiceBundle = {
      ...existingBundle,
      ...updates,
      id
    };

    this.serviceBundles.set(id, updatedBundle);
    return updatedBundle;
  }

  async deleteServiceBundle(id: number): Promise<boolean> {
    return this.serviceBundles.delete(id);
  }

  // Service Offerings methods
  async getServiceOfferings(): Promise<ServiceOffering[]> {
    return Array.from(this.serviceOfferings.values());
  }

  async getServiceOffering(id: number): Promise<ServiceOffering | undefined> {
    return this.serviceOfferings.get(id);
  }

  async getServiceOfferingsByType(type: string): Promise<ServiceOffering[]> {
    return Array.from(this.serviceOfferings.values()).filter(
      (offering) => offering.serviceType === type
    );
  }

  // This method is special for sample data - it returns non-Promise for use in initializeSampleData
  createServiceOffering(offering: InsertServiceOffering): ServiceOffering {
    const id = this.serviceOfferingId++;
    const createdAt = new Date();

    const serviceOffering: ServiceOffering = {
      ...offering,
      id,
      createdAt,
      isActive: offering.isActive ?? true,
      requiredDocuments: offering.requiredDocuments || null
    };

    this.serviceOfferings.set(id, serviceOffering);
    return serviceOffering;
  }

  async updateServiceOffering(id: number, updates: Partial<InsertServiceOffering>): Promise<ServiceOffering | undefined> {
    const existingOffering = this.serviceOfferings.get(id);
    if (!existingOffering) {
      return undefined;
    }

    const updatedOffering: ServiceOffering = {
      ...existingOffering,
      ...updates,
      id
    };

    this.serviceOfferings.set(id, updatedOffering);
    return updatedOffering;
  }

  async deleteServiceOffering(id: number): Promise<boolean> {
    return this.serviceOfferings.delete(id);
  }

  // Bundle Services methods
  async getServicesInBundle(bundleId: number): Promise<ServiceOffering[]> {
    // Get all BundleService records for the given bundle
    const bundleServiceEntries = Array.from(this.bundleServices.values())
      .filter(bs => bs.bundleId === bundleId);

    // Get all service offerings for those service IDs
    const serviceIds = bundleServiceEntries.map(bs => bs.serviceId);
    const services = Array.from(this.serviceOfferings.values())
      .filter(service => serviceIds.includes(service.id));

    return services;
  }

  // This method is special for sample data - it returns non-Promise for use in initializeSampleData
  addServiceToBundle(bundleId: number, serviceId: number): BundleService {
    const id = this.bundleServiceId++;

    const bundleService: BundleService = {
      id,
      bundleId,
      serviceId
    };

    this.bundleServices.set(id, bundleService);
    return bundleService;
  }

  async removeServiceFromBundle(bundleId: number, serviceId: number): Promise<boolean> {
    const bundleServiceEntry = Array.from(this.bundleServices.values())
      .find(bs => bs.bundleId === bundleId && bs.serviceId === serviceId);

    if (!bundleServiceEntry) {
      return false;
    }

    return this.bundleServices.delete(bundleServiceEntry.id);
  }

  // Service Requests methods
  async getServiceRequests(): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values());
  }

  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    return this.serviceRequests.get(id);
  }

  async getServiceRequestsByUser(userId: number): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values())
      .filter(request => request.userId === userId);
  }

  async getServiceRequestsByExpert(expertId: number): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values())
      .filter(request => request.serviceExpertId === expertId);
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const id = this.serviceRequestId++;
    const requestDate = new Date();
    const createdAt = new Date();

    // Create a properly typed ServiceRequest object without using spread operator
    const serviceRequest: ServiceRequest = {
      id,
      serviceType: request.serviceType,
      status: request.status || "pending",
      createdAt,
      userId: request.userId,
      serviceExpertId: request.serviceExpertId,
      requestDate,
      needByDate: request.needByDate || null,
      notes: request.notes || null,
      propertyId: request.propertyId || null
    };

    this.serviceRequests.set(id, serviceRequest);
    return serviceRequest;
  }

  async updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest | undefined> {
    const existingRequest = this.serviceRequests.get(id);
    if (!existingRequest) {
      return undefined;
    }

    const updatedRequest: ServiceRequest = {
      ...existingRequest,
      status
    };

    this.serviceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async updateServiceRequest(id: number, updates: Partial<ServiceRequest>): Promise<ServiceRequest | undefined> {
    const existingRequest = this.serviceRequests.get(id);
    if (!existingRequest) {
      return undefined;
    }

    const updatedRequest: ServiceRequest = {
      ...existingRequest,
      ...updates
    };

    this.serviceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getServiceExpertsByTypeAndLocation(serviceType: string, zipCode: string): Promise<ServiceExpert[]> {
    // In a real app, you would filter by GPS coordinates, zip code proximity, etc.
    // For this prototype, we'll just filter by service type and assume all experts work in all zip codes
    return Array.from(this.serviceExperts.values())
      .filter(expert => {
        // Check if exact service type matches
        if (expert.serviceType === serviceType) return true;

        // Check if the service type is in the services offered
        return expert.servicesOffered.includes(serviceType);
      });
  }

  // Properties with geo coordinates for map visualization
  async getPropertiesWithGeo(): Promise<PropertyWithGeo[]> {
    // Convert properties to PropertyWithGeo format with coordinates
    const propertiesWithGeo: PropertyWithGeo[] = Array.from(this.properties.values()).map(property => {
      // Simulate geocoding for sample properties
      // In a real implementation, these would come from the database or geocoding API
      const latitude = 37.7749 + (Math.random() - 0.5) * 0.1; // Randomize around San Francisco
      const longitude = -122.4194 + (Math.random() - 0.5) * 0.1;

      return {
        listingId: property.id.toString(),
        address: property.address,
        city: property.city || '',
        state: property.state || '',
        zipCode: property.zipCode || '',
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sqft: property.sqft,
        propertyType: property.propertyType,
        latitude,
        longitude,
        images: property.images,
        description: property.description,
        listedDate: property.listedDate.toString(),
      };
    });

    return propertiesWithGeo;
  }

  // Market Trends methods
  async getMarketTrends(): Promise<MarketTrend[]> {
    return Array.from(this.marketTrends.values());
  }

  async getMarketTrendsByYear(year: number): Promise<MarketTrend[]> {
    return Array.from(this.marketTrends.values()).filter(trend => trend.year === year);
  }

  async getMarketTrendsByNeighborhood(neighborhood: string): Promise<MarketTrend[]> {
    return Array.from(this.marketTrends.values()).filter(trend => 
      trend.neighborhood === neighborhood || !neighborhood
    );
  }

  async createMarketTrend(trend: InsertMarketTrend): Promise<MarketTrend> {
    const id = this.marketTrendId++;
    const newTrend: MarketTrend = {
      id,
      ...trend
    };

    this.marketTrends.set(id, newTrend);
    return newTrend;
  }

  async getMarketTrendData(): Promise<MarketTrendData[]> {
    // If we don't have market trends data, create sample data
    if (this.marketTrends.size === 0) {
      this.initializeSampleMarketTrends();
    }

    return Array.from(this.marketTrends.values()).map(trend => ({
      year: trend.year,
      quarter: trend.quarter,
      neighborhood: trend.neighborhood || undefined,
      averagePrice: trend.averagePrice,
      medianPrice: trend.medianPrice,
      salesVolume: trend.salesVolume,
      daysOnMarket: trend.daysOnMarket,
      percentageChange: trend.percentageChange,
      propertyType: trend.propertyType || undefined
    }));
  }

  private initializeSampleMarketTrends() {
    // Generate sample market trend data for the last 5 years
    const currentYear = new Date().getFullYear();
    const neighborhoods = ['Downtown', 'Suburban Heights', 'Westside', 'Eastside', 'Northgate'];
    const propertyTypes = ['Single Family Home', 'Condo', 'Townhouse'];

    let basePrice = 850000; // Starting average price

    for (let year = currentYear - 5; year <= currentYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        // Skip future quarters
        if (year === currentYear && quarter > Math.floor((new Date().getMonth() + 3) / 3)) {
          continue;
        }

        // Price trends with seasonal variations and general upward trend
        // Price grows about 5% per year with quarterly fluctuations
        const yearFactor = 1 + (year - (currentYear - 5)) * 0.05; // 5% annual increase
        const quarterFactor = 1 + (quarter === 2 || quarter === 3 ? 0.02 : -0.01); // Seasonal variations

        // Calculate this quarter's price based on the base price with yearly and quarterly factors
        const quarterPrice = Math.round(basePrice * yearFactor * quarterFactor);

        // Calculate percentage change from previous quarter
        const prevPrice = basePrice * (year === currentYear - 5 && quarter === 1 ? 1 : yearFactor * (1 + ((quarter === 1 ? 4 : quarter - 1) === 2 || (quarter === 1 ? 4 : quarter - 1) === 3 ? 0.02 : -0.01)));
        const percentageChange = ((quarterPrice - prevPrice) / prevPrice) * 100;

        // For each neighborhood, add slightly different data
        neighborhoods.forEach((neighborhood, index) => {
          // Each neighborhood has slightly different prices and trends
          const neighborhoodFactor = 1 + (index - 2) * 0.1; // -0.2 to +0.2 variation

          propertyTypes.forEach((propertyType, typeIndex) => {
            // Each property type has different price levels
            const typeFactor = typeIndex === 0 ? 1.2 : typeIndex === 1 ? 0.7 : 0.9;

            const finalPrice = Math.round(quarterPrice * neighborhoodFactor * typeFactor);
            const medianPrice = Math.round(finalPrice * 0.9); // Median is typically lower than average

            this.createMarketTrend({
              year,
              quarter,
              neighborhood,
              averagePrice: finalPrice,
              medianPrice,
              salesVolume: Math.floor(50 + Math.random() * 50 * (quarter === 2 || quarter === 3 ? 1.5 : 0.8)),
              daysOnMarket: Math.floor(30 + Math.random() * 20 * (quarter === 1 || quarter === 4 ? 1.3 : 0.7)),
              percentageChange: parseFloat(percentageChange.toFixed(2)),
              propertyType
            });
          });
        });
      }
    }
  }

  // Chat Conversations
  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const id = this.chatConversationId++;
    const newConversation: ChatConversation = {
      ...conversation,
      id,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    };
    this.chatConversations.set(id, newConversation);
    return newConversation;
  }

  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    return this.chatConversations.get(id);
  }

  async getChatConversations(): Promise<ChatConversation[]> {
    return Array.from(this.chatConversations.values());
  }

  async getChatConversationsByUserId(userId: number): Promise<ChatConversationWithDetails[]> {
    // Get all participants for this user
    const userParticipations = Array.from(this.chatParticipants.values())
      .filter(participant => participant.userId === userId)
      .map(participant => participant.conversationId);

    // Get conversations
    const conversations = Array.from(this.chatConversations.values())
      .filter(conversation => userParticipations.includes(conversation.id));

    // Enrich with participants and latest message
    return Promise.all(conversations.map(async conversation => {
      const participants = Array.from(this.chatParticipants.values())
        .filter(participant => participant.conversationId === conversation.id);

      const messages = Array.from(this.chatMessages.values())
        .filter(message => message.conversationId === conversation.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      const latestMessage = messages.length > 0 ? messages[0] : undefined;

      const unreadCount = messages.filter(message => 
        !message.isRead && message.senderId !== userId
      ).length;

      return {
        ...conversation,
        participants,
        latestMessage,
        unreadCount
      };
    }));
  }

  async addChatParticipant(participant: InsertChatParticipant): Promise<ChatParticipant> {
    const id = this.chatParticipantId++;
    const newParticipant: ChatParticipant = {
      ...participant,
      id,
      joinedAt: new Date().toISOString(),
      lastReadAt: new Date().toISOString()
    };
    this.chatParticipants.set(id, newParticipant);
    return newParticipant;
  }

  async removeChatParticipant(conversationId: number, userId: number): Promise<boolean> {
    const participants = Array.from(this.chatParticipants.values());
    const participantToRemove = participants.find(p => 
      p.conversationId === conversationId && p.userId === userId
    );

    if (participantToRemove) {
      this.chatParticipants.delete(participantToRemove.id);
      return true;
    }

    return false;
  }

  // Chat Messages
  async saveChatMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const id = this.chatMessageId++;
    const newMessage: ChatMessage = {
      ...message,
      id: id.toString(),
    };
    this.chatMessages.set(id, newMessage);

    // Update last message timestamp on conversation
    const conversation = this.chatConversations.get(parseInt(message.conversationId));
    if (conversation) {
      conversation.lastMessageAt = message.timestamp;
      this.chatConversations.set(conversation.id, conversation);
    }

    return newMessage;
  }

  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => parseInt(message.conversationId) === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getChatUnreadMessages(userId: number): Promise<{ conversationId: number, count: number }[]> {
    // Get conversations this user is a part of
    const userParticipations = Array.from(this.chatParticipants.values())
      .filter(participant => participant.userId === userId)
      .map(participant => participant.conversationId);

    const result: { conversationId: number, count: number }[] = [];

    // For each conversation, count unread messages
    for (const conversationId of userParticipations) {
      const unreadCount = Array.from(this.chatMessages.values()).filter(message => 
        parseInt(message.conversationId) === conversationId && 
        message.senderId !== userId &&
        !message.isRead
      ).length;

      if (unreadCount > 0) {
        result.push({ conversationId, count: unreadCount });
      }
    }

    return result;
  }

  async markChatMessagesAsRead(conversationId: number, userId: number): Promise<boolean> {
    const messages = Array.from(this.chatMessages.values())
      .filter(message => 
        parseInt(message.conversationId) === conversationId && 
        message.senderId !== userId &&
        !message.isRead
      );

    // Mark all messages as read
    for (const message of messages) {
      message.isRead = true;
      this.chatMessages.set(parseInt(message.id), message);
    }

    // Update last read timestamp for participant
    const participant = Array.from(this.chatParticipants.values()).find(p => 
      p.conversationId === conversationId && p.userId === userId
    );

    if (participant) {
      participant.lastReadAt = new Date().toISOString();
      this.chatParticipants.set(participant.id, participant);
    }

    return true;
  }

  // Appointments
  async createAppointment(appointmentDetails: AppointmentDetails): Promise<Appointment> {
    const id = this.appointmentId++;
    const now = new Date().toISOString();

    const appointment: Appointment = {
      id,
      propertyId: appointmentDetails.propertyId || null,
      userId: appointmentDetails.userId,
      expertId: appointmentDetails.expertId || null,
      type: appointmentDetails.type,
      subType: appointmentDetails.subType,
      status: 'pending',
      date: appointmentDetails.date.toISOString(),
      notes: appointmentDetails.notes || null,
      createdAt: now,
      updatedAt: now,
      metadata: appointmentDetails.metadata || null
    };

    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.userId === userId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getAppointmentsByExpert(expertId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.expertId === expertId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getAppointmentsByProperty(propertyId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.propertyId === propertyId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);

    if (appointment) {
      const updatedAppointment: Appointment = {
        ...appointment,
        status,
        updatedAt: new Date().toISOString()
      };

      this.appointments.set(id, updatedAppointment);
      return updatedAppointment;
    }

    return undefined;
  }
}

export const storage = new MemStorage();