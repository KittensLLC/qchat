"use client"

import { useState } from "react"

import { showSuccess, showError } from "@/features/globals/global-message-store"
import logger from "@/features/insights/app-insights"
import { ApplicationSettings } from "@/features/models/application-models"
import ApplicationForm from "@/features/settings/admin/application-form"
import { useAdminAppContext } from "@/features/settings/admin/application-provider"
import { Button } from "@/features/ui/button"

import Typography from "@/components/typography"

export default function ApplicationPage(): JSX.Element {
  const { applications, setApplications } = useAdminAppContext()
  const [isCreating, setIsCreating] = useState(false)

  const saveApplication = async (app: ApplicationSettings): Promise<void> => {
    const errorMsg = `Failed to save application ${app.name}`
    try {
      const result = await fetch("/api/admin/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(app),
      })
      if (!result.ok) throw new Error(errorMsg)
      showSuccess({ title: "Success", description: "Application updated successfully!" })
      const isAppNew = !applications.find(t => t.id === app.id)
      setApplications(isAppNew ? [app, ...applications] : applications.map(a => (a.id === app.id ? app : a)))
    } catch (error) {
      showError(errorMsg)
      logger.error("Error updating applications", { error })
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-20">
      <Typography variant="h2" className="text-2xl font-bold tracking-tight">
        Application management
      </Typography>
      <div className="flex flex-col gap-4 rounded-md">
        {isCreating ? (
          <section className="w-full max-w-[800px] rounded-md border-2 p-2">
            <ApplicationForm
              formValues={{
                id: "",
                name: "",
                description: "",
                termsAndConditionsDate: "",
                version: "",
              }}
              onSubmit={saveApplication}
              onClose={() => setIsCreating(false)}
            />
          </section>
        ) : (
          <Button
            variant="default"
            className="w-[14rem] self-start p-2"
            onClick={() => setIsCreating(true)}
            ariaLabel={"Creare new application"}
          >
            Create new application
          </Button>
        )}
        {applications.map(app => (
          <section key={app.id} className="w-full max-w-[800px] rounded-md border-2 bg-altBackgroundShade p-2">
            <ApplicationForm formValues={app} onSubmit={saveApplication} />
          </section>
        ))}
      </div>
    </div>
  )
}
