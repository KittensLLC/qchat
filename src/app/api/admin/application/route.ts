import { NextRequest } from "next/server"
import * as yup from "yup"

import { UpdateApplication } from "@/features/services/admin-service"

const applicationSchema = yup.object({
  name: yup.string().required(),
  description: yup.string().required(),
  version: yup.string().required(),
  termsAndConditionsDate: yup.string().required(),
  dispatchToTenants: yup.boolean().required(),
})
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const requestBody = await request.json()
    const validatedData = await applicationSchema.validate(requestBody, { abortEarly: false, stripUnknown: true })
    const result = await UpdateApplication(
      { ...validatedData, id: process.env.APPLICATION_ID },
      validatedData.dispatchToTenants
    )
    if (result.status === "OK") return new Response(JSON.stringify(result.response), { status: 200 })
    return new Response(JSON.stringify({ error: "Failed to update feature" }), { status: 500 })
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error instanceof yup.ValidationError ? 400 : 500,
    })
  }
}
