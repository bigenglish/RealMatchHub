import { Property, ServiceProvider, InsertProperty, InsertServiceProvider, ServiceExpert, InsertServiceExpert } from "@shared/schema";

export interface IStorage {
  // Properties
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  
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
}

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private serviceProviders: Map<number, ServiceProvider>;
  private serviceExperts: Map<number, ServiceExpert>;
  private propertyId: number;
  private providerId: number;
  private serviceExpertId: number;

  constructor() {
    this.properties = new Map();
    this.serviceProviders = new Map();
    this.serviceExperts = new Map();
    this.propertyId = 1;
    this.providerId = 1;
    this.serviceExpertId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
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
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
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
      verified: insertExpert.verified ?? false,
      address: insertExpert.address || null,
      placeId: insertExpert.placeId || null,
      businessHours: insertExpert.businessHours || null
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
}

export const storage = new MemStorage();
