import { fetchApi } from "./api-config";

interface UserStory {
  id: string;
  title?: string;
  description?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  userStoryId?: string; // Voor frontend gebruik
  userStory?: UserStory; // Voor backend communicatie
}

// Interface voor het aanmaken/bijwerken van taken
interface TaskRequest {
  title: string;
  description?: string;
  userStory: UserStory;
}

export async function fetchTasks(userStoryId?: string): Promise<Task[]> {
  // Als userStoryId is opgegeven, haal alleen taken voor die user story op
  const endpoint = userStoryId ? `/tasks?userStoryId=${userStoryId}` : "/tasks";

  try {
    const response = await fetchApi<Task[]>(endpoint);
    console.log("Fetched tasks:", response);

    // Zorg ervoor dat elke task een userStoryId heeft voor frontend gebruik
    return response.map((task) => ({
      ...task,
      userStoryId: task.userStory?.id,
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

export async function getTaskById(id: string): Promise<Task> {
  const task = await fetchApi<Task>(`/tasks/${id}`);
  return {
    ...task,
    userStoryId: task.userStory?.id,
  };
}

export async function createTask(task: Omit<Task, "id">): Promise<Task> {
  // Converteer van frontend formaat naar backend formaat
  const requestData: TaskRequest = {
    title: task.title,
    description: task.description,
    userStory: { id: task.userStoryId || "" },
  };

  console.log("Creating task with data:", JSON.stringify(requestData, null, 2));

  try {
    const response = await fetchApi<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(requestData),
    });

    console.log("API response for created task:", response);

    // Zorg ervoor dat de response een userStoryId heeft voor frontend gebruik
    return {
      ...response,
      userStoryId: response.userStory?.id,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

export async function updateTask(
  id: string,
  taskData: Partial<Task>
): Promise<Task> {
  // Converteer van frontend formaat naar backend formaat
  const requestData: Partial<TaskRequest> = {
    title: taskData.title,
    description: taskData.description,
  };

  // Voeg userStory toe als userStoryId is opgegeven
  if (taskData.userStoryId) {
    requestData.userStory = { id: taskData.userStoryId };
  }

  console.log(
    `Updating task ${id} with data:`,
    JSON.stringify(requestData, null, 2)
  );

  try {
    const response = await fetchApi<Task>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(requestData),
    });

    console.log("API response for updated task:", response);

    // Zorg ervoor dat de response een userStoryId heeft voor frontend gebruik
    return {
      ...response,
      userStoryId: response.userStory?.id,
    };
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  // Zorg ervoor dat de ID als een nummer wordt behandeld als het een numerieke string is
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    console.error(`Invalid task ID for deletion: ${id}`);
    throw new Error(`Invalid task ID: ${id}`);
  }

  console.log(`Deleting task with ID: ${numericId}`);

  return fetchApi<void>(`/tasks/${numericId}`, {
    method: "DELETE",
  });
}
