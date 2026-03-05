'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { generateSelector, getClickPosition } from '../lib/selector.js'

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

function getPinLabel(el: Element): string {
  // 1. If it's an image, use alt text or "Imagem"
  if (el.tagName === 'IMG') {
    const alt = (el as HTMLImageElement).alt?.trim()
    return alt ? `Imagem - ${truncate(alt, 40)}` : 'Imagem'
  }

  // 2. Check for direct text content (not from deep children)
  const directText = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent?.trim() || '')
    .join(' ')
    .trim()
  if (directText) return truncate(directText, 50)

  // 3. Look for an img inside
  const img = el.querySelector('img')
  if (img) {
    const alt = img.alt?.trim()
    return alt ? `Imagem - ${truncate(alt, 40)}` : 'Imagem'
  }

  // 4. Look for any text content inside children
  const innerText = (el.textContent || '').trim()
  if (innerText) return truncate(innerText, 50)

  // 5. Walk up parents looking for an img nearby
  let parent = el.parentElement
  while (parent && parent !== document.body) {
    if (parent.tagName === 'IMG') {
      const alt = (parent as HTMLImageElement).alt?.trim()
      return alt ? `Imagem - ${truncate(alt, 40)}` : 'Imagem'
    }
    const parentImg = parent.querySelector('img')
    if (parentImg) {
      const alt = parentImg.alt?.trim()
      return alt ? `Imagem - ${truncate(alt, 40)}` : 'Imagem'
    }
    parent = parent.parentElement
  }

  // 6. Fallback to tag name
  return el.tagName.toLowerCase()
}

interface PinOverlayProps {
  isActive: boolean
  onPin: (selector: string, xPct: number, yPct: number, label: string) => void
  onCancel: () => void
}

export function PinOverlay({ isActive, onPin, onCancel }: PinOverlayProps) {
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)

  const isLiveCommentsElement = useCallback((el: Element): boolean => {
    return !!el.closest('[data-live-comments]')
  }, [])

  useEffect(() => {
    if (!isActive) {
      setHoveredElement(null)
      setHighlightRect(null)
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as Element
      if (isLiveCommentsElement(target)) {
        setHoveredElement(null)
        setHighlightRect(null)
        return
      }
      setHoveredElement(target)
      setHighlightRect(target.getBoundingClientRect())
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element
      if (isLiveCommentsElement(target)) return

      e.preventDefault()
      e.stopPropagation()

      const selector = generateSelector(target)
      if (!selector) return

      const { xPct, yPct } = getClickPosition(target, e.clientX, e.clientY)
      const label = getPinLabel(target)
      onPin(selector, xPct, yPct, label)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }

    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('click', handleClick, true)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, onPin, onCancel, isLiveCommentsElement])

  if (!isActive) return null

  return (
    <>
      {/* Full-screen overlay with pointer-events-none to let clicks through */}
      <div
        data-live-comments
        className="lc-fixed lc-inset-0 lc-z-[9998]"
        style={{ pointerEvents: 'none' }}
      >
        {/* Instruction banner */}
        <div
          className="lc-fixed lc-top-4 lc-left-1/2 lc--translate-x-1/2 lc-bg-primary-600 lc-text-white lc-px-4 lc-py-2 lc-rounded-full lc-text-sm lc-shadow-lg lc-animate-fade-in"
          style={{ pointerEvents: 'auto' }}
        >
          Clique num elemento para fixar um comentário · Esc para cancelar
        </div>
      </div>

      {/* Highlight box */}
      {highlightRect && hoveredElement && (
        <div
          data-live-comments
          className="lc-fixed lc-z-[9997] lc-pointer-events-none lc-border-2 lc-border-primary-500 lc-bg-primary-500/10 lc-rounded-sm lc-transition-all lc-duration-75"
          style={{
            top: highlightRect.top - 2,
            left: highlightRect.left - 2,
            width: highlightRect.width + 4,
            height: highlightRect.height + 4,
          }}
        />
      )}

      {/* Change cursor globally */}
      <style>{`
        body { cursor: crosshair !important; }
        body * { cursor: crosshair !important; }
        [data-live-comments] { cursor: default !important; }
        [data-live-comments] * { cursor: default !important; }
      `}</style>
    </>
  )
}
