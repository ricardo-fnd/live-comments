'use client'

import React, { useState } from 'react'

interface IdentityPromptProps {
  onSubmit: (name: string) => void
  onClose: () => void
}

export function IdentityPrompt({ onSubmit, onClose }: IdentityPromptProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div
      data-live-comments
      className="lc-fixed lc-inset-0 lc-z-[10001] lc-flex lc-items-center lc-justify-center lc-bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="lc-bg-white lc-rounded-lg lc-shadow-xl lc-p-6 lc-w-80 lc-animate-fade-in">
        <h3 className="lc-text-lg lc-font-semibold lc-text-gray-900 lc-mb-2">
          Qual é o seu nome?
        </h3>
        <p className="lc-text-sm lc-text-gray-500 lc-mb-4">
          Será apresentado junto aos seus comentários.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="O seu nome"
            autoFocus
            className="lc-w-full lc-px-3 lc-py-2 lc-border lc-border-gray-300 lc-rounded-md lc-text-sm lc-text-gray-900 lc-placeholder-gray-400 focus:lc-outline-none focus:lc-ring-2 focus:lc-ring-primary-500 focus:lc-border-gray-300"
          />
          <div className="lc-flex lc-gap-2 lc-mt-4">
            <button
              type="button"
              onClick={onClose}
              className="lc-flex-1 lc-px-3 lc-py-2 lc-text-sm lc-text-gray-600 lc-bg-gray-100 lc-rounded-md hover:lc-bg-gray-200 lc-transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="lc-flex-1 lc-px-3 lc-py-2 lc-text-sm lc-text-white lc-bg-primary-600 lc-rounded-md hover:lc-bg-primary-700 disabled:lc-opacity-50 disabled:lc-cursor-not-allowed lc-transition-colors"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
