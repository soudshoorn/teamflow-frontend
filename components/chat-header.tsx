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
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-md py-3 px-4 text-white">
      <div className="container max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <div className="bg-white rounded-lg p-1 mr-2 shadow-sm">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" fill="#3B82F6" />
                <path d="M12 6L8 8V16L12 18L16 16V8L12 6Z" fill="white" />
                <path
                  d="M12 10L10 11V13L12 14L14 13V11L12 10Z"
                  fill="#3B82F6"
                />
              </svg>
            </div>
            <h1
              className="text-xl font-bold cursor-pointer"
              onClick={() => navigateTo("/chat")}
            >
              TeamFlow
            </h1>
          </div>
          <span className="text-sm text-blue-100">Scrum Chat</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-1 text-blue-100 hover:text-white hover:bg-blue-500"
            onClick={() => navigateTo("/manage/epics")}
          >
            <Layers className="h-4 w-4" />
            <span>Epics</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-1 text-blue-100 hover:text-white hover:bg-blue-500"
            onClick={() => navigateTo("/manage/user-stories")}
          >
            <ClipboardList className="h-4 w-4" />
            <span>User Stories</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex items-center gap-1 text-blue-100 hover:text-white hover:bg-blue-500"
            onClick={() => navigateTo("/manage/tasks")}
          >
            <ListTodo className="h-4 w-4" />
            <span>Taken</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white hover:bg-blue-500"
              >
                <UserCircle className="h-5 w-5" />
                <span>{username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Instellingen</span>
              </DropdownMenuItem>
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
