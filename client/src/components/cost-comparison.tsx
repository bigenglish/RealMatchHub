import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { InfoIcon, PlayCircle } from 'lucide-react';

interface CostComparisonProps {
  className?: string;
}

export default function CostComparison({ className = '' }: CostComparisonProps) {
  const [homePrice, setHomePrice] = useState(700000);
  const [showVideo, setShowVideo] = useState(false);
  
  // Calculate savings
  const traditionalCommission = homePrice * 0.05; // 5% traditional commission
  const realtyAiCost = 3000 + 1800; // Standard bundle + Expert consultation(s)
  const savings = traditionalCommission - realtyAiCost;

  // Format currency
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  return (
    <div className={`py-10 ${className}`}>
      <div className="container max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">PAY YOUR WAY</h2>
        
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8">
          <p className="text-lg mb-4">
            <span className="font-semibold">• Flexible Pricing:</span>{' '}
            Choose only the services you need, from à la carte options to comprehensive bundles.
          </p>
          <p className="text-lg mb-6">
            <span className="font-semibold">• No Hidden Fees:</span>{' '}
            Affordable, transparent pricing upfront, so you know exactly what you're paying for.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Dialog open={showVideo} onOpenChange={setShowVideo}>
              <DialogTrigger asChild>
                <Button className="bg-[#2f4644] hover:bg-[#1a2928] text-white flex items-center gap-2">
                  <PlayCircle size={18} />
                  See How It Works
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 overflow-hidden">
                <DialogHeader className="p-4 bg-black/90 text-white">
                  <DialogTitle>How It Works</DialogTitle>
                </DialogHeader>
                <div className="aspect-video w-full bg-black">
                  <video 
                    className="w-full h-full" 
                    controls 
                    autoPlay
                    src="/PAY YOUR WAY.mp4"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="bg-[#2f4644] hover:bg-[#1a2928] text-white">
              Start For Free
            </Button>
          </div>
        </div>

        {/* Cost comparison section */}
        <div className="relative my-12 bg-slate-100 p-6 rounded-xl shadow-md">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Cost Comparison</h3>
            <p className="text-gray-600 mb-6">See how much you could save with Realty.ai</p>
            
            <div className="max-w-lg mx-auto">
              <p className="text-sm text-gray-500 mb-2">Home Price: {formatter.format(homePrice)}</p>
              <Slider
                value={[homePrice]}
                min={300000}
                max={1500000}
                step={25000}
                onValueChange={(value) => setHomePrice(value[0])}
                className="mb-4"
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 justify-between items-center">
            {/* Left column - Traditional */}
            <div className="w-full lg:w-5/12">
              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="bg-[#2f4644] text-white p-3 rounded-md text-center mb-6">
                  <h4 className="text-xl font-semibold">Traditional Commission</h4>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Standard Industry Rate</p>
                  <p className="text-3xl font-bold mb-3">5%</p>
                  
                  <Separator className="my-6" />
                  
                  <div className="bg-gray-100 p-4 rounded-md">
                    <p className="text-gray-600 text-lg">Total Cost</p>
                    <p className="text-4xl font-bold text-red-600">
                      {formatter.format(traditionalCommission)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Center column - VS */}
            <div className="hidden lg:flex flex-col items-center justify-center">
              <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center shadow-md text-lg font-bold">
                VS
              </div>
            </div>
            
            {/* Right column - Realty.ai */}
            <div className="w-full lg:w-5/12">
              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="bg-[#2f4644] text-white p-3 rounded-md text-center mb-6">
                  <h4 className="text-xl font-semibold">Realty.ai Approach</h4>
                </div>
                
                <div className="text-center">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Standard Bundle</span>
                      <span className="font-semibold">{formatter.format(3000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expert Consultation(s)</span>
                      <span className="font-semibold">{formatter.format(1800)}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="bg-gray-100 p-4 rounded-md mb-4">
                    <p className="text-gray-600 text-lg">Total Cost</p>
                    <p className="text-4xl font-bold text-green-600">
                      {formatter.format(realtyAiCost)}
                    </p>
                  </div>
                  
                  <div className="bg-green-100 p-3 rounded-md border-2 border-green-500">
                    <p className="text-green-700 font-semibold">Your Savings</p>
                    <p className="text-3xl font-bold text-green-700">
                      {formatter.format(savings)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <Button className="bg-[#2f4644] hover:bg-[#1a2928] text-white">
              Get Started Today
            </Button>
            <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
              <InfoIcon size={14} />
              Exact savings may vary based on your specific needs and property details
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}