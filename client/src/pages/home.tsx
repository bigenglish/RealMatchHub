import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, Search, Star, Calendar, MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  const [searchType, setSearchType] = useState("Buy");

  return (
    <div>
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center text-white">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
          <div className="absolute inset-0 bg-black/40 z-10"></div> {/* Overlay */}
          <video 
            className="absolute w-full h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src="/Hero Video (1).mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-20 pt-24 flex flex-col md:flex-row">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold">
              Realty.ai: <span className="block">The Future of Real Estate is Here.</span>
            </h1>
            <p className="text-xl max-w-lg">
              Save time and skip the fees with AI-Powered Insights, Vetted-Expert Guidance. Buy or Sell Your next home, Effortlessly.
            </p>
            <div className="pt-4">
              <Link href="/get-started">
                <Button size="lg" className="bg-olive-600 hover:bg-olive-700 text-white border-none px-8 py-6 text-lg">
                  GET STARTED FREE
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 mt-10 md:mt-0 flex justify-end">
            <div className="bg-black/60 rounded-3xl backdrop-blur p-6 max-w-md">
              <div className="mb-6">
                <div className="text-lg font-medium mb-2">John D., Los Angeles</div>
                <div className="text-lg font-medium mb-2">Home Seller</div>
                <p className="text-md">
                  "I paid no agent commissions when selling my home and saved $24,000 with Realty.ai."
                </p>
                <div className="flex mt-2">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Property Search Bar */}
        <div className="absolute bottom-8 left-0 right-0 mx-auto container z-20">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto overflow-hidden">
            <div className="flex border-b">
              <button 
                className={`flex-1 py-3 px-6 text-center font-medium ${searchType === 'Rent' ? 'border-b-2 border-olive-600 text-olive-600' : 'text-gray-500'}`}
                onClick={() => setSearchType('Rent')}
              >
                Rent
              </button>
              <button 
                className={`flex-1 py-3 px-6 text-center font-medium ${searchType === 'Buy' ? 'border-b-2 border-olive-600 text-olive-600' : 'text-gray-500'}`}
                onClick={() => setSearchType('Buy')}
              >
                Buy
              </button>
              <button 
                className={`flex-1 py-3 px-6 text-center font-medium ${searchType === 'Sell' ? 'border-b-2 border-olive-600 text-olive-600' : 'text-gray-500'}`}
                onClick={() => setSearchType('Sell')}
              >
                Sell
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row p-4 gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Where</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="NY city, USA" 
                    className="pl-10"
                    defaultValue="NY city, USA"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">What</label>
                <Select defaultValue="house">
                  <SelectTrigger>
                    <SelectValue placeholder="House" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">When</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Select date" 
                    className="pl-10"
                    defaultValue="Select date"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <Link href="/properties">
                  <Button className="bg-olive-600 hover:bg-olive-700 w-full md:w-auto whitespace-nowrap">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the page would go here - this implements the hero section from the image */}
    </div>
  );
}
