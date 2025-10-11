"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AlertModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  variant?: "default" | "destructive"
}

export function AlertModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "OK",
  cancelText,
  onConfirm,
  variant = "default",
}: AlertModalProps) {
  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelText && <AlertDialogCancel className="border-border bg-transparent">{cancelText}</AlertDialogCancel>}
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary-hover"
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
