/**
 * uploadUtils.ts
 * ─────────────────────────────────────────────────────────────
 * Centralised helper for every Supabase Storage upload in the
 * application. Provides:
 *   • Structured console logging at each stage of the upload flow
 *   • MIME-type allow-list validation (per upload context)
 *   • File-size limit enforcement (per upload context)
 *   • A consistent { url, error } return shape so callers can
 *     handle failures uniformly.
 * ─────────────────────────────────────────────────────────────
 */

import { supabase } from "@/integrations/supabase/client"

// ─── Types ────────────────────────────────────────────────────

export interface UploadResult {
  /** Public URL of the uploaded file, or null on failure. */
  url: string | null
  /** Human-readable error message if the upload failed, otherwise null. */
  error: string | null
}

/** Configuration for a single upload operation. */
export interface UploadConfig {
  /** Supabase Storage bucket name. */
  bucket: string
  /** Full storage path including filename, e.g. `user-123/1234567890.jpg`. */
  filePath: string
  /** Allowed MIME types (exact). e.g. `["image/jpeg", "application/pdf"]`. */
  allowedMimeTypes: readonly string[]
  /** Maximum allowed file size in bytes. */
  maxSizeBytes: number
  /** Human-readable label used in log messages, e.g. `"post image"`. */
  context: string
  /** Whether to upsert (overwrite) if the file already exists. Defaults to false. */
  upsert?: boolean
}

// ─── MIME allow-lists ─────────────────────────────────────────

export const ALLOWED_MIME = {
  /** Standard web-safe image formats. */
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ] as const,
  /** PDF documents only. */
  pdf: ["application/pdf"] as const,
  /** Images or PDFs (portfolio items). */
  imageOrPdf: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
  ] as const,
  /** Chat attachments: images or PDFs. */
  chatAttachment: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ] as const,
  /** Avatar images. */
  avatar: ["image/jpeg", "image/png", "image/gif", "image/webp"] as const,
} as const

// ─── Size limits (bytes) ──────────────────────────────────────

export const MAX_SIZE = {
  /** 10 MB – post images. */
  postImage: 10 * 1024 * 1024,
  /** 10 MB – PDF documents and portfolio items. */
  document: 10 * 1024 * 1024,
  /** 2 MB – profile avatars. */
  avatar: 2 * 1024 * 1024,
  /** 10 MB – chat attachments. */
  chatAttachment: 10 * 1024 * 1024,
  /** 10 MB – portfolio files. */
  portfolio: 10 * 1024 * 1024,
} as const

// ─── Logger ───────────────────────────────────────────────────

const LOG_PREFIX = "[uploadUtils]"

function logInfo(context: string, message: string, data?: unknown) {
  if (data !== undefined) {
    console.info(`${LOG_PREFIX} [${context}] ${message}`, data)
  } else {
    console.info(`${LOG_PREFIX} [${context}] ${message}`)
  }
}

function logWarn(context: string, message: string, data?: unknown) {
  if (data !== undefined) {
    console.warn(`${LOG_PREFIX} [${context}] ${message}`, data)
  } else {
    console.warn(`${LOG_PREFIX} [${context}] ${message}`)
  }
}

function logError(context: string, message: string, error?: unknown) {
  if (error !== undefined) {
    console.error(`${LOG_PREFIX} [${context}] ${message}`, error)
  } else {
    console.error(`${LOG_PREFIX} [${context}] ${message}`)
  }
}

// ─── Helpers ──────────────────────────────────────────────────

/** Returns `true` when the file's MIME type is in the allow-list. */
export function isMimeTypeAllowed(
  file: File,
  allowedTypes: readonly string[]
): boolean {
  const mime = file.type.toLowerCase()
  return allowedTypes.some((t) => mime === t.toLowerCase())
}

/** Returns a user-friendly label for a MIME type list. */
export function formatAllowedTypes(allowedTypes: readonly string[]): string {
  return allowedTypes
    .map((t) => {
      if (t === "application/pdf") return "PDF"
      if (t.startsWith("image/")) return t.replace("image/", "").toUpperCase()
      return t
    })
    .join(", ")
}

