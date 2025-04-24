import React, { useState, useEffect } from 'react';
import { useLocation, useRoute, useRouter } from 'wouter';
import { MapPin, Home, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import CityMap from '@/components/city-map';
import NeighborhoodQuestionnaire from '@/components/neighborhood-questionnaire';

// Types imported from components
import type { QuestionnaireResponse } from '@/components/neighborhood-questionnaire';

// Type for a Point of Interest
interface NeighborhoodPOI {
  type: string;
  name: string;
  location: [number, number]; // [latitude, longitude]
  description?: string;
}

// Type for the neighborhood data from the API
interface APINeighborhoodData {
  id: string;
  name: string;
  cityName: string;
  boundaries: {
    type: string;
    coordinates: number[][][]; // GeoJSON polygon coordinates
  };
  center: [number, number]; // Center point [latitude, longitude]
  personalizedScore: number;
  walkabilityScore: number;
  schoolScore: number;
  greenSpaceScore: number;
  transitScore: number;
  nightlifeScore: number;
  priceRange: string;
  medianHomePrice: number;
  description: string;
  relevantPOIs: NeighborhoodPOI[];
}

// Type for the city map component
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

  // API data states
  const [personalizedNeighborhoods, setPersonalizedNeighborhoods] = useState<APINeighborhoodData[]>([]);
  const [selectedAPINeighborhood, setSelectedAPINeighborhood] = useState<APINeighborhoodData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Popular cities data
  const popularCities = [
    { name: "Los Angeles", price: "$1.2M avg" },
    { name: "San Francisco", price: "$1.8M avg" },
    { name: "New York", price: "$1.5M avg" },
    { name: "Miami", price: "$950K avg" }
  ];

  // Handler for city selection
  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setStep(ExplorerStep.Questionnaire);
    window.scrollTo(0, 0);
  };

  // Handler for questionnaire completion
  const handleQuestionnaireComplete = async (responses: QuestionnaireResponse) => {
    setQuestionnaireResponses(responses);
    setStep(ExplorerStep.NeighborhoodMap);
    window.scrollTo(0, 0);
  };

  // Handler for neighborhood selection
  const handleNeighborhoodSelect = async (neighborhood: NeighborhoodData) => {
    setSelectedNeighborhood(neighborhood);

    // Fetch personalized data from the API
    if (selectedCity && questionnaireResponses) {
      await fetchPersonalizedNeighborhoods(selectedCity, questionnaireResponses);
    }

    setStep(ExplorerStep.Results);
    window.scrollTo(0, 0);
  };

  // Fetch personalized neighborhood data from the API
  const fetchPersonalizedNeighborhoods = async (city: string, responses: QuestionnaireResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/neighborhoods/personalized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city,
          responses
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch personalized neighborhoods: ${response.statusText}`);
      }

      const data: APINeighborhoodData[] = await response.json();
      console.log('Personalized neighborhoods data:', data);

      setPersonalizedNeighborhoods(data);

      // If we have a selected neighborhood, find its equivalent in the API data
      if (selectedNeighborhood) {
        const matchingNeighborhood = data.find(n => n.id === selectedNeighborhood.id);
        if (matchingNeighborhood) {
          setSelectedAPINeighborhood(matchingNeighborhood);
        }
      }

      return data;
    } catch (err) {
      console.error('Error fetching personalized neighborhoods:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return [] as APINeighborhoodData[];
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous step
  const handleBack = () => {
    if (step === ExplorerStep.NeighborhoodMap) {
      setStep(ExplorerStep.Questionnaire);
    } else if (step === ExplorerStep.Results) {
      setStep(ExplorerStep.NeighborhoodMap);
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
                    onClick={() => handleCitySelect(city.name)}
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
                  <li>Complete the preferences questionnaire</li>
                  <li>Choose a specific neighborhood from the interactive map</li>
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
            onBack={() => setStep(ExplorerStep.Questionnaire)}
          />
        );

      case ExplorerStep.Questionnaire:
        return (
          <NeighborhoodQuestionnaire 
            onComplete={handleQuestionnaireComplete}
            onCancel={() => setStep(ExplorerStep.CitySelection)}
            cityName={selectedCity}
          />
        );

      case ExplorerStep.Results:
        if (isLoading) {
          return (
            <Card className="w-full max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Analyzing Your Preferences</CardTitle>
                <CardDescription>
                  We're calculating your personalized neighborhood matches...
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-olive-600 animate-spin mb-4" />
                <p className="text-gray-500">This may take a few moments</p>
              </CardContent>
            </Card>
          );
        }

        if (error) {
          return (
            <Card className="w-full max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-red-600">Error</CardTitle>
                <CardDescription>
                  We encountered an issue analyzing your neighborhood preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{error}</p>
                <Button onClick={() => setStep(ExplorerStep.Questionnaire)}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          );
        }

        // Use the API data if available, fall back to the original neighborhood data otherwise
        const neighborhood = selectedAPINeighborhood || selectedNeighborhood;
        const matchScore = selectedAPINeighborhood 
          ? Math.round(selectedAPINeighborhood.personalizedScore * 100) 
          : 93; // fallback score

        return (
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Your Neighborhood Match</CardTitle>
                  <CardDescription>
                    Based on your preferences for {neighborhood?.name || selectedNeighborhood?.name} in {selectedCity}
                  </CardDescription>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  {matchScore}% Match
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Neighborhood Highlights</h3>
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                    <div className="space-y-4">
                      {selectedAPINeighborhood ? (
                        <>
                          <div className="flex items-start">
                            <div className="bg-olive-50 p-2 rounded-full mr-3">
                              <Home className="h-4 w-4 text-olive-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Strong Match: Lifestyle</h4>
                              <p className="text-sm text-gray-600">
                                {selectedAPINeighborhood.name} aligns well with your preferences for {' '}
                                {selectedAPINeighborhood.walkabilityScore > 0.75 ? 'walkability, ' : ''}
                                {selectedAPINeighborhood.greenSpaceScore > 0.75 ? 'access to nature, ' : ''}
                                {selectedAPINeighborhood.transitScore > 0.75 ? 'public transit, ' : ''}
                                {selectedAPINeighborhood.nightlifeScore > 0.75 ? 'nightlife, ' : ''}
                                {selectedAPINeighborhood.schoolScore > 0.75 ? 'education, ' : ''}
                                and more.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="font-semibold">Category Scores:</p>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Walkability</span>
                                  <span>{Math.round(selectedAPINeighborhood.walkabilityScore * 100)}%</span>
                                </div>
                                <Progress value={selectedAPINeighborhood.walkabilityScore * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Green Space</span>
                                  <span>{Math.round(selectedAPINeighborhood.greenSpaceScore * 100)}%</span>
                                </div>
                                <Progress value={selectedAPINeighborhood.greenSpaceScore * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Schools</span>
                                  <span>{Math.round(selectedAPINeighborhood.schoolScore * 100)}%</span>
                                </div>
                                <Progress value={selectedAPINeighborhood.schoolScore * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Transit</span>
                                  <span>{Math.round(selectedAPINeighborhood.transitScore * 100)}%</span>
                                </div>
                                <Progress value={selectedAPINeighborhood.transitScore * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Nightlife</span>
                                  <span>{Math.round(selectedAPINeighborhood.nightlifeScore * 100)}%</span>
                                </div>
                                <Progress value={selectedAPINeighborhood.nightlifeScore * 100} className="h-2" />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <div className="bg-olive-50 p-2 rounded-full mr-3">
                              <MapPin className="h-4 w-4 text-olive-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Property Information</h4>
                              <p className="text-sm text-gray-600">
                                Price Range: {selectedAPINeighborhood.priceRange}<br />
                                Median Home Price: ${selectedAPINeighborhood.medianHomePrice.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {selectedAPINeighborhood.relevantPOIs && selectedAPINeighborhood.relevantPOIs.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Points of Interest</h4>
                              <div className="space-y-2">
                                {selectedAPINeighborhood.relevantPOIs.slice(0, 5).map((poi, index) => (
                                  <div key={index} className="flex items-start">
                                    <Badge className="mr-2">{poi.type}</Badge>
                                    <span className="text-sm">{poi.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
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
                        </>
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

              {personalizedNeighborhoods.length > 1 ? (
                <div>
                  <h3 className="text-xl font-bold mb-4">Other Neighborhoods You Might Like</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {personalizedNeighborhoods
                      .filter(n => n.id !== selectedAPINeighborhood?.id)
                      .slice(0, 3)
                      .map((n, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                          <div className="p-4">
                            <h4 className="font-semibold">{n.name}</h4>
                            <p className="text-sm text-gray-500">{n.cityName}</p>
                            <div className="flex justify-between items-center mt-3">
                              <span className="font-bold text-sm">{n.priceRange}</span>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                {Math.round(n.personalizedScore * 100)}% Match
                              </Badge>
                            </div>
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Overall Score</span>
                                <span>{Math.round(n.personalizedScore * 100)}%</span>
                              </div>
                              <Progress value={n.personalizedScore * 100} className="h-1" />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
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
              )}
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