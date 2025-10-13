import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { 
  GraduationCap, 
  Home, 
  Settings,
  User, 
  LogOut,
  Moon,
  Sun,
  Menu
} from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';

interface TopNavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function TopNavigation({ currentView, setCurrentView }: TopNavigationProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'administration', label: 'Administration', icon: Settings }
    ];

    // Students only see Dashboard
    if (user?.role === 'STUDENT') {
      return [{ id: 'dashboard', label: 'Dashboard', icon: Home }];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'STUDENT':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-nav/95 backdrop-blur supports-[backdrop-filter]:bg-nav/95"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          {/* Logo and Brand - Left */}
          <div className="flex items-center gap-2 mr-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-primary/10"
            >
              <GraduationCap className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ExamEntra
            </span>
          </div>

          {/* Navigation Items - Center */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center gap-1 bg-accent/50 rounded-lg p-1">
              {navigationItems.map((item) => (
                <motion.div key={item.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant={currentView === item.id || 
                      (item.id === 'administration' && ['entities', 'entity-detail', 'exam-detail'].includes(currentView))
                      ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentView(item.id)}
                    className={`
                      relative transition-all duration-200 h-9
                      ${(currentView === item.id || 
                        (item.id === 'administration' && ['entities', 'entity-detail', 'exam-detail'].includes(currentView)))
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'hover:bg-background/80'
                      }
                    `}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-accent transition-all duration-200"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </motion.div>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="ghost" 
                    className="nav-profile-btn relative w-auto px-3 hover:bg-accent transition-all duration-200"
                    aria-label="User menu"
                  >
                    <ImageWithFallback
                      src={user?.profile_picture_link || null}
                      fallback={user?.name?.charAt(0) || 'U'}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="hidden lg:flex flex-col items-start ml-3 min-w-0 flex-1">
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {user?.name}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs mt-0.5 ${getRoleBadgeColor()}`}
                      >
                        {user?.role}
                      </Badge>
                    </div>
                    {/* Show badge inline for medium screens */}
                    <div className="hidden sm:flex lg:hidden items-center ml-3">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getRoleBadgeColor()}`}
                      >
                        {user?.role}
                      </Badge>
                    </div>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setCurrentView('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Mobile menu">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {navigationItems.map((item) => (
                    <DropdownMenuItem 
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={currentView === item.id ? 'bg-accent' : ''}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="text-destructive focus:text-destructive md:hidden"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
