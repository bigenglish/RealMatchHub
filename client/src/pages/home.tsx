import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, Search, Star, Calendar, MapPin, Check, Play, FileVideo, 
  Users, Building2 as Building, Briefcase, X,
  ArrowLeft, Signal as SignalHigh, Wifi, Battery, Home, MessageSquare, User,
  Facebook, Twitter, Instagram, Linkedin, Mail, Phone,
  DollarSign, ArrowUpDown, ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import AIChatbot from "@/components/ai-chatbot";
import CostComparison from "@/components/cost-comparison";
import { colors } from "@/lib/colors";

export default function HomePage() {
  const [searchType, setSearchType] = useState("Buy");
  const [userType, setUserType] = useState("Buyers");
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoAttempts, setVideoAttempts] = useState(0);

  // Video player functionality
  const openVideoDialog = (videoSrc: string) => {
    setCurrentVideo(videoSrc);
    setVideoDialogOpen(true);
  };

  // State to track video mute status - default to true initially for autoplay
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // Video initialization for all videos
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeVideo = () => {
      const previewVideo = document.getElementById('previewVideo') as HTMLVideoElement | null;
      const heroVideo = document.getElementById('heroVideo') as HTMLVideoElement | null;

      const setupVideo = (video: HTMLVideoElement | null, src: string, initiallyMuted = true) => {
        if (!video) {
          console.error("Video element not found!");
          return;
        }

        video.muted = initiallyMuted;
        video.playsInline = true;
        video.loop = true;

        if (src) {
          video.src = src;
          video.load();
        }

        const attemptPlay = () => {
          video.play()
            .then(() => {
              console.log(`Video playing successfully`);
            })
            .catch(error => {
              console.error(`Failed to play video: ${error.message}`);
              // Retry after a short delay, but limit attempts
              if (videoAttempts < 3) {
                setTimeout(attemptPlay, 1000);
                setVideoAttempts(videoAttempts + 1);
              } else {
                console.error("Max retry attempts reached. Video failed to play.");
              }
            });
        };

        attemptPlay();
      };

      if (previewVideo) {
        setupVideo(previewVideo, '/hero-video.mp4');
      }

      if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.loop = true;
        heroVideo.playsInline = true;
        heroVideo.src = '/hero-video.mp4';
        heroVideo.load();

        //This will only play after the user interacts with the page
        const handleUserInteraction = () => {
          if (heroVideo) {
            heroVideo.play().catch(e => console.error("Hero video play failed:", e));
          }
        };
        document.addEventListener('click', handleUserInteraction, { once: true });
        document.addEventListener('touchstart', handleUserInteraction, { once: true });

        return () => {
          document.removeEventListener('click', handleUserInteraction);
          document.removeEventListener('touchstart', handleUserInteraction);
        };
      }
    };

    const initTimer = setTimeout(initializeVideo, 500);

    return () => clearTimeout(initTimer);
  }, [videoAttempts]);

  useEffect(() => {
    if (videoRef.current && containerRef.current) {
      videoRef.current.play().catch(err => {
        console.error("Video autoplay prevented:", err);
      });
    }
  }, [containerRef, videoRef]);

  return (
    <div>
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center text-white">
        {/* Static Background */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-olive-900 to-olive-700 z-0"></div>

        {/* Hero Content - Restructured with heading above video */}
        <div className="container mx-auto px-4 relative z-20 pt-16 flex flex-col">
          {/* Title and tagline now above the video */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold">
              Realty.AI: <span>The Future of Real Estate is Here.</span>
            </h1>
            <p className="text-xl mt-4 max-w-2xl mx-auto">
              Save time and skip the fees with AI-Powered Insights, Vetted-Expert Guidance.
            </p>
          </div>

          {/* Video now takes full width - made to match search box width */}
          <div className="w-full max-w-4xl mx-auto">
            <div className="relative rounded-xl overflow-hidden shadow-xl w-full min-h-[500px]" ref={containerRef}>
              {/* Direct Video Element - Now even wider and taller */}
              <div className="relative w-full h-full" style={{ minHeight: "500px" }}>
                <video
                  id="heroVideo"
                  className="absolute inset-0 w-full h-full object-cover"
                  ref={videoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster="/hero-video-poster.jpg"
                >
                  {/* Multiple sources for browser compatibility */}
                  <source src="/hero-video.mp4" type="video/mp4" />
                  <p className="text-center text-white">
                    Your browser doesn't support HTML5 video
                  </p>
                </video>

                {/* Sound control button - Made much larger and more visible */}
                <button 
                  className="absolute bottom-6 right-6 bg-black/60 hover:bg-black/80 text-white rounded-full p-4 z-10 transition-all shadow-lg"
                  onClick={() => {
                    const video = document.getElementById('heroVideo') as HTMLVideoElement | null;
                    if (video) {
                      // Toggle mute state
                      const newMutedState = !video.muted;
                      video.muted = newMutedState;
                      setIsVideoMuted(newMutedState);
                      console.log("Video mute toggled to:", newMutedState);
                    }
                  }}
                  aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
                >
                  {isVideoMuted ? (
                    // Muted icon (volume off)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    // Unmuted icon (volume on)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7.97 7.97 0 015.657 2.343M15.54 15.54A9.97 9.97 0 0012 18a9.97 9.97 0 01-3.54-2.46M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>

                {/* Lighter overlay for better video visibility */}
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            </div>
          </div>

          {/* Call to action button below video */}
          <div className="mt-8 text-center">
            <Link href="/auth/welcome">
              <Button size="lg" className="bg-olive-600 hover:bg-olive-700 text-white border-none px-8 py-6 text-lg">
                GET STARTED FREE
              </Button>
            </Link>
          </div>
        </div>

        {/* Property Search Bar */}
        <div className="absolute bottom-8 left-0 right-0 mx-auto container z-20">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl mx-auto overflow-hidden">
            <div className="flex border-b">
              <button 
                className={`flex-1 py-3 px-6 text-center font-medium ${searchType === 'Rent' ? 'border-b-2 border-olive-600 text-olive-600' : 'text-gray-500'}`}
                onClick={() => setSearchType('Rent')}
              >
                Rent
              </button>
              <button 
                className={`flex-1 py-3 px-6 text-center font-medium ${searchType === 'Buy' ? 'border-b-2 border-olive-600 text-olive-600' : 'text-gray-500'}`}
                onClick={() => setSearchType('Buy')}
              >
                Buy
              </button>
              <button 
                className={`flex-1 py-3 px-6 text-center font-medium ${searchType === 'Sell' ? 'border-b-2 border-olive-600 text-olive-600' : 'text-gray-500'}`}
                onClick={() => setSearchType('Sell')}
              >
                Sell
              </button>
            </div>

            <div className="flex flex-col md:flex-row p-4 gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Where</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={searchType === 'Sell' ? "Enter your property address" : "City, State or ZIP"}
                    className="pl-10 w-full text-gray-900"
                    onChange={async (e) => {
                      const value = e.target.value;
                      if (value.length > 2) {
                        try {
                          const response = await fetch(`/api/places/autocomplete?query=${encodeURIComponent(value)}&types=${searchType === 'Sell' ? 'address' : ''}`);
                          if (response.ok) {
                            const suggestions = await response.json();
                            const datalist = document.getElementById('location-suggestions');
                            if (datalist) {
                              datalist.innerHTML = suggestions.map((s: string) => 
                                `<option value="${s}">${s}</option>`
                              ).join('');
                            }
                          }
                        } catch (error) {
                          console.error('Error fetching address suggestions:', error);
                        }
                      }
                    }}
                    list="location-suggestions"
                  />
                  <datalist id="location-suggestions"></datalist>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <Select 
                  defaultValue="house"
                >
                  <SelectTrigger className="w-full text-gray-900">
                    <SelectValue defaultValue="house">House</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>



              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">When</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Select>
                    <SelectTrigger className="pl-10 w-full">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP (ready to move)</SelectItem>
                      <SelectItem value="1-3months">1-3 months</SelectItem>
                      <SelectItem value="3-6months">3-6 months</SelectItem>
                      <SelectItem value="6-12months">6-12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-end">
                <Link href={searchType === 'Buy' ? "/buyer-flow" : searchType === 'Sell' ? "/seller-flow/intent" : "/properties"}>
                  <Button className="bg-olive-600 hover:bg-olive-700 w-full md:w-auto whitespace-nowrap">
                    {searchType === 'Buy' ? 'Start Buying' : searchType === 'Sell' ? 'Start Selling' : 'Browse Properties'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By / Reviews Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Trusted By</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-orange-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "I paid no agent commissions when selling my home and saved $24,000 with Realty.AI."
              </p>
              <div className="flex items-center">
                <div>
                  <div className="font-medium">John D., Los Angeles</div>
                  <div className="text-sm text-gray-500">Home Seller</div>
                  <div className="text-sm text-gray-500">Feb 4, 2025</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-orange-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "First time buying a home and Realty.AI was incredibly helpful. They walked me through the paperwork and connected me to a great lending option and two local Experts who helped me through every step of the process, making my experience stress-free."
              </p>
              <div className="flex items-center">
                <div>
                  <div className="font-medium">Sarah J., First-Time Homebuyer</div>
                  <div className="text-sm text-gray-500">Feb 1, 2025</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-orange-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "The Realty.AI platform simplified the entire paperwork process. Their AI assistant explained everything clearly, and I always had access to expert support when I needed it."
              </p>
              <div className="flex items-center">
                <div>
                  <div className="font-medium">David L., Homeowner</div>
                  <div className="text-sm text-gray-500">Jan 30, 2025</div>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-orange-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "When I bought my first condo I just wanted to make sure I knew about the HOA and all other fees I could expect to pay. Realty.AI allowed me to keep more of my money and put what would have been commission payments towards my down payment."
              </p>
              <div className="flex items-center">
                <div>
                  <div className="font-medium">Shirley, Homeowner</div>
                  <div className="text-sm text-gray-500">Jan 26, 2025</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center mt-8 text-gray-500">
            <div className="flex items-center mr-4">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-orange-400 fill-current" />
              ))}
            </div>
            <span className="mr-4 font-medium">Ratings 5 Star:</span>
            <span className="mr-4">55+ Reviews</span>
            <div className="text-gray-400">Powered By google</div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-6">Choose Your Plan</h2>
          <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Select the perfect package for your real estate needs with transparent pricing and no hidden fees.
          </p>

          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              {['Buyers', 'Sellers', 'Renters'].map((type) => (
                <button
                  key={type}
                  className={`px-8 py-3 rounded-full font-medium ${
                    userType === type 
                      ? 'bg-olive-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setUserType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {userType === 'Buyers' ? (
              <>
                {/* FREE Tier - Buyers */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white flex flex-col h-full">
                  <div className="bg-olive-600 p-4 text-white text-center">
                    <h3 className="text-3xl font-bold">FREE</h3>
                  </div>
                  <div className="p-6 bg-amber-50 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">Find Your Dream Property (Free Discovery)</h4>
                    </div>
                    <ul className="space-y-3 flex-1">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Browse all available listings in your area</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Save your favorite properties and searches</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Access basic search filters (location, price, property type)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Connect with local real estate professionals</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Receive basic customer support</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* BASIC Tier - Buyers */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white flex flex-col h-full">
                  <div className="bg-olive-600 p-4 text-white text-center">
                    <h3 className="text-3xl font-bold">BASIC</h3>
                    <p className="text-white/90">As low as $1,500</p>
                  </div>
                  <div className="p-6 bg-amber-50 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">Enhance Your Property Search</h4>
                      <p className="text-sm text-gray-600">All "Free" features, plus:</p>
                    </div>
                    <ul className="space-y-3 flex-1">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Advanced search filters (size, features, amenities, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Listing activity alerts (new listings, price changes for saved properties)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Save and organize multiple property lists</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Access neighborhood insights and data</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Priority email support</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* PREMIUM Tier - Buyers */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white flex flex-col h-full">
                  <div className="bg-olive-600 p-4 text-white text-center">
                    <h3 className="text-3xl font-bold">PREMIUM</h3>
                    <p className="text-white/90">As low as $3,500</p>
                  </div>
                  <div className="p-6 bg-amber-50 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">Your Dedicated Buying Advantage</h4>
                      <p className="text-sm text-gray-600">All "Basic" features, plus:</p>
                    </div>
                    <ul className="space-y-3 flex-1">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Personalized property recommendations based on your criteria</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Priority access to new listings before they go public (where available)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>In-depth market analysis reports for your target areas</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Connect with verified buyer specialist agents</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Priority phone and email support</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Guidance on making competitive offers</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Dedicated buyer concierge service</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Expert offer negotiation and strategy consultation</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Assistance with due diligence checklists and processes</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Closing coordination assistance with 2 Expert reviewers</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            ) : userType === 'Renters' ? (
              <>
                {/* FREE Tier - Renters */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white flex flex-col h-full">
                  <div className="bg-olive-600 p-4 text-white text-center">
                    <h3 className="text-3xl font-bold">FREE</h3>
                  </div>
                  <div className="p-6 bg-amber-50 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">Start Your Rental Search (Free Discovery)</h4>
                    </div>
                    <ul className="space-y-3 flex-1">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Browse all available rental listings in your area</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Save your favorite rental properties and searches</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Access basic search filters (location, price, property type)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Connect with local property managers/landlords</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Receive basic customer support</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* BASIC Tier - Renters */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white flex flex-col h-full">
                  <div className="bg-olive-600 p-4 text-white text-center">
                    <h3 className="text-3xl font-bold">BASIC</h3>
                    <p className="text-white/90">As low as $50</p>
                  </div>
                  <div className="p-6 bg-amber-50 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">Essential Rental Search Tools</h4>
                      <p className="text-sm text-gray-600">All "Free" features, plus:</p>
                    </div>
                    <ul className="space-y-3 flex-1">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Advanced search filters (size, features, pet policies, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Listing activity alerts (new rentals, price changes for saved properties)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Save and organize multiple rental lists</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Access neighborhood guides and information</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Priority email support</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* PREMIUM Tier - Renters */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white flex flex-col h-full">
                  <div className="bg-olive-600 p-4 text-white text-center">
                    <h3 className="text-3xl font-bold">PREMIUM</h3>
                    <p className="text-white/90">As low as $100</p>
                  </div>
                  <div className="p-6 bg-amber-50 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">Your Advantage in the Rental Market</h4>
                      <p className="text-sm text-gray-600">All "Basic" features, plus:</p>
                    </div>
                    <ul className="space-y-3 flex-1">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Personalized rental recommendations based on your criteria</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Priority notifications for new rentals matching your needs</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Detailed neighborhood insights, including commute times and local amenities</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Connect with verified and responsive property managers/landlords</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Priority phone and email support</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Guidance on preparing strong rental applications</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Dedicated rental concierge service</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* FREE Tier - Sellers */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white flex flex-col h-full">
                  <div className="bg-olive-600 p-4 text-white text-center">
                    <h3 className="text-3xl font-bold">FREE</h3>
                  </div>
                  <div className="p-6 bg-amber-50 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">List and manage your property</h4>
                    </div>
                    <ul className="space-y-3 flex-1">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Create and manage property listings</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Upload photos and videos</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Basic search filters</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Connect with local professionals</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Basic customer support</span>
                      </li>
                    </ul>
                    <div className="mt-8">
                      <Button className="w-full bg-olive-600 hover:bg-olive-700">
                        GET IT NOW
                      </Button>
                    </div>
                  </div>
                </div>

                {/* BASIC Tier - Sellers */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white flex flex-col h-full">
                  <div className="bg-olive-600 p-4 text-white text-center">
                    <h3 className="text-3xl font-bold">BASIC</h3>
                    <p className="text-white/90">As low as $2,000</p>
                  </div>
                  <div className="p-6 bg-amber-50 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">All "Free" features, plus:</h4>
                    </div>
                    <ul className="space-y-3 flex-1">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Advanced search filters</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Listing analytics and insights</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Featured property listing</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Customizable property page</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Access to local market reports</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Basic customer support</span>
                      </li>
                    </ul>
                    <div className="mt-8">
                      <Button className="w-full bg-olive-600 hover:bg-olive-700">
                        CHOOSE BASIC
                      </Button>
                    </div>
                  </div>
                </div>

                {/* PREMIUM Tier - Sellers */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white flex flex-col h-full">
                  <div className="bg-olive-600 p-4 text-white text-center">
                    <h3 className="text-3xl font-bold">PREMIUM</h3>
                    <p className="text-white/90">As low as $3,500</p>
                  </div>
                  <div className="p-6 bg-amber-50 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">All "Basic" features, plus:</h4>
                    </div>
                    <ul className="space-y-3 flex-1">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Professional photography and staging consultation</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Highlighted property listing</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Customizable property page with additional media options</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Premium marketing services (social media promotion, email marketing)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Access to in-depth market analysis and reports</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Advanced analytics and insights</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Connect with verified local professionals</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Priority customer support</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Write up Offer & Negotiation</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-olive-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Handle Negotiations for Repairs and Credits</span>
                      </li>
                    </ul>
                    <div className="mt-8">
                      <Button className="w-full bg-olive-600 hover:bg-olive-700">
                        CHOOSE PREMIUM
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Pay Your Way Section */}
      <CostComparison />

      {/* Expert Network Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-5xl font-bold mb-6">Expert Network</h2>
              <div className="mb-8">
                <p className="text-white/80 mb-4">Powered by Realty.AI Experts Marketplace:</p>
                <p className="text-lg mb-6">
                  Unlock 24/7 access to top-tier industry experts across real estate, select from realtors,
                  lenders, contractors, and attorneys armed with unmatched AI expertise for all your buying
                  and selling needs.
                </p>
              </div>

              <div className="mb-8">
                <p className="text-white/80 mb-4">Connect with Realty.AI Team:</p>
                <p className="text-lg mb-6">
                  Submit questions and communicate with agents via email, text, or video chat.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button 
                  className="bg-white text-gray-900 hover:bg-gray-100 py-6 px-8"
                  onClick={() => openVideoDialog("/pay-your-way.mp4")}
                >
                  See How It Works
                </Button>
                <Button className="bg-white text-gray-900 hover:bg-gray-100 py-6 px-8">
                  Start For Free
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2">
              {/* This would typically be an image, but we'll use a placeholder for now */}
              <div className="bg-gradient-to-r from-olive-700 to-olive-800 h-[400px] rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    {/* Icons representing different experts */}
                    <div className="w-16 h-16 bg-white/20 rounded-full mx-2 flex items-center justify-center">
                      <Users className="h-8 w-8" />
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full mx-2 flex items-center justify-center">
                      <Building className="h-8 w-8" />
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full mx-2 flex items-center justify-center">
                      <Briefcase className="h-8 w-8" />
                    </div>
                  </div>
                  <p className="text-xl">Connect with our expert network</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Matching Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-5xl font-bold mb-6">PERSONALIZED MATCHING</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-xl mb-2">Curate Your Dream Home:</h3>
                <p className="text-gray-700">Save photos, listings, and design ideas for inspiration.</p>
              </div>

              <div>
                <h3 className="font-bold text-xl mb-2">Smart Matching:</h3>
                <p className="text-gray-700">Get personalized recommendations based on your unique preferences.</p>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button 
                className="bg-olive-600 hover:bg-olive-700 py-6 px-8"
                onClick={() => openVideoDialog("/pay-your-way.mp4")}
              >
                See How It Works
              </Button>
              <Button className="bg-olive-600 hover:bg-olive-700 py-6 px-8">
                Start For Free
              </Button>
            </div>
          </div>

          {/*Property Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-16">
            {/* User Profile */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
                  alt="User" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-medium">Kevin Junior</p>
            </div>

            {/* Property Cards */}
            {[
              { 
                image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
                title: "Colonial Style Home",
                price: "$1,250,000"
              },
              { 
                image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
                title: "Modern Farmhouse",
                price: "$890,000"
              },
              { 
                image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
                title: "Tudor Revival",
                price: "$1,150,000"
              },
              { 
                image: "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
                title: "Craftsman Style",
                price: "$975,000"
              }
            ].map((property, index) => (
              <div key={index} className="rounded-lg overflow-hidden shadow-md group hover:shadow-xl transition-all duration-300">
                <div className="h-48 bg-realGreen-medium/20 relative overflow-hidden">
                  <img 
                    src={property.image}
                    alt={property.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 bg-neutral-beige text-realGreen-dark font-bold px-3 py-1 rounded-full text-sm">
                    {property.price}
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <p className="text-realGreen-dark font-medium">
                    {property.title}
                  </p>
                  <div className="mt-3">
                    <Button size="sm" className="w-full bg-realGreen-dark text-white hover:bg-realGreen-dark/90">
                      See More
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Explore Featured Listings Section */}
      <section className="py-20 bg-realGreen-light/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start justify-between mb-12">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-bold mb-6 text-realGreen-dark">EXPLORE FEATURED LISTINGS</h2>
              <p className="text-lg text-gray-700 mb-6">
                Discover properties tailored to your preferences in neighborhoods that match your lifestyle.
              </p>
            </div>

            <div className="mt-6 md:mt-0">
              <Button 
                className="bg-realGreen-dark hover:bg-realGreen-dark/90 text-white flex items-center gap-2"
                onClick={() => openVideoDialog("/pay-your-way.mp4")}
              >
                <Play className="h-5 w-5" /> Play Demo
              </Button>
            </div>
          </div>

          {/* Featured Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                title: "Modern Luxury Villa",
                location: "Beverly Hills, CA",
                price: "$4,250,000",
                beds: 5,
                baths: 4,
                sqft: 4200,
                tag: "Premium"
              },
              {
                image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                title: "Waterfront Mansion",
                location: "Miami Beach, FL",
                price: "$6,900,000",
                beds: 6,
                baths: 7,
                sqft: 6500,
                tag: "New"
              },
              {
                image: "https://images.unsplash.com/photo-1600607687939-ce8a6c8a16c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                title: "Classic Craftsman",
                location: "Portland, OR",
                price: "$1,195,000",
                beds: 4,
                baths: 3,
                sqft: 2850,
                tag: "Featured"
              },
              {
                image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                title: "Urban Penthouse",
                location: "New York, NY",
                price: "$3,750,000",
                beds: 3,
                baths: 3.5,
                sqft: 2200,
                tag: "Hot"
              },
              {
                image: "https://images.unsplash.com/photo-1592595896551-12b371d546d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                title: "Mountain Retreat",
                location: "Aspen, CO",
                price: "$2,850,000",
                beds: 4,
                baths: 4,
                sqft: 3600,
                tag: "Exclusive"
              },
              {
                image: "https://images.unsplash.com/photo-1600566753376-12c8ab8e17a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
                title: "Beachfront Cottage",
                location: "Malibu, CA",
                price: "$3,199,000",
                beds: 3,
                baths: 2,
                sqft: 1800,
                tag: "Hot"
              }
            ].map((listing, index) => (
              <div key={index} className="rounded-xl overflow-hidden shadow-lg bg-white group hover:shadow-xl transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-neutral-beige text-realGreen-dark font-bold px-3 py-1 rounded-full text-sm">
                    {listing.tag}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4">
                    <p className="font-bold text-xl">{listing.price}</p>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2 text-realGreen-dark">{listing.title}</h3>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" /> {listing.location}
                  </p>

                  <div className="flex justify-between text-sm text-gray-700 mb-4">
                    <div><span className="font-semibold">{listing.beds}</span> Beds</div>
                    <div><span className="font-semibold">{listing.baths}</span> Baths</div>
                    <div><span className="font-semibold">{listing.sqft.toLocaleString()}</span> sqft</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button className="bg-realGreen-dark hover:bg-realGreen-dark/90 text-white">
                      View Details
                    </Button>
                    <button 
                      className="p-2 rounded-full bg-neutral-beige/20 hover:bg-neutral-beige/40 transition-colors"
                      onClick={() => openVideoDialog("/Informed Decision.mp4")}
                    >
                      <FileVideo className="h-5 w-5 text-realGreen-dark" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button className="bg-realGreen-medium hover:bg-realGreen-medium/90 text-white px-10 py-6 text-lg">
              View All Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Real Estate Success Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="relative rounded-xl overflow-hidden">
            {/* Background image with overlay */}
            <div className="absolute inset-0 bg-black/50">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1773&q=80" 
                alt="Office desk with documents" 
                className="w-full h-full object-cover mix-blend-overlay"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 p-12">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2">
                  <h2 className="text-5xl font-bold mb-10">YOUR STEPS TO REAL ESTATE SUCCESS</h2>

                  <div className="space-y-8">
                    <div>
                      <h3 className="font-bold text-xl mb-2">Review with Confidence:</h3>
                      <p className="text-white/80">Get expert assistance with contracts, invoices, and rebates.</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-2">Stay Up-to-Date:</h3>
                      <p className="text-white/80">Receive insights on regulations and rebates affecting your home and finances.</p>
                    </div>
                  </div>
                </div>

                <div className="lg:w-1/2 flex items-center justify-end mt-8 lg:mt-0">
                  <div className="flex flex-col gap-4">
                    <Button 
                      className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-6 flex items-center gap-2"
                      onClick={() => openVideoDialog("/Personalized Matching.mp4")}
                    >
                      <Play className="h-5 w-5" /> See How It Works
                    </Button>
                    <Button className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-6">
                      Start For Free
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How To Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 pr-4 lg:pr-10">
              {/* User Journey Tabs */}
              <Tabs defaultValue="buying" className="mb-10">
                <TabsList className="flex w-full mb-8">
                  <TabsTrigger value="buying" className="flex-1 py-3 rounded-full">Buying</TabsTrigger>
                  <TabsTrigger value="selling" className="flex-1 py-3 rounded-full">Selling</TabsTrigger>
                  <TabsTrigger value="renting" className="flex-1 py-3 rounded-full">Renting</TabsTrigger>
                </TabsList>

                <div>
                  <h2 className="text-5xl font-bold mb-4">YOUR STEPS TO REAL ESTATE SUCCESS</h2>
                  <h3 className="text-xl mb-10">Step-by-Step Breakdown</h3>
                </div>

                <TabsContent value="buying" className="space-y-8">
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">01</div>
                    <div className="text-2xl font-bold text-olive-600">Search</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">02</div>
                    <div className="text-2xl font-bold text-olive-600">Explore</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">03</div>
                    <div className="text-2xl font-bold text-olive-600">Choose Your Services</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">04</div>
                    <div className="text-2xl font-bold text-olive-600">Manage Your Journey</div>
                  </div>
                </TabsContent>

                <TabsContent value="selling" className="space-y-8">
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">01</div>
                    <div className="text-2xl font-bold text-olive-600">Assess Your Property</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">02</div>
                    <div className="text-2xl font-bold text-olive-600">Get Market Analysis</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">03</div>
                    <div className="text-2xl font-bold text-olive-600">Choose Your Services</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">04</div>
                    <div className="text-2xl font-bold text-olive-600">Manage Your Sale</div>
                  </div>
                </TabsContent>

                <TabsContent value="renting" className="space-y-8">
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">01</div>
                    <div className="text-2xl font-bold text-olive-600">Define Your Needs</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">02</div>
                    <div className="text-2xl font-bold text-olive-600">Browse Rentals</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">03</div>
                    <div className="text-2xl font-bold text-olive-600">Schedule Viewings</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold text-gray-800 mr-8">04</div>
                    <div className="text-2xl font-bold text-olive-600">Apply & Move In</div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:w-1/2 mt-10 lg:mt-0 relative">
              {/* Phone mockup with app interface */}
              <div className="relative">
                <div className="relative mx-auto w-72 h-[500px]">
                  {/* Hand holding phone effect */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12 w-96 h-40 bg-contain bg-bottom bg-no-repeat z-10"
                       style={{ backgroundImage: "url('https://freepngimg.com/thumb/hands/41-hands-png-image.png')" }}>
                  </div>

                  {/* Phone frame */}
                  <div className="absolute inset-0 bg-black rounded-[40px] shadow-lg z-0"></div>

                  {/* Phone screen */}
                  <div className="absolute inset-2 rounded-[36px] overflow-hidden bg-white z-1">
                    {/* App UI mockup */}
                    <div className="h-full flex flex-col bg-gray-50">
                      {/* Status bar */}
                      <div className="h-7 bg-white flex justify-between items-center px-4">
                        <div className="text-xs">9:41</div>
                        <div className="flex items-center space-x-1">
                          <SignalHigh className="h-3 w-3" />
                          <Wifi className="h-3 w-3" />
                          <Battery className="h-3 w-3" />
                        </div>
                      </div>

                      {/* App header */}
                      <div className="h-12 bg-olive-600 flex items-center px-4">
                        <ArrowLeft className="h-5 w-5 text-white" />
                        <div className="ml-4 text-white font-medium">Application (1)</div>
                      </div>

                      {/* App content */}
                      <div className="flex-1 p-4">
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-600">Income</div>
                          <div className="text-sm text-gray-600">Property</div>
                          <div className="text-sm font-medium text-gray-600">Application (1)</div>
                          <div className="text-sm text-gray-400">End in 04/17/2025</div>
                        </div>

                        {/* Progress steps */}
                        <div className="space-y-4 mt-6">
                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-olive-600 flex-shrink-0"></div>
                            <div className="h-1 flex-grow bg-olive-600 mx-2"></div>
                            <div className="text-xs text-gray-400">5 days ago</div>
                          </div>
                          <div className="ml-2 text-sm">Application started</div>

                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-olive-600 flex-shrink-0"></div>
                            <div className="h-1 flex-grow bg-olive-600 mx-2"></div>
                            <div className="text-xs text-gray-400">10 days ago</div>
                          </div>
                          <div className="ml-2 text-sm">Reviewed by Authorities</div>

                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-olive-600 flex-shrink-0"></div>
                            <div className="h-1 flex-grow bg-gray-300 mx-2"></div>
                            <div className="text-xs text-gray-400">In Verification</div>
                          </div>
                          <div className="ml-2 text-sm">ID Verification</div>

                          <div className="flex items-center">
                            <div className="w-5 h-5 rounded-full bg-gray-300 flex-shrink-0"></div>
                            <div className="h-1 flex-grow bg-gray-300 mx-2"></div>
                            <div className="text-xs text-gray-400">Coming soon</div>
                          </div>
                          <div className="ml-2 text-sm">Final Stage</div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-10 space-y-3">
                          <button className="w-full py-2 px-4 bg-olive-600 text-white text-sm rounded">
                            Continue to Next Step
                          </button>
                          <button className="w-full py-2 px-4 border border-olive-600 text-olive-600 text-sm rounded">
                            View Details
                          </button>
                        </div>
                      </div>

                      {/* Bottom navigation */}
                      <div className="h-16 bg-white flex justify-around items-center border-t border-gray-200">
                        <div className="flex flex-col items-center">
                          <Home className="h-5 w-5 text-olive-600" />
                          <span className="text-xs text-olive-600">Home</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Search className="h-5 w-5 text-gray-400" />
                          <span className="text-xs text-gray-400">Search</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <MessageSquare className="h-5 w-5 text-gray-400" />
                          <span className="text-xs text-gray-400">Chat</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="text-xs text-gray-400">Profile</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Green circle behind the phone */}
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-olive-600 rounded-full opacity-30 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot */}
      <AIChatbot />

      {/* Ready to Get Started Section */}
      <section className="py-20 bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-6xl font-bold mb-12 text-gray-800">READY TO GET STARTED?</h2>

          <div className="mb-10">
            <Button className="bg-olive-600 hover:bg-olive-700 text-white px-10 py-6 text-xl rounded-full">
              Create Your Free Account
            </Button>
          </div>

          <p className="text-2xl text-gray-700 max-w-3xl mx-auto">
            Join Reaty.ai and experience a smarter, more efficient way to achieve your real estate goals.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 pt-20 pb-10 border-t">
        <div className="container mx-auto px-4">
          {/* Logo Section */}
          <div className="flex justify-center mb-12">
            <div className="text-center">
              <div className="flex justify-center">
                <img 
                  src="/logo.svg" 
                  alt="Realty.AI Logo" 
                  className="h-20 w-auto"
                  onError={(e) => {
                    // If logo.svg doesn't exist, show text logo instead
                    e.currentTarget.style.display = 'none';
                    document.getElementById('text-logo')?.classList.remove('hidden');
                  }}
                />
                <div id="text-logo" className="hidden text-3xl font-bold text-olive-600">
                  REALTY.AI
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Pages Link</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-600 hover:text-olive-600">Home</Link></li>
                <li><Link href="/properties" className="text-gray-600 hover:text-olive-600">Properties</Link></li>
                <li><Link href="/services" className="text-gray-600 hover:text-olive-600">Services</Link></li>
                <li><Link href="/marketplace" className="text-gray-600 hover:text-olive-600">Marketplace</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/pricing" className="text-gray-600 hover:text-olive-600">Pricing</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-olive-600">About Us</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-olive-600">Blog</Link></li>
                <li><Link href="/faqs" className="text-gray-600 hover:text-olive-600">FAQs</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Follow Us On</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-olive-600 p-2 border rounded-full">
                  f
                </a>
                <a href="#" className="text-gray-600 hover:text-olive-600 p-2 border rounded-full">
                  t
                </a>
                <a href="#" className="text-gray-600 hover:text-olive-600 p-2 border rounded-full">
                  i
                </a>
                <a href="#" className="text-gray-600 hover:text-olive-600 p-2 border rounded-full">
                  in
                </a>
              </div>
              <div className="mt-4">
                <div className="text-gray-600">facebook</div>
                <div className="text-gray-600">twitter</div>
                <div className="text-gray-600">instagram</div>
              </div>
            </div>            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-5 h-5 mr-2 text-gray-600">✉️</span>
                  <a href="mailto:abc@example.com" className="text-gray-600 hover:text-olive-600">
                    abc@example.com
                  </a>
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 mr-2 text-gray-600">📞</span>
                  <a href="tel:+1234567890" className="text-gray-600 hover:text-olive-600">
                    +1 (234) 567-890
                  </a>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 mr-2 text-gray-600 mt-1">📍</span>
                  <span className="text-gray-600">
                    123 Real Estate Ave, <br />
                    New York, NY 10001
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-600 pt-8 border-t border-gray-200">
            <p>&copy; {new Date().getFullYear()} Realty.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}