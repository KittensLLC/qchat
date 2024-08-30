import { ServerActionResponseAsync } from "@/features/common/server-action-response"
import { ApplicationContainer } from "@/features/database/cosmos-containers"
import { ApplicationEntity, TenantEntity } from "@/features/database/entities"
import { ApplicationSettings } from "@/features/models/application-models"
import { TenantApplicationConfig } from "@/features/models/tenant-models"
import { UserApplicationConfig } from "@/features/models/user-models"

export const GetApplications = async (): ServerActionResponseAsync<ApplicationSettings[]> => {
  try {
    const container = await ApplicationContainer()
    const { resources } = await container.items
      .query<ApplicationEntity>({ query: "SELECT * FROM c ORDER BY c.createdOn ASC" })
      .fetchAll()
    return {
      status: "OK",
      response: resources.length
        ? resources.map(r => ({
            id: r.applicationId,
            name: r.name,
            description: r.description,
            version: r.version,
            termsAndConditionsDate: r.termsAndConditionsDate,
          }))
        : [],
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    }
  }
}

export const GetApplicationSettings = async (): ServerActionResponseAsync<ApplicationSettings> => {
  try {
    if (!process.env.APPLICATION_ID) throw new Error("APPLICATION_ID not set")
    const query = {
      query: "SELECT * FROM c WHERE c.applicationId = @applicationId",
      parameters: [{ name: "@applicationId", value: process.env.APPLICATION_ID }],
    }
    const container = await ApplicationContainer()
    const { resources } = await container.items.query<ApplicationEntity>(query).fetchAll()
    if (!resources[0]) throw `Application not found with id: ${process.env.APPLICATION_ID}`
    return {
      status: "OK",
      response: resources[0],
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

export const GetTenantApplication = async (
  tenantApp: TenantEntity["application"]
): ServerActionResponseAsync<TenantApplicationConfig> => {
  try {
    const container = await ApplicationContainer()
    const { resources } = await container.items
      .query<ApplicationEntity>({
        query: "SELECT * FROM c WHERE c.applicationId = @applicationId",
        parameters: [{ name: "@applicationId", value: tenantApp.id }],
      })
      .fetchAll()
    if (!resources.length) throw new Error(`Tenant application not found with id: ${tenantApp.id}`)
    return {
      status: "OK",
      response: {
        applicationId: resources[0].applicationId,
        name: resources[0].name,
        description: resources[0].description,
        enabled: tenantApp.enabled,
        accessGroups: tenantApp.accessGroups,
      },
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}

export const GetUserApplication = async (
  tenantApp: TenantEntity["application"]
): ServerActionResponseAsync<UserApplicationConfig> => {
  try {
    const container = await ApplicationContainer()
    const { resources } = await container.items
      .query<ApplicationEntity>({
        query: "SELECT * FROM c WHERE c.applicationId = @applicationId",
        parameters: [{ name: "@applicationId", value: tenantApp.id }],
      })
      .fetchAll()
    if (!resources.length) throw new Error(`Tenant application not found with id: ${tenantApp.id}`)
    return {
      status: "OK",
      response: {
        id: resources[0].applicationId,
        name: resources[0].name,
        description: resources[0].description,
        version: resources[0].version,
        termsAndConditionsDate: resources[0].termsAndConditionsDate,
      },
    }
  } catch (e) {
    return {
      status: "ERROR",
      errors: [{ message: `${e}` }],
    }
  }
}
