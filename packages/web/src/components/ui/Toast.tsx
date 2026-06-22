import toast from 'react-hot-toast'
import { ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

const icons: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
}

function show(message: string, type: ToastType = 'info', duration = 4000) {
  const icon = icons[type]
  const opts = { duration }

  switch (type) {
    case 'success':
      toast.success(`${icon} ${message}`, opts)
      break
    case 'error':
      toast.error(`${icon} ${message}`, opts)
      break
    default:
      toast(`${icon} ${message}`, opts)
  }
}

export function showSuccess(message: string) {
  show(message, 'success')
}

export function showError(message: string) {
  show(message, 'error')
}

export function showWarning(message: string) {
  show(message, 'warning')
}

export function showInfo(message: string) {
  show(message, 'info')
}

export function showToast(message: string, type?: ToastType) {
  show(message, type)
}

export function dismissAll() {
  toast.dismiss()
}
