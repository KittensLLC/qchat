export interface UserIdentity {
  userId: string
  tenantId: string
  email: string
  name: string
  upn: string
  admin: boolean
  /** @deprecated use admin instead */
  qchatAdmin?: boolean
  tenantAdmin: boolean
  globalAdmin: boolean
}

export interface UserActivity {
  last_login?: Date | null
  first_login?: Date | null
  accepted_terms?: boolean
  accepted_terms_date?: string
  groups: string[]
  failed_login_attempts: number
  last_failed_login: Date | null
  last_version_seen: string | null
}

export interface UserPreferences {
  contextPrompt: string
  /** @deprecated relocated activity tracking */
  history?: {
    updatedOn: string
    setting: string
    value: string
  }[]
}

export interface UserRecord extends UserIdentity, UserActivity {
  id: string
  preferences?: UserPreferences
  /** @deprecated relocated activity tracking */
  history?: string[]
}

export interface UserSettings {
  application: UserApplicationConfig
  tenant: UserTenantConfig
  smartTools: UserSmartToolConfig[]
  features: UserFeatureConfig[]
  indexes: UserIndexConfig[]
}

export interface UserApplicationConfig {
  id: string
  name: string
  description: string
  version: string
  termsAndConditionsDate: string
}
export interface UserTenantConfig {
  contextPrompt: string
  customReferenceFields: { name: "internalReference"; pattern: RegExp; label: string }[]
}
export interface UserSmartToolConfig {
  id: string
  name: string
  template: string
}
export interface UserFeatureConfig {
  id: string
  name: string
  description: string
}
export interface UserIndexConfig {
  id: string
  name: string
  description: string
}
