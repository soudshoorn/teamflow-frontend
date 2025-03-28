"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  UserCircle,
  LogOut,
  Settings,
  Layers,
  ListTodo,
  ClipboardList,
} from "lucide-react";

interface ChatHeaderProps {
  username: string;
}

export function ChatHeader({ username }: ChatHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("teamflow-user");
    router.push("/");
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <header className="bg-white border-b shadow-sm py-3 px-4">
      <div className="container max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1
            className="text-xl font-bold text-blue-700 cursor-pointer"
            onClick={() => navigateTo("/chat")}
          >
            TeamFlow
          </h1>
          <span className="text-sm text-gray-500">Scrum Chat</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-1"
            onClick={() => navigateTo("/manage/epics")}
          >
            <Layers className="h-4 w-4" />
            <span>Epics</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-1"
            onClick={() => navigateTo("/manage/user-stories")}
          >
            <ClipboardList className="h-4 w-4" />
            <span>User Stories</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-1"
            onClick={() => navigateTo("/manage/tasks")}
          >
            <ListTodo className="h-4 w-4" />
            <span>Taken</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                <span>{username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer md:hidden"
                onClick={() => navigateTo("/manage/epics")}
              >
                <Layers className="mr-2 h-4 w-4" />
                <span>Epics beheren</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer md:hidden"
                onClick={() => navigateTo("/manage/user-stories")}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                <span>User Stories beheren</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer md:hidden"
                onClick={() => navigateTo("/manage/tasks")}
              >
                <ListTodo className="mr-2 h-4 w-4" />
                <span>Taken beheren</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Uitloggen</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
