import { Switch, Route, useLocation } from "wouter";
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
import ServiceExperts from "@/pages/service-experts";
import Marketplace from "@/pages/marketplace";
import Appointments from "@/pages/appointments";
import FastOnlineApplication from "@/pages/fast-online-application";
import Navbar from "@/components/navbar";

// Placeholder components for new pages
const Resources = () => <div className="py-20 text-center"><h1 className="text-3xl font-bold">Resources</h1><p className="mt-4">Coming soon</p></div>;
const Demo = () => <div className="py-20 text-center"><h1 className="text-3xl font-bold">Watch a Demo</h1><p className="mt-4">Coming soon</p></div>;
const GetStarted = () => <div className="py-20 text-center"><h1 className="text-3xl font-bold">Get Started</h1><p className="mt-4">Coming soon</p></div>;

function Router() {
  const [location] = useLocation();
  const isHomePage = location === '/';
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className={`flex-grow ${!isHomePage ? 'container mx-auto px-4 py-20' : ''}`}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/properties" component={Properties} />
          <Route path="/property/:id" component={Property} />
          <Route path="/services" component={Services} />
          <Route path="/service-provider/:id" component={ServiceProviderDetail} />
          <Route path="/documents" component={Documents} />
          <Route path="/contract-terms" component={ContractTerms} />
          <Route path="/service-experts" component={ServiceExperts} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/appointments" component={Appointments} />
          <Route path="/fast-online-application" component={FastOnlineApplication} />
          <Route path="/resources" component={Resources} />
          <Route path="/demo" component={Demo} />
          <Route path="/get-started" component={GetStarted} />
          <Route path="/how-it-works" component={() => <div className="py-20 text-center"><h1 className="text-3xl font-bold">How It Works</h1><p className="mt-4">Coming soon</p></div>} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {!isHomePage && (
        <footer className="bg-muted py-6 mt-auto">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">REALTY.AI</h3>
                <p className="text-muted-foreground text-sm">
                  The future of real estate is here. AI-Powered real estate transactions with expert guidance.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-3">Buy/Sell</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground">Browse Properties</li>
                  <li className="text-sm text-muted-foreground">AI Property Matching</li>
                  <li className="text-sm text-muted-foreground">Virtual Tours</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Services</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground">Select your Experts</li>
                  <li className="text-sm text-muted-foreground">Document Review</li>
                  <li className="text-sm text-muted-foreground">Contract Analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3">Contact</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-muted-foreground">support@realty.ai</li>
                  <li className="text-sm text-muted-foreground">1-800-555-REAL</li>
                  <li className="text-sm text-muted-foreground">123 Future St, Suite 100</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} REALTY.AI. All rights reserved.
            </div>
          </div>
        </footer>
      )}
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
