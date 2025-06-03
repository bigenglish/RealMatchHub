import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Home, Check, ChevronsRight, Landmark,
  Square, Bed, Bath, ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// City Autocomplete Component
interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
  placeholder: string;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ value, onChange, placeholder }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchCitySuggestions = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}&types=place&country=US&limit=5`);
      if (response.ok) {
        const data = await response.json();
        const cities = data.features?.map((feature: any) => feature.place_name) || [];
        setSuggestions(cities);
      }
    } catch (error) {
      // Fallback to popular US cities
      const popularCities = [
        'Los Angeles, CA',
        'San Francisco, CA', 
        'New York, NY',
        'Chicago, IL',
        'Houston, TX',
        'Phoenix, AZ',
        'Philadelphia, PA',
        'San Antonio, TX',
        'San Diego, CA',
        'Dallas, TX'
      ];
      const filtered = popularCities.filter(city => 
        city.toLowerCase().includes(input.toLowerCase())
      );
      setSuggestions(filtered);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    fetchCitySuggestions(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Extract just the city name from the full suggestion (e.g., "Los Angeles, CA, USA" -> "Los Angeles")
    const cityName = suggestion.split(',')[0].trim();
    onChange(cityName);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add custom styles for range sliders
const sliderStyles = `
  .slider-thumb::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #059669;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .slider-thumb::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #059669;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

export type Step = 'situation' | 'financing' | 'design' | 'properties' | 'application' | 'service';

interface BuyerWorkflowProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
  onComplete: () => void;
  downPaymentAmount?: number;
  setDownPaymentAmount: (amount: number) => void;
  needsMortgage?: boolean;
  setNeedsMortgage: (needs: boolean) => void;
}

interface BuyerSelection {
  timeline: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxPrice: number;
  city: string;
  neighborhood: string;
  amenities: string[];
  availableNeighborhoods?: string[];
  inspirationImages?: string[];
  styleAnalysis?: {
    architecturalStyle: string[];
    interiorStyle: string[];
    designFeatures: string[];
    colorScheme: string;
  } | null;
}

