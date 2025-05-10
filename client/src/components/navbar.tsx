import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#283a30] text-white fixed w-full z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="mr-2">
                {/* House icon from original design with exact colors */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="26" height="26" rx="4" fill="#283a30" />
                  <path d="M16 7L7 14V25H25V14L16 7Z" stroke="#84a98c" strokeWidth="2" fill="none" />
                  <rect x="12" y="17" width="2" height="8" fill="#84a98c" />
                  <rect x="16" y="15" width="2" height="10" fill="#84a98c" />
                  <rect x="20" y="19" width="2" height="6" fill="#84a98c" />
                </svg>
              </div>
              <div className="text-xl tracking-wider font-bold">
                <div className="text-[#84a98c]">REALTY.AI</div>
              </div>
            </div>
          </Link>

          {/* Desktop Menu - Using green colors from original design */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-[#84a98c] hover:text-gray-300 whitespace-nowrap">
              Home
            </Link>
            <Link href="/buyer-flow" className="text-sm font-medium text-[#84a98c] hover:text-gray-300 whitespace-nowrap">
              Buy
            </Link>
            <Link href="/seller-flow/intent" className="text-sm font-medium text-[#84a98c] hover:text-gray-300 whitespace-nowrap">
              Sell
            </Link>
            <Link href="/idx" className="text-sm font-medium text-[#84a98c] hover:text-gray-300 whitespace-nowrap flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Homes
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#84a98c] focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu - With green brand colors */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link href="/" className="block px-4 py-2 text-[#84a98c] hover:bg-[#1c2922] border-t border-[#3a5c47]">
              Home
            </Link>
            <Link href="/buyer-flow" className="block px-4 py-2 text-[#84a98c] hover:bg-[#1c2922] border-t border-[#3a5c47]">
              Buy
            </Link>
            <Link href="/seller-flow/intent" className="block px-4 py-2 text-[#84a98c] hover:bg-[#1c2922] border-t border-[#3a5c47]">
              Sell
            </Link>
            <Link href="/idx" className="block px-4 py-2 text-[#84a98c] hover:bg-[#1c2922] border-t border-[#3a5c47] flex items-center">
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