import { fetchApi } from "./api-config";

interface Epic {
  id: string;
  title?: string;
  description?: string;
}

interface UserStory {
  id: string;
  title: string;
  description?: string;
  epicId?: string; // Voor frontend gebruik
  epic?: Epic; // Voor backend communicatie
}

// Interface voor het aanmaken/bijwerken van user stories
interface UserStoryRequest {
  title: string;
  description?: string;
  epic: Epic;
}

export async function fetchUserStories(epicId?: string): Promise<UserStory[]> {
  // Als epicId is opgegeven, haal alleen user stories voor die epic op
  const endpoint = epicId ? `/userstories?epicId=${epicId}` : "/userstories";

  try {
    const response = await fetchApi<UserStory[]>(endpoint);
    console.log("Fetched user stories:", response);

    // Zorg ervoor dat elke user story een epicId heeft voor frontend gebruik
    return response.map((story) => ({
      ...story,
      epicId: story.epic?.id,
    }));
  } catch (error) {
    console.error("Error fetching user stories:", error);
    throw error;
  }
}

export async function getUserStoryById(id: string): Promise<UserStory> {
  const story = await fetchApi<UserStory>(`/userstories/${id}`);
  return {
    ...story,
    epicId: story.epic?.id,
  };
}

export async function createUserStory(
  userStory: Omit<UserStory, "id">
): Promise<UserStory> {
  // Converteer van frontend formaat naar backend formaat
  const requestData: UserStoryRequest = {
    title: userStory.title,
    description: userStory.description,
    epic: { id: userStory.epicId || "" },
  };

  console.log(
    "Creating user story with data:",
    JSON.stringify(requestData, null, 2)
  );

  try {
    const response = await fetchApi<UserStory>("/userstories", {
      method: "POST",
      body: JSON.stringify(requestData),
    });

    console.log("API response for created user story:", response);

    // Zorg ervoor dat de response een epicId heeft voor frontend gebruik
    return {
      ...response,
      epicId: response.epic?.id,
    };
  } catch (error) {
    console.error("Error creating user story:", error);
    throw error;
  }
}

export async function updateUserStory(
  id: string,
  userStoryData: Partial<UserStory>
): Promise<UserStory> {
  // Converteer van frontend formaat naar backend formaat
  const requestData: Partial<UserStoryRequest> = {
    title: userStoryData.title,
    description: userStoryData.description,
  };

  // Voeg epic toe als epicId is opgegeven
  if (userStoryData.epicId) {
    requestData.epic = { id: userStoryData.epicId };
  }

  console.log(
    `Updating user story ${id} with data:`,
    JSON.stringify(requestData, null, 2)
  );

  try {
    const response = await fetchApi<UserStory>(`/userstories/${id}`, {
      method: "PUT",
      body: JSON.stringify(requestData),
    });

    console.log("API response for updated user story:", response);

    // Zorg ervoor dat de response een epicId heeft voor frontend gebruik
    return {
      ...response,
      epicId: response.epic?.id,
    };
  } catch (error) {
    console.error(`Error updating user story ${id}:`, error);
    throw error;
  }
}

export async function deleteUserStory(id: string): Promise<void> {
  // Zorg ervoor dat de ID als een nummer wordt behandeld als het een numerieke string is
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) {
    console.error(`Invalid user story ID for deletion: ${id}`);
    throw new Error(`Invalid user story ID: ${id}`);
  }

  console.log(`Deleting user story with ID: ${numericId}`);

  return fetchApi<void>(`/userstories/${numericId}`, {
    method: "DELETE",
  });
}
