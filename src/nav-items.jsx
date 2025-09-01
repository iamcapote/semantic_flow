import { MessageSquareIcon, GitBranchIcon, MonitorCogIcon } from "lucide-react";
import ChatPage from "./pages/ChatPage.jsx";
import WorkflowBuilderPage from "./pages/WorkflowBuilderPage.jsx";
import Win95Suite from "./pages/Win95Suite.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Workflow Builder",
    to: "/",
    icon: <GitBranchIcon className="h-4 w-4" />,
    page: <WorkflowBuilderPage />,
  },
  {
    title: "Chat",
    to: "/chat",
    icon: <MessageSquareIcon className="h-4 w-4" />,
    page: <ChatPage />,
  },
  {
    title: "Win95 Suite",
    to: "/win95",
    icon: <MonitorCogIcon className="h-4 w-4" />,
    page: <Win95Suite />,
  },
];
