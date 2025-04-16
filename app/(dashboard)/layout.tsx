"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [username, setUsername] = useState<string>("");
  const [selectedChannelId, setSelectedChannelId] = useState<
    number | string | null
  >(null);
  const isMobile = useMobile();
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("teamflow-user");
    const storedUserId = localStorage.getItem("teamflow-user-id");

    if (!storedUsername || !storedUserId) {
      router.push("/");
      return;
    }

    setUsername(storedUsername);
  }, [router]);

  // Functie om het geselecteerde kanaal door te geven aan de chat pagina
  const handleSelectChannel = (channelId: number | string) => {
    setSelectedChannelId(channelId);
    // Navigeer naar de chat pagina met het geselecteerde kanaal
    router.push(`/chat?channel=${channelId}`);
  };

  if (!username) {
    return null; // Don't render anything until we check authentication
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <div className="w-64 h-full shadow-lg z-10">
          <AppSidebar
            username={username}
            selectedChannelId={selectedChannelId}
            onSelectChannel={handleSelectChannel}
          />
        </div>
      )}

      {/* Sidebar - Mobile */}
      {isMobile && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 z-50 bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <AppSidebar
              username={username}
              selectedChannelId={selectedChannelId}
              onSelectChannel={handleSelectChannel}
              isMobile={true}
              onClose={() => document.body.click()} // Hack to close the sheet
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        {children}
      </div>
    </div>
  );
}
