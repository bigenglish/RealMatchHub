
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
            <Button className="bg-olive-600 hover:bg-olive-700 text-white">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
            <img src="/images/questionnaire.png" alt="Initial questionnaire" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Step 2: Explore */}
        <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
          <div>
            <div className="bg-olive-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-olive-600 font-bold">2</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Meet Your Matches</h2>
            <p className="text-gray-600 mb-6">
              Based on your criteria, we'll match you with a curated list of qualified real estate agents, contractors, designers, and other professionals in your area. Review their profiles, experience, and client testimonials to find the perfect fit.
            </p>
            <Button className="bg-olive-600 hover:bg-olive-700 text-white">
              View Profiles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
            <img src="/images/agent-profiles.png" alt="Agent profiles" className="w-full h-full object-contain" />
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
              Select only the services you need, from initial consultation to full transaction management. Our transparent pricing model lets you pay for what you use, or select from our predetermined packages, saving you time and money. No hidden fees or surprise commissions.
            </p>
            <Button className="bg-olive-600 hover:bg-olive-700 text-white">
              View Packages
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
            <img src="/images/pricing-bundles.png" alt="Pricing bundles" className="w-full h-full object-contain" />
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
              Manage every aspect of your real estate journey within the Reaty.ai platform. Track progress, review documents, schedule appointments, communicate with your team, and access valuable resources—all in one convenient location.
            </p>
            <Button className="bg-olive-600 hover:bg-olive-700 text-white">
              View Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
            <img src="/images/dashboard.png" alt="Dashboard interface" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Step 5: Support */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-olive-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <span className="text-olive-600 font-bold">5</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">We're Here to Help</h2>
            <p className="text-gray-600 mb-6">
              From Expert guidance to our dedicated Realty.ai support team, available 24/7 to answer your questions and provide assistance throughout the entire process. Access FAQs, community forums, and direct support channels whenever you need them.
            </p>
            <Button className="bg-olive-600 hover:bg-olive-700 text-white">
              Contact Support
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="bg-gray-100 rounded-lg p-8 h-64 flex items-center justify-center">
            <img src="/images/support.png" alt="Support interface" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-24">
        <h2 className="text-2xl font-bold mb-4">Ready to experience real estate simplified?</h2>
        <p className="text-gray-600 mb-6">Create your free Reaty.ai account and start your journey.</p>
        <Button className="bg-olive-600 hover:bg-olive-700 text-white gap-2">
          Get Started Today
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
