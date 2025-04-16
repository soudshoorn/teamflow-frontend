"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, Play } from "lucide-react";
import {
  fetchWebhookConfigs,
  createWebhookConfig,
  updateWebhookConfig,
  deleteWebhookConfig,
  sendTestWebhook,
  type WebhookConfig,
} from "@/lib/webhook-service";

export default function ManageWebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentWebhook, setCurrentWebhook] = useState<WebhookConfig | null>(
    null
  );
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookSecret, setNewWebhookSecret] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState("");
  const [newWebhookActive, setNewWebhookActive] = useState(true);

  // Fetch webhooks
  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWebhookConfigs();
      setWebhooks(data);
    } catch (error) {
      console.error("Error loading webhooks:", error);
      alert("Er is een fout opgetreden bij het laden van de webhooks.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) return;

    try {
      const events = newWebhookEvents
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e);

      const newWebhook = await createWebhookConfig({
        name: newWebhookName,
        url: newWebhookUrl,
        secret: newWebhookSecret || undefined,
        events: events.length > 0 ? events : ["all"],
        active: newWebhookActive,
      });

      setWebhooks([...webhooks, newWebhook]);
      resetForm();
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding webhook:", error);
      alert("Er is een fout opgetreden bij het toevoegen van de webhook.");
    }
  };

  const handleEditWebhook = async () => {
    if (!currentWebhook || !newWebhookName.trim() || !newWebhookUrl.trim())
      return;

    try {
      const events = newWebhookEvents
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e);

      const updatedWebhook = await updateWebhookConfig(currentWebhook.id, {
        name: newWebhookName,
        url: newWebhookUrl,
        secret: newWebhookSecret || undefined,
        events: events.length > 0 ? events : ["all"],
        active: newWebhookActive,
      });

      setWebhooks(
        webhooks.map((webhook) =>
          webhook.id === updatedWebhook.id ? updatedWebhook : webhook
        )
      );
      setShowEditDialog(false);
    } catch (error) {
      console.error("Error updating webhook:", error);
      alert("Er is een fout opgetreden bij het bijwerken van de webhook.");
    }
  };

  const handleDeleteWebhook = async () => {
    if (!currentWebhook) return;

    try {
      await deleteWebhookConfig(currentWebhook.id);
      setWebhooks(
        webhooks.filter((webhook) => webhook.id !== currentWebhook.id)
      );
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting webhook:", error);
      alert("Er is een fout opgetreden bij het verwijderen van de webhook.");
    }
  };

  const handleTestWebhook = async (webhookId: number | string) => {
    try {
      const result = await sendTestWebhook(webhookId);
      alert(result.message || "Webhook test verzonden!");
    } catch (error) {
      console.error("Error testing webhook:", error);
      alert("Er is een fout opgetreden bij het testen van de webhook.");
    }
  };

  const openEditDialog = (webhook: WebhookConfig) => {
    setCurrentWebhook(webhook);
    setNewWebhookName(webhook.name);
    setNewWebhookUrl(webhook.url);
    setNewWebhookSecret(webhook.secret || "");
    setNewWebhookEvents(webhook.events.join(", "));
    setNewWebhookActive(webhook.active);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (webhook: WebhookConfig) => {
    setCurrentWebhook(webhook);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setNewWebhookName("");
    setNewWebhookUrl("");
    setNewWebhookSecret("");
    setNewWebhookEvents("");
    setNewWebhookActive(true);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Webhooks beheren</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowAddDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Webhook
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Webhooks laden...</p>
        </div>
      ) : webhooks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">
            Er zijn nog geen webhooks aangemaakt.
          </p>
          <Button
            onClick={() => {
              resetForm();
              setShowAddDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Eerste Webhook aanmaken
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naam</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px]">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.name}</TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {webhook.url}
                  </TableCell>
                  <TableCell>{webhook.events.join(", ")}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        webhook.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {webhook.active ? "Actief" : "Inactief"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTestWebhook(webhook.id)}
                        title="Test webhook"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(webhook)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(webhook)}
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

      {/* Add Webhook Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe Webhook toevoegen</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Naam</label>
              <Input
                placeholder="Webhook naam"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <Input
                placeholder="https://example.com/webhook"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Secret (optioneel)
              </label>
              <Input
                placeholder="Webhook secret"
                value={newWebhookSecret}
                onChange={(e) => setNewWebhookSecret(e.target.value)}
                type="password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Events (komma-gescheiden)
              </label>
              <Input
                placeholder="deployment, message, update"
                value={newWebhookEvents}
                onChange={(e) => setNewWebhookEvents(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Laat leeg voor alle events
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="webhook-active"
                checked={newWebhookActive}
                onChange={(e) => setNewWebhookActive(e.target.checked)}
              />
              <label htmlFor="webhook-active" className="text-sm font-medium">
                Actief
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuleren
            </Button>
            <Button
              onClick={handleAddWebhook}
              disabled={!newWebhookName || !newWebhookUrl}
            >
              Toevoegen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Webhook Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook bewerken</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Naam</label>
              <Input
                placeholder="Webhook naam"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <Input
                placeholder="https://example.com/webhook"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Secret (optioneel)
              </label>
              <Input
                placeholder="Webhook secret"
                value={newWebhookSecret}
                onChange={(e) => setNewWebhookSecret(e.target.value)}
                type="password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Events (komma-gescheiden)
              </label>
              <Input
                placeholder="deployment, message, update"
                value={newWebhookEvents}
                onChange={(e) => setNewWebhookEvents(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Laat leeg voor alle events
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="webhook-active-edit"
                checked={newWebhookActive}
                onChange={(e) => setNewWebhookActive(e.target.checked)}
              />
              <label
                htmlFor="webhook-active-edit"
                className="text-sm font-medium"
              >
                Actief
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuleren
            </Button>
            <Button
              onClick={handleEditWebhook}
              disabled={!newWebhookName || !newWebhookUrl}
            >
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Webhook Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Webhook verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je de webhook "{currentWebhook?.name}" wilt
              verwijderen? Dit kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWebhook}
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
