"use client";

import type React from "react";

import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Layers, ClipboardList, ListTodo, MoreVertical } from "lucide-react";
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateMessage, deleteMessage } from "@/lib/message-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onMessageUpdated: (updatedMessage: Message) => void;
  onMessageDeleted: (messageId: number) => void;
}

export function MessageItem({
  message,
  epics,
  userStories,
  tasks,
  isCurrentUser,
  onMessageUpdated,
  onMessageDeleted,
}: MessageItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

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

  const handleEdit = async () => {
    setShowEditDialog(true);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleSaveEdit = async () => {
    if (editedContent.trim() === "") return;

    setIsSubmitting(true);
    try {
      // Behoud alle bestaande eigenschappen van het bericht, inclusief gekoppelde items
      const updatedMessage = await updateMessage(message.id, {
        content: editedContent,
        epicId: message.epicId,
        userStoryId: message.userStoryId,
        taskId: message.taskId,
      });

      // Zorg ervoor dat alle eigenschappen worden doorgegeven aan de parent component
      onMessageUpdated({
        ...message,
        content: editedContent,
      });

      setShowEditDialog(false);
    } catch (error) {
      console.error("Error updating message:", error);
      alert("Er is een fout opgetreden bij het bijwerken van het bericht.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteMessage(message.id);
      onMessageDeleted(message.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Er is een fout opgetreden bij het verwijderen van het bericht.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Functie voor het tonen van het contextmenu bij rechtermuisklik
  const handleContextMenu = (e: React.MouseEvent) => {
    if (isCurrentUser) {
      e.preventDefault();
      // Toon het dropdown menu programmatisch
      const button = messageRef.current?.querySelector(
        '[data-dropdown-trigger="true"]'
      ) as HTMLButtonElement | null;
      if (button) {
        button.click();
      }
    }
  };

  return (
    <div
      className={`flex gap-3 ${
        isCurrentUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar voor andere gebruikers */}
      {!isCurrentUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center text-blue-600 font-medium text-sm shadow-sm">
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
          ref={messageRef}
          className={`relative rounded-2xl px-4 py-2.5 shadow-sm group min-h-[3rem] ${
            isCurrentUser
              ? "bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 border border-blue-200"
              : "bg-white text-gray-800 border border-gray-200"
          }`}
          onContextMenu={handleContextMenu}
        >
          {/* Berichtinhoud */}
          <p className="whitespace-pre-wrap text-base">{message.content}</p>

          {/* Dropdown menu voor eigen berichten */}
          {isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  data-dropdown-trigger="true"
                  className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Berichtopties"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={handleEdit}>
                  Bewerken
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  Verwijderen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
                    <TooltipContent
                      side="top"
                      className="max-w-xs bg-white shadow-lg border border-gray-200 p-2 rounded-md"
                    >
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
                    <TooltipContent
                      side="top"
                      className="max-w-xs bg-white shadow-lg border border-gray-200 p-2 rounded-md"
                    >
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
                    <TooltipContent
                      side="top"
                      className="max-w-xs bg-white shadow-lg border border-gray-200 p-2 rounded-md"
                    >
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
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-sm">
          {userInitial}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bericht bewerken</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px] resize-none border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md"
              placeholder="Bewerk je bericht..."
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
            >
              Annuleren
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitting || editedContent.trim() === ""}
            >
              {isSubmitting ? "Opslaan..." : "Opslaan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bericht verwijderen</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Weet je zeker dat je dit bericht wilt verwijderen?
            </p>
            <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-100">
              <p className="text-sm text-gray-600">{message.content}</p>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Verwijderen..." : "Verwijderen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
