/**
 * Simple standalone server that directly serves the React app with a fallback to static HTML
 * This approach avoids the complexities of the Vite development server
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Create an HTML string that matches your desired design
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
    
    header {
      background-color: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
    
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      display: flex;
      align-items: center;
      color: var(--primary);
      font-weight: 700;
      font-size: 1.5rem;
      text-decoration: none;
    }
    
    .logo-icon {
      margin-right: 0.75rem;
      width: 32px;
      height: 32px;
    }

    .hamburger {
      width: 24px;
      height: 24px;
      cursor: pointer;
      color: var(--primary);
    }
    
    main {
      padding-top: 5rem; /* Space for fixed header */
      min-height: calc(100vh - 5rem);
    }

    .hero {
      background-color: var(--primary);
      padding: 6rem 0;
      color: white;
      text-align: center;
    }
    
    .hero h1 {
      font-size: 2.25rem;
      margin-bottom: 1rem;
    }
    
    .hero p {
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto 2rem;
      color: var(--gray-200);
    }

    .video-container {
      width: 100%;
      max-width: 640px;
      margin: 2rem auto;
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      text-decoration: none;
      border-radius: 0.25rem;
      transition: all 0.2s;
      cursor: pointer;
    }
    
    .btn-primary {
      background-color: var(--secondary);
      color: white;
    }
    
    .btn-primary:hover {
      background-color: var(--primary-light);
    }

    /* Search form styles */
    .search-container {
      background-color: white;
      border-radius: 0.5rem;
      margin-top: -3rem;
      position: relative;
      z-index: 10;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .search-tabs {
      display: flex;
      border-bottom: 1px solid var(--gray-200);
    }
    
    .search-tab {
      padding: 1rem 2rem;
      font-weight: 500;
      cursor: pointer;
      position: relative;
    }
    
    .search-tab.active {
      color: var(--primary);
    }
    
    .search-tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--primary);
    }
    
    .search-form {
      padding: 1.5rem;
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
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.25rem;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      display: block;
      width: auto;
      margin: 1rem 0 0;
    }
    
    .search-button:hover {
      background-color: var(--primary-dark);
    }

    /* Features section */
    .features {
      padding: 5rem 0;
      background-color: white;
      text-align: center;
    }

    .features h2 {
      font-size: 2rem;
      color: var(--gray-900);
      margin-bottom: 1rem;
    }

    .features p {
      color: var(--gray-500);
      max-width: 600px;
      margin: 0 auto 3rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    @media (min-width: 768px) {
      .features-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .feature-card {
      background-color: var(--gray-100);
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      width: 4rem;
      height: 4rem;
      background-color: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 1.5rem;
    }

    .feature-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.75rem;
    }

    .feature-text {
      color: var(--gray-500);
      font-size: 0.875rem;
      line-height: 1.6;
    }

    .testimonials {
      padding: 3rem 0;
      background-color: var(--gray-100);
    }

    .testimonials h2 {
      text-align: center;
      font-size: 1.5rem;
      margin-bottom: 2rem;
      color: var(--gray-900);
    }

    .testimonial {
      max-width: 800px;
      margin: 0 auto;
      padding: 1.5rem;
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .testimonial-stars {
      display: flex;
      margin-bottom: 0.5rem;
      color: #f59e0b;
    }

    .testimonial-quote {
      font-style: italic;
      color: var(--gray-700);
      margin-bottom: 1rem;
    }

    .testimonial-author {
      font-weight: 600;
      color: var(--gray-900);
    }

    .testimonial-location {
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    footer {
      background-color: var(--primary);
      color: white;
      padding: 3rem 0;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    @media (min-width: 768px) {
      .footer-grid {
        grid-template-columns: 2fr 1fr 1fr 1fr;
      }
    }

    .footer-logo {
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      color: white;
      font-weight: 700;
      font-size: 1.5rem;
    }

    .footer-text {
      color: var(--gray-300);
      margin-bottom: 1.5rem;
      line-height: 1.6;
      font-size: 0.875rem;
    }

    .footer-heading {
      font-size: 1.1rem;
      margin-bottom: 1.25rem;
      color: white;
      font-weight: 600;
    }

    .footer-links {
      list-style: none;
    }

    .footer-link-item {
      margin-bottom: 0.75rem;
    }

    .footer-link {
      color: var(--gray-300);
      font-size: 0.875rem;
      text-decoration: none;
    }

    .footer-link:hover {
      color: white;
    }

    .footer-bottom {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      color: var(--gray-400);
      font-size: 0.875rem;
    }

    .chat-bubble {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 3.5rem;
      height: 3.5rem;
      background-color: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      z-index: 50;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="navbar">
        <a href="/" class="logo">
          <svg class="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="26" height="26" rx="4" fill="#283a30" />
            <path d="M16 7L7 14V25H25V14L16 7Z" stroke="#84a98c" stroke-width="2" fill="none" />
            <rect x="12" y="17" width="2" height="8" fill="#84a98c" />
            <rect x="16" y="15" width="2" height="10" fill="#84a98c" />
            <rect x="20" y="19" width="2" height="6" fill="#84a98c" />
          </svg>
          REALTY.AI
        </a>
        <div class="hamburger">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>
      </div>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <h1>Realty.AI: The Future of Real Estate is Here.</h1>
        <p>Save time and skip the fees with AI-Powered Insights, Vetted-Expert Guidance.</p>
        
        <div class="video-container">
          <img src="https://place-hold.it/640x360/1c2922/FFFFFF&text=Professional+Video+Call+Consultation" alt="Video preview" style="width: 100%;" />
        </div>
        
        <a href="/buyer-flow" class="btn btn-primary">GET STARTED FREE</a>
      </div>
    </section>

    <section class="search-container">
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
        
        <button class="search-button">Browse Properties</button>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2>How Realty.AI Works</h2>
        <p>Real Estate Simplified. Powered by AI, Guided by Experts.</p>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">AI</div>
            <h3 class="feature-title">AI-Powered Intelligence</h3>
            <p class="feature-text">Our AI algorithms analyze thousands of properties to find your perfect match based on your preferences.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">$</div>
            <h3 class="feature-title">Pay Your Way</h3>
            <p class="feature-text">Choose how you want to pay. Full service options or pay-per-service flexibility.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">✓</div>
            <h3 class="feature-title">Vetted Professionals</h3>
            <p class="feature-text">Access our network of pre-vetted real estate professionals for expert guidance.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="testimonials">
      <div class="container">
        <h2>Trusted By</h2>
        <div class="testimonial">
          <div class="testimonial-stars">
            ★★★★★
          </div>
          <p class="testimonial-quote">"I paid no agent commissions when selling my home and saved $24,000 with Realty.AI"</p>
          <p class="testimonial-author">John D., Los Angeles</p>
          <p class="testimonial-location">Home Seller, Feb 8, 2025</p>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="footer-grid">
      <div>
        <div class="footer-logo">
          <svg class="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="26" height="26" rx="4" fill="#84a98c" />
            <path d="M16 7L7 14V25H25V14L16 7Z" stroke="white" stroke-width="2" fill="none" />
            <rect x="12" y="17" width="2" height="8" fill="white" />
            <rect x="16" y="15" width="2" height="10" fill="white" />
            <rect x="20" y="19" width="2" height="6" fill="white" />
          </svg>
          REALTY.AI
        </div>
        <p class="footer-text">
          Transforming the real estate experience with AI-powered insights and expert guidance.
        </p>
      </div>
      
      <div>
        <h4 class="footer-heading">For Buyers</h4>
        <ul class="footer-links">
          <li class="footer-link-item"><a href="#" class="footer-link">Find a Home</a></li>
          <li class="footer-link-item"><a href="#" class="footer-link">Mortgage Calculator</a></li>
          <li class="footer-link-item"><a href="#" class="footer-link">Neighborhood Guides</a></li>
        </ul>
      </div>
      
      <div>
        <h4 class="footer-heading">For Sellers</h4>
        <ul class="footer-links">
          <li class="footer-link-item"><a href="#" class="footer-link">Home Valuation</a></li>
          <li class="footer-link-item"><a href="#" class="footer-link">Selling Guide</a></li>
          <li class="footer-link-item"><a href="#" class="footer-link">Marketing Services</a></li>
        </ul>
      </div>
      
      <div>
        <h4 class="footer-heading">Company</h4>
        <ul class="footer-links">
          <li class="footer-link-item"><a href="#" class="footer-link">About Us</a></li>
          <li class="footer-link-item"><a href="#" class="footer-link">Contact</a></li>
          <li class="footer-link-item"><a href="#" class="footer-link">Careers</a></li>
        </ul>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>&copy; 2025 Realty.AI. All rights reserved.</p>
    </div>
  </footer>

  <div class="chat-bubble">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </div>

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

// Serve the HTML content directly
app.get('/', (req, res) => {
  res.send(htmlContent);
});

// For the buyer flow page
app.get('/buyer-flow', (req, res) => {
  const buyerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Find Your Dream Property | Realty.AI</title>
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
    
    header {
      background-color: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
    
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      display: flex;
      align-items: center;
      color: var(--primary);
      font-weight: 700;
      font-size: 1.5rem;
      text-decoration: none;
    }
    
    .logo-icon {
      margin-right: 0.75rem;
      width: 32px;
      height: 32px;
    }

    .hamburger {
      width: 24px;
      height: 24px;
      cursor: pointer;
      color: var(--primary);
    }
    
    main {
      padding-top: 5rem; /* Space for fixed header */
      min-height: calc(100vh - 5rem);
      max-width: 600px;
      margin: 0 auto;
      padding: 6rem 1rem 3rem;
    }

    .questionnaire-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .questionnaire-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .questionnaire-header p {
      font-size: 1rem;
      color: var(--gray-500);
      margin-bottom: 1.5rem;
    }

    .progress-bar {
      width: 100%;
      height: 0.5rem;
      background-color: var(--gray-200);
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background-color: var(--primary);
      width: 40%; /* Adjust based on step */
    }

    .step-indicator {
      text-align: right;
      font-size: 0.875rem;
      color: var(--gray-500);
    }

    .step-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.75rem;
    }

    .step-subtitle {
      font-size: 0.875rem;
      color: var(--gray-500);
      margin-bottom: 1.5rem;
    }

    .selection-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    @media (min-width: 540px) {
      .selection-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .selection-card {
      border: 1px solid var(--gray-300);
      border-radius: 0.375rem;
      padding: 1rem;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .selection-card:hover {
      border-color: var(--primary-light);
      background-color: var(--gray-100);
    }

    .selection-card.selected {
      border-color: var(--primary);
      background-color: rgba(40, 58, 48, 0.05);
    }

    .selection-card-icon {
      width: 2rem;
      height: 2rem;
      margin-right: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-500);
    }

    .selection-card.selected .selection-card-icon {
      color: var(--primary);
    }

    .selection-card-content h3 {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-900);
      margin-bottom: 0.25rem;
    }

    .selection-card-content p {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .text-center {
      text-align: center;
    }

    .checkbox-indicator {
      display: inline-block;
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid var(--gray-300);
      border-radius: 0.25rem;
      position: relative;
    }

    .selection-card.selected .checkbox-indicator {
      border-color: var(--primary);
      background-color: var(--primary);
    }

    .selection-card.selected .checkbox-indicator::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -60%) rotate(45deg);
      width: 0.35rem;
      height: 0.7rem;
      border-bottom: 2px solid white;
      border-right: 2px solid white;
    }

    .button-group {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
    }

    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      text-decoration: none;
      border-radius: 0.375rem;
      transition: all 0.2s;
      cursor: pointer;
      font-size: 0.875rem;
      border: none;
    }
    
    .btn-secondary {
      background-color: var(--white);
      color: var(--gray-700);
      border: 1px solid var(--gray-300);
    }
    
    .btn-secondary:hover {
      background-color: var(--gray-100);
    }
    
    .btn-primary {
      background-color: var(--primary);
      color: var(--white);
      display: flex;
      align-items: center;
    }
    
    .btn-primary:hover {
      background-color: var(--primary-dark);
    }

    .btn-primary svg {
      margin-left: 0.5rem;
    }

    .skip-link {
      text-align: center;
      margin-top: 1.5rem;
    }

    .skip-link a {
      color: var(--gray-500);
      font-size: 0.875rem;
      text-decoration: none;
    }

    .skip-link a:hover {
      color: var(--primary);
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="navbar">
        <a href="/" class="logo">
          <svg class="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="26" height="26" rx="4" fill="#283a30" />
            <path d="M16 7L7 14V25H25V14L16 7Z" stroke="#84a98c" stroke-width="2" fill="none" />
            <rect x="12" y="17" width="2" height="8" fill="#84a98c" />
            <rect x="16" y="15" width="2" height="10" fill="#84a98c" />
            <rect x="20" y="19" width="2" height="6" fill="#84a98c" />
          </svg>
          REALTY.AI
        </a>
        <div class="hamburger">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>
      </div>
    </div>
  </header>

  <main>
    <div class="questionnaire-header">
      <h1>Tell us about you — we'll recommend the right solution.</h1>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <div class="step-indicator">Step 2 of 5</div>
    </div>

    <div class="step-content">
      <h2 class="step-title">Tell us about your situation</h2>
      <p class="step-subtitle">Select all that apply to you</p>

      <div class="selection-grid">
        <div class="selection-card" onclick="toggleSelection(this)">
          <div class="selection-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </div>
          <div class="selection-card-content">
            <h3>I'm flexible on when I move</h3>
          </div>
          <div class="checkbox-indicator"></div>
        </div>

        <div class="selection-card" onclick="toggleSelection(this)">
          <div class="selection-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div class="selection-card-content">
            <h3>I have a job (received W-2)</h3>
          </div>
          <div class="checkbox-indicator"></div>
        </div>

        <div class="selection-card" onclick="toggleSelection(this)">
          <div class="selection-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="selection-card-content">
            <h3>I live alone</h3>
          </div>
          <div class="checkbox-indicator"></div>
        </div>

        <div class="selection-card selected" onclick="toggleSelection(this)">
          <div class="selection-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="selection-card-content">
            <h3>I own a home</h3>
          </div>
          <div class="checkbox-indicator"></div>
        </div>

        <div class="selection-card selected" onclick="toggleSelection(this)">
          <div class="selection-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="selection-card-content">
            <h3>I have children or dependents</h3>
          </div>
          <div class="checkbox-indicator"></div>
        </div>

        <div class="selection-card" onclick="toggleSelection(this)">
          <div class="selection-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div class="selection-card-content">
            <h3>Expecting a change in major life event</h3>
          </div>
          <div class="checkbox-indicator"></div>
        </div>

        <div class="selection-card" onclick="toggleSelection(this)">
          <div class="selection-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="selection-card-content">
            <h3>I'm flexible on downpayment</h3>
          </div>
          <div class="checkbox-indicator"></div>
        </div>

        <div class="selection-card" onclick="toggleSelection(this)">
          <div class="selection-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="selection-card-content">
            <h3>I sold stock or own rental property</h3>
          </div>
          <div class="checkbox-indicator"></div>
        </div>
      </div>

      <div class="button-group">
        <a href="/" class="btn btn-secondary">Go Back</a>
        <a href="/buyer-flow-step3" class="btn btn-primary">
          Continue
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>

      <div class="skip-link">
        <a href="/pricing">Skip and continue to all properties</a>
      </div>
    </div>
  </main>

  <script>
    function toggleSelection(element) {
      element.classList.toggle('selected');
    }
  </script>
</body>
</html>
  `;
  res.send(buyerHtml);
});

// For the pricing page
app.get('/pricing', (req, res) => {
  const pricingHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Choose Your Plan | Realty.AI</title>
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
    
    header {
      background-color: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
    
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      display: flex;
      align-items: center;
      color: var(--primary);
      font-weight: 700;
      font-size: 1.5rem;
      text-decoration: none;
    }
    
    .logo-icon {
      margin-right: 0.75rem;
      width: 32px;
      height: 32px;
    }

    .hamburger {
      width: 24px;
      height: 24px;
      cursor: pointer;
      color: var(--primary);
    }
    
    main {
      padding-top: 5rem; /* Space for fixed header */
      min-height: calc(100vh - 5rem);
      max-width: 1200px;
      margin: 0 auto;
      padding: 6rem 1rem 3rem;
    }

    .pricing-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .pricing-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1rem;
    }

    .pricing-header p {
      font-size: 1.1rem;
      color: var(--gray-500);
      max-width: 600px;
      margin: 0 auto;
    }

    .pricing-tabs {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2.5rem;
      background-color: var(--gray-200);
      padding: 0.25rem;
      border-radius: 2rem;
      width: fit-content;
      margin-left: auto;
      margin-right: auto;
    }

    .pricing-tab {
      padding: 0.5rem 1.5rem;
      border-radius: 1.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pricing-tab.active {
      background-color: var(--primary);
      color: white;
    }

    .pricing-cards {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .pricing-cards {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .pricing-card {
      background-color: var(--white);
      border-radius: 0.75rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .pricing-card-header {
      padding: 1.5rem;
      text-align: center;
      background-color: var(--primary);
      color: white;
    }

    .pricing-card-free .pricing-card-header {
      background-color: var(--primary);
    }

    .pricing-card-basic .pricing-card-header {
      background-color: var(--primary);
    }

    .pricing-card-premium .pricing-card-header {
      background-color: var(--primary);
    }

    .pricing-card-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .pricing-price {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .pricing-card-content {
      padding: 1.5rem;
      background-color: #f8f8f2;
    }

    .pricing-feature-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 1rem;
    }

    .pricing-subtitle {
      font-size: 0.875rem;
      color: var(--gray-500);
      margin-bottom: 1.5rem;
    }

    .feature-list {
      list-style: none;
      margin-bottom: 2rem;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .feature-icon {
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      margin-right: 0.75rem;
      color: var(--primary);
    }

    .feature-text {
      color: var(--gray-700);
      line-height: 1.4;
    }

    .pricing-btn {
      display: block;
      width: 100%;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      text-decoration: none;
      border-radius: 0.375rem;
      transition: all 0.2s;
      cursor: pointer;
      font-size: 0.875rem;
      border: none;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .pricing-btn-primary {
      background-color: var(--primary);
      color: white;
    }

    .pricing-btn-primary:hover {
      background-color: var(--primary-dark);
    }

    .pricing-btn-outline {
      background-color: transparent;
      color: var(--primary);
      border: 1px solid var(--primary);
    }

    .pricing-btn-outline:hover {
      background-color: rgba(40, 58, 48, 0.05);
    }

    .button-group {
      display: flex;
      justify-content: center;
      margin-top: 3rem;
    }

    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
      text-decoration: none;
      border-radius: 0.375rem;
      transition: all 0.2s;
      cursor: pointer;
      font-size: 0.875rem;
      border: none;
      margin: 0 0.5rem;
    }
    
    .btn-secondary {
      background-color: var(--white);
      color: var(--gray-700);
      border: 1px solid var(--gray-300);
    }
    
    .btn-secondary:hover {
      background-color: var(--gray-100);
    }
    
    .btn-primary {
      background-color: var(--primary);
      color: var(--white);
      display: flex;
      align-items: center;
    }
    
    .btn-primary:hover {
      background-color: var(--primary-dark);
    }

    .btn-primary svg {
      margin-left: 0.5rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <div class="navbar">
        <a href="/" class="logo">
          <svg class="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="26" height="26" rx="4" fill="#283a30" />
            <path d="M16 7L7 14V25H25V14L16 7Z" stroke="#84a98c" stroke-width="2" fill="none" />
            <rect x="12" y="17" width="2" height="8" fill="#84a98c" />
            <rect x="16" y="15" width="2" height="10" fill="#84a98c" />
            <rect x="20" y="19" width="2" height="6" fill="#84a98c" />
          </svg>
          REALTY.AI
        </a>
        <div class="hamburger">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>
      </div>
    </div>
  </header>

  <main>
    <div class="pricing-header">
      <h1>Choose Your Plan</h1>
      <p>Select the perfect package for your real estate needs with transparent pricing and no hidden fees.</p>

      <div class="pricing-tabs">
        <div class="pricing-tab active">Buyers</div>
        <div class="pricing-tab">Sellers</div>
        <div class="pricing-tab">Renters</div>
      </div>
    </div>

    <div class="pricing-cards">
      <div class="pricing-card pricing-card-free">
        <div class="pricing-card-header">
          <h2 class="pricing-card-title">FREE</h2>
        </div>
        <div class="pricing-card-content">
          <h3 class="pricing-feature-title">Find Your Dream Property (Free Discovery)</h3>
          
          <ul class="feature-list">
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Browse all available listings in your area</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Save your favorite properties and searches</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Access basic search filters (location, price, property type)</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Connect with local real estate professionals</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Receive basic customer support</span>
            </li>
          </ul>

          <a href="/properties" class="pricing-btn pricing-btn-primary">GET IT NOW</a>
        </div>
      </div>

      <div class="pricing-card pricing-card-basic">
        <div class="pricing-card-header">
          <h2 class="pricing-card-title">BASIC</h2>
          <div class="pricing-price">As low as $1,500</div>
        </div>
        <div class="pricing-card-content">
          <h3 class="pricing-feature-title">Enhance Your Property Search</h3>
          <p class="pricing-subtitle">All "Free" features, plus:</p>
          
          <ul class="feature-list">
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Advanced search filters (size, features, amenities, etc.)</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Listing activity alerts (new listings, price changes for saved properties)</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Save and organize multiple property lists</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Access neighborhood insights and data</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Priority email support</span>
            </li>
          </ul>

          <a href="/properties" class="pricing-btn pricing-btn-outline">GET IT NOW</a>
        </div>
      </div>

      <div class="pricing-card pricing-card-premium">
        <div class="pricing-card-header">
          <h2 class="pricing-card-title">PREMIUM</h2>
          <div class="pricing-price">As low as $3,500</div>
        </div>
        <div class="pricing-card-content">
          <h3 class="pricing-feature-title">Your Dedicated Buying Advantage</h3>
          <p class="pricing-subtitle">All "Basic" features, plus:</p>
          
          <ul class="feature-list">
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Personalized property recommendations based on your criteria</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Priority access to new listings before they go public (where available)</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">In-depth market analysis reports for your target areas</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Connect with verified buyer specialist agents</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Priority phone and email support</span>
            </li>
            <li class="feature-item">
              <svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span class="feature-text">Guidance on making competitive offers</span>
            </li>
          </ul>

          <a href="/properties" class="pricing-btn pricing-btn-outline">GET IT NOW</a>
        </div>
      </div>
    </div>

    <div class="button-group">
      <a href="/buyer-flow" class="btn btn-secondary">Go Back</a>
      <a href="/properties" class="btn btn-primary">
        Continue
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </a>
    </div>
  </main>

  <script>
    // Simple tab functionality
    document.querySelectorAll('.pricing-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.pricing-tab').forEach(t => {
          t.classList.remove('active');
        });
        tab.classList.add('active');
      });
    });
  </script>
</body>
</html>
  `;
  res.send(pricingHtml);
});

// Add more routes for other pages as needed

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});