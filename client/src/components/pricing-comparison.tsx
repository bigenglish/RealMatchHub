import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Check, X, DollarSign, ArrowRight } from 'lucide-react';

/**
 * Component that shows a visual comparison between traditional 3% real estate 
 * commission and Realty.AI's pricing model
 */
export default function PricingComparison() {
  // Calculate example savings for different home prices
  const homePrices = [
    { price: 300000, label: "$300,000" },
    { price: 500000, label: "$500,000" },
    { price: 750000, label: "$750,000" },
    { price: 1000000, label: "$1,000,000" }
  ];

  // Realty.AI package prices
  const realtyAIPrices = {
    basic: 1500,
    premium: 2500,
    concierge: 5000
  };

  return (
    <div className="w-full mx-auto my-12 max-w-6xl">
      <h2 className="text-3xl font-bold text-center mb-2">Compare & Save</h2>
      <p className="text-center text-gray-600 mb-8">
        See how much you can save with Realty.AI compared to traditional 3% commission
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Traditional Model Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-700 text-white">
            <CardTitle className="text-2xl">Traditional Model</CardTitle>
            <CardDescription className="text-gray-200">
              3% Commission to Listing/Buyer's Agent
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium text-lg mb-2">What You Pay</h3>
                {homePrices.map((item) => (
                  <div key={item.price} className="flex justify-between items-center py-2">
                    <span>{item.label} home:</span>
                    <span className="font-bold text-red-600">${(item.price * 0.03).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 pt-2">
                <h3 className="font-medium text-lg mb-2">What You Get</h3>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Agent representation</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Listing on MLS</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Negotiation support</span>
                </div>
                <div className="flex items-start">
                  <X className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-500">No AI-powered recommendations</span>
                </div>
                <div className="flex items-start">
                  <X className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-500">No transparent pricing</span>
                </div>
                <div className="flex items-start">
                  <X className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-500">Pay regardless of services used</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Realty.AI Model Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
            <CardTitle className="text-2xl">Realty.AI Model</CardTitle>
            <CardDescription className="text-gray-100">
              Flat-fee packages based on your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium text-lg mb-2">What You Pay</h3>
                <div className="flex justify-between items-center py-2">
                  <span>Basic Package:</span>
                  <span className="font-bold text-green-600">${realtyAIPrices.basic.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Premium Package:</span>
                  <span className="font-bold text-green-600">${realtyAIPrices.premium.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Concierge Package:</span>
                  <span className="font-bold text-green-600">${realtyAIPrices.concierge.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <h3 className="font-medium text-lg mb-2">What You Get</h3>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Expert support when you need it</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>AI-powered property search & recommendations</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Document review & digital signing</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Pay only for services you need</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Transparent, upfront pricing</span>
                </div>
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>24/7 AI chatbot assistance</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Savings Calculator Section */}
      <div className="mt-12 p-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-center mb-6">Your Potential Savings</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Home Value</th>
                <th className="text-right py-3 px-4">Traditional 3% Commission</th>
                <th className="text-center py-3 px-4"></th>
                <th className="text-right py-3 px-4">Realty.AI Premium</th>
                <th className="text-right py-3 px-4 text-green-600">Your Savings</th>
              </tr>
            </thead>
            <tbody>
              {homePrices.map((item) => {
                const traditionalCost = item.price * 0.03;
                const realtyAICost = realtyAIPrices.premium;
                const savings = traditionalCost - realtyAICost;
                
                return (
                  <tr key={item.price} className="border-b">
                    <td className="py-4 px-4 font-medium">{item.label}</td>
                    <td className="text-right py-4 px-4">${traditionalCost.toLocaleString()}</td>
                    <td className="text-center py-4 px-4">
                      <ArrowRight className="inline-block h-4 w-4 text-gray-400" />
                    </td>
                    <td className="text-right py-4 px-4">${realtyAICost.toLocaleString()}</td>
                    <td className="text-right py-4 px-4 text-green-600 font-bold">
                      ${savings.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 text-center text-gray-600">
          <p>Actual savings may vary based on your specific situation and chosen package.</p>
        </div>
      </div>
    </div>
  );
}