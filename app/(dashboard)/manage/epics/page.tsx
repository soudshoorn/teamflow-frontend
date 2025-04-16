"use client";

import { useEffect, useState } from "react";
import {
  fetchEpics,
  createEpic,
  updateEpic,
  deleteEpic,
} from "@/lib/epic-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface Epic {
  id: string;
  title: string;
  description?: string;
}

export default function ManageEpicsPage() {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentEpic, setCurrentEpic] = useState<Epic | null>(null);
  const [newEpicTitle, setNewEpicTitle] = useState("");
  const [newEpicDescription, setNewEpicDescription] = useState("");

  // Fetch epics
  useEffect(() => {
    loadEpics();
  }, []);

  const loadEpics = async () => {
    setIsLoading(true);
    try {
      const data = await fetchEpics();
      setEpics(data);
    } catch (error) {
      console.error("Error loading epics:", error);
      alert("Er is een fout opgetreden bij het laden van de epics.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEpic = async () => {
    if (!newEpicTitle.trim()) return;

    try {
      const newEpic = await createEpic({
        title: newEpicTitle,
        description: newEpicDescription,
      });
      setEpics([...epics, newEpic]);
      setNewEpicTitle("");
      setNewEpicDescription("");
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding epic:", error);
      alert("Er is een fout opgetreden bij het toevoegen van de epic.");
    }
  };

  const handleEditEpic = async () => {
    if (!currentEpic || !newEpicTitle.trim()) return;

    try {
      const updatedEpic = await updateEpic(currentEpic.id, {
        title: newEpicTitle,
        description: newEpicDescription,
      });
      setEpics(
        epics.map((epic) => (epic.id === updatedEpic.id ? updatedEpic : epic))
      );
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error updating epic:", error);
      alert("Er is een fout opgetreden bij het bijwerken van de epic.");
    }
  };

  const handleDeleteEpic = async () => {
    if (!currentEpic) return;

    try {
      await deleteEpic(currentEpic.id);
      setEpics(epics.filter((epic) => epic.id !== currentEpic.id));
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting epic:", error);
      alert("Er is een fout opgetreden bij het verwijderen van de epic.");
    }
  };

  const openEditDialog = (epic: Epic) => {
    setCurrentEpic(epic);
    setNewEpicTitle(epic.title);
    setNewEpicDescription(epic.description || "");
    setShowEditDialog(true);
  };

  const openDeleteDialog = (epic: Epic) => {
    setCurrentEpic(epic);
    setShowDeleteDialog(true);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Epics beheren</h1>
        <Button
          onClick={() => {
            setNewEpicTitle("");
            setNewEpicDescription("");
            setShowAddDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Epic
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Epics laden...</p>
        </div>
      ) : epics.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">
            Er zijn nog geen epics aangemaakt.
          </p>
          <Button
            onClick={() => {
              setNewEpicTitle("");
              setNewEpicDescription("");
              setShowAddDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Eerste Epic aanmaken
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Beschrijving</TableHead>
                <TableHead className="w-[100px]">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {epics.map((epic) => (
                <TableRow key={epic.id}>
                  <TableCell className="font-medium">{epic.title}</TableCell>
                  <TableCell className="truncate max-w-[300px]">
                    {epic.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(epic)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(epic)}
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

      {/* Add Epic Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe Epic toevoegen</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <Input
                placeholder="Epic titel"
                value={newEpicTitle}
                onChange={(e) => setNewEpicTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Beschrijving
              </label>
              <Textarea
                placeholder="Epic beschrijving"
                value={newEpicDescription}
                onChange={(e) => setNewEpicDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuleren
            </Button>
            <Button onClick={handleAddEpic}>Toevoegen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Epic Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Epic bewerken</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <Input
                placeholder="Epic titel"
                value={newEpicTitle}
                onChange={(e) => setNewEpicTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Beschrijving
              </label>
              <Textarea
                placeholder="Epic beschrijving"
                value={newEpicDescription}
                onChange={(e) => setNewEpicDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuleren
            </Button>
            <Button onClick={handleEditEpic}>Opslaan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Epic Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Epic verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je de epic "{currentEpic?.title}" wilt
              verwijderen? Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEpic}
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
