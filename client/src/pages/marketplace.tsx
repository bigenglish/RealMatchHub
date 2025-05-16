import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ServiceBundle, ServiceOffering } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";
import { Check } from "lucide-react";

// Bundle data for each user type
const buyerBundles = {
  free: {
    title: "Find Your Dream Property (Free Discovery)",
    features: [
      "Browse all available listings in your area",
      "Save your favorite properties and searches",
      "Access basic search filters (location, price, property type)",
      "Connect with local real estate professionals"
    ]
  },
  basic: {
    title: "Essential Home Search Package",
    description: "Expert guidance finding your ideal property",
    price: "As low as $1,500",
    savings: "Save time and frustration",
    features: [
      "All features in FREE tier",
      "Personalized property recommendations",
      "Virtual tours with expert commentary",
      "Neighborhood insights and analytics",
      "School and amenity reports",
      "Pre-offer property inspection coordination"
    ],
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3"
  },
  premium: {
    title: "Full-Service Buyer Support",
    description: "Full virtual support from offer to post-closing",
    price: "As low as $2,500",
    savings: "Peace of mind",
    popularityLabel: "Most Popular",
    features: [
      "All features in BASIC tier",
      "Offer strategy consultation",
      "24/7 phone support",
      "Inspection coordination", 
      "Preferred vendor pricing for repairs",
      "Dedicated buyer advocate",
      "Closing coordination",
      "Post-closing support"
    ],
    image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3"
  }
};

const sellerBundles = {
  free: {
    title: "Free Property Valuation",
    features: [
      "AI-powered property valuation",
      "Communicate, schedule virtual & in-person tours",
      "Listing creation with direct connection to buyers",
      "Market trend reports (local market data)"
    ]
  },
  basic: {
    title: "Essential Listing Package",
    description: "Expert virtual guidance on offers and due diligence",
    price: "As low as $1,500",
    savings: "Save time and money",
    features: [
      "All features in FREE tier",
      "Professional photography",
      "Expert staging consultation",
      "Regular market analysis updates",
      "Seller disclosure support",
      "Enhanced MLS listing",
      "Due diligence assistance"
    ],
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3"
  },
  premium: {
    title: "Full-Service Selling Support",
    description: "Full virtual support from offer to post-closing",
    price: "As low as $2,500",
    savings: "Peace of mind",
    popularityLabel: "Most Popular",
    features: [
      "All features in BASIC tier",
      "Premium photography & virtual tour",
      "Professional staging service",
      "Social media marketing campaign",
      "Open house coordination",
      "Offer negotiation support",
      "Contract-to-close management",
      "Moving coordination assistance"
    ],
    image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3"
  }
};

const renterBundles = {
  free: {
    title: "Free Rental Search",
    features: [
      "Search rental listings in your area",
      "Save favorite properties",
      "Basic filtering options",
      "Connect with property managers"
    ]
  },
  basic: {
    title: "Rental Search Assistance",
    description: "Expert guidance finding your ideal rental",
    price: "As low as $500",
    savings: "Save time and stress",
    features: [
      "All features in FREE tier",
      "Personalized rental recommendations",
      "Virtual tours coordination",
      "Application preparation assistance",
      "Rental market analysis",
      "Neighborhood guides"
    ],
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3"
  },
  premium: {
    title: "Complete Rental Package",
    description: "Full support from search to move-in",
    price: "As low as $1,200",
    savings: "Peace of mind",
    popularityLabel: "Most Popular",
    features: [
      "All features in BASIC tier",
      "In-person property tours",
      "Lease negotiation assistance",
      "Move-in coordination",
      "Utility setup support",
      "Roommate matching service",
      "Renters insurance guidance",
      "First month troubleshooting support"
    ],
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3"
  }
};

