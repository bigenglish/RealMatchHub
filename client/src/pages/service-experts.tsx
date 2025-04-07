import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { expertServiceTypes, expertTypes, ServiceExpert } from "@shared/schema";
import ServiceExpertCard from "@/components/service-expert-card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ServiceExpertsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expertTypeFilter, setExpertTypeFilter] = useState("all");

  // Fetch all service experts
  const { data: serviceExperts = [], isLoading } = useQuery<ServiceExpert[]>({
    queryKey: ["/api/service-experts"],
  });

  // Filter service experts based on search term, active tab, and expert type
  const filteredExperts = serviceExperts.filter((expert: ServiceExpert) => {
    const matchesSearch =
      searchTerm === "" ||
      expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.servicesOffered.some((service: string) =>
        service.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesTab =
      activeTab === "all" ||
      expert.servicesOffered.includes(activeTab);

    const matchesExpertType =
      expertTypeFilter === "all" ||
      expert.serviceType === expertTypeFilter;

    return matchesSearch && matchesTab && matchesExpertType;
  });

  return (
    <>
      <Helmet>
        <title>Service Experts | Real Estate Platform</title>
      </Helmet>

      <Container>
        <div className="py-8">
          <h1 className="text-4xl font-bold mb-2">Real Estate Service Experts</h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with top professionals to help you with every aspect of your real estate journey.
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search by name, service, or description"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={expertTypeFilter} onValueChange={setExpertTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by expert type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Expert Types</SelectItem>
                  {expertTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex flex-wrap">
              <TabsTrigger value="all">All Services</TabsTrigger>
              {expertServiceTypes.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <p>Loading service experts...</p>
                </div>
              ) : filteredExperts?.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No service experts found</h3>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExperts.map((expert: ServiceExpert) => (
                    <ServiceExpertCard
                      key={expert.id}
                      expert={expert}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Separator className="my-12" />

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Need Help Finding the Right Expert?</h2>
            <p className="mb-6">
              Our concierge service can help you find the perfect professional for your unique real estate needs.
            </p>
            <Button size="lg">Request Personalized Matching</Button>
          </div>
        </div>
      </Container>
    </>
  );
};

export default ServiceExpertsPage;