export default function BuyerWorkflow({
  currentStep,
  onStepChange,
  onComplete,
  downPaymentAmount = 0,
  setDownPaymentAmount,
  needsMortgage = false,
  setNeedsMortgage
}: BuyerWorkflowProps) {
  const { toast } = useToast();
  const [selection, setSelection] = useState<BuyerSelection>({
    architecturalStyles: [],
    interiorStyles: [],
    amenities: [],
    propertyIntent: 'rent',
    budgetAmount: 3000,
    bedrooms: '',
    bathrooms: '',
    homeTypes: [],
    exactMatchBedrooms: false,
    city: '',
    neighborhood: '',
    availableNeighborhoods: [],
    priceMin: 200000,
    priceMax: 800000,
    inspirationImages: [],
    styleAnalysis: null
  });

  // Function to fetch neighborhoods based on selected city
  const fetchNeighborhoods = useCallback(async (cityName: string) => {
    if (!cityName || cityName.length < 3) {
      setSelection(prev => ({...prev, availableNeighborhoods: []}));
      return;
    }

    try {
      // Try to get neighborhoods from your Google Places API
      const response = await fetch(`/api/neighborhoods?city=${encodeURIComponent(cityName)}`);
      if (response.ok) {
        const neighborhoods = await response.json();
        setSelection(prev => ({
          ...prev, 
          availableNeighborhoods: neighborhoods.slice(0, 5)
        }));
      } else {
        // Fallback neighborhoods based on popular cities
        const neighborhoodMap: { [key: string]: string[] } = {
          'Los Angeles': ['Hollywood', 'Beverly Hills', 'Santa Monica', 'Venice', 'West Hollywood'],
          'San Francisco': ['Mission District', 'Pacific Heights', 'Castro', 'Nob Hill', 'SOMA'],
          'New York': ['Manhattan', 'Brooklyn Heights', 'SoHo', 'Upper East Side', 'Williamsburg'],
          'Chicago': ['Lincoln Park', 'Wicker Park', 'Gold Coast', 'River North', 'Lakeview'],
          'Houston': ['Montrose', 'Heights', 'Midtown', 'River Oaks', 'Galleria'],
          'Phoenix': ['Scottsdale', 'Tempe', 'Ahwatukee', 'Arcadia', 'Biltmore'],
          'Philadelphia': ['Center City', 'Old City', 'Northern Liberties', 'Fishtown', 'Society Hill'],
          'San Antonio': ['Alamo Heights', 'Southtown', 'Pearl District', 'Stone Oak', 'Riverwalk'],
          'San Diego': ['Gaslamp Quarter', 'La Jolla', 'Mission Beach', 'Hillcrest', 'Pacific Beach'],
          'Dallas': ['Deep Ellum', 'Bishop Arts', 'Uptown', 'Highland Park', 'Knox-Henderson']
        };

        // Extract city name from the full city string
        const cityKey = Object.keys(neighborhoodMap).find(key => 
          cityName.toLowerCase().includes(key.toLowerCase())
        );

        if (cityKey) {
          setSelection(prev => ({
            ...prev, 
            availableNeighborhoods: neighborhoodMap[cityKey]
          }));
        } else {
          setSelection(prev => ({...prev, availableNeighborhoods: []}));
        }
      }
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
      setSelection(prev => ({...prev, availableNeighborhoods: []}));
    }
  }, []);

  // Handle down payment change
  const handleDownPaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setDownPaymentAmount(Number(value) || 0);
  };

  // Handler for loan pre-approval
  const handleLoanPreApproval = () => {
    window.location.href = '/fast-online-application';
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'financing':
        onStepChange('situation');
        break;
      case 'design':
        onStepChange('financing');
        break;
      case 'properties':
        onStepChange('design');
        break;
      case 'service':
        onStepChange('properties');
        break;
      default:
        break;
    }
  };

  const handleAmenitySelection = (amenityLabel: string) => {
    setSelection(prev => {
      const currentAmenities = prev.amenities || [];
      const updatedAmenities = currentAmenities.includes(amenityLabel)
        ? currentAmenities.filter((a: string) => a !== amenityLabel)
        : [...currentAmenities, amenityLabel];

      return {
        ...prev,
        amenities: updatedAmenities
      };
    });
  };

  const handleArchitecturalStyleSelection = (styleId: string) => {
    setSelection(prev => {
      const currentStyles = prev.architecturalStyles || [];
      const newStyles = currentStyles.includes(styleId)
        ? currentStyles.filter((s: string) => s !== styleId)
        : [...currentStyles, styleId];

      return {
        ...prev,
        architecturalStyles: newStyles
      };
    });
  };

  const handleInteriorStyleSelection = (styleId: string) => {
    setSelection(prev => {
      const currentStyles = prev.interiorStyles || [];
      const newStyles = currentStyles.includes(styleId)
        ? currentStyles.filter((s: string) => s !== styleId)
        : [...currentStyles, styleId];

      return {
        ...prev,
        interiorStyles: newStyles
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const images = await Promise.all(filePromises);
      const newImages = [...(selection.inspirationImages || []), ...images];
      setSelection(prev => ({ ...prev, inspirationImages: newImages }));

      // Analyze images with Vision API
      if (images.length > 0) {
        analyzeImages(images);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  };

  const analyzeImages = async (images: string[]) => {
    try {
      const analysisPromises = images.map(async (image) => {
        const response = await fetch('/api/vision/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ base64Image: image }),
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.statusText}`);
        }

        return response.json();
      });

      const results = await Promise.all(analysisPromises);

      // Combine analysis results
      let combinedArchStyles: string[] = [];
      let combinedInteriorStyles: string[] = [];
      let combinedDesignFeatures: string[] = [];
      let latestColorScheme = '';

      results.forEach(result => {
        if (result.architecturalStyle) {
          combinedArchStyles = [...combinedArchStyles, ...result.architecturalStyle];
        }
        if (result.interiorStyle) {
          combinedInteriorStyles = [...combinedInteriorStyles, ...result.interiorStyle];
        }
        if (result.designFeatures) {
          combinedDesignFeatures = [...combinedDesignFeatures, ...result.designFeatures];
        }
        if (result.colorScheme) {
          latestColorScheme = result.colorScheme;
        }
      });

      // Remove duplicates and update state
      const uniqueArchStyles = [...new Set(combinedArchStyles)];
      const uniqueInteriorStyles = [...new Set(combinedInteriorStyles)];
      const uniqueDesignFeatures = [...new Set(combinedDesignFeatures)];

      setSelection(prev => ({
        ...prev,
        styleAnalysis: {
          architecturalStyle: uniqueArchStyles,
          interiorStyle: uniqueInteriorStyles,
          designFeatures: uniqueDesignFeatures,
          colorScheme: latestColorScheme
        }
      }));

    } catch (error) {
      console.error('Error analyzing images:', error);
    }
  };

  const removeInspiration = (index: number) => {
    const images = [...(selection.inspirationImages || [])];
    images.splice(index, 1);
    setSelection(prev => ({ ...prev, inspirationImages: images }));
  };

  const toggleAmenity = (amenityId: string) => {
    setSelection(prev => ({
      ...prev,
      amenities: prev.amenities?.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...(prev.amenities || []), amenityId]
    }));
  };

  const handleInspirationUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelection(prev => ({
          ...prev,
          inspirationImages: [...(prev.inspirationImages || []), result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeInspirationImage = (index: number) => {
    setSelection(prev => ({
      ...prev,
      inspirationImages: prev.inspirationImages?.filter((_, i) => i !== index) || []
    }));
  };

  const addInspirationUrl = () => {
    if (inspirationUrl.trim()) {
      setSelection(prev => ({
        ...prev,
        inspirationImages: [...(prev.inspirationImages || []), inspirationUrl.trim()]
      }));
      setInspirationUrl('');
    }
  };

  const [inspirationUrl, setInspirationUrl] = useState('');

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'situation':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Tell us about your situation</h2>
            <p className="text-gray-500">Select one of the options below to continue</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer border-2 ${selection === 'down_payment' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                onClick={() => setSelection('down_payment')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full flex items-center justify-center w-10 h-10 ${selection === 'down_payment' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">I Have a Down Payment</p>
                      <p className="text-sm text-gray-500">I have money saved for a down payment</p>
                    </div>
                    {selection === 'down_payment' && <Check className="ml-auto text-primary h-5 w-5" />}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer border-2 ${selection === 'need_mortgage' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                onClick={() => setSelection('need_mortgage')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full flex items-center justify-center w-10 h-10 ${selection === 'need_mortgage' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Need Mortgage Financing</p>
                      <p className="text-sm text-gray-500">I need to apply for mortgage financing</p>
                    </div>
                    {selection === 'need_mortgage' && <Check className="ml-auto text-primary h-5 w-5" />}
                  </div>
                </CardContent>
              </Card>
            </div>

            {selection === 'down_payment' && (
              <div className="mt-4 p-4 border rounded-lg">
                <Label className="block mb-2">Adjust your down payment amount</Label>
                <div className="space-y-4">
                  <input
                    type="range"
                    min={0}
                    max={500000}
                    step={5000}
                    value={downPaymentAmount}
                    onChange={(e) => setDownPaymentAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>$0</span>
                    <span>${downPaymentAmount.toLocaleString()}</span>
                    <span>$500,000</span>
                  </div>
                </div>
              </div>
            )}

            <Button 
              className="w-full md:w-auto"
              onClick={() => {
                if (selection === 'down_payment') {
                  setNeedsMortgage(false);
                  onStepChange('financing');
                } else if (selection === 'need_mortgage') {
                  setNeedsMortgage(true);
                  onStepChange('financing');
                } else {
                  toast({
                    title: "Selection Required",
                    description: "Please select one of the options to continue.",
                    variant: "destructive"
                  });
                }
              }}
            >
              Continue <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'financing':
        return needsMortgage ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Mortgage Financing Options</h2>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Available Options:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Conventional Loans (3-20% down)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>FHA Loans (3.5% down)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>VA Loans (0% down for veterans)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Jumbo Loans (10-20% down)</span>
                </li>
              </ul>
            </div>

            <Card className="border-2 border-green-100 bg-green-50">
              <CardContent className="p-4">
                <h3 className="font-medium text-green-800 mb-2">Quick Pre-Approval Process:</h3>
                <ul className="space-y-1 text-sm text-green-700">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Fast online application</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Soft credit check</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Pre-approval letter in 24hrs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700" 
                onClick={handleLoanPreApproval}
              >
                Pre-Approve for a Loan Today
              </Button>

              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => onStepChange('design')}
              >
                Skip and Continue to Design Preferences
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Down Payment Amount</h2>

            <div className="space-y-3">
              <Label htmlFor="downPayment">Adjust your down payment amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input 
                  id="downPayment"
                  className="pl-8"
                  value={downPaymentAmount.toLocaleString()}
                  onChange={handleDownPaymentChange}
                />
              </div>
            </div>

            <RadioGroup defaultValue="conventional">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conventional" id="conventional" />
                <Label htmlFor="conventional">Conventional purchase (cash)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial">I may need additional financing</Label>
              </div>
            </RadioGroup>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button 
                className="w-full md:w-auto"
                onClick={() => onStepChange('design')}
              >
                Continue to Design Preferences <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="space-y-8">
            {/* Property Basics Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Property Basics</h3>
              <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>City</Label>
                    <CityAutocomplete 
                      value={selection.city || ''}
                      onChange={(city) => {
                        setSelection({...selection, city, neighborhood: ''});
                        fetchNeighborhoods(city);
                      }}
                      placeholder="e.g. San Francisco"
                    />
                  </div>
                  <div>
                    <Label>Neighborhood</Label>
                    {selection.availableNeighborhoods && selection.availableNeighborhoods.length > 0 ? (
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={selection.neighborhood || ''}
                        onChange={(e) => setSelection({...selection, neighborhood: e.target.value})}
                      >
                        <option value="">Select a neighborhood</option>
                        {selection.availableNeighborhoods.map((neighborhood, index) => (
                          <option key={index} value={typeof neighborhood === 'string' ? neighborhood : neighborhood.name || neighborhood}>
                            {typeof neighborhood === 'string' ? neighborhood : neighborhood.name || neighborhood}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input 
                        placeholder="e.g. Pacific Heights"
                        value={selection.neighborhood || ''}
                        onChange={(e) => setSelection({...selection, neighborhood: e.target.value})}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Home Type (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      'Single Family',
                      'Condo',
                      'Townhouse',
                      'Multi-Family',
                      'Land',
                      'Apartment'
                    ].map((type) => (
                      <div
                        key={type}
                        onClick={() => {
                          const currentTypes = selection.homeTypes || [];
                          const newTypes = currentTypes.includes(type)
                            ? currentTypes.filter(t => t !== type)
                            : [...currentTypes, type];
                          setSelection({...selection, homeTypes: newTypes});
                        }}
                        className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                          selection.homeTypes?.includes(type)
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="text-sm font-medium">{type}</div>
                        {selection.homeTypes?.includes(type) && (
                          <Check className="h-4 w-4 mx-auto mt-1 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Price Range</Label>
                    <span className="text-sm text-gray-600">
                      ${selection.priceMin?.toLocaleString() || '200K'} - ${selection.priceMax?.toLocaleString() || '800K'}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Min: $200K</span>
                        <span>Max: $2M</span>
                      </div>
                      <input
                        type="range"
                        min={200000}
                        max={2000000}
                        step={50000}
                        value={selection.priceMin || 200000}
                        onChange={(e) => setSelection({...selection, priceMin: Number(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                    </div>
                    <div>
                      <input
                        type="range"
                        min={200000}
                        max={2000000}
                        step={50000}
                        value={selection.priceMax || 800000}
                        onChange={(e) => setSelection({...selection, priceMax: Number(e.target.value)})}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="mb-3 block">Bedrooms</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {['1', '2', '3', '4+'].map((bed) => (
                        <div
                          key={bed}
                          onClick={() => setSelection({...selection, bedrooms: bed})}
                          className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                            selection.bedrooms === bed
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          <div className="text-sm font-medium">{bed}</div>
                          {selection.bedrooms === bed && (
                            <Check className="h-3 w-3 mx-auto mt-1 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <label className="flex items-center text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={selection.exactMatchBedrooms || false}
                          onChange={(e) => setSelection({...selection, exactMatchBedrooms: e.target.checked})}
                          className="mr-2"
                        />
                        Exact match only
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Bathrooms</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {['1', '1.5', '2', '2.5+'].map((bath) => (
                        <div
                          key={bath}
                          onClick={() => setSelection({...selection, bathrooms: bath})}
                          className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                            selection.bathrooms === bath
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          <div className="text-sm font-medium">{bath}</div>
                          {selection.bathrooms === bath && (
                            <Check className="h-3 w-3 mx-auto mt-1 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Architectural Style (Select all that apply)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "modern", label: "Modern/Contemporary", icon: Square },
                { id: "traditional", label: "Traditional", icon: Home },
                { id: "craftsman", label: "Craftsman", icon: Home },
                { id: "mediterranean", label: "Mediterranean", icon: Home },
                { id: "colonial", label: "Colonial", icon: ImageIcon },
                { id: "farmhouse", label: "Modern Farmhouse", icon: Home },
                { id: "ranch", label: "Ranch", icon: Home },
                { id: "victorian", label: "Victorian", icon: ImageIcon }
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => handleArchitecturalStyleSelection(style.id)}
                  className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                    selection.architecturalStyles?.includes(style.id)
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    {<style.icon className="h-6 w-6 text-primary" />}
                  </div>
                  <p className="text-sm font-medium">{style.label}</p>
                  {selection.architecturalStyles?.includes(style.id) && (
                    <Check className="h-4 w-4 text-primary mx-auto mt-2" />
                  )}
                </div>
              ))}
            </div>

            <h2 className="text-xl font-semibold mb-4">Interior Style (Select all that apply)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "minimalist", label: "Minimalist", icon: Square },
                { id: "contemporary", label: "Contemporary", icon: Bed },
                { id: "traditional", label: "Traditional", icon: Home },
                { id: "rustic", label: "Rustic", icon: Home },
                { id: "industrial", label: "Industrial", icon: Square },
                { id: "coastal", label: "Coastal", icon: Home },
                { id: "bohemian", label: "Bohemian", icon: ImageIcon },
                { id: "scandinavian", label: "Scandinavian", icon: Square }
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => handleInteriorStyleSelection(style.id)}
                  className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                    selection.interiorStyles?.includes(style.id)
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    {<style.icon className="h-6 w-6 text-primary" />}
                  </div>
                  <p className="text-sm font-medium">{style.label}</p>
                  {selection.interiorStyles?.includes(style.id) && (
                    <Check className="h-4 w-4 text-primary mx-auto mt-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Design Preferences Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Tell us about your design preferences</h3>
              <p className="text-sm text-gray-600">
                Help us understand your style to find properties that match your taste
              </p>

              <div className="space-y-4">
                <Label className="text-base font-medium">Upload Inspiration Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG or WEBP (max 5MB)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      id="inspiration-upload"
                      onChange={handleImageUpload}
                    />
                    <label
                      htmlFor="inspiration-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 mt-3 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                    >
                      Select Images
                    </label>
                  </div>
                </div>

                {/* Display uploaded images */}
                {selection.inspirationImages && selection.inspirationImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {selection.inspirationImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Inspiration ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeInspiration(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Analysis Results */}
                {selection.styleAnalysis && (
                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <h4 className="font-medium text-blue-900 mb-2">AI Style Analysis</h4>
                    <div className="space-y-2 text-sm">
                      {selection.styleAnalysis.architecturalStyle && (
                        <p><span className="font-medium">Architectural Style:</span> {selection.styleAnalysis.architecturalStyle.join(', ')}</p>
                      )}
                      {selection.styleAnalysis.interiorStyle && (
                        <p><span className="font-medium">Interior Style:</span> {selection.styleAnalysis.interiorStyle.join(', ')}</p>
                      )}
                      {selection.styleAnalysis.designFeatures && (
                        <p><span className="font-medium">Key Features:</span> {selection.styleAnalysis.designFeatures.join(', ')}</p>
                      )}
                      {selection.styleAnalysis.colorScheme && (
                        <p><span className="font-medium">Color Palette:</span> {selection.styleAnalysis.colorScheme}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={() => {
                // Create IDX Broker URL with search parameters based on user selections
                const idxBaseUrl = "https://homesai.idxbroker.com/idx/results/listings?";
                const params = new URLSearchParams();

                // Add required IDX parameters for property search
                params.append("idxID", "d025");
                params.append("pt", "1"); // Property Type Residential

                // Add property status filter (like the working URL)
                params.append("a_propStatus[]", "Active");

                // Add city context
                params.append("ccz", "city");

                // Add price range parameters
                if (selection.priceMin) {
                  params.append("lp", selection.priceMin.toString()); // Low Price
                }
                if (selection.priceMax) {
                  params.append("hp", selection.priceMax.toString()); // High Price
                }

                // Add default price range if none specified
                if (!selection.priceMin && !selection.priceMax) {
                  params.append("lp", "200000"); // Default low price 200K
                  params.append("hp", "800000"); // Default high price 800K
                }

                // Use exact parameter names from working URL
                if (selection.bedrooms) {
                  params.append("bd", selection.bedrooms); // Bedrooms
                }
                if (selection.bathrooms) {
                  params.append("tb", selection.bathrooms); // Total bathrooms
                }

                // Add city and neighborhood if specified
                if (selection.city) {
                  // Clean city name and ensure proper formatting
                  const cleanCity = selection.city.trim();

                  // Use city array format like the working URL
                  // Note: You may need to map city names to city IDs
                  // For now, using city name but consider implementing city ID mapping
                  params.append("city[]", cleanCity);

                  // Also include the address city field as fallback
                  params.append("a_addressCity", cleanCity);
                }
                if (selection.neighborhood) {
                  // Clean neighborhood name
                  const cleanNeighborhood = selection.neighborhood.trim();
                  params.append("neighborhood", cleanNeighborhood);

                  // Also try subdivision field which IDX often uses
                  params.append("a_subdivision", cleanNeighborhood);
                }

                // Add architectural styles if selected
                if (selection.architecturalStyles?.length) {
                  params.append("a_style", selection.architecturalStyles.join(","));
                }

                // Add amenities if selected
                if (selection.amenities?.length) {
                  selection.amenities.forEach((amenity: string) => {
                    params.append("fea", amenity);
                  });
                }

                // Create final URL
                const finalUrl = `${idxBaseUrl}${params.toString()}`;
                console.log('Redirecting to IDX Broker:', finalUrl);

                // Open in new window to preserve user's place in our app
                window.open(finalUrl, '_blank');

                // Also call onComplete to mark workflow as done
                onComplete();
              }}>
                Continue to Properties <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'properties':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">View Available Properties</h2>
            <p className="text-gray-500">Browse properties that match your criteria</p>

            <div className="flex flex-col space-y-4">
              <Button 
                className="w-full"
                onClick={onComplete}
              >
                Browse All Properties <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>

              <Button 
                variant="outline" 
                className="w-full border-primary text-primary"
                onClick={() => onStepChange('service')}
              >
                Request Professional Services <ChevronsRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>Back</Button>
            </div>
          </div>
        );

      case 'amenities':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">What amenities matter most to you?</h2>
              <p className="text-gray-600">Select the features that are important in your ideal home</p>
            </div>

            {/* Property Features */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Property Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'security-system', label: 'Security System', icon: '🔒', priority: 'high' },
                  { id: 'walk-in-closets', label: 'Walk-in Closets', icon: '👔', priority: 'high' },
                  { id: 'laundry-room', label: 'Laundry Room', icon: '🧺', priority: 'high' },
                  { id: 'basement', label: 'Basement', icon: '🏠', priority: 'medium' },
                  { id: 'attic', label: 'Attic', icon: '🏠', priority: 'medium' },
                  { id: 'wine-cellar', label: 'Wine Cellar', icon: '🍷', priority: 'medium' },
                  { id: 'home-theater', label: 'Home Theater', icon: '🎬', priority: 'medium' },
                  { id: 'outdoor-kitchen', label: 'Outdoor Kitchen', icon: '🍳', priority: 'medium' },
                  { id: 'solar-panels', label: 'Solar Panels', icon: '☀️', priority: 'medium' },
                  { id: 'generator', label: 'Generator', icon: '⚡', priority: 'medium' },
                ].map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => toggleAmenity(feature.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors relative ${
                      selection.amenities?.includes(feature.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {feature.priority === 'high' && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          High Priority
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="font-medium">{feature.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Outdoor Amenities */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Outdoor Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'garden', label: 'Garden', icon: '🌸', priority: 'high' },
                  { id: 'patio', label: 'Patio', icon: '🪑', priority: 'high' },
                  { id: 'fire-pit', label: 'Fire Pit', icon: '🔥', priority: 'high' },
                  { id: 'deck', label: 'Deck', icon: '🪵', priority: 'medium' },
                  { id: 'balcony', label: 'Balcony', icon: '🏢', priority: 'medium' },
                  { id: 'sprinkler-system', label: 'Sprinkler System', icon: '💧', priority: 'medium' },
                  { id: 'outdoor-lighting', label: 'Outdoor Lighting', icon: '💡', priority: 'medium' },
                  { id: 'bbq-area', label: 'BBQ Area', icon: '🍖', priority: 'medium' },
                  { id: 'tennis-court', label: 'Tennis Court', icon: '🎾', priority: 'medium' },
                  { id: 'basketball-court', label: 'Basketball Court', icon: '🏀', priority: 'medium' },
                ].map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => toggleAmenity(feature.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors relative ${
                      selection.amenities?.includes(feature.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {feature.priority === 'high' && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          High Priority
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="font-medium">{feature.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Features */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Community Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'security-patrol', label: 'Security Patrol', icon: '👮', priority: 'high' },
                  { id: 'gated-community', label: 'Gated Community', icon: '🚪', priority: 'high' },
                  { id: 'club-house', label: 'Club House', icon: '🏛️', priority: 'medium' },
                  { id: 'community-pool', label: 'Community Pool', icon: '🏊', priority: 'medium' },
                  { id: 'tennis-courts', label: 'Tennis Courts', icon: '🎾', priority: 'medium' },
                  { id: 'golf-course', label: 'Golf Course', icon: '⛳', priority: 'medium' },
                  { id: 'walking-trails', label: 'Walking Trails', icon: '🚶', priority: 'medium' },
                  { id: 'park-access', label: 'Park Access', icon: '🌳', priority: 'medium' },
                  { id: 'guest-parking', label: 'Guest Parking', icon: '🅿️', priority: 'medium' },
                  { id: 'package-service', label: 'Package Service', icon: '📦', priority: 'medium' },
                ].map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => toggleAmenity(feature.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors relative ${
                      selection.amenities?.includes(feature.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {feature.priority === 'high' && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          High Priority
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="font-medium">{feature.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tell us about your design preferences */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Tell us about your design preferences</h3>
              <p className="text-gray-600">Help us understand your style to find properties that match your taste</p>

              {/* Upload Inspiration Images */}
              <div className="space-y-4">
                <Label>Upload Inspiration Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleInspirationUpload}
                    className="hidden"
                    id="inspiration-upload"
                  />
                  <label htmlFor="inspiration-upload" className="cursor-pointer">
                    <div className="space-y-4">
                      <div className="mx-auto h-16 w-16 text-gray-400">
                        <svg className="h-full w-full" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium">Click to upload or drag and drop</p>
                        <p className="text-gray-500">JPG, PNG or WEBP (max 5MB)</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Preview uploaded images */}
                {selection.inspirationImages && selection.inspirationImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selection.inspirationImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Inspiration ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeInspirationImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Inspiration URLs */}
                <div className="space-y-2">
                  <Label>Add Inspiration URLs</Label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/inspiration-image.jpg"
                      value={inspirationUrl}
                      onChange={(e) => setInspirationUrl(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                    />
                    <Button onClick={addInspirationUrl} type="button" variant="outline">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'situation' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <p className="mt-2 text-xs text-center">Your Situation</p>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'financing' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                2
              </div>
              <p className="mt-2 text-xs text-center">Financing</p>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'design' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                3
              </div>
              <p className="mt-2 text-xs text-center">Design Preferences</p>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'properties' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                4
              </div>
              <p className="mt-2 text-xs text-center">Properties</p>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>

            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 'service' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                5
              </div>
              <p className="mt-2 text-xs text-center">Services</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          {renderStepContent()}
        </div>
      </div>
    </>
  );
}