import * as React from "react"
import { ToastProps } from "@radix-ui/react-toast"

interface ExtendedToastProps extends ToastProps {
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ExtendedToastProps[]>([])

  const toast = (props: ExtendedToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])
    
    if (!props.duration || props.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, props.duration || 5000)
    }
  }

  return {
    toasts,
    toast,
  }
}