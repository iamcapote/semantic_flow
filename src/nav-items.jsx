import { MessageSquareIcon, GitBranchIcon, MonitorCogIcon, MessageCircleQuestionIcon } from "lucide-react";
import Win95Suite from "./pages/Win95Suite.jsx";
import LearnPage from "./pages/LearnPage.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
  title: "Home",
  to: "/",
  icon: <GitBranchIcon className="h-4 w-4" />,
  page: <Win95Suite initialTab="builder" />,
  },
  {
    title: "Chat",
    to: "/chat",
    icon: <MessageSquareIcon className="h-4 w-4" />,
  page: <Win95Suite initialTab="chat" />,
  },
  {
    title: "Discourse",
    to: "/discourse",
    icon: <MessageCircleQuestionIcon className="h-4 w-4" />,
  page: <Win95Suite initialTab="discourse" />,
  },
  {
    title: "Learn",
    to: "/learn",
    icon: <MessageCircleQuestionIcon className="h-4 w-4" />,
    page: <LearnPage />,
  },
];
