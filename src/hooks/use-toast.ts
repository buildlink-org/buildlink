import { toast as sonnerToast } from "sonner";

/**
 * Lightweight wrapper around Sonner to maintain backward compatibility
 * with the previous Radix-based useToast API (`toast({ title, description, variant })`).
 *
 * Why: The app previously mounted TWO toast systems (Radix Toaster + Sonner),
 * causing duplicate notifications. Sonner now handles everything with proper
 * auto-dismiss and smooth animations.
 */

export type ToastVariant = "default" | "destructive";

export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  /** Optional action element (kept for API compatibility) */
  action?: React.ReactElement;
  /** Override auto-dismiss duration (ms) */
  duration?: number;
  [key: string]: unknown;
}

interface ToastReturn {
  id: string | number;
  dismiss: () => void;
  update: (props: Partial<ToastProps>) => void;
}

const DEFAULT_DURATION = 4000;
const DESTRUCTIVE_DURATION = 6000;

/**
 * Drop-in replacement for the old imperative `toast()` function.
 * Maps `{ title, description, variant }` to Sonner's API.
 */
function toast(props: ToastProps): ToastReturn {
  const {
    title,
    description,
    variant,
    duration,
    action,
    ...rest
  } = props;

  const resolvedDuration =
    duration ?? (variant === "destructive" ? DESTRUCTIVE_DURATION : DEFAULT_DURATION);

  const options: Record<string, unknown> = {
    description,
    duration: resolvedDuration,
    ...rest,
  };

  // Map destructive variant to Sonner's error toast for visual distinction
  let id: string | number;
  if (variant === "destructive") {
    id = sonnerToast.error(title, options);
  } else {
    id = sonnerToast(title, options);
  }

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
    update: (newProps: Partial<ToastProps>) => {
      const {
        title: newTitle,
        description: newDesc,
        variant: newVariant,
        ...newRest
      } = newProps;
      const mergedOptions = {
        id,
        description: newDesc ?? description,
        duration: newProps.duration ?? resolvedDuration,
        ...newRest,
      };
      if (newVariant === "destructive") {
        sonnerToast.error(newTitle ?? title, mergedOptions);
      } else {
        sonnerToast(newTitle ?? title, mergedOptions);
      }
    },
  };
}

/**
 * Backward-compatible hook. Previously returned reactive `toasts` array;
 * now returns an empty array since Sonner manages its own rendering.
 * `toast` and `dismiss` still work as before.
 */
function useToast() {
  return {
    toasts: [] as never[],
    toast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  };
}

export { useToast, toast };