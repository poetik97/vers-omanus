import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CookieConsentBanner } from "./components/legal/CookieConsent";
import { CookiePreferences } from "./components/legal/CookiePreferences";
import { DataExport } from "./components/legal/DataExport";
import { AccountDeletion } from "./components/legal/AccountDeletion";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Finances from "./pages/Finances";
import Goals from "./pages/Goals";
import MenstrualCycle from "./pages/MenstrualCycle";
import Diary from "./pages/Diary";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/register"} component={Register} />
      <Route path={"/dashboard"}>
        <ProtectedRoute>
          <DashboardLayout><Dashboard /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/tasks"}>
        <ProtectedRoute>
          <DashboardLayout><Tasks /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/calendar"}>
        <ProtectedRoute>
          <DashboardLayout><Calendar /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/finances"}>
        <ProtectedRoute>
          <DashboardLayout><Finances /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/goals"}>
        <ProtectedRoute>
          <DashboardLayout><Goals /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/menstrual-cycle"}>
        <ProtectedRoute>
          <DashboardLayout><MenstrualCycle /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/diary"}>
        <ProtectedRoute>
          <DashboardLayout><Diary /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/chat"}>
        <ProtectedRoute>
          <DashboardLayout><Chat /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/settings"}>
        <ProtectedRoute>
          <DashboardLayout><Settings /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/reports"}>
        <ProtectedRoute>
          <DashboardLayout><Reports /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/notifications"}>
        <ProtectedRoute>
          <DashboardLayout><Notifications /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/settings/notifications"}>
        <ProtectedRoute>
          <DashboardLayout><NotificationSettings /></DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/terms-of-service"} component={TermsOfService} />
      <Route path={"/cookie-policy"} component={CookiePolicy} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [showCookiePreferences, setShowCookiePreferences] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showAccountDeletion, setShowAccountDeletion] = useState(false);

  useEffect(() => {
    // Listen for custom events from Settings page
    const handleOpenCookiePreferences = () => setShowCookiePreferences(true);
    const handleOpenDataExport = () => setShowDataExport(true);
    const handleOpenAccountDeletion = () => setShowAccountDeletion(true);

    window.addEventListener('openCookiePreferences', handleOpenCookiePreferences);
    window.addEventListener('openDataExport', handleOpenDataExport);
    window.addEventListener('openAccountDeletion', handleOpenAccountDeletion);

    return () => {
      window.removeEventListener('openCookiePreferences', handleOpenCookiePreferences);
      window.removeEventListener('openDataExport', handleOpenDataExport);
      window.removeEventListener('openAccountDeletion', handleOpenAccountDeletion);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieConsentBanner />
          <CookiePreferences
            open={showCookiePreferences}
            onOpenChange={setShowCookiePreferences}
          />
          <DataExport
            open={showDataExport}
            onOpenChange={setShowDataExport}
          />
          <AccountDeletion
            open={showAccountDeletion}
            onOpenChange={setShowAccountDeletion}
          />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
