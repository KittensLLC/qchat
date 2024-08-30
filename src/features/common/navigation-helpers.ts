"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { showError } from "@/features/globals/global-message-store"

type Page = "extensions" | "persona" | "prompt" | "chat" | "settings"

interface RevalidateCacheProps {
  page: Page
  params?: string
  type?: "layout" | "page"
}

export const RevalidateCache = ({ page, params, type }: RevalidateCacheProps): void => {
  try {
    if (params) {
      revalidatePath(`/${page}/${params}`, type)
    } else {
      revalidatePath(`/${page}`, type)
    }
  } catch (error) {
    showError("Error revalidating cache:" + error)
  }
}

export const RedirectToPage = (path: Page): void => redirect(`/${path}`)

export const RedirectToChatThread = (chatThreadId: string): void => redirect(`/chat/${chatThreadId}`)
