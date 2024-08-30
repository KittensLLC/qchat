"use client"

import { PropsWithChildren, createContext, useContext, useReducer } from "react"

import { ApplicationSettings } from "@/features/models/application-models"
import { ActionBase } from "@/lib/utils"

type AdminApplicationContextDefinition = ReturnType<typeof useAdminApplicationProviderContextHook>
const AdminApplicationContext = createContext<AdminApplicationContextDefinition | null>(null)

const useAdminApplicationProviderContextHook = ({ applications }: AdminApplicationProviderProps): State => {
  const [state, dispatch] = useReducer(appAdminReducer, {
    applications,
    setApplications: apps => dispatch({ type: "SET_APPLICATIONS", payload: apps }),
  })
  return { ...state }
}

export const useAdminAppContext = (): AdminApplicationContextDefinition => {
  const context = useContext(AdminApplicationContext)
  if (!context) throw new Error("AdminApplicationContext hasn't been provided!")
  return context
}

type AdminApplicationProviderProps = {
  applications: ApplicationSettings[]
}
export default function AdminApplicationProvider({
  children,
  ...props
}: PropsWithChildren<AdminApplicationProviderProps>): JSX.Element {
  const value = useAdminApplicationProviderContextHook(props)
  return <AdminApplicationContext.Provider value={value}>{children}</AdminApplicationContext.Provider>
}

type State = {
  applications: ApplicationSettings[]
  setApplications: (apps: ApplicationSettings[]) => void
}
function appAdminReducer(state: State, action: ACTION): State {
  switch (action.type) {
    case "SET_APPLICATIONS":
      return { ...state, applications: action.payload }
    default:
      return state
  }
}

type ACTION = ActionBase<"SET_APPLICATIONS", { payload: ApplicationSettings[] }>
