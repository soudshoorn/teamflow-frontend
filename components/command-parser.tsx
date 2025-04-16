"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEpic } from "@/lib/epic-service";
import { createUserStory } from "@/lib/user-story-service";
import { createTask } from "@/lib/task-service";

interface CommandParserProps {
  command: string;
  onClose: () => void;
  onSuccess: (result: CommandResult) => void;
  epics: any[];
  userStories: any[];
}

export interface CommandResult {
  type: "epic" | "story" | "task";
  id: string;
  title: string;
}

export function CommandParser({
  command,
  onClose,
  onSuccess,
  epics,
  userStories,
}: CommandParserProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedEpicId, setSelectedEpicId] = useState<string>("");
  const [selectedUserStoryId, setSelectedUserStoryId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse command to determine what we're creating
  const commandType = command.startsWith("/createepic")
    ? "epic"
    : command.startsWith("/createstory")
    ? "story"
    : command.startsWith("/createtask")
    ? "task"
    : null;

  // Extract parameters from command if provided
  React.useEffect(() => {
    const parts = command.split(" ");
    if (parts.length > 1) {
      // If there are quotes, extract the content between them
      const match = command.match(/"([^"]*)"/);
      if (match && match[1]) {
        setTitle(match[1]);
      } else {
        // Otherwise use everything after the command as title
        setTitle(parts.slice(1).join(" "));
      }
    }
  }, [command]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Titel is verplicht");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let result: CommandResult | null = null;

      if (commandType === "epic") {
        const newEpic = await createEpic({
          title,
          description,
        });
        result = {
          type: "epic",
          id: newEpic.id,
          title: newEpic.title,
        };
      } else if (commandType === "story") {
        if (!selectedEpicId) {
          setError("Selecteer een Epic");
          setIsSubmitting(false);
          return;
        }

        const newStory = await createUserStory({
          title,
          description,
          epicId: selectedEpicId,
        });
        result = {
          type: "story",
          id: newStory.id,
          title: newStory.title,
        };
      } else if (commandType === "task") {
        if (!selectedUserStoryId) {
          setError("Selecteer een User Story");
          setIsSubmitting(false);
          return;
        }

        const newTask = await createTask({
          title,
          description,
          userStoryId: selectedUserStoryId,
        });
        result = {
          type: "task",
          id: newTask.id,
          title: newTask.title,
        };
      }

      if (result) {
        onSuccess(result);
      }
    } catch (error) {
      console.error("Error creating item:", error);
      setError("Er is een fout opgetreden. Probeer het opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDialogTitle = () => {
    switch (commandType) {
      case "epic":
        return "Nieuwe Epic aanmaken";
      case "story":
        return "Nieuwe User Story aanmaken";
      case "task":
        return "Nieuwe Taak aanmaken";
      default:
        return "Onbekend commando";
    }
  };

  if (!commandType) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Onbekend commando</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-red-600">
              Het commando "{command}" wordt niet herkend.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Sluiten</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Titel
            </label>
            <Input
              placeholder="Voer een titel in"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Beschrijving
            </label>
            <Textarea
              placeholder="Voer een beschrijving in"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {commandType === "story" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Epic
              </label>
              <Select value={selectedEpicId} onValueChange={setSelectedEpicId}>
                <SelectTrigger className="w-full border-gray-300 focus:ring-blue-500">
                  <SelectValue placeholder="Selecteer een Epic" />
                </SelectTrigger>
                <SelectContent>
                  {epics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id}>
                      {epic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {commandType === "task" && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                User Story
              </label>
              <Select
                value={selectedUserStoryId}
                onValueChange={setSelectedUserStoryId}
              >
                <SelectTrigger className="w-full border-gray-300 focus:ring-blue-500">
                  <SelectValue placeholder="Selecteer een User Story" />
                </SelectTrigger>
                <SelectContent>
                  {userStories.map((story) => (
                    <SelectItem key={story.id} value={story.id}>
                      {story.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuleren
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? "Aanmaken..." : "Aanmaken"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