export default function MarketplacePage() {
  const [userType, setUserType] = useState("buyers");
  const [bundleType, setBundleType] = useState("free");

  // Get the appropriate bundle data based on user type
  const getBundleData = () => {
    switch(userType) {
      case "buyers": return buyerBundles;
      case "sellers": return sellerBundles;
      case "renters": return renterBundles;
      default: return buyerBundles;
    }
  };

  const bundleData = getBundleData();

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* User Type Tabs */}
      <div className="mb-8">
        <Tabs defaultValue="buyers" className="w-full" onValueChange={setUserType}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 rounded-full bg-gray-100">
            <TabsTrigger 
              value="buyers" 
              className={`rounded-full py-3 ${userType === 'buyers' ? 'bg-olive-600 text-white' : ''}`}
            >
              Buyers
            </TabsTrigger>
            <TabsTrigger 
              value="sellers"
              className={`rounded-full py-3 ${userType === 'sellers' ? 'bg-olive-600 text-white' : ''}`}
            >
              Sellers
            </TabsTrigger>
            <TabsTrigger 
              value="renters"
              className={`rounded-full py-3 ${userType === 'renters' ? 'bg-olive-600 text-white' : ''}`}
            >
              Renters
            </TabsTrigger>
          </TabsList>

          {/* FREE Bundle */}
          <TabsContent value="buyers" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-olive-600 py-5">
                <CardTitle className="text-center text-white text-3xl">FREE</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-[#fffdf0]">
                <h3 className="text-xl font-semibold mb-4">{bundleData.free.title}</h3>
                <ul className="space-y-4">
                  {bundleData.free.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-olive-600 mr-2 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-olive-600 py-5">
                <CardTitle className="text-center text-white text-3xl">FREE</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-[#fffdf0]">
                <h3 className="text-xl font-semibold mb-4">{sellerBundles.free.title}</h3>
                <ul className="space-y-4">
                  {sellerBundles.free.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-olive-600 mr-2 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="renters" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-olive-600 py-5">
                <CardTitle className="text-center text-white text-3xl">FREE</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-[#fffdf0]">
                <h3 className="text-xl font-semibold mb-4">{renterBundles.free.title}</h3>
                <ul className="space-y-4">
                  {renterBundles.free.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-olive-600 mr-2 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Paid Bundles Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Premium Service Bundles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* BASIC Bundle */}
          <Card className="overflow-hidden">
            {userType === "buyers" && (
              <>
                {buyerBundles.basic.image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={buyerBundles.basic.image} 
                      alt="Basic Bundle" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">BASIC</CardTitle>
                  <CardDescription>{buyerBundles.basic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">{buyerBundles.basic.price}</div>
                    <div className="text-green-600">{buyerBundles.basic.savings}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-olive-600 hover:bg-olive-700">
                    View Bundle Details
                  </Button>
                </CardFooter>
              </>
            )}
            
            {userType === "sellers" && (
              <>
                {sellerBundles.basic.image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={sellerBundles.basic.image} 
                      alt="Basic Bundle" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">BASIC</CardTitle>
                  <CardDescription>{sellerBundles.basic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">{sellerBundles.basic.price}</div>
                    <div className="text-green-600">{sellerBundles.basic.savings}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-olive-600 hover:bg-olive-700">
                    View Bundle Details
                  </Button>
                </CardFooter>
              </>
            )}
            
            {userType === "renters" && (
              <>
                {renterBundles.basic.image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={renterBundles.basic.image} 
                      alt="Basic Bundle" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">BASIC</CardTitle>
                  <CardDescription>{renterBundles.basic.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">{renterBundles.basic.price}</div>
                    <div className="text-green-600">{renterBundles.basic.savings}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-olive-600 hover:bg-olive-700">
                    View Bundle Details
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>

          {/* PREMIUM Bundle */}
          <Card className="overflow-hidden">
            {userType === "buyers" && (
              <>
                {buyerBundles.premium.image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={buyerBundles.premium.image} 
                      alt="Premium Bundle" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">PREMIUM</CardTitle>
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      {buyerBundles.premium.popularityLabel}
                    </Badge>
                  </div>
                  <CardDescription>{buyerBundles.premium.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">{buyerBundles.premium.price}</div>
                    <div className="text-green-600">{buyerBundles.premium.savings}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-olive-600 hover:bg-olive-700">
                    View Bundle Details
                  </Button>
                </CardFooter>
              </>
            )}
            
            {userType === "sellers" && (
              <>
                {sellerBundles.premium.image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={sellerBundles.premium.image} 
                      alt="Premium Bundle" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">PREMIUM</CardTitle>
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      {sellerBundles.premium.popularityLabel}
                    </Badge>
                  </div>
                  <CardDescription>{sellerBundles.premium.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">{sellerBundles.premium.price}</div>
                    <div className="text-green-600">{sellerBundles.premium.savings}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-olive-600 hover:bg-olive-700">
                    View Bundle Details
                  </Button>
                </CardFooter>
              </>
            )}
            
            {userType === "renters" && (
              <>
                {renterBundles.premium.image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={renterBundles.premium.image} 
                      alt="Premium Bundle" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">PREMIUM</CardTitle>
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                      {renterBundles.premium.popularityLabel}
                    </Badge>
                  </div>
                  <CardDescription>{renterBundles.premium.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-semibold">{renterBundles.premium.price}</div>
                    <div className="text-green-600">{renterBundles.premium.savings}</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-olive-600 hover:bg-olive-700">
                    View Bundle Details
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Individual Services Section */}
      <div className="mt-16">
        <Tabs defaultValue="bundles" className="mb-12">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="bundles">Service Bundles</TabsTrigger>
            <TabsTrigger value="services">Individual Services</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Individual Services</h2>
              <p className="text-muted-foreground mt-2">
                Choose specific services based on your unique needs
              </p>
            </div>
            
            <div className="space-y-10">
              {/* Individual service categories would be rendered here */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Property Valuation Services</h3>
                <Separator className="mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">AI-Powered Valuation</CardTitle>
                      <CardDescription>Get an instant property valuation using our AI technology</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Free</span>
                        <span className="text-muted-foreground text-sm">
                          Instant
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Get Valuation
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Expert CMA</CardTitle>
                      <CardDescription>Detailed valuation by a real estate professional</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">$99</span>
                        <span className="text-muted-foreground text-sm">
                          24-48 hours
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Request Service
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">On-Site Appraisal</CardTitle>
                      <CardDescription>In-person professional property appraisal</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">$299</span>
                        <span className="text-muted-foreground text-sm">
                          3-5 days
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Schedule Appraisal
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}