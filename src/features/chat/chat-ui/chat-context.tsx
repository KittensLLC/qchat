"use client"

import { ChatRequestOptions, JSONValue } from "ai"
import { UseChatHelpers, useChat } from "ai/react"
import React, { PropsWithChildren, createContext, useContext, useEffect, useRef, useState } from "react"

import { MAX_CONTENT_FILTER_TRIGGER_COUNT_ALLOWED } from "@/features/chat/chat-services/chat-api"
import {
  ChatThreadModel,
  ChatType,
  ConversationStyle,
  ConversationSensitivity,
  PromptBody,
  PromptMessage,
  ChatRole,
  AssistantChatMessageModel,
  UserChatMessageModel,
  ChatDocumentModel,
} from "@/features/chat/models"
import { showError } from "@/features/globals/global-message-store"
import { UserIndexConfig, UserSettings } from "@/features/models/user-models"
import { uniqueId } from "@/lib/utils"

import { FileState, useFileState } from "./chat-file/use-file-state"
import { useChatThreads } from "./chat-threads-context"

type ChatContextDefinition = ReturnType<typeof useChatHook>
const ChatContext = createContext<ChatContextDefinition | null>(null)

const useChatHook = (props: ChatProviderProps): ChatContextState => {
  const fileState = useFileState()
  const { updateThreadTitle } = useChatThreads()
  const updateThreadTitleRef = useRef(updateThreadTitle)

  const [chatBody, setChatBody] = useState<PromptBody>({
    id: props.chatThread.id,
    chatType: props.chatThread.chatType,
    conversationStyle: props.chatThread.conversationStyle,
    conversationSensitivity: props.chatThread.conversationSensitivity,
    chatOverFileName: props.chatThread.chatOverFileName,
    tenantId: props.chatThread.tenantId,
    userId: props.chatThread.userId,
    internalReference: props.chatThread.internalReference,
    chatThreadName: props.chatThread.name,
    indexId: props.chatThread.indexId,
  })

  const chatThreadNameRef = useRef(chatBody.chatThreadName)

  useEffect(() => {
    if (!props?.chatThread?.name || !props?.chatThread?.id) return
    if (props.chatThread.name === chatThreadNameRef.current) return
    let unsubscribe = false
    updateThreadTitleRef
      .current(props.chatThread.id, props.chatThread.name)
      .then(() => {
        if (unsubscribe) return
        setChatBody(prev => ({ ...prev, chatThreadName: props.chatThread.name }))
      })
      .catch(error => showError(error.message))

    return () => {
      unsubscribe = true
    }
  }, [props?.chatThread?.name, props?.chatThread?.id])

  const onError = (error: Error): void => showError(error.message)

  const [nextId, setNextId] = useState<string | undefined>(undefined)
  const nextIdRef = useRef(nextId)
  nextIdRef.current = nextId
  const response = useChat({
    onError,
    id: props.id,
    body: chatBody,
    initialMessages: props.chats,
    generateId: () => {
      if (nextIdRef.current) {
        const returnValue = nextIdRef.current
        setNextId(undefined)
        return returnValue
      }
      return uniqueId()
    },
    sendExtraMessageFields: true,
  })

  const setChatType = (chatType: ChatType): void => {
    fileState.setIsFileNull(true)
    const index = getDefaultIndex(props.indexes, chatType)
    setChatBody(prev => ({ ...prev, chatType: chatType, indexId: index?.id || "" }))
  }

  const onConversationStyleChange = (value: ConversationStyle): void =>
    setChatBody(prev => ({ ...prev, conversationStyle: value }))

  const onConversationSensitivityChange = (value: ConversationSensitivity): void =>
    setChatBody(prev => ({ ...prev, conversationSensitivity: value }))

  const onIndexChange = (value: string): void => setChatBody(prev => ({ ...prev, indexId: value }))

  const handleSubmit = async (
    event?: { preventDefault?: () => void },
    options: ChatRequestOptions = {}
  ): Promise<void> => {
    event?.preventDefault?.()

    if (!response.input) return

    const nextCompletionId = uniqueId()
    setNextId(nextCompletionId)

    await response.append(
      {
        id: uniqueId(),
        content: response.input,
        role: ChatRole.User,
      },
      { ...options, data: { completionId: nextCompletionId } }
    )

    response.setInput("")
  }

  return {
    ...response,
    messages: response.messages.map<PromptMessage>(message => {
      const dataItem = (response.data as (JSONValue & PromptMessage)[])?.find(
        data => data?.id === message.id
      ) as PromptMessage
      return {
        ...message,
        ...dataItem,
      }
    }),
    documents: props.documents,
    tenantPreferences: props.tenantPreferences,
    appSettings: props.appSettings,
    chatThreadLocked: (props.chatThread?.contentFilterTriggerCount || 0) >= MAX_CONTENT_FILTER_TRIGGER_COUNT_ALLOWED,
    handleSubmit,
    setChatBody,
    chatBody,
    setChatType,
    onConversationStyleChange,
    onConversationSensitivityChange,
    onIndexChange,
    fileState,
    id: props.id,
    features: props.features,
  }
}

export const useChatContext = (): ChatContextDefinition => {
  const context = useContext(ChatContext)
  if (!context) throw new Error("ChatContext is null")
  return context
}

type ChatProviderProps = {
  id: string
  chats: Array<UserChatMessageModel | AssistantChatMessageModel>
  chatThread: ChatThreadModel
  documents: ChatDocumentModel[]
  tenantPreferences?: UserSettings["tenant"]
  appSettings?: UserSettings["application"]
  indexes: UserSettings["indexes"]
  features: UserSettings["features"]
}
export default function ChatProvider({ children, ...rest }: PropsWithChildren<ChatProviderProps>): JSX.Element {
  const value = useChatHook(rest)
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

type ChatContextState = UseChatHelpers & {
  id: string
  setChatBody: (body: PromptBody) => void
  chatBody: PromptBody
  fileState: FileState
  setChatType: (value: ChatType) => void
  onConversationStyleChange: (value: ConversationStyle) => void
  onConversationSensitivityChange: (value: ConversationSensitivity) => void
  onIndexChange: (value: string) => void
  chatThreadLocked: boolean
  messages: PromptMessage[]
  documents: ChatDocumentModel[]
  tenantPreferences?: UserSettings["tenant"]
  appSettings?: UserSettings["application"]
  features: UserSettings["features"]
}
function getDefaultIndex(indexes: UserIndexConfig[], value: ChatType): UserIndexConfig | undefined {
  switch (value) {
    case ChatType.Audio:
      return indexes.find(i => i.id === process.env.NEXT_PUBLIC_DEFAULT_CHAT_AUDIO_INDEX_ID)
    case ChatType.Data:
      return indexes.find(i => i.id === process.env.NEXT_PUBLIC_DEFAULT_CHAT_DATA_INDEX_ID)
    case ChatType.Simple:
    default:
      return undefined
  }
}
