import { MessageSquareIcon, GitBranchIcon } from "lucide-react";
import ChatPage from "./pages/ChatPage.jsx";
import WorkflowBuilderPage from "./pages/WorkflowBuilderPage.jsx";

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
];
