import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Check, Home, Building, ChevronsRight, CalendarDays, MapPin,
  Camera, Upload, Image, X, Wallet, Calculator, Shield, Key, Ruler,
  Bed, Bath, CheckSquare, Clock, MoveVertical, TrendingUp, DollarSign,
  Package, Calendar, SplitSquareVertical, Square, Hammer, Palmtree,
  Mountain, Landmark, Sofa, Armchair, Factory, Waves, Leaf, Sparkles,
  PanelLeft, LayoutGrid, FileInput, Users
} from 'lucide-react';

export type SellerStep = 'intent' | 'situation' | 'services' | 'property-profile' | 'price-strategy' | 'review';

interface SellerWorkflowProps {
  currentStep: SellerStep;
  onStepChange: (step: SellerStep) => void;
  onComplete: () => void;
}

export interface SellerInfo {
  // Step 1: Intent (Buy/Sell/Both)
  intent?: 'buy' | 'sell' | 'both';
  
  // Step 2: Situation
  propertyType?: string;
  propertySize?: string;
  bedrooms?: number;
  bathrooms?: number;
  hasPhotos?: boolean;
  features?: string[];
  location?: string;
  timeframe?: string;
  urgency?: string;
  isRelocating?: boolean;
  financialReasons?: string;
  needsMovingServices?: boolean;
  buyingAfterSelling?: boolean;
  
  // Step 3: Selling Services
  selectedServices?: string[];
  
  // Step 4: Property Profile
  propertyDetails?: {
    features: string[];
    amenities: string[];
    photos: string[];
    description: string;
  };
  
  // Step 5: Price & Strategy
  listingPrice?: number;
  recommendedPrice?: number;
  urgencyToSell?: string;
  reasonForSelling?: string;
  marketInsights?: {
    likelihoodToSell: string;
    estimatedTimeToSell: string;
    considerations: string;
  };
  
  // Step 6: Review & Publish
  termsAccepted?: boolean;
}

