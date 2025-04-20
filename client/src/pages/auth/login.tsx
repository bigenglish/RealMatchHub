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
import { Separator } from '@/components/ui/separator';
import { FcGoogle } from 'react-icons/fc';
import { SiFacebook } from 'react-icons/si';
import { useAuth } from '@/contexts/AuthContext';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { success, error } = await login(values.email, values.password);
      
      if (success) {
        // Show success notification
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in to Realty.AI',
        });
        setLocation('/'); // Navigate to home page
      } else {
        // Show error notification
        toast({
          title: 'Login Failed',
          description: error || 'Invalid email or password',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      // Show unexpected error notification
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
          description: 'You have successfully logged in with ' + provider,
        });
        setLocation('/'); // Navigate to home page
      } else {
        toast({
          title: 'Login Failed',
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
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Sign in to Realty.AI
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Email/Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  </FormItem>
                )}
              />
              
              <div className="text-right">
                <Link href="/auth/forgot-password">
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
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
            Don't have an account?{' '}
            <Link href="/auth/register">
              <span className="text-blue-600 hover:underline cursor-pointer font-semibold">
                Create one
              </span>
            </Link>
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            By signing in, you agree to our <Link href="/terms"><span className="underline">Terms of Service</span></Link> and <Link href="/privacy"><span className="underline">Privacy Policy</span></Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;