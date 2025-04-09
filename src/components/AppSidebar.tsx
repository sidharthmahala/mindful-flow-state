
import { CalendarDays, CheckCircle, FileText, Archive, Star } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarRail
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppSidebar = ({ activeTab, setActiveTab }: AppSidebarProps) => {
  const menuItems = [
    { id: 'today', label: 'Today', icon: CheckCircle },
    { id: 'rituals', label: 'Rituals', icon: Star },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarDays },
    { id: 'someday', label: 'Someday', icon: Archive },
    { id: 'notes', label: 'Notes', icon: FileText }
  ];

  return (
    <Sidebar className="border-r border-r-border/50">
      <SidebarRail />
      <SidebarContent className="pt-4">
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
