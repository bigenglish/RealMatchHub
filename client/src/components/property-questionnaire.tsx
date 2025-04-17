import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  Check, Home, Building, ChevronsRight, CalendarDays, MapPin, Search, 
  Camera, Upload, Image, X, Wallet, Calculator, Shield, Key, Ruler,
  Bed, Bath, CheckSquare, Clock, MoveVertical, TrendingUp, DollarSign,
  Package, Calendar, SplitSquareVertical, Square, Hammer, Palmtree, 
  Mountain, Landmark, Sofa, Armchair, Factory, Waves, Leaf, Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea"; // Added import for Textarea
import Autosuggest from "react-autosuggest";
import {Tooltip, TooltipTrigger, TooltipContent} from '@radix-ui/react-tooltip';
import { Badge } from "@/components/ui/badge";
import { analyzeImageUpload, analyzeImageUrl } from "./vision-api-client";

export type UserIntent = "buying" | "selling" | "both" | undefined;
export type UserLifestage = "down-payment" | "need-mortgage" | "pre-approve" | "insurance-quotes" | "renovation-plans" |
                           "property-type" | "property-size" | "bedrooms" | "bathrooms" | "property-media" | "property-features" |
                           "property-location" | "timeframe" | "sell-urgency" | "relocating" | "size-change" | "financial-reasons" |
                           "moving-services" | "buy-after-sell" | "flexible-move" | "job-received" | "live-alone" | "own-home" |
                           "have-children" | "life-change" | "flexible-downpayment" | "sold-property" | "self-employed" | 
                           "small-business" | "life-questions";
export type TimelineOption = "asap" | "1-3months" | "3-6months" | "6-12months";

export interface UserPreferences {
  showingPreferences?: string[];
  marketingPreferences?: string[];
  professionalServices?: string[];
  utilities?: string[];
  communityFeatures?: string[];
  specialConsiderations?: string;
  intent?: UserIntent;
  lifestage?: UserLifestage[];
  budget?: {
    min: number;
    max: number;
  };
  insuranceOptions?: string[];
  renovationPlans?: string[];
  location?: string;
  propertyType?: string[];
  bedrooms?: number[];
  bathrooms?: number[];
  features?: string[];
  timelines?: TimelineOption[];
  sellReasons?: string[];
  movingServices?: string[];
  inspirationPhotos?: string[]; // Base64 encoded image data
  inspirationUrls?: string[]; // URLs to inspiration listings
  architecturalStyle?: string[];
  interiorStyle?: string[];
  designFeatures?: string[]; // Additional design features/preferences
  colorScheme?: string; // Color preferences
  propertyCondition?: "excellent" | "good" | "fair" | "needs-work"; // Added property condition
  yearBuilt?: string; // Added year built
  propertyFeatures?: string[]; // Added property features
  recentRenovations?: string; // Added recent renovations
  propertyMedia?: string[]; //Added property media
  sellReason?: string;
  sellingTimeline?: string;
  desiredPrice?: string;
  hasAgent?: boolean;
  agentName?: string;
  sellingPreferences?: string[];
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  contactMethod?: 'email' | 'phone';
  privacyAgreed?: boolean;
  downPayment?: number; // Added downPayment
  financingOptions?: string[]; // Added financingOptions
}

interface PropertyQuestionnaireProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip?: () => void;
}

