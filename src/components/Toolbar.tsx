'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'


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
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)
  const hasMoved = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)


  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true
    hasMoved.current = false
    const rect = containerRef.current?.getBoundingClientRect()
    dragStart.current = {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return

    const x = e.clientX - dragStart.current.x
    const y = e.clientY - dragStart.current.y

    // Only start dragging after moving 5px to avoid accidental drags
    if (!hasMoved.current) {
      const rect = containerRef.current?.getBoundingClientRect()
      const dx = e.clientX - ((rect?.left ?? 0) + dragStart.current.x)
      const dy = e.clientY - ((rect?.top ?? 0) + dragStart.current.y)
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
      hasMoved.current = true
    }

    // Clamp to viewport
    const maxX = window.innerWidth - (containerRef.current?.offsetWidth ?? 48)
    const maxY = window.innerHeight - (containerRef.current?.offsetHeight ?? 48)
    setPosition({
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    })
  }, [])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Close menu on click outside
  useEffect(() => {
    if (!isExpanded) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (containerRef.current?.contains(target)) return
      setIsExpanded(false)
    }

    document.addEventListener('click', handleClickOutside, true)
    return () => document.removeEventListener('click', handleClickOutside, true)
  }, [isExpanded])

  const handleClick = useCallback(() => {
    // Don't toggle menu if we just finished dragging
    if (hasMoved.current) return
    setIsExpanded((prev) => !prev)
  }, [])

  const style: React.CSSProperties = position
    ? { position: 'fixed', left: position.x, top: position.y, bottom: 'auto', right: 'auto' }
    : {}

  return (
    <div
      ref={containerRef}
      data-live-comments
      className={`lc-fixed lc-z-[9999] lc-flex lc-flex-col lc-items-end lc-gap-2 ${!position ? 'lc-bottom-5 lc-right-5' : ''}`}
      style={style}
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        className="lc-h-12 lc-rounded-full lc-shadow-lg lc-flex lc-items-center lc-justify-center lc-gap-2 lc-transition-shadow lc-border-0 lc-cursor-grab active:lc-cursor-grabbing lc-bg-white lc-text-gray-700 hover:lc-bg-gray-50 lc-border lc-border-gray-200 lc-w-12 md:lc-w-auto md:lc-px-4 lc-select-none lc-touch-none"
        aria-label="Comentários"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lc-flex-shrink-0 lc-pointer-events-none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="lc-hidden md:lc-inline lc-text-sm lc-font-medium lc-pointer-events-none">Adicionar comentários</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lc-flex-shrink-0 lc-pointer-events-none lc-text-gray-400 lc-cursor-grab">
          <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
        </svg>
      </button>
    </div>
  )
}
