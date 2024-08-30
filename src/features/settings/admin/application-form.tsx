import * as Form from "@radix-ui/react-form"
import { useRef, useState } from "react"

import { ApplicationSettings } from "@/features/models/application-models"
import { Button } from "@/features/ui/button"
import { Input } from "@/features/ui/input"
import { SwitchComponent } from "@/features/ui/switch"

type ApplicationFormProps = {
  formValues: ApplicationSettings
  onSubmit: (app: ApplicationSettings) => Promise<void>
  onClose?: () => void
}
export default function ApplicationForm({ formValues, onSubmit, onClose }: ApplicationFormProps): JSX.Element {
  const isCreating = !!onClose
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formValueRef = useRef({ ...formValues, dispatchToTenants: false })
  const [formState, setFormState] = useState({ ...formValues, dispatchToTenants: false })
  const [isPristine, setIsPristine] = useState(true)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target
    setFormState({ ...formState, [name]: value })
    setIsPristine(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    try {
      event.preventDefault()
      setIsSubmitting(true)
      await onSubmit({
        ...formState,
        termsAndConditionsDate: `${new Date(formState.termsAndConditionsDate).toISOString()}`,
      })
      formValueRef.current = formState
      setIsPristine(true)
      if (isCreating) onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Form.Root className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <Form.Field name={"id"} className="grid grid-cols-[minmax(auto,150px),1fr] items-center gap-4">
          <Form.Label htmlFor={"id"} className="text-right">
            Id:
          </Form.Label>
          <Form.Control asChild>
            <Input
              type="text"
              autoComplete="off"
              id="id"
              name="id"
              className="w-full"
              placeholder="Application id"
              aria-label="Application id"
              disabled={isSubmitting || !isCreating}
              value={formState.id}
              onChange={handleChange}
              required
            />
          </Form.Control>
        </Form.Field>
        <Form.Field name={"name"} className="grid grid-cols-[minmax(auto,150px),1fr] items-center gap-4">
          <Form.Label htmlFor={"name"} className="text-right">
            Name:
          </Form.Label>
          <Form.Control asChild>
            <Input
              type="text"
              autoComplete="off"
              id="name"
              name="name"
              className="w-full"
              placeholder="Application name"
              aria-label="Application name"
              disabled={isSubmitting}
              value={formState.name}
              onChange={handleChange}
              required
            />
          </Form.Control>
        </Form.Field>
        <Form.Field name={"description"} className="grid grid-cols-[minmax(auto,150px),1fr] items-center gap-4">
          <Form.Label htmlFor={"description"} className="text-right">
            Description:
          </Form.Label>
          <Form.Control asChild>
            <Input
              type="text"
              autoComplete="off"
              id="description"
              name="description"
              className="w-full"
              placeholder="Application description"
              aria-label="Application description"
              disabled={isSubmitting}
              value={formState.description}
              onChange={handleChange}
              required
            />
          </Form.Control>
        </Form.Field>
        <Form.Field name={"version"} className="grid grid-cols-[minmax(auto,150px),1fr] items-center gap-4">
          <Form.Label htmlFor={"version"} className="text-right">
            Version:
          </Form.Label>
          <Form.Control asChild>
            <Input
              type="text"
              autoComplete="off"
              id="version"
              name="version"
              className="w-full"
              placeholder="Application version"
              aria-label="Application version"
              disabled={isSubmitting}
              value={formState.version}
              onChange={handleChange}
              required
            />
          </Form.Control>
        </Form.Field>
        <Form.Field name={"version"} className="grid grid-cols-[minmax(auto,150px),1fr] items-center gap-4">
          <Form.Label htmlFor={"version"} className="text-right">
            T&Cs date:
          </Form.Label>
          <Form.Control asChild>
            <Input
              type="date"
              autoComplete="off"
              id="termsAndConditionsDate"
              name="termsAndConditionsDate"
              className="w-full"
              placeholder="Application terms & conditions date"
              aria-label="Application terms & conditions date"
              disabled={isSubmitting}
              value={formState.termsAndConditionsDate?.split("T")?.[0]}
              onChange={handleChange}
              required
            />
          </Form.Control>
        </Form.Field>
        <Form.Field name={"enable"} className="grid grid-cols-[minmax(auto,150px),1fr] items-center gap-4">
          <Form.Label htmlFor={"enable"} className="text-right">
            Update all tenants with this application:
          </Form.Label>
          <Form.Control asChild>
            <SwitchComponent
              id={"dispatch"}
              name={"dispatch"}
              variant="default"
              label=""
              isChecked={!!formState.dispatchToTenants}
              disabled={isSubmitting}
              onCheckedChange={() => {
                setFormState(prev => ({ ...prev, dispatchToTenants: !formState.dispatchToTenants }))
                setIsPristine(false)
              }}
            />
          </Form.Control>
        </Form.Field>
        <div className="mb-4 flex justify-end gap-4">
          {isCreating ? (
            <Button
              type="button"
              onClick={onClose}
              className="w-[14rem]"
              variant={"destructive"}
              disabled={isSubmitting}
              ariaLabel="Close"
            >
              Close
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                setFormState(formValueRef.current)
                setIsPristine(true)
              }}
              className="w-[14rem]"
              variant={"outline"}
              disabled={isSubmitting || isPristine}
              ariaLabel="Cancel"
            >
              Discard changes
            </Button>
          )}
          <Form.Submit asChild>
            <Button
              type="submit"
              className="w-[14rem]"
              variant="default"
              disabled={isSubmitting || (isPristine && !isCreating)}
              ariaLabel="Save changes"
            >
              {isSubmitting ? "Processing..." : `${isCreating ? "Create Application" : "Save changes"}`}
            </Button>
          </Form.Submit>
        </div>
      </Form.Root>
    </>
  )
}