export default function PropertyQuestionnaire({ onComplete, onSkip }: PropertyQuestionnaireProps) {
  // Load saved progress on initial render
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('questionnaire_step');
    return saved ? parseInt(saved) : 1;
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('questionnaire_preferences');
    return saved ? JSON.parse(saved) : {
      intent: undefined,
      lifestage: [],
      budget: {
        min: 200000,
        max: 750000,
      },
      location: "",
      propertyType: [],
      bedrooms: [],
      bathrooms: [],
      features: [],
      timelines: [],
      sellReasons: [],
      movingServices: [],
      inspirationPhotos: [],
      inspirationUrls: [],
      architecturalStyle: [],
      interiorStyle: [],
      designFeatures: [],
      colorScheme: "",
      propertyCondition: undefined, // Added initial value
      yearBuilt: '', // Added initial value
      propertyFeatures: [], // Added initial value
      recentRenovations: '', // Added initial value
      propertyMedia: [], //Added initial value
      sellReason: '',
      sellingTimeline: '',
      desiredPrice: '',
      hasAgent: false,
      agentName: '',
      sellingPreferences: [],
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      contactMethod: 'email',
      privacyAgreed: false,
      downPayment: 0, // Added initial value
      financingOptions: [] // Added initial value
    };
  });

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState(''); // State for URL input

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
    {id: 'single-family', label: "Single Family Home"},
    {id: 'condo', label: "Condo"},
    {id: 'townhouse', label: "Townhouse"},
    {id: 'multi-family', label: "Multi-Family"},
    {id: 'land', label: "Land"},
    {id: 'apartment', label: "Apartment"}
  ];

  // Bedroom options
  const bedroomOptions = [
    { id: 1, label: "1 Bedroom" },
    { id: 2, label: "2 Bedrooms" },
    { id: 3, label: "3 Bedrooms" },
    { id: 4, label: "4 Bedrooms" },
    { id: 5, label: "5+ Bedrooms" }
  ];

  // Bathroom options
  const bathroomOptions = [
    { id: 1, label: "1 Bathroom" },
    { id: 2, label: "2 Bathrooms" },
    { id: 3, label: "3 Bathrooms" },
    { id: 4, label: "4+ Bathrooms" }
  ];

  // Property features
  const propertyFeatures = [
    { id: 'pool', label: "Pool" },
    { id: 'garage', label: "Garage" },
    { id: 'yard', label: "Yard" },
    { id: 'balcony', label: "Balcony" },
    { id: 'fireplace', label: "Fireplace" },
    { id: 'updated-kitchen', label: "Updated Kitchen" },
    { id: 'updated-bathrooms', label: "Updated Bathrooms" }
  ];

  // Timeline options mapping
  interface TimelineOptionItem {
    id: TimelineOption;
    label: string;
  }

  const timelineOptions: TimelineOptionItem[] = [
    { id: 'asap', label: "ASAP (ready to move)" },
    { id: '1-3months', label: "1-3 months (begin making offers)" },
    { id: '3-6months', label: "3-6 months (start my search)" },
    { id: '6-12months', label: "6-12 months (early in the process)" }
  ];

  // Urgency reasons
  const urgencyReasons = [
    { id: 'relocating', label: "Relocating" },
    { id: 'new-job', label: "New Job" },
    { id: 'financial', label: "Financial Reasons" },
    { id: 'upgrade', label: "Upgrading/Downsizing" },
    { id: 'other', label: "Other" }
  ];

  // Moving services
  const movingServices = [
    { id: 'packing', label: "Packing Services" },
    { id: 'loading', label: "Loading/Unloading" },
    { id: 'transport', label: "Transportation" },
    { id: 'cleaning', label: "Cleaning Services" }
  ];


  const totalSteps = 7; // Increased steps to add additional seller flow pages
  const progress = Math.round((step / totalSteps) * 100);

  const handleIntentSelect = useCallback((intent: UserIntent) => {
    setPreferences(prev => ({ ...prev, intent }));
    setStep(2);
  }, []);

  const handleLifestageSelect = useCallback((lifestage: UserLifestage) => {
    setPreferences(prev => {
      const current = prev.lifestage || [];
      const updated = current.includes(lifestage)
        ? current.filter(item => item !== lifestage)
        : [...current, lifestage];

      return { ...prev, lifestage: updated };
    });
  }, []);

  const isLifestageSelected = useCallback((lifestage: UserLifestage) => {
    return preferences.lifestage?.includes(lifestage) || false;
  }, [preferences.lifestage]);

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
  const locationInputProps = {
    placeholder: preferences.intent === "selling" ? "Enter your property address" : "Where are you looking to buy?",
    value: locationValue,
    onChange: async (_: React.FormEvent<HTMLElement>, { newValue }: { newValue: string }) => {
      setLocationValue(newValue);
      setPreferences({ ...preferences, location: newValue });

      // Fetch address suggestions when user types
      if (newValue.length > 2) {
        try {
          const response = await fetch(`/api/places/autocomplete?query=${encodeURIComponent(newValue)}&type=address`);
          if (response.ok) {
            const suggestions = await response.json();
            setLocationSuggestions(suggestions);
          }
        } catch (error) {
          console.error('Error fetching address suggestions:', error);
        }
      } else {
        setLocationSuggestions([]);
      }
    },
    className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  };

  // Handle property type change
  const handlePropertyTypeChange = (value: string) => {
    const currentTypes = preferences.propertyType || [];
    if (currentTypes.includes(value)) {
      setPreferences({ 
        ...preferences, 
        propertyType: currentTypes.filter(type => type !== value)
      });
    } else {
      setPreferences({ 
        ...preferences, 
        propertyType: [...currentTypes, value]
      });
    }
  };

  // Handle timeline selection
  const handleTimelineChange = (value: TimelineOption) => {
    setPreferences({ ...preferences, timelines: [value] });
  };

  // Handle image upload with Vision API analysis
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            resolve(event.target.result);
          } else {
            reject("Failed to read file");
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises)
      .then(async (photos) => {
        // Update the photos in the state
        const newPhotos = [...(preferences.inspirationPhotos || []), ...photos];
        setPreferences(prev => ({ ...prev, inspirationPhotos: newPhotos }));

        // Analyze each photo with Vision API
        try {
          // Only analyze the newly added photos
          const analysisPromises = photos.map(photo => analyzeImageUpload(photo));
          const analysisResults = await Promise.all(analysisPromises);

          // Extract and combine styles, features from all photos
          let allArchStyles: string[] = [...(preferences.architecturalStyle || [])];
          let allInteriorStyles: string[] = [...(preferences.interiorStyle || [])];
          let allDesignFeatures: string[] = [...(preferences.designFeatures || [])];
          let colorSchemes: string[] = [];

          // Process each analysis result
          analysisResults.forEach(result => {
            if (result.architecturalStyle) {
              allArchStyles = [...allArchStyles, ...result.architecturalStyle];
            }

            if (result.interiorStyle) {
              allInteriorStyles = [...allInteriorStyles, ...result.interiorStyle];
            }

            if (result.designFeatures) {
              allDesignFeatures = [...allDesignFeatures, ...result.designFeatures];
            }

            if (result.colorScheme) {
              colorSchemes.push(result.colorScheme);
            }
          });

          // Remove duplicates and update preferences
          const uniqueArchStyles = [...new Set(allArchStyles)];
          const uniqueInteriorStyles = [...new Set(allInteriorStyles)];
          const uniqueDesignFeatures = [...new Set(allDesignFeatures)];

          // Use the most recent color scheme if available
          const latestColorScheme = colorSchemes.length > 0 
            ? colorSchemes[colorSchemes.length - 1] 
            : preferences.colorScheme;

          // Update preferences with the analysis results
          setPreferences(prev => ({
            ...prev,
            architecturalStyle: uniqueArchStyles,
            interiorStyle: uniqueInteriorStyles,
            designFeatures: uniqueDesignFeatures,
            colorScheme: latestColorScheme
          }));

          console.log("Vision API analysis complete", { 
            architecturalStyle: uniqueArchStyles,
            interiorStyle: uniqueInteriorStyles,
            designFeatures: uniqueDesignFeatures,
            colorScheme: latestColorScheme
          });
        } catch (error) {
          console.error("Error analyzing images with Vision API:", error);
        }
      })
      .catch(error => console.error("Error uploading images:", error));

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

  // Handle URL image analysis
  const handleUrlAnalysis = async (url: string) => {
    if (!url) return;

    // Add URL to preferences
    const urls = [...(preferences.inspirationUrls || []), url];
    setPreferences(prev => ({ ...prev, inspirationUrls: urls }));
    setUrlInput('');

    // Analyze the URL with Vision API
    try {
      const analysis = await analyzeImageUrl(url);

      // Extract styles and features
      let updatedArchStyles = [...(preferences.architecturalStyle || [])];
      let updatedInteriorStyles = [...(preferences.interiorStyle || [])];
      let updatedDesignFeatures = [...(preferences.designFeatures || [])];

      if (analysis.architecturalStyle) {
        updatedArchStyles = [...updatedArchStyles, ...analysis.architecturalStyle];
      }

      if (analysis.interiorStyle) {
        updatedInteriorStyles = [...updatedInteriorStyles, ...analysis.interiorStyle];
      }

      if (analysis.designFeatures) {
        updatedDesignFeatures = [...updatedDesignFeatures, ...analysis.designFeatures];
      }

      // Remove duplicates
      const uniqueArchStyles = [...new Set(updatedArchStyles)];
      const uniqueInteriorStyles = [...new Set(updatedInteriorStyles)];
      const uniqueDesignFeatures = [...new Set(updatedDesignFeatures)];

      // Update preferences with analysis results
      setPreferences(prev => ({
        ...prev,
        architecturalStyle: uniqueArchStyles,
        interiorStyle: uniqueInteriorStyles,
        designFeatures: uniqueDesignFeatures,
        colorScheme: analysis.colorScheme || prev.colorScheme
      }));

      console.log("URL image analysis complete:", {
        architecturalStyle: uniqueArchStyles,
        interiorStyle: uniqueInteriorStyles,
        designFeatures: uniqueDesignFeatures,
        colorScheme: analysis.colorScheme
      });
    } catch (error) {
      console.error("Error analyzing URL image:", error);
    }
  };

  const features = useMemo(() => [
    { id: 'open-concept', label: 'Open Concept' },
    { id: 'high-ceilings', label: 'High Ceilings' },
    { id: 'natural-light', label: 'Natural Light' },
    { id: 'modern-kitchen', label: 'Modern Kitchen' },
    { id: 'hardwood-floors', label: 'Hardwood Floors' },
    { id: 'large-windows', label: 'Large Windows' },
    { id: 'outdoor-space', label: 'Outdoor Living' },
    { id: 'smart-home', label: 'Smart Home' }
  ], []);

  // Define architectural styles
  const architecturalStyles = useMemo(() => [
    { value: 'modern', label: 'Modern/Contemporary', icon: 'square' },
    { value: 'traditional', label: 'Traditional', icon: 'home' },
    { value: 'craftsman', label: 'Craftsman', icon: 'workshop' },
    { value: 'mediterranean', label: 'Mediterranean', icon: 'palmtree' },
    { value: 'colonial', label: 'Colonial', icon: 'columns' },
    { value: 'farmhouse', label: 'Modern Farmhouse', icon: 'barn' },
    { value: 'ranch', label: 'Ranch', icon: 'ranch' },
    { value: 'victorian', label: 'Victorian', icon: 'landmark' }
  ], []);

  // Save progress whenever step or preferences change
  useEffect(() => {
    localStorage.setItem('questionnaire_step', step.toString());
    localStorage.setItem('questionnaire_preferences', JSON.stringify(preferences));
  }, [step, preferences]);

  const handleNextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Clear saved progress when completing the questionnaire
      localStorage.removeItem('questionnaire_step');
      localStorage.removeItem('questionnaire_preferences');
      onComplete(preferences);
    }
  };

  const handleResumeProgress = () => {
    const savedStep = localStorage.getItem('questionnaire_step');
    const savedPreferences = localStorage.getItem('questionnaire_preferences');
    if (savedStep && savedPreferences) {
      setStep(parseInt(savedStep));
      setPreferences(JSON.parse(savedPreferences));
    }
  };

  const MortgageSection = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div>
          <Label>Down Payment Amount</Label>
          <Input
            type="number"
            value={preferences.downPayment || ''}
            onChange={(e) => setPreferences({...preferences, downPayment: parseFloat(e.target.value)})}
            placeholder="Enter down payment amount"
          />
        </div>

        <div className="space-y-2">
          <Label>Financing Options</Label>
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={preferences.financingOptions?.includes('conventional')}
                onCheckedChange={(checked) => {
                  const current = preferences.financingOptions || [];
                  const updated = checked 
                    ? [...current, 'conventional']
                    : current.filter(opt => opt !== 'conventional');
                  setPreferences({...preferences, financingOptions: updated});
                }}
              />
              <label>Conventional Loans (3-20% down)</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={preferences.financingOptions?.includes('fha')}
                onCheckedChange={(checked) => {
                  const current = preferences.financingOptions || [];
                  const updated = checked 
                    ? [...current, 'fha']
                    : current.filter(opt => opt !== 'fha');
                  setPreferences({...preferences, financingOptions: updated});
                }}
              />
              <label>FHA Loans (3.5% down)</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                checked={preferences.financingOptions?.includes('va')}
                onCheckedChange={(checked) => {
                  const current = preferences.financingOptions || [];
                  const updated = checked 
                    ? [...current, 'va']
                    : current.filter(opt => opt !== 'va');
                  setPreferences({...preferences, financingOptions: updated});
                }}
              />
              <label>VA Loans (0% down for veterans)</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
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
                <SplitSquareVertical className="h-10 w-10 text-primary" />
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
            {preferences.intent === "buying" ? (
              <>
                <div className="space-y-4">
                  <LifestageCard 
                    icon={<Wallet className="h-6 w-6" />}
                    title="Down Payment Amount"
                    value="down-payment"
                    selected={isLifestageSelected("down-payment")}
                    onClick={() => handleLifestageSelect("down-payment")}
                  />
                  {isLifestageSelected("down-payment") && (
                    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Down Payment Amount</Label>
                          <span className="text-sm text-muted-foreground">
                            ${(preferences.budget?.min || 0).toLocaleString()}
                          </span>
                        </div>
                        <Slider
                          defaultValue={[20000]}
                          min={0}
                          max={500000}
                          step={5000}
                          value={[preferences.budget?.min || 0]}
                          onValueChange={([value]) => setPreferences(prev => ({
                            ...prev,
                            budget: { 
                              min: value, 
                              max: prev.budget?.max || 500000 
                            }
                          }))}
                          className="my-4"
                        />
                        <div className="text-sm text-muted-foreground">
                          Adjust your down payment amount
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <LifestageCard 
                    icon={<Calculator className="h-6 w-6" />}
                    title="Need Mortgage Financing"
                    value="need-mortgage"
                    selected={isLifestageSelected("need-mortgage")}
                    onClick={() => handleLifestageSelect("need-mortgage")}
                  />
                  {isLifestageSelected("need-mortgage") && (
                    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-2">
                      <h4 className="font-medium text-sm">Available Options:</h4>
                      <ul className="text-sm space-y-2">
                        <li>• Conventional Loans (3-20% down)</li>
                        <li>• FHA Loans (3.5% down)</li>
                        <li>• VA Loans (0% down for veterans)</li>
                        <li>• Jumbo Loans (10-20% down)</li>
                        <li>• First-Time Homebuyer Programs</li>
                      </ul>
                    </div>
                  )}

                  <LifestageCard 
                    icon={<Building className="h-6 w-6" />}
                    title="Pre-Approve for a Loan Today"
                    value="pre-approve"
                    selected={isLifestageSelected("pre-approve")}
                    onClick={() => handleLifestageSelect("pre-approve")}
                  />
                  {isLifestageSelected("pre-approve") && (
                    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-2">
                      <h4 className="font-medium text-sm">Quick Pre-Approval Process:</h4>
                      <ul className="text-sm space-y-2">
                        <li>• Fast online application</li>
                        <li>• Soft credit check</li>
                        <li>• Multiple lender comparison</li>
                        <li>• Custom rate quotes</li>
                        <li>• Pre-approval letter in 24hrs</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <LifestageCard 
                    icon={<Shield className="h-6 w-6" />}
                    title="Interest in Home Insurance quotes"
                    value="insurance-quotes"
                    selected={isLifestageSelected("insurance-quotes")}
                    onClick={() => handleLifestageSelect("insurance-quotes")}
                  />
                  {isLifestageSelected("insurance-quotes") && (
                    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="basic-coverage"
                            checked={preferences.insuranceOptions?.includes("basic-coverage")}
                            onCheckedChange={(checked) => {
                              const current = preferences.insuranceOptions || [];
                              const updated = checked 
                                ? [...current, "basic-coverage"]
                                : current.filter(id => id !== "basic-coverage");
                              setPreferences({...preferences, insuranceOptions: updated});
                            }}
                          />
                          <label className="text-sm">Basic Coverage (Property & Liability)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="extended-coverage"
                            checked={preferences.insuranceOptions?.includes("extended-coverage")}
                            onCheckedChange={(checked) => {
                              const current = preferences.insuranceOptions || [];
                              const updated = checked 
                                ? [...current, "extended-coverage"]
                                : current.filter(id => id !== "extended-coverage");
                              setPreferences({...preferences, insuranceOptions: updated});
                            }}
                          />
                          <label className="text-sm">Extended Coverage (Natural Disasters)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="contents-coverage"
                            checked={preferences.insuranceOptions?.includes("contents-coverage")}
                            onCheckedChange={(checked) => {
                              const current = preferences.insuranceOptions || [];
                              const updated = checked 
                                ? [...current, "contents-coverage"]
                                : current.filter(id => id !== "contents-coverage");
                              setPreferences({...preferences, insuranceOptions: updated});
                            }}
                          />
                          <label className="text-sm">Contents Coverage</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="bundled-insurance"
                            checked={preferences.insuranceOptions?.includes("bundled-insurance")}
                            onCheckedChange={(checked) => {
                              const current = preferences.insuranceOptions || [];
                              const updated = checked 
                                ? [...current, "bundled-insurance"]
                                : current.filter(id => id !== "bundled-insurance");
                              setPreferences({...preferences, insuranceOptions: updated});
                            }}
                          />
                          <label className="text-sm">Bundle with Auto/Life Insurance</label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <LifestageCard 
                    icon={<Key className="h-6 w-6" />}
                    title="Future Renovation Plans"
                    value="renovation-plans"
                    selected={isLifestageSelected("renovation-plans")}
                    onClick={() => handleLifestageSelect("renovation-plans")}
                  />
                  {isLifestageSelected("renovation-plans") && (
                    <div className="ml-8 p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="kitchen-remodel"
                            checked={preferences.renovationPlans?.includes("kitchen-remodel")}
                            onCheckedChange={(checked) => {
                              const current = preferences.renovationPlans || [];
                              const updated = checked 
                                ? [...current, "kitchen-remodel"]
                                : current.filter(id => id !== "kitchen-remodel");
                              setPreferences({...preferences, renovationPlans: updated});
                            }}
                          />
                          <label className="text-sm">Kitchen Remodel</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="bathroom-update"
                            checked={preferences.renovationPlans?.includes("bathroom-update")}
                            onCheckedChange={(checked) => {
                              const current = preferences.renovationPlans || [];
                              const updated = checked 
                                ? [...current, "bathroom-update"]
                                : current.filter(id => id !== "bathroom-update");
                              setPreferences({...preferences, renovationPlans: updated});
                            }}
                          />
                          <label className="text-sm">Bathroom Updates</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="finish-basement"
                            checked={preferences.renovationPlans?.includes("finish-basement")}
                            onCheckedChange={(checked) => {
                              const current = preferences.renovationPlans || [];
                              const updated = checked 
                                ? [...current, "finish-basement"]
                                : current.filter(id => id !== "finish-basement");
                              setPreferences({...preferences, renovationPlans: updated});
                            }}
                          />
                          <label className="text-sm">Finish Basement</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="add-bedroom"
                            checked={preferences.renovationPlans?.includes("add-bedroom")}
                            onCheckedChange={(checked) => {
                              const current = preferences.renovationPlans || [];
                              const updated = checked 
                                ? [...current, "add-bedroom"]
                                : current.filter(id => id !== "add-bedroom");
                              setPreferences({...preferences, renovationPlans: updated});
                            }}
                          />
                          <label className="text-sm">Add Bedroom/Bath</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="outdoor-living"
                            checked={preferences.renovationPlans?.includes("outdoor-living")}
                            onCheckedChange={(checked) => {
                              const current = preferences.renovationPlans || [];
                              const updated = checked 
                                ? [...current, "outdoor-living"]
                                : current.filter(id => id !== "outdoor-living");
                              setPreferences({...preferences, renovationPlans: updated});
                            }}
                          />
                          <label className="text-sm">Outdoor Living Space</label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Property Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {propertyTypes.map(type => (
                      <div key={type.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={type.id}
                          checked={preferences.propertyType?.includes(type.id)}
                          onCheckedChange={(checked) => {
                            const current = preferences.propertyType || [];
                            const updated = checked 
                              ? [...current, type.id]
                              : current.filter(id => id !== type.id);
                            setPreferences({...preferences, propertyType: updated});
                          }}
                        />
                        <label htmlFor={type.id} className="text-sm cursor-pointer">
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Bedrooms</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {bedroomOptions.map(option => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`bed-${option.id}`}
                          checked={preferences.bedrooms?.includes(option.id)}
                          onCheckedChange={(checked) => {
                            const current = preferences.bedrooms || [];
                            const updated = checked 
                              ? [...current, option.id]
                              : current.filter(id => id !== option.id);
                            setPreferences({...preferences, bedrooms: updated});
                          }}
                        />
                        <label htmlFor={`bed-${option.id}`} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Bathrooms</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {bathroomOptions.map(option => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`bath-${option.id}`}
                          checked={preferences.bathrooms?.includes(option.id)}
                          onCheckedChange={(checked) => {
                            const current = preferences.bathrooms || [];
                            const updated = checked 
                              ? [...current, option.id]
                              : current.filter(id => id !== option.id);
                            setPreferences({...preferences, bathrooms: updated});
                          }}
                        />
                        <label htmlFor={`bath-${option.id}`} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Condition */}
                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Property Condition</Label>
                  <Select 
                    value={preferences.propertyCondition || ""}
                    onValueChange={(value: "excellent" | "good" | "fair" | "needs-work") => setPreferences({...preferences, propertyCondition: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="needs-work">Needs Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Built */}
                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Year Built (Optional)</Label>
                  <Input 
                    type="number"
                    placeholder="Enter year built"
                    value={preferences.yearBuilt || ''}
                    onChange={(e) => setPreferences({...preferences, yearBuilt: e.target.value})}
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>

                {/* Key Features */}
                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Key Features</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'updated-kitchen', label: 'Updated Kitchen' },
                      { id: 'updated-bathrooms', label: 'Updated Bathrooms' },
                      { id: 'hardwood-floors', label: 'Hardwood Floors' },
                      { id: 'large-yard', label: 'Large Yard' },
                      { id: 'garage', label: 'Garage' },
                      { id: 'covered-parking', label: 'Covered Parking' },
                      { id: 'city-view', label: 'City View' },
                      { id: 'mountain-view', label: 'Mountain View' },
                      { id: 'ocean-view', label: 'Ocean View' },
                      { id: 'pool', label: 'Pool' },
                      { id: 'fireplace', label: 'Fireplace' },
                      { id: 'balcony', label: 'Balcony' },
                      { id: 'patio', label: 'Patio' },
                      { id: 'central-ac', label: 'Central AC/Heat' },
                      { id: 'smart-home', label: 'Smart Home Features' }
                    ].map(feature => (
                      <div key={feature.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={feature.id}
                          checked={preferences.propertyFeatures?.includes(feature.id)}
                          onCheckedChange={(checked) => {
                            const current = preferences.propertyFeatures || [];
                            const updated = checked 
                              ? [...current, feature.id]
                              : current.filter(id => id !== feature.id);
                            setPreferences({...preferences, propertyFeatures: updated});
                          }}
                        />
                        <label htmlFor={feature.id} className="text-sm cursor-pointer">
                          {feature.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Renovations */}
                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Recent Renovations (Optional)</Label>
                  <Textarea 
                    placeholder="Briefly describe any recent renovations"
                    value={preferences.recentRenovations || ''}
                    onChange={(e) => setPreferences({...preferences, recentRenovations: e.target.value})}
                  />
                </div>

                {/* Selling Goals */}
                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Reason for Selling</Label>
                  <Select value={preferences.sellReason} onValueChange={(value) => setPreferences({...preferences, sellReason: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relocating">Relocating</SelectItem>
                      <SelectItem value="downsizing">Downsizing</SelectItem>
                      <SelectItem value="upsizing">Upsizing</SelectItem>
                      <SelectItem value="financial">Financial Reasons</SelectItem>
                      <SelectItem value="investment">Investment Property</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Desired Selling Timeline</Label>
                  <Select value={preferences.sellingTimeline} onValueChange={(value) => setPreferences({...preferences, sellingTimeline: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP (ready to list)</SelectItem>
                      <SelectItem value="1-3months">Within 1-3 months</SelectItem>
                      <SelectItem value="3-6months">Within 3-6 months</SelectItem>
                      <SelectItem value="6-plus">6+ months</SelectItem>
                      <SelectItem value="not-sure">Not sure yet (just exploring)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Desired List Price (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">$</span>
                    <Input 
                      type="number" 
                      placeholder="Enter amount"
                      value={preferences.desiredPrice || ''}
                      onChange={(e) => setPreferences({...preferences, desiredPrice: e.target.value})}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">This is just an initial estimate. We'll provide an AI valuation and expert consultation.</p>
                </div>

                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Are you currently working with a real estate agent?</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="agent-yes"
                        checked={preferences.hasAgent === true}
                        onChange={() => setPreferences({...preferences, hasAgent: true})}
                        className="h-4 w-4"
                      />
                      <label htmlFor="agent-yes">Yes</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="agent-no"
                        checked={preferences.hasAgent === false}
                        onChange={() => setPreferences({...preferences, hasAgent: false})}
                        className="h-4 w-4"
                      />
                      <label htmlFor="agent-no">No</label>
                    </div>
                  </div>
                  {preferences.hasAgent && (
                    <Input
                      placeholder="Agent's name (optional)"
                      value={preferences.agentName || ''}
                      onChange={(e) => setPreferences({...preferences, agentName: e.target.value})}
                    />
                  )}
                </div>

                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">What's most important to you in the selling process?</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'highest-price', label: 'Getting the highest price' },
                      { id: 'quick-sale', label: 'Selling quickly' },
                      { id: 'minimal-hassle', label: 'Minimal hassle' },
                      { id: 'expert-guidance', label: 'Expert guidance' }
                    ].map(pref => (
                      <div key={pref.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={pref.id}
                          checked={preferences.sellingPreferences?.includes(pref.id)}
                          onCheckedChange={(checked) => {
                            const current = preferences.sellingPreferences || [];
                            const updated = checked 
                              ? [...current, pref.id]
                              : current.filter(id => id !== pref.id);
                            setPreferences({...preferences, sellingPreferences: updated});
                          }}
                        />
                        <label htmlFor={pref.id} className="text-sm">{pref.label}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Media */}
                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Property Media</Label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Photos/Videos
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </div>
                  {preferences.propertyMedia && preferences.propertyMedia.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {preferences.propertyMedia.map((media, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={media}
                            alt={`Property ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => {
                              const updatedMedia = [...preferences.propertyMedia];
                              updatedMedia.splice(index, 1);
                              setPreferences({...preferences, propertyMedia: updatedMedia});
                            }}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Property Location</Label>
                  <div className="flex items-center space-x-2">
                    <Autosuggest
                      suggestions={locationSuggestions}
                      onSuggestionsFetchRequested={({ value }) => {
                        getSuggestions(value)
                      }}
                      onSuggestionsClearRequested={() => {
                        setLocationSuggestions([]);
                      }}
                      getSuggestionValue={getSuggestionValue}
                      renderSuggestion={renderSuggestion}
                      inputProps={locationInputProps}
                      onSuggestionSelected={onLocationSuggestionSelected}
                    />
                    <Button variant="outline">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="col-span-2 space-y-4">
                  <Label className="font-medium">Contact Information</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="First Name"
                      value={preferences.firstName || ''}
                      onChange={(e) => setPreferences({...preferences, firstName: e.target.value})}
                    />
                    <Input
                      placeholder="Last Name"
                      value={preferences.lastName || ''}
                      onChange={(e) => setPreferences({...preferences, lastName: e.target.value})}
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={preferences.email || ''}
                    onChange={(e) => setPreferences({...preferences, email: e.target.value})}
                  />
                  <Input
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    value={preferences.phone || ''}
                    onChange={(e) => setPreferences({...preferences, phone: e.target.value})}
                  />

                  <div className="space-y-2">
                    <Label className="font-medium">Preferred Method of Contact</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="contact-email"
                          checked={preferences.contactMethod === 'email'}
                          onChange={() => setPreferences({...preferences, contactMethod: 'email'})}
                          className="h-4 w-4"
                        />
                        <label htmlFor="contact-email">Email</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="contact-phone"
                          checked={preferences.contactMethod === 'phone'}
                          onChange={() => setPreferences({...preferences, contactMethod: 'phone'})}
                          className="h-4 w-4"
                        />
                        <label htmlFor="contact-phone">Phone</label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="privacy-policy"
                      checked={preferences.privacyAgreed}
                      onCheckedChange={(checked) => setPreferences({...preferences, privacyAgreed: checked})}
                    />
                    <label htmlFor="privacy-policy" className="text-sm">
                      I agree to the Privacy Policy and Terms of Service
                    </label>
                  </div>
                </div>
              </>
            )}
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
        <MortgageSection />
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center">
            Tell us about your design preferences
          </h3>
          <p className="text-center text-muted-foreground mb-8">
            Help us understand your style to find properties that match your taste
          </p>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-medium mb-2">Upload Inspiration Images</h4>
              <p className="text-sm text-muted-foreground">
                Share photos of homes and interiors you love to help our AI understand your style
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-xl hover:border-primary cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG or WEBP (max 5MB)</p>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              {preferences.inspirationPhotos && preferences.inspirationPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-xl">
                  {preferences.inspirationPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Inspiration ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeInspirationPhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-2 mt-6">
              <label className="font-medium">Add Inspiration URLs</label>
              <p className="text-sm text-muted-foreground mb-2">
                Share links to properties or design inspiration you love
              </p>
              <div className="flex gap-2 w-full max-w-xl">
                <Input
                  type="url"
                  placeholder="https://example.com/inspiration"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && urlInput) {
                      handleUrlAnalysis(urlInput);
                    }
                  }}
                />
                <Button 
                  onClick={() => {
                    if (urlInput) {
                      handleUrlAnalysis(urlInput);
                    }
                  }}
                >
                  Add
                </Button>
              </div>

              {preferences.inspirationUrls && preferences.inspirationUrls.length > 0 && (
                <div className="w-full max-w-xl space-y-2 mt-2">
                  {preferences.inspirationUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm truncate hover:text-primary">
                        {url}
                      </a>
                      <button
                        onClick={() => {
                          const urls = preferences.inspirationUrls?.filter((_, i) => i !== index);
                          setPreferences({ ...preferences, inspirationUrls: urls });
                        }}
                        className="p-1 hover:bg-background rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-4">
                <Label className="font-semibold">Architectural Style</Label>
                <p className="text-sm text-muted-foreground mb-4">Select all styles that interest you</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {useMemo(() => [
                    { 
                      value: 'modern', 
                      label: 'Modern/Contemporary', 
                      icon: 'square',
                      description: 'Clean lines, minimal decoration, large windows, open floor plans'
                    },
                    { 
                      value: 'traditional', 
                      label: 'Traditional', 
                      icon: 'home',
                      description: 'Classic design elements, symmetrical facades, familiar comfort'
                    },
                    { 
                      value: 'craftsman', 
                      label: 'Craftsman', 
                      icon: 'workshop',
                      description: 'Natural materials, exposed beams, built-in cabinetry, front porch'
                    },
                    { 
                      value: 'mediterranean', 
                      label: 'Mediterranean', 
                      icon: 'palmtree',
                      description: 'Stucco walls, red tile roofs, arched windows, outdoor living'
                    },
                    { 
                      value: 'colonial', 
                      label: 'Colonial', 
                      icon: 'columns'
                    },
                    { 
                      value: 'farmhouse', 
                      label: 'Modern Farmhouse', 
                      icon: 'barn'
                    },
                    { 
                      value: 'ranch', 
                      label: 'Ranch', 
                      icon: 'ranch'
                    },
                    { 
                      value: 'victorian', 
                      label: 'Victorian', 
                      icon: 'landmark'
                    }
                  ], []).map(style => (
                    <Tooltip key={style.value} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div
                          className={`cursor-pointer rounded-lg p-4 h-24 flex flex-col items-center justify-center border-2 transition-all relative ${
                            preferences.architecturalStyle?.includes(style.value)
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            const current = preferences.architecturalStyle || [];
                            const updated = current.includes(style.value)
                              ? current.filter((s: string) => s !== style.value)
                              : [...current, style.value];
                            setPreferences({...preferences, architecturalStyle: updated});
                          }}
                        >
                          <div className="w-10 h-10 mb-2 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                            {style.icon === 'square' && <Square className="h-5 w-5" />}
                            {style.icon === 'home' && <Home className="h-5 w-5" />}
                            {style.icon === 'workshop' && <Hammer className="h-5 w-5" />}
                            {style.icon === 'palmtree' && <Palmtree className="h-5 w-5" />}
                            {style.icon === 'columns' && <Building className="h-5 w-5" />}
                            {style.icon === 'barn' && <Home className="h-5 w-5" />}
                            {style.icon === 'ranch' && <Mountain className="h-5 w-5" />}
                            {style.icon === 'landmark' && <Landmark className="h-5 w-5" />}
                          </div>
                          <div className="text-sm font-medium text-center">{style.label}</div>
                          {preferences.architecturalStyle?.includes(style.value) && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] text-center">
                        {style.description}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <Label className="font-semibold">Interior Style</Label>
                <p className="text-sm text-muted-foreground mb-4">Select all styles that inspire you</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {useMemo(() => [
                    { 
                      value: 'minimalist', 
                      label: 'Minimalist', 
                      icon: 'square',
                      description: 'Clean spaces, neutral colors, essential furnishings only'
                    },
                    { 
                      value: 'contemporary', 
                      label: 'Contemporary', 
                      icon: 'sparkles',
                      description: 'Current trends, smooth lines, artistic elements'
                    },
                    { 
                      value: 'traditional', 
                      label: 'Traditional', 
                      icon: 'sofa',
                      description: 'Classic furniture, rich colors, symmetrical arrangements'
                    },
                    { 
                      value: 'rustic', 
                      label: 'Rustic', 
                      icon: 'wood',
                      description: 'Natural materials, wooden beams, cozy and warm'
                    },
                    { 
                      value: 'industrial', 
                      label: 'Industrial', 
                      icon: 'factory',
                      description: 'Exposed brick, metal fixtures, open ductwork'
                    },
                    { 
                      value: 'coastal', 
                      label: 'Coastal', 
                      icon: 'waves',
                      description: 'Light colors, natural light, beach-inspired decor'
                    },
                    { 
                      value: 'bohemian', 
                      label: 'Bohemian', 
                      icon: 'leaf',
                      description: 'Mixed patterns, layered textiles, eclectic decor'
                    },
                    { 
                      value: 'scandinavian', 
                      label: 'Scandinavian', 
                      icon: 'armchair',
                      description: 'Light woods, minimal decor, functional design'
                    }
                  ], []).map(style => (
                    <Tooltip key={style.value} delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div
                          key={style.value}
                          className={`cursor-pointer rounded-lg p-4 h-24 flex flex-col items-center justify-center border-2 transition-all ${
                            preferences.interiorStyle?.includes(style.value)
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            const current = preferences.interiorStyle || [];
                            const updated = current.includes(style.value)
                              ? current.filter((s: string) => s !== style.value)
                              : [...current, style.value];
                            setPreferences({...preferences, interiorStyle: updated});
                          }}
                        >
                          <div className="w-10 h-10 mb-2 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                            {style.icon === 'square' && <Square className="h-5 w-5" />}
                            {style.icon === 'sparkles' && <Sparkles className="h-5 w-5" />}
                            {style.icon === 'sofa' && <Sofa className="h-5 w-5" />}
                            {style.icon === 'wood' && <Home className="h-5 w-5" />}
                            {style.icon === 'factory' && <Factory className="h-5 w-5" />}
                            {style.icon === 'waves' && <Waves className="h-5 w-5" />}
                            {style.icon === 'leaf' && <Leaf className="h-5 w-5" />}
                            {style.icon === 'armchair' && <Armchair className="h-5 w-5" />}
                          </div>
                          <div className="text-sm font-medium text-center">{style.label}</div>
                          {preferences.interiorStyle?.includes(style.value) && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] text-center">
                        {style.description}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <div className="space-y-2">
                  <Label className="font-semibold">Must-Have Design Features</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {features.map(feature => (
                      <div key={feature.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={feature.id}
                          checked={preferences.designFeatures?.includes(feature.id)}
                          onCheckedChange={(checked) => {
                            const current = preferences.designFeatures || [];
                            const updated = checked 
                              ? [...current, feature.id]
                              : current.filter(id => id !== feature.id);
                            setPreferences({...preferences, designFeatures: updated});
                          }}
                        />
                        <label 
                          htmlFor={feature.id}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {feature.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Color Preferences</Label>
                  <Select 
                    value={preferences.colorScheme || undefined}
                    onValueChange={(value) => setPreferences({...preferences, colorScheme: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">Neutral & Earth Tones</SelectItem>
                      <SelectItem value="warm">Warm & Cozy</SelectItem>
                      <SelectItem value="cool">Cool & Calm</SelectItem>
                      <SelectItem value="bright">Bright & Bold</SelectItem>
                      <SelectItem value="monochrome">Monochromatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <div className="space-y-2">
                <Label className="font-semibold">Must-Have Design Features</Label>
                <div className="grid grid-cols-2 gap-2">
                  {features.map(feature => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={feature.id}
                        checked={preferences.designFeatures?.includes(feature.id)}
                        onCheckedChange={(checked) => {
                          const current = preferences.designFeatures || [];
                          const updated = checked 
                            ? [...current, feature.id]
                            : current.filter(id => id !== feature.id);
                          setPreferences({...preferences, designFeatures: updated});
                        }}
                      />
                      <label 
                        htmlFor={feature.id}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {feature.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Color Preferences</Label>
                <Select 
                  value={preferences.colorScheme || undefined}
                  onValueChange={(value) => setPreferences({...preferences, colorScheme: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neutral">Neutral & Earth Tones</SelectItem>
                    <SelectItem value="warm">Warm & Cozy</SelectItem>
                    <SelectItem value="cool">Cool & Calm</SelectItem>
                    <SelectItem value="bright">Bright & Bold</SelectItem>
                    <SelectItem value="monochrome">Monochromatic</SelectItem>
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

      {step === 5 && (
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

      {step === 6 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center">Review Your Preferences</h3>
          <p className="text-center text-muted-foreground">
            Let's make sure we have everything right before finding your perfect matches.
          </p>

          <div className="bg-muted/50 rounded-lg p-6 space-y-6">
            {/* Intent & Basic Info */}
            <div className="space-y-2">
              <h4 className="font-semibold">Looking to:</h4>
              <div className="bg-background rounded p-3 flex items-center gap-2">
                {preferences.intent === "buying" && <Home className="h-5 w-5 text-primary" />}
                {preferences.intent === "selling" && <Building className="h-5 w-5 text-primary" />}
                {preferences.intent === "both" && <SplitSquareVertical className="h-5 w-5 text-primary" />}
                <span className="capitalize">{preferences.intent}</span>
              </div>
            </div>

            {/* Location */}
            {preferences.location && (
              <div className="space-y-2">
                <h4 className="font-semibold">Desired Location:</h4>
                <div className="bg-background rounded p-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{preferences.location}</span>
                </div>
              </div>
            )}

            {/* Financial Info - For Buyers */}
            {(preferences.intent === "buying" || preferences.intent === "both") && (
              <div className="space-y-2">
                <h4 className="font-semibold">Financial Details:</h4>
                <div className="bg-background rounded p-3 space-y-2">
                  {preferences.budget && (
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <span>Down Payment: ${preferences.budget.min.toLocaleString()}</span>
                    </div>
                  )}
                  {isLifestageSelected("need-mortgage") && (
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      <span>Interested in Mortgage Financing</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Design Preferences */}
            <div className="space-y-4">
              <h4 className="font-semibold">Style Preferences:</h4>

              {/* Architectural Styles */}
              {preferences.architecturalStyle && preferences.architecturalStyle.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Architectural Styles</label>
                  <div className="flex flex-wrap gap-2">
                    {preferences.architecturalStyle.map(style => (
                      <Badge key={style} variant="secondary" className="flex items-center gap-1">
                        <Square className="h-3 w-3" />
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Interior Styles */}
              {preferences.interiorStyle && preferences.interiorStyle.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interior Styles</label>
                  <div className="flex flex-wrap gap-2">
                    {preferences.interiorStyle.map(style => (
                      <Badge key={style} variant="secondary" className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            {preferences.timelines && preferences.timelines.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Timeline:</h4>
                <div className="bg-background rounded p-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>
                    {timelineOptions.find(option => option.id === preferences.timelines?.[0])?.label}
                  </span>
                </div>
              </div>
            )}

            {/* Inspiration Photos */}
            {preferences.inspirationPhotos && preferences.inspirationPhotos.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Style Inspiration:</h4>
                <div className="grid grid-cols-4 gap-2">
                  {preferences.inspirationPhotos.map((photo, index) => (
                    <img 
                      key={index}
                      src={photo}
                      alt={`Inspiration ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Refine Preferences
            </Button>
            <Button onClick={() => onComplete(preferences)}>
              Show My Matches
              <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

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

              {preferences.propertyType && preferences.propertyType.length > 0 && (
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Property type: </span>
                  <span>{preferences.propertyType.map((type, index) => (
                    <span key={index}>
                      {propertyTypes.find(p => p.id === type)?.label || type}
                      {index < (preferences.propertyType?.length || 0) - 1 ? ", " : ""}
                    </span>
                  ))}</span>
                </div>
              )}

              {preferences.timelines && preferences.timelines.length > 0 && (
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Timeline: </span>
                  <span>
                    {timelineOptions.find(option => option.id === preferences.timelines?.[0])?.label || "Not specified"}
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

      <div className="text-center space-y-2">
        <Button variant="ghost" onClick={onSkip}>
          Skip and continue to all properties
        </Button>
        <div className="flex justify-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              localStorage.setItem('questionnaire_step', step.toString());
              localStorage.setItem('questionnaire_preferences', JSON.stringify(preferences));
            }}
          >
            Save Progress
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleResumeProgress}
          >
            Resume Progress
          </Button>
        </div>
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
    // Buying-related
    "down-payment": "Down Payment Amount",
    "need-mortgage": "Need Mortgage Financing",
    "pre-approve": "Pre-Approve for a Loan Today",
    "insurance-quotes": "Interest in Home Insurance quotes",
    "renovation-plans": "Future Renovation Plans",

    // Selling-related
    "property-type": "Property Type",
    "property-size": "Size (SF)",
    "bedrooms": "Number of Bedrooms",
    "bathrooms": "Number of Bathrooms",
    "property-media": "Property Photos/Videos",
    "property-features": "Property Features/Amenities",
    "property-location": "Property Address/Location",
    "timeframe": "Specific Timeframe",
    "sell-urgency": "Urgency to Sell",
    "relocating": "Relocating",
    "size-change": "Upgrading/Downsizing",
    "financial-reasons": "Financial Reasons",
    "moving-services": "Need help with moving services",
    "buy-after-sell": "Looking to buy after selling",

    // Other lifestage options
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