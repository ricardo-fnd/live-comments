'use client'

import React, { useState } from 'react'

interface CommentFormProps {
  onSubmit: (body: string) => void
  pinContext?: { selector: string; label: string } | null
  onCancelPin?: () => void
  isSubmitting?: boolean
}

export function CommentForm({ onSubmit, pinContext, onCancelPin, isSubmitting }: CommentFormProps) {
  const [body, setBody] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setBody('')
  }

  return (
    <form onSubmit={handleSubmit} data-live-comments className="lc-p-3 lc-border-b lc-border-gray-200">
      {pinContext && (
        <div className="lc-flex lc-items-center lc-gap-2 lc-mb-2 lc-px-2 lc-py-1.5 lc-bg-primary-50 lc-rounded-md lc-text-xs lc-text-primary-700">
          <span className="lc-inline-block lc-w-2 lc-h-2 lc-bg-primary-500 lc-rounded-full lc-flex-shrink-0" />
          <span className="lc-truncate lc-flex-1">Fixado em: «{pinContext.label}»</span>
          <button
            type="button"
            onClick={onCancelPin}
            className="lc-text-primary-500 hover:lc-text-primary-700 lc-flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Deixe um comentário..."
        rows={3}
        className="lc-w-full lc-px-3 lc-py-2 lc-border lc-border-gray-300 lc-rounded-md lc-text-sm lc-text-gray-900 lc-placeholder-gray-400 lc-resize-none focus:lc-outline-none focus:lc-ring-2 focus:lc-ring-primary-500 focus:lc-border-gray-300"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit(e)
          }
        }}
      />
      <div className="lc-flex lc-justify-between lc-items-center lc-mt-2">
        <span className="lc-text-xs lc-text-gray-400">⌘+Enter para enviar</span>
        <button
          type="submit"
          disabled={!body.trim() || isSubmitting}
          className="lc-px-4 lc-py-1.5 lc-text-sm lc-text-white lc-bg-primary-600 lc-rounded-md hover:lc-bg-primary-700 disabled:lc-opacity-50 disabled:lc-cursor-not-allowed lc-transition-colors"
        >
          {isSubmitting ? 'A enviar...' : 'Comentar'}
        </button>
      </div>
    </form>
  )
}
