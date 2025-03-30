import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b bg-background font-inter">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">REALTY.AI</span>
            </div>
          </Link>

          <div className="flex items-center">
            <Link href="/properties" className="text-sm mr-4">
              Properties
            </Link>
            <Link href="/services" className="text-sm mr-4">
              Services
            </Link>
            <Link href="/how-it-works" className="text-sm mr-4">
              How It Works
            </Link>
            <Link href="/pricing" className="text-sm mr-4">
              Pricing
            </Link>
            <Link href="/resources" className="text-sm mr-4">
              Resources
            </Link>
            <Button>GET STARTED</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}