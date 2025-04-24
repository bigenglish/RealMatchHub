import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

// Define the types for the questionnaire responses
export interface QuestionnaireResponse {
  lifestylePriorities: {
    nightlifeImportance: number;
    quietEnvironmentImportance: number;
    walkabilityImportance: number;
    natureAccessImportance: number;
    communityImportance: number;
    localEventsLikelihood: number;
    petFriendlyImportance: number;
    diversityImportance: number;
    localBusinessLikelihood: number;
    culturalProximityImportance: number;
  };
  commute: {
    commuteImportance: number;
    preferredTransportation: string;
    publicTransportImportance: number;
    highwayAccessImportance: number;
    maxCommuteTime: number;
    walkabilityForErrandsImportance: number;
    publicTransportLikelihood: number;
  };
  family: {
    hasChildren: string;
    schoolsImportance: number;
    childrenAgeRange: string;
    parksProximityImportance: number;
    childcareImportance: number;
    familyFriendlyLikelihood: number;
    librariesImportance: number;
  };
  amenities: {
    groceryProximityImportance: number;
    healthcareProximityImportance: number;
    fitnessAccessImportance: number;
    restaurantProximityImportance: number;
    entertainmentProximityImportance: number;
    farmersMarketsImportance: number;
    localAmenitiesLikelihood: number;
    servicesProximityImportance: number;
  };
  budget: {
    considerCostOfLiving: boolean;
    hoaComfort: number;
    appreciationImportance: number;
  };
};

// Default/initial state
const initialResponses: QuestionnaireResponse = {
  lifestylePriorities: {
    nightlifeImportance: 3,
    quietEnvironmentImportance: 3,
    walkabilityImportance: 3,
    natureAccessImportance: 3,
    communityImportance: 3,
    localEventsLikelihood: 5,
    petFriendlyImportance: 3,
    diversityImportance: 3,
    localBusinessLikelihood: 5,
    culturalProximityImportance: 3,
  },
  commute: {
    commuteImportance: 3,
    preferredTransportation: 'Car',
    publicTransportImportance: 3,
    highwayAccessImportance: 3,
    maxCommuteTime: 30,
    walkabilityForErrandsImportance: 3,
    publicTransportLikelihood: 5,
  },
  family: {
    hasChildren: 'No',
    schoolsImportance: 3,
    childrenAgeRange: 'Not Applicable',
    parksProximityImportance: 3,
    childcareImportance: 3,
    familyFriendlyLikelihood: 5,
    librariesImportance: 3,
  },
  amenities: {
    groceryProximityImportance: 3,
    healthcareProximityImportance: 3,
    fitnessAccessImportance: 3,
    restaurantProximityImportance: 3,
    entertainmentProximityImportance: 3,
    farmersMarketsImportance: 3,
    localAmenitiesLikelihood: 5,
    servicesProximityImportance: 3,
  },
  budget: {
    considerCostOfLiving: true,
    hoaComfort: 3,
    appreciationImportance: 3,
  },
};

// Sections of the questionnaire
const sections = [
  'Lifestyle & Priorities',
  'Commute & Transportation',
  'Family & Education',
  'Amenities & Local Services',
  'Budget & Financial Considerations',
];

interface NeighborhoodQuestionnaireProps {
  onComplete: (responses: QuestionnaireResponse) => void;
  onCancel: () => void;
  cityName: string;
}

