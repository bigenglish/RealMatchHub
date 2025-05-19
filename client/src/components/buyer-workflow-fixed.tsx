import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Home, Check, ChevronsRight, Landmark,
  Square, Bed, Bath, ImageIcon,
  Stairs, Wine, Video, Utensils, Shield, Sun, Power, Washing, Wardrobe,
  Layout, Mountain, Flower, Droplets, Flame, Activity, Circle,
  Lock, Flag, Map, Tree, ParkingSquare, Package
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

export type Step = 'situation' | 'financing' | 'design' | 'properties' | 'application' | 'service';

const questionnaireType = new URLSearchParams(window.location.search).get('questionnaire-type');

interface BuyerWorkflowProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
  onComplete: () => void;
  downPaymentAmount?: number;
  setDownPaymentAmount: (amount: number) => void;
  needsMortgage?: boolean;
  setNeedsMortgage: (needs: boolean) => void;
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
  const [selection, setSelection] = useState<{
    type?: string | null;
    architecturalStyles?: string[];
    interiorStyles?: string[];
    amenities?: string[];
    neighborhoods?: string[];
    bedrooms?: string;
    bathrooms?: string;
    propertyType?: string;
    sqft?: string;
    priceRange?: number[];
  } | null>(null);

  const handleDownPaymentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9]/g, '');
    setDownPaymentAmount(Number(value) || 0);
  };

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
    const currentAmenities = selection?.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenityLabel)
      ? currentAmenities.filter(a => a !== amenityLabel)
      : [...currentAmenities, amenityLabel];
    setSelection({
      ...selection,
      amenities: updatedAmenities
    });
  };

  const handleNeighborhoodSelection = (neighborhood: string) => {
    const currentNeighborhoods = selection?.neighborhoods || [];
    const newNeighborhoods = currentNeighborhoods.includes(neighborhood)
      ? currentNeighborhoods.filter(n => n !== neighborhood)
      : [...currentNeighborhoods, neighborhood];
    setSelection(prev => ({
      ...prev,
      neighborhoods: newNeighborhoods
    }));
  };

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
            <div>
              <h2 className="text-xl font-semibold mb-4">Important Amenities</h2>
              <p className="text-gray-500 mb-6">Select the amenities that matter most to you</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Important Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { icon: 'Pool', label: "Pool" },
                      { icon: 'Car', label: "Garage" },
                      { icon: 'TreePalm', label: "Yard" },
                      { icon: 'Balcony', label: "Balcony/Patio" },
                      { icon: 'Flame', label: "Fireplace" },
                      { icon: 'Chef', label: "Updated Kitchen" },
                      { icon: 'Bath', label: "Updated Bathrooms" },
                      { icon: 'Home', label: "Central AC" },
                      { icon: 'Sun', label: "Natural Light" },
                      { icon: 'Layout', label: "Open Floor Plan" },
                      { icon: 'Dog', label: "Pet Friendly" },
                      { icon: 'Fence', label: "Fenced Yard" }
                    ].map((amenity) => (
                      <div
                        key={amenity.label}
                        className={`cursor-pointer p-3 rounded-lg border ${
                          selection?.amenities?.includes(amenity.label) 
                            ? "bg-primary/10 border-primary" 
                            : "border-gray-200 hover:border-primary"
                        }`}
                        onClick={() => handleAmenitySelection(amenity.label)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="text-gray-600">
                            {<Home className="h-4 w-4" />}
                          </div>
                          <span className="text-sm">{amenity.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Preferred Neighborhoods</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      "Santa Monica",
                      "Venice",
                      "Marina Del Rey",
                      "Culver City",
                      "Beverly Hills",
                      "West Hollywood",
                      "Manhattan Beach",
                      "Hermosa Beach",
                      "Redondo Beach"
                    ].map((neighborhood) => (
                      <div
                        key={neighborhood}
                        className={`cursor-pointer p-3 rounded-lg border ${
                          selection?.neighborhoods?.includes(neighborhood)
                            ? "bg-primary/10 border-primary"
                            : "border-gray-200 hover:border-primary"
                        }`}
                        onClick={() => {
                          const currentNeighborhoods = selection?.neighborhoods || [];
                          const newNeighborhoods = currentNeighborhoods.includes(neighborhood)
                            ? currentNeighborhoods.filter(n => n !== neighborhood)
                            : [...currentNeighborhoods, neighborhood];
                          setSelection(prev => ({
                            ...prev,
                            neighborhoods: newNeighborhoods
                          }));
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{neighborhood}</span>
                          {selection?.neighborhoods?.includes(neighborhood) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Property Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { icon: 'Home', label: "Basement" },
                      { icon: 'Stairs', label: "Attic" },
                      { icon: 'Wine', label: "Wine Cellar" },
                      { icon: 'Video', label: "Home Theater" },
                      { icon: 'Utensils', label: "Outdoor Kitchen" },
                      { icon: 'Shield', label: "Security System" },
                      { icon: 'Sun', label: "Solar Panels" },
                      { icon: 'Power', label: "Generator" },
                      { icon: 'Washing', label: "Laundry Room" },
                      { icon: 'Wardrobe', label: "Walk-in Closets" }
                    ].map((amenity) => (
                      <div
                        key={amenity.label}
                        className={`cursor-pointer hover:border-primary transition-colors ${
                          selection?.amenities?.includes(amenity.label) ? "bg-primary/10 border-primary" : ""
                        }`}
                        onClick={() => handleAmenitySelection(amenity.label)}
                      >
                        <CardContent className="flex items-center gap-3 p-4">
                          <div className="text-gray-600">
                            <Home className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium">{amenity.label}</span>
                        </CardContent>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Outdoor Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { icon: 'Square', label: "Patio" },
                      { icon: 'Layout', label: "Deck" },
                      { icon: 'Mountain', label: "Balcony" },
                      { icon: 'Flower', label: "Garden" },
                      { icon: 'Droplets', label: "Sprinkler System" },
                      { icon: 'Sun', label: "Outdoor Lighting" },
                      { icon: 'Flame', label: "Fire Pit" },
                      { icon: 'Utensils', label: "BBQ Area" },
                      { icon: 'Activity', label: "Tennis Court" },
                      { icon: 'Circle', label: "Basketball Court" }
                    ].map((amenity) => (
                      <div
                        key={amenity.label}
                        className={`cursor-pointer hover:border-primary transition-colors ${
                          selection?.amenities?.includes(amenity.label) ? "bg-primary/10 border-primary" : ""
                        }`}
                        onClick={() => handleAmenitySelection(amenity.label)}
                      >
                        <CardContent className="flex items-center gap-3 p-4">
                          <div className="text-gray-600">
                            <Home className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium">{amenity.label}</span>
                        </CardContent>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Community Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { icon: 'Lock', label: "Gated Community" },
                      { icon: 'Home', label: "Club House" },
                      { icon: 'Pool', label: "Community Pool" },
                      { icon: 'Activity', label: "Tennis Courts" },
                      { icon: 'Flag', label: "Golf Course" },
                      { icon: 'Map', label: "Walking Trails" },
                      { icon: 'Tree', label: "Park Access" },
                      { icon: 'Shield', label: "Security Patrol" },
                      { icon: 'ParkingSquare', label: "Guest Parking" },
                      { icon: 'Package', label: "Package Service" }
                    ].map((amenity) => (
                      <div
                        key={amenity.label}
                        className={`cursor-pointer hover:border-primary transition-colors ${
                          selection?.amenities?.includes(amenity.label) ? "bg-primary/10 border-primary" : ""
                        }`}
                        onClick={() => handleAmenitySelection(amenity.label)}
                      >
                        <CardContent className="flex items-center gap-3 p-4">
                          <div className="text-gray-600">
                            <Home className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium">{amenity.label}</span>
                        </CardContent>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Property Requirements</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>Bedrooms</Label>
                  <Select value={selection?.bedrooms?.toString() || ""} onValueChange={(value) => setSelection(prev => ({ ...prev, bedrooms: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bedrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Bathrooms</Label>
                  <Select value={selection?.bathrooms?.toString() || ""} onValueChange={(value) => setSelection(prev => ({ ...prev, bathrooms: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bathrooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="1.5">1.5+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Home Type</Label>
                  <Select value={selection?.propertyType || ""} onValueChange={(value) => setSelection(prev => ({ ...prev, propertyType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select home type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment/Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Square Feet</Label>
                  <Select value={selection?.sqft?.toString() || ""} onValueChange={(value) => setSelection(prev => ({ ...prev, sqft: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select square feet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500">Under 500</SelectItem>
                      <SelectItem value="1000">500-1000</SelectItem>
                      <SelectItem value="1500">1000-1500</SelectItem>
                      <SelectItem value="2000">1500-2000</SelectItem>
                      <SelectItem value="2500">2000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Price Range</Label>
                <div className="px-3">
                  <Slider
                    defaultValue={[200000, 800000]}
                    max={2000000}
                    step={50000}
                    onValueChange={(value) => setSelection(prev => ({ ...prev, priceRange: value }))}
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>${selection?.priceRange?.[0]?.toLocaleString() || '200,000'}</span>
                    <span>${selection?.priceRange?.[1]?.toLocaleString() || '800,000'}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              <h2 className="text-xl font-semibold">Design Preferences</h2>
              <p className="text-gray-500">Help us understand your style to find properties that match your taste</p>

              {/* Image Upload Section */}
              <div className="space-y-4">
              <Label>Upload Inspiration Images</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => document.getElementById('imageUpload')?.click()}
              >
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">JPG, PNG or WEBP (max 5MB)</p>
                <input 
                  type="file" 
                  id="imageUpload" 
                  className="hidden" 
                  accept="image/*"
                  multiple
                />
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <Label>Add Inspiration URLs</Label>
                <div className="flex gap-2">
                  <Input placeholder="https://example.com/inspiration" />
                  <Button variant="secondary">Add</Button>
                </div>
              </div>
            </div>

            {/* Architectural Style */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">Architectural Style (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'modern', label: 'Modern/Contemporary', icon: Square },
                  { id: 'traditional', label: 'Traditional', icon: Home },
                  { id: 'craftsman', label: 'Craftsman', icon: Home },
                  { id: 'mediterranean', label: 'Mediterranean', icon: Home },
                  { id: 'colonial', label: 'Colonial', icon: Landmark },
                  { id: 'farmhouse', label: 'Modern Farmhouse', icon: Home },
                  { id: 'ranch', label: 'Ranch', icon: Home },
                  { id: 'victorian', label: 'Victorian', icon: Landmark }
                ].map((style) => (
                  <div
                    key={style.id}
                    onClick={() => {
                      const current = selection?.architecturalStyles || [];
                      const newStyles = current.includes(style.id)
                        ? current.filter(id => id !== style.id)
                        : [...current, style.id];
                      setSelection(prev => ({
                        ...prev,
                        architecturalStyles: newStyles
                      }));
                    }}
                    className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                      selection?.architecturalStyles?.includes(style.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      {<style.icon className="h-6 w-6 text-primary" />}
                    </div>
                    <p className="text-sm font-medium">{style.label}</p>
                    {selection?.architecturalStyles?.includes(style.id) && (
                      <Check className="h-4 w-4 text-primary mx-auto mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

            {/* Interior Style */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">Interior Style (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'minimalist', label: 'Minimalist', icon: Square },
                  { id: 'contemporary', label: 'Contemporary', icon: Bed },
                  { id: 'traditional', label: 'Traditional', icon: Home },
                  { id: 'rustic', label: 'Rustic', icon: Home },
                  { id: 'industrial', label: 'Industrial', icon: Square },
                  { id: 'coastal', label: 'Coastal', icon: Home },
                  { id: 'bohemian', label: 'Bohemian', icon: ImageIcon },
                  { id: 'scandinavian', label: 'Scandinavian', icon: Square }
                ].map((style) => (
                  <div
                    key={style.id}
                    onClick={() => {
                      const current = selection?.interiorStyles || [];
                      const newStyles = current.includes(style.id)
                        ? current.filter(id => id !== style.id)
                        : [...current, style.id];
                      setSelection(prev => ({
                        ...prev,
                        interiorStyles: newStyles
                      }));
                    }}
                    className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                      selection?.interiorStyles?.includes(style.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      {<style.icon className="h-6 w-6 text-primary" />}
                    </div>
                    <p className="text-sm font-medium">{style.label}</p>
                    {selection?.interiorStyles?.includes(style.id) && (
                      <Check className="h-4 w-4 text-primary mx-auto mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={() => {
                const idxBaseUrl = "https://losangelesforsale.idxbroker.com/idx/results/listings?";
                const params = new URLSearchParams();

                if (selection?.architecturalStyles?.length) {
                  params.append("a_style", selection.architecturalStyles.join(","));
                }

                if (selection?.amenities?.length) {
                  selection.amenities.forEach(amenity => {
                    params.append("fea", amenity);
                  });
                }

                window.location.href = idxBaseUrl + params.toString();
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

      case 'service':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Request Professional Services</h2>
            <p className="text-gray-500">Connect with real estate professionals who can help with your home buying journey</p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">Available Services:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Real Estate Agents to guide your property search</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Home Inspectors to evaluate properties</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Mortgage Lenders to finance your purchase</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Insurance Agents to protect your investment</span>
                </li>
              </ul>
            </div>

            <Button 
              className="w-full"
              onClick={() => window.location.href = '/request-service?type=buyer'}
            >
              Connect with a Professional <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center mt-2">
              <button
                onClick={onComplete}
                className="text-gray-500 text-sm hover:underline"
              >
                Skip and continue to properties
              </button>
            </div>
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack}>Back</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
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