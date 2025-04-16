"use client";

import { useEffect, useState } from "react";
import {
  fetchUserStories,
  createUserStory,
  updateUserStory,
  deleteUserStory,
} from "@/lib/user-story-service";
import { fetchEpics } from "@/lib/epic-service";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface UserStory {
  id: string;
  title: string;
  description?: string;
  epicId?: string;
  epic?: { id: string; title?: string };
}

interface Epic {
  id: string;
  title: string;
  description?: string;
}

export default function ManageUserStoriesPage() {
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUserStory, setCurrentUserStory] = useState<UserStory | null>(
    null
  );
  const [newUserStoryTitle, setNewUserStoryTitle] = useState("");
  const [newUserStoryDescription, setNewUserStoryDescription] = useState("");
  const [selectedEpicId, setSelectedEpicId] = useState<string>("");

  // Fetch data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userStoriesData, epicsData] = await Promise.all([
        fetchUserStories(),
        fetchEpics(),
      ]);

      // Log de data voor debugging
      console.log("Loaded user stories:", userStoriesData);
      console.log("Loaded epics:", epicsData);

      setUserStories(userStoriesData);
      setEpics(epicsData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Er is een fout opgetreden bij het laden van de data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUserStory = async () => {
    if (!newUserStoryTitle.trim() || !selectedEpicId) {
      console.error("Cannot add user story: missing title or epicId");
      return;
    }

    try {
      // Controleer of de epicId geldig is
      const epicExists = epics.some((epic) => epic.id === selectedEpicId);
      if (!epicExists) {
        console.error(
          `Selected epic ID ${selectedEpicId} does not exist in available epics:`,
          epics
        );
        alert(
          "De geselecteerde epic bestaat niet. Vernieuw de pagina en probeer opnieuw."
        );
        return;
      }

      console.log("Creating user story with data:", {
        title: newUserStoryTitle,
        description: newUserStoryDescription,
        epicId: selectedEpicId,
      });

      const newUserStory = await createUserStory({
        title: newUserStoryTitle,
        description: newUserStoryDescription,
        epicId: selectedEpicId,
      });

      console.log("Created user story:", newUserStory);

      // Controleer of de epicId correct is teruggekomen
      if (!newUserStory.epicId) {
        console.warn("Created user story has no epicId in response");
      }

      setUserStories((prev) => [...prev, newUserStory]);
      setNewUserStoryTitle("");
      setNewUserStoryDescription("");
      setSelectedEpicId("");
      setShowAddDialog(false);

      // Vernieuw de data om te controleren of alles correct is opgeslagen
      setTimeout(loadData, 500);
    } catch (error) {
      console.error("Error adding user story:", error);
      alert("Er is een fout opgetreden bij het toevoegen van de user story.");
    }
  };

  const handleEditUserStory = async () => {
    if (!currentUserStory || !newUserStoryTitle.trim() || !selectedEpicId) {
      console.error("Cannot update user story: missing data", {
        currentUserStory,
        newUserStoryTitle,
        selectedEpicId,
      });
      return;
    }

    try {
      console.log("Updating user story with epicId:", selectedEpicId);

      const updatedUserStory = await updateUserStory(currentUserStory.id, {
        title: newUserStoryTitle,
        description: newUserStoryDescription,
        epicId: selectedEpicId,
      });

      console.log("Updated user story:", updatedUserStory);

      // Controleer of de epicId correct is teruggekomen
      if (!updatedUserStory.epicId) {
        console.warn("Updated user story has no epicId in response");
      }

      setUserStories(
        userStories.map((story) =>
          story.id === updatedUserStory.id ? updatedUserStory : story
        )
      );
      setShowEditDialog(false);

      // Vernieuw de data om te controleren of alles correct is opgeslagen
      setTimeout(loadData, 500);
    } catch (error) {
      console.error("Error updating user story:", error);
      alert("Er is een fout opgetreden bij het bijwerken van de user story.");
    }
  };

  const handleDeleteUserStory = async () => {
    if (!currentUserStory) return;

    try {
      await deleteUserStory(currentUserStory.id);
      setUserStories(
        userStories.filter((story) => story.id !== currentUserStory.id)
      );
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting user story:", error);
      alert("Er is een fout opgetreden bij het verwijderen van de user story.");
    }
  };

  const openEditDialog = (userStory: UserStory) => {
    setCurrentUserStory(userStory);
    setNewUserStoryTitle(userStory.title);
    setNewUserStoryDescription(userStory.description || "");
    setSelectedEpicId(userStory.epicId || "");
    setShowEditDialog(true);
  };

  const openDeleteDialog = (userStory: UserStory) => {
    setCurrentUserStory(userStory);
    setShowDeleteDialog(true);
  };

  const getEpicTitle = (epicId: string) => {
    if (!epicId) return "Geen Epic";
    const epic = epics.find((epic) => epic.id === epicId);
    return epic?.title || "Onbekende Epic";
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Stories beheren</h1>
        <Button
          onClick={() => {
            setNewUserStoryTitle("");
            setNewUserStoryDescription("");
            setSelectedEpicId("");
            setShowAddDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe User Story
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Data laden...</p>
        </div>
      ) : userStories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">
            Er zijn nog geen user stories aangemaakt.
          </p>
          <Button
            onClick={() => {
              setNewUserStoryTitle("");
              setNewUserStoryDescription("");
              setSelectedEpicId("");
              setShowAddDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Eerste User Story aanmaken
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Beschrijving</TableHead>
                <TableHead>Epic</TableHead>
                <TableHead className="w-[100px]">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userStories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell className="font-medium">{story.title}</TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {story.description || "-"}
                  </TableCell>
                  <TableCell>{getEpicTitle(story.epicId || "")}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(story)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(story)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add User Story Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe User Story toevoegen</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <Input
                placeholder="User Story titel"
                value={newUserStoryTitle}
                onChange={(e) => setNewUserStoryTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Beschrijving
              </label>
              <Textarea
                placeholder="User Story beschrijving"
                value={newUserStoryDescription}
                onChange={(e) => setNewUserStoryDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Epic</label>
              <Select value={selectedEpicId} onValueChange={setSelectedEpicId}>
                <SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuleren
            </Button>
            <Button
              onClick={handleAddUserStory}
              disabled={!newUserStoryTitle || !selectedEpicId}
            >
              Toevoegen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Story Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Story bewerken</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <Input
                placeholder="User Story titel"
                value={newUserStoryTitle}
                onChange={(e) => setNewUserStoryTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Beschrijving
              </label>
              <Textarea
                placeholder="User Story beschrijving"
                value={newUserStoryDescription}
                onChange={(e) => setNewUserStoryDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Epic</label>
              <Select value={selectedEpicId} onValueChange={setSelectedEpicId}>
                <SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuleren
            </Button>
            <Button
              onClick={handleEditUserStory}
              disabled={!newUserStoryTitle || !selectedEpicId}
            >
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Story Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>User Story verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je de user story "{currentUserStory?.title}"
              wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUserStory}
              className="bg-red-600 hover:bg-red-700"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
