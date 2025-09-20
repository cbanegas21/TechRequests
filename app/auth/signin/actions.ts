"use server"

export const runtime = "nodejs"

import { login, logout } from "@/lib/auth-lite"
import { redirect } from "next/navigation"

export async function signinAction(_: any, formData: FormData) {
  const email = String(formData.get("email") || "")
    .toLowerCase()
    .trim()
  const password = String(formData.get("password") || "")
  const user = await login(email, password)
  if (!user) return { error: "Invalid credentials" }
  redirect("/board")
}

export async function signoutAction() {
  await logout()
  redirect("/auth/signin")
}
