'use client'

import React, { useState } from 'react'

interface CommentPopupProps {
  isOpen: boolean
  pinLabel?: string | null
  onSubmit: (body: string) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function CommentPopup({
  isOpen,
  pinLabel,
  onSubmit,
  onCancel,
  isSubmitting,
}: CommentPopupProps) {
  const [body, setBody] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setBody('')
  }

  return (
    <div
      data-live-comments
      className="lc-fixed lc-inset-0 lc-z-[10001] lc-flex lc-items-center lc-justify-center lc-bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="lc-bg-white lc-rounded-lg lc-shadow-xl lc-p-6 lc-w-96 lc-animate-fade-in">
        <h3 className="lc-text-sm lc-font-semibold lc-text-gray-900 lc-mb-1">
          Novo comentário
        </h3>
        {pinLabel && (
          <div className="lc-flex lc-items-center lc-gap-2 lc-mb-3 lc-text-xs lc-text-primary-700">
            <span className="lc-inline-block lc-w-2 lc-h-2 lc-bg-primary-500 lc-rounded-full lc-flex-shrink-0" />
            <span className="lc-truncate">Fixado em: «{pinLabel}»</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escreva o seu comentário..."
            rows={4}
            autoFocus
            className="lc-w-full lc-px-3 lc-py-2 lc-border lc-border-gray-300 lc-rounded-md lc-text-sm lc-text-gray-900 lc-placeholder-gray-400 lc-resize-none focus:lc-outline-none focus:lc-ring-2 focus:lc-ring-primary-500 focus:lc-border-gray-300"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e)
              }
            }}
          />
          <div className="lc-flex lc-justify-between lc-items-center lc-mt-3">
            <span className="lc-text-xs lc-text-gray-400">⌘+Enter para enviar</span>
            <div className="lc-flex lc-gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="lc-px-4 lc-py-2 lc-text-sm lc-text-gray-600 lc-bg-gray-100 lc-rounded-md hover:lc-bg-gray-200 lc-transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!body.trim() || isSubmitting}
                className="lc-px-4 lc-py-2 lc-text-sm lc-text-white lc-bg-primary-600 lc-rounded-md hover:lc-bg-primary-700 disabled:lc-opacity-50 disabled:lc-cursor-not-allowed lc-transition-colors"
              >
                {isSubmitting ? 'A enviar...' : 'Comentar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
