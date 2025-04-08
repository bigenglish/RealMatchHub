import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="bg-background/90 backdrop-blur-sm fixed w-full z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div className="text-olive-600">
                <svg width="58" height="58" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/properties" className="text-sm font-medium text-gray-700 hover:text-primary">
              Buy/Sell
            </Link>
            <Link href="/how-it-works" className="text-sm font-medium text-gray-700 hover:text-primary">
              How It Works
            </Link>
            <Link href="/marketplace" className="text-sm font-medium text-gray-700 hover:text-primary">
              Pricing
            </Link>
            <Link href="/service-experts" className="text-sm font-medium text-gray-700 hover:text-primary">
              Select your Experts
            </Link>
            <Link href="/resources" className="text-sm font-medium text-gray-700 hover:text-primary">
              Resources
            </Link>
            <Link href="/demo" className="text-sm font-medium text-gray-700 hover:text-primary">
              Watch a Demo
            </Link>
            <Link href="/get-started">
              <Button className="bg-olive-600 hover:bg-olive-700 text-white px-6">
                GET STARTED
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}