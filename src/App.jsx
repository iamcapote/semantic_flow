import { ThemeProvider } from "next-themes";
import React, { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { trpc, trpcClient } from "./lib/trpc";
import ChatPage from "./pages/ChatPage";
import WorkflowBuilderPage from "./pages/WorkflowBuilderPage";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const App = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for API key on mount
    const checkApiKey = () => {
      const storedApiKey = sessionStorage.getItem('openai_api_key');
      setHasApiKey(!!storedApiKey);
      setIsLoading(false);
    };
    
    checkApiKey();
    
    // Listen for storage changes
    window.addEventListener('storage', checkApiKey);
    
    return () => {
      window.removeEventListener('storage', checkApiKey);
    };
  }, []);
  
  // Add a method to refresh the API key state
  const refreshApiKeyState = () => {
    const storedApiKey = sessionStorage.getItem('openai_api_key');
    setHasApiKey(!!storedApiKey);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={hasApiKey ? <WorkflowBuilderPage /> : <LandingPage onApiKeySet={refreshApiKeyState} />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/setup" element={<LandingPage onApiKeySet={refreshApiKeyState} />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ThemeProvider>
  );
};

export default App;
