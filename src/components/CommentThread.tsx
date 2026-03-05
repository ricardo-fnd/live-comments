'use client'

import React from 'react'
import type { Comment } from '../actions/comments.js'

function formatPagePath(path: string): string {
  if (path === '/') return 'Início'
  const segment = path.replace(/^\//, '').split('/').pop() || path
  const words = segment.replace(/-/g, ' ').split(' ')
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
  return words.join(' ')
}

interface CommentThreadProps {
  comment: Comment
  isAdmin: boolean
  onResolve: (id: string) => void
  onDelete: (id: string) => void
  onClickPin?: (comment: Comment) => void
  isActioning?: boolean
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }
  return name.charAt(0).toUpperCase()
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'agora mesmo'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `há ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  return `há ${days}d`
}

export function CommentThread({
  comment,
  isAdmin,
  onResolve,
  onDelete,
  onClickPin,
  isActioning,
}: CommentThreadProps) {
  const isResolved = comment.status === 'resolved'
  const isPinned = !!comment.css_selector

  return (
    <div
      data-live-comments
      className={`lc-p-3 lc-border-b lc-border-gray-100 hover:lc-bg-gray-50 lc-transition-colors ${
        isResolved ? 'lc-opacity-60' : ''
      }`}
    >
      <div className="lc-flex lc-items-start lc-justify-between lc-gap-2">
        <div className="lc-flex lc-items-center lc-gap-2 lc-min-w-0">
          <div className="lc-w-6 lc-h-6 lc-rounded-full lc-bg-primary-100 lc-text-primary-700 lc-text-xs lc-font-medium lc-flex lc-items-center lc-justify-center lc-flex-shrink-0">
            {getInitials(comment.author_name)}
          </div>
          <span className="lc-text-sm lc-font-medium lc-text-gray-900 lc-truncate">
            {comment.author_name}
          </span>
          <span className="lc-text-xs lc-text-gray-400 lc-flex-shrink-0">
            {timeAgo(comment.created_at)}
          </span>
        </div>
        {isResolved && (
          <span className="lc-text-xs lc-bg-green-100 lc-text-green-700 lc-px-1.5 lc-py-0.5 lc-rounded lc-flex-shrink-0">
            Resolvido
          </span>
        )}
      </div>

      <div className="lc-mt-1 lc-text-xs">
        {isPinned ? (
          <div className="lc-flex lc-items-center lc-justify-between">
            <button
              onClick={() => onClickPin?.(comment)}
              className="lc-flex lc-items-center lc-gap-1 lc-text-primary-600 hover:lc-text-primary-800 lc-transition-colors lc-flex-shrink-0"
            >
              <span className="lc-inline-block lc-w-1.5 lc-h-1.5 lc-bg-primary-500 lc-rounded-full" />
              Clique para ver o comentário
            </button>
            <span className="lc-text-gray-400 lc-truncate">
              {formatPagePath(comment.page_path)}
            </span>
          </div>
        ) : (
          <span className="lc-text-gray-400">Comentário geral em {formatPagePath(comment.page_path)}</span>
        )}
      </div>

      <p className="lc-mt-2 lc-text-sm lc-text-gray-700 lc-whitespace-pre-wrap lc-break-words">
        {comment.body}
      </p>

      {isAdmin && <div className="lc-flex lc-items-center lc-gap-2 lc-mt-2">
        {!isResolved && (
          <button
            onClick={() => onResolve(comment.id)}
            disabled={isActioning}
            className="lc-text-xs lc-text-gray-500 hover:lc-text-green-600 lc-transition-colors disabled:lc-opacity-50"
          >
            Resolver
          </button>
        )}
        <button
          onClick={() => onDelete(comment.id)}
          disabled={isActioning}
          className="lc-text-xs lc-text-gray-500 hover:lc-text-red-600 lc-transition-colors disabled:lc-opacity-50"
        >
          Eliminar
        </button>
      </div>}
    </div>
  )
}
