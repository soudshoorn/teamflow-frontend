// Configuratie voor API calls
// Pas de base URL aan naar je eigen Spring Boot API server
export const API_BASE_URL = "http://localhost:8080/api";

// Helper functie voor het maken van API requests
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  console.log(`Making API request to: ${url}`, {
    method: options.method || "GET",
    body: options.body ? JSON.parse(options.body as string) : undefined,
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      try {
        const errorText = await response.text();
        console.error(`Error response body: ${errorText}`);
      } catch (e) {
        console.error("Could not read error response body");
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Voor 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    // Probeer de response als JSON te parsen
    try {
      const data = await response.json();
      console.log(`API response from ${url}:`, data);
      return data;
    } catch (e) {
      console.log(`API response from ${url} is not JSON or is empty`);
      return {} as T;
    }
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
}
