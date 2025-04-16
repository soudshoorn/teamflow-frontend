import { fetchApi } from "./api-config";
import { getUserByUsername } from "./user-service";

interface User {
  id: string;
  username: string;
}

interface Epic {
  id: string;
  title?: string;
}

interface UserStory {
  id: string;
  title?: string;
}

interface Task {
  id: string;
  title?: string;
}

interface Channel {
  id: number | string;
  name?: string;
}

interface Message {
  id: number;
  content: string;
  sender: User | { id: string; username?: string };
  epic?: Epic | null;
  userStory?: UserStory | null;
  task?: Task | null;
  channel?: Channel | null;
  timestamp: number;
}

// Voor frontend gebruik, met username in plaats van sender object
export interface FrontendMessage {
  id: number;
  content: string;
  username: string;
  epicId?: string;
  userStoryId?: string;
  taskId?: string;
  channelId?: number | string;
  timestamp: number;
}

// Converteer backend Message naar frontend formaat
function convertToFrontendMessage(message: Message): FrontendMessage {
  // Haal de username uit het sender object
  let username = "Onbekend";
  if (message.sender) {
    if ("username" in message.sender && message.sender.username) {
      username = message.sender.username;
    }
  }

  return {
    id: message.id,
    content: message.content,
    username: username,
    epicId: message.epic?.id,
    userStoryId: message.userStory?.id,
    taskId: message.task?.id,
    channelId: message.channel?.id,
    timestamp: message.timestamp,
  };
}

export async function fetchMessages(
  channelId?: number | string
): Promise<FrontendMessage[]> {
  try {
    let endpoint = "/messages";
    if (channelId) {
      endpoint = `/messages/channel/${channelId}`;
    }

    const messages = await fetchApi<Message[]>(endpoint);
    console.log(
      `Fetched messages from API (${
        channelId ? "channel " + channelId : "all"
      })`,
      messages
    );

    // Sorteer berichten op timestamp (oudste eerst, nieuwste laatst)
    const sortedMessages = messages
      .map(convertToFrontendMessage)
      .sort((a, b) => a.timestamp - b.timestamp);
    return sortedMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    // Fallback naar mock data in geval van een API fout
    return [
      {
        id: 1,
        content:
          "Welkom bij TeamFlow! Dit is een gespecialiseerde chatapplicatie voor scrum-teams.",
        username: "TeamFlow",
        timestamp: Date.now() - 3600000,
      },
      {
        id: 2,
        content:
          "Je kunt berichten koppelen aan Epics, User Stories en Taken om de context duidelijk te maken.",
        username: "TeamFlow",
        epicId: "1",
        timestamp: Date.now() - 3500000,
      },
    ];
  }
}

export async function getMessageById(id: number): Promise<FrontendMessage> {
  const message = await fetchApi<Message>(`/messages/${id}`);
  return convertToFrontendMessage(message);
}

export async function sendMessage(
  frontendMessage: Omit<FrontendMessage, "id">
): Promise<FrontendMessage> {
  try {
    // Log de uitgaande message voor debugging
    console.log("Preparing to send message:", frontendMessage);

    // Zoek de gebruiker op basis van de username
    const user = await getUserByUsername(frontendMessage.username);

    if (!user) {
      throw new Error(
        `User with username ${frontendMessage.username} not found`
      );
    }

    // Maak het bericht in het formaat dat de backend verwacht
    const backendMessage: any = {
      content: frontendMessage.content,
      sender: { id: user.id }, // Alleen het ID is nodig
      timestamp: frontendMessage.timestamp,
    };

    // Voeg optionele velden toe als ze bestaan
    if (frontendMessage.epicId) {
      backendMessage.epic = { id: frontendMessage.epicId };
    }

    if (frontendMessage.userStoryId) {
      backendMessage.userStory = { id: frontendMessage.userStoryId };
    }

    if (frontendMessage.taskId) {
      backendMessage.task = { id: frontendMessage.taskId };
    }

    if (frontendMessage.channelId) {
      backendMessage.channel = { id: frontendMessage.channelId };
    }

    console.log("Sending message to API:", backendMessage);

    const savedMessage = await fetchApi<Message>("/messages", {
      method: "POST",
      body: JSON.stringify(backendMessage),
    });

    console.log("Received response from API:", savedMessage);

    // Voeg de username toe aan het antwoord voor directe weergave
    const frontendResponse = convertToFrontendMessage(savedMessage);
    frontendResponse.username = frontendMessage.username; // Gebruik de originele username

    return frontendResponse;
  } catch (error) {
    console.error("Error in sendMessage:", error);

    // Fallback voor als de API niet beschikbaar is
    // Genereer een tijdelijk ID voor het bericht
    const tempId = Date.now();
    const mockSavedMessage: FrontendMessage = {
      ...frontendMessage,
      id: tempId,
    };

    console.log("Created mock message:", mockSavedMessage);
    return mockSavedMessage;
  }
}

// Verbeter de updateMessage en deleteMessage functies om beter te werken

export async function updateMessage(
  id: number,
  frontendMessageData: Partial<FrontendMessage>
): Promise<FrontendMessage> {
  console.log(`Updating message with ID: ${id}`, frontendMessageData);

  // Haal eerst het bestaande bericht op om alle gegevens te behouden
  let existingMessage: FrontendMessage;
  try {
    existingMessage = await getMessageById(id);
  } catch (error) {
    console.error(`Error fetching existing message ${id}:`, error);
    // Als we het bestaande bericht niet kunnen ophalen, gaan we door met de gegevens die we hebben
    existingMessage = { id, ...frontendMessageData } as FrontendMessage;
  }

  // Converteer frontend data naar backend formaat
  const backendMessageData: any = {};

  // Voeg alleen de velden toe die we willen bijwerken
  if (frontendMessageData.content) {
    backendMessageData.content = frontendMessageData.content;
  }

  // Als er een username is, zoek de bijbehorende gebruiker
  if (frontendMessageData.username) {
    const user = await getUserByUsername(frontendMessageData.username);
    if (user) {
      backendMessageData.sender = { id: user.id };
    }
  }

  // Behoud de gekoppelde items, gebruik de nieuwe waarden als ze zijn opgegeven, anders de bestaande waarden
  // Epic
  const epicId = frontendMessageData.epicId || existingMessage.epicId;
  if (epicId) {
    backendMessageData.epic = { id: epicId };
  }

  // User Story
  const userStoryId =
    frontendMessageData.userStoryId || existingMessage.userStoryId;
  if (userStoryId) {
    backendMessageData.userStory = { id: userStoryId };
  }

  // Task
  const taskId = frontendMessageData.taskId || existingMessage.taskId;
  if (taskId) {
    backendMessageData.task = { id: taskId };
  }

  // Channel
  const channelId = frontendMessageData.channelId || existingMessage.channelId;
  if (channelId) {
    backendMessageData.channel = { id: channelId };
  }

  try {
    const updatedMessage = await fetchApi<Message>(`/messages/${id}`, {
      method: "PUT",
      body: JSON.stringify(backendMessageData),
    });

    console.log("API response for updated message:", updatedMessage);
    return convertToFrontendMessage(updatedMessage);
  } catch (error) {
    console.error(`Error updating message ${id}:`, error);

    // Fallback voor als de API niet beschikbaar is
    // Geef het originele bericht terug met de bijgewerkte content
    return {
      ...frontendMessageData,
      id,
      content: frontendMessageData.content || "",
      username: frontendMessageData.username || "Onbekend",
      timestamp: frontendMessageData.timestamp || Date.now(),
    } as FrontendMessage;
  }
}

export async function deleteMessage(id: number): Promise<void> {
  console.log(`Deleting message with ID: ${id}`);

  try {
    await fetchApi<void>(`/messages/${id}`, {
      method: "DELETE",
    });
    console.log(`Successfully deleted message with ID: ${id}`);
  } catch (error) {
    console.error(`Error deleting message with ID: ${id}:`, error);
    // Geen throw hier, zodat de UI nog steeds kan updaten zelfs als de API call faalt
  }
}
