import { NextRequest, NextResponse } from "next/server"
import * as yup from "yup"

import { userSession } from "@/features/auth/helpers"
import { UpdateUser } from "@/features/services/user-service"

const userUpdateSchema = yup
  .object({
    userId: yup.string().required(),
    tenantId: yup.string().required(),
  })
  .noUnknown(true, "Attempted to update invalid fields")

export async function POST(_request: NextRequest, _response: NextResponse): Promise<Response> {
  try {
    const user = await userSession()
    const validatedData = await userUpdateSchema.validate(
      { userId: user?.userId, tenantId: user?.tenantId },
      { abortEarly: false, stripUnknown: true }
    )
    const { userId, tenantId } = validatedData

    const updatedUserResult = await UpdateUser(tenantId, userId, { accepted_terms: true })
    if (updatedUserResult.status === "OK")
      return new Response(JSON.stringify(updatedUserResult.response), { status: 200 })
    return new Response(JSON.stringify({ error: "Failed to update T&Cs" }), { status: 400 })
  } catch (error) {
    const errorMessage = error instanceof yup.ValidationError ? { errors: error.errors } : "Internal Server Error"
    return new Response(JSON.stringify(errorMessage), { status: error instanceof yup.ValidationError ? 400 : 500 })
  }
}
