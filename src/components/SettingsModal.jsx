import React from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings } from "lucide-react";
import ProviderSettings from './ProviderSettings';

const SettingsModal = ({ apiKey, setApiKey, systemMessage, setSystemMessage, userId }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="providers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="providers">AI Providers</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
            <TabsContent value="providers" className="mt-4">
              <ProviderSettings userId={userId} />
            </TabsContent>
            <TabsContent value="general" className="mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="openaiApiKey">
                    Legacy OpenAI API Key
                  </label>
                  <Input
                    id="openaiApiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-... (deprecated, use Providers tab)"
                  />
                  <p className="text-sm text-muted-foreground">
                    This field is deprecated. Please use the AI Providers tab to configure your API keys.
                  </p>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="systemMessage">
                    System Message
                  </label>
                  <Textarea
                    id="systemMessage"
                    value={systemMessage}
                    onChange={(e) => setSystemMessage(e.target.value)}
                    rows={4}
                    placeholder="You are a helpful assistant..."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal;