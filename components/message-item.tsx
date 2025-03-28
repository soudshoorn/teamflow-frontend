import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Layers, ClipboardList, ListTodo } from "lucide-react";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface Message {
  id: number;
  content: string;
  username: string;
  epicId?: string;
  userStoryId?: string;
  taskId?: string;
  timestamp: number;
}

interface Epic {
  id: string;
  title: string;
  description?: string;
}

interface UserStory {
  id: string;
  title: string;
  description?: string;
  epicId: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  userStoryId: string;
}

interface MessageItemProps {
  message: Message;
  epics: Epic[];
  userStories: UserStory[];
  tasks: Task[];
  isCurrentUser: boolean;
}

export function MessageItem({
  message,
  epics,
  userStories,
  tasks,
  isCurrentUser,
}: MessageItemProps) {
  // Zoek de gekoppelde items op basis van ID
  const epic = message.epicId
    ? epics.find((e) => e.id === message.epicId)
    : null;
  const epicTitle = epic?.title || "Laden...";
  const epicDescription = epic?.description || "Geen beschrijving beschikbaar";

  const userStory = message.userStoryId
    ? userStories.find((us) => us.id === message.userStoryId)
    : null;
  const userStoryTitle = userStory?.title || "Laden...";
  const userStoryDescription =
    userStory?.description || "Geen beschrijving beschikbaar";

  const task = message.taskId
    ? tasks.find((t) => t.id === message.taskId)
    : null;
  const taskTitle = task?.title || "Laden...";
  const taskDescription = task?.description || "Geen beschrijving beschikbaar";

  const timeAgo = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
    locale: nl,
  });

  // Bepaal de eerste letter van de gebruikersnaam voor de avatar
  const userInitial = message.username
    ? message.username.charAt(0).toUpperCase()
    : "?";

  return (
    <div
      className={`flex gap-2 mb-5 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar voor andere gebruikers */}
      {!isCurrentUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
          {userInitial}
        </div>
      )}

      <div
        className={`max-w-[85%] flex flex-col ${
          isCurrentUser ? "items-end" : "items-start"
        }`}
      >
        {/* Gebruikersnaam voor andere gebruikers */}
        {!isCurrentUser && (
          <div className="ml-1 mb-1">
            <span className="text-sm font-medium text-gray-700">
              {message.username || "Onbekend"}
            </span>
          </div>
        )}

        {/* Berichtbubbel */}
        <div
          className={`relative rounded-2xl px-3 py-2 shadow-sm ${
            isCurrentUser
              ? "bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 border border-blue-200"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
        >
          {/* Berichtinhoud */}
          <p className="whitespace-pre-wrap text-base">{message.content}</p>

          {/* Gekoppelde items */}
          {(epic || userStory || task) && (
            <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-1.5">
              <TooltipProvider>
                {epic && (
                  <TooltipRoot>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 flex items-center gap-1 transition-colors cursor-help"
                      >
                        <Layers className="h-3 w-3" />
                        <span className="text-xs">{epicTitle}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div>
                        <h4 className="font-semibold">{epicTitle}</h4>
                        <p className="text-xs text-gray-600">
                          {epicDescription}
                        </p>
                      </div>
                    </TooltipContent>
                  </TooltipRoot>
                )}

                {userStory && (
                  <TooltipRoot>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1 transition-colors cursor-help"
                      >
                        <ClipboardList className="h-3 w-3" />
                        <span className="text-xs">{userStoryTitle}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div>
                        <h4 className="font-semibold">{userStoryTitle}</h4>
                        <p className="text-xs text-gray-600">
                          {userStoryDescription}
                        </p>
                      </div>
                    </TooltipContent>
                  </TooltipRoot>
                )}

                {task && (
                  <TooltipRoot>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 flex items-center gap-1 transition-colors cursor-help"
                      >
                        <ListTodo className="h-3 w-3" />
                        <span className="text-xs">{taskTitle}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div>
                        <h4 className="font-semibold">{taskTitle}</h4>
                        <p className="text-xs text-gray-600">
                          {taskDescription}
                        </p>
                      </div>
                    </TooltipContent>
                  </TooltipRoot>
                )}
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Tijdstempel */}
        <div
          className={`text-xs text-gray-500 mt-1 ${
            isCurrentUser ? "text-right mr-1" : "ml-1"
          }`}
        >
          {timeAgo}
        </div>
      </div>

      {/* Avatar voor huidige gebruiker */}
      {isCurrentUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
          {userInitial}
        </div>
      )}
    </div>
  );
}
