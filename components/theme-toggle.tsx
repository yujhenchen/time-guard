"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
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

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    applyTheme(newTheme)

    // Save theme preference to Chrome storage
    try {
      await chrome.storage.sync.set({ theme: newTheme })
    } catch (error) {
      console.error("Error saving theme:", error)
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
