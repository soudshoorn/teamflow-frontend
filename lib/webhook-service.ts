import { fetchApi } from "./api-config"

export interface WebhookEvent {
  event: string
  status: string
  environment: string
  details: string
  timestamp?: number
}

export interface WebhookConfig {
  id: number | string
  name: string
  url: string
  secret?: string
  events: string[]
  active: boolean
}

/**
 * Haalt alle webhook configuraties op
 */
export async function fetchWebhookConfigs(): Promise<WebhookConfig[]> {
  try {
    return await fetchApi<WebhookConfig[]>("/webhook/configs")
  } catch (error) {
    console.error("Error fetching webhook configs:", error)
    // Fallback naar mock data
    return [
      {
        id: 1,
        name: "Deployment Notifications",
        url: "https://example.com/webhook",
        events: ["deployment"],
        active: true,
      },
    ]
  }
}

/**
 * Maakt een nieuwe webhook configuratie aan
 */
export async function createWebhookConfig(config: Omit<WebhookConfig, "id">): Promise<WebhookConfig> {
  return fetchApi<WebhookConfig>("/webhook/configs", {
    method: "POST",
    body: JSON.stringify(config),
  })
}

/**
 * Werkt een bestaande webhook configuratie bij
 */
export async function updateWebhookConfig(
  id: number | string,
  configData: Partial<WebhookConfig>,
): Promise<WebhookConfig> {
  return fetchApi<WebhookConfig>(`/webhook/configs/${id}`, {
    method: "PUT",
    body: JSON.stringify(configData),
  })
}

/**
 * Verwijdert een webhook configuratie
 */
export async function deleteWebhookConfig(id: number | string): Promise<void> {
  return fetchApi<void>(`/webhook/configs/${id}`, {
    method: "DELETE",
  })
}

/**
 * Stuurt een test webhook event
 */
export async function sendTestWebhook(configId: number | string): Promise<{ success: boolean; message: string }> {
  return fetchApi<{ success: boolean; message: string }>(`/webhook/configs/${configId}/test`, {
    method: "POST",
  })
}
