import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Properties from "@/pages/properties";
import Property from "@/pages/property";
import Services from "@/pages/services";
import ServiceProviderDetail from "@/pages/service-provider";
import Documents from "@/pages/documents";
import ContractTerms from "@/pages/contract-terms";
import Financing from "@/pages/financing";
import Navbar from "@/components/navbar";

function Router() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/properties" component={Properties} />
          <Route path="/property/:id" component={Property} />
          <Route path="/services" component={Services} />
          <Route path="/service-provider/:id" component={ServiceProviderDetail} />
          <Route path="/documents" component={Documents} />
          <Route path="/contract-terms" component={ContractTerms} />
          <Route path="/financing" component={Financing} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <footer className="bg-muted py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Real Estate Marketplace</h3>
              <p className="text-muted-foreground text-sm">
                Connecting buyers, sellers, and service providers for all your real estate needs.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Properties</h4>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">Browse Listings</li>
                <li className="text-sm text-muted-foreground">Featured Properties</li>
                <li className="text-sm text-muted-foreground">New Developments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Services</h4>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">Real Estate Agents</li>
                <li className="text-sm text-muted-foreground">Property Inspectors</li>
                <li className="text-sm text-muted-foreground">Mortgage Brokers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Contact</h4>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">support@realestate.example</li>
                <li className="text-sm text-muted-foreground">1-800-555-REAL</li>
                <li className="text-sm text-muted-foreground">123 Market St, Suite 100</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Real Estate Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
