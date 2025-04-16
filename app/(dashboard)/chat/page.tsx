"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Hash,
  Send,
} from "lucide-react";
import {
  fetchMessages,
  sendMessage,
  type FrontendMessage,
} from "@/lib/message-service";
import { fetchEpics } from "@/lib/epic-service";
import { fetchUserStories } from "@/lib/user-story-service";
import { fetchTasks } from "@/lib/task-service";
import { fetchChannels, type Channel } from "@/lib/channel-service";
import { MessageItem } from "@/components/message-item";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CommandMenu } from "@/components/command-menu";
import { CommandParser, type CommandResult } from "@/components/command-parser";

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
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<FrontendMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [selectedEpicId, setSelectedEpicId] = useState<string>("none");
  const [selectedUserStoryId, setSelectedUserStoryId] =
    useState<string>("none");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("none");
  const [selectedChannelId, setSelectedChannelId] = useState<
    number | string | null
  >(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [isChannelLoading, setIsChannelLoading] = useState(false);

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

  // Haal het kanaal ID uit de URL parameters
  useEffect(() => {
    const channelParam = searchParams.get("channel");
    if (channelParam) {
      setSelectedChannelId(channelParam);
      console.log("Channel ID from URL:", channelParam);
    }
  }, [searchParams]);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [epicsData, userStoriesData, tasksData, channelsData] =
          await Promise.all([
            fetchEpics(),
            fetchUserStories(),
            fetchTasks(),
            fetchChannels(),
          ]);
        setEpics(epicsData);
        setUserStories(userStoriesData);
        setTasks(tasksData);
        setChannels(channelsData);

        // Als er nog geen kanaal is geselecteerd, selecteer het eerste
        if (channelsData.length > 0 && !selectedChannelId) {
          setSelectedChannelId(channelsData[0].id);
        }
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
  }, [username, userId, selectedChannelId]);

  // Fetch messages when channel changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChannelId) return;

      setIsChannelLoading(true);
      try {
        const messagesData = await fetchMessages(selectedChannelId);
        setMessages(messagesData);

        // Debug log voor berichten en gebruikersnamen
        console.log(
          "Loaded messages for channel:",
          selectedChannelId,
          messagesData.map((msg) => ({
            id: msg.id,
            username: msg.username,
            isCurrentUser:
              msg.username.toLowerCase() === username.toLowerCase(),
          }))
        );
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsChannelLoading(false);
        // Scroll naar beneden na het laden van berichten
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    if (username && userId && selectedChannelId) {
      loadMessages();
    }
  }, [selectedChannelId, username, userId]);

  // Voeg deze functie toe om de berichten periodiek te verversen
  useEffect(() => {
    // Functie om berichten te laden
    const loadMessages = async () => {
      if (!selectedChannelId) return;

      try {
        const messagesData = await fetchMessages(selectedChannelId);
        setMessages(messagesData);
        // Scroll naar beneden na het verversen van berichten als we al onderaan waren
        const messagesContainer = document.querySelector(".messages-container");
        if (messagesContainer) {
          const isAtBottom =
            messagesContainer.scrollHeight - messagesContainer.scrollTop <=
            messagesContainer.clientHeight + 100;
          if (isAtBottom) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        }
      } catch (error) {
        console.error("Error refreshing messages:", error);
      }
    };

    // Stel een interval in om berichten elke 10 seconden te verversen
    const intervalId = setInterval(() => {
      if (username && userId && selectedChannelId) {
        loadMessages();
      }
    }, 10000);

    // Ruim het interval op bij unmount
    return () => clearInterval(intervalId);
  }, [selectedChannelId, username, userId]);

  // Scroll to bottom when messages change or when a new message is sent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check for command input
  useEffect(() => {
    if (messageText.startsWith("/")) {
      setShowCommandMenu(true);
    } else {
      setShowCommandMenu(false);
    }
  }, [messageText]);

  const handleSendMessage = async () => {
    if (messageText.trim() === "" || !username || !selectedChannelId) return;

    const newMessage: Omit<FrontendMessage, "id"> = {
      content: messageText,
      username,
      timestamp: Date.now(),
      channelId: selectedChannelId,
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

      // Scroll naar beneden na het versturen van een bericht
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      alert(
        "Er is een fout opgetreden bij het versturen van je bericht. Probeer het opnieuw."
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If command menu is open, don't send on Enter
    if (showCommandMenu) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Wijzig de handleCommandSelect functie om de nieuwe commando's te ondersteunen
  const handleCommandSelect = (command: any) => {
    setShowCommandMenu(false);

    // Als het een item is dat moet worden toegevoegd aan het bericht
    if (command.itemId) {
      if (command.command === "/addepic") {
        setSelectedEpicId(command.itemId);
        // Zet de cursor terug in het tekstveld
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
        // Verwijder het commando uit het tekstveld
        setMessageText(messageText.split("/addepic")[0].trim());
      } else if (command.command === "/addstory") {
        setSelectedUserStoryId(command.itemId);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
        setMessageText(messageText.split("/addstory")[0].trim());
      } else if (command.command === "/addtask") {
        setSelectedTaskId(command.itemId);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
        setMessageText(messageText.split("/addtask")[0].trim());
      }
    }
    // Als het een directe actie commando is (create commando's)
    else if (command.directAction) {
      // Open direct het modale venster voor het aanmaken van een item
      setActiveCommand(command.command);
      // Verwijder het commando uit het tekstveld
      setMessageText("");
    }

    // Focus back on textarea after selecting command
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCommandSuccess = (result: CommandResult) => {
    setActiveCommand(null);

    // Set the appropriate ID based on the type of item created
    if (result.type === "epic") {
      setSelectedEpicId(result.id);
    } else if (result.type === "story") {
      setSelectedUserStoryId(result.id);
    } else if (result.type === "task") {
      setSelectedTaskId(result.id);
    }

    // Update the message text to include what was created
    setMessageText(
      `${
        result.type === "epic"
          ? "Epic"
          : result.type === "story"
          ? "User Story"
          : "Taak"
      } aangemaakt: ${result.title}`
    );

    // Refresh the data
    fetchEpics().then(setEpics);
    fetchUserStories().then(setUserStories);
    fetchTasks().then(setTasks);

    // Focus back on textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Helper functions to get title by id
  const getEpicTitle = (id: string) =>
    epics.find((e) => e.id === id)?.title || "";
  const getUserStoryTitle = (id: string) =>
    userStories.find((us) => us.id === id)?.title || "";
  const getTaskTitle = (id: string) =>
    tasks.find((t) => t.id === id)?.title || "";

  // Functie om de kanaalnaam op te halen
  const getChannelName = (id: number | string | null) => {
    if (!id || !channels || channels.length === 0) return "Kanaal";

    // Zorg ervoor dat we string met string vergelijken
    const stringId = String(id);
    const channel = channels.find((c) => String(c.id) === stringId);

    return channel?.name || "Kanaal";
  };

  // Functie om te controleren of een bericht van de huidige gebruiker is
  const isCurrentUserMessage = (messageUsername: string) => {
    // Case-insensitive vergelijking
    return messageUsername.toLowerCase() === username.toLowerCase();
  };

  // Handle message updates
  const handleMessageUpdated = (updatedMessage: FrontendMessage) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === updatedMessage.id
          ? {
              ...msg,
              content: updatedMessage.content,
              // Behoud de gekoppelde items
              epicId: updatedMessage.epicId || msg.epicId,
              userStoryId: updatedMessage.userStoryId || msg.userStoryId,
              taskId: updatedMessage.taskId || msg.taskId,
            }
          : msg
      )
    );
  };

  // Handle message deletion
  const handleMessageDeleted = (messageId: number) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
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
    <div className="container max-w-4xl mx-auto p-4 flex-1 flex flex-col h-[calc(100vh-2rem)]">
      <Card className="flex-1 flex flex-col overflow-hidden shadow-lg border-gray-200 bg-white bg-opacity-95 backdrop-blur-sm h-[calc(100vh-10rem)]">
        <CardHeader className="border-b bg-gradient-to-r from-white to-blue-50 py-3 px-4 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center">
            <CardTitle className="text-lg font-semibold flex items-center">
              {selectedChannelId ? (
                <div className="flex items-center">
                  <Hash className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="text-gray-800">
                    {getChannelName(selectedChannelId)}
                  </span>
                </div>
              ) : (
                "TeamFlow Chat"
              )}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-gray-50 messages-container">
          {isChannelLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-pulse flex flex-col space-y-4 w-full max-w-md">
                <div className="h-12 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-12 bg-gray-200 rounded-md w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded-md w-5/6"></div>
              </div>
            </div>
          ) : !selectedChannelId ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <Hash className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Geen kanaal geselecteerd
              </h3>
              <p className="text-gray-500 max-w-md">
                Selecteer een kanaal in de zijbalk om berichten te bekijken of
                maak een nieuw kanaal aan.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <MessageIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Geen berichten
              </h3>
              <p className="text-gray-500 max-w-md">
                Dit kanaal heeft nog geen berichten. Stuur het eerste bericht om
                de conversatie te starten!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  epics={epics}
                  userStories={userStories}
                  tasks={tasks}
                  isCurrentUser={isCurrentUserMessage(msg.username)}
                  onMessageUpdated={handleMessageUpdated}
                  onMessageDeleted={handleMessageDeleted}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 bg-white rounded-lg shadow-lg border border-gray-200 shrink-0">
        {/* Selected Items Display - Compact view above textarea */}
        {hasSelectedItems && (
          <div className="px-4 pt-3 pb-1 border-b border-gray-100 flex flex-wrap gap-2">
            {selectedEpicId !== "none" && (
              <Badge
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1 py-1 px-2"
              >
                <Layers className="h-3 w-3" />
                <span className="mr-1">{getEpicTitle(selectedEpicId)}</span>
                <button
                  onClick={() => setSelectedEpicId("none")}
                  className="h-4 w-4 rounded-full hover:bg-purple-100 flex items-center justify-center"
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
                  className="h-4 w-4 rounded-full hover:bg-blue-100 flex items-center justify-center"
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
                  className="h-4 w-4 rounded-full hover:bg-green-100 flex items-center justify-center"
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
              {/* Command menu - Verplaatst naar boven het textarea */}
              {showCommandMenu && (
                <div className="absolute bottom-full left-0 w-full mb-2 z-10">
                  <CommandMenu
                    isOpen={showCommandMenu}
                    searchTerm={messageText}
                    onSelect={handleCommandSelect}
                    onClose={() => setShowCommandMenu(false)}
                    epics={epics}
                    userStories={userStories}
                    tasks={tasks}
                  />
                </div>
              )}

              <Textarea
                ref={textareaRef}
                placeholder={
                  selectedChannelId
                    ? "Typ hier je bericht... (Tip: begin met / voor commando's)"
                    : "Selecteer eerst een kanaal om een bericht te sturen..."
                }
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[100px] pr-12 resize-none border-gray-200 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md"
                disabled={!selectedChannelId}
              />

              <div className="absolute bottom-2 right-2 flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full h-8 w-8"
                  onClick={() => setIsLinkingOpen(!isLinkingOpen)}
                  title="Koppel aan Scrum items"
                  disabled={!selectedChannelId}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full h-8 w-8"
                  onClick={handleSendMessage}
                  title="Verstuur bericht"
                  disabled={!selectedChannelId || !messageText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Collapsible
              open={isLinkingOpen}
              onOpenChange={setIsLinkingOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                  disabled={!selectedChannelId}
                >
                  {isLinkingOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">
                    Koppel aan Scrum items
                  </span>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3 space-y-3 bg-gradient-to-b from-gray-50 to-blue-50 p-3 rounded-md border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Epic Selector */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Epic
                    </label>
                    <Select
                      value={selectedEpicId}
                      onValueChange={setSelectedEpicId}
                    >
                      <SelectTrigger className="w-full border-gray-200 focus:ring-blue-500">
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      User Story
                    </label>
                    <Select
                      value={selectedUserStoryId}
                      onValueChange={setSelectedUserStoryId}
                    >
                      <SelectTrigger className="w-full border-gray-200 focus:ring-blue-500">
                        <SelectValue placeholder="Selecteer een User Story" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Geen User Story</SelectItem>
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Taak
                    </label>
                    <Select
                      value={selectedTaskId}
                      onValueChange={setSelectedTaskId}
                    >
                      <SelectTrigger className="w-full border-gray-200 focus:ring-blue-500">
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

      {/* Command Parser Dialog */}
      {activeCommand && (
        <CommandParser
          command={activeCommand}
          onClose={() => setActiveCommand(null)}
          onSuccess={handleCommandSuccess}
          epics={epics}
          userStories={userStories}
        />
      )}
    </div>
  );
}

// Message icon component
function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
