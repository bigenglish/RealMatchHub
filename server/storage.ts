import { Property, ServiceProvider, InsertProperty, InsertServiceProvider } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private properties: Map<number, Property>;
  private serviceProviders: Map<number, ServiceProvider>;
  private propertyId: number;
  private providerId: number;

  constructor() {
    this.properties = new Map();
    this.serviceProviders = new Map();
    this.propertyId = 1;
    this.providerId = 1;
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyId++;
    const property: Property = { ...insertProperty, id };
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
    const provider: ServiceProvider = { ...insertProvider, id };
    this.serviceProviders.set(id, provider);
    return provider;
  }
}

export const storage = new MemStorage();
