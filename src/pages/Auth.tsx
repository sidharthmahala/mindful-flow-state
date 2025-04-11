
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'forgot-password'>('login');
  const { signIn, signInWithGoogle, user, resetPassword, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const locationState = location.state as { 
    email?: string; 
  } | null;
  
  const defaultEmail = locationState?.email || '';

  useEffect(() => {
    if (user) {
      if (userProfile?.isComplete) {
        navigate('/');
      } else {
        navigate('/complete-profile');
      }
    }
  }, [user, userProfile, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: '',
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  useEffect(() => {
    if (defaultEmail) {
      loginForm.setValue('email', defaultEmail);
      forgotPasswordForm.setValue('email', defaultEmail);
    }
  }, [defaultEmail, loginForm, forgotPasswordForm]);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error, isNewUser } = await signIn(values.email, values.password);
      if (!error) {
        // Auth check will handle redirection
      } else if (isNewUser) {
        navigate('/signup', { state: { email: values.email } });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await resetPassword(values.email);
      setMode('login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const getCurrentForm = () => {
    if (mode === 'forgot-password') {
      return (
        <Form {...forgotPasswordForm}>
          <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
            <FormField
              control={forgotPasswordForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input className="pl-10" placeholder="email@example.com" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-[#64d8a3] hover:bg-[#50c090]" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Reset Password'}
            </Button>
          </form>
        </Form>
      );
    } else {
      return (
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input className="pl-10" placeholder="email@example.com" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input className="pl-10" type="password" placeholder="••••••••" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-right">
              <Button
                variant="link"
                className="p-0 h-auto text-[#64d8a3]"
                type="button"
                onClick={() => setMode('forgot-password')}
              >
                Forgot Password?
              </Button>
            </div>
            <Button type="submit" className="w-full bg-[#64d8a3] hover:bg-[#50c090]" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Sign In'}
            </Button>
          </form>
        </Form>
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Leaf className="h-10 w-10 text-[#64d8a3]" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' && 'Welcome back to Clarity'}
            {mode === 'forgot-password' && 'Reset your password'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' && 'Enter your credentials to access your account'}
            {mode === 'forgot-password' && 'Enter your email to receive a password reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{getCurrentForm()}</CardContent>
        <CardFooter className="flex flex-col gap-2">
          {mode !== 'forgot-password' && (
            <>
              <Separator />
              <Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading} className="w-full">
                Continue with Google
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/signup')}>
                  Sign Up
                </Button>
              </p>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
