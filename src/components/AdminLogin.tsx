'use client'

import React, { useState } from 'react'

interface AdminLoginProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  onClose: () => void
}

export function AdminLogin({ onLogin, onClose }: AdminLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await onLogin(username, password)
      if (!result.success) {
        setError(result.error ?? 'Login failed')
      }
    } catch {
      setError('Falha ao iniciar sessão')
    } finally {
      setIsLoading(false)
    }
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
        <h3 className="lc-text-lg lc-font-semibold lc-text-gray-900 lc-mb-4">Entrar como admin</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Utilizador"
            autoFocus
            className="lc-w-full lc-px-3 lc-py-2 lc-mb-3 lc-border lc-border-gray-300 lc-rounded-md lc-text-sm lc-text-gray-900 lc-placeholder-gray-400 focus:lc-outline-none focus:lc-ring-2 focus:lc-ring-primary-500 focus:lc-border-gray-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Palavra-passe"
            className="lc-w-full lc-px-3 lc-py-2 lc-mb-3 lc-border lc-border-gray-300 lc-rounded-md lc-text-sm lc-text-gray-900 lc-placeholder-gray-400 focus:lc-outline-none focus:lc-ring-2 focus:lc-ring-primary-500 focus:lc-border-gray-300"
          />
          {error && (
            <p className="lc-text-sm lc-text-red-600 lc-mb-3">{error}</p>
          )}
          <div className="lc-flex lc-gap-2">
            <button
              type="button"
              onClick={onClose}
              className="lc-flex-1 lc-px-3 lc-py-2 lc-text-sm lc-text-gray-600 lc-bg-gray-100 lc-rounded-md hover:lc-bg-gray-200 lc-transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!username || !password || isLoading}
              className="lc-flex-1 lc-px-3 lc-py-2 lc-text-sm lc-text-white lc-bg-primary-600 lc-rounded-md hover:lc-bg-primary-700 disabled:lc-opacity-50 disabled:lc-cursor-not-allowed lc-transition-colors"
            >
              {isLoading ? 'A entrar...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
