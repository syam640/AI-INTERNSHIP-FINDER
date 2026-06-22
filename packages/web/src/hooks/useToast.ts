import { showSuccess, showError, showWarning, showInfo, showToast, dismissAll } from '@/components/ui/Toast'

export function useToast() {
  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast,
    dismissAll,
  }
}
