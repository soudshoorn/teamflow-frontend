"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { checkUserExists, createUser, getUserByUsername } from "@/lib/user-service"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)

    try {
      const exists = await checkUserExists(username)

      if (exists) {
        // User exists, log them in
        const user = await getUserByUsername(username)
        if (user) {
          // Sla zowel de gebruikersnaam als het ID op
          localStorage.setItem("teamflow-user", username)
          localStorage.setItem("teamflow-user-id", user.id)
          router.push("/chat")
        } else {
          alert("Er is een fout opgetreden bij het inloggen. Probeer het later opnieuw.")
        }
      } else {
        // User doesn't exist, show dialog
        setShowNewUserDialog(true)
      }
    } catch (error) {
      console.error("Error checking user:", error)
      alert("Er is een fout opgetreden bij het controleren van de gebruiker. Probeer het later opnieuw.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    setIsLoading(true)

    try {
      const newUser = await createUser(username)
      // Sla zowel de gebruikersnaam als het ID op
      localStorage.setItem("teamflow-user", username)
      localStorage.setItem("teamflow-user-id", newUser.id)
      router.push("/chat")
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Er is een fout opgetreden bij het aanmaken van de gebruiker. Probeer het later opnieuw.")
    } finally {
      setIsLoading(false)
      setShowNewUserDialog(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Je naam
          </label>
          <div className="mt-1">
            <Input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Voer je naam in"
              className="w-full"
            />
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Even geduld..." : "Ga naar chat"}
          </Button>
        </div>
      </form>

      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe gebruiker</DialogTitle>
            <DialogDescription>
              Er bestaat nog geen gebruiker met de naam "{username}". Wil je een nieuwe gebruiker aanmaken?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
              Annuleren
            </Button>
            <Button onClick={handleCreateUser} disabled={isLoading}>
              {isLoading ? "Aanmaken..." : "Gebruiker aanmaken"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
