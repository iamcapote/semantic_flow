import { ThemeProvider } from "next-themes";
import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Win95Suite from "./pages/Win95Suite";
import LearnPage from "./pages/LearnPage";
import DocsPage from "./pages/DocsPage";
import DiscoursePage from "./pages/DiscoursePage";
import { SecureKeyManager } from './lib/security';
import { useAuth } from './lib/auth';
// Import debug utility
import { detectOverlappingElements } from './utils/debugNav';
import BlueScreen from "./components/BlueScreen";
import './components/win95.css';
import UpdateNotifier from './components/UpdateNotifier';

const queryClient = new QueryClient();


const App = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth || document.documentElement?.clientWidth || 0;
      return w >= 1024;
    }
    return true;
  });
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Check for API key on mount
    const checkApiKey = () => {
      const provider = sessionStorage.getItem('active_provider') || 'openai';
      const storedApiKey = SecureKeyManager.getApiKey(provider);
      setHasApiKey(!!storedApiKey);
      setIsLoading(false);
    };
    
    checkApiKey();

    // Enforce desktop-only viewport (>= 1024px)
    const updateViewport = () => {
      try {
        const width = window.innerWidth || document.documentElement.clientWidth || 0;
        setIsDesktop(width >= 1024);
      } catch (_) {
        setIsDesktop(true);
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    
    // Listen for storage changes
    window.addEventListener('storage', checkApiKey);
    
    // Add debug utility to window for debugging
    if (process.env.NODE_ENV === 'development') {
      window.detectOverlappingElements = detectOverlappingElements;
      
      // Automatically run detection after page load
      setTimeout(() => {
        console.log('Debug: Checking for elements overlapping navigation...');
        detectOverlappingElements();
      }, 2000);
    }
    
    return () => {
      window.removeEventListener('storage', checkApiKey);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);
  
  // Add a method to refresh the API key state
  const refreshApiKeyState = () => {
    const provider = sessionStorage.getItem('active_provider') || 'openai';
    const storedApiKey = SecureKeyManager.getApiKey(provider);
    setHasApiKey(!!storedApiKey);
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show desktop-only blue screen for mobile/small widths
  if (!isDesktop) {
    return <BlueScreen />;
  }

  // Root now always shows Landing page to restore expected startup behavior
  const HomeLanding = () => <LandingPage onApiKeySet={refreshApiKeyState} />;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/** Root shows Landing (explicit setup) */}
              <Route path="/" element={<HomeLanding />} />
              {/** Keep routes for deep links, but the suite is the primary UI */}
              <Route path="/builder" element={<Win95Suite initialTab="builder" />} />
              <Route path="/ide" element={<Win95Suite initialTab="ide" />} />
              <Route path="/console" element={<Win95Suite initialTab="console" />} />
              <Route path="/chat" element={<Win95Suite initialTab="chat" />} />
              <Route path="/api" element={<Win95Suite initialTab="api" />} />
              <Route path="/router" element={<Win95Suite initialTab="api" />} />
              <Route path="/discourse" element={<DiscoursePage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/learn/docs" element={<DocsPage />} />
              <Route path="/setup" element={<LandingPage onApiKeySet={refreshApiKeyState} />} />
            </Routes>
          </BrowserRouter>
          {/* Version / build update notifications */}
          <UpdateNotifier />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
