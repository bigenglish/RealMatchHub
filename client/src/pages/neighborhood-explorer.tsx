import React, { useState } from 'react';
import { useLocation, useRoute, useRouter } from 'wouter';
import { MapPin, Home, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CityMap from '@/components/city-map';
import NeighborhoodQuestionnaire from '@/components/neighborhood-questionnaire';

// Types imported from components
import type { QuestionnaireResponse } from '@/components/neighborhood-questionnaire';

type NeighborhoodData = {
  id: string;
  name: string;
  center: google.maps.LatLngLiteral;
  price: string;
  description: string;
  tags: string[];
  paths: google.maps.LatLngLiteral[];
};

enum ExplorerStep {
  CitySelection,
  NeighborhoodMap,
  Questionnaire,
  Results
}

const NeighborhoodExplorer: React.FC = () => {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<ExplorerStep>(ExplorerStep.CitySelection);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodData | null>(null);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse | null>(null);

  // Popular cities data
  const popularCities = [
    { name: "Westside", price: "$1.2M avg", link: "#" },
    { name: "San Fernando Valley", price: "$1.8M avg", link: "https://losangelesforsale.idxbroker.com/i/san-fernando-valley" },
    { name: "South Bay", price: "$1.5M avg", link: "#" },
    { name: "San Gabriel Valley", price: "$950K avg", link: "https://losangelesforsale.idxbroker.com/i/san-gabriel-valley" }
  ];

  // Handler for city selection
  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setStep(ExplorerStep.NeighborhoodMap);
    window.scrollTo(0, 0);
  };

  // Handler for neighborhood selection
  const handleNeighborhoodSelect = (neighborhood: NeighborhoodData) => {
    setSelectedNeighborhood(neighborhood);
    setStep(ExplorerStep.Questionnaire);
    window.scrollTo(0, 0);
  };

  // Handler for questionnaire completion
  const handleQuestionnaireComplete = (responses: QuestionnaireResponse) => {
    setQuestionnaireResponses(responses);
    setStep(ExplorerStep.Results);
    window.scrollTo(0, 0);
    
    // In a real implementation, this data would be sent to the server
    // to be stored in the user's profile and used for recommendations
    console.log('Questionnaire responses:', responses);
  };

  // Go back to previous step
  const handleBack = () => {
    if (step === ExplorerStep.NeighborhoodMap) {
      setStep(ExplorerStep.CitySelection);
    } else if (step === ExplorerStep.Questionnaire) {
      setStep(ExplorerStep.NeighborhoodMap);
    } else if (step === ExplorerStep.Results) {
      setStep(ExplorerStep.Questionnaire);
    }
    window.scrollTo(0, 0);
  };

  // Navigate to home
  const goToHome = () => {
    navigate('/');
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (step) {
      case ExplorerStep.CitySelection:
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold mb-2">Neighborhood Explorer</CardTitle>
              <CardDescription>
                Find your ideal neighborhood by exploring popular cities and answering a few questions about your preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold mb-6">Popular Cities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {popularCities.map((city, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => city.link === "#" ? handleCitySelect(city.name) : window.open(city.link, '_blank')}
                  >
                    <div className="flex items-center">
                      <div className="bg-olive-50 p-3 rounded-full mr-4">
                        <MapPin className="h-5 w-5 text-olive-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{city.name}</h4>
                        <p className="text-sm text-gray-500">{city.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-olive-50 rounded-lg">
                <h3 className="font-semibold mb-2">How It Works</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Select a city you're interested in exploring</li>
                  <li>Choose a specific neighborhood from the interactive map</li>
                  <li>Complete the preferences questionnaire</li>
                  <li>Get personalized insights about your chosen neighborhood</li>
                </ol>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={goToHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              
              <Button 
                className="bg-olive-600 hover:bg-olive-700"
                onClick={() => window.scrollTo(0, 0)}
              >
                Get Started
              </Button>
            </CardFooter>
          </Card>
        );
      
      case ExplorerStep.NeighborhoodMap:
        return (
          <CityMap 
            cityName={selectedCity} 
            onNeighborhoodSelect={handleNeighborhoodSelect}
            onBack={() => setStep(ExplorerStep.CitySelection)}
          />
        );
      
      case ExplorerStep.Questionnaire:
        return (
          <NeighborhoodQuestionnaire 
            onComplete={handleQuestionnaireComplete}
            onCancel={() => setStep(ExplorerStep.NeighborhoodMap)}
            cityName={selectedCity}
          />
        );
      
      case ExplorerStep.Results:
        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Your Neighborhood Match</CardTitle>
                  <CardDescription>
                    Based on your preferences for {selectedNeighborhood?.name} in {selectedCity}
                  </CardDescription>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  93% Match
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Neighborhood Highlights</h3>
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-olive-50 p-2 rounded-full mr-3">
                          <Home className="h-4 w-4 text-olive-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Strong Match: Lifestyle</h4>
                          <p className="text-sm text-gray-600">
                            {selectedNeighborhood?.name} aligns well with your preferences for {' '}
                            {questionnaireResponses?.lifestylePriorities.walkabilityImportance && questionnaireResponses.lifestylePriorities.walkabilityImportance > 3 ? 'walkability, ' : ''}
                            {questionnaireResponses?.lifestylePriorities.natureAccessImportance && questionnaireResponses.lifestylePriorities.natureAccessImportance > 3 ? 'access to nature, ' : ''}
                            {questionnaireResponses?.lifestylePriorities.communityImportance && questionnaireResponses.lifestylePriorities.communityImportance > 3 ? 'community, ' : ''}
                            and more.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-olive-50 p-2 rounded-full mr-3">
                          <MapPin className="h-4 w-4 text-olive-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Property Information</h4>
                          <p className="text-sm text-gray-600">
                            Average home price: {selectedNeighborhood?.price}
                          </p>
                        </div>
                      </div>
                      
                      {selectedNeighborhood && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {selectedNeighborhood.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Next Steps</h3>
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                    <div className="space-y-4">
                      <div className="mb-4">
                        <p className="text-gray-700">
                          Now that we understand your preferences, here are some recommended next steps:
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="bg-olive-50 h-6 w-6 rounded-full flex items-center justify-center text-olive-600 mr-3">1</div>
                          <span>View available properties in {selectedNeighborhood?.name}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-olive-50 h-6 w-6 rounded-full flex items-center justify-center text-olive-600 mr-3">2</div>
                          <span>Connect with a local expert in {selectedCity}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="bg-olive-50 h-6 w-6 rounded-full flex items-center justify-center text-olive-600 mr-3">3</div>
                          <span>Schedule a neighborhood tour</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button className="w-full bg-olive-600 hover:bg-olive-700">
                        Find Properties in {selectedNeighborhood?.name}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Properties You Might Like</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                      <div className="h-40 bg-gray-200">
                        <img 
                          src={`https://images.unsplash.com/photo-${1600596542815 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`}
                          alt="Property" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold">Modern {i === 1 ? 'Condo' : i === 2 ? 'Townhouse' : 'Single Family'}</h4>
                        <p className="text-sm text-gray-500 mb-2">{selectedNeighborhood?.name}, {selectedCity}</p>
                        <p className="font-semibold text-olive-600">${(800 + i * 100).toLocaleString()},000</p>
                        <div className="flex text-sm text-gray-500 mt-2 justify-between">
                          <span>{i + 2} bd</span>
                          <span>{i + 1} ba</span>
                          <span>{(1200 + i * 300).toLocaleString()} sqft</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Questionnaire
              </Button>
              
              <Button 
                onClick={goToHome}
                className="bg-olive-600 hover:bg-olive-700"
              >
                Explore More Areas
              </Button>
            </CardFooter>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default NeighborhoodExplorer;