import { QuestionnaireResponse } from "../client/src/components/neighborhood-questionnaire";

// Types for neighborhood data
export interface NeighborhoodPOI {
  type: string;
  name: string;
  location: [number, number]; // [latitude, longitude]
  description?: string;
}

export interface NeighborhoodData {
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

// Sample neighborhood data for demonstration
// In a real implementation, this would be fetched from a database or external API
const neighborhoodDatabase: Record<string, NeighborhoodData[]> = {
  "Los Angeles": [
    {
      id: "downtown-la",
      name: "Downtown LA",
      cityName: "Los Angeles",
      boundaries: {
        type: "Polygon",
        coordinates: [[[34.047, -118.251], [34.047, -118.241], [34.037, -118.241], [34.037, -118.251], [34.047, -118.251]]]
      },
      center: [34.042, -118.246],
      personalizedScore: 0,
      walkabilityScore: 0.92,
      schoolScore: 0.68,
      greenSpaceScore: 0.75,
      transitScore: 0.88,
      nightlifeScore: 0.95,
      priceRange: "$500K - $2M",
      medianHomePrice: 750000,
      description: "Downtown LA is the central business district of Los Angeles, featuring high-rise buildings, cultural attractions, and diverse dining and entertainment options.",
      relevantPOIs: [
        { type: "Park", name: "Grand Park", location: [34.053, -118.243], description: "Public park with outdoor community events" },
        { type: "Restaurant", name: "Bestia", location: [34.045, -118.262], description: "Popular Italian restaurant" },
        { type: "Cultural", name: "The Broad", location: [34.051, -118.251], description: "Contemporary art museum" }
      ]
    },
    {
      id: "santa-monica",
      name: "Santa Monica",
      cityName: "Los Angeles",
      boundaries: {
        type: "Polygon",
        coordinates: [[[34.024, -118.5], [34.024, -118.48], [34.004, -118.48], [34.004, -118.5], [34.024, -118.5]]]
      },
      center: [34.014, -118.49],
      personalizedScore: 0,
      walkabilityScore: 0.88,
      schoolScore: 0.82,
      greenSpaceScore: 0.90,
      transitScore: 0.75,
      nightlifeScore: 0.80,
      priceRange: "$800K - $3M",
      medianHomePrice: 1800000,
      description: "Santa Monica is a beachfront city with the iconic Santa Monica Pier, shopping on the Third Street Promenade, and beautiful coastal views.",
      relevantPOIs: [
        { type: "Beach", name: "Santa Monica Beach", location: [34.009, -118.498], description: "Popular beach with the iconic pier" },
        { type: "Shopping", name: "Third Street Promenade", location: [34.016, -118.496], description: "Outdoor shopping district" },
        { type: "Park", name: "Palisades Park", location: [34.015, -118.492], description: "Park with ocean views along the cliffs" }
      ]
    },
    {
      id: "hollywood",
      name: "Hollywood",
      cityName: "Los Angeles",
      boundaries: {
        type: "Polygon",
        coordinates: [[[34.103, -118.333], [34.103, -118.313], [34.083, -118.313], [34.083, -118.333], [34.103, -118.333]]]
      },
      center: [34.093, -118.323],
      personalizedScore: 0,
      walkabilityScore: 0.85,
      schoolScore: 0.72,
      greenSpaceScore: 0.68,
      transitScore: 0.80,
      nightlifeScore: 0.90,
      priceRange: "$600K - $2.5M",
      medianHomePrice: 1200000,
      description: "Hollywood is known for its entertainment industry, the Walk of Fame, and iconic landmarks like the Hollywood Sign.",
      relevantPOIs: [
        { type: "Landmark", name: "Hollywood Walk of Fame", location: [34.101, -118.326], description: "Sidewalk stars honoring celebrities" },
        { type: "Entertainment", name: "Dolby Theatre", location: [34.102, -118.339], description: "Home of the Academy Awards" },
        { type: "Cultural", name: "Hollywood Bowl", location: [34.112, -118.339], description: "Historic amphitheater for concerts" }
      ]
    }
  ],
  "San Francisco": [
    {
      id: "mission-district",
      name: "Mission District",
      cityName: "San Francisco",
      boundaries: {
        type: "Polygon",
        coordinates: [[[37.765, -122.42], [37.765, -122.4], [37.75, -122.4], [37.75, -122.42], [37.765, -122.42]]]
      },
      center: [37.758, -122.41],
      personalizedScore: 0,
      walkabilityScore: 0.95,
      schoolScore: 0.78,
      greenSpaceScore: 0.70,
      transitScore: 0.92,
      nightlifeScore: 0.94,
      priceRange: "$800K - $2M",
      medianHomePrice: 1250000,
      description: "The Mission District is known for its vibrant culture, Latin American influence, colorful murals, and diverse dining scene.",
      relevantPOIs: [
        { type: "Park", name: "Dolores Park", location: [37.759, -122.426], description: "Popular park with city views" },
        { type: "Food", name: "Mission Taquerias", location: [37.763, -122.419], description: "Famous for authentic Mexican food" },
        { type: "Cultural", name: "Clarion Alley", location: [37.762, -122.415], description: "Street with colorful murals" }
      ]
    },
    {
      id: "nob-hill",
      name: "Nob Hill",
      cityName: "San Francisco",
      boundaries: {
        type: "Polygon",
        coordinates: [[[37.795, -122.42], [37.795, -122.4], [37.785, -122.4], [37.785, -122.42], [37.795, -122.42]]]
      },
      center: [37.79, -122.41],
      personalizedScore: 0,
      walkabilityScore: 0.88,
      schoolScore: 0.85,
      greenSpaceScore: 0.65,
      transitScore: 0.90,
      nightlifeScore: 0.80,
      priceRange: "$1M - $5M",
      medianHomePrice: 1900000,
      description: "Nob Hill is an affluent neighborhood with luxury hotels, historic architecture, and impressive views of the city and bay.",
      relevantPOIs: [
        { type: "Landmark", name: "Grace Cathedral", location: [37.791, -122.413], description: "Gothic-style Episcopal cathedral" },
        { type: "Hotel", name: "Fairmont Hotel", location: [37.792, -122.413], description: "Historic luxury hotel" },
        { type: "Park", name: "Huntington Park", location: [37.791, -122.412], description: "Small urban park with fountain" }
      ]
    }
  ],
  "New York": [
    {
      id: "upper-east-side",
      name: "Upper East Side",
      cityName: "New York",
      boundaries: {
        type: "Polygon",
        coordinates: [[[40.78, -73.96], [40.78, -73.94], [40.77, -73.94], [40.77, -73.96], [40.78, -73.96]]]
      },
      center: [40.775, -73.95],
      personalizedScore: 0,
      walkabilityScore: 0.90,
      schoolScore: 0.93,
      greenSpaceScore: 0.88,
      transitScore: 0.95,
      nightlifeScore: 0.75,
      priceRange: "$1M - $10M+",
      medianHomePrice: 2500000,
      description: "The Upper East Side is a wealthy residential area with a mix of luxury co-ops and condos, museums along Museum Mile, and Central Park access.",
      relevantPOIs: [
        { type: "Museum", name: "The Metropolitan Museum of Art", location: [40.779, -73.963], description: "World-renowned art museum" },
        { type: "Park", name: "Central Park", location: [40.772, -73.966], description: "Massive urban park" },
        { type: "Shopping", name: "Madison Avenue", location: [40.776, -73.962], description: "Luxury shopping district" }
      ]
    },
    {
      id: "chelsea",
      name: "Chelsea",
      cityName: "New York",
      boundaries: {
        type: "Polygon",
        coordinates: [[[40.75, -74.01], [40.75, -73.99], [40.74, -73.99], [40.74, -74.01], [40.75, -74.01]]]
      },
      center: [40.745, -74.0],
      personalizedScore: 0,
      walkabilityScore: 0.92,
      schoolScore: 0.82,
      greenSpaceScore: 0.78,
      transitScore: 0.90,
      nightlifeScore: 0.88,
      priceRange: "$800K - $5M",
      medianHomePrice: 1800000,
      description: "Chelsea is a trendy neighborhood known for its art galleries, the High Line park, Chelsea Market, and vibrant nightlife.",
      relevantPOIs: [
        { type: "Park", name: "The High Line", location: [40.748, -74.005], description: "Elevated linear park on former railway" },
        { type: "Market", name: "Chelsea Market", location: [40.742, -74.005], description: "Food hall and shopping center" },
        { type: "Arts", name: "Chelsea Gallery District", location: [40.746, -74.007], description: "Concentration of art galleries" }
      ]
    }
  ],
  "Miami": [
    {
      id: "south-beach",
      name: "South Beach",
      cityName: "Miami",
      boundaries: {
        type: "Polygon",
        coordinates: [[[25.79, -80.14], [25.79, -80.12], [25.76, -80.12], [25.76, -80.14], [25.79, -80.14]]]
      },
      center: [25.775, -80.13],
      personalizedScore: 0,
      walkabilityScore: 0.90,
      schoolScore: 0.75,
      greenSpaceScore: 0.80,
      transitScore: 0.70,
      nightlifeScore: 0.98,
      priceRange: "$400K - $5M",
      medianHomePrice: 950000,
      description: "South Beach is known for its Art Deco architecture, pristine beaches, upscale shopping, and vibrant nightlife scene.",
      relevantPOIs: [
        { type: "Beach", name: "South Beach", location: [25.778, -80.132], description: "Famous beach with vibrant atmosphere" },
        { type: "District", name: "Art Deco Historic District", location: [25.781, -80.133], description: "Colorful historic buildings" },
        { type: "Shopping", name: "Lincoln Road Mall", location: [25.79, -80.14], description: "Pedestrian shopping street" }
      ]
    },
    {
      id: "brickell",
      name: "Brickell",
      cityName: "Miami",
      boundaries: {
        type: "Polygon",
        coordinates: [[[25.77, -80.2], [25.77, -80.18], [25.75, -80.18], [25.75, -80.2], [25.77, -80.2]]]
      },
      center: [25.76, -80.19],
      personalizedScore: 0,
      walkabilityScore: 0.85,
      schoolScore: 0.82,
      greenSpaceScore: 0.70,
      transitScore: 0.78,
      nightlifeScore: 0.85,
      priceRange: "$300K - $3M",
      medianHomePrice: 750000,
      description: "Brickell is Miami's financial district with luxury high-rise condos, upscale restaurants, and waterfront views.",
      relevantPOIs: [
        { type: "Shopping", name: "Brickell City Centre", location: [25.765, -80.192], description: "Modern shopping mall complex" },
        { type: "Park", name: "Brickell Key Park", location: [25.768, -80.183], description: "Small park on a man-made island" },
        { type: "Restaurant", name: "Brickell Restaurant Row", location: [25.761, -80.192], description: "Concentration of upscale restaurants" }
      ]
    }
  ]
};

/**
 * Calculate personalized scores for neighborhoods based on user questionnaire responses
 */
export function calculatePersonalizedNeighborhoodScores(
  cityName: string,
  responses: QuestionnaireResponse
): NeighborhoodData[] {
  // Get neighborhoods for the selected city
  const neighborhoods = neighborhoodDatabase[cityName] || [];
  
  if (neighborhoods.length === 0) {
    return [];
  }

  // Process each neighborhood to calculate personalized scores
  return neighborhoods.map(neighborhood => {
    // Clone the neighborhood to avoid mutating the original data
    const scoredNeighborhood = { ...neighborhood };
    
    // Calculate personalized score based on questionnaire responses
    const scores = {
      lifestyle: calculateLifestyleScore(responses.lifestylePriorities, neighborhood),
      commute: calculateCommuteScore(responses.commute, neighborhood),
      family: calculateFamilyScore(responses.family, neighborhood),
      amenities: calculateAmenitiesScore(responses.amenities, neighborhood),
      budget: calculateBudgetScore(responses.budget, neighborhood)
    };
    
    // Combine scores with appropriate weights based on user priorities
    const personalizedScore = (
      (scores.lifestyle * 0.25) +
      (scores.commute * 0.25) +
      (scores.family * 0.2) +
      (scores.amenities * 0.2) +
      (scores.budget * 0.1)
    );
    
    // Update the neighborhood's personalized score (0-1 scale)
    scoredNeighborhood.personalizedScore = Math.min(1, Math.max(0, personalizedScore));
    
    // Filter POIs based on user preferences
    scoredNeighborhood.relevantPOIs = filterRelevantPOIs(neighborhood.relevantPOIs, responses);
    
    return scoredNeighborhood;
  }).sort((a, b) => b.personalizedScore - a.personalizedScore); // Sort by score (highest first)
}

/**
 * Calculate lifestyle score based on user preferences
 */
function calculateLifestyleScore(
  lifestylePriorities: QuestionnaireResponse['lifestylePriorities'],
  neighborhood: NeighborhoodData
): number {
  // Convert preferences to 0-1 scale
  const nightlifePreference = (lifestylePriorities.nightlifeImportance - 1) / 4;
  const quietPreference = (lifestylePriorities.quietEnvironmentImportance - 1) / 4;
  const walkabilityPreference = (lifestylePriorities.walkabilityImportance - 1) / 4;
  const naturePreference = (lifestylePriorities.natureAccessImportance - 1) / 4;
  const communityPreference = (lifestylePriorities.communityImportance - 1) / 4;
  
  // Calculate weighted score based on neighborhood characteristics
  const score = (
    (neighborhood.nightlifeScore * nightlifePreference) +
    // For quiet preference, invert the nightlife score (quieter areas have lower nightlife)
    ((1 - neighborhood.nightlifeScore) * quietPreference) +
    (neighborhood.walkabilityScore * walkabilityPreference) + 
    (neighborhood.greenSpaceScore * naturePreference) +
    // For community, we'd ideally have a specific score, but using walkability as a proxy
    (neighborhood.walkabilityScore * communityPreference)
  ) / (
    nightlifePreference + 
    quietPreference + 
    walkabilityPreference + 
    naturePreference + 
    communityPreference || 1 // Avoid division by zero
  );
  
  return score;
}

/**
 * Calculate commute score based on user preferences
 */
function calculateCommuteScore(
  commute: QuestionnaireResponse['commute'],
  neighborhood: NeighborhoodData
): number {
  // Convert preferences to 0-1 scale
  const commuteImportance = (commute.commuteImportance - 1) / 4;
  const transportPreference = commute.preferredTransportation;
  const publicTransportPreference = (commute.publicTransportImportance - 1) / 4;
  const walkabilityPreference = (commute.walkabilityForErrandsImportance - 1) / 4;
  
  // Adjust score based on preferred transportation method
  let transportScore = 0;
  if (transportPreference === "Public Transportation") {
    transportScore = neighborhood.transitScore;
  } else if (transportPreference === "Walking") {
    transportScore = neighborhood.walkabilityScore;
  } else {
    // For car and others, assume generally good accessibility
    transportScore = 0.85;
  }
  
  // Calculate weighted score
  const score = (
    (transportScore * commuteImportance) +
    (neighborhood.transitScore * publicTransportPreference) +
    (neighborhood.walkabilityScore * walkabilityPreference)
  ) / (
    commuteImportance + 
    publicTransportPreference + 
    walkabilityPreference || 1 // Avoid division by zero
  );
  
  return score;
}

/**
 * Calculate family-related score based on user preferences
 */
function calculateFamilyScore(
  family: QuestionnaireResponse['family'],
  neighborhood: NeighborhoodData
): number {
  // If user doesn't have children and doesn't plan to, reduce the weight of family factors
  if (family.hasChildren === "No") {
    return 0.75; // Neutral to slightly positive score
  }
  
  // Convert preferences to 0-1 scale
  const schoolsImportance = (family.schoolsImportance - 1) / 4;
  const parksImportance = (family.parksProximityImportance - 1) / 4;
  const childcareImportance = (family.childcareImportance - 1) / 4;
  
  // Calculate weighted score
  const score = (
    (neighborhood.schoolScore * schoolsImportance) +
    (neighborhood.greenSpaceScore * parksImportance) +
    // For childcare, we'd ideally have a specific score, but using school score as a proxy
    (neighborhood.schoolScore * childcareImportance)
  ) / (
    schoolsImportance + 
    parksImportance + 
    childcareImportance || 1 // Avoid division by zero
  );
  
  return score;
}

/**
 * Calculate amenities score based on user preferences
 */
function calculateAmenitiesScore(
  amenities: QuestionnaireResponse['amenities'],
  neighborhood: NeighborhoodData
): number {
  // Convert preferences to 0-1 scale
  const groceryImportance = (amenities.groceryProximityImportance - 1) / 4;
  const healthcareImportance = (amenities.healthcareProximityImportance - 1) / 4;
  const fitnessImportance = (amenities.fitnessAccessImportance - 1) / 4;
  const restaurantImportance = (amenities.restaurantProximityImportance - 1) / 4;
  const entertainmentImportance = (amenities.entertainmentProximityImportance - 1) / 4;
  
  // For amenities, we're using walkability as a proxy for general amenity access
  // Ideally, we'd have specific scores for each type of amenity
  const score = (
    (neighborhood.walkabilityScore * groceryImportance) +
    (neighborhood.walkabilityScore * healthcareImportance) +
    (neighborhood.walkabilityScore * fitnessImportance) +
    // For restaurants and entertainment, nightlife score is a better proxy
    (neighborhood.nightlifeScore * restaurantImportance) +
    (neighborhood.nightlifeScore * entertainmentImportance)
  ) / (
    groceryImportance + 
    healthcareImportance + 
    fitnessImportance + 
    restaurantImportance + 
    entertainmentImportance || 1 // Avoid division by zero
  );
  
  return score;
}

/**
 * Calculate budget score based on user preferences
 */
function calculateBudgetScore(
  budget: QuestionnaireResponse['budget'],
  neighborhood: NeighborhoodData
): number {
  // We don't have specific pricing data in our model, so this is simplified
  
  // Higher HOA comfort suggests comfort with more expensive neighborhoods
  const hoaComfort = (budget.hoaComfort - 1) / 4;
  
  // For simplicity, we're assuming median home prices in these ranges:
  // < $500K: Very affordable
  // $500K-$1M: Affordable
  // $1M-$2M: Moderate
  // $2M-$5M: Expensive
  // > $5M: Very expensive
  
  let affordabilityScore;
  if (neighborhood.medianHomePrice < 500000) {
    affordabilityScore = 1.0;
  } else if (neighborhood.medianHomePrice < 1000000) {
    affordabilityScore = 0.8;
  } else if (neighborhood.medianHomePrice < 2000000) {
    affordabilityScore = 0.6;
  } else if (neighborhood.medianHomePrice < 5000000) {
    affordabilityScore = 0.4;
  } else {
    affordabilityScore = 0.2;
  }
  
  // Adjust based on HOA comfort - higher comfort with HOAs suggests
  // more comfort with luxury communities, which offsets the affordability concerns
  return affordabilityScore * (1 - (hoaComfort * 0.3));
}

/**
 * Filter and prioritize POIs based on user preferences
 */
function filterRelevantPOIs(
  pois: NeighborhoodPOI[],
  responses: QuestionnaireResponse
): NeighborhoodPOI[] {
  // Determine top priorities
  const priorities: { [key: string]: number } = {
    "Park": responses.lifestylePriorities.natureAccessImportance,
    "Beach": responses.lifestylePriorities.natureAccessImportance,
    "Restaurant": responses.amenities.restaurantProximityImportance,
    "Shopping": responses.amenities.groceryProximityImportance,
    "Cultural": responses.lifestylePriorities.culturalProximityImportance,
    "School": responses.family.schoolsImportance,
    "Transit": responses.commute.publicTransportImportance,
    "Entertainment": responses.amenities.entertainmentProximityImportance
  };
  
  // Sort POIs by priority
  return [...pois].sort((a, b) => {
    const priorityA = priorities[a.type] || 0;
    const priorityB = priorities[b.type] || 0;
    return priorityB - priorityA;
  });
}

/**
 * Get neighborhood data for a given city
 */
export function getNeighborhoodsByCity(cityName: string): NeighborhoodData[] {
  return neighborhoodDatabase[cityName] || [];
}

/**
 * Get a specific neighborhood by ID
 */
export function getNeighborhoodById(cityName: string, neighborhoodId: string): NeighborhoodData | undefined {
  const neighborhoods = neighborhoodDatabase[cityName] || [];
  return neighborhoods.find(n => n.id === neighborhoodId);
}