const NeighborhoodQuestionnaire: React.FC<NeighborhoodQuestionnaireProps> = ({ 
  onComplete, 
  onCancel,
  cityName
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<QuestionnaireResponse>(initialResponses);
  
  // Progress calculation
  const progress = ((currentSection + 1) / sections.length) * 100;
  
  // Update responses
  const updateResponse = (section: keyof QuestionnaireResponse, field: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  // Navigation
  const goToNextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(curr => curr + 1);
      window.scrollTo(0, 0);
    } else {
      onComplete(responses);
    }
  };
  
  const goToPrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(curr => curr - 1);
      window.scrollTo(0, 0);
    } else {
      onCancel();
    }
  };

  // Render the importance scale helper
  const renderImportanceHelper = () => (
    <div className="text-sm text-gray-500 mb-6 p-4 bg-gray-50 rounded-md">
      <p className="font-medium mb-2">Rating Scale Guide:</p>
      <div className="flex justify-between">
        <span>1 - Not at all important</span>
        <span>5 - Extremely important</span>
      </div>
    </div>
  );

  // Render the likelihood scale helper
  const renderLikelihoodHelper = () => (
    <div className="text-sm text-gray-500 mb-6 p-4 bg-gray-50 rounded-md">
      <p className="font-medium mb-2">Likelihood Scale Guide:</p>
      <div className="flex justify-between">
        <span>0 - Not at all likely</span>
        <span>10 - Extremely likely</span>
      </div>
    </div>
  );

  // Sections content rendering
  const renderSectionContent = () => {
    switch (currentSection) {
      case 0: // Lifestyle & Priorities
        return (
          <>
            {renderImportanceHelper()}
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>How important is a vibrant nightlife scene to your neighborhood choice?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.lifestylePriorities.nightlifeImportance} 
                    onChange={(val) => updateResponse('lifestylePriorities', 'nightlifeImportance', val)} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>How important is a quiet and peaceful environment?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.lifestylePriorities.quietEnvironmentImportance} 
                    onChange={(val) => updateResponse('lifestylePriorities', 'quietEnvironmentImportance', val)} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>How important is easy walkability to shops and restaurants?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.lifestylePriorities.walkabilityImportance} 
                    onChange={(val) => updateResponse('lifestylePriorities', 'walkabilityImportance', val)} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>How important is access to nature and green spaces (parks, trails)?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.lifestylePriorities.natureAccessImportance} 
                    onChange={(val) => updateResponse('lifestylePriorities', 'natureAccessImportance', val)} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>How important is a strong sense of community in your neighborhood?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.lifestylePriorities.communityImportance} 
                    onChange={(val) => updateResponse('lifestylePriorities', 'communityImportance', val)} 
                  />
                </div>
              </div>
              
              {renderLikelihoodHelper()}
              
              <div className="space-y-3">
                <Label>On a scale of 0 to 10, how likely are you to enjoy living in a neighborhood with frequent local events and festivals?</Label>
                <div className="pt-2">
                  <LikelihoodSlider 
                    value={responses.lifestylePriorities.localEventsLikelihood} 
                    onChange={(val) => updateResponse('lifestylePriorities', 'localEventsLikelihood', val)} 
                  />
                </div>
              </div>
            </div>
          </>
        );
        
      case 1: // Commute & Transportation
        return (
          <>
            {renderImportanceHelper()}
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>How important is a short commute to your primary destination (work, school)?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.commute.commuteImportance} 
                    onChange={(val) => updateResponse('commute', 'commuteImportance', val)} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>What is your preferred mode of transportation for your primary commute?</Label>
                <Select 
                  value={responses.commute.preferredTransportation}
                  onValueChange={(val) => updateResponse('commute', 'preferredTransportation', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transportation mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Car">Car</SelectItem>
                    <SelectItem value="Public Transportation">Public Transportation</SelectItem>
                    <SelectItem value="Walking">Walking</SelectItem>
                    <SelectItem value="Biking">Biking</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label>What is your ideal maximum commute time (in minutes)?</Label>
                <Input 
                  type="number" 
                  value={responses.commute.maxCommuteTime}
                  onChange={(e) => updateResponse('commute', 'maxCommuteTime', parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-3">
                <Label>How important is walkability for everyday errands (groceries, pharmacy)?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.commute.walkabilityForErrandsImportance} 
                    onChange={(val) => updateResponse('commute', 'walkabilityForErrandsImportance', val)} 
                  />
                </div>
              </div>
              
              {renderLikelihoodHelper()}
              
              <div className="space-y-3">
                <Label>On a scale of 0 to 10, how likely are you to consider a neighborhood with excellent public transportation options?</Label>
                <div className="pt-2">
                  <LikelihoodSlider 
                    value={responses.commute.publicTransportLikelihood} 
                    onChange={(val) => updateResponse('commute', 'publicTransportLikelihood', val)} 
                  />
                </div>
              </div>
            </div>
          </>
        );
        
      case 2: // Family & Education
        return (
          <>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Do you have children or plan to in the future?</Label>
                <RadioGroup 
                  value={responses.family.hasChildren}
                  onValueChange={(val) => updateResponse('family', 'hasChildren', val)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="hasChildren-yes" />
                    <Label htmlFor="hasChildren-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="hasChildren-no" />
                    <Label htmlFor="hasChildren-no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Maybe" id="hasChildren-maybe" />
                    <Label htmlFor="hasChildren-maybe">Maybe</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {responses.family.hasChildren !== 'No' && (
                <>
                  {renderImportanceHelper()}
                  
                  <div className="space-y-3">
                    <Label>If yes, how important are highly-rated schools in your neighborhood choice?</Label>
                    <div className="pt-2">
                      <ImportanceSlider 
                        value={responses.family.schoolsImportance} 
                        onChange={(val) => updateResponse('family', 'schoolsImportance', val)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>If applicable, what is the age range of your children or anticipated children?</Label>
                    <Select 
                      value={responses.family.childrenAgeRange}
                      onValueChange={(val) => updateResponse('family', 'childrenAgeRange', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Infant/Toddler">Infant/Toddler</SelectItem>
                        <SelectItem value="Elementary">Elementary</SelectItem>
                        <SelectItem value="Middle School">Middle School</SelectItem>
                        <SelectItem value="High School">High School</SelectItem>
                        <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>How important is proximity to parks and playgrounds for children?</Label>
                    <div className="pt-2">
                      <ImportanceSlider 
                        value={responses.family.parksProximityImportance} 
                        onChange={(val) => updateResponse('family', 'parksProximityImportance', val)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>How important is the availability of childcare facilities in the neighborhood?</Label>
                    <div className="pt-2">
                      <ImportanceSlider 
                        value={responses.family.childcareImportance} 
                        onChange={(val) => updateResponse('family', 'childcareImportance', val)} 
                      />
                    </div>
                  </div>
                </>
              )}
              
              {renderLikelihoodHelper()}
              
              <div className="space-y-3">
                <Label>On a scale of 0 to 10, how likely are you to prioritize a neighborhood known for its family-friendly atmosphere?</Label>
                <div className="pt-2">
                  <LikelihoodSlider 
                    value={responses.family.familyFriendlyLikelihood} 
                    onChange={(val) => updateResponse('family', 'familyFriendlyLikelihood', val)} 
                  />
                </div>
              </div>
            </div>
          </>
        );
        
      case 3: // Amenities & Local Services
        return (
          <>
            {renderImportanceHelper()}
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>How important is proximity to grocery stores and everyday shopping?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.amenities.groceryProximityImportance} 
                    onChange={(val) => updateResponse('amenities', 'groceryProximityImportance', val)} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>How important is proximity to healthcare facilities (hospitals, clinics)?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.amenities.healthcareProximityImportance} 
                    onChange={(val) => updateResponse('amenities', 'healthcareProximityImportance', val)} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>How important is access to gyms and fitness centers?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.amenities.fitnessAccessImportance} 
                    onChange={(val) => updateResponse('amenities', 'fitnessAccessImportance', val)} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>How important is proximity to restaurants and cafes?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.amenities.restaurantProximityImportance} 
                    onChange={(val) => updateResponse('amenities', 'restaurantProximityImportance', val)} 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>How important is proximity to entertainment venues (movie theaters, live music)?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.amenities.entertainmentProximityImportance} 
                    onChange={(val) => updateResponse('amenities', 'entertainmentProximityImportance', val)} 
                  />
                </div>
              </div>
              
              {renderLikelihoodHelper()}
              
              <div className="space-y-3">
                <Label>On a scale of 0 to 10, how likely are you to choose a neighborhood with a wide variety of local amenities within walking distance?</Label>
                <div className="pt-2">
                  <LikelihoodSlider 
                    value={responses.amenities.localAmenitiesLikelihood} 
                    onChange={(val) => updateResponse('amenities', 'localAmenitiesLikelihood', val)} 
                  />
                </div>
              </div>
            </div>
          </>
        );
        
      case 4: // Budget & Financial Considerations
        return (
          <>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Are you also considering the overall cost of living in a neighborhood (beyond just housing prices)?</Label>
                <RadioGroup 
                  value={responses.budget.considerCostOfLiving ? "Yes" : "No"}
                  onValueChange={(val) => updateResponse('budget', 'considerCostOfLiving', val === "Yes")}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="costOfLiving-yes" />
                    <Label htmlFor="costOfLiving-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="costOfLiving-no" />
                    <Label htmlFor="costOfLiving-no">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {renderImportanceHelper()}
              
              <div className="space-y-3">
                <Label>How comfortable are you with potential Homeowners Association (HOA) fees?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.budget.hoaComfort} 
                    onChange={(val) => updateResponse('budget', 'hoaComfort', val)} 
                    labels={[
                      "Not comfortable at all",
                      "Slightly uncomfortable",
                      "Neutral",
                      "Somewhat comfortable",
                      "Very comfortable"
                    ]}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>How important is the potential for future property value appreciation in a neighborhood?</Label>
                <div className="pt-2">
                  <ImportanceSlider 
                    value={responses.budget.appreciationImportance} 
                    onChange={(val) => updateResponse('budget', 'appreciationImportance', val)} 
                  />
                </div>
              </div>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Neighborhood Preferences for {cityName}</CardTitle>
            <CardDescription>
              Help us find the perfect neighborhood for you in {cityName}
            </CardDescription>
          </div>
          <div className="text-sm text-gray-500">
            Step {currentSection + 1} of {sections.length}
          </div>
        </div>
        
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          
          <div className="mt-2 flex justify-between text-sm">
            {sections.map((section, idx) => (
              <div 
                key={idx} 
                className={`text-xs font-medium ${
                  idx <= currentSection ? 'text-olive-600' : 'text-gray-400'
                }`}
                style={{ width: `${100 / sections.length}%`, textAlign: 'center' }}
              >
                {section}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <h3 className="text-xl font-bold mb-6">{sections[currentSection]}</h3>
        {renderSectionContent()}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-6 border-t">
        <Button 
          variant="outline" 
          onClick={goToPrevSection}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentSection === 0 ? 'Back to Map' : 'Previous'}
        </Button>
        
        <Button 
          onClick={goToNextSection}
          className="bg-olive-600 hover:bg-olive-700 flex items-center gap-2"
        >
          {currentSection === sections.length - 1 ? (
            <>
              <span>Complete</span>
              <Check className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Helper components
interface ImportanceSliderProps {
  value: number;
  onChange: (value: number) => void;
  labels?: string[];
}

const ImportanceSlider: React.FC<ImportanceSliderProps> = ({ value, onChange, labels }) => {
  const defaultLabels = [
    "Not at all important",
    "Slightly important",
    "Moderately important",
    "Very important",
    "Extremely important"
  ];
  
  const sliderLabels = labels || defaultLabels;
  
  return (
    <div className="space-y-6">
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        max={5}
        min={1}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500">
        {sliderLabels.map((label, i) => (
          <div 
            key={i} 
            className={`text-center ${value === i + 1 ? 'font-bold text-olive-600' : ''}`}
            style={{ width: `${100 / 5}%` }}
          >
            {i + 1}
            <div className="mt-1 hidden sm:block">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface LikelihoodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const LikelihoodSlider: React.FC<LikelihoodSliderProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-6">
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        max={10}
        min={0}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500">
        {[0, 2, 4, 6, 8, 10].map((val) => (
          <div 
            key={val} 
            className={`text-center ${value === val ? 'font-bold text-olive-600' : ''}`}
          >
            {val}
            <div className="mt-1">
              {val === 0 && "Not likely"}
              {val === 5 && "Somewhat likely"}
              {val === 10 && "Extremely likely"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NeighborhoodQuestionnaire;