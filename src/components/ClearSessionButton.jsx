import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { SecureKeyManager } from '@/lib/security';

const ClearSessionButton = ({ onSessionCleared }) => {
  const clearSession = () => {
    SecureKeyManager.clearAllKeys();
    sessionStorage.removeItem('active_provider');
    sessionStorage.removeItem('system_message');
    sessionStorage.removeItem('conversations');
    if (onSessionCleared) onSessionCleared();
    window.location.href = '/';
  };

  return (
    <Button 
      variant="outline" 
      onClick={clearSession} 
      className="border-border text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Clear Session
    </Button>
  );
};

export default ClearSessionButton;
