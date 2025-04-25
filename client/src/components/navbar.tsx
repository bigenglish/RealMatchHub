import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-background/90 backdrop-blur-sm fixed w-full z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="text-olive-600">
                <svg width="48" height="48" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M29 2L2 17.5V56H56V17.5L29 2Z" stroke="#606C38" strokeWidth="4" fill="none" />
                  <rect x="17" y="25" width="5" height="20" fill="#606C38" />
                  <rect x="26" y="20" width="5" height="25" fill="#606C38" />
                  <rect x="35" y="30" width="5" height="15" fill="#606C38" />
                </svg>
              </div>
              <div className="ml-2 text-xl tracking-wider font-bold">
                <div className="text-olive-600">REALTY.AI</div>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
            <Link href="/buyer-flow" className="text-sm font-medium text-gray-700 hover:text-olive-600 whitespace-nowrap">
              Buy
            </Link>
            <Link href="/seller-flow/intent" className="text-sm font-medium text-gray-700 hover:text-olive-600 whitespace-nowrap">
              Sell
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-gray-700 hover:text-olive-600 whitespace-nowrap">
              How It Works
            </Link>
            <Link href="/marketplace" className="text-sm font-medium text-gray-700 hover:text-olive-600 whitespace-nowrap">
              Pricing
            </Link>
            <Link href="/service-experts" className="text-sm font-medium text-gray-700 hover:text-olive-600 whitespace-nowrap">
              Experts
            </Link>
            <Link href="/appointments" className="text-sm font-medium text-gray-700 hover:text-olive-600 whitespace-nowrap">
              Appointments
            </Link>
            <Link href="/idx-explorer" className="text-sm font-medium text-gray-700 hover:text-olive-600 whitespace-nowrap">
              IDX Explorer
            </Link>
            <Link href="/resources" className="text-sm font-medium text-gray-700 hover:text-olive-600 whitespace-nowrap">
              Resources
            </Link>
            <Link href="/demo" className="text-sm font-medium text-gray-700 hover:text-olive-600 whitespace-nowrap">
              Demo
            </Link>
            <Link href="/get-started">
              <Button className="bg-olive-600 hover:bg-olive-700 text-white px-4 py-1 text-sm whitespace-nowrap">
                Get Started Today
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link href="/buyer-flow" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Buy
            </Link>
            <Link href="/seller-flow/intent" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Sell
            </Link>
            <Link href="/how-it-works" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              How It Works
            </Link>
            <Link href="/marketplace" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Pricing
            </Link>
            <Link href="/service-experts" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Experts
            </Link>
            <Link href="/appointments" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Appointments
            </Link>
            <Link href="/idx-explorer" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              IDX Explorer
            </Link>
            <Link href="/resources" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Resources
            </Link>
            <Link href="/demo" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Demo
            </Link>
            <Link href="/get-started" className="block">
              <Button className="w-full bg-olive-600 hover:bg-olive-700 text-white">
                GET STARTED
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}