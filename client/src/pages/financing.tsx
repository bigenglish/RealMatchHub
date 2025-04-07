import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { financingServiceTypes, FinancingProvider } from "@shared/schema";
import FinancingProviderCard from "@/components/financing-provider-card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const FinancingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all financing providers
  const { data: financingProviders = [], isLoading } = useQuery<FinancingProvider[]>({
    queryKey: ["/api/financing-providers"],
  });

  // Filter providers based on search term and active tab
  const filteredProviders = financingProviders.filter((provider: FinancingProvider) => {
    const matchesSearch =
      searchTerm === "" ||
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.servicesOffered.some((service: string) =>
        service.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesTab =
      activeTab === "all" ||
      provider.servicesOffered.includes(activeTab);

    return matchesSearch && matchesTab;
  });

  return (
    <>
      <Helmet>
        <title>Financing Options | Real Estate Platform</title>
      </Helmet>

      <Container>
        <div className="py-8">
          <h1 className="text-4xl font-bold mb-2">Financing Solutions</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find the perfect financing solution to help you with your real estate journey.
          </p>

          <div className="flex gap-4 mb-6">
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
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Services</TabsTrigger>
              {financingServiceTypes.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <p>Loading financing providers...</p>
                </div>
              ) : filteredProviders?.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No financing providers found</h3>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProviders.map((provider: FinancingProvider) => (
                    <FinancingProviderCard
                      key={provider.id}
                      provider={provider}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Separator className="my-12" />

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Need Help With Financing?</h2>
            <p className="mb-6">
              Our financing experts can help you navigate the complex world of real estate financing to find the perfect solution for your situation.
            </p>
            <Button size="lg">Schedule a Consultation</Button>
          </div>
        </div>
      </Container>
    </>
  );
};

export default FinancingPage;