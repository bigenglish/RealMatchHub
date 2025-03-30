import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, Home, Users, Building, Search, Briefcase, 
  HomeIcon, HeartHandshake, Star, Shield, Clock 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [userType, setUserType] = useState<"buyer" | "seller">("buyer");

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-4">
        <Badge variant="outline" className="px-3.5 py-1.5 text-base font-medium mb-2">
          Your Real Estate Journey Starts Here
        </Badge>
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
          Find Your Dream Home &<br />
          Connect with Top Professionals
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Your one-stop marketplace for all real estate needs. Browse properties and
          connect with service providers to make your dream home a reality.
        </p>
        
        {/* User Type Selection */}
        <div className="max-w-md mx-auto">
          <Tabs 
            defaultValue="buyer" 
            className="w-full"
            onValueChange={(value) => setUserType(value as "buyer" | "seller")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buyer">I'm a Buyer</TabsTrigger>
              <TabsTrigger value="seller">I'm a Seller</TabsTrigger>
            </TabsList>
            <TabsContent value="buyer" className="py-4">
              <p className="text-muted-foreground mb-4">
                Looking for your dream home? We'll help you find properties and connect with professionals.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/properties">
                  <Button size="lg">
                    Browse Properties
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline">
                    Find Agents
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </TabsContent>
            <TabsContent value="seller" className="py-4">
              <p className="text-muted-foreground mb-4">
                Ready to sell your property? Connect with our network of agents and service providers.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/services">
                  <Button size="lg">
                    Find Agents
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  List Your Property
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Services Section */}
      <section className="grid gap-8 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Property Listings</h2>
          <p className="text-muted-foreground mb-6">
            Explore our curated collection of properties. From cozy apartments to
            luxurious homes, find the perfect property that matches your needs.
          </p>
          <Link href="/properties">
            <Button variant="default">
              View Listings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Service Providers</h2>
          <p className="text-muted-foreground mb-6">
            Connect with top-rated real estate professionals. From agents to
            inspectors, we've got all the experts you need.
          </p>
          <Link href="/services">
            <Button variant="default">
              Find Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Why Choose Our Platform</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We provide a comprehensive marketplace connecting buyers and sellers with all the services needed for a successful real estate transaction.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Easy Search</h3>
              <p className="text-muted-foreground">
                Powerful filters to find properties that match your exact criteria.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <HeartHandshake className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Verified Providers</h3>
              <p className="text-muted-foreground">
                All service providers are vetted and reviewed for quality.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Secure Process</h3>
              <p className="text-muted-foreground">
                Safe and secure platform for all your real estate transactions.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Time Saving</h3>
              <p className="text-muted-foreground">
                Find everything you need in one place, saving you time and stress.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="pt-8 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">What Our Users Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what people who have used our platform have to say.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Found my dream home in just two weeks! The filtering options made it easy to narrow down exactly what I was looking for."
              </p>
              <div className="font-medium">Michael R.</div>
              <div className="text-sm text-muted-foreground">First-time Homebuyer</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "As a real estate agent, this platform has connected me with serious clients and helped me grow my business substantially."
              </p>
              <div className="font-medium">Jennifer K.</div>
              <div className="text-sm text-muted-foreground">Real Estate Agent</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Sold my house faster than I expected and found all the services I needed - from inspectors to lawyers - on the same platform."
              </p>
              <div className="font-medium">David L.</div>
              <div className="text-sm text-muted-foreground">Property Seller</div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Real Estate Journey?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Whether you're buying, selling, or providing services, our platform has everything you need to succeed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/properties">
            <Button size="lg">
              Explore Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/services">
            <Button size="lg" variant="outline">
              Connect with Professionals
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
