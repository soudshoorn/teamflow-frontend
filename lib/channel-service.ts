import { fetchApi } from "./api-config";

export interface Channel {
  id: number | string;
  name: string;
  description: string;
  messages?: any[];
}

/**
 * Haalt alle beschikbare kanalen op
 */
export async function fetchChannels(): Promise<Channel[]> {
  try {
    return await fetchApi<Channel[]>("/channels");
  } catch (error) {
    console.error("Error fetching channels:", error);
    return []; // Geen mock data, alleen lege array bij fout
  }
}

/**
 * Haalt een specifiek kanaal op met zijn berichten
 */
export async function getChannelById(id: number | string): Promise<Channel> {
  return fetchApi<Channel>(`/channels/${id}`);
}

/**
 * Maakt een nieuw kanaal aan
 */
export async function createChannel(
  channel: Omit<Channel, "id">
): Promise<Channel> {
  return fetchApi<Channel>("/channels", {
    method: "POST",
    body: JSON.stringify(channel),
  });
}

/**
 * Werkt een bestaand kanaal bij
 */
export async function updateChannel(
  id: number | string,
  channelData: Partial<Channel>
): Promise<Channel> {
  return fetchApi<Channel>(`/channels/${id}`, {
    method: "PUT",
    body: JSON.stringify(channelData),
  });
}

/**
 * Verwijdert een kanaal
 */
export async function deleteChannel(id: number | string): Promise<void> {
  return fetchApi<void>(`/channels/${id}`, {
    method: "DELETE",
  });
}
