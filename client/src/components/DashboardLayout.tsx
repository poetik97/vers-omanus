import { Sidebar } from "./Sidebar";
import { NotificationCenter } from "./NotificationCenter";
import { useState, useEffect } from "react";
import { OnboardingTour } from "./OnboardingTour";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useSupabaseAuth();
  const [showTour, setShowTour] = useState(false);

  // Check localStorage for onboarding completion
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
    if (!hasCompletedOnboarding && user) {
      setShowTour(true);
    }
  }, [user]);

  const handleTourComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setShowTour(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/10 dark:to-purple-950/5">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Fixed header with notification bell */}
      <div className={`
        fixed top-0 right-0 z-30
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:left-20' : 'lg:left-72'}
        left-0
      `}>
        <div className="glass-premium border-b border-border/40 px-6 py-4">
          <div className="flex items-center justify-end gap-4">
            <NotificationCenter />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className={`
        transition-all duration-300 ease-in-out pt-20
        ${isCollapsed ? 'lg:ml-20' : 'lg:ml-72'}
      `}>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour onComplete={handleTourComplete} />
      )}
    </div>
  );
}
