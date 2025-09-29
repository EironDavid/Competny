import { useState, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { 
  Home, 
  PawPrint, 
  Heart, 
  ClipboardList, 
  MapPin, 
  BookOpen, 
  Star, 
  LogOut, 
  Menu, 
  X,
  User,
  LayoutDashboard,
  Search,
  FileText
} from "lucide-react";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { path: "/browse-pets", label: "Browse Pets", icon: <PawPrint className="h-5 w-5" /> },
    { path: "/my-applications", label: "My Applications", icon: <ClipboardList className="h-5 w-5" /> },
    { path: "/pet-tracking", label: "Pet Tracking", icon: <MapPin className="h-5 w-5" /> },
    { path: "/pet-care-tips", label: "Pet Care Tips", icon: <BookOpen className="h-5 w-5" /> },
    { path: "/reviews", label: "Reviews & Feedback", icon: <Star className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-md">
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-primary">Competny</h1>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.path}>
                <Link 
                  href={item.path}
                  onClick={closeMobileMenu}
                >
                  <div 
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                      location === item.path 
                        ? "bg-primary text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </div>
                </Link>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">User</p>
            </div>
          </div>
          <Button 
            variant="default" 
            className="mt-4 w-full"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-white shadow">
        <div className="h-16 flex items-center justify-between px-4">
          <button 
            className="text-gray-500"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold text-primary">Competny</h1>
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-30">
            <div className="h-16 flex items-center justify-between px-4 border-b">
              <h1 className="text-xl font-bold text-primary">Competny</h1>
              <button 
                className="text-gray-500"
                onClick={closeMobileMenu}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="px-2 py-4 space-y-1 flex-1">
              {navItems.map((item) => (
                <div key={item.path}>
                  <Link 
                    href={item.path}
                    onClick={closeMobileMenu}
                  >
                    <div 
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer ${
                        location === item.path 
                          ? "bg-primary text-white" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </div>
                  </Link>
                </div>
              ))}
            </nav>

            {/* Mobile menu user section */}
            <div className="p-4 border-t">
              <div className="flex items-center mb-4">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">User</p>
                </div>
              </div>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:ml-64 flex-1 flex flex-col">
        <main className="flex-1 py-16 md:py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <Link href="/dashboard">
            <div className={`flex flex-col items-center py-2 px-1 text-xs rounded-lg transition-colors ${
              location === "/dashboard" 
                ? "text-primary bg-primary/10" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}>
              <Home className="h-4 w-4 mb-1" />
              <span>Home</span>
            </div>
          </Link>

          <Link href="/browse-pets">
            <div className={`flex flex-col items-center py-2 px-1 text-xs rounded-lg transition-colors ${
              location === "/browse-pets" 
                ? "text-primary bg-primary/10" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}>
              <Search className="h-4 w-4 mb-1" />
              <span>Browse</span>
            </div>
          </Link>

          <Link href="/my-applications">
            <div className={`flex flex-col items-center py-2 px-1 text-xs rounded-lg transition-colors ${
              location === "/my-applications" 
                ? "text-primary bg-primary/10" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}>
              <FileText className="h-4 w-4 mb-1" />
              <span>Apps</span>
            </div>
          </Link>

          <Link href="/pet-tracking">
            <div className={`flex flex-col items-center py-2 px-1 text-xs rounded-lg transition-colors ${
              location === "/pet-tracking" 
                ? "text-primary bg-primary/10" 
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}>
              <MapPin className="h-4 w-4 mb-1" />
              <span>Track</span>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center py-2 px-1 text-xs rounded-lg transition-colors text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mb-1" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}