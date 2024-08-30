import * as Tooltip from "@radix-ui/react-tooltip"
import { AudioLines, FileText, MessageCircle } from "lucide-react"
import React, { FC } from "react"

import { APP_NAME } from "@/app-global"

import { useChatContext } from "@/features/chat/chat-ui/chat-context"
import { ChatType } from "@/features/chat/models"
import { Tabs, TabsList, TabsTrigger } from "@/features/ui/tabs"
import { TooltipProvider } from "@/features/ui/tooltip-provider"

import Typography from "@/components/typography"

interface Prop {
  disable: boolean
}
export const ChatTypeSelector: FC<Prop> = ({ disable }) => {
  const { chatBody, setChatType, features } = useChatContext()

  const hasTranscription = !!features.find(f => f.id === "transcriptions")
  const handleChatTypeChange = (value: string): void => setChatType((value as ChatType) || ChatType.Simple)

  return (
    <TooltipProvider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Tabs defaultValue={chatBody.chatType as ChatType} onValueChange={handleChatTypeChange}>
            <TabsList aria-label="Conversation Type" className="grid size-full grid-cols-3 items-stretch">
              <TabsTrigger
                value={ChatType.Simple}
                className="flex gap-2"
                disabled={!!chatBody?.chatOverFileName || !!chatBody?.internalReference || disable}
                role="tab"
                aria-selected={chatBody.chatType === ChatType.Simple}
                aria-disabled={disable ? "true" : undefined}
              >
                <MessageCircle size={16} aria-hidden="true" />
                General
              </TabsTrigger>
              <TabsTrigger
                value={ChatType.Data}
                className="flex gap-2"
                disabled={!!chatBody?.chatOverFileName || !!chatBody?.internalReference || disable}
                role="tab"
                aria-selected={chatBody.chatType === ChatType.Data}
                aria-disabled={disable ? "true" : undefined}
              >
                <FileText size={16} aria-hidden="true" />
                File
              </TabsTrigger>
              <TabsTrigger
                value={ChatType.Audio}
                className="flex gap-2"
                disabled={!hasTranscription || disable || !!chatBody?.chatOverFileName}
                role="tab"
                aria-selected={chatBody.chatType === ChatType.Audio}
                aria-disabled={!hasTranscription || disable ? "true" : undefined}
              >
                <AudioLines size={16} aria-hidden="true" />
                Transcribe
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Tooltip.Trigger>
        <Tooltip.Content side="top" className="rounded-md bg-primary-foreground p-4 text-foreground shadow-lg">
          <Typography variant="p">
            <strong>General</strong> - chats are turn by turn conversations with the {APP_NAME} Assistant.
            <br />
            <strong>File</strong> - Upload PDF files to {APP_NAME} for questions or task completion based on it.
            <br />
            <strong>Transcription</strong>
            {hasTranscription ? " - Available for authorised agencies." : " - Restricted to authorised agencies."}
          </Typography>
          <Tooltip.Arrow className="fill-primary-foreground" />
        </Tooltip.Content>
      </Tooltip.Root>
    </TooltipProvider>
  )
}
