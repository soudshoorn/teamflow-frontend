"use client";

import { useState, useEffect, useRef } from "react";
import {
  Command,
  type LucideIcon,
  ClipboardList,
  Layers,
  ListTodo,
} from "lucide-react";

// Wijzig de CommandOption interface om zoekresultaten te ondersteunen
interface CommandOption {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  command: string;
  params: string[];
  itemId?: string; // Voor bestaande items
  directAction?: boolean; // Voor commando's die direct actie uitvoeren
}

interface CommandMenuProps {
  isOpen: boolean;
  searchTerm: string;
  onSelect: (command: CommandOption) => void;
  onClose: () => void;
  epics: any[]; // Voeg deze props toe
  userStories: any[];
  tasks: any[];
}

export function CommandMenu({
  isOpen,
  searchTerm,
  onSelect,
  onClose,
  epics,
  userStories,
  tasks,
}: CommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [filteredCommands, setFilteredCommands] = useState<CommandOption[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Available commands
  const baseCommands: CommandOption[] = [
    {
      id: "createepic",
      name: "Epic aanmaken",
      description: "Maak een nieuwe epic aan",
      icon: Layers,
      command: "/createepic",
      params: [],
      directAction: true,
    },
    {
      id: "createstory",
      name: "User Story aanmaken",
      description: "Maak een nieuwe user story aan",
      icon: ClipboardList,
      command: "/createstory",
      params: [],
      directAction: true,
    },
    {
      id: "createtask",
      name: "Taak aanmaken",
      description: "Maak een nieuwe taak aan",
      icon: ListTodo,
      command: "/createtask",
      params: [],
      directAction: true,
    },
    {
      id: "addepic",
      name: "Epic koppelen",
      description: "Koppel een bestaande epic aan je bericht",
      icon: Layers,
      command: "/addepic",
      params: ["zoekterm"],
    },
    {
      id: "addstory",
      name: "User Story koppelen",
      description: "Koppel een bestaande user story aan je bericht",
      icon: ClipboardList,
      command: "/addstory",
      params: ["zoekterm"],
    },
    {
      id: "addtask",
      name: "Taak koppelen",
      description: "Koppel een bestaande taak aan je bericht",
      icon: ListTodo,
      command: "/addtask",
      params: ["zoekterm"],
    },
  ];

  // Filter commands based on search term
  useEffect(() => {
    const fullCommand = searchTerm.split(" ")[0].toLowerCase();
    const searchQuery = searchTerm.split(" ").slice(1).join(" ").toLowerCase();

    let filtered: CommandOption[] = [];

    // Als er nog geen specifiek commando is getypt of als het een kort commando is
    if (!searchTerm.includes(" ") || searchTerm.trim() === "/") {
      // Filter de basis commando's op basis van wat er is getypt
      const term = searchTerm.replace("/", "").toLowerCase();
      filtered = baseCommands.filter(
        (cmd) =>
          cmd.command.toLowerCase().includes(term) ||
          cmd.name.toLowerCase().includes(term) ||
          cmd.description.toLowerCase().includes(term)
      );
    }
    // Als er een zoekterm is na het commando, zoek in de relevante items
    else if (searchQuery) {
      if (fullCommand === "/addepic") {
        // Zoek in epics
        filtered = epics
          .filter((epic) => epic.title.toLowerCase().includes(searchQuery))
          .map((epic) => ({
            id: `epic-${epic.id}`,
            name: epic.title,
            description: epic.description || "Geen beschrijving",
            icon: Layers,
            command: "/addepic",
            params: [],
            itemId: epic.id,
          }));
      } else if (fullCommand === "/addstory") {
        // Zoek in user stories
        filtered = userStories
          .filter((story) => story.title.toLowerCase().includes(searchQuery))
          .map((story) => ({
            id: `story-${story.id}`,
            name: story.title,
            description: story.description || "Geen beschrijving",
            icon: ClipboardList,
            command: "/addstory",
            params: [],
            itemId: story.id,
          }));
      } else if (fullCommand === "/addtask") {
        // Zoek in taken
        filtered = tasks
          .filter((task) => task.title.toLowerCase().includes(searchQuery))
          .map((task) => ({
            id: `task-${task.id}`,
            name: task.title,
            description: task.description || "Geen beschrijving",
            icon: ListTodo,
            command: "/addtask",
            params: [],
            itemId: task.id,
          }));
      } else {
        // Voor andere commando's, toon het commando zelf
        filtered = baseCommands.filter((cmd) => cmd.command === fullCommand);
      }
    } else {
      // Als er een commando is maar geen zoekterm, toon alleen dat commando
      filtered = baseCommands.filter((cmd) => cmd.command === fullCommand);
    }

    setFilteredCommands(filtered);
    setActiveIndex(0);
  }, [searchTerm, epics, userStories, tasks]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[activeIndex]) {
            onSelect(filteredCommands[activeIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, filteredCommands, activeIndex, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-10"
    >
      <div className="p-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <Command className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Commando's</span>
        </div>
      </div>
      {filteredCommands.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">
          Geen resultaten gevonden
        </div>
      ) : (
        <div className="py-1">
          {filteredCommands.map((command, index) => {
            const Icon = command.icon;
            return (
              <button
                key={command.id}
                className={`flex items-start w-full px-3 py-2 text-left hover:bg-blue-50 ${
                  index === activeIndex ? "bg-blue-50" : ""
                }`}
                onClick={() => onSelect(command)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-gray-500" />
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium">{command.name}</div>
                  <div className="text-xs text-gray-500">
                    {command.description}
                  </div>
                  {!command.itemId &&
                    !command.directAction &&
                    command.params.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        <span className="font-mono">{command.command}</span>
                        <span className="ml-1">
                          {command.params.map((param) => (
                            <span key={param} className="mx-0.5">
                              {param.endsWith("?")
                                ? `[${param.slice(0, -1)}]`
                                : `<${param}>`}
                            </span>
                          ))}
                        </span>
                      </div>
                    )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
