import { ChatCompletionMessageParam } from "openai/resources"

import { ChatMessageModel } from "@/features/chat/models"

export function mapOpenAIChatMessages(messages: ChatMessageModel[]): ChatCompletionMessageParam[] {
  return messages.map(mapOpenAIChatMessage)
}

function mapOpenAIChatMessage(message: ChatMessageModel): ChatCompletionMessageParam {
  return {
    role: message.role,
    content: message.content,
  } as ChatCompletionMessageParam
}