/** Returns a human-readable file size, e.g. "4.2 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Instantly validates a file against allowed MIME types and size limit without uploading. */
export function validateUploadFile(
  file: File,
  allowedTypes: readonly string[],
  maxSizeBytes: number
): { valid: boolean; error: string | null } {
  if (!isMimeTypeAllowed(file, allowedTypes)) {
    const allowed = formatAllowedTypes(allowedTypes)
    return {
      valid: false,
      error: `Invalid file type "${file.type || "unknown"}". Allowed types: ${allowed}.`,
    }
  }
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File "${file.name}" is too large (${formatFileSize(file.size)}). Maximum limit is ${formatFileSize(maxSizeBytes)}.`,
    }
  }
  return { valid: true, error: null }
}

/** Utility to parse single or multi-image JSON array string from DB `image_url`. */
export function parsePostImages(imageUrl?: string | null): string[] {
  if (!imageUrl) return []
  const trimmed = imageUrl.trim()
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && Boolean(item))
      }
    } catch {
      // Fallback if not valid JSON
    }
  }
  return [trimmed]
}

// ─── Core upload function ─────────────────────────────────────

/**
 * Validates and uploads a file to Supabase Storage.
 *
 * Stages logged:
 *  1. Attempt (file name, MIME, size, destination)
 *  2. MIME validation result
 *  3. Size validation result
 *  4. Storage upload result
 *  5. Public URL retrieval result
 *
 * @returns `{ url, error }` — url is non-null on success; error is non-null on failure.
 */
export async function uploadFile(
  file: File,
  config: UploadConfig
): Promise<UploadResult> {
  const {
    bucket,
    filePath,
    allowedMimeTypes,
    maxSizeBytes,
    context,
    upsert = false,
  } = config

  // 1 ── Log attempt ─────────────────────────────────────────
  logInfo(context, "Upload attempt started", {
    fileName: file.name,
    mimeType: file.type || "(empty)",
    size: formatFileSize(file.size),
    bucket,
    filePath,
  })

  // 2 ── MIME validation ──────────────────────────────────────
  if (!isMimeTypeAllowed(file, allowedMimeTypes)) {
    const allowed = formatAllowedTypes(allowedMimeTypes)
    const msg = `Invalid file type "${file.type || "unknown"}". Allowed: ${allowed}.`
    logWarn(context, `MIME validation failed — ${msg}`)
    return { url: null, error: msg }
  }
  logInfo(context, `MIME type "${file.type}" passed validation.`)

  // 3 ── Size validation ──────────────────────────────────────
  if (file.size > maxSizeBytes) {
    const msg = `File too large (${formatFileSize(file.size)}). Maximum is ${formatFileSize(maxSizeBytes)}.`
    logWarn(context, `Size validation failed — ${msg}`, {
      fileSize: file.size,
      maxSizeBytes,
    })
    return { url: null, error: msg }
  }
  logInfo(context, `File size ${formatFileSize(file.size)} passed validation.`)

  // 4 ── Storage upload ───────────────────────────────────────
  logInfo(context, `Uploading to "${bucket}/${filePath}"…`)

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert, contentType: file.type })

  if (uploadError) {
    logError(context, "Supabase Storage upload failed.", uploadError)
    const msg =
      uploadError.message?.toLowerCase().includes("duplicate") ||
      uploadError.message?.toLowerCase().includes("already exists")
        ? "A file with the same name already exists. Please try again."
        : `Upload failed: ${uploadError.message}`
    return { url: null, error: msg }
  }
  logInfo(context, "Storage upload succeeded. Retrieving public URL…")

  // 5 ── Public URL ───────────────────────────────────────────
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  if (!publicUrlData?.publicUrl) {
    const msg = "Upload succeeded but public URL could not be retrieved."
    logError(context, msg)
    return { url: null, error: msg }
  }

  logInfo(context, "Upload completed successfully.", {
    publicUrl: publicUrlData.publicUrl,
  })

  return { url: publicUrlData.publicUrl, error: null }
}

// ─── Convenience presets ──────────────────────────────────────

/** Upload a post image (JPEG/PNG/GIF/WEBP/SVG, max 10 MB) to `post-media`. */
export async function uploadPostImage(
  file: File,
  userId: string
): Promise<UploadResult> {
  const fileExt = file.name.split(".").pop()
  const filePath = `user-${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
  return uploadFile(file, {
    bucket: "post-media",
    filePath,
    allowedMimeTypes: ALLOWED_MIME.image,
    maxSizeBytes: MAX_SIZE.postImage,
    context: "post image",
  })
}

/** Upload multiple post images concurrently (max 10 MB per image) to `post-media`. */
export async function uploadPostImages(
  files: File[],
  userId: string
): Promise<{ urls: string[]; errors: string[] }> {
  const results = await Promise.all(files.map((file) => uploadPostImage(file, userId)))
  const urls: string[] = []
  const errors: string[] = []

  results.forEach((res, idx) => {
    if (res.url) {
      urls.push(res.url)
    } else if (res.error) {
      errors.push(`File ${files[idx].name}: ${res.error}`)
    }
  })

  return { urls, errors }
}

/** Upload a post PDF (PDF only, max 10 MB) to `post-media`. */
export async function uploadPostDocument(
  file: File,
  userId: string
): Promise<UploadResult> {
  const timestamp = Date.now()
  const fileExt = file.name.split(".").pop()
  const filePath = `user-${userId}/doc-${timestamp}.${fileExt}`
  return uploadFile(file, {
    bucket: "post-media",
    filePath,
    allowedMimeTypes: ALLOWED_MIME.pdf,
    maxSizeBytes: MAX_SIZE.document,
    context: "post document",
  })
}

/** Upload a profile avatar (JPEG/PNG/GIF/WEBP, max 2 MB) to `uploads`. Upserts. */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<UploadResult> {
  const fileExt = file.name.split(".").pop()
  const filePath = `avatars/${userId}-${Math.random()}.${fileExt}`
  return uploadFile(file, {
    bucket: "uploads",
    filePath,
    allowedMimeTypes: ALLOWED_MIME.avatar,
    maxSizeBytes: MAX_SIZE.avatar,
    context: "avatar",
    upsert: true,
  })
}

/** Upload a portfolio item (image or PDF, max 10 MB) to `portfolio`. */
export async function uploadPortfolioItem(
  file: File,
  profileId: string,
  subfolder = ""
): Promise<UploadResult> {
  const ext = file.name.split(".").pop()
  const base = subfolder ? `${profileId}/${subfolder}` : profileId
  const filePath = `${base}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`
  return uploadFile(file, {
    bucket: "portfolio",
    filePath,
    allowedMimeTypes: ALLOWED_MIME.imageOrPdf,
    maxSizeBytes: MAX_SIZE.portfolio,
    context: "portfolio item",
  })
}

/** Upload a portfolio thumbnail (image, max 10 MB) to `portfolio`. */
export async function uploadPortfolioThumbnail(
  file: File,
  profileId: string
): Promise<UploadResult> {
  const ext = file.name.split(".").pop()
  const filePath = `${profileId}/thumbnails/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`
  return uploadFile(file, {
    bucket: "portfolio",
    filePath,
    allowedMimeTypes: ALLOWED_MIME.image,
    maxSizeBytes: MAX_SIZE.portfolio,
    context: "portfolio thumbnail",
  })
}

/** Upload a chat attachment (image or PDF, max 10 MB) to `uploads`. */
export async function uploadChatAttachment(
  file: File,
  userId: string
): Promise<UploadResult> {
  const fileExt = file.name.split(".").pop()
  const filePath = `chat/${userId}-${Date.now()}.${fileExt}`
  return uploadFile(file, {
    bucket: "uploads",
    filePath,
    allowedMimeTypes: ALLOWED_MIME.chatAttachment,
    maxSizeBytes: MAX_SIZE.chatAttachment,
    context: "chat attachment",
    upsert: false,
  })
}
