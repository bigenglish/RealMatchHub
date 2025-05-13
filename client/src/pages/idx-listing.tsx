import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';

// Simple header component with minimal styling
const SimpleHeader = () => (
  <header style={{ padding: '20px', borderBottom: '1px solid #eaeaea', backgroundColor: 'white' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link href="/">
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4a5568', textDecoration: 'none', cursor: 'pointer' }}>Realty.AI</span>
      </Link>
      <nav>
        <Link href="/">
          <span style={{ marginLeft: '20px', color: '#4a5568', textDecoration: 'none', cursor: 'pointer' }}>Home</span>
        </Link>
      </nav>
    </div>
  </header>
);

// Simple footer component with minimal styling
const SimpleFooter = () => (
  <footer style={{ padding: '20px', borderTop: '1px solid #eaeaea', backgroundColor: '#f7fafc', marginTop: 'auto' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
      <p style={{ color: '#4a5568' }}>© 2025 Realty.AI. All rights reserved.</p>
    </div>
  </footer>
);

// Main IDX listing page with exactly what the third-party developer requested
const IdxListingPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Property Listings | Realty.AI</title>
        <meta name="description" content="Browse available property listings powered by IDX Broker." />
      </Helmet>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <SimpleHeader />
        
        {/* Exact markup as requested by third-party developer */}
        <div id="idxStart" style={{ display: 'none' }}></div>
        <div id="idxStop" style={{ display: 'none' }}></div>
        
        <SimpleFooter />
      </div>
    </>
  );
};

export default IdxListingPage;