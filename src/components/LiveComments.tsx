'use client'

import React, { useReducer, useEffect, useCallback } from 'react'
import { Toolbar } from './Toolbar.js'
import { CommentPanel } from './CommentPanel.js'
import { PinOverlay } from './PinOverlay.js'
import { PinIndicator } from './PinIndicator.js'
import { IdentityPrompt } from './IdentityPrompt.js'
import { AdminLogin } from './AdminLogin.js'
import { AllPagesView } from './AllPagesView.js'
import { Popup } from './Popup.js'
import { CommentPopup } from './CommentPopup.js'
import { findElement } from '../lib/selector.js'
import {
  getComments,
  getAllComments,
  createComment,
  resolveComment,
  deleteComment,
  adminLogin,
  adminLogout,
  checkAdminSession,
  notifyOwner,
} from 'live-comments/actions'
import type { Comment } from 'live-comments/actions'

// State
interface State {
  comments: Comment[]
  isPanelOpen: boolean
  isCommentMode: boolean
  isAdmin: boolean
  authorName: string | null
  showIdentityPrompt: boolean
  showAdminLogin: boolean
  showAllPages: boolean
  isLoading: boolean
  isSubmitting: boolean
  pinContext: { selector: string; xPct: number; yPct: number; label: string } | null
  highlightCommentId: string | null
  pendingAction: (() => void) | null
}

type Action =
  | { type: 'SET_COMMENTS'; comments: Comment[] }
  | { type: 'ADD_COMMENT'; comment: Comment }
  | { type: 'UPDATE_COMMENT'; comment: Comment }
  | { type: 'REMOVE_COMMENT'; id: string }
  | { type: 'TOGGLE_PANEL' }
  | { type: 'CLOSE_PANEL' }
  | { type: 'TOGGLE_COMMENT_MODE' }
  | { type: 'SET_ADMIN'; isAdmin: boolean }
  | { type: 'SET_AUTHOR'; name: string }
  | { type: 'SHOW_IDENTITY_PROMPT'; pendingAction?: () => void }
  | { type: 'HIDE_IDENTITY_PROMPT' }
  | { type: 'SHOW_ADMIN_LOGIN' }
  | { type: 'HIDE_ADMIN_LOGIN' }
  | { type: 'SHOW_ALL_PAGES' }
  | { type: 'HIDE_ALL_PAGES' }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_PIN_CONTEXT'; pinContext: State['pinContext'] }
  | { type: 'HIGHLIGHT_COMMENT'; id: string | null }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_COMMENTS':
      return { ...state, comments: action.comments, isLoading: false }
    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.comment], isSubmitting: false }
    case 'UPDATE_COMMENT':
      return {
        ...state,
        comments: state.comments.map((c) =>
          c.id === action.comment.id ? action.comment : c
        ),
      }
    case 'REMOVE_COMMENT':
      return { ...state, comments: state.comments.filter((c) => c.id !== action.id) }
    case 'TOGGLE_PANEL':
      return { ...state, isPanelOpen: !state.isPanelOpen }
    case 'CLOSE_PANEL':
      return { ...state, isPanelOpen: false }
    case 'TOGGLE_COMMENT_MODE':
      return {
        ...state,
        isCommentMode: !state.isCommentMode,
        pinContext: null,
      }
    case 'SET_ADMIN':
      return { ...state, isAdmin: action.isAdmin, showAdminLogin: false }
    case 'SET_AUTHOR':
      return { ...state, authorName: action.name, showIdentityPrompt: false }
    case 'SHOW_IDENTITY_PROMPT':
      return { ...state, showIdentityPrompt: true, pendingAction: action.pendingAction ?? null }
    case 'HIDE_IDENTITY_PROMPT':
      return { ...state, showIdentityPrompt: false, pendingAction: null }
    case 'SHOW_ADMIN_LOGIN':
      return { ...state, showAdminLogin: true }
    case 'HIDE_ADMIN_LOGIN':
      return { ...state, showAdminLogin: false }
    case 'SHOW_ALL_PAGES':
      return { ...state, showAllPages: true }
    case 'HIDE_ALL_PAGES':
      return { ...state, showAllPages: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting }
    case 'SET_PIN_CONTEXT':
      return { ...state, pinContext: action.pinContext, isCommentMode: false }
    case 'HIGHLIGHT_COMMENT':
      return { ...state, highlightCommentId: action.id }
    default:
      return state
  }
}

const AUTHOR_STORAGE_KEY = 'lc-author-name'

function getStoredAuthor(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTHOR_STORAGE_KEY)
}

function storeAuthor(name: string): void {
  localStorage.setItem(AUTHOR_STORAGE_KEY, name)
}

export function LiveComments() {
  const [state, dispatch] = useReducer(reducer, {
    comments: [],
    isPanelOpen: false,
    isCommentMode: false,
    isAdmin: false,
    authorName: null,
    showIdentityPrompt: false,
    showAdminLogin: false,
    showAllPages: false,
    isLoading: true,
    isSubmitting: false,
    pinContext: null,
    highlightCommentId: null,
    pendingAction: null,
  })

  // Get current page path
  const getPagePath = useCallback(() => {
    if (typeof window === 'undefined') return '/'
    return window.location.pathname
  }, [])

  // Load comments + check admin session + restore author name on mount
  useEffect(() => {
    const storedAuthor = getStoredAuthor()
    if (storedAuthor) {
      dispatch({ type: 'SET_AUTHOR', name: storedAuthor })
    }

    checkAdminSession()
      .then((isAdmin) => dispatch({ type: 'SET_ADMIN', isAdmin }))
      .catch((err) => console.error('[live-comments] checkAdminSession failed:', err))

    getAllComments()
      .then((grouped) => {
        const all = Object.values(grouped).flat()
        dispatch({ type: 'SET_COMMENTS', comments: all })
      })
      .catch((err) => {
        console.error('[live-comments] getComments failed:', err)
        dispatch({ type: 'SET_LOADING', isLoading: false })
      })
  }, [getPagePath])

  // On mount: check for lc_highlight param → scroll to pinned element
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const selector = params.get('lc_highlight')
    if (!selector) return

    // Clean up the URL
    params.delete('lc_highlight')
    const cleanUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    window.history.replaceState({}, '', cleanUrl)

    // Wait a bit for the page to render, then scroll and highlight
    const timer = setTimeout(() => {
      const el = findElement(selector)
      if (!el) return
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      ;(el as HTMLElement).style.outline = '2px solid #3b82f6'
      ;(el as HTMLElement).style.outlineOffset = '2px'
      setTimeout(() => {
        ;(el as HTMLElement).style.outline = ''
        ;(el as HTMLElement).style.outlineOffset = ''
      }, 1500)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Ensure author before action
  const ensureAuthor = useCallback(
    (action: () => void) => {
      if (state.authorName) {
        action()
      } else {
        dispatch({ type: 'SHOW_IDENTITY_PROMPT', pendingAction: action })
      }
    },
    [state.authorName]
  )

  // Handle identity submission
  const handleIdentitySubmit = useCallback(
    (name: string) => {
      storeAuthor(name)
      dispatch({ type: 'SET_AUTHOR', name })
      // Execute pending action if any
      if (state.pendingAction) {
        setTimeout(() => state.pendingAction?.(), 0)
      }
    },
    [state.pendingAction]
  )

  // Submit comment
  const handleSubmitComment = useCallback(
    (body: string) => {
      ensureAuthor(async () => {
        dispatch({ type: 'SET_SUBMITTING', isSubmitting: true })
        try {
          const comment = await createComment({
            pagePath: getPagePath(),
            cssSelector: state.pinContext?.selector ?? null,
            pinXPct: state.pinContext?.xPct ?? null,
            pinYPct: state.pinContext?.yPct ?? null,
            authorName: state.authorName!,
            body,
          })
          dispatch({ type: 'ADD_COMMENT', comment })
          dispatch({ type: 'SET_PIN_CONTEXT', pinContext: null })
        } catch (err) {
          console.error('Failed to create comment:', err)
          dispatch({ type: 'SET_SUBMITTING', isSubmitting: false })
        }
      })
    },
    [ensureAuthor, getPagePath, state.pinContext, state.authorName]
  )

  // Resolve comment
  const handleResolve = useCallback(async (id: string) => {
    try {
      const updated = await resolveComment(id)
      if (updated) dispatch({ type: 'UPDATE_COMMENT', comment: updated })
    } catch (err) {
      console.error('Failed to resolve comment:', err)
    }
  }, [])

  // Delete comment
  const handleDelete = useCallback(async (id: string) => {
    try {
      const success = await deleteComment(id)
      if (success) dispatch({ type: 'REMOVE_COMMENT', id })
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }, [])

  // Popup state
  const [popup, setPopup] = React.useState<{
    title: string
    message: string
    variant: 'confirm' | 'info'
    onConfirm?: () => void
  } | null>(null)

  const showInfo = useCallback((title: string, message: string) => {
    setPopup({ title, message, variant: 'info' })
  }, [])

  // Notify owner (sends summary of all open comments)
  const [isNotifying, setIsNotifying] = React.useState(false)

  const doNotify = useCallback(async () => {
    const openComments = state.comments.filter((c) => c.status === 'open')
    if (openComments.length === 0) return

    setIsNotifying(true)
    setPopup(null)
    try {
      const authorName = state.authorName ?? 'Alguém'
      const result = await notifyOwner({
        pagePath: window.location.origin,
        authorName,
        body: '',
        commentId: openComments[0].id,
      })
      if (result.success) {
        showInfo('Sucesso', 'Comentários submetidos com sucesso!')
      } else {
        showInfo('Erro', result.error ?? 'Falha ao submeter os comentários.')
      }
    } catch {
      showInfo('Erro', 'Falha ao submeter os comentários.')
    } finally {
      setIsNotifying(false)
    }
  }, [state.comments, getPagePath, showInfo])

  const handleNotifyOwner = useCallback(() => {
    const openComments = state.comments.filter((c) => c.status === 'open')
    if (openComments.length === 0) return

    setPopup({
      title: 'Submeter comentários',
      message: 'Será enviado um email ao programador com todos os seus comentários.\n\nCertifique-se de que terminou a sua revisão antes de submeter.',
      variant: 'confirm',
      onConfirm: doNotify,
    })
  }, [state.comments, doNotify])

  // Admin login
  const handleAdminLogin = useCallback(
    async (username: string, password: string) => {
      const result = await adminLogin(username, password)
      if (result.success) {
        dispatch({ type: 'SET_ADMIN', isAdmin: true })
      }
      return result
    },
    []
  )

  // Admin logout
  const handleAdminLogout = useCallback(async () => {
    await adminLogout()
    dispatch({ type: 'SET_ADMIN', isAdmin: false })
  }, [])

  // Pin from overlay
  const handlePin = useCallback(
    (selector: string, xPct: number, yPct: number, label: string) => {
      ensureAuthor(() => {
        dispatch({
          type: 'SET_PIN_CONTEXT',
          pinContext: { selector, xPct, yPct, label },
        })
      })
    },
    [ensureAuthor]
  )

  // Click pin → navigate if needed, scroll to element and highlight it
  const highlightElement = useCallback((selector: string) => {
    const el = findElement(selector)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const prev = (el as HTMLElement).style.outline
    ;(el as HTMLElement).style.outline = '2px solid #3b82f6'
    ;(el as HTMLElement).style.outlineOffset = '2px'
    setTimeout(() => {
      ;(el as HTMLElement).style.outline = prev
      ;(el as HTMLElement).style.outlineOffset = ''
    }, 1500)
  }, [])

  const handleClickPin = useCallback((comment: Comment) => {
    dispatch({ type: 'HIGHLIGHT_COMMENT', id: comment.id })
    if (!state.isPanelOpen) {
      dispatch({ type: 'TOGGLE_PANEL' })
    }

    if (!comment.css_selector) return

    // If comment is on a different page, navigate there with highlight param
    if (comment.page_path !== getPagePath()) {
      const url = new URL(comment.page_path, window.location.origin)
      url.searchParams.set('lc_highlight', comment.css_selector)
      window.location.href = url.toString()
      return
    }

    highlightElement(comment.css_selector)
  }, [state.isPanelOpen, getPagePath, highlightElement])

  const openCommentCount = state.comments.filter((c) => c.status === 'open').length

  const COMMENT_MODE_INTRO_KEY = 'lc-comment-mode-intro-shown'

  const handleToggleCommentMode = useCallback(() => {
    // If turning off, just toggle
    if (state.isCommentMode) {
      dispatch({ type: 'TOGGLE_COMMENT_MODE' })
      return
    }

    // If intro was already shown, go straight to comment mode
    if (localStorage.getItem(COMMENT_MODE_INTRO_KEY)) {
      dispatch({ type: 'TOGGLE_COMMENT_MODE' })
      return
    }

    // Show intro popup first
    setPopup({
      title: 'Como adicionar comentários',
      message: 'Pode adicionar dois tipos de comentários:\n\n1. **Comentário geral** — basta escrever na caixa de texto no painel lateral.\n\n2. **Comentário fixado num elemento** — após fechar esta janela, passe o rato sobre qualquer elemento da página. O elemento ficará destacado. Clique para fixar o comentário nesse local.\n\nPrima Esc a qualquer momento para cancelar.',
      variant: 'info',
      onConfirm: () => {
        localStorage.setItem(COMMENT_MODE_INTRO_KEY, '1')
        setPopup(null)
        dispatch({ type: 'TOGGLE_COMMENT_MODE' })
      },
    })
  }, [state.isCommentMode])

  return (
    <>
      <Toolbar
        commentCount={openCommentCount}
        isCommentMode={state.isCommentMode}
        onToggleCommentMode={handleToggleCommentMode}
        onTogglePanel={() => dispatch({ type: 'TOGGLE_PANEL' })}
        onOpenAllPages={() => dispatch({ type: 'SHOW_ALL_PAGES' })}
        onOpenAdminLogin={() => dispatch({ type: 'SHOW_ADMIN_LOGIN' })}
        isAdmin={state.isAdmin}
        onAdminLogout={handleAdminLogout}
      />

      <CommentPanel
        isOpen={state.isPanelOpen}
        onClose={() => dispatch({ type: 'CLOSE_PANEL' })}
        comments={state.comments}
        currentPage={getPagePath()}
        isAdmin={state.isAdmin}
        onSubmitComment={handleSubmitComment}
        onResolve={handleResolve}
        onDelete={handleDelete}
        onNotifyOwner={handleNotifyOwner}
        onClickPin={handleClickPin}
        pinContext={
          state.pinContext
            ? { selector: state.pinContext.selector, label: state.pinContext.label }
            : null
        }
        onCancelPin={() =>
          dispatch({ type: 'SET_PIN_CONTEXT', pinContext: null })
        }
        isSubmitting={state.isSubmitting}
        isLoading={state.isLoading}
        isNotifying={isNotifying}
      />

      <PinOverlay
        isActive={state.isCommentMode}
        onPin={handlePin}
        onCancel={() => dispatch({ type: 'TOGGLE_COMMENT_MODE' })}
      />

      <PinIndicator
        comments={state.comments}
        onClickPin={handleClickPin}
        isAdmin={state.isAdmin}
        onResolve={handleResolve}
        onDelete={handleDelete}
        onOpenPanel={() => dispatch({ type: 'TOGGLE_PANEL' })}
      />

      <CommentPopup
        isOpen={!!state.pinContext}
        pinLabel={state.pinContext?.label ?? null}
        onSubmit={handleSubmitComment}
        onCancel={() => dispatch({ type: 'SET_PIN_CONTEXT', pinContext: null })}
        isSubmitting={state.isSubmitting}
      />

      {state.showIdentityPrompt && (
        <IdentityPrompt
          onSubmit={handleIdentitySubmit}
          onClose={() => dispatch({ type: 'HIDE_IDENTITY_PROMPT' })}
        />
      )}

      {state.showAdminLogin && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onClose={() => dispatch({ type: 'HIDE_ADMIN_LOGIN' })}
        />
      )}

      <AllPagesView
        isOpen={state.showAllPages}
        onClose={() => dispatch({ type: 'HIDE_ALL_PAGES' })}
        fetchAllComments={getAllComments}
      />

      <Popup
        isOpen={!!popup}
        title={popup?.title ?? ''}
        message={popup?.message ?? ''}
        variant={popup?.variant ?? 'info'}
        onConfirm={popup?.onConfirm ?? (() => setPopup(null))}
        onCancel={() => setPopup(null)}
        confirmLabel={popup?.variant === 'confirm' ? 'Submeter' : 'OK'}
        cancelLabel="Cancelar"
      />
    </>
  )
}
