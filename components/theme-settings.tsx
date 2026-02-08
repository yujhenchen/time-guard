"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field
} from "@/components/ui/field"

export function ThemeSettings() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  // Load theme from Chrome storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const result = await chrome.storage.sync.get(["theme"])
        const savedTheme = result.theme || "light"
        setTheme(savedTheme)
        applyTheme(savedTheme)
      } catch (error) {
        console.error("Error loading theme:", error)
        // Fallback to system preference
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light"
        setTheme(systemTheme)
        applyTheme(systemTheme)
      }
      setMounted(true)
    }
    loadTheme()
  }, [])

  const applyTheme = (newTheme: "light" | "dark") => {
    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    setTheme(newTheme)
    applyTheme(newTheme)

    // Save theme preference to Chrome storage
    try {
      await chrome.storage.sync.set({ theme: newTheme })
    } catch (error) {
      console.error("Error saving theme:", error)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <Field>
        <div className="flex gap-2 mt-3 justify-center">
          <Button
            type="button"
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => handleThemeChange("light")}
            className="flex-1"
          >
            <Sun className="h-4 w-4 mr-2" />
            Light
          </Button>
          <Button
            type="button"
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => handleThemeChange("dark")}
            className="flex-1"
          >
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </Button>
        </div>
      </Field>
    </div>
  )
}
