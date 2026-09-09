import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

// Register service worker for PWA functionality (production only).
// In development the SW intercepts Vite dev-server requests, which causes
// "Failed to fetch" noise and can serve a stale cached index.html after HMR
// reloads. Unregister any previously-installed SW and clear its caches.
if (import.meta.env.DEV) {
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.getRegistrations().then((registrations) => {
			for (const registration of registrations) {
				registration.unregister()
			}
		})
		if ("caches" in window) {
			caches.keys().then((names) => {
				for (const name of names) {
					caches.delete(name)
				}
			})
		}
	}
} else if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("/sw.js")
			.then((registration) => {
				// Listen for updates
				registration.addEventListener("updatefound", () => {
					const newWorker = registration.installing
					if (newWorker) {
						newWorker.addEventListener("statechange", () => {
							if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
								// New update available
								// console.log("New content is available; please refresh.")
							}
						})
					}
				})
			})
			.catch((registrationError) => {
				console.log("SW registration failed: ", registrationError)
			})
	})
}

createRoot(document.getElementById("root")!).render(<App />)
