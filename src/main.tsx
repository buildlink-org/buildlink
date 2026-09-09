import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"

// Register service worker for PWA functionality
if ("serviceWorker" in navigator) {
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
