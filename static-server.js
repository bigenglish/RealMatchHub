// Simple static server that serves a styled HTML page
import express from 'express';

const app = express();
const PORT = 5001; // Using port 5001 which is already in the .replit configuration

// Create the HTML page with inline styles and dark green color scheme
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Realty.AI - AI-Powered Real Estate Platform</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #283a30;
      --primary-light: #6a9473;
      --primary-dark: #1c2922;
      --secondary: #84a98c;
      --white: #ffffff;
      --gray-100: #f9fafb;
      --gray-200: #e5e7eb;
      --gray-300: #d1d5db;
      --gray-400: #9ca3af;
      --gray-500: #6b7280;
      --gray-700: #374151;
      --gray-900: #111827;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    body {
      min-height: 100vh;
      background-color: var(--gray-100);
    }
    
    .header {
      background-color: var(--primary);
      padding: 1rem;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 100;
    }
    
    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      display: flex;
      align-items: center;
      color: var(--secondary);
      font-weight: 700;
      font-size: 1.5rem;
      text-decoration: none;
    }
    
    .logo-icon {
      margin-right: 0.75rem;
      width: 32px;
      height: 32px;
    }
    
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    
    .nav-link {
      color: var(--secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
    }
    
    .hero {
      background-color: var(--primary);
      padding: 8rem 0 10rem;
      color: var(--white);
      text-align: center;
      margin-top: 64px;
    }
    
    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    
    .hero p {
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto 2rem;
      color: var(--gray-200);
    }
    
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      text-decoration: none;
      border-radius: 0.25rem;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .btn-primary {
      background-color: var(--secondary);
      color: var(--white);
    }
    
    .btn-primary:hover {
      background-color: var(--primary-light);
    }
    
    .video-container {
      width: 100%;
      max-width: 640px;
      margin: 2rem auto;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    .video-placeholder {
      width: 100%;
      aspect-ratio: 16 / 9;
      background-color: var(--gray-300);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .search-container {
      background-color: var(--white);
      border-radius: 0.5rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      margin-top: -5rem;
      position: relative;
      z-index: 10;
    }
    
    .search-tabs {
      display: flex;
      border-bottom: 1px solid var(--gray-200);
    }
    
    .search-tab {
      padding: 1rem 2rem;
      font-weight: 500;
      cursor: pointer;
    }
    
    .search-tab.active {
      color: var(--primary);
      border-bottom: 2px solid var(--secondary);
    }
    
    .search-form {
      padding: 2rem;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    @media (min-width: 768px) {
      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    .form-field {
      margin-bottom: 1rem;
    }
    
    .form-label {
      display: block;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      color: var(--gray-500);
    }
    
    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--gray-300);
      border-radius: 0.25rem;
      font-size: 1rem;
    }
    
    .search-button {
      background-color: var(--primary);
      color: var(--white);
      width: 100%;
      padding: 0.75rem;
      border: none;
      border-radius: 0.25rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }
    
    .search-button:hover {
      background-color: var(--primary-dark);
    }

    .features {
      padding: 4rem 0;
    }

    .features-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-top: 3rem;
    }

    @media (min-width: 768px) {
      .features-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .feature-card {
      background-color: var(--white);
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      background-color: var(--primary);
      color: var(--white);
      width: 3rem;
      height: 3rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: -1.5rem auto 1rem;
      position: relative;
    }

    .feature-content {
      padding: 1.5rem;
      text-align: center;
    }

    .feature-title {
      font-size: 1.25rem;
      color: var(--gray-900);
      margin-bottom: 0.75rem;
    }

    .feature-text {
      color: var(--gray-500);
      line-height: 1.6;
    }

    .footer {
      background-color: var(--primary);
      color: var(--white);
      padding: 4rem 0 2rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 768px) {
      .footer-grid {
        grid-template-columns: 2fr 1fr 1fr 1fr;
      }
    }

    .footer-brand {
      margin-bottom: 1rem;
    }

    .footer-text {
      color: var(--gray-300);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .footer-title {
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
      color: var(--gray-200);
    }

    .footer-links {
      list-style: none;
    }

    .footer-link {
      margin-bottom: 0.75rem;
    }

    .footer-link a {
      color: var(--gray-300);
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-link a:hover {
      color: var(--white);
    }

    .copyright {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: 3rem;
      padding-top: 1.5rem;
      text-align: center;
      color: var(--gray-400);
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <a href="#" class="logo">
          <svg class="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="26" height="26" rx="4" fill="#283a30" />
            <path d="M16 7L7 14V25H25V14L16 7Z" stroke="#84a98c" stroke-width="2" fill="none" />
            <rect x="12" y="17" width="2" height="8" fill="#84a98c" />
            <rect x="16" y="15" width="2" height="10" fill="#84a98c" />
            <rect x="20" y="19" width="2" height="6" fill="#84a98c" />
          </svg>
          REALTY.AI
        </a>
        <div class="nav-links">
          <a href="#" class="nav-link">Home</a>
          <a href="#" class="nav-link">Buy</a>
          <a href="#" class="nav-link">Sell</a>
          <a href="#" class="nav-link">Find Homes</a>
        </div>
      </nav>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <h1>Realty.AI: The Future of Real Estate is Here.</h1>
      <p>Save time and skip the fees with AI-Powered Insights, Vetted-Expert Guidance.</p>
      
      <div class="video-container">
        <div class="video-placeholder" style="background-color: #1c2922;">
          <!-- Placeholder for video display -->
          <div style="color: white; text-align: center; padding: 20px;">
            <p style="font-size: 18px; margin-bottom: 10px;">Professional Video Call Consultation</p>
            <p style="font-size: 14px;">Real-time expert guidance on your property journey</p>
          </div>
        </div>
      </div>
      
      <a href="#" class="btn btn-primary">GET STARTED FREE</a>
    </div>
  </section>

  <div class="container">
    <div class="search-container">
      <div class="search-tabs">
        <div class="search-tab">Rent</div>
        <div class="search-tab active">Buy</div>
        <div class="search-tab">Sell</div>
      </div>
      
      <div class="search-form">
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label">Where</label>
            <input type="text" class="form-input" placeholder="City, State or ZIP">
          </div>
          
          <div class="form-field">
            <label class="form-label">What</label>
            <input type="text" class="form-input" placeholder="Property type">
          </div>
        </div>
        
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label">Price range</label>
            <input type="text" class="form-input" placeholder="Min - Max">
          </div>
          
          <div class="form-field">
            <label class="form-label">When</label>
            <input type="date" class="form-input">
          </div>
        </div>
        
        <button class="search-button">Browse Properties</button>
      </div>
    </div>
  </div>

  <section class="features">
    <div class="container">
      <h2 style="text-align: center; color: var(--gray-900); font-size: 2rem; margin-bottom: 1rem;">How Realty.AI Works</h2>
      <p style="text-align: center; color: var(--gray-500); max-width: 700px; margin: 0 auto;">Real Estate Simplified. Powered by AI, Guided by Experts.</p>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">AI</div>
          <div class="feature-content">
            <h3 class="feature-title">AI-Powered Intelligence</h3>
            <p class="feature-text">Our AI algorithms analyze thousands of properties to find your perfect match based on your preferences.</p>
          </div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">$</div>
          <div class="feature-content">
            <h3 class="feature-title">Pay Your Way</h3>
            <p class="feature-text">Choose how you want to pay. Full service options or pay-per-service flexibility.</p>
          </div>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">✓</div>
          <div class="feature-content">
            <h3 class="feature-title">Vetted Professionals</h3>
            <p class="feature-text">Access our network of pre-vetted real estate professionals for expert guidance.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <a href="#" class="logo">
              <svg class="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="26" height="26" rx="4" fill="#283a30" />
                <path d="M16 7L7 14V25H25V14L16 7Z" stroke="#84a98c" stroke-width="2" fill="none" />
                <rect x="12" y="17" width="2" height="8" fill="#84a98c" />
                <rect x="16" y="15" width="2" height="10" fill="#84a98c" />
                <rect x="20" y="19" width="2" height="6" fill="#84a98c" />
              </svg>
              REALTY.AI
            </a>
          </div>
          <p class="footer-text">Transforming the real estate experience with AI-powered insights and expert guidance.</p>
        </div>
        
        <div>
          <h4 class="footer-title">For Buyers</h4>
          <ul class="footer-links">
            <li class="footer-link"><a href="#">Find a Home</a></li>
            <li class="footer-link"><a href="#">Mortgage Calculator</a></li>
            <li class="footer-link"><a href="#">Neighborhood Guides</a></li>
          </ul>
        </div>
        
        <div>
          <h4 class="footer-title">For Sellers</h4>
          <ul class="footer-links">
            <li class="footer-link"><a href="#">Home Valuation</a></li>
            <li class="footer-link"><a href="#">Selling Guide</a></li>
            <li class="footer-link"><a href="#">Marketing Services</a></li>
          </ul>
        </div>
        
        <div>
          <h4 class="footer-title">Company</h4>
          <ul class="footer-links">
            <li class="footer-link"><a href="#">About Us</a></li>
            <li class="footer-link"><a href="#">Contact</a></li>
            <li class="footer-link"><a href="#">Careers</a></li>
          </ul>
        </div>
      </div>
      
      <div class="copyright">
        <p>&copy; 2025 Realty.AI. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script>
    // Simple tab functionality
    document.querySelectorAll('.search-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.search-tab').forEach(t => {
          t.classList.remove('active');
        });
        tab.classList.add('active');
      });
    });
  </script>
</body>
</html>
`;

// Route to serve the HTML content
app.get('/', (req, res) => {
  res.send(htmlContent);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Static server running at http://0.0.0.0:${PORT}`);
});