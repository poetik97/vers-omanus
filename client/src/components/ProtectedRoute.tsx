import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      // Only redirect if not already on login page
      if (location !== "/login") {
        setLocation("/login");
      }
    }
  }, [user, loading, setLocation, location]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">A verificar autenticação...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
