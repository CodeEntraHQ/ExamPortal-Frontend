import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '../ui/sidebar';
import { useAuth } from '../../../features/auth/providers/AuthProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { Button } from '../ui/button';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  Building2,
  GraduationCap,
  ClipboardList,
  User,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';

interface NavigationItem {
  title: string;
  icon: React.ComponentType<any>;
  href: string;
  roles: string[];
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: ['SUPERADMIN', 'ADMIN', 'STUDENT']
  },
  {
    title: 'Entity Management',
    icon: Building2,
    href: '/entities',
    roles: ['SUPERADMIN']
  },
  {
    title: 'User Management',
    icon: Users,
    href: '/users',
    roles: ['SUPERADMIN', 'ADMIN']
  },
  {
    title: 'Exam Management',
    icon: BookOpen,
    href: '/exams',
    roles: ['SUPERADMIN', 'ADMIN']
  },
  {
    title: 'My Exams',
    icon: GraduationCap,
    href: '/my-exams',
    roles: ['STUDENT']
  },
  {
    title: 'Results',
    icon: ClipboardList,
    href: '/results',
    roles: ['STUDENT']
  },
  {
    title: 'Reports & Analytics',
    icon: BarChart3,
    href: '/reports',
    roles: ['SUPERADMIN', 'ADMIN']
  },
  {
    title: 'Profile',
    icon: User,
    href: '/profile',
    roles: ['SUPERADMIN', 'ADMIN', 'STUDENT']
  }
];

interface AppSidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function AppSidebar({ currentView, setCurrentView }: AppSidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const filteredNavigation = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-3 py-2">
          <BookOpen className="h-6 w-6 text-sidebar-primary" />
          <div>
            <p className="font-semibold text-sidebar-foreground">ExamPortal</p>
            <p className="text-xs text-sidebar-foreground/70">
              {user?.role} {user?.entityName && `• ${user.entityName}`}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.href.replace('/', '');
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setCurrentView(item.href.replace('/', ''))}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2 space-y-2">
          <div className="flex items-center gap-2 px-2 py-1 text-sm text-sidebar-foreground">
            <User className="h-4 w-4" />
            <div className="flex-1 min-w-0">
              <p className="truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="flex-1"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout().catch((error) => {
                  console.error('Logout error:', error);
                });
              }}
              className="flex-1"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}