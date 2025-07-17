import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Brain, Workflow, Sparkles, Zap, Network, ArrowRight, Lock } from 'lucide-react';
import SimpleProviderSetup from '@/components/SimpleProviderSetup';

const LandingPage = ({ onApiKeySet }) => {
  const [showProviderSetup, setShowProviderSetup] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    setShowProviderSetup(true);
  };

  const handleProviderSetupComplete = () => {
    if (onApiKeySet) onApiKeySet(); // Notify parent component
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white p-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          {/* Hero Icon */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-75 animate-pulse"></div>
              <GitBranch className="relative h-16 w-16 text-white" />
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur opacity-75 animate-pulse animation-delay-1000"></div>
              <Brain className="relative h-16 w-16 text-white" />
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full blur opacity-75 animate-pulse animation-delay-2000"></div>
              <Workflow className="relative h-16 w-16 text-white" />
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
            Semantic Canvas
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mt-2">Visual Knowledge Mapping</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-blue-100 leading-relaxed max-w-3xl mx-auto">
            Transform complex knowledge into elegant visual maps. 
            Build sophisticated semantic networks with our interactive node canvas.
          </p>
          
          {/* Feature grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/30 rounded-lg mb-4 mx-auto">
                  <Network className="h-6 w-6 text-blue-200" />
                </div>
                <h3 className="font-semibold text-lg mb-3">Visual Workflow Canvas</h3>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Drag-and-drop semantic nodes to build complex reasoning chains with intuitive visual connections
                </p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-500/30 rounded-lg mb-4 mx-auto">
                  <Sparkles className="h-6 w-6 text-purple-200" />
                </div>
                <h3 className="font-semibold text-lg mb-3">Semantic Ontology</h3>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Rich library of logic primitives: hypotheses, evidence, reasoning types, and semantic relationships
                </p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-500/30 rounded-lg mb-4 mx-auto">
                  <Zap className="h-6 w-6 text-indigo-200" />
                </div>
                <h3 className="font-semibold text-lg mb-3">AI Execution Engine</h3>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Execute workflows with GPT-4 and witness step-by-step semantic reasoning in action
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Provider Setup or Get Started */}
        {showProviderSetup ? (
          <SimpleProviderSetup 
            userId="demo-user" // In a real app, this would come from auth
            onComplete={handleProviderSetupComplete}
          />
        ) : (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
            <div className="relative bg-white/15 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Launch Workflow Builder</h2>
                <p className="text-blue-100 text-sm">
                  Configure your AI providers to unlock the power of semantic reasoning
                </p>
              </div>
              
              <Button 
                onClick={handleGetStarted}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 transition-all duration-200 group"
              >
                <span className="flex items-center justify-center gap-2">
                  Configure AI Providers
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Button>
              
              <div className="mt-6 text-center">
                <p className="text-xs text-blue-200/80 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" />
                  Secure session storage - never persisted
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;