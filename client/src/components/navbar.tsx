import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1c2a36] text-white fixed w-full z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="text-[#ddd]">
                {/* House icon from original design */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#84a98c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 22V12h6v10" stroke="#84a98c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="ml-2 text-xl tracking-wider font-bold">
                <div className="text-white">REALTY.AI</div>
              </div>
            </div>
          </Link>

          {/* Desktop Menu - Simplified for the dark header */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-white hover:text-gray-300 whitespace-nowrap">
              Home
            </Link>
            <Link href="/buyer-flow" className="text-sm font-medium text-white hover:text-gray-300 whitespace-nowrap">
              Buy
            </Link>
            <Link href="/seller-flow/intent" className="text-sm font-medium text-white hover:text-gray-300 whitespace-nowrap">
              Sell
            </Link>
            <Link href="/idx" className="text-sm font-medium text-white hover:text-gray-300 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Homes
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Simplified to match desktop and original design */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link href="/" className="block px-4 py-2 text-white hover:bg-[#263847] border-t border-[#3a4c5b]">
              Home
            </Link>
            <Link href="/buyer-flow" className="block px-4 py-2 text-white hover:bg-[#263847] border-t border-[#3a4c5b]">
              Buy
            </Link>
            <Link href="/seller-flow/intent" className="block px-4 py-2 text-white hover:bg-[#263847] border-t border-[#3a4c5b]">
              Sell
            </Link>
            <Link href="/idx" className="block px-4 py-2 text-white hover:bg-[#263847] border-t border-[#3a4c5b] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Homes
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}