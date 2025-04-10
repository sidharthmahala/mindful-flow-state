
import { 
  CalendarDays, 
  CheckCircle, 
  FileText, 
  Archive, 
  Star, 
  Plus,
  LogOut,
  Settings
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppSidebar = ({ activeTab, setActiveTab }: AppSidebarProps) => {
  const { state } = useSidebar();
  const { user, userProfile, signOut } = useAuth();
  
  const displayName = userProfile?.fullName || user?.email?.split('@')[0] || 'User';
  
  const menuItems = [
    { id: 'today', label: 'Today', icon: CheckCircle },
    { id: 'rituals', label: 'Rituals', icon: Star },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarDays },
    { id: 'someday', label: 'Someday', icon: Archive },
    { id: 'notes', label: 'Notes', icon: FileText }
  ];

  return (
    <Sidebar className="border-r border-r-border/50 mt-14">
      <SidebarRail />
      <SidebarContent className="pt-4 flex flex-col">
        {/* User Profile */}
        <div className="px-4 pb-4 mb-4 border-b border-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-start gap-2 p-2 hover:bg-accent rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={displayName} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {state === "expanded" && (
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium line-clamp-1">{displayName}</span>
                    {user?.email && (
                      <span className="text-xs text-muted-foreground line-clamp-1">{user.email}</span>
                    )}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="cursor-pointer flex items-center text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Quick Add Task Button */}
        {state === "expanded" && (
          <Button 
            className="mb-4 mx-3 flex items-center gap-1 bg-[#64d8a3] hover:bg-[#50c090] text-white"
            onClick={() => {
              setActiveTab('today');
              // Focus on task input (this is just UI prep, actual focus would need a ref)
              const taskInput = document.querySelector('input[placeholder="Add a task..."]');
              if (taskInput) {
                (taskInput as HTMLInputElement).focus();
              }
            }}
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}

        {/* Navigation Menu */}
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                onClick={() => setActiveTab(item.id)}
                isActive={activeTab === item.id}
                tooltip={item.label}
              >
                <item.icon className={activeTab === item.id ? "text-[#64d8a3]" : ""} />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
