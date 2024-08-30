import { ApplicationSettings } from "@/features/models/application-models"
import { GetApplications } from "@/features/services/application-service"
import AdminApplicationProvider from "@/features/settings/admin/application-provider"

import ErrorBoundary from "@/components/error-boundary"

const getApps = async (): Promise<ApplicationSettings[]> => {
  const result = await GetApplications()
  if (result.status !== "OK") throw new Error("Failed to get features")
  return result.response
}

export default async function Layout({ children }: { children: React.ReactNode }): Promise<JSX.Element> {
  return (
    <ErrorBoundary>
      <AdminApplicationProvider applications={await getApps()}>
        <div className="flex size-full flex-col gap-4 bg-altBackground text-foreground">{children}</div>
      </AdminApplicationProvider>
    </ErrorBoundary>
  )
}
