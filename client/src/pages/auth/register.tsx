import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { FaGoogle, FaFacebook, FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createAccount, signInWithGoogle, signInWithFacebook } from "../../lib/firebase";
import { useToast } from "@/hooks/use-toast";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "vendor", label: "Vendor" },
  { value: "admin", label: "Admin" },
];

const RegisterPage: React.FC = () => {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (!agreeToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the Terms & Conditions",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      const { user, error } = await createAccount(email, password);
      
      if (error) {
        toast({
          title: "Registration Failed",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      if (user) {
        // Save user role preference
        localStorage.setItem("userRole", userRole);
        
        // Here you would typically also save the user's full name to the database
        
        toast({
          title: "Registration Successful",
          description: "Welcome to Realty.AI!",
        });
        
        // Redirect to home page
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const { user, error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: "Google Sign Up Failed",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      if (user) {
        // Save user role preference
        localStorage.setItem("userRole", userRole);
        
        toast({
          title: "Sign Up Successful",
          description: "Welcome to Realty.AI!",
        });
        
        // Redirect to home page
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Google Sign Up Failed",
        description: error.message || "An error occurred during Google sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    try {
      setLoading(true);
      const { user, error } = await signInWithFacebook();
      
      if (error) {
        toast({
          title: "Facebook Sign Up Failed",
          description: error,
          variant: "destructive",
        });
        return;
      }
      
      if (user) {
        // Save user role preference
        localStorage.setItem("userRole", userRole);
        
        toast({
          title: "Sign Up Successful",
          description: "Welcome to Realty.AI!",
        });
        
        // Redirect to home page
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Facebook Sign Up Failed",
        description: error.message || "An error occurred during Facebook sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-semibold text-gray-800">Create your account?</h2>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="sr-only">Full Name</Label>
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <Input
                id="fullName"
                type="text"
                placeholder="Full Name"
                className="pl-10 py-6 bg-gray-100 border-gray-200"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Email Field */}
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
          
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="sr-only">Password</Label>
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                className="pl-10 py-6 bg-gray-100 border-gray-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="sr-only">Confirm Password</Label>
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
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="pl-10 py-6 bg-gray-100 border-gray-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          {/* Terms & Conditions */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              required
            />
            <Label htmlFor="terms" className="text-sm text-gray-600">
              I agree with <a href="#" className="text-olive-600">Terms & Conditions</a>
            </Label>
          </div>
          
          <Button
            type="submit"
            className="w-full py-6 bg-olive-600 hover:bg-olive-700 text-white rounded-md flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register →"}
          </Button>
        </form>
        
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
            type="button"
            variant="outline"
            className="py-5 border-gray-300 hover:bg-gray-50"
            onClick={handleGoogleSignUp}
            disabled={loading}
          >
            <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
            <span>Google</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="py-5 border-gray-300 hover:bg-gray-50"
            onClick={handleFacebookSignUp}
            disabled={loading}
          >
            <FaFacebook className="h-5 w-5 text-blue-600 mr-2" />
            <span>Facebook</span>
          </Button>
        </div>
        
        {/* Role Selection */}
        <div className="relative mx-auto w-40">
          <Button
            type="button"
            variant="outline"
            className="w-full py-2 px-4 text-sm border-olive-600 text-olive-600 hover:bg-olive-50"
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
          >
            {ROLE_OPTIONS.find(role => role.value === userRole)?.label || "User"} <FaChevronDown className="ml-1 h-3 w-3" />
          </Button>
          
          {isRoleDropdownOpen && (
            <div className="absolute left-0 mt-1 py-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setUserRole(role.value);
                    setIsRoleDropdownOpen(false);
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Login Link */}
        <div className="text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login">
            <a className="text-olive-600 font-medium hover:underline">Sign in</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;