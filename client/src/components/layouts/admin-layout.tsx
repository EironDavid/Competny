import { useState, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  PawPrint, 
  ClipboardList, 
  BarChart, 
  FileText, 
  Star, 
  Shield, 
  LogOut, 
  Menu, 
  X,
  User,
  MapPin
} from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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
    { path: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: "/admin/users", label: "User Management", icon: <Users className="h-5 w-5" /> },
    { path: "/admin/pets", label: "Pet Management", icon: <PawPrint className="h-5 w-5" /> },
    { path: "/admin/foster-applications", label: "Foster Applications", icon: <ClipboardList className="h-5 w-5" /> },
    { path: "/admin/reports", label: "Reports", icon: <BarChart className="h-5 w-5" /> },
    { path: "/admin/cms", label: "CMS", icon: <FileText className="h-5 w-5" /> },
    { path: "/admin/review-moderation", label: "Review Moderation", icon: <Star className="h-5 w-5" /> },
    { path: "/admin/security-logs", label: "Security Logs", icon: <Shield className="h-5 w-5" /> },
    { path: "/admin/pet-tracking", label: "Pet Tracking", icon: <MapPin className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white shadow-md">
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-primary">Competny Admin</h1>
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
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">Admin</p>
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
          <h1 className="text-lg font-bold text-primary">ComPetny Admin</h1>
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`} />
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
              <h1 className="text-xl font-bold text-primary">Competny Admin</h1>
              <button 
                className="text-gray-500"
                onClick={closeMobileMenu}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="px-2 py-4 space-y-1">
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
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <Button 
                variant="default" 
                className="w-full"
                onClick={handleLogout}
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
    </div>
  );
}