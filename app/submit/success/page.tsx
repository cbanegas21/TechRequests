"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight, Home, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SuccessPageProps {
  searchParams: { ticketId?: string }
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const ticketId = searchParams.ticketId
  const router = useRouter()

  const handleSubmitAnother = () => {
    router.replace(`/submit?reset=true&t=${Date.now()}`)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Request Submitted Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {ticketId && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Your ticket ID is:</p>
              <p className="text-lg font-mono font-semibold text-primary">{ticketId}</p>
            </div>
          )}

          <p className="text-muted-foreground">
            Your tech support request has been received and assigned a unique ID. Our team will review it and respond as
            soon as possible.
          </p>

          <div className="flex flex-col gap-3 pt-4">
            {ticketId && (
              <Button asChild>
                <Link href={`/ticket/${ticketId}`}>
                  View Ticket Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}

            <Button variant="outline" onClick={handleSubmitAnother}>
              <Plus className="mr-2 h-4 w-4" />
              Submit Another Request
            </Button>

            <Button variant="ghost" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
