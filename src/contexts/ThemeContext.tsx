import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
	theme: Theme
	toggleTheme: () => void
	setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "buildlink-theme"

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const [theme, setThemeState] = useState<Theme>(() => {
		// Read persisted value first, then fall back to system preference
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
		if (stored === "dark" || stored === "light") return stored
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
	})

	// Keep <html> class in sync whenever theme changes
	useEffect(() => {
		const root = document.documentElement
		if (theme === "dark") {
			root.classList.add("dark")
		} else {
			root.classList.remove("dark")
		}
		localStorage.setItem(STORAGE_KEY, theme)
	}, [theme])

	const setTheme = (t: Theme) => setThemeState(t)

	const toggleTheme = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"))

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export const useTheme = (): ThemeContextType => {
	const ctx = useContext(ThemeContext)
	if (!ctx) throw new Error("useTheme must be used within a ThemeProvider")
	return ctx
}