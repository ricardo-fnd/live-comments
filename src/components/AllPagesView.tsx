'use client'

import React, { useEffect, useState } from 'react'
import type { Comment } from '../actions/comments.js'

interface AllPagesViewProps {
  isOpen: boolean
  onClose: () => void
  fetchAllComments: () => Promise<Record<string, Comment[]>>
}

export function AllPagesView({ isOpen, onClose, fetchAllComments }: AllPagesViewProps) {
  const [pages, setPages] = useState<Record<string, Comment[]>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setIsLoading(true)
    fetchAllComments()
      .then(setPages)
      .finally(() => setIsLoading(false))
  }, [isOpen, fetchAllComments])

  if (!isOpen) return null

  const entries = Object.entries(pages)

  return (
    <div
      data-live-comments
      className="lc-fixed lc-inset-0 lc-z-[10001] lc-flex lc-items-center lc-justify-center lc-bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="lc-bg-white lc-rounded-lg lc-shadow-xl lc-w-[480px] lc-max-h-[80vh] lc-flex lc-flex-col lc-animate-fade-in">
        <div className="lc-flex lc-items-center lc-justify-between lc-px-4 lc-py-3 lc-border-b lc-border-gray-200">
          <h3 className="lc-text-sm lc-font-semibold lc-text-gray-900">Todas as páginas</h3>
          <button
            onClick={onClose}
            className="lc-text-gray-400 hover:lc-text-gray-600 lc-transition-colors lc-text-lg lc-leading-none"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="lc-flex-1 lc-overflow-y-auto lc-p-4">
          {isLoading ? (
            <p className="lc-text-sm lc-text-gray-400 lc-text-center">A carregar...</p>
          ) : entries.length === 0 ? (
            <p className="lc-text-sm lc-text-gray-400 lc-text-center">Ainda não há comentários em nenhuma página.</p>
          ) : (
            <div className="lc-space-y-3">
              {entries.map(([path, comments]) => {
                const open = comments.filter((c) => c.status === 'open').length
                const resolved = comments.filter((c) => c.status === 'resolved').length
                return (
                  <div
                    key={path}
                    className="lc-p-3 lc-border lc-border-gray-200 lc-rounded-md hover:lc-bg-gray-50 lc-transition-colors"
                  >
                    <div className="lc-text-sm lc-font-medium lc-text-gray-900 lc-truncate">
                      {path}
                    </div>
                    <div className="lc-flex lc-gap-3 lc-mt-1 lc-text-xs lc-text-gray-500">
                      <span>{open} aberto(s)</span>
                      <span>{resolved} resolvido(s)</span>
                      <span>{comments.length} total</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
