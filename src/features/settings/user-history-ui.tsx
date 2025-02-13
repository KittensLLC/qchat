import { FC } from "react"

import { APP_NAME } from "@/app-global"

import ChatRow from "@/components/chat/chat-row"

import { ChatRole } from "@/features/chat/models"
import { FindAllChatsInThread, FindChatThreadById } from "@/features/services/history-service"
import { Card } from "@/features/ui/card"

interface Props {
  chatThreadId: string
}

export const ChatReportingUI: FC<Props> = async props => {
  const chatThread = await FindChatThreadById(props.chatThreadId)
  const chats = await FindAllChatsInThread(props.chatThreadId)

  if (chatThread.status !== "OK") return <div>Error</div>
  if (chats.status !== "OK") return <div>Error</div>

  return (
    <Card className="relative h-full">
      <div className="h-full overflow-y-auto rounded-md">
        <div className="flex justify-center p-4"></div>
        <div className="pb-[80px]">
          {chatThread.status !== "OK" || chats.status !== "OK" ? (
            <div>Chat thread or messages could not be loaded...</div>
          ) : (
            chats.response.map((message, index) => (
              <ChatRow
                name={message.role === ChatRole.User ? chatThread.response.useName : APP_NAME}
                message={message}
                type={message.role}
                key={index}
                chatMessageId={message.id}
                chatThreadId={chatThread.response.id}
                showAssistantButtons={true}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
