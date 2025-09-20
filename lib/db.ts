let PrismaClient: any
let prisma: any

try {
  // Try to import PrismaClient - this will fail if not generated yet
  const prismaModule = require("@prisma/client")
  PrismaClient = prismaModule.PrismaClient

  const globalForPrisma = global as unknown as { prisma?: any }

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
    })

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
} catch (error) {
  // Fallback when PrismaClient is not available (before generation)
  console.warn("PrismaClient not available - using mock client")
  prisma = {
    ticket: {
      findUnique: async () => null,
      findMany: async () => [],
      create: async () => ({ id: "mock", shortId: "TR-0000" }),
      update: async () => ({ id: "mock" }),
    },
    comment: {
      create: async () => ({ id: "mock" }),
    },
  }
}

export const mockDb = {
  users: [
    {
      id: "1",
      name: "John Agent",
      email: "agent@example.com",
      image: "/placeholder.svg?height=32&width=32",
      role: "agent",
      active: true,
    },
    {
      id: "2",
      name: "Jane User",
      email: "user@example.com",
      image: "/placeholder.svg?height=32&width=32",
      role: "user",
      active: true,
    },
    {
      id: "3",
      name: "CSP User",
      email: "csp@example.com",
      image: "/placeholder.svg?height=32&width=32",
      role: "csp",
      active: true,
    },
  ],
  tickets: [],
  comments: [],
  auditLogs: [],
}

export function updateUser(userId: string, updates: any) {
  const userIndex = mockDb.users.findIndex((u) => u.id === userId)
  if (userIndex !== -1) {
    mockDb.users[userIndex] = { ...mockDb.users[userIndex], ...updates }
    return mockDb.users[userIndex]
  }
  return null
}

export { prisma }
