import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Camera, 
  Upload, 
  Clock, 
  MapPin, 
  Home, 
  Car, 
  Building, 
  ParkingCircle,
  Trees,
  Wifi,
  Building2,
  Utensils,
  BookOpen,
  Briefcase,
  ShoppingBag,
  X,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup } from "@/components/ui/radio-group";

interface AiStyleSearchProps {
  onSearchComplete?: (results: any[]) => void;
}

export default function AiStyleSearch({ onSearchComplete }: AiStyleSearchProps): JSX.Element {
  const [searchStep, setSearchStep] = useState<number>(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);
  const [preferences, setPreferences] = useState({
    style: "",
    features: [] as string[],
    keywords: "",
    commute: {
      workLocation: "",
      maxTime: 30,
      transportation: "car"
    },
    budget: {
      min: 100000,
      max: 1000000
    },
    location: "",
    propertyType: "house",
    bedrooms: 3,
    bathrooms: 2
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setImagePreview(event.target.result);
        // Add to inspiration images array
        setInspirationImages(prev => [...prev, event.target?.result as string]);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setInspirationImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFeatureToggle = (feature: string) => {
    setPreferences(prev => {
      const features = [...prev.features];
      if (features.includes(feature)) {
        return { 
          ...prev, 
          features: features.filter(f => f !== feature) 
        };
      } else {
        return { 
          ...prev, 
          features: [...features, feature] 
        };
      }
    });
  };

  const nextStep = () => {
    if (searchStep < 4) {
      setSearchStep(prev => prev + 1);
    } else {
      // Start AI processing
      processAiSearch();
    }
  };

  const prevStep = () => {
    if (searchStep > 1) {
      setSearchStep(prev => prev - 1);
    }
  };

  const processAiSearch = async () => {
    setIsProcessing(true);
    
    // Show progress indication
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + 5, 95); // Cap at 95% until real results
      setProcessingProgress(progress);
    }, 150);
    
    try {
      // Prepare the search query payload
      const searchQuery = {
        inspirationImages: inspirationImages,
        stylePreferences: {
          style: preferences.style,
          features: preferences.features
        },
        keywords: preferences.keywords,
        locationPreferences: {
          location: preferences.location,
          commuteDestination: preferences.commute.workLocation,
          maxCommuteTime: preferences.commute.maxTime,
          transportationMode: preferences.commute.transportation as 'car' | 'transit' | 'bike' | 'walk'
        },
        propertyRequirements: {
          minPrice: preferences.budget.min,
          maxPrice: preferences.budget.max,
          propertyType: preferences.propertyType,
          minBedrooms: preferences.bedrooms,
          minBathrooms: preferences.bathrooms
        }
      };
      
      // Make the API call
      const response = await fetch('/api/ai/property-style-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchQuery)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Complete the progress indication
      clearInterval(interval);
      setProcessingProgress(100);
      
      // Update state with the actual results
      setSearchResults(data.properties || []);
      
      // Notify parent component if callback provided
      if (onSearchComplete) {
        onSearchComplete(data.properties || []);
      }
    } catch (error) {
      console.error("Error during AI property search:", error);
      // Show error message to user (could use a toast notification)
    } finally {
      clearInterval(interval);
      setProcessingProgress(100);
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">AI-Powered Property Search</h2>
        <p className="text-gray-600 mb-6">
          Let our AI find your dream home based on your style preferences and practical needs.
        </p>

        {/* Progress Bar */}
        <div className="w-full mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Step {searchStep} of 4</span>
            <span className="text-sm font-medium">{(searchStep / 4) * 100}%</span>
          </div>
          <Progress value={(searchStep / 4) * 100} className="h-2" />
        </div>

        {/* Step 1: Style Inspiration */}
        {searchStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Step 1: Add Style Inspiration</h3>
            <p className="text-gray-600">
              Upload photos of homes that match your style preferences. Our AI will analyze them to understand your aesthetic taste.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Upload Button */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-48 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 text-center">
                  Click to upload an image
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
              </div>
              
              {/* Uploaded Images */}
              {inspirationImages.map((img, index) => (
                <div key={index} className="relative group h-48 rounded-lg overflow-hidden">
                  <img 
                    src={img} 
                    alt={`Inspiration ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Label className="text-base">What architectural style do you prefer?</Label>
              <Select 
                value={preferences.style}
                onValueChange={(value) => setPreferences({...preferences, style: value})}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="contemporary">Contemporary</SelectItem>
                  <SelectItem value="farmhouse">Farmhouse</SelectItem>
                  <SelectItem value="colonial">Colonial</SelectItem>
                  <SelectItem value="craftsman">Craftsman</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="mid-century">Mid-Century Modern</SelectItem>
                  <SelectItem value="victorian">Victorian</SelectItem>
                  <SelectItem value="ranch">Ranch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Property Features */}
        {searchStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Step 2: Must-Have Features</h3>
            <p className="text-gray-600">
              Select the features that are most important to you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label className="text-base">Property Type</Label>
                <Select 
                  value={preferences.propertyType}
                  onValueChange={(value) => setPreferences({...preferences, propertyType: value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base">Bedrooms</Label>
                <Select 
                  value={preferences.bedrooms.toString()}
                  onValueChange={(value) => setPreferences({...preferences, bedrooms: parseInt(value)})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Bedroom</SelectItem>
                    <SelectItem value="2">2 Bedrooms</SelectItem>
                    <SelectItem value="3">3 Bedrooms</SelectItem>
                    <SelectItem value="4">4 Bedrooms</SelectItem>
                    <SelectItem value="5">5+ Bedrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base">Bathrooms</Label>
                <Select 
                  value={preferences.bathrooms.toString()}
                  onValueChange={(value) => setPreferences({...preferences, bathrooms: parseFloat(value)})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Bathrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Bathroom</SelectItem>
                    <SelectItem value="1.5">1.5 Bathrooms</SelectItem>
                    <SelectItem value="2">2 Bathrooms</SelectItem>
                    <SelectItem value="2.5">2.5 Bathrooms</SelectItem>
                    <SelectItem value="3">3 Bathrooms</SelectItem>
                    <SelectItem value="3.5">3.5+ Bathrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-6">
              <Label className="text-base mb-3 block">Must-Have Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="feature-garage" 
                    checked={preferences.features.includes('garage')} 
                    onCheckedChange={() => handleFeatureToggle('garage')}
                  />
                  <label htmlFor="feature-garage" className="text-sm font-medium leading-none cursor-pointer">
                    Garage/Parking
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="feature-garden" 
                    checked={preferences.features.includes('garden')} 
                    onCheckedChange={() => handleFeatureToggle('garden')}
                  />
                  <label htmlFor="feature-garden" className="text-sm font-medium leading-none cursor-pointer">
                    Garden/Yard
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="feature-pool" 
                    checked={preferences.features.includes('pool')} 
                    onCheckedChange={() => handleFeatureToggle('pool')}
                  />
                  <label htmlFor="feature-pool" className="text-sm font-medium leading-none cursor-pointer">
                    Swimming Pool
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="feature-ac" 
                    checked={preferences.features.includes('ac')} 
                    onCheckedChange={() => handleFeatureToggle('ac')}
                  />
                  <label htmlFor="feature-ac" className="text-sm font-medium leading-none cursor-pointer">
                    Air Conditioning
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="feature-fireplace" 
                    checked={preferences.features.includes('fireplace')} 
                    onCheckedChange={() => handleFeatureToggle('fireplace')}
                  />
                  <label htmlFor="feature-fireplace" className="text-sm font-medium leading-none cursor-pointer">
                    Fireplace
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="feature-balcony" 
                    checked={preferences.features.includes('balcony')} 
                    onCheckedChange={() => handleFeatureToggle('balcony')}
                  />
                  <label htmlFor="feature-balcony" className="text-sm font-medium leading-none cursor-pointer">
                    Balcony/Terrace
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="feature-basement" 
                    checked={preferences.features.includes('basement')} 
                    onCheckedChange={() => handleFeatureToggle('basement')}
                  />
                  <label htmlFor="feature-basement" className="text-sm font-medium leading-none cursor-pointer">
                    Basement
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="feature-view" 
                    checked={preferences.features.includes('view')} 
                    onCheckedChange={() => handleFeatureToggle('view')}
                  />
                  <label htmlFor="feature-view" className="text-sm font-medium leading-none cursor-pointer">
                    Great View
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="feature-security" 
                    checked={preferences.features.includes('security')} 
                    onCheckedChange={() => handleFeatureToggle('security')}
                  />
                  <label htmlFor="feature-security" className="text-sm font-medium leading-none cursor-pointer">
                    Security System
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Budget and Location */}
        {searchStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Step 3: Budget & Location</h3>
            <p className="text-gray-600">
              Define your budget range and preferred location.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base">Price Range</Label>
                <div className="mt-6 px-2">
                  <div className="flex justify-between text-sm mb-3">
                    <span>${preferences.budget.min.toLocaleString()}</span>
                    <span>${preferences.budget.max.toLocaleString()}</span>
                  </div>
                  <Slider 
                    defaultValue={[preferences.budget.min, preferences.budget.max]} 
                    min={50000} 
                    max={2000000} 
                    step={10000}
                    onValueChange={(values) => {
                      setPreferences({
                        ...preferences, 
                        budget: {min: values[0], max: values[1]}
                      });
                    }}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Label className="text-base">Preferred Location</Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Enter city, neighborhood, or ZIP code" 
                    className="pl-10"
                    value={preferences.location}
                    onChange={(e) => setPreferences({...preferences, location: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Label className="text-base">Keyword Search</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Enter keywords (e.g., renovated, views, open floor plan)" 
                    className="pl-10"
                    value={preferences.keywords}
                    onChange={(e) => setPreferences({...preferences, keywords: e.target.value})}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add specific terms to find properties with features that match your needs
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Commute Preferences */}
        {searchStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Step 4: Commute Preferences</h3>
            <p className="text-gray-600">
              Tell us about your daily commute to help find properties with convenient access to your workplace.
            </p>
            
            <div className="space-y-4">
              <div className="relative">
                <Label className="text-base">Work or School Location</Label>
                <div className="relative mt-2">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Enter work/school address" 
                    className="pl-10"
                    value={preferences.commute.workLocation}
                    onChange={(e) => setPreferences({
                      ...preferences, 
                      commute: {
                        ...preferences.commute,
                        workLocation: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-base">Maximum Commute Time</Label>
                <div className="mt-6 px-2">
                  <div className="flex justify-between text-sm mb-3">
                    <span>{preferences.commute.maxTime} minutes</span>
                  </div>
                  <Slider 
                    defaultValue={[preferences.commute.maxTime]} 
                    min={5} 
                    max={120} 
                    step={5}
                    onValueChange={(values) => {
                      setPreferences({
                        ...preferences, 
                        commute: {
                          ...preferences.commute,
                          maxTime: values[0]
                        }
                      });
                    }}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Label className="text-base mb-3 block">Transportation Method</Label>
                <RadioGroup 
                  defaultValue={preferences.commute.transportation}
                  onValueChange={(value) => setPreferences({
                    ...preferences, 
                    commute: {
                      ...preferences.commute,
                      transportation: value
                    }
                  })}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center">
                      <label htmlFor="transport-car" className="text-sm font-medium leading-none cursor-pointer flex items-center">
                        <Car className="h-4 w-4 mr-1" /> Car
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <label htmlFor="transport-transit" className="text-sm font-medium leading-none cursor-pointer flex items-center">
                        <Building2 className="h-4 w-4 mr-1" /> Public Transit
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <label htmlFor="transport-bike" className="text-sm font-medium leading-none cursor-pointer">
                        Bike
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <label htmlFor="transport-walk" className="text-sm font-medium leading-none cursor-pointer">
                        Walking
                      </label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        {/* Processing Dialog */}
        <Dialog open={isProcessing} onOpenChange={(open) => {
          if (!open) setIsProcessing(false);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Processing Your Search</DialogTitle>
              <DialogDescription>
                Our AI is analyzing your preferences and searching for perfect matches...
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <Progress value={processingProgress} className="h-2 mb-4" />
              <p className="text-sm text-gray-500 text-center">
                {processingProgress < 25 && "Analyzing style preferences..."}
                {processingProgress >= 25 && processingProgress < 50 && "Matching with property database..."}
                {processingProgress >= 50 && processingProgress < 75 && "Calculating commute times..."}
                {processingProgress >= 75 && processingProgress < 100 && "Finalizing recommendations..."}
                {processingProgress >= 100 && "Almost done!"}
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Results Display */}
        {searchResults.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">AI-Recommended Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((property, index) => (
                <Card key={index} className="overflow-hidden h-full flex flex-col">
                  <div className="relative h-48">
                    <img 
                      src={property.images[0]} 
                      alt={property.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-600 hover:bg-green-700">
                        {property.styleMatch}% Style Match
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-blue-600 hover:bg-blue-700">
                        {property.commuteTime} min commute
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 flex-grow flex flex-col">
                    <h4 className="font-semibold text-lg mb-1">{property.title}</h4>
                    <p className="text-gray-500 mb-2">{property.address}</p>
                    <p className="font-bold text-xl mb-3">${property.price.toLocaleString()}</p>
                    <div className="flex gap-4 mb-3 text-sm text-gray-600">
                      <span>{property.bedrooms} beds</span>
                      <span>{property.bathrooms} baths</span>
                      <span>{property.sqft.toLocaleString()} sqft</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{property.description}</p>
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {property.features.slice(0, 3).map((feature: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {property.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <Button className="w-full" variant="outline">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={searchStep === 1}
          >
            Back
          </Button>
          <Button 
            onClick={nextStep}
            disabled={searchStep === 1 && inspirationImages.length === 0}
          >
            {searchStep < 4 ? "Continue" : "Find My Dream Home"}
          </Button>
        </div>
      </div>
    </div>
  );
};