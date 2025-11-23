// Simple toast hook implementation
import { useState, useCallback } from "react";

export interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

let toastListeners: Array<(toast: Toast) => void> = [];

export function useToast() {
  const [, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((toast: Toast) => {
    // Show browser notification or console log
    console.log(`[Toast] ${toast.title}:`, toast.description || "");
    
    // You could also use alert for immediate feedback
    if (toast.variant === "destructive") {
      console.error(`❌ ${toast.title}: ${toast.description || ""}`);
    } else {
      console.log(`✅ ${toast.title}: ${toast.description || ""}`);
    }
    
    // Notify all listeners
    toastListeners.forEach(listener => listener(toast));
    
    setToasts(prev => [...prev, toast]);
  }, []);

  return { toast };
}
