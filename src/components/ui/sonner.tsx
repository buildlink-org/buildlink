import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Single, unified toast/notification renderer for the whole app.
 *
 * Configuration goals:
 * - One notification system (no duplicate modals)
 * - Auto-dismiss (4s default, 6s for errors) so notifications never "stick"
 * - Consistent bottom-right position on mobile + desktop (non-distracting)
 * - Smooth, subtle slide/fade animations
 * - Theme-aware: uses the app's CSS variables so toasts match light/dark mode
 *   (we intentionally avoid `richColors` because it overrides our theme tokens
 *   with Sonner's hardcoded palette, which breaks dark mode and causes toasts
 *   to look like they "stick" / stack incorrectly)
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-right"
      closeButton
      duration={4000}
      // Limit how many toasts are visible at once so they don't pile up.
      visibleToasts={4}
      // Expand stacked toasts so each one is readable instead of overlapping.
      expand
      // NOTE: `richColors` is intentionally OFF. When enabled, Sonner ignores
      // our theme CSS variables and uses its own fixed colors, which makes
      // toasts appear as plain white in both light and dark mode and causes
      // the visual "sticking/stacking" issue.
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        // Inline styles guarantee the theme tokens are applied even before
        // Tailwind classes resolve, and they work reliably in dark mode.
        style: {
          background: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
        ...props.toastOptions,
      }}
      {...props}
    />
  );
};

export { Toaster };