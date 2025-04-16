"use client";

import { useEffect, useState } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/task-service";
import { fetchUserStories } from "@/lib/user-story-service";
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

interface Task {
  id: string;
  title: string;
  description?: string;
  userStoryId?: string;
  userStory?: { id: string; title?: string };
}

interface UserStory {
  id: string;
  title: string;
  description?: string;
  epicId: string;
}

interface Epic {
  id: string;
  title: string;
  description?: string;
}

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedUserStoryId, setSelectedUserStoryId] = useState<string>("");
  const [selectedEpicId, setSelectedEpicId] = useState<string>("");
  const [filteredUserStories, setFilteredUserStories] = useState<UserStory[]>(
    []
  );

  // Fetch data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tasksData, userStoriesData, epicsData] = await Promise.all([
        fetchTasks(),
        fetchUserStories(),
        fetchEpics(),
      ]);

      // Log de data voor debugging
      console.log("Loaded tasks:", tasksData);
      console.log("Loaded user stories:", userStoriesData);
      console.log("Loaded epics:", epicsData);

      setTasks(tasksData);
      setUserStories(userStoriesData);
      setEpics(epicsData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Er is een fout opgetreden bij het laden van de data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter user stories based on selected epic
  useEffect(() => {
    if (selectedEpicId) {
      const filtered = userStories.filter(
        (story) => story.epicId === selectedEpicId
      );
      console.log(
        `Filtered user stories for epic ${selectedEpicId}:`,
        filtered
      );
      setFilteredUserStories(filtered);

      // Reset user story selection if the current selection doesn't belong to the selected epic
      const currentUserStory = userStories.find(
        (us) => us.id === selectedUserStoryId
      );
      if (!currentUserStory || currentUserStory.epicId !== selectedEpicId) {
        setSelectedUserStoryId("");
      }
    } else {
      setFilteredUserStories(userStories);
    }
  }, [selectedEpicId, userStories, selectedUserStoryId]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedUserStoryId) return;

    try {
      console.log("Creating task with userStoryId:", selectedUserStoryId);

      const newTask = await createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        userStoryId: selectedUserStoryId,
      });

      console.log("Created task:", newTask);

      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setSelectedUserStoryId("");
      setSelectedEpicId("");
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Er is een fout opgetreden bij het toevoegen van de taak.");
    }
  };

  const handleEditTask = async () => {
    if (!currentTask || !newTaskTitle.trim() || !selectedUserStoryId) return;

    try {
      console.log("Updating task with userStoryId:", selectedUserStoryId);

      const updatedTask = await updateTask(currentTask.id, {
        title: newTaskTitle,
        description: newTaskDescription,
        userStoryId: selectedUserStoryId,
      });

      console.log("Updated task:", updatedTask);

      setTasks(
        tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Er is een fout opgetreden bij het bijwerken van de taak.");
    }
  };

  const handleDeleteTask = async () => {
    if (!currentTask) return;

    try {
      await deleteTask(currentTask.id);
      setTasks(tasks.filter((task) => task.id !== currentTask.id));
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Er is een fout opgetreden bij het verwijderen van de taak.");
    }
  };

  const openEditDialog = (task: Task) => {
    setCurrentTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || "");

    const userStory = userStories.find(
      (story) => story.id === task.userStoryId
    );
    if (userStory) {
      setSelectedEpicId(userStory.epicId);
      setSelectedUserStoryId(task.userStoryId || "");
    }

    setShowEditDialog(true);
  };

  const openDeleteDialog = (task: Task) => {
    setCurrentTask(task);
    setShowDeleteDialog(true);
  };

  const getUserStoryTitle = (userStoryId: string) => {
    const userStory = userStories.find((story) => story.id === userStoryId);
    return userStory?.title || "Onbekende User Story";
  };

  const getEpicForUserStory = (userStoryId: string) => {
    const userStory = userStories.find((story) => story.id === userStoryId);
    if (!userStory) return "Onbekende Epic";

    const epic = epics.find((epic) => epic.id === userStory.epicId);
    return epic?.title || "Onbekende Epic";
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Taken beheren</h1>
        <Button
          onClick={() => {
            setNewTaskTitle("");
            setNewTaskDescription("");
            setSelectedUserStoryId("");
            setSelectedEpicId("");
            setShowAddDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Taak
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Data laden...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">
            Er zijn nog geen taken aangemaakt.
          </p>
          <Button
            onClick={() => {
              setNewTaskTitle("");
              setNewTaskDescription("");
              setSelectedUserStoryId("");
              setSelectedEpicId("");
              setShowAddDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Eerste Taak aanmaken
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Beschrijving</TableHead>
                <TableHead>User Story</TableHead>
                <TableHead>Epic</TableHead>
                <TableHead className="w-[100px]">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="truncate max-w-[150px]">
                    {task.description || "-"}
                  </TableCell>
                  <TableCell>
                    {getUserStoryTitle(task.userStoryId || "")}
                  </TableCell>
                  <TableCell>
                    {getEpicForUserStory(task.userStoryId || "")}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(task)}
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

      {/* Add Task Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe Taak toevoegen</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <Input
                placeholder="Taak titel"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Beschrijving
              </label>
              <Textarea
                placeholder="Taak beschrijving"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
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
            <div>
              <label className="block text-sm font-medium mb-1">
                User Story
              </label>
              <Select
                value={selectedUserStoryId}
                onValueChange={setSelectedUserStoryId}
                disabled={!selectedEpicId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedEpicId
                        ? "Selecteer een User Story"
                        : "Selecteer eerst een Epic"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredUserStories.map((story) => (
                    <SelectItem key={story.id} value={story.id}>
                      {story.title}
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
              onClick={handleAddTask}
              disabled={!newTaskTitle || !selectedUserStoryId}
            >
              Toevoegen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Taak bewerken</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <Input
                placeholder="Taak titel"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Beschrijving
              </label>
              <Textarea
                placeholder="Taak beschrijving"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
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
            <div>
              <label className="block text-sm font-medium mb-1">
                User Story
              </label>
              <Select
                value={selectedUserStoryId}
                onValueChange={setSelectedUserStoryId}
                disabled={!selectedEpicId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedEpicId
                        ? "Selecteer een User Story"
                        : "Selecteer eerst een Epic"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredUserStories.map((story) => (
                    <SelectItem key={story.id} value={story.id}>
                      {story.title}
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
              onClick={handleEditTask}
              disabled={!newTaskTitle || !selectedUserStoryId}
            >
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Taak verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je de taak "{currentTask?.title}" wilt
              verwijderen? Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
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
