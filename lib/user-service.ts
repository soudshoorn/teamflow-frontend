import { fetchApi } from "./api-config"

interface User {
  id: string
  username: string
}

// Cache voor gebruikers om herhaalde API-calls te verminderen
let usersCache: User[] = []

export async function checkUserExists(username: string): Promise<boolean> {
  try {
    // Haal alle gebruikers op en controleer of de gebruikersnaam bestaat
    const users = await getUsers()
    return users.some((user) => user.username.toLowerCase() === username.toLowerCase())
  } catch (error) {
    console.error("Error checking if user exists:", error)
    return false
  }
}

export async function createUser(username: string): Promise<User> {
  const newUser = await fetchApi<User>("/users", {
    method: "POST",
    body: JSON.stringify({ username }),
  })

  // Update cache
  usersCache.push(newUser)

  return newUser
}

export async function getUsers(): Promise<User[]> {
  // Als we al gebruikers in de cache hebben, gebruik die
  if (usersCache.length > 0) {
    return usersCache
  }

  try {
    const users = await fetchApi<User[]>("/users")
    usersCache = users // Update cache
    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    // Fallback naar mock data in geval van een API fout
    const mockUsers = [
      { id: "1", username: "TeamFlow" },
      { id: "2", username: "Jan" },
      { id: "3", username: "Petra" },
    ]
    usersCache = mockUsers
    return mockUsers
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  // Eerst in cache zoeken
  const cachedUser = usersCache.find((user) => user.id === id)
  if (cachedUser) {
    return cachedUser
  }

  try {
    const user = await fetchApi<User>(`/users/${id}`)
    // Update cache
    const userIndex = usersCache.findIndex((u) => u.id === id)
    if (userIndex >= 0) {
      usersCache[userIndex] = user
    } else {
      usersCache.push(user)
    }
    return user
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error)
    return undefined
  }
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  // Eerst in cache zoeken (case-insensitive)
  const cachedUser = usersCache.find((user) => user.username.toLowerCase() === username.toLowerCase())
  if (cachedUser) {
    return cachedUser
  }

  // Als niet in cache, haal alle gebruikers op en zoek opnieuw
  try {
    const users = await getUsers()
    return users.find((user) => user.username.toLowerCase() === username.toLowerCase())
  } catch (error) {
    console.error(`Error fetching user with username ${username}:`, error)
    return undefined
  }
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  const updatedUser = await fetchApi<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  })

  // Update cache
  const userIndex = usersCache.findIndex((user) => user.id === id)
  if (userIndex >= 0) {
    usersCache[userIndex] = updatedUser
  }

  return updatedUser
}

export async function deleteUser(id: string): Promise<void> {
  await fetchApi<void>(`/users/${id}`, {
    method: "DELETE",
  })

  // Update cache
  usersCache = usersCache.filter((user) => user.id !== id)
}
