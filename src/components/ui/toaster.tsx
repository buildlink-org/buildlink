/**
 * DEPRECATED: This Radix-based Toaster is no longer rendered.
 *
 * Toasts are now handled exclusively by Sonner (`@/components/ui/sonner.tsx`)
 * to avoid duplicate notification modals and ensure auto-dismiss behavior.
 *
 * This component is kept as a no-op for backward compatibility with any
 * imports that may still reference it. It renders nothing.
 */
export function Toaster() {
  return null;
}

export default Toaster;