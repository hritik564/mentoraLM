import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";

// Public Pages
import HomePage from "@/pages/home/HomePage";
import ServicesPage from "@/pages/services/ServicesPage";
import ServiceDetailPage from "@/pages/services/ServiceDetailPage";
import SignInPage from "@/pages/auth/SignInPage";
import SignUpPage from "@/pages/auth/SignUpPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import HowItWorksPage from "@/pages/public/HowItWorksPage";
import AboutPage from "@/pages/public/AboutPage";
import ContactPage from "@/pages/public/ContactPage";

// Student Pages
import DashboardHome from "@/pages/dashboard/DashboardHome";
import ProfileWizard from "@/pages/dashboard/ProfileWizard";
import ChatPage from "@/pages/dashboard/ChatPage";
import MarketplacePage from "@/pages/dashboard/MarketplacePage";
import RoadmapPage from "@/pages/dashboard/RoadmapPage";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminServices from "@/pages/admin/AdminServices";
import AdminStudents from "@/pages/admin/AdminStudents";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminContacts from "@/pages/admin/AdminContacts";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/services/:id" component={ServiceDetailPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/auth/signin" component={SignInPage} />
      <Route path="/auth/signup" component={SignUpPage} />
      <Route path="/auth/forgot-password" component={ForgotPasswordPage} />
      
      {/* Student Routes */}
      <Route path="/dashboard">
        <ProtectedRoute><DashboardHome /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/profile">
        <ProtectedRoute><ProfileWizard /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/chat">
        <ProtectedRoute><ChatPage /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/marketplace">
        <ProtectedRoute><MarketplacePage /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/roadmap">
        <ProtectedRoute><RoadmapPage /></ProtectedRoute>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" component={() => <Redirect to="/admin/dashboard" />} />
      <Route path="/admin/login" component={AdminLogin} />
      
      <Route path="/admin/dashboard">
        <AdminRoute><AdminDashboard /></AdminRoute>
      </Route>
      <Route path="/admin/services">
        <AdminRoute><AdminServices /></AdminRoute>
      </Route>
      <Route path="/admin/students">
        <AdminRoute><AdminStudents /></AdminRoute>
      </Route>
      <Route path="/admin/bookings">
        <AdminRoute><AdminBookings /></AdminRoute>
      </Route>
      <Route path="/admin/contacts">
        <AdminRoute><AdminContacts /></AdminRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster theme="dark" position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
