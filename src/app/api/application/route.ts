import { NextRequest } from "next/server"

import { ApplicationSettings } from "@/features/models/application-models"
import { GetApplicationSettings } from "@/features/services/application-service"

export async function GET(_request: NextRequest): Promise<Response> {
  const configResult = await GetApplicationSettings()
  if (configResult.status === "OK") {
    const response: ApplicationSettings = {
      id: configResult.response.id,
      name: configResult.response.name,
      description: configResult.response.description,
      version: configResult.response.version,
      termsAndConditionsDate: configResult.response.termsAndConditionsDate,
    }
    return new Response(JSON.stringify({ status: "OK", data: response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (configResult.status === "NOT_FOUND")
    return new Response(JSON.stringify({ error: "Application settings not found" }), { status: 404 })

  return new Response(JSON.stringify({ error: "Failed to retrieve application settings" }), { status: 500 })
}
