'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { CommentForm } from './CommentForm.js'
import { CommentThread } from './CommentThread.js'
import type { Comment } from '../actions/comments.js'

interface CommentPanelProps {
  isOpen: boolean
  onClose: () => void
  comments: Comment[]
  currentPage: string
  isAdmin: boolean
  onSubmitComment: (body: string) => void
  onResolve: (id: string) => void
  onDelete: (id: string) => void
  onNotifyOwner: () => void
  onClickPin?: (comment: Comment) => void
  pinContext?: { selector: string; label: string } | null
  onCancelPin?: () => void
  isSubmitting?: boolean
  isLoading?: boolean
  isNotifying?: boolean
}

const ALL_PAGES = '__all__'

function formatPagePath(path: string): string {
  if (path === '/') return 'Início'
  // Remove leading slash, take last segment, replace dashes with spaces, capitalize first word
  const segment = path.replace(/^\//, '').split('/').pop() || path
  const words = segment.replace(/-/g, ' ').split(' ')
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
  return words.join(' ')
}

export function CommentPanel({
  isOpen,
  onClose,
  comments,
  currentPage,
  isAdmin,
  onSubmitComment,
  onResolve,
  onDelete,
  onNotifyOwner,
  onClickPin,
  pinContext,
  onCancelPin,
  isSubmitting,
  isLoading,
  isNotifying,
}: CommentPanelProps) {
  const [pageFilter, setPageFilter] = useState(currentPage)

  useEffect(() => {
    setPageFilter(currentPage)
  }, [currentPage])

  const pages = useMemo(() => {
    const set = new Set(comments.map((c) => c.page_path))
    set.add(currentPage)
    return Array.from(set).sort()
  }, [comments, currentPage])

  const filtered = useMemo(() => {
    const list = pageFilter === ALL_PAGES
      ? comments
      : comments.filter((c) => c.page_path === pageFilter)
    return [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [comments, pageFilter])

  const openComments = filtered.filter((c) => c.status === 'open')
  const resolvedComments = filtered.filter((c) => c.status === 'resolved')

  if (!isOpen) return null

  return (
    <div
      data-live-comments
      className="lc-fixed lc-top-0 lc-right-0 lc-h-full lc-w-80 lc-bg-white lc-shadow-2xl lc-z-[10000] lc-flex lc-flex-col lc-animate-slide-in"
    >
      {/* Header */}
      <div className="lc-flex lc-items-center lc-justify-between lc-px-4 lc-py-3 lc-border-b lc-border-gray-200">
        <h2 className="lc-text-sm lc-font-semibold lc-text-gray-900">
          Comentários
          {filtered.length > 0 && (
            <span className="lc-ml-1.5 lc-text-xs lc-text-gray-400 lc-font-normal">
              ({openComments.length} aberto(s))
            </span>
          )}
        </h2>
        <button
          onClick={onClose}
          className="lc-text-gray-400 hover:lc-text-gray-600 lc-transition-colors lc-text-lg lc-leading-none"
          aria-label="Fechar painel"
        >
          ✕
        </button>
      </div>

      {/* Page Filter */}
      <div className="lc-px-3 lc-py-2 lc-border-b lc-border-gray-200">
        <label className="lc-block lc-text-xs lc-font-medium lc-text-gray-500 lc-mb-1">Páginas</label>
        <select
          value={pageFilter}
          onChange={(e) => setPageFilter(e.target.value)}
          className="lc-w-full lc-px-2 lc-py-1.5 lc-text-xs lc-text-gray-700 lc-bg-gray-50 lc-border lc-border-gray-200 lc-rounded-md focus:lc-outline-none focus:lc-ring-2 focus:lc-ring-primary-500 focus:lc-border-gray-300"
        >
          <option value={ALL_PAGES}>Todas as páginas</option>
          {pages.map((page) => (
            <option key={page} value={page}>
              {formatPagePath(page)}
            </option>
          ))}
        </select>
      </div>

      {/* Comments List + Form (scrollable together) */}
      <div className="lc-flex-1 lc-overflow-y-auto lc-flex lc-flex-col">
        <div className="lc-flex-1">
          {isLoading ? (
            <div className="lc-p-4 lc-text-center lc-text-sm lc-text-gray-400">
              A carregar comentários...
            </div>
          ) : filtered.length === 0 ? (
            <div className="lc-p-4 lc-text-center lc-text-sm lc-text-gray-400">
              Ainda não há comentários. Seja o primeiro!
            </div>
          ) : (
            <>
              {openComments.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  isAdmin={isAdmin}
                  onResolve={onResolve}
                  onDelete={onDelete}
                  onClickPin={onClickPin}
                />
              ))}
              {resolvedComments.length > 0 && (
                <>
                  <div className="lc-px-4 lc-py-2 lc-text-xs lc-text-gray-400 lc-bg-gray-50 lc-font-medium lc-uppercase lc-tracking-wide">
                    Resolvidos ({resolvedComments.length})
                  </div>
                  {resolvedComments.map((comment) => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      isAdmin={isAdmin}
                      onResolve={onResolve}
                      onDelete={onDelete}
                      onClickPin={onClickPin}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
        <CommentForm
          onSubmit={onSubmitComment}
          pinContext={pinContext}
          onCancelPin={onCancelPin}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Footer: Notify */}
      <div className="lc-border-t lc-border-gray-200">
        {filtered.length > 0 && (
          <div className="lc-px-3 lc-py-3">
            <button
              onClick={onNotifyOwner}
              disabled={isNotifying}
              className="lc-w-full lc-px-3 lc-py-2 lc-text-sm lc-text-primary-700 lc-bg-primary-50 lc-rounded-md hover:lc-bg-primary-100 lc-transition-colors disabled:lc-opacity-50"
            >
              {isNotifying ? 'A enviar...' : 'Submeter comentários'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
