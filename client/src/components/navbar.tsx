import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b bg-background font-inter"> {/* Apply Inter font to nav */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">REALTY.AI</span>
            </a>
          </Link>

          <div className="flex items-center"> {/* Remove space-x-4 */}
            <Link href="/buy-sell">
              <a className="text-sm mr-4">Buy/Sell</a> {/* Add mr-4 */}
            </Link>
            <Link href="/how-it-works">
              <a className="text-sm mr-4">How It Works</a> {/* Add mr-4 */}
            </Link>
            <Link href="/pricing">
              <a className="text-sm mr-4">Pricing</a> {/* Add mr-4 */}
            </Link>
            <Link href="/experts">
              <a className="text-sm mr-4">Select your Experts</a> {/* Add mr-4 */}
            </Link>
            <Link href="/resources">
              <a className="text-sm mr-4">Resources</a> {/* Add mr-4 */}
            </Link>
            <Link href="/demo">
              <a className="text-sm mr-4">Watch a Demo</a> {/* Add mr-4 */}
            </Link>
            <Button>GET STARTED</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}