"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Layers,
  ClipboardList,
  ListTodo,
  LogOut,
  Hash,
  Plus,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  User,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  fetchChannels,
  createChannel,
  type Channel,
} from "@/lib/channel-service";

interface AppSidebarProps {
  username: string;
  selectedChannelId?: number | string | null;
  onSelectChannel?: (channelId: number | string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export function AppSidebar({
  username,
  selectedChannelId,
  onSelectChannel,
  isMobile = false,
  onClose,
}: AppSidebarProps) {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [isChannelsOpen, setIsChannelsOpen] = useState(true);

  // Get user initial for avatar
  const userInitial = username ? username.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    const loadChannels = async () => {
      setIsLoading(true);
      try {
        const data = await fetchChannels();
        setChannels(data);

        // Als er nog geen kanaal is geselecteerd, selecteer het eerste
        if (onSelectChannel && !selectedChannelId && data.length > 0) {
          onSelectChannel(data[0].id);
        }
      } catch (error) {
        console.error("Error loading channels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChannels();
  }, [selectedChannelId, onSelectChannel]);

  const handleAddChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      const newChannel = await createChannel({
        name: newChannelName,
        description: newChannelDescription,
      });

      setChannels([...channels, newChannel]);
      setNewChannelName("");
      setNewChannelDescription("");
      setShowAddDialog(false);

      // Selecteer het nieuwe kanaal
      if (onSelectChannel) {
        onSelectChannel(newChannel.id);
      }
    } catch (error) {
      console.error("Error adding channel:", error);
      alert("Er is een fout opgetreden bij het toevoegen van het kanaal.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teamflow-user");
    localStorage.removeItem("teamflow-user-id");
    router.push("/");
  };

  const navigateTo = (path: string) => {
    router.push(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Zorg ervoor dat de kanaal selectie functie correct wordt doorgegeven
  // Wijzig de handleChannelSelect functie om te zorgen dat deze altijd werkt
  const handleChannelSelect = (channelId: number | string) => {
    if (onSelectChannel) {
      onSelectChannel(channelId);
    }
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-700 via-blue-600 to-blue-700 text-white">
      {/* Logo and App Name */}
      <div className="p-4 flex items-center">
        <div className="bg-white rounded-lg p-1.5 mr-3 shadow-md">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L4 6V18L12 22L20 18V6L12 2Z" fill="#3B82F6" />
            <path d="M12 6L8 8V16L12 18L16 16V8L12 6Z" fill="white" />
            <path d="M12 10L10 11V13L12 14L14 13V11L12 10Z" fill="#3B82F6" />
          </svg>
        </div>
        <h1 className="text-xl font-bold">TeamFlow</h1>
      </div>

      {/* Navigation */}
      <div className="px-2 py-2">
        <h3 className="px-4 text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
          Navigatie
        </h3>
        <nav className="space-y-1">
          <Button
            variant="ghost"
            className={`w-full justify-start text-blue-100 hover:text-white hover:bg-blue-600 ${
              router.pathname === "/chat" ? "bg-blue-600 text-white" : ""
            }`}
            onClick={() => navigateTo("/chat")}
          >
            <MessageSquare className="h-4 w-4 mr-3" />
            Chat
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start text-blue-100 hover:text-white hover:bg-blue-600 ${
              router.pathname === "/manage/epics"
                ? "bg-blue-600 text-white"
                : ""
            }`}
            onClick={() => navigateTo("/manage/epics")}
          >
            <Layers className="h-4 w-4 mr-3" />
            Epics
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start text-blue-100 hover:text-white hover:bg-blue-600 ${
              router.pathname === "/manage/user-stories"
                ? "bg-blue-600 text-white"
                : ""
            }`}
            onClick={() => navigateTo("/manage/user-stories")}
          >
            <ClipboardList className="h-4 w-4 mr-3" />
            User Stories
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start text-blue-100 hover:text-white hover:bg-blue-600 ${
              router.pathname === "/manage/tasks"
                ? "bg-blue-600 text-white"
                : ""
            }`}
            onClick={() => navigateTo("/manage/tasks")}
          >
            <ListTodo className="h-4 w-4 mr-3" />
            Taken
          </Button>
        </nav>
      </div>

      <Separator className="my-3 bg-blue-500" />

      {/* Channels */}
      <div className="px-2 py-2 flex-1 overflow-hidden flex flex-col">
        <Collapsible
          open={isChannelsOpen}
          onOpenChange={setIsChannelsOpen}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between px-2 mb-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                {isChannelsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider flex-1">
              Kanalen
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-blue-600"
              onClick={() => setShowAddDialog(true)}
              title="Nieuw kanaal"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <CollapsibleContent className="flex-1 overflow-hidden">
            <div className="overflow-y-auto max-h-full pr-1 space-y-0.5">
              {isLoading ? (
                <div className="py-3 px-4 text-sm text-blue-200 animate-pulse">
                  Kanalen laden...
                </div>
              ) : channels.length === 0 ? (
                <div className="py-4 px-4 text-sm text-blue-200">
                  <p className="mb-2">Geen kanalen gevonden.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs bg-blue-600 hover:bg-blue-500 border-blue-500 text-white"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Kanaal aanmaken
                  </Button>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {channels.map((channel) => (
                    <div key={channel.id} className="h-10">
                      <Button
                        variant="ghost"
                        className={`w-full justify-start px-3 py-2 text-sm h-10 rounded-md transition-all ${
                          selectedChannelId === channel.id
                            ? "bg-blue-600 text-white font-medium"
                            : "text-blue-100 hover:bg-blue-600 hover:text-white"
                        }`}
                        onClick={() => handleChannelSelect(channel.id)}
                      >
                        <Hash
                          className={`h-4 w-4 mr-2 flex-shrink-0 ${
                            selectedChannelId === channel.id
                              ? "text-blue-200"
                              : "text-blue-300"
                          }`}
                        />
                        <span className="truncate">{channel.name}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* User and Logout */}
      <div className="mt-auto border-t border-blue-500 pt-2 pb-3 px-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-blue-100">
              {username}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-blue-200 hover:text-white hover:bg-blue-800"
            onClick={handleLogout}
            title="Uitloggen"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add Channel Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Nieuw kanaal aanmaken
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Naam
              </label>
              <Input
                placeholder="Kanaalnaam"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Beschrijving
              </label>
              <Textarea
                placeholder="Beschrijving van het kanaal"
                value={newChannelDescription}
                onChange={(e) => setNewChannelDescription(e.target.value)}
                rows={3}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuleren
            </Button>
            <Button
              onClick={handleAddChannel}
              disabled={!newChannelName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Aanmaken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
