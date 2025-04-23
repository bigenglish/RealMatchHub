import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Welcome = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="text-olive-600">
              <svg width="48" height="48" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 text-transparent bg-clip-text">
            Welcome to Realty.AI
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Your intelligent real estate platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Access your personalized real estate experience with intelligent AI-powered tools, property recommendations, and service provider matching.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg py-6">
              <Link href="/auth/login">
                Sign In
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 text-lg py-6">
              <Link href="/auth/register">
                Create Account
              </Link>
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="text-center text-sm text-gray-500 pt-2 pb-6">
          <p className="w-full">
            By continuing, you agree to our <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Welcome;