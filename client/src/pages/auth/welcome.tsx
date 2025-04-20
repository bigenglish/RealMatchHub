import React from "react";
import { Link } from "wouter";
import { Mail } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 space-y-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="text-center">
            <div className="flex justify-center">
              <img 
                src="/logo.svg" 
                alt="Realty.AI" 
                className="h-16 w-auto mb-2" 
              />
            </div>
            <h1 className="text-2xl font-medium text-gray-800 tracking-wide">REALTY.AI</h1>
          </div>
        </div>
        
        {/* Welcome Text */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-semibold text-gray-800">Ready to Explore?</h2>
          <p className="text-gray-600">
            Join Realty.AI and unlock the future of real estate. Offering
            personalized, time & cost saving solutions, ensuring your data is
            secure in one place, allowing you to focus on what matters most -
            finding or managing your perfect home.
          </p>
        </div>
        
        {/* Email Button */}
        <Button
          className="w-full py-6 bg-olive-600 hover:bg-olive-700 text-white rounded-md flex items-center justify-center"
          asChild
        >
          <Link href="/auth/login">
            <span className="flex items-center">
              Continue with Email <Mail className="ml-2 h-5 w-5" />
            </span>
          </Link>
        </Button>
        
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or login with</span>
          </div>
        </div>
        
        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="py-5 border-gray-300 hover:bg-gray-50"
            onClick={() => {/* Handle Google login */}}
          >
            <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
            <span>Google</span>
          </Button>
          
          <Button
            variant="outline"
            className="py-5 border-gray-300 hover:bg-gray-50"
            onClick={() => {/* Handle Facebook login */}}
          >
            <FaFacebook className="h-5 w-5 text-blue-600 mr-2" />
            <span>Facebook</span>
          </Button>
        </div>
        
        {/* Register Link */}
        <div className="text-center text-gray-600 text-sm">
          Don't have an account?{" "}
          <Link href="/auth/register">
            <a className="text-olive-600 font-medium hover:underline">Register</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;