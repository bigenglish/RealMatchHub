import { useState, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Check, Home, Building, Users, Briefcase, Sparkles, ChevronsRight, 
  CalendarDays, MapPin, Search, Camera, Upload, Image, X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Autosuggest from "react-autosuggest";

export type UserIntent = "buying" | "selling" | "both" | undefined;
export type UserLifestage = "flexible-move" | "job-received" | "live-alone" | "own-home" | "have-children" | "life-change" | 
                            "flexible-downpayment" | "sold-property" | "self-employed" | "small-business" | "life-questions";
export type TimelineOption = "asap" | "1-3months" | "3-6months" | "6-12months";

export interface UserPreferences {
  intent?: UserIntent;
  lifestage?: UserLifestage[];
  budget?: {
    min: number;
    max: number;
  };
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  mustHaveFeatures?: string[];
  timeframe?: TimelineOption;
  inspirationPhotos?: string[]; // Base64 encoded image data
  inspirationUrls?: string[]; // URLs to inspiration listings
}

interface PropertyQuestionnaireProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip?: () => void;
}

export default function PropertyQuestionnaire({ onComplete, onSkip }: PropertyQuestionnaireProps) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    intent: undefined,
    lifestage: [],
    budget: {
      min: 200000,
      max: 750000,
    },
    location: "",
    propertyType: "",
    bedrooms: 0,
    bathrooms: 0,
    mustHaveFeatures: [],
    timeframe: "3-6months",
    inspirationPhotos: [],
    inspirationUrls: [],
  });
  
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Location search states for autosuggest
  const [locationValue, setLocationValue] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  
  // Popular cities for suggestions
  const popularCities = [
    "San Francisco, CA", 
    "San Jose, CA", 
    "San Diego, CA",
    "Santa Monica, CA", 
    "Santa Barbara, CA",
    "New York, NY", 
    "Los Angeles, CA", 
    "Chicago, IL", 
    "Houston, TX", 
    "Phoenix, AZ",
    "Philadelphia, PA", 
    "Austin, TX", 
    "Seattle, WA", 
    "Boston, MA",
    "Miami, FL",
    "Dallas, TX",
    "Denver, CO",
    "Portland, OR",
    "Las Vegas, NV",
    "Atlanta, GA"
  ];
  
  // Property types for dropdown
  const propertyTypes = [
    "Single Family Home",
    "Condo",
    "Townhouse",
    "Multi-Family",
    "Land",
    "Apartment"
  ];
  
  // Timeline options mapping
  const timelineOptions = [
    { value: "asap", label: "ASAP (ready to move)" },
    { value: "1-3months", label: "1-3 months (begin making offers)" },
    { value: "3-6months", label: "3-6 months (start my search)" },
    { value: "6-12months", label: "6-12 months (early in the process)" }
  ];
  
  const totalSteps = 5; // Increased steps to add inspiration photos step
  const progress = Math.round((step / totalSteps) * 100);
  
  const handleIntentSelect = (intent: UserIntent) => {
    setPreferences({ ...preferences, intent });
    setStep(2);
  };
  
  const handleLifestageSelect = (lifestage: UserLifestage) => {
    const current = preferences.lifestage || [];
    const updated = current.includes(lifestage)
      ? current.filter(item => item !== lifestage)
      : [...current, lifestage];
    
    setPreferences({ ...preferences, lifestage: updated });
  };
  
  const isLifestageSelected = (lifestage: UserLifestage) => {
    return preferences.lifestage?.includes(lifestage) || false;
  };
  
  // Handle location suggestions
  const getSuggestions = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    
    return inputLength === 0 
      ? [] 
      : popularCities.filter(city => 
          city.toLowerCase().includes(inputValue)
        );
  };
  
  // When suggestion is selected
  const onLocationSuggestionSelected = (event: React.FormEvent<HTMLElement>, { suggestion }: { suggestion: string }) => {
    setLocationValue(suggestion);
    setPreferences({ ...preferences, location: suggestion });
  };
  
  // Get suggestion value
  const getSuggestionValue = (suggestion: string) => suggestion;
  
  // Render suggestion
  const renderSuggestion = (suggestion: string) => (
    <div className="p-2 hover:bg-muted cursor-pointer">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        {suggestion}
      </div>
    </div>
  );
  
  // Input props for autosuggest
  const inputProps = {
    placeholder: preferences.intent === "selling" ? "Enter your property address" : "Where are you looking to buy?",
    value: locationValue,
    onChange: (_: React.FormEvent<HTMLElement>, { newValue }: { newValue: string }) => {
      setLocationValue(newValue);
      setPreferences({ ...preferences, location: newValue });
    },
    className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  };
  
  // Handle property type change
  const handlePropertyTypeChange = (value: string) => {
    setPreferences({ ...preferences, propertyType: value });
  };
  
  // Handle timeline selection
  const handleTimelineChange = (value: TimelineOption) => {
    setPreferences({ ...preferences, timeframe: value });
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const newPhotos = [...(preferences.inspirationPhotos || []), event.target.result];
        setPreferences({ ...preferences, inspirationPhotos: newPhotos });
      }
    };
    
    reader.readAsDataURL(file);
    
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove inspiration photo
  const removeInspirationPhoto = (index: number) => {
    const photos = [...(preferences.inspirationPhotos || [])];
    photos.splice(index, 1);
    setPreferences({ ...preferences, inspirationPhotos: photos });
  };
  
  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">
          Tell us about you — we'll recommend the right solution.
        </h2>
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Step {step} of {totalSteps}
          </p>
        </div>
      </div>
      
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">What are you looking to do?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`p-6 cursor-pointer hover:border-primary hover:shadow-md transition-all ${
                preferences.intent === "buying" ? "bg-primary/10 border-primary" : ""
              }`}
              onClick={() => handleIntentSelect("buying")}
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
                preferences.intent === "selling" ? "bg-primary/10 border-primary" : ""
              }`}
              onClick={() => handleIntentSelect("selling")}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <Building className="h-10 w-10 text-primary" />
                <h4 className="font-semibold text-lg">Sell a property</h4>
                <p className="text-sm text-muted-foreground">
                  I want to sell my current property
                </p>
              </div>
            </Card>
            
            <Card 
              className={`p-6 cursor-pointer hover:border-primary hover:shadow-md transition-all ${
                preferences.intent === "both" ? "bg-primary/10 border-primary" : ""
              }`}
              onClick={() => handleIntentSelect("both")}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <Sparkles className="h-10 w-10 text-primary" />
                <h4 className="font-semibold text-lg">Both</h4>
                <p className="text-sm text-muted-foreground">
                  I'm looking to sell my current property and buy a new one
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-center">Tell us about your situation</h3>
          <p className="text-center text-muted-foreground">Select all that apply to you</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <LifestageCard 
              icon={<Users className="h-6 w-6" />}
              title="I'm flexible on when I move"
              value="flexible-move"
              selected={isLifestageSelected("flexible-move")}
              onClick={() => handleLifestageSelect("flexible-move")}
            />
            
            <LifestageCard 
              icon={<Briefcase className="h-6 w-6" />}
              title="I have a job (received W-2)"
              value="job-received"
              selected={isLifestageSelected("job-received")}
              onClick={() => handleLifestageSelect("job-received")}
            />
            
            <LifestageCard 
              icon={<Users className="h-6 w-6" />}
              title="I live alone"
              value="live-alone"
              selected={isLifestageSelected("live-alone")}
              onClick={() => handleLifestageSelect("live-alone")}
            />
            
            <LifestageCard 
              icon={<Home className="h-6 w-6" />}
              title="I own a home"
              value="own-home"
              selected={isLifestageSelected("own-home")}
              onClick={() => handleLifestageSelect("own-home")}
            />
            
            <LifestageCard 
              icon={<Users className="h-6 w-6" />}
              title="I have children or dependents"
              value="have-children"
              selected={isLifestageSelected("have-children")}
              onClick={() => handleLifestageSelect("have-children")}
            />
            
            <LifestageCard 
              icon={<Sparkles className="h-6 w-6" />}
              title="Expecting a change in major life event"
              value="life-change"
              selected={isLifestageSelected("life-change")}
              onClick={() => handleLifestageSelect("life-change")}
            />
            
            <LifestageCard 
              icon={<Building className="h-6 w-6" />}
              title="I'm flexible on downpayment"
              value="flexible-downpayment"
              selected={isLifestageSelected("flexible-downpayment")}
              onClick={() => handleLifestageSelect("flexible-downpayment")}
            />
            
            <LifestageCard 
              icon={<Building className="h-6 w-6" />}
              title="I sold stock or own rental property"
              value="sold-property"
              selected={isLifestageSelected("sold-property")}
              onClick={() => handleLifestageSelect("sold-property")}
            />
            
            <LifestageCard 
              icon={<Briefcase className="h-6 w-6" />}
              title="I'm self-employed/freelancer"
              value="self-employed"
              selected={isLifestageSelected("self-employed")}
              onClick={() => handleLifestageSelect("self-employed")}
            />
            
            <LifestageCard 
              icon={<Building className="h-6 w-6" />}
              title="I own a small business"
              value="small-business"
              selected={isLifestageSelected("small-business")}
              onClick={() => handleLifestageSelect("small-business")}
            />
            
            <LifestageCard 
              icon={<Sparkles className="h-6 w-6" />}
              title="My life has changed and I have questions"
              value="life-questions"
              selected={isLifestageSelected("life-questions")}
              onClick={() => handleLifestageSelect("life-questions")}
            />
          </div>
          
          <div className="flex justify-center pt-4">
            <Button onClick={handleNextStep}>
              Continue
              <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center">
            {preferences.intent === "buying" && "Where are you looking to buy?"}
            {preferences.intent === "selling" && "Tell us about your property"}
            {preferences.intent === "both" && "Tell us more about your real estate plans"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="font-semibold">
                  {preferences.intent === "selling" ? "Property Address" : "Location"}
                </Label>
                <div className="relative">
                  <Autosuggest
                    suggestions={locationSuggestions}
                    onSuggestionsFetchRequested={({ value }) => setLocationSuggestions(getSuggestions(value))}
                    onSuggestionsClearRequested={() => setLocationSuggestions([])}
                    onSuggestionSelected={onLocationSuggestionSelected}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    inputProps={inputProps}
                    theme={{
                      container: 'relative',
                      input: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                      suggestionsContainer: 'absolute w-full z-10 mt-1 bg-background rounded-md shadow-lg',
                      suggestionsList: 'max-h-72 overflow-auto py-1 text-sm',
                      suggestion: 'px-2 py-1',
                      suggestionHighlighted: 'bg-muted',
                    }}
                  />
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="property-type" className="font-semibold">Property Type</Label>
                <Select 
                  value={preferences.propertyType || undefined} 
                  onValueChange={handlePropertyTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timeline" className="font-semibold">When are you planning to {preferences.intent === "buying" ? "buy" : 
                preferences.intent === "selling" ? "sell" : "move"}?</Label>
                <Select 
                  value={preferences.timeframe || "3-6months"} 
                  onValueChange={handleTimelineChange as any}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    {timelineOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bedrooms" className="font-semibold">Bedrooms</Label>
                <Select 
                  value={preferences.bedrooms?.toString() || "0"} 
                  onValueChange={(val) => setPreferences({ ...preferences, bedrooms: parseInt(val) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Go Back
            </Button>
            <Button onClick={handleNextStep}>
              Continue
              <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center">
            {preferences.intent === "buying" && "Share your style inspiration"}
            {preferences.intent === "selling" && "Add photos of your property"}
            {preferences.intent === "both" && "Share your style preferences"}
          </h3>
          <p className="text-center text-muted-foreground">
            {preferences.intent === "buying" && "Upload photos of homes you love to help our AI find properties that match your style."}
            {preferences.intent === "selling" && "Upload photos of your property to help us assess its style and features."}
            {preferences.intent === "both" && "Upload photos of homes you love to help our AI find properties that match your style."}
          </p>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Upload Button */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center h-48 cursor-pointer hover:border-primary transition-colors"
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
              {(preferences.inspirationPhotos || []).map((img, index) => (
                <div key={index} className="relative group h-48 rounded-lg overflow-hidden border border-gray-200">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        removeInspirationPhoto(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              {preferences.intent === "buying" && "Upload photos of homes, interiors, or architectural styles you love."}
              {preferences.intent === "selling" && "Upload photos of your property's exterior and interior spaces."}
              {preferences.intent === "both" && "Upload photos of homes, interiors, or architectural styles you love."}
            </div>
          </div>
          
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Go Back
            </Button>
            <Button onClick={handleNextStep}>
              {(preferences.inspirationPhotos || []).length > 0 ? "Continue" : "Skip this step"}
              <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {step === 5 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center">Ready to find your perfect match!</h3>
          <p className="text-center text-muted-foreground">
            {preferences.intent === "buying" && "We've prepared specialized property recommendations based on your needs."}
            {preferences.intent === "selling" && "We've prepared specialized services to help you sell your property."}
            {preferences.intent === "both" && "We've prepared a comprehensive plan to help you both sell and buy."}
          </p>
          
          <div className="bg-muted p-6 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="font-semibold">You are looking to:</span>
                <span>
                  {preferences.intent === "buying" && "Buy a property"}
                  {preferences.intent === "selling" && "Sell a property"}
                  {preferences.intent === "both" && "Buy and sell properties"}
                </span>
              </div>
              
              {preferences.lifestage && preferences.lifestage.length > 0 && (
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <div>
                    <span className="font-semibold">Your situation: </span>
                    <span>
                      {preferences.lifestage.map((stage, index) => (
                        <span key={stage}>
                          {formatLifestage(stage)}
                          {index < preferences.lifestage!.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              )}
              
              {preferences.location && (
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Location: </span>
                  <span>{preferences.location}</span>
                </div>
              )}
              
              {preferences.propertyType && (
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Property type: </span>
                  <span>{preferences.propertyType}</span>
                </div>
              )}
              
              {preferences.timeframe && (
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Timeline: </span>
                  <span>
                    {timelineOptions.find(option => option.value === preferences.timeframe)?.label || preferences.timeframe}
                  </span>
                </div>
              )}
              
              {preferences.inspirationPhotos && preferences.inspirationPhotos.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Style Inspiration Photos: </span>
                    <span>{preferences.inspirationPhotos.length} photos uploaded</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {preferences.inspirationPhotos.map((photo, index) => (
                      <div key={index} className="rounded-md overflow-hidden h-20 border border-gray-200">
                        <img 
                          src={photo} 
                          alt={`Inspiration ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Go Back
            </Button>
            <Button onClick={() => onComplete(preferences)}>
              Find Properties
              <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <Button variant="ghost" onClick={onSkip}>
          Skip and continue to all properties
        </Button>
      </div>
    </div>
  );
}

interface LifestageCardProps {
  icon: React.ReactNode;
  title: string;
  value: UserLifestage;
  selected: boolean;
  onClick: () => void;
}

function LifestageCard({ icon, title, selected, onClick }: LifestageCardProps) {
  return (
    <Card 
      className={`p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all ${
        selected ? "bg-primary/10 border-primary" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={`${selected ? "text-primary" : "text-muted-foreground"}`}>
          {icon}
        </div>
        <div className="text-sm font-medium">{title}</div>
        {selected && <Check className="h-4 w-4 ml-auto text-primary" />}
      </div>
    </Card>
  );
}

function formatLifestage(stage: UserLifestage): string {
  const map: Record<UserLifestage, string> = {
    "flexible-move": "Flexible on move timing",
    "job-received": "Have a W-2 job",
    "live-alone": "Live alone",
    "own-home": "Own a home",
    "have-children": "Have children/dependents",
    "life-change": "Expecting life changes",
    "flexible-downpayment": "Flexible on downpayment",
    "sold-property": "Sold property/stocks",
    "self-employed": "Self-employed",
    "small-business": "Small business owner",
    "life-questions": "Have life situation questions"
  };
  
  return map[stage] || stage;
}