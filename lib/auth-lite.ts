import { getCurrentUser as getStoredUser } from "@/lib/auth"

type User = { email: string; password: string; role: "admin" | "agent" | "csp"; name?: string }

const DEFAULT_USERS: User[] = [
  { email: "admin@local.dev", password: "Password1", role: "admin", name: "Default Admin" },
  { email: "agent@local.dev", password: "Password1", role: "agent", name: "Default Agent" },
  { email: "csp@local.dev", password: "Password1", role: "csp", name: "Default CSP" },
]

function loadUsers(): User[] {
  const raw = (process.env.AUTH_USERS || "").trim()
  if (!raw) {
    console.warn("[auth-lite] AUTH_USERS missing; using default local accounts.")
    return DEFAULT_USERS
  }
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as User[]
    console.warn("[auth-lite] AUTH_USERS empty; using default local accounts.")
    return DEFAULT_USERS
  } catch (e) {
    console.warn("[auth-lite] AUTH_USERS malformed; using default local accounts.")
    return DEFAULT_USERS
  }
}

const users = loadUsers()

export function login(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim()
  const user = users.find((u) => u.email === normalizedEmail && u.password === password)
  return user || null
}

export function logout() {
  // Server-side logout logic would go here
  // For now, just return success
  return Promise.resolve()
}

export function getCurrentUser() {
  return getStoredUser()
}

export function getUser() {
  return getCurrentUser()
}

export function isAdminOrAgent() {
  const u = getCurrentUser()
  return !!u && (u.role === "admin" || u.role === "agent")
}

export function isCsp() {
  const u = getCurrentUser()
  return !!u && u.role === "csp"
}
