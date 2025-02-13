import { UserEntity } from "@/features/database/entities"
import { GetUserById } from "@/features/services/user-service"
import { UserDetailsForm } from "@/features/settings/user-details"
import { UserDetailsFormProps } from "@/features/settings/user-details/user-details-form"

export const dynamic = "force-dynamic"

const toUserDetailsForm = (user: UserEntity): UserDetailsFormProps => ({
  preferences: user.preferences || { contextPrompt: "" },
  name: user.name || "",
  email: user.email || "",
})

const getPersona = async (tenantId: string, personaId: string): Promise<UserDetailsFormProps> => {
  if (!tenantId || !personaId) throw new Error("TenantId and PersonaId are required")
  const result = await GetUserById(tenantId, personaId)
  if (result.status !== "OK") throw new Error("Failed to get user preferences")
  return toUserDetailsForm(result.response)
}

type Props = {
  params: {
    tenantId: string
    personaId: string
  }
}
export default async function Home({ params: { tenantId, personaId } }: Props): Promise<JSX.Element> {
  const persona = await getPersona(tenantId, personaId)
  return <UserDetailsForm preferences={persona.preferences} name={persona.name} email={persona.email} />
}
