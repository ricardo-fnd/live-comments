'use client'

import React from 'react'

interface PopupProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm?: () => void
  onCancel?: () => void
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'confirm' | 'info'
}

export function Popup({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'info',
}: PopupProps) {
  if (!isOpen) return null

  return (
    <div
      data-live-comments
      className="lc-fixed lc-inset-0 lc-z-[10002] lc-flex lc-items-center lc-justify-center lc-bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          variant === 'confirm' ? onCancel?.() : onConfirm?.()
        }
      }}
    >
      <div className="lc-bg-white lc-rounded-lg lc-shadow-xl lc-p-6 lc-w-80 lc-animate-fade-in">
        <h3 className="lc-text-sm lc-font-semibold lc-text-gray-900 lc-mb-2">
          {title}
        </h3>
        <p
          className="lc-text-sm lc-text-gray-600 lc-whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: message.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
        />
        <div className="lc-flex lc-gap-2 lc-mt-4">
          {variant === 'confirm' ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="lc-flex-1 lc-px-3 lc-py-2 lc-text-sm lc-text-gray-600 lc-bg-gray-100 lc-rounded-md hover:lc-bg-gray-200 lc-transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="lc-flex-1 lc-px-3 lc-py-2 lc-text-sm lc-text-white lc-bg-primary-600 lc-rounded-md hover:lc-bg-primary-700 lc-transition-colors"
              >
                {confirmLabel}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              className="lc-w-full lc-px-3 lc-py-2 lc-text-sm lc-text-white lc-bg-primary-600 lc-rounded-md hover:lc-bg-primary-700 lc-transition-colors"
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