export default function SellerWorkflow({
  currentStep,
  onStepChange,
  onComplete
}: SellerWorkflowProps): JSX.Element {
  const [sellerInfo, setSellerInfo] = useState<SellerInfo>({
    intent: 'sell',
    selectedServices: [],
    features: [],
    propertyDetails: {
      features: [],
      amenities: [],
      photos: [],
      description: ''
    }
  });
  
  // Calculate progress based on current step
  const getProgress = useCallback(() => {
    const steps: SellerStep[] = ['intent', 'situation', 'services', 'property-profile', 'price-strategy', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    return Math.round(((currentIndex + 1) / steps.length) * 100);
  }, [currentStep]);
  
  // Property types for selection
  const propertyTypes = useMemo(() => [
    { id: 'single-family', label: "Single Family Home" },
    { id: 'condo', label: "Condo" },
    { id: 'townhouse', label: "Townhouse" },
    { id: 'multi-family', label: "Multi-Family" },
    { id: 'land', label: "Land" },
    { id: 'apartment', label: "Apartment" }
  ], []);
  
  // Property features
  const propertyFeatures = useMemo(() => [
    { id: 'pool', label: "Pool", icon: <Waves className="h-4 w-4" /> },
    { id: 'garage', label: "Garage", icon: <Building className="h-4 w-4" /> },
    { id: 'yard', label: "Yard", icon: <Palmtree className="h-4 w-4" /> },
    { id: 'balcony', label: "Balcony", icon: <Mountain className="h-4 w-4" /> },
    { id: 'fireplace', label: "Fireplace", icon: <Sparkles className="h-4 w-4" /> },
    { id: 'updated-kitchen', label: "Updated Kitchen", icon: <Armchair className="h-4 w-4" /> },
    { id: 'updated-bathrooms', label: "Updated Bathrooms", icon: <Bath className="h-4 w-4" /> }
  ], []);
  
  // Services offered
  const availableServices = useMemo(() => [
    { 
      id: 'photography', 
      name: 'Professional Photography', 
      description: 'High-quality photos attract more buyers and showcase your property\'s best features during online browsing.', 
      icon: <Camera className="h-5 w-5" />, 
      price: 299 
    },
    { 
      id: 'staging', 
      name: 'Staging Consultation', 
      description: 'Expert advice on how to arrange your home to appeal to the widest range of buyers and maximize your selling price.', 
      icon: <Sofa className="h-5 w-5" />, 
      price: 199 
    },
    { 
      id: 'video-tour', 
      name: 'Property Video Tour', 
      description: 'Professional video walkthrough that gives potential buyers a more immersive view of your property.', 
      icon: <FileInput className="h-5 w-5" />, 
      price: 399 
    },
    { 
      id: 'virtual-tour', 
      name: '3D Virtual Tour', 
      description: 'Interactive 3D model allowing buyers to virtually walk through your home from anywhere.', 
      icon: <LayoutGrid className="h-5 w-5" />, 
      price: 499 
    },
    { 
      id: 'analytics', 
      name: 'Listing Analytics', 
      description: 'Detailed reports on your listing performance, viewer demographics, and engagement metrics.', 
      icon: <TrendingUp className="h-5 w-5" />, 
      price: 149 
    },
    { 
      id: 'market-analysis', 
      name: 'Market Analysis', 
      description: 'Comprehensive analysis of comparable properties and market trends to help you price your home competitively.', 
      icon: <PanelLeft className="h-5 w-5" />, 
      price: 249 
    },
    { 
      id: 'expert-consulting', 
      name: 'Expert Consulting', 
      description: 'One-on-one consultation with a real estate expert to navigate complex selling situations.', 
      icon: <Landmark className="h-5 w-5" />, 
      price: 349 
    },
    { 
      id: 'professional-network', 
      name: 'Connect with Professionals', 
      description: 'Access to our network of vetted real estate agents, lawyers, and other professionals.', 
      icon: <Users className="h-5 w-5" />, 
      price: 99 
    }
  ], []);
  
  // Timeframe options
  const timeframeOptions = useMemo(() => [
    { id: 'immediate', label: "Immediate (within 30 days)" },
    { id: '1-3months', label: "1-3 months" },
    { id: '3-6months', label: "3-6 months" },
    { id: '6-12months', label: "6-12 months" },
    { id: 'flexible', label: "Flexible / Not sure yet" }
  ], []);
  
  // Urgency options
  const urgencyOptions = useMemo(() => [
    { id: 'very-urgent', label: "Very Urgent" },
    { id: 'moderately-urgent', label: "Moderately Urgent" },
    { id: 'not-urgent', label: "Not Urgent" },
    { id: 'flexible', label: "Flexible" }
  ], []);
  
  // Selling reasons
  const sellingReasons = useMemo(() => [
    { id: 'relocating', label: "Relocating" },
    { id: 'downsizing', label: "Downsizing" },
    { id: 'upsizing', label: "Upsizing" },
    { id: 'financial', label: "Financial Reasons" },
    { id: 'investment', label: "Investment Strategy" },
    { id: 'other', label: "Other" }
  ], []);

  // Handle intent selection (Step 1)
  const handleIntentSelect = (intent: 'buy' | 'sell' | 'both') => {
    setSellerInfo(prev => ({ ...prev, intent }));
    onStepChange('situation');
  };
  
  // Handle service selection (Step 3)
  const handleServiceSelection = (serviceId: string) => {
    setSellerInfo(prev => {
      const services = prev.selectedServices || [];
      if (services.includes(serviceId)) {
        return { ...prev, selectedServices: services.filter(id => id !== serviceId) };
      } else {
        return { ...prev, selectedServices: [...services, serviceId] };
      }
    });
  };
  
  // Handle feature selection (Step 2)
  const handleFeatureSelection = (featureId: string) => {
    setSellerInfo(prev => {
      const features = prev.features || [];
      if (features.includes(featureId)) {
        return { ...prev, features: features.filter(id => id !== featureId) };
      } else {
        return { ...prev, features: [...features, featureId] };
      }
    });
  };
  
  // Handle move to next step
  const handleNextStep = () => {
    const steps: SellerStep[] = ['intent', 'situation', 'services', 'property-profile', 'price-strategy', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      onStepChange(steps[currentIndex + 1]);
    } else {
      onComplete();
    }
  };
  
  // Handle move to previous step
  const handlePreviousStep = () => {
    const steps: SellerStep[] = ['intent', 'situation', 'services', 'property-profile', 'price-strategy', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      onStepChange(steps[currentIndex - 1]);
    }
  };
  
  // Calculate total service cost
  const calculateServiceTotal = () => {
    return (sellerInfo.selectedServices || []).reduce((total, serviceId) => {
      const service = availableServices.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">
          {currentStep === 'intent' && "What are you looking to do?"}
          {currentStep === 'situation' && "Tell us about your selling situation"}
          {currentStep === 'services' && "Enhance Your Sale with These Services"}
          {currentStep === 'property-profile' && "Showcase Your Property"}
          {currentStep === 'price-strategy' && "Let's Determine Your Price & Plan"}
          {currentStep === 'review' && "Review & Publish Your Listing"}
        </h2>
        <div className="space-y-1">
          <Progress value={getProgress()} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Step {['intent', 'situation', 'services', 'property-profile', 'price-strategy', 'review'].indexOf(currentStep) + 1} of 6
          </p>
        </div>
      </div>
      
      {currentStep === 'intent' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`p-6 cursor-pointer hover:border-primary hover:shadow-md transition-all ${
                sellerInfo.intent === "buy" ? "bg-primary/10 border-primary" : ""
              }`}
              onClick={() => handleIntentSelect("buy")}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <Home className="h-10 w-10 text-primary" />
                <h4 className="font-semibold text-lg">Buy a property</h4>
                <p className="text-sm text-muted-foreground">
                  I'm looking to purchase a home or investment property
                </p>
              </div>
            </Card>

            <Card 
              className={`p-6 cursor-pointer hover:border-primary hover:shadow-md transition-all ${
                sellerInfo.intent === "sell" ? "bg-primary/10 border-primary" : ""
              }`}
              onClick={() => handleIntentSelect("sell")}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <Building className="h-10 w-10 text-primary" />
                <h4 className="font-semibold text-lg">Sell a property</h4>
                <p className="text-sm text-muted-foreground">
                  I'm looking to sell my home or investment property
                </p>
              </div>
            </Card>

            <Card 
              className={`p-6 cursor-pointer hover:border-primary hover:shadow-md transition-all ${
                sellerInfo.intent === "both" ? "bg-primary/10 border-primary" : ""
              }`}
              onClick={() => handleIntentSelect("both")}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <ChevronsRight className="h-10 w-10 text-primary" />
                <h4 className="font-semibold text-lg">Both</h4>
                <p className="text-sm text-muted-foreground">
                  I'm looking to sell my current home and buy a new one
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {currentStep === 'situation' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select 
                    value={sellerInfo.propertyType} 
                    onValueChange={(value) => setSellerInfo({...sellerInfo, propertyType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="propertySize">Property Size (sq ft)</Label>
                  <Input 
                    id="propertySize"
                    type="number"
                    placeholder="Enter square footage"
                    value={sellerInfo.propertySize || ''}
                    onChange={(e) => setSellerInfo({...sellerInfo, propertySize: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select 
                    value={sellerInfo.bedrooms?.toString()} 
                    onValueChange={(value) => setSellerInfo({...sellerInfo, bedrooms: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Number of bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Bedroom' : 'Bedrooms'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select 
                    value={sellerInfo.bathrooms?.toString()} 
                    onValueChange={(value) => setSellerInfo({...sellerInfo, bathrooms: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Number of bathrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Bathroom' : 'Bathrooms'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Property Features & Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {propertyFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer hover:bg-muted transition-colors ${
                        sellerInfo.features?.includes(feature.id) ? 'bg-primary/10 border-primary' : 'border-input'
                      }`}
                      onClick={() => handleFeatureSelection(feature.id)}
                    >
                      <div className={`text-muted-foreground ${sellerInfo.features?.includes(feature.id) ? 'text-primary' : ''}`}>
                        {feature.icon}
                      </div>
                      <span className="text-sm">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location"
                  placeholder="Enter property address"
                  value={sellerInfo.location || ''}
                  onChange={(e) => setSellerInfo({...sellerInfo, location: e.target.value})}
                />
              </div>
              
              <div className="mt-6">
                <Label htmlFor="timeframe">Selling Timeframe</Label>
                <Select 
                  value={sellerInfo.timeframe} 
                  onValueChange={(value) => setSellerInfo({...sellerInfo, timeframe: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframeOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-6">
                <Label htmlFor="urgency">How urgent is your sale?</Label>
                <Select 
                  value={sellerInfo.urgency} 
                  onValueChange={(value) => setSellerInfo({...sellerInfo, urgency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="relocating"
                    checked={sellerInfo.isRelocating}
                    onCheckedChange={(checked) => 
                      setSellerInfo({...sellerInfo, isRelocating: checked === true})
                    }
                  />
                  <Label htmlFor="relocating">I'm relocating to a new area</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="moving-services"
                    checked={sellerInfo.needsMovingServices}
                    onCheckedChange={(checked) => 
                      setSellerInfo({...sellerInfo, needsMovingServices: checked === true})
                    }
                  />
                  <Label htmlFor="moving-services">I need moving services</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="buying-after"
                    checked={sellerInfo.buyingAfterSelling}
                    onCheckedChange={(checked) => 
                      setSellerInfo({...sellerInfo, buyingAfterSelling: checked === true})
                    }
                  />
                  <Label htmlFor="buying-after">I plan to buy after selling</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePreviousStep}>
              Previous
            </Button>
            <Button onClick={handleNextStep}>
              Next: Select Services
            </Button>
          </div>
        </div>
      )}
      
      {currentStep === 'services' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableServices.map((service) => (
              <Card key={service.id} className={`border overflow-hidden transition-colors ${
                sellerInfo.selectedServices?.includes(service.id) ? 'border-primary bg-primary/5' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge variant="outline">${service.price}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.description}
                      </p>
                      <div className="mt-3">
                        <Button 
                          variant={sellerInfo.selectedServices?.includes(service.id) ? "destructive" : "secondary"}
                          size="sm"
                          onClick={() => handleServiceSelection(service.id)}
                        >
                          {sellerInfo.selectedServices?.includes(service.id) ? (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Select
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {(sellerInfo.selectedServices?.length || 0) > 0 && (
            <Card className="bg-primary/5 border-primary">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Selected Services</h4>
                    <p className="text-sm text-muted-foreground">
                      {sellerInfo.selectedServices?.length} service{(sellerInfo.selectedServices?.length || 0) > 1 ? 's' : ''} selected
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-medium text-lg">${calculateServiceTotal()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePreviousStep}>
              Previous
            </Button>
            <Button onClick={handleNextStep}>
              Next: Describe Your Property
            </Button>
          </div>
        </div>
      )}
      
      {currentStep === 'property-profile' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 1: Confirm Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Property Type</Label>
                  <div className="p-2 border rounded-md bg-muted/50">
                    {propertyTypes.find(t => t.id === sellerInfo.propertyType)?.label || "Not specified"}
                  </div>
                </div>
                <div>
                  <Label>Size</Label>
                  <div className="p-2 border rounded-md bg-muted/50">
                    {sellerInfo.propertySize || "Not specified"} sq ft
                  </div>
                </div>
                <div>
                  <Label>Bedrooms</Label>
                  <div className="p-2 border rounded-md bg-muted/50">
                    {sellerInfo.bedrooms || "Not specified"}
                  </div>
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <div className="p-2 border rounded-md bg-muted/50">
                    {sellerInfo.bathrooms || "Not specified"}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Location</Label>
                  <div className="p-2 border rounded-md bg-muted/50">
                    {sellerInfo.location || "Not specified"}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => onStepChange('situation')}>
                Edit Basic Details
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 2: Highlight Features & Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {propertyFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer hover:bg-muted transition-colors ${
                        sellerInfo.features?.includes(feature.id) ? 'bg-primary/10 border-primary' : 'border-input'
                      }`}
                      onClick={() => handleFeatureSelection(feature.id)}
                    >
                      <div className={`text-muted-foreground ${sellerInfo.features?.includes(feature.id) ? 'text-primary' : ''}`}>
                        {feature.icon}
                      </div>
                      <span className="text-sm">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 3: Upload Photos & Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/50">
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <h4 className="text-base font-medium">Drop files here or click to upload</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload high-quality photos and videos of your property
                    </p>
                    <Button variant="secondary" size="sm" className="mt-4">
                      Select Files
                    </Button>
                  </div>
                </div>
                
                {/* Photo previews would go here */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Example previews */}
                  <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Image className="h-8 w-8" />
                    </div>
                    <Button size="sm" variant="destructive" className="absolute top-1 right-1 h-6 w-6 p-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step 4: Write Your Property Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Describe your property's key features, unique selling points, and what makes it special..."
                  className="min-h-32"
                  value={sellerInfo.propertyDetails?.description || ''}
                  onChange={(e) => setSellerInfo({
                    ...sellerInfo, 
                    propertyDetails: {
                      ...sellerInfo.propertyDetails!,
                      description: e.target.value
                    }
                  })}
                />
                <Button variant="outline" size="sm">
                  Get AI Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePreviousStep}>
              Previous
            </Button>
            <Button onClick={handleNextStep}>
              Next: Set Your Price & Strategy
            </Button>
          </div>
        </div>
      )}
      
      {currentStep === 'price-strategy' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI-Powered Comparable Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-2 text-left">Address</th>
                      <th className="px-4 py-2 text-right">Sale Price</th>
                      <th className="px-4 py-2 text-right">Size</th>
                      <th className="px-4 py-2 text-right">Beds/Baths</th>
                      <th className="px-4 py-2 text-right">Days on Market</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample data - would be populated dynamically */}
                    <tr className="border-b">
                      <td className="px-4 py-3">123 Main St</td>
                      <td className="px-4 py-3 text-right">$425,000</td>
                      <td className="px-4 py-3 text-right">1,850 sq ft</td>
                      <td className="px-4 py-3 text-right">3 / 2</td>
                      <td className="px-4 py-3 text-right">45</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">456 Oak Ave</td>
                      <td className="px-4 py-3 text-right">$399,000</td>
                      <td className="px-4 py-3 text-right">1,750 sq ft</td>
                      <td className="px-4 py-3 text-right">3 / 2</td>
                      <td className="px-4 py-3 text-right">62</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3">789 Pine St</td>
                      <td className="px-4 py-3 text-right">$450,000</td>
                      <td className="px-4 py-3 text-right">1,950 sq ft</td>
                      <td className="px-4 py-3 text-right">4 / 2.5</td>
                      <td className="px-4 py-3 text-right">30</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Set Your Listing Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between">
                    <Label>Price Range</Label>
                    <div className="text-right">
                      <span className="text-sm font-medium">${sellerInfo.listingPrice || 400000}</span>
                    </div>
                  </div>
                  <Slider 
                    defaultValue={[sellerInfo.listingPrice || 400000]} 
                    max={600000} 
                    min={300000} 
                    step={5000}
                    onValueChange={(value) => setSellerInfo({...sellerInfo, listingPrice: value[0]})}
                  />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>$300,000</span>
                    <span>$600,000</span>
                  </div>
                  <div className="mt-2 bg-primary/10 p-3 rounded-md border border-primary/20">
                    <div className="flex items-center">
                      <Calculator className="h-5 w-5 text-primary mr-2" />
                      <span className="text-sm">AI Recommended Price: <span className="font-medium">$425,000</span></span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="urgency-select">Urgency to Sell</Label>
                    <Select 
                      value={sellerInfo.urgency} 
                      onValueChange={(value) => setSellerInfo({...sellerInfo, urgency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your urgency level" />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="reason-select">Reason for Selling</Label>
                    <Select 
                      value={sellerInfo.reasonForSelling} 
                      onValueChange={(value) => setSellerInfo({...sellerInfo, reasonForSelling: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {sellingReasons.map((reason) => (
                          <SelectItem key={reason.id} value={reason.id}>{reason.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Card className="bg-muted/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Market Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Likelihood to Sell</span>
                        <Badge className="bg-green-500">High</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Estimated Time to Sell</span>
                        <span className="text-sm font-medium">30-60 days</span>
                      </div>
                      <div>
                        <span className="text-sm">Considerations</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Properties in your area are selling quickly. Your price point is competitive for homes with similar features. Consider emphasizing your updated kitchen in marketing materials.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePreviousStep}>
              Previous
            </Button>
            <Button onClick={handleNextStep}>
              Review & Publish
            </Button>
          </div>
        </div>
      )}
      
      {currentStep === 'review' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Your Listing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Property Details</h4>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Property Type</span>
                        <p>{propertyTypes.find(t => t.id === sellerInfo.propertyType)?.label || "Not specified"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Size</span>
                        <p>{sellerInfo.propertySize || "Not specified"} sq ft</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Bedrooms</span>
                        <p>{sellerInfo.bedrooms || "Not specified"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Bathrooms</span>
                        <p>{sellerInfo.bathrooms || "Not specified"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-sm text-muted-foreground">Location</span>
                        <p>{sellerInfo.location || "Not specified"}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => onStepChange('situation')}>
                      Edit
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Features & Amenities</h4>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {(sellerInfo.features?.length || 0) > 0 ? (
                        sellerInfo.features?.map(featureId => {
                          const feature = propertyFeatures.find(f => f.id === featureId);
                          return feature ? (
                            <Badge key={feature.id} variant="secondary" className="flex items-center gap-1">
                              {feature.icon}
                              <span>{feature.label}</span>
                            </Badge>
                          ) : null;
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground">No features selected</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => onStepChange('property-profile')}>
                      Edit
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Price & Strategy</h4>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Listing Price</span>
                        <p className="font-medium">${sellerInfo.listingPrice?.toLocaleString() || "Not set"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Urgency</span>
                        <p>{urgencyOptions.find(o => o.id === sellerInfo.urgency)?.label || "Not specified"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Reason for Selling</span>
                        <p>{sellingReasons.find(r => r.id === sellerInfo.reasonForSelling)?.label || "Not specified"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Timeframe</span>
                        <p>{timeframeOptions.find(t => t.id === sellerInfo.timeframe)?.label || "Not specified"}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => onStepChange('price-strategy')}>
                      Edit
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Selected Services</h4>
                  <div className="bg-muted/30 p-4 rounded-md">
                    {(sellerInfo.selectedServices?.length || 0) > 0 ? (
                      <div className="space-y-3">
                        {sellerInfo.selectedServices?.map(serviceId => {
                          const service = availableServices.find(s => s.id === serviceId);
                          return service ? (
                            <div key={service.id} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="bg-primary/10 p-1 rounded-full text-primary">
                                  {service.icon}
                                </div>
                                <span>{service.name}</span>
                              </div>
                              <span>${service.price}</span>
                            </div>
                          ) : null;
                        })}
                        <div className="border-t pt-2 flex justify-between font-medium">
                          <span>Total</span>
                          <span>${calculateServiceTotal()}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No services selected</p>
                    )}
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => onStepChange('services')}>
                      Edit
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms"
                    checked={sellerInfo.termsAccepted}
                    onCheckedChange={(checked) => 
                      setSellerInfo({...sellerInfo, termsAccepted: checked === true})
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label 
                      htmlFor="terms" 
                      className="text-sm font-normal leading-snug"
                    >
                      I agree to the Terms and Conditions and confirm that the information provided is accurate.
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePreviousStep}>
              Previous
            </Button>
            <div className="space-x-3">
              <Button variant="outline">
                Save as Draft
              </Button>
              <Button 
                disabled={!sellerInfo.termsAccepted}
                onClick={onComplete}
              >
                Publish Your Listing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Define steps array for reference in the component
const steps: SellerStep[] = ['intent', 'situation', 'services', 'property-profile', 'price-strategy', 'review'];