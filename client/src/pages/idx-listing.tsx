import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

// Simple header component
const SimpleHeader = () => (
  <header className="w-full py-4 px-6 bg-white border-b border-gray-200">
    <div className="container mx-auto flex justify-between items-center">
      <Link href="/">
        <a className="text-2xl font-bold text-olive-600">Realty.AI</a>
      </Link>
      <nav>
        <ul className="flex space-x-6">
          <li>
            <Link href="/">
              <a className="text-gray-600 hover:text-olive-600">Home</a>
            </Link>
          </li>
          <li>
            <Link href="/properties">
              <a className="text-gray-600 hover:text-olive-600">Properties</a>
            </Link>
          </li>
          <li>
            <Link href="/contact">
              <a className="text-gray-600 hover:text-olive-600">Contact</a>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
);

// Simple footer component
const SimpleFooter = () => (
  <footer className="w-full py-6 px-6 bg-gray-100 border-t border-gray-200">
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-gray-600">© 2025 Realty.AI. All rights reserved.</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="link" className="text-gray-600 hover:text-olive-600">
            Privacy Policy
          </Button>
          <Button variant="link" className="text-gray-600 hover:text-olive-600">
            Terms of Service
          </Button>
        </div>
      </div>
    </div>
  </footer>
);

// Main IDX listing page with minimal styling
const IdxListingPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Property Listings | Realty.AI</title>
        <meta name="description" content="Browse available property listings powered by IDX Broker." />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <SimpleHeader />
        
        <main className="flex-1 w-full py-8">
          <div className="container mx-auto px-4">
            {/* IDX Broker markers as requested */}
            <div id="idxStart" style={{ display: 'none' }}></div>
            <div id="idxStop" style={{ display: 'none' }}></div>
          </div>
        </main>
        
        <SimpleFooter />
      </div>
    </>
  );
};

export default IdxListingPage;