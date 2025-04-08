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
          <div className="hidden md:flex items-center space-x-5 lg:space-x-8">
            <Link href="/properties" className="text-sm font-medium text-gray-700 hover:text-olive-600">
              Buy/Sell
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-gray-700 hover:text-olive-600">
              How It Works
            </Link>
            <Link href="/marketplace" className="text-sm font-medium text-gray-700 hover:text-olive-600">
              Pricing
            </Link>
            <Link href="/service-experts" className="text-sm font-medium text-gray-700 hover:text-olive-600">
              Select your Experts
            </Link>
            <Link href="/resources" className="text-sm font-medium text-gray-700 hover:text-olive-600">
              Resources
            </Link>
            <Link href="/demo" className="text-sm font-medium text-gray-700 hover:text-olive-600">
              Watch a Demo
            </Link>
            <Link href="/get-started">
              <Button className="bg-olive-600 hover:bg-olive-700 text-white px-6">
                GET STARTED
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
            <Link href="/properties" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Buy/Sell
            </Link>
            <Link href="/how-it-works" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              How It Works
            </Link>
            <Link href="/marketplace" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Pricing
            </Link>
            <Link href="/service-experts" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Select your Experts
            </Link>
            <Link href="/resources" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Resources
            </Link>
            <Link href="/demo" className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Watch a Demo
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