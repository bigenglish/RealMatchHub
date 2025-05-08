import * as React from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { FcGoogle } from 'react-icons/fc';
import { SiFacebook } from 'react-icons/si';
import { useAuth } from '@/contexts/AuthContext';
import { UserRoleType, UserSubroleType } from '@/lib/firebase';

// Form validation schema
const registerSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string(),
  role: z.enum(['user', 'vendor', 'admin'], { message: 'Please select a role' }),
  subrole: z.string().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();

  // State to track which subroles to show based on selected role
  const [selectedRole, setSelectedRole] = useState<UserRoleType>('user');
  
  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      subrole: undefined,
    },
  });

  // Watch for role changes to update the subrole options
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'role' && value.role) {
        setSelectedRole(value.role as UserRoleType);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Handle form submission
  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    
    console.log('Form submission values:', values);
    
    try {
      // Show loading toast
      toast({
        title: 'Creating your account...',
        description: 'Please wait while we set up your account.',
      });
      
      const result = await register(
        values.fullName,
        values.email, 
        values.password,
        values.role as UserRoleType,
        values.subrole as UserSubroleType | undefined
      );
      
      console.log('Registration result:', result);
      
      if (result.success) {
        toast({
          title: 'Welcome to Realty.AI!',
          description: 'Your account has been created successfully.',
        });
        
        // Short delay before redirect to show success message
        setTimeout(() => {
          setLocation('/'); // Navigate to home page
        }, 1000);
      } else {
        console.error('Registration failed:', result.error);
        toast({
          title: 'Registration Failed',
          description: result.error || 'Failed to create account. Please try again.',
          variant: 'destructive',
        });
        
        // Add error message to the bottom of the form
        const errorElement = document.createElement('div');
        errorElement.className = 'mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center';
        errorElement.textContent = 'Registration failed: ' + (result.error || 'Unknown error');
        
        const form = document.querySelector('form');
        if (form) {
          const existingError = form.querySelector('.bg-red-100');
          if (existingError) {
            form.removeChild(existingError);
          }
          form.appendChild(errorElement);
        }
      }
    } catch (error: any) {
      console.error('Unexpected error during registration:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      const { success, error } = provider === 'google' 
        ? await loginWithGoogle() 
        : await loginWithFacebook();
      
      if (success) {
        toast({
          title: 'Welcome to Realty.AI',
          description: 'You have successfully signed in with ' + provider,
        });
        setLocation('/'); // Navigate to home page
      } else {
        toast({
          title: 'Sign In Failed',
          description: error || `Failed to sign in with ${provider}. Please try again.`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 text-transparent bg-clip-text">
            Create your Realty.AI Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign up to get started with our intelligent real estate platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Registration Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Smith" 
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="your.email@example.com" 
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">
                      Password must be at least 6 characters and include an uppercase letter and a number.
                    </p>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Account Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="user" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            I'm looking to buy or sell property
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="vendor" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            I'm a service provider
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
          
          {/* Social Login Options */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="w-full border-gray-200 flex items-center justify-center gap-2"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                <FcGoogle className="h-5 w-5" />
                <span>Google</span>
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-200 flex items-center justify-center gap-2 text-blue-600"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
              >
                <SiFacebook className="h-5 w-5 text-blue-600" />
                <span>Facebook</span>
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 items-center pt-2 pb-6">
          <div className="text-sm text-gray-600 text-center">
            Already have an account?{' '}
            <Link href="/auth/login">
              <span className="text-blue-600 hover:underline cursor-pointer font-semibold">
                Sign in
              </span>
            </Link>
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            By signing up, you agree to our <Link href="/terms"><span className="underline">Terms of Service</span></Link> and <Link href="/privacy"><span className="underline">Privacy Policy</span></Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;