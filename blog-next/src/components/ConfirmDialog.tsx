import { createContext, useContext, useState, ReactNode } from "react"

interface ConfirmDialogContextType {
  showConfirm: (options: ConfirmDialogOptions) => Promise<boolean>
}

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export const ConfirmDialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialog, setDialog] = useState<ConfirmDialogOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const showConfirm = (options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog(options)
      setResolvePromise(() => resolve)
    })
  }

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true)
    }
    setDialog(null)
    setResolvePromise(null)
  }

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false)
    }
    setDialog(null)
    setResolvePromise(null)
  }

  const bgColors = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    info: "bg-blue-500 hover:bg-blue-600",
  }

  const icons = {
    danger: (
      <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    warning: (
      <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCancel}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-slide-in">
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                {icons[dialog.type || "warning"]}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{dialog.title}</h3>
              <p className="text-gray-600 mb-8">{dialog.message}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleCancel}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200"
                >
                  {dialog.cancelText || "取消"}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-8 py-3 text-white rounded-lg font-medium transition-all duration-200 ${bgColors[dialog.type || "danger"]}`}
                >
                  {dialog.confirmText || "确认"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmDialogContext.Provider>
  )
}

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider")
  }
  return context
}
