
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Leaf, Calendar, Mail, User } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  dateOfBirth: z.date({
    required_error: 'Please select a date of birth',
  }),
  role: z.string().min(1, { message: 'Please select a role' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const CompleteProfile = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("CompleteProfile mounted. User:", user?.id);
    console.log("User profile:", userProfile);
    
    if (!user) {
      console.log("No user, redirecting to auth");
      navigate('/auth');
      return;
    }
    
    if (userProfile?.isComplete) {
      console.log('Profile is complete, navigating to home');
      navigate('/');
    } else {
      console.log('Profile needs completion', userProfile);
    }
  }, [user, userProfile, navigate]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: userProfile?.fullName || user?.user_metadata?.full_name || '',
      dateOfBirth: userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth) : undefined,
      role: userProfile?.role || '',
    },
  });

  // Update form values when userProfile changes
  useEffect(() => {
    if (userProfile) {
      profileForm.setValue('fullName', userProfile.fullName || '');
      if (userProfile.dateOfBirth) {
        profileForm.setValue('dateOfBirth', new Date(userProfile.dateOfBirth));
      }
      if (userProfile.role) {
        profileForm.setValue('role', userProfile.role);
      }
    } else if (user?.user_metadata?.full_name) {
      profileForm.setValue('fullName', user.user_metadata.full_name);
    }
  }, [userProfile, user, profileForm]);

  const handleProfileComplete = useCallback(
    async (values: ProfileFormValues) => {
      if (!user) {
        toast.error("Authentication Error", {
          description: "You must be logged in to complete your profile."
        });
        navigate('/auth');
        return;
      }

      setIsLoading(true);
      console.log("Attempting to complete profile for user:", user.id);
      
      try {
        const today = new Date();
        const birthDate = new Date(values.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        console.log("Updating profile with data:", {
          user_id: user.id,
          full_name: values.fullName,
          age,
          role: values.role,
          date_of_birth: values.dateOfBirth.toISOString(),
          is_complete: true
        });

        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            full_name: values.fullName,
            age,
            role: values.role,
            date_of_birth: values.dateOfBirth.toISOString(),
            is_complete: true,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile update error:', profileError);
          toast.error("Profile Update Failed", {
            description: profileError.message || "Failed to update your profile."
          });
          return;
        }

        console.log("Profile updated successfully, refreshing profile data");
        await refreshProfile();
        
        toast.success("Profile Updated", {
          description: "Your profile has been completed successfully."
        });

        // Short delay before redirect
        setTimeout(() => {
          navigate('/');
        }, 500);
      } catch (error: unknown) {
        console.error("Unexpected error during profile update:", error);
        
        if (error instanceof Error) {
          toast.error("Error", {
            description: error.message || "An error occurred while updating your profile."
          });
        } else {
          toast.error("Error", {
            description: "An unknown error occurred."
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user, navigate, refreshProfile, uiToast]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Leaf className="h-10 w-10 text-[#64d8a3]" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide the remaining information to complete your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="bg-muted p-3 rounded-md flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <p>
                  Signed in as: <span className="font-medium">{user.email}</span>
                </p>
              </div>
            </div>
          )}

          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileComplete)} className="space-y-4">
              <FormField
                control={profileForm.control}
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
                control={profileForm.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-10 text-left font-normal relative ${
                              !field.value && 'text-muted-foreground'
                            }`}
                          >
                            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
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
                control={profileForm.control}
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

              <Button
                type="submit"
                className="w-full bg-[#64d8a3] hover:bg-[#50c090]"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Complete Profile'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
