import { fetchApi } from "./api-config";

interface Epic {
  id: string;
  title: string;
  description?: string;
}

export async function fetchEpics(): Promise<Epic[]> {
  return fetchApi<Epic[]>("/epics");
}

export async function getEpicById(id: string): Promise<Epic> {
  return fetchApi<Epic>(`/epics/${id}`);
}

export async function createEpic(epic: Omit<Epic, "id">): Promise<Epic> {
  return fetchApi<Epic>("/epics", {
    method: "POST",
    body: JSON.stringify(epic),
  });
}

export async function updateEpic(
  id: string,
  epicData: Partial<Epic>
): Promise<Epic> {
  return fetchApi<Epic>(`/epics/${id}`, {
    method: "PUT",
    body: JSON.stringify(epicData),
  });
}

export async function deleteEpic(id: string): Promise<void> {
  // Zorg ervoor dat de ID als een nummer wordt behandeld als het een numerieke string is
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    console.error(`Invalid epic ID for deletion: ${id}`);
    throw new Error(`Invalid epic ID: ${id}`);
  }

  console.log(`Deleting epic with ID: ${numericId}`);

  return fetchApi<void>(`/epics/${numericId}`, {
    method: "DELETE",
  });
}
