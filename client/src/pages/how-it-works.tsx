
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">How Reaty.AI Works</h1>
        <p className="text-2xl text-olive-600 mb-4">Real Estate, Simplified: Powered by AI, Guided by Experts</p>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Save time and skip the fees with AI-Powered Insights, Vetted-Expert Guidance. Buy or Sell Your next home, Effortlessly.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-24">
        {/* Step 1: Search */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-olive-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-olive-600 font-bold">1</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Upload inspiration and define Your preferences</h2>
            <p className="text-gray-600 mb-6">
              Start by telling us what you're looking for. Whether you're buying, selling, or need to manage your home, upload photos and answer a few simple questions about your goals and basic financial information.
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
            <p className="text-gray-500">Screenshot of the initial questionnaire</p>
          </div>
        </div>

        {/* Step 2: Explore */}
        <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
          <div>
            <div className="bg-olive-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-olive-600 font-bold">2</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Explore</h2>
            <p className="text-gray-600 mb-6">
              Browse through agent profiles and matching results to find the perfect fit for your real estate journey.
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
            <p className="text-gray-500">Image of agent profiles and matching results</p>
          </div>
        </div>

        {/* Step 3: Choose Services */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-olive-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-olive-600 font-bold">3</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Choose Your Services</h2>
            <p className="text-gray-600 mb-6">
              Select from our range of pricing bundle tiers and service packages tailored to your needs.
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
            <p className="text-gray-500">Screenshot of pricing bundle tiers and service packages</p>
          </div>
        </div>

        {/* Step 4: Manage Journey */}
        <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
          <div>
            <div className="bg-olive-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-olive-600 font-bold">4</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Manage Your Journey</h2>
            <p className="text-gray-600 mb-6">
              Track your progress and manage your entire real estate journey through the Reaty.ai dashboard.
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
            <p className="text-gray-500">Screenshot of the Reaty.ai dashboard</p>
          </div>
        </div>

        {/* Step 5: Support */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-olive-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-olive-600 font-bold">5</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Receive 24/7 Support</h2>
            <p className="text-gray-600 mb-6">
              Get continuous support and guidance throughout your real estate journey.
            </p>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
            <p className="text-gray-500">Support interface visualization</p>
          </div>
        </div>
      </div>

      {/* Visual Flow Arrows */}
      <div className="hidden md:block">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex justify-center my-8">
            <ArrowRight className="w-6 h-6 text-olive-600 transform rotate-90" />
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center mt-24">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <Button className="bg-olive-600 hover:bg-olive-700 text-white gap-2">
          Begin Your Journey
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
