import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const getFilenameFromUrl = (url: string): string => {
	try {
		// Handle both full URLs and relative paths
		let pathname
		if (url.startsWith("http")) {
			const urlObj = new URL(url)
			pathname = urlObj.pathname
		} else {
			pathname = url
		}

		// Extract filename from path
		const filename = pathname.split("/").pop() || ""

		// Decode URL-encoded characters
		return decodeURIComponent(filename)
	} catch (error) {
		console.error("Error parsing filename from URL:", error)
		return "document.pdf"
	}
}

// timestamp utility function
export const formatTimestamp = (dateString: string, detailed: boolean = false): string => {
	const date = new Date(dateString)
	const now = new Date()

	// Set times to midnight for day comparison
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)
	const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

	const timeFormat = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
	const monthDayFormat = date.toLocaleDateString([], { month: "short", day: "numeric" })

	let dayString: string

	if (messageDate.getTime() === today.getTime()) {
		dayString = "Today"
	} else if (messageDate.getTime() === yesterday.getTime()) {
		dayString = "Yesterday"
	} else {
		dayString = monthDayFormat
	}

	if (detailed) {
		return `${dayString} at ${timeFormat}`
	} else {
		return dayString
	}
}

export const handleProfileClick = () => {
	if (post.author_id) {
		navigate(`/profile/${post.author_id}`)
	}
}

export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file) // don't touch non-images
      return
    }

    const img = new Image()
    const reader = new FileReader()

    reader.readAsDataURL(file)

    reader.onload = (event) => {
      img.src = event.target?.result as string
    }

    img.onload = () => {
      const canvas = document.createElement("canvas")

      // Resize logic (max 1280px)
      const MAX_WIDTH = 1280
      const MAX_HEIGHT = 1280

      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      ctx?.drawImage(img, 0, 0, width, height)

      // Compression (0.7 = good balance)
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"))

          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
          })

          resolve(compressedFile)
        },
        "image/jpeg",
        0.7
      )
    }

    img.onerror = reject
  })
}

