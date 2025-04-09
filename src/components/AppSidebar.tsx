
import { 
  CalendarDays, 
  CheckCircle, 
  FileText, 
  Archive, 
  Star, 
  Plus, 
  ChevronLeft,
  ChevronRight
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
import { useState } from 'react';

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppSidebar = ({ activeTab, setActiveTab }: AppSidebarProps) => {
  const { state, toggleSidebar } = useSidebar();
  const [username] = useState('User');
  
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
        {/* User Profile and Sidebar Toggle */}
        <div className="flex items-center justify-between px-4 pb-4 mb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt={username} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">{username.charAt(0)}</AvatarFallback>
            </Avatar>
            {state === "expanded" && <span className="text-sm font-medium">{username}</span>}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={toggleSidebar}
          >
            {state === "expanded" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
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
