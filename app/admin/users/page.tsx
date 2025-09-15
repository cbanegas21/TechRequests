"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, UserPlus, Edit } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { mockDb, updateUser } from "@/lib/db"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function UserManagementPage() {
  const { user, isAgent } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState(mockDb.users)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "csp" as "agent" | "csp",
  })

  useEffect(() => {
    setUsers([...mockDb.users])
  }, [])

  if (!isAgent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAddUser = async () => {
    if (!formData.name || !formData.email) return

    setIsLoading(true)
    try {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockDb.users.push(newUser)
      setUsers([...mockDb.users])
      setFormData({ name: "", email: "", role: "csp" })
      setShowAddForm(false)

      toast({
        title: "User Added",
        description: `${newUser.name} has been added successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    })
    setShowAddForm(true)
  }

  const handleUpdateUser = async () => {
    if (!editingUser || !formData.name || !formData.email) return

    setIsLoading(true)
    try {
      const updatedUser = updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      })

      if (updatedUser) {
        setUsers([...mockDb.users])

        if (user?.id === editingUser.id) {
          setTimeout(() => {
            window.location.reload()
          }, 500)
        }

        toast({
          title: "User Updated",
          description: `${updatedUser.name} has been updated successfully`,
        })
      }

      setFormData({ name: "", email: "", role: "csp" })
      setShowAddForm(false)
      setEditingUser(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const index = mockDb.users.findIndex((u) => u.id === userId)
      if (index !== -1) {
        const deletedUser = mockDb.users[index]
        mockDb.users.splice(index, 1)
        setUsers([...mockDb.users])

        toast({
          title: "User Deleted",
          description: `${deletedUser.name} has been removed`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "csp" })
    setShowAddForm(false)
    setEditingUser(null)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2" disabled={isLoading}>
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingUser ? "Edit User" : "Add New User"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full Name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@clienttether.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "agent" | "csp") => setFormData({ ...formData, role: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csp">CSP (Customer Success Partner)</SelectItem>
                  <SelectItem value="agent">Agent (Tech Team)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={editingUser ? handleUpdateUser : handleAddUser} disabled={isLoading}>
                {isLoading ? "Saving..." : editingUser ? "Update User" : "Add User"}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={isLoading}>
                Cancel
              </Button>
            </div>

            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <p>
                <strong>Note:</strong> All users will use the password: <code>Password1</code>
              </p>
              {editingUser?.id === user?.id && (
                <p className="mt-2 text-amber-600">
                  <strong>Warning:</strong> You are editing your own profile. The page will refresh after saving.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((userItem) => (
              <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium">
                        {userItem.name}
                        {userItem.id === user?.id && <span className="text-sm text-muted-foreground ml-2">(You)</span>}
                      </h3>
                      <p className="text-sm text-muted-foreground">{userItem.email}</p>
                    </div>
                    <Badge variant={userItem.role === "agent" ? "default" : "secondary"}>
                      {userItem.role === "agent" ? "ADMIN" : "CSP"}
                    </Badge>
                    {!userItem.active && <Badge variant="destructive">Inactive</Badge>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditUser(userItem)} disabled={isLoading}>
                    <Edit className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={isLoading || userItem.id === user?.id}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {userItem.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(userItem.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
