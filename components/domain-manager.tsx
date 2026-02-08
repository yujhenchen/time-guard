"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from 'react'

const domainSchema = z.object({
  domain: z
    .string()
    .min(3, "Domain must be at least 3 characters.")
    .max(100, "Domain must be at most 100 characters.")
    .regex(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/,
      "Please enter a valid domain (e.g., example.com)"
    ),
})

export function DomainManager() {
  const [domains, setDomains] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof domainSchema>>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domain: "",
    },
  })

  // Load domains from Chrome storage on mount
  useEffect(() => {
    const loadDomains = async () => {
      try {
        const result = await chrome.storage.sync.get(["blockedDomains"])
        setDomains(result.blockedDomains || [])
      } catch (error) {
        console.error("Error loading domains:", error)
        toast.error("Failed to load domains")
      } finally {
        setIsLoading(false)
      }
    }
    loadDomains()
  }, [])

  async function onSubmit(data: z.infer<typeof domainSchema>) {
    // TODO: Implement save functionality
    // - Validate domain doesn't already exist
    // - Save to Chrome storage
    // - Update local state
    // - Show success toast
    // - Reset form

    const newDomain = data.domain.toLowerCase().trim()

    // Check for duplicates
    if (domains.includes(newDomain)) {
      toast.error("Domain already exists", {
        description: `${newDomain} is already in your blocked list.`,
        position: "bottom-right",
      })
      return
    }

    try {
      const updatedDomains = [...domains, newDomain]
      await chrome.storage.sync.set({ blockedDomains: updatedDomains })
      setDomains(updatedDomains)
      form.reset()
      toast.success("Domain added successfully", {
        description: `${newDomain} has been added to your blocked list.`,
        position: "bottom-right",
      })
    } catch (error) {
      console.error("Error saving domain:", error)
      toast.error("Failed to save domain", {
        description: "Please try again later.",
        position: "bottom-right",
      })
    }
  }

  async function handleRemoveDomain(domainToRemove: string) {
    try {
      const updatedDomains = domains.filter((d) => d !== domainToRemove)
      await chrome.storage.sync.set({ blockedDomains: updatedDomains })
      setDomains(updatedDomains)
      toast.success("Domain removed", {
        description: `${domainToRemove} has been removed from your blocked list.`,
        position: "bottom-right",
      })
    } catch (error) {
      console.error("Error removing domain:", error)
      toast.error("Failed to remove domain")
    }
  }

  function handleCancel() {
    // TODO: Implement cancel functionality
    // - Reset form to default values
    // - Clear any validation errors
    // - Show confirmation if user has typed something
    
    if (form.formState.isDirty) {
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel? Your changes will be lost."
      )
      if (!confirmCancel) return
    }
    form.reset()
  }

  return (
    <Card className="w-full sm:max-w-2xl">
      <CardHeader>
        <CardTitle>Domain Management</CardTitle>
        <CardDescription>
          Add domains you want to block or manage your blocked domains list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="domain-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="domain"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="domain-input">
                    Add Domain
                  </FieldLabel>
                  <Input
                    {...field}
                    id="domain-input"
                    aria-invalid={fieldState.invalid}
                    placeholder="example.com"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Enter a domain name without protocol (http/https)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        {domains.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium leading-none mb-3">
                  Blocked Domains ({domains.length})
                </h3>
                <div className="space-y-2">
                  {domains.map((domain) => (
                    <div
                      key={domain}
                      className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <span className="font-mono">{domain}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveDomain(domain)}
                        className="h-8 text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {!isLoading && domains.length === 0 && (
          <>
            <Separator className="my-6" />
            <div className="text-center py-6 text-sm text-muted-foreground">
              No domains added yet. Add your first domain above.
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" form="domain-form" disabled={isLoading}>
            Add Domain
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
