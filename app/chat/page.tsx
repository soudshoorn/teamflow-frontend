"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  ClipboardList,
  ListTodo,
  X,
  ChevronUp,
  ChevronDown,
  LinkIcon,
} from "lucide-react";
import {
  fetchMessages,
  sendMessage,
  type FrontendMessage,
} from "@/lib/message-service";
import { fetchEpics } from "@/lib/epic-service";
import { fetchUserStories } from "@/lib/user-story-service";
import { fetchTasks } from "@/lib/task-service";
import { MessageItem } from "@/components/message-item";
import { ChatHeader } from "@/components/chat-header";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

export default function ChatPage() {
  const [messages, setMessages] = useState<FrontendMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [selectedEpicId, setSelectedEpicId] = useState<string>("none");
  const [selectedUserStoryId, setSelectedUserStoryId] =
    useState<string>("none");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("none");
  const [epics, setEpics] = useState<Epic[]>([]);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const storedUsername = localStorage.getItem("teamflow-user");
    const storedUserId = localStorage.getItem("teamflow-user-id");

    if (!storedUsername || !storedUserId) {
      router.push("/");
      return;
    }

    setUsername(storedUsername);
    setUserId(storedUserId);
    console.log("Current user:", {
      username: storedUsername,
      id: storedUserId,
    });
  }, [router]);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [messagesData, epicsData, userStoriesData, tasksData] =
          await Promise.all([
            fetchMessages(),
            fetchEpics(),
            fetchUserStories(),
            fetchTasks(),
          ]);
        setMessages(messagesData);
        setEpics(epicsData);
        setUserStories(userStoriesData);
        setTasks(tasksData);

        // Debug log voor berichten en gebruikersnamen
        console.log(
          "Loaded messages:",
          messagesData.map((msg) => ({
            id: msg.id,
            username: msg.username,
            isCurrentUser:
              msg.username.toLowerCase() === username.toLowerCase(),
          }))
        );
      } catch (error) {
        console.error("Error loading initial data:", error);
        alert(
          "Er is een fout opgetreden bij het laden van de data. Probeer het later opnieuw."
        );
      }
    };

    if (username && userId) {
      loadInitialData();
    }
  }, [username, userId]);

  // Voeg deze functie toe om de berichten periodiek te verversen
  useEffect(() => {
    // Functie om berichten te laden
    const loadMessages = async () => {
      try {
        const messagesData = await fetchMessages();
        setMessages(messagesData);
      } catch (error) {
        console.error("Error refreshing messages:", error);
      }
    };

    // Laad berichten direct
    if (username && userId) {
      loadMessages();
    }

    // Stel een interval in om berichten elke 10 seconden te verversen
    const intervalId = setInterval(() => {
      if (username && userId) {
        loadMessages();
      }
    }, 10000);

    // Ruim het interval op bij unmount
    return () => clearInterval(intervalId);
  }, [username, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (messageText.trim() === "" || !username) return;

    const newMessage: Omit<FrontendMessage, "id"> = {
      content: messageText,
      username,
      timestamp: Date.now(),
    };

    // Add the selected items (only if they're not "none")
    if (selectedEpicId && selectedEpicId !== "none") {
      newMessage.epicId = selectedEpicId;
    }

    if (selectedUserStoryId && selectedUserStoryId !== "none") {
      newMessage.userStoryId = selectedUserStoryId;
    }

    if (selectedTaskId && selectedTaskId !== "none") {
      newMessage.taskId = selectedTaskId;
    }

    try {
      const savedMessage = await sendMessage(newMessage);
      console.log("Sent message:", savedMessage);
      setMessages((prev) => [...prev, savedMessage]);
      setMessageText("");
      // Reset selection
      setSelectedEpicId("none");
      setSelectedUserStoryId("none");
      setSelectedTaskId("none");
      // Close linking panel after sending
      setIsLinkingOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
      alert(
        "Er is een fout opgetreden bij het versturen van je bericht. Probeer het opnieuw."
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper functions to get title by id
  const getEpicTitle = (id: string) =>
    epics.find((e) => e.id === id)?.title || "";
  const getUserStoryTitle = (id: string) =>
    userStories.find((us) => us.id === id)?.title || "";
  const getTaskTitle = (id: string) =>
    tasks.find((t) => t.id === id)?.title || "";

  // Functie om te controleren of een bericht van de huidige gebruiker is
  const isCurrentUserMessage = (messageUsername: string) => {
    // Case-insensitive vergelijking
    return messageUsername.toLowerCase() === username.toLowerCase();
  };

  // Check if any items are selected
  const hasSelectedItems =
    selectedEpicId !== "none" ||
    selectedUserStoryId !== "none" ||
    selectedTaskId !== "none";

  if (!username || !userId) {
    return null; // Don't render anything until we check authentication
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader username={username} />

      <div className="flex-1 container max-w-4xl mx-auto p-4 overflow-hidden flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b bg-white py-3">
            <CardTitle>TeamFlow Chat</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">
                  Geen berichten, start de conversatie!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  epics={epics}
                  userStories={userStories}
                  tasks={tasks}
                  isCurrentUser={isCurrentUserMessage(msg.username)}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        <div className="mt-4 bg-white rounded-lg shadow">
          {/* Selected Items Display - Compact view above textarea */}
          {hasSelectedItems && (
            <div className="px-4 pt-3 pb-1 border-b flex flex-wrap gap-2">
              {selectedEpicId !== "none" && (
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 py-1 px-2"
                >
                  <Layers className="h-3 w-3" />
                  <span className="mr-1">{getEpicTitle(selectedEpicId)}</span>
                  <button
                    onClick={() => setSelectedEpicId("none")}
                    className="h-4 w-4 rounded-full hover:bg-gray-200 flex items-center justify-center"
                    aria-label="Verwijder Epic selectie"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {selectedUserStoryId !== "none" && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1 py-1 px-2"
                >
                  <ClipboardList className="h-3 w-3" />
                  <span className="mr-1">
                    {getUserStoryTitle(selectedUserStoryId)}
                  </span>
                  <button
                    onClick={() => setSelectedUserStoryId("none")}
                    className="h-4 w-4 rounded-full hover:bg-gray-200 flex items-center justify-center"
                    aria-label="Verwijder User Story selectie"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {selectedTaskId !== "none" && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 py-1 px-2"
                >
                  <ListTodo className="h-3 w-3" />
                  <span className="mr-1">{getTaskTitle(selectedTaskId)}</span>
                  <button
                    onClick={() => setSelectedTaskId("none")}
                    className="h-4 w-4 rounded-full hover:bg-gray-200 flex items-center justify-center"
                    aria-label="Verwijder Taak selectie"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          <div className="p-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Textarea
                  placeholder="Typ hier je bericht..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[100px] pr-12"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-2 right-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsLinkingOpen(!isLinkingOpen)}
                  title="Koppel aan Scrum items"
                >
                  <LinkIcon className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex justify-between items-center">
                <Collapsible
                  open={isLinkingOpen}
                  onOpenChange={setIsLinkingOpen}
                  className="w-full"
                >
                  <div className="flex justify-between items-center">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-gray-600"
                      >
                        {isLinkingOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        <span>Koppel aan Scrum items</span>
                      </Button>
                    </CollapsibleTrigger>
                    <Button onClick={handleSendMessage} className="px-6">
                      Verstuur
                    </Button>
                  </div>

                  <CollapsibleContent className="mt-3 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Epic Selector */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Epic
                        </label>
                        <Select
                          value={selectedEpicId}
                          onValueChange={setSelectedEpicId}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecteer een Epic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Geen Epic</SelectItem>
                            {epics.map((epic) => (
                              <SelectItem key={epic.id} value={epic.id}>
                                {epic.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* User Story Selector */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          User Story
                        </label>
                        <Select
                          value={selectedUserStoryId}
                          onValueChange={setSelectedUserStoryId}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecteer een User Story" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Geen User Story
                            </SelectItem>
                            {userStories.map((story) => (
                              <SelectItem key={story.id} value={story.id}>
                                {story.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Task Selector */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Taak
                        </label>
                        <Select
                          value={selectedTaskId}
                          onValueChange={setSelectedTaskId}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecteer een Taak" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Geen Taak</SelectItem>
                            {tasks.map((task) => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
