import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CostComparisonProps {
  className?: string;
}

export default function CostComparison({ className = '' }: CostComparisonProps) {
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  
  return (
    <section className={cn("py-20", className)}>
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold mb-10">PAY YOUR WAY</h2>
        
        <div className="max-w-4xl mx-auto">
          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <span className="font-bold mr-2">• Flexible Pricing:</span>
              <span>Choose only the services you need, from a la carte options to comprehensive bundles.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">• No Hidden Fees:</span>
              <span>Affordable, transparent pricing upfront, so you know exactly what you're paying for.</span>
            </li>
          </ul>
          
          <div className="flex flex-col md:flex-row gap-6 mb-10">
            <Button 
              className="bg-slate-700 hover:bg-slate-800 text-white py-6 px-8"
              onClick={() => setVideoDialogOpen(true)}
            >
              See How It Works
            </Button>
            <Button className="bg-slate-700 hover:bg-slate-800 text-white py-6 px-8">
              Start For Free
            </Button>
          </div>
          
          {/* Comparison Example - Simple Version matching the screenshot */}
          <div className="w-full mt-8">
            <div className="flex flex-col md:flex-row rounded-lg overflow-hidden">
              {/* Traditional Side */}
              <div className="flex-1 bg-gray-600 text-white p-3 text-center">
                <h3 className="text-lg font-medium">Traditional real estate</h3>
              </div>
              
              {/* Realty.ai Side */}
              <div className="flex-1 bg-gray-500 text-white p-3 text-center">
                <h3 className="text-lg font-medium">Realty.ai approach</h3>
              </div>
            </div>
            
            {/* Main Comparison Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traditional Side */}
              <div className="p-6 bg-gray-200 rounded-lg mt-4">
                <h3 className="text-2xl font-semibold mb-4">Traditional Commission</h3>
                <p className="text-lg mb-4">$700,000 × 5% = $35,000</p>
                <p className="text-gray-700">
                  Typical transaction costs with traditional real estate brokers, where you pay a percentage of your home's value.
                </p>
              </div>
              
              {/* Realty.ai Side */}
              <div className="p-6 bg-gray-200 rounded-lg mt-4">
                <h3 className="text-2xl font-semibold mb-4">Realty.ai Approach</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Standard Bundle</span>
                    <span className="font-bold">$3,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expert Consultation(s)</span>
                    <span className="font-bold">$1,800</span>
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-md border-2 border-green-500 text-center">
                  <span className="text-xl font-bold text-green-700">$30,200 savings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black rounded-lg overflow-hidden">
          <div className="relative">
            <DialogClose className="absolute top-2 right-2 z-10 rounded-full p-2 bg-black/50 text-white hover:bg-black/70">
              <X className="h-5 w-5" />
            </DialogClose>
            <video 
              className="w-full h-auto"
              controls
              autoPlay
              src="/PAY YOUR WAY.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}