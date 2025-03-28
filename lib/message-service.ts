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

interface Message {
  id: number;
  content: string;
  sender: User | { id: string; username?: string };
  epic?: Epic | null;
  userStory?: UserStory | null;
  task?: Task | null;
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
    timestamp: message.timestamp,
  };
}

export async function fetchMessages(): Promise<FrontendMessage[]> {
  try {
    const messages = await fetchApi<Message[]>("/messages");
    console.log("Fetched messages from API:", messages);
    return messages.map(convertToFrontendMessage);
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
    const backendMessage = {
      content: frontendMessage.content,
      sender: { id: user.id }, // Alleen het ID is nodig
      epic: frontendMessage.epicId ? { id: frontendMessage.epicId } : null,
      userStory: frontendMessage.userStoryId
        ? { id: frontendMessage.userStoryId }
        : null,
      task: frontendMessage.taskId ? { id: frontendMessage.taskId } : null,
      timestamp: frontendMessage.timestamp,
    };

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

export async function updateMessage(
  id: number,
  frontendMessageData: Partial<FrontendMessage>
): Promise<FrontendMessage> {
  // Converteer frontend data naar backend formaat
  const backendMessageData: any = { ...frontendMessageData };

  // Als er een username is, zoek de bijbehorende gebruiker
  if (frontendMessageData.username) {
    const user = await getUserByUsername(frontendMessageData.username);
    if (user) {
      backendMessageData.sender = { id: user.id };
    }
    delete backendMessageData.username;
  }

  // Converteer IDs naar objecten met ID
  if (frontendMessageData.epicId) {
    backendMessageData.epic = { id: frontendMessageData.epicId };
    delete backendMessageData.epicId;
  }

  if (frontendMessageData.userStoryId) {
    backendMessageData.userStory = { id: frontendMessageData.userStoryId };
    delete backendMessageData.userStoryId;
  }

  if (frontendMessageData.taskId) {
    backendMessageData.task = { id: frontendMessageData.taskId };
    delete backendMessageData.taskId;
  }

  const updatedMessage = await fetchApi<Message>(`/messages/${id}`, {
    method: "PUT",
    body: JSON.stringify(backendMessageData),
  });

  return convertToFrontendMessage(updatedMessage);
}

export async function deleteMessage(id: number): Promise<void> {
  console.log(`Deleting message with ID: ${id}`);

  return fetchApi<void>(`/messages/${id}`, {
    method: "DELETE",
  });
}
