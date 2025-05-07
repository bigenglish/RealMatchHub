import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowRightCircle, Search, Users, ScrollText, LayoutDashboard, HeadphonesIcon } from "lucide-react";
import { Link } from "wouter";

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">How Reaty.AI Works</h1>
        <p className="text-2xl font-semibold text-gray-800 mb-4">Real Estate, Simplified: Powered by AI, Guided by Experts</p>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Save time and skip the fees with AI-Powered Insights, Vetted-Expert Guidance. Buy or Sell Your next home, Effortlessly.
        </p>
      </div>

      {/* Quick Overview Steps */}
      <div className="flex flex-wrap justify-center gap-4 mb-20">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Search className="w-6 h-6 text-blue-600" />
          </div>
          <span className="ml-2 font-medium">Search</span>
        </div>
        <div className="flex items-center">
          <ArrowRightCircle className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <span className="ml-2 font-medium">Explore</span>
        </div>
        <div className="flex items-center">
          <ArrowRightCircle className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <ScrollText className="w-6 h-6 text-blue-600" />
          </div>
          <span className="ml-2 font-medium">Choose Services</span>
        </div>
        <div className="flex items-center">
          <ArrowRightCircle className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
          </div>
          <span className="ml-2 font-medium">Manage Journey</span>
        </div>
        <div className="flex items-center">
          <ArrowRightCircle className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <HeadphonesIcon className="w-6 h-6 text-blue-600" />
          </div>
          <span className="ml-2 font-medium">24/7 Support</span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-32">
        {/* Step 1: Search */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <span className="text-blue-600 font-bold text-xl">1</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">Upload inspiration and define Your preferences</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Start by telling us what you're looking for. Whether you're buying, selling, or need to manage your home, upload photos and answer a few simple questions about your goals and basic financial information.
            </p>
            <Link href="/search">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-6 rounded-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 shadow-lg h-96 flex items-center justify-center">
            <div className="relative w-full h-full">
              <img 
                src="/images/questionnaire.png" 
                alt="Initial questionnaire" 
                className="absolute inset-0 w-full h-full object-contain rounded-lg"
                onError={(e) => e.currentTarget.src = "https://placehold.co/600x400/e6f4ff/0066cc?text=Search+Questionnaire"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Step 2: Explore */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 shadow-lg h-96 flex items-center justify-center">
            <div className="relative w-full h-full">
              <img 
                src="/images/agent-profiles.png" 
                alt="Expert profiles" 
                className="absolute inset-0 w-full h-full object-contain rounded-lg"
                onError={(e) => e.currentTarget.src = "https://placehold.co/600x400/e6f4ff/0066cc?text=Expert+Profiles"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <span className="text-blue-600 font-bold text-xl">2</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">Meet Your Matches</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Based on your criteria, we'll match you with a curated list of qualified real estate agents, contractors, designers, and other professionals in your area. Review their profiles, experience, and client testimonials to find the perfect fit.
            </p>
            <Link href="/experts">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-6 rounded-lg">
                View Experts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Step 3: Choose Services */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <span className="text-blue-600 font-bold text-xl">3</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">Choose Your Services</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Select only the services you need, from initial consultation to full transaction management. Our transparent pricing model lets you pay for what you use, or select from our predetermined packages, saving you time and money. No hidden fees or surprise commissions.
            </p>
            <Link href="/pricing">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-6 rounded-lg">
                View Packages
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 shadow-lg h-96 flex items-center justify-center">
            <div className="relative w-full h-full">
              <img 
                src="/images/pricing-bundles.png" 
                alt="Pricing bundles" 
                className="absolute inset-0 w-full h-full object-contain rounded-lg"
                onError={(e) => e.currentTarget.src = "https://placehold.co/600x400/e6f4ff/0066cc?text=Service+Packages"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Step 4: Manage Journey */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 shadow-lg h-96 flex items-center justify-center">
            <div className="relative w-full h-full">
              <img 
                src="/images/dashboard.png" 
                alt="Dashboard interface" 
                className="absolute inset-0 w-full h-full object-contain rounded-lg"
                onError={(e) => e.currentTarget.src = "https://placehold.co/600x400/e6f4ff/0066cc?text=Dashboard+Interface"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <span className="text-blue-600 font-bold text-xl">4</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">Manage Your Journey</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Manage every aspect of your real estate journey within the Reaty.AI platform. Track progress, review documents, schedule appointments, communicate with your team, and access valuable resources—all in one convenient location.
            </p>
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-6 rounded-lg">
                View Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Step 5: Support */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <span className="text-blue-600 font-bold text-xl">5</span>
            </div>
            <h2 className="text-3xl font-bold mb-6">We're Here to Help</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              From Expert guidance to our dedicated Reaty.AI support team, available 24/7 to answer your questions and provide assistance throughout the entire process. Access FAQs, community forums, and direct support channels whenever you need them.
            </p>
            <Link href="/support">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-6 rounded-lg">
                Contact Support
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 shadow-lg h-96 flex items-center justify-center">
            <div className="relative w-full h-full">
              <img 
                src="/images/support.png" 
                alt="Support interface" 
                className="absolute inset-0 w-full h-full object-contain rounded-lg"
                onError={(e) => e.currentTarget.src = "https://placehold.co/600x400/e6f4ff/0066cc?text=24/7+Support"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-32 bg-gradient-to-r from-blue-50 to-cyan-50 p-16 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to experience real estate simplified?</h2>
        <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">Create your free Reaty.AI account and start your journey today.</p>
        <Link href="/signup">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-lg">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <div className="mt-4 space-y-4">
          <Button asChild size="lg" variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
            <Link href="/auth/welcome">Get Started Today</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full">
            <Link href="/auth/welcome">Create Your Free Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}