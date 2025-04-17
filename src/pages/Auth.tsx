import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { useForm, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Mail, Lock, Home } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const EmailField = ({ control, name }: { control: Control<LoginFormValues | ForgotPasswordFormValues>; name: "email" }) => (
  <FormField
    control={control}
    name={name}
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
);

const PasswordField = ({ control, name }: { control: Control<LoginFormValues>; name: "password" }) => (
  <FormField
    control={control}
    name={name}
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
);

const FormWrapper = ({
  form,
  onSubmit,
  children,
  isLoading,
  submitLabel,
}: {
  form: ReturnType<typeof useForm<LoginFormValues | ForgotPasswordFormValues>>;
  onSubmit: (values: LoginFormValues | ForgotPasswordFormValues) => void;
  children: React.ReactNode;
  isLoading: boolean;
  submitLabel: string;
}) => (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {children}
      <Button type="submit" className="w-full bg-[#64d8a3] hover:bg-[#50c090]" disabled={isLoading}>
        {isLoading ? 'Processing...' : submitLabel}
      </Button>
    </form>
  </Form>
);

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'forgot-password'>('login');
  const { signIn, signInWithGoogle, user, resetPassword, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const locationState = location.state as { email?: string } | null;
  const defaultEmail = locationState?.email || '';

  useEffect(() => {
    sessionStorage.clear();
    
    if (user) {
      console.log("User already logged in:", user.email);
      console.log("User profile:", userProfile);
      
      if (userProfile?.isComplete) {
        console.log("Profile is complete, redirecting to home");
        navigate('/');
      } else {
        console.log("Profile incomplete, redirecting to complete profile");
        navigate('/complete-profile');
      }
    }
  }, [user, userProfile, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail, password: '' },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: defaultEmail },
  });

  useEffect(() => {
    if (defaultEmail) {
      loginForm.setValue('email', defaultEmail);
      forgotPasswordForm.setValue('email', defaultEmail);
    }
  }, [defaultEmail, loginForm, forgotPasswordForm]);

  const handleLogin = useCallback(async (values: LoginFormValues) => {
    console.log("Login attempt with email:", values.email);
    setIsLoading(true);
    
    try {
      const { error, isNewUser } = await signIn(values.email, values.password);
      
      if (error) {
        console.log("Login error:", error);
        
        if (error.message?.toLowerCase().includes('invalid login credentials') || 
            error.message?.toLowerCase().includes('user not found') ||
            isNewUser) {
          toast.info("Account not found", {
            description: "No account found with this email. Please sign up."
          });
          
          navigate('/signup', { state: { email: values.email } });
        }
      } else {
        console.log("Login successful");
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [signIn, navigate]);

  const handleForgotPassword = useCallback(async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await resetPassword(values.email);
      toast.success("Password Reset Email Sent", {
        description: "Please check your email for instructions."
      });
      setMode('login');
    } finally {
      setIsLoading(false);
    }
  }, [resetPassword]);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const formContent = useMemo(() => {
    if (mode === 'forgot-password') {
      return (
        <FormWrapper
          form={forgotPasswordForm}
          onSubmit={handleForgotPassword}
          isLoading={isLoading}
          submitLabel="Reset Password"
        >
          <EmailField control={forgotPasswordForm.control} name="email" />
        </FormWrapper>
      );
    }
    return (
      <FormWrapper
        form={loginForm}
        onSubmit={handleLogin}
        isLoading={isLoading}
        submitLabel="Sign In"
      >
        <EmailField control={loginForm.control} name="email" />
        <PasswordField control={loginForm.control} name="password" />
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
      </FormWrapper>
    );
  }, [mode, loginForm, forgotPasswordForm, isLoading, handleForgotPassword, handleLogin]);

  const titles = {
    login: 'Welcome to Clarity',
    'forgot-password': 'Reset your password',
  };

  const descriptions = {
    login: 'Enter your credentials to access your account',
    'forgot-password': 'Enter your email to receive a password reset link',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-0 top-0"
              onClick={() => navigate('/')}
              aria-label="Back to Home"
            >
              <Home className="h-5 w-5" />
            </Button>
            <Leaf className="h-10 w-10 text-[#64d8a3]" />
          </div>
          <CardTitle className="text-2xl font-bold">{titles[mode]}</CardTitle>
          <CardDescription>{descriptions[mode]}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{formContent}</CardContent>
        <CardFooter className="flex flex-col gap-2">
          {mode !== 'forgot-password' && (
            <>
              <Separator />
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full"
              >
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
