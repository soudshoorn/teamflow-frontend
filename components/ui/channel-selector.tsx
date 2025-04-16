"use client";

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
import { Plus, Hash } from "lucide-react";
import {
  fetchChannels,
  createChannel,
  type Channel,
} from "@/lib/channel-service";

interface ChannelSelectorProps {
  selectedChannelId: number | string | null;
  onSelectChannel: (channelId: number | string) => void;
}

export function ChannelSelector({
  selectedChannelId,
  onSelectChannel,
}: ChannelSelectorProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");

  useEffect(() => {
    const loadChannels = async () => {
      setIsLoading(true);
      try {
        const data = await fetchChannels();
        setChannels(data);

        // Als er nog geen kanaal is geselecteerd, selecteer het eerste
        if (!selectedChannelId && data.length > 0) {
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
      onSelectChannel(newChannel.id);
    } catch (error) {
      console.error("Error adding channel:", error);
      alert("Er is een fout opgetreden bij het toevoegen van het kanaal.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Kanalen
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
          onClick={() => setShowAddDialog(true)}
          title="Nieuw kanaal"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
        {isLoading ? (
          <div className="py-3 px-4 text-sm text-gray-500 bg-gray-50 rounded-md animate-pulse">
            Kanalen laden...
          </div>
        ) : channels.length === 0 ? (
          <div className="py-4 px-4 text-sm text-gray-500 bg-gray-50 rounded-md border border-gray-100">
            <p className="mb-2">Geen kanalen gevonden.</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Kanaal aanmaken
            </Button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant={selectedChannelId === channel.id ? "subtle" : "ghost"}
                className={`w-full justify-start px-3 py-2 text-sm h-auto rounded-md transition-all ${
                  selectedChannelId === channel.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => onSelectChannel(channel.id)}
              >
                <Hash
                  className={`h-4 w-4 mr-2 flex-shrink-0 ${
                    selectedChannelId === channel.id
                      ? "text-blue-500"
                      : "text-gray-400"
                  }`}
                />
                <span className="truncate">{channel.name}</span>
              </Button>
            ))}
          </div>
        )}
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
