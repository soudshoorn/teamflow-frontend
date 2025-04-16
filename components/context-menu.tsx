"use client";

import { useState, useEffect, useRef } from "react";
import { Edit, Trash2, X } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ContextMenu({
  x,
  y,
  onEdit,
  onDelete,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  // Adjust position if menu would go off screen
  useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      // Zorg ervoor dat het menu niet buiten het scherm valt
      if (x + menuRect.width > windowWidth) {
        adjustedX = windowWidth - menuRect.width - 10;
      }

      if (y + menuRect.height > windowHeight) {
        adjustedY = windowHeight - menuRect.height - 10;
      }

      // Zorg ervoor dat het menu niet buiten het scherm valt aan de linkerkant
      if (adjustedX < 0) {
        adjustedX = 10;
      }

      // Zorg ervoor dat het menu niet buiten het scherm valt aan de bovenkant
      if (adjustedY < 0) {
        adjustedY = 10;
      }

      console.log("Menu positie aangepast:", { x, y }, "naar", {
        adjustedX,
        adjustedY,
      });
      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  // Voeg een console.log toe om te bevestigen dat het menu wordt weergegeven
  useEffect(() => {
    console.log("ContextMenu gerenderd op positie:", position);
  }, [position]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Close menu when pressing escape
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-md shadow-lg border border-blue-300 py-1 w-48"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div className="flex justify-between items-center px-3 py-1 border-b border-gray-100">
        <span className="text-xs font-medium text-gray-500">Berichtopties</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-3 w-3" />
        </button>
      </div>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-blue-50 hover:text-blue-600"
        onClick={onEdit}
      >
        <Edit className="h-4 w-4 mr-2" />
        Bewerken
      </button>
      <button
        className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-red-50 hover:text-red-600"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Verwijderen
      </button>
    </div>
  );
}
