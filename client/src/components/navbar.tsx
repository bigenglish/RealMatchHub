import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Building2, Users } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">RealEstate Hub</span>
            </a>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/">
              <a className="flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </a>
            </Link>
            <Link href="/properties">
              <a className="flex items-center space-x-1">
                <Building2 className="h-4 w-4" />
                <span>Properties</span>
              </a>
            </Link>
            <Link href="/services">
              <a className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Services</span>
              </a>
            </Link>
            <Button>Get Started</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
