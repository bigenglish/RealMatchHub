import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "../../lib/firebase";
import { useToast } from "@/hooks/use-toast";

const ForgotPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const { success, error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      if (success) {
        setResetSent(true);
        toast({
          title: "Reset Link Sent",
          description: "Check your email for the password reset link",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending the reset link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    // This would typically use a different method for OTP
    // For now, we'll use the same reset password mechanism
    await handleSendResetLink({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-semibold text-gray-800">Forget Password?</h2>
          
          {resetSent ? (
            <p className="text-gray-600">
              We've sent a password reset link to your email. Please check your inbox and follow the instructions.
            </p>
          ) : (
            <p className="text-gray-600">
              Enter your email address below and we'll send you instructions to reset your password.
            </p>
          )}
        </div>
        
        <form onSubmit={handleSendResetLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="sr-only">Email</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Your e-mail"
                className="pl-10 py-6 bg-gray-100 border-gray-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Send OTP Button */}
          <Button
            type="button"
            variant="ghost"
            className="w-full py-6 text-olive-600 hover:bg-olive-50 hover:text-olive-700 rounded-md flex items-center justify-center"
            onClick={handleSendOtp}
            disabled={loading || !email}
          >
            Send Otp
          </Button>
          
          {/* Send Reset Link Button */}
          <Button
            type="submit"
            className="w-full py-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center justify-center"
            disabled={loading || !email}
          >
            Send password reset link
          </Button>
          
          <div className="text-center mt-4">
            <Link href="/auth/login">
              <a className="text-olive-600 font-medium hover:underline">
                Back to login
              </a>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;