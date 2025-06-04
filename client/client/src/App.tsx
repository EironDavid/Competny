import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "next-themes";

// Pages
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page"; // Added HomePage

// User Pages
import UserDashboard from "@/pages/user/user-dashboard";
import BrowsePets from "@/pages/user/browse-pets";
import PetDetail from "@/pages/user/pet-detail";
import MyApplications from "@/pages/user/my-applications";
import PetTracking from "@/pages/user/pet-tracking";
import PetCareTips from "@/pages/user/pet-care-tips";
import Reviews from "@/pages/user/reviews";

// Admin Pages
import AdminDashboard from "@/pages/admin/admin-dashboard";
import UserManagement from "@/pages/admin/user-management";
import PetManagement from "@/pages/admin/pet-management";
import FosterApplications from "@/pages/admin/foster-applications";
import Reports from "@/pages/admin/reports";
import Cms from "@/pages/admin/cms";
import ReviewModeration from "@/pages/admin/review-moderation";
import SecurityLogs from "@/pages/admin/security-logs";

function Router() {
  return (
    <Switch>
      {/* Auth Page */}
      <Route path="/auth" component={AuthPage} />

      {/* User Routes */}
      <Route path="/" component={HomePage} /> {/* HomePage as landing page */}
      <ProtectedRoute path="/dashboard" component={UserDashboard} /> {/* Changed path to /dashboard to avoid conflict */}
      <ProtectedRoute path="/browse-pets" component={BrowsePets} />
      <ProtectedRoute path="/pet/:id" component={PetDetail} />
      <ProtectedRoute path="/my-applications" component={MyApplications} />
      <ProtectedRoute path="/pet-tracking" component={PetTracking} />
      <ProtectedRoute path="/pet-care-tips" component={PetCareTips} />
      <ProtectedRoute path="/reviews" component={Reviews} />

      {/* Admin Routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/users" component={UserManagement} adminOnly />
      <ProtectedRoute path="/admin/pets" component={PetManagement} adminOnly />
      <ProtectedRoute path="/admin/foster-applications" component={FosterApplications} adminOnly />
      <ProtectedRoute path="/admin/reports" component={Reports} adminOnly />
      <ProtectedRoute path="/admin/cms" component={Cms} adminOnly />
      <ProtectedRoute path="/admin/review-moderation" component={ReviewModeration} adminOnly />
      <ProtectedRoute path="/admin/security-logs" component={SecurityLogs} adminOnly />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;