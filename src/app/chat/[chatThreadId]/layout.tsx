import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { ReactNode } from "react"

import { APP_NAME } from "@/app-global"

import { FindAllChatDocumentsForCurrentThread } from "@/features/chat/chat-services/chat-document-service"
import { FindAllChatMessagesForCurrentThread } from "@/features/chat/chat-services/chat-message-service"
import { FindChatThreadById } from "@/features/chat/chat-services/chat-thread-service"
import ChatProvider from "@/features/chat/chat-ui/chat-context"
import { GetUserSettings } from "@/features/services/user-service"

export const dynamic = "force-dynamic"

export const metadata = {
  title: `${APP_NAME} Thread`,
  description: `${APP_NAME} - Thread`,
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { chatThreadId: string }
}): Promise<JSX.Element> {
  const session = await getServerSession()
  if (!session) return redirect("/")

  const [messages, thread, documents, settings] = await Promise.all([
    FindAllChatMessagesForCurrentThread(params.chatThreadId),
    FindChatThreadById(params.chatThreadId),
    FindAllChatDocumentsForCurrentThread(params.chatThreadId),
    GetUserSettings(),
  ])

  if (thread.status !== "OK" || messages.status !== "OK" || documents.status !== "OK" || settings.status !== "OK")
    return redirect("/")

  return (
    <ChatProvider
      id={params.chatThreadId}
      chats={messages.response}
      chatThread={thread.response}
      documents={documents.response}
      tenantPreferences={settings.response.tenant}
      appSettings={settings.response.application}
      indexes={settings.response.indexes}
      features={settings.response.features}
    >
      {children}
    </ChatProvider>
  )
}
