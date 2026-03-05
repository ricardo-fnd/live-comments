'use client'

import React, { useState } from 'react'

interface ToolbarProps {
  commentCount: number
  isCommentMode: boolean
  onToggleCommentMode: () => void
  onTogglePanel: () => void
  onOpenAllPages: () => void
  onOpenAdminLogin: () => void
  isAdmin: boolean
  onAdminLogout: () => void
}

export function Toolbar({
  commentCount,
  isCommentMode,
  onToggleCommentMode,
  onTogglePanel,
  onOpenAllPages,
  onOpenAdminLogin,
  isAdmin,
  onAdminLogout,
}: ToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      data-live-comments
      className="lc-fixed lc-bottom-5 lc-right-5 lc-z-[9999] lc-flex lc-flex-col lc-items-end lc-gap-2"
    >
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="lc-bg-white lc-rounded-lg lc-shadow-xl lc-border lc-border-gray-200 lc-py-1 lc-w-48 lc-animate-fade-in">
          <button
            onClick={() => {
              onTogglePanel()
              setIsExpanded(false)
            }}
            className="lc-w-full lc-text-left lc-px-4 lc-py-2 lc-text-sm lc-text-gray-700 hover:lc-bg-gray-50 lc-transition-colors lc-flex lc-items-center lc-justify-between"
          >
            <span>Comentários</span>
            {commentCount > 0 && (
              <span className="lc-bg-primary-100 lc-text-primary-700 lc-text-xs lc-px-1.5 lc-py-0.5 lc-rounded-full">
                {commentCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              onToggleCommentMode()
              setIsExpanded(false)
            }}
            className={`lc-w-full lc-text-left lc-px-4 lc-py-2 lc-text-sm lc-transition-colors ${
              isCommentMode
                ? 'lc-text-primary-700 lc-bg-primary-50'
                : 'lc-text-gray-700 hover:lc-bg-gray-50'
            }`}
          >
            {isCommentMode ? 'Sair do modo comentário' : 'Adicionar comentário'}
          </button>
          <div className="lc-border-t lc-border-gray-100 lc-my-1" />
          {isAdmin ? (
            <button
              onClick={() => {
                onAdminLogout()
                setIsExpanded(false)
              }}
              className="lc-w-full lc-text-left lc-px-4 lc-py-2 lc-text-sm lc-text-gray-500 hover:lc-bg-gray-50 lc-transition-colors"
            >
              Terminar sessão
            </button>
          ) : (
            <button
              onClick={() => {
                onOpenAdminLogin()
                setIsExpanded(false)
              }}
              className="lc-w-full lc-text-left lc-px-4 lc-py-2 lc-text-sm lc-text-gray-500 hover:lc-bg-gray-50 lc-transition-colors"
            >
              Entrar como admin
            </button>
          )}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lc-h-12 lc-rounded-full lc-shadow-lg lc-flex lc-items-center lc-justify-center lc-gap-2 lc-transition-all lc-border-0 lc-cursor-pointer lc-bg-white lc-text-gray-700 hover:lc-bg-gray-50 lc-border lc-border-gray-200 lc-w-12 md:lc-w-auto md:lc-px-4"
        aria-label="Comentários"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lc-flex-shrink-0">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="lc-hidden md:lc-inline lc-text-sm lc-font-medium">Adicionar comentários</span>
      </button>
    </div>
  )
}
