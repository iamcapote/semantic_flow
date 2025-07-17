import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Wand2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const TextToWorkflow = ({ onWorkflowGenerated, apiKey }) => {
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to generate a workflow.",
        variant: "destructive",
      });
      return;
    }
    
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please set your OpenAI API key in the settings.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // This will be replaced by an API call to Engineer 2's backend
      // For now, we simulate a response.
      console.log("Simulating AI text-to-workflow conversion...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated response structure
      const simulatedResponse = {
        nodes: [
          { id: 'node-1', type: 'semantic', position: { x: 50, y: 50 }, data: { type: 'PROP-STM', label: 'Statement', content: 'Initial idea from text.', metadata: { cluster: 'PROP', tags: ['atomic'] } } },
          { id: 'node-2', type: 'semantic', position: { x: 300, y: 100 }, data: { type: 'HEM-HYP', label: 'Hypothesis', content: 'A related hypothesis.', metadata: { cluster: 'HEM', tags: ['tentative'] } } },
          { id: 'node-3', type: 'semantic', position: { x: 100, y: 200 }, data: { type: 'RSN-DED', label: 'Deduction', content: 'A deductive step.', metadata: { cluster: 'RSN', tags: ['validity'] } } },
        ],
        edges: [
          { id: 'edge-1-2', source: 'node-1', target: 'node-2', data: { condition: 'implies' } },
          { id: 'edge-1-3', source: 'node-1', target: 'node-3', data: { condition: 'supports' } },
        ],
      };

      onWorkflowGenerated(simulatedResponse);
      
      toast({
        title: "Workflow Generated",
        description: "A preliminary workflow has been created from your text.",
      });

    } catch (error) {
      console.error("Error generating workflow:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate workflow from text.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto text-left hover:bg-accent/50"
          >
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              <span className="font-medium">AI Text-to-Workflow</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-4 pt-0 space-y-4">
          <p className="text-sm text-muted-foreground">
            Convert text, research abstracts, or complex ideas into workflow nodes.
          </p>
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your text here..."
            className="min-h-[120px]"
            disabled={isLoading}
          />
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Workflow
              </>
            )}
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default TextToWorkflow;
