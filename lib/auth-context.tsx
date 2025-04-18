"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  { id: "user1", email: "user@example.com", name: "Regular User", isAdmin: false },
  { id: "admin1", email: "admin@example.com", name: "Admin User", isAdmin: true },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = MOCK_USERS.find((u) => u.email === email)

    if (foundUser && password === "password") {
      // Simple password check for demo
      setUser(foundUser)
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  // Mock register function
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    if (MOCK_USERS.some((u) => u.email === email)) {
      setIsLoading(false)
      return false
    }

    // In a real app, we would save this to the database
    const newUser: User = {
      id: `user${Date.now()}`,
      email,
      name,
      isAdmin: false,
    }

    // Add to mock users (this won't persist on page refresh in this demo)
    MOCK_USERS.push(newUser)
    setUser(newUser)

    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
