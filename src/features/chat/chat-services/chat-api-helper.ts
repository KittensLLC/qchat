import { ChatCompletionMessageParam, ChatCompletionSystemMessageParam } from "openai/resources"

import { AGENCY_NAME, APP_NAME } from "@/app-global"

import { getTenantAndUser, getTenantId, userHashedId } from "@/features/auth/helpers"
import { ChatRole, ChatThreadModel, PromptMessage } from "@/features/chat/models"
import { GetIndexById } from "@/features/services/index-service"

import { similaritySearchVectorWithScore } from "./azure-cog-search/azure-cog-vector-store"
import { FindAllChatDocumentsForCurrentThread } from "./chat-document-service"

const buildSimpleChatSystemPrompt = async (): Promise<string> => {
  const { systemPrompt, tenantPrompt, userPrompt } = await getContextPrompts()
  const prompts = [systemPrompt, tenantPrompt, userPrompt].filter(Boolean).join("\n\n")
  return prompts
}

const DEFAULT_SYSTEM_PROMPT = `
- You are ${APP_NAME} who is a helpful AI Assistant developed to assist ${AGENCY_NAME} employees in their day-to-day tasks. \n
- You will provide clear and concise queries, and you will respond with polite and professional answers. \n
- You will answer questions truthfully and accurately. \n
- You will respond to questions in accordance with rules of ${AGENCY_NAME}. \n`.replace(/\s+/g, "^")
const getContextPrompts = async (): Promise<{
  systemPrompt: string
  tenantPrompt: string
  userPrompt: string
}> => {
  const [tenant, user] = await getTenantAndUser()
  return {
    systemPrompt: process.env.NEXT_PUBLIC_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT,
    tenantPrompt: (tenant.preferences?.contextPrompt || "").trim(),
    userPrompt: (user.preferences?.contextPrompt || "").trim(),
  }
}

const buildSimpleChatMessages = async (
  lastChatMessage: PromptMessage
): Promise<{
  systemMessage: ChatCompletionSystemMessageParam
  userMessage: ChatCompletionMessageParam
}> => {
  return {
    systemMessage: {
      content: await buildSimpleChatSystemPrompt(),
      role: ChatRole.System,
    },
    userMessage: {
      content: lastChatMessage.content,
      role: ChatRole.User,
    },
  }
}

const DEFAULT_DOCUMENT_INSTRUCTIONS = `
- Given the following extracted parts of a document, create a final answer.\n
- If the answer is not apparent from the retrieved documents you can respond but let the user know your answer is not based on the documents.\n
- You must always include a citation at the end of your answer and don't include full stop.\n
- Use the format for your citation {% citation items=[{name:"filename 1", id:"file id", order:"1"}, {name:"filename 2", id:"file id", order:"2"}] /%}\n`
const buildDataChatMessages = async (
  lastChatMessage: PromptMessage,
  chatThreadId: string,
  indexId: string,
  indexDescription: string
): Promise<{
  systemMessage: ChatCompletionSystemMessageParam
  userMessage: ChatCompletionMessageParam
  context: string
}> => {
  const [userId, tenantId] = await Promise.all([userHashedId(), getTenantId()])
  const relevantDocuments = await similaritySearchVectorWithScore(
    lastChatMessage.content,
    10,
    userId,
    chatThreadId,
    tenantId,
    indexId
  )
  const context = relevantDocuments
    .map(
      (result, index) =>
        `[${index}]. file name: ${result.fileName} \n file id: ${result.id} \n order: ${result.order} \n ${result.pageContent.replace(/(\r\n|\n|\r)/gm, "")}`
    )
    .join("\n------\n")
  const instructions = `${indexDescription || DEFAULT_DOCUMENT_INSTRUCTIONS}\nContext: ${context}`
  const systemPrompt = `${await buildSimpleChatSystemPrompt()}\n${instructions}`
  return {
    systemMessage: { content: systemPrompt, role: ChatRole.System },
    userMessage: { content: lastChatMessage.content, role: ChatRole.User },
    context,
  }
}

const DEFAULT_AUDIO_INSTRUCTIONS = `
- You are ${APP_NAME} an AI Assistant. Who must review the below audio transcriptions, then create a final answer. \n
- If the answer is not apparent from the retrieved documents you can respond but let the user know your answer is not based on the transcript.\n
- You must always include a citation at the end of your answer and don't include full stop.\n
- Use the format for your citation {% citation items=[{name:"filename 1", id:"file id", order:"1"}, {name:"filename 2", id:"file id", order:"2"}] /%}\n`
const buildAudioChatMessages = async (
  lastChatMessage: PromptMessage,
  chatThreadId: string,
  indexDescription: string
): Promise<{
  systemMessage: ChatCompletionSystemMessageParam
  userMessage: ChatCompletionMessageParam
  context: string
}> => {
  const documents = await FindAllChatDocumentsForCurrentThread(chatThreadId)
  if (documents.status !== "OK") throw documents.errors

  const context = documents.response
    .map((result, index) => `[${index}]. file name: ${result.name} \n file id: ${result.id} \n ${result.contents}`)
    .join("\n------\n")
  const instructions = `${indexDescription || DEFAULT_AUDIO_INSTRUCTIONS}\nContext: ${context}`
  const systemPrompt = `${await buildSimpleChatSystemPrompt()}\n${instructions}`
  return {
    systemMessage: { content: systemPrompt, role: ChatRole.System },
    userMessage: { content: lastChatMessage.content, role: ChatRole.User },
    context,
  }
}

export const buildMessages = async (
  chatType: string,
  message: PromptMessage,
  thread: ChatThreadModel
): Promise<{
  userMessage: ChatCompletionMessageParam
  metaPrompt: ChatCompletionSystemMessageParam
  shouldTranslate: boolean
  context: string
}> => {
  if (chatType === "simple" || !["data", "audio"].includes(chatType)) {
    const res = await buildSimpleChatMessages(message)
    return {
      userMessage: res.userMessage,
      metaPrompt: res.systemMessage,
      shouldTranslate: true,
      context: "",
    }
  }

  const indexResult = await GetIndexById(thread.indexId)
  if (indexResult.status !== "OK") throw indexResult.errors
  const indexDescription = indexResult.response.description
  const res =
    chatType === "audio"
      ? await buildAudioChatMessages(message, thread.chatThreadId, indexDescription)
      : await buildDataChatMessages(message, thread.chatThreadId, thread.indexId, indexDescription)
  return {
    userMessage: res.userMessage,
    metaPrompt: res.systemMessage,
    shouldTranslate: false,
    context: res.context,
  }
}
