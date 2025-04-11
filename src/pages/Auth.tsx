
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Calendar, Mail, User, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  dateOfBirth: z.date({
    required_error: "Please select a date of birth",
  }),
  role: z.string().min(1, { message: "Please select a role" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const { signIn, signUp, signInWithGoogle, user, resetPassword, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const locationState = location.state as { 
    email?: string; 
    fromLogin?: boolean;
    fromGoogle?: boolean;
  } | null;
  
  const defaultEmail = locationState?.email || '';
  const fromGoogle = locationState?.fromGoogle || false;

  useEffect(() => {
    if (user && userProfile) {
      navigate('/');
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

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: undefined,
      role: '',
      email: defaultEmail,
      password: '',
    },
  });

  useEffect(() => {
    if (defaultEmail) {
      loginForm.setValue('email', defaultEmail);
      forgotPasswordForm.setValue('email', defaultEmail);
      signupForm.setValue('email', defaultEmail);
      if (location.state?.fromLogin) {
        setMode('signup');
      }
    }
  }, [defaultEmail, loginForm, signupForm, forgotPasswordForm, location.state]);

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error, isNewUser } = await signIn(values.email, values.password);
      if (!error) {
        navigate('/');
      } else if (isNewUser) {
        navigate('/auth', { state: { email: values.email, fromLogin: true } });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await resetPassword(values.email);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      // Calculate age from dateOfBirth
      const today = new Date();
      const birthDate = new Date(values.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      const { error } = await signUp(values.email, values.password, {
        fullName: values.fullName,
        age: age,
        gender: values.role // Using the role field for gender temporarily
      });
      
      if (!error) {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const getCurrentForm = () => {
    if (mode === 'signup') {
      return (
        <Form {...signupForm}>
          <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
            <FormField
              control={signupForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input className="pl-10" placeholder="John Doe" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={signupForm.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-10 text-left font-normal relative ${!field.value && "text-muted-foreground"}`}
                        >
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={signupForm.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="pl-10 relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={signupForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        className="pl-10" 
                        placeholder="email@example.com" 
                        {...field} 
                        readOnly={fromGoogle}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!fromGoogle && (
              <FormField
                control={signupForm.control}
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
            )}
            
            <Button type="submit" className="w-full bg-[#64d8a3] hover:bg-[#50c090]" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Sign Up'}
            </Button>
          </form>
        </Form>
      );
    } else if (mode === 'forgot-password') {
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
            {mode === 'signup' && 'Create your Clarity account'}
            {mode === 'forgot-password' && 'Reset your password'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' && 'Enter your credentials to access your account'}
            {mode === 'signup' && 'Enter your information to create an account'}
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
                {mode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setMode('signup')}>
                      Sign Up
                    </Button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setMode('login')}>
                      Login
                    </Button>
                  </>
                )}
              </p>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
export default Auth;
