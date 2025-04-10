import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Play, X, Check, ArrowRight, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface CostComparisonProps {
  className?: string;
}

export default function CostComparison({ className = '' }: CostComparisonProps) {
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [homeValue, setHomeValue] = useState(700000);
  const [savingsAmount, setSavingsAmount] = useState(30200);
  const [commissionPercent, setCommissionPercent] = useState(5);
  const [realtyCost, setRealtyCost] = useState(4800);
  
  // Calculate updated values when homeValue changes
  const handleHomeValueChange = (value: number) => {
    setHomeValue(value);
    const traditionalCommission = value * (commissionPercent / 100);
    setSavingsAmount(Math.round(traditionalCommission - realtyCost));
  };
  
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
              className="bg-olive-600 hover:bg-olive-700 text-white py-6"
              onClick={() => setVideoDialogOpen(true)}
            >
              <Play className="h-5 w-5 mr-2" />
              See How It Works
            </Button>
            <Button className="bg-white text-olive-600 border-olive-600 border py-6">
              Start For Free
            </Button>
          </div>
          
          {/* Cost Calculator */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
            <h3 className="text-2xl font-bold mb-4">Cost Comparison Calculator</h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home Value
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="range"
                    min="200000"
                    max="2000000"
                    step="10000"
                    value={homeValue}
                    onChange={(e) => handleHomeValueChange(parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="text-center text-xl font-bold mt-2">
                    ${homeValue.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl overflow-hidden shadow-lg">
            {/* Traditional Side */}
            <div className="p-6 bg-gray-100 border-r border-gray-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Traditional Commission</h3>
              <div className="text-5xl font-bold mb-6 text-gray-900">
                ${(homeValue * commissionPercent / 100).toLocaleString()}
              </div>
              <div className="text-lg text-gray-700 mb-4">
                {commissionPercent}% of home value (${homeValue.toLocaleString()})
              </div>
              <div className="space-y-3 mt-8">
                <div className="flex items-start">
                  <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p>High percentage-based fees</p>
                </div>
                <div className="flex items-start">
                  <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Paying for services you might not need</p>
                </div>
                <div className="flex items-start">
                  <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Limited control over the process</p>
                </div>
              </div>
            </div>
            
            {/* Realty.ai Side */}
            <div className="p-6 bg-white">
              <h3 className="text-2xl font-bold mb-6 text-olive-800">Realty.ai Approach</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span>Standard Bundle</span>
                  <span className="font-bold">$3,000</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span>Expert Consultation(s)</span>
                  <span className="font-bold">$1,800</span>
                </div>
                <div className="flex justify-between pt-2 font-bold">
                  <span>Total Cost</span>
                  <span>${realtyCost.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="bg-green-100 p-4 rounded-lg border-2 border-green-500 text-center mt-6">
                <span className="text-2xl font-bold text-green-700">
                  ${savingsAmount.toLocaleString()} savings
                </span>
              </div>
              
              <div className="space-y-3 mt-8">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Fixed transparent pricing</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Pay only for what you need</p>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p>Full control with expert guidance</p>
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