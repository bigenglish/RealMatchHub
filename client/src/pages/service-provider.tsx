import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import type { ServiceProvider } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, Phone, Mail, Calendar, MapPin, Star, BookOpen, Building, Award, BriefcaseBusiness
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ContactForm from "@/components/contact-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ServiceProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: provider, isLoading } = useQuery<ServiceProvider>({
    queryKey: ["/api/service-providers", id],
  });
  const [showContactForm, setShowContactForm] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Service Provider Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The provider you're looking for may have been removed or doesn't exist.
        </p>
        <Button asChild>
          <Link href="/services">Browse All Providers</Link>
        </Button>
      </div>
    );
  }

  // Generate random testimonials for demonstration purposes
  const testimonials = [
    {
      name: "Jennifer M.",
      text: "Working with this professional was an excellent experience. They were knowledgeable, responsive, and made the entire process much smoother than I expected.",
      rating: 5,
      date: "February 12, 2024"
    },
    {
      name: "Robert L.",
      text: "Very professional service and great attention to detail. Would definitely recommend to friends and family.",
      rating: 4,
      date: "January 8, 2024"
    },
    {
      name: "Sarah K.",
      text: "Helped me navigate a complex situation with ease. Their expertise was evident from our first conversation.",
      rating: 5,
      date: "March 5, 2024"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <img
              src={provider.image}
              alt={provider.name}
              className="h-32 w-32 rounded-full object-cover border-4 border-background shadow-md"
            />
            <div>
              <Badge variant="outline" className="mb-2">{provider.type}</Badge>
              <h1 className="text-3xl font-bold">{provider.name}</h1>
              <div className="flex items-center mt-2">
                {Array.from({ length: provider.rating || 0 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-muted-foreground">
                  {provider.rating} out of 5
                </span>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="about">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="pt-4">
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground">{provider.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <BriefcaseBusiness className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Experience</div>
                          <div className="text-muted-foreground">{provider.experience} years</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Specialization</div>
                          <div className="text-muted-foreground">
                            {provider.type === "Real Estate Agent" ? "Residential Properties" : 
                             provider.type === "Mortgage Broker" ? "Conventional Loans" :
                             provider.type === "Property Inspector" ? "Home Inspections" :
                             provider.type === "Interior Designer" ? "Modern Design" : 
                             "Professional Services"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Serving Areas</div>
                          <div className="text-muted-foreground">Metropolitan Area & Suburbs</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-sm font-medium">Languages</div>
                          <div className="text-muted-foreground">English, Spanish</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="experience" className="pt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Professional Background</h3>
                  <p className="text-muted-foreground">
                    With {provider.experience} years in the {provider.type.toLowerCase()} industry, 
                    {provider.name} has established a reputation for excellence and client satisfaction.
                    Their approach focuses on understanding client needs and delivering personalized solutions.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Career Highlights</h3>
                  <div className="space-y-4">
                    <div className="border-l-2 border-primary pl-4 py-2">
                      <div className="font-medium">Senior {provider.type}</div>
                      <div className="text-sm text-muted-foreground">2020 - Present</div>
                      <div className="mt-1 text-muted-foreground">
                        Leading client engagements and delivering exceptional service in the {provider.type.toLowerCase()} sector.
                      </div>
                    </div>
                    
                    <div className="border-l-2 border-primary/70 pl-4 py-2">
                      <div className="font-medium">{provider.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {2020 - Math.floor(provider.experience / 2)} - 2020
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        Developed expertise in {provider.type.toLowerCase()} services while building a strong client base.
                      </div>
                    </div>
                    
                    <div className="border-l-2 border-primary/50 pl-4 py-2">
                      <div className="font-medium">Associate {provider.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {2020 - provider.experience} - {2020 - Math.floor(provider.experience / 2)}
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        Started career path in the industry, focusing on skill development and client service.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="pt-4">
              <div className="space-y-6">
                {testimonials.map((testimonial, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="flex">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">{testimonial.date}</div>
                      <p className="text-muted-foreground">{testimonial.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                <span>{provider.contact}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-primary" />
                <span>{provider.name.toLowerCase().replace(' ', '.')}@example.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-primary" />
                <span>Metropolitan Area</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-primary" />
                <span>Available Mon-Fri, 9am-5pm</span>
              </div>
              
              {!showContactForm && (
                <Button 
                  className="w-full mt-2" 
                  onClick={() => setShowContactForm(true)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              )}
            </CardContent>
          </Card>
          
          {showContactForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Send Message</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm 
                  subject={`Service Inquiry for ${provider.name}`} 
                  onSuccess={() => setShowContactForm(false)}
                />
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Schedule Consultation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Book a free 30-minute consultation to discuss your needs and how {provider.name} can help.
              </p>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}