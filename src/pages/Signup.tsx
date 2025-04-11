import { useState, useCallback } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Mail, User, Lock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const signupSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  dateOfBirth: z.date({
    required_error: 'Please select a date of birth',
  }),
  role: z.string().min(1, { message: 'Please select a role' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const locationState = location.state as { email?: string; fromGoogle?: boolean } | null;
  const fromGoogle = locationState?.fromGoogle || false;
  const defaultEmail = locationState?.email || '';

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

  const handleSignup = useCallback(
    async (values: SignupFormValues) => {
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
          age,
          role: values.role,
          dateOfBirth: values.dateOfBirth.toISOString(),
        });

        if (!error) {
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [signUp, navigate]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Leaf className="h-10 w-10 text-[#64d8a3]" />
          </div>
          <CardTitle className="text-2xl font-bold">Create your Clarity account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              {/* Full Name Field */}
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

              {/* Date of Birth Field with Year Picker */}
              <FormField
                control={signupForm.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value}
                        onChange={(date: Date | null) => field.onChange(date)} // Ensure single date selection
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        maxDate={new Date()}
                        minDate={new Date('1900-01-01')}
                        placeholderText="Select your date of birth"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role Field */}
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

              {/* Email Field */}
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

              {/* Password Field */}
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
                          <Input
                            className="pl-10"
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#64d8a3] hover:bg-[#50c090]"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Sign Up'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>
              Login
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
