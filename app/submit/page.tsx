import { Suspense } from "react"
import { SubmitForm } from "./submit-form"
import { mockDb } from "@/lib/db"
import { AuthProtectedPage } from "@/components/auth-protected-page"

async function getUsers() {
  return mockDb.users.filter((user) => user.active).sort((a, b) => a.name.localeCompare(b.name))
}

export default async function SubmitPage() {
  const users = await getUsers()

  return (
    <AuthProtectedPage>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Submit a Tech Support Request</h1>
            <p className="text-muted-foreground">
              Please fill out the form below to report an issue or request assistance.
            </p>
          </div>

          <Suspense fallback={<div>Loading form...</div>}>
            <SubmitForm users={users} />
          </Suspense>
        </div>
      </div>
    </AuthProtectedPage>
  )
}
