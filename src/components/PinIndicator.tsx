"use client";

import React, { useEffect, useState, useCallback } from "react";
import { findElement } from "../lib/selector.js";
import type { Comment } from "../actions/comments.js";

interface PinIndicatorProps {
  comments: Comment[];
  onClickPin: (comment: Comment) => void;
  isAdmin: boolean;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenPanel: () => void;
}

interface PinPosition {
  comment: Comment;
  top: number;
  left: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "agora mesmo";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

export function PinIndicator({ comments, onClickPin, isAdmin, onResolve, onDelete, onOpenPanel }: PinIndicatorProps) {
  const [pins, setPins] = useState<PinPosition[]>([]);
  const [expandedPinId, setExpandedPinId] = useState<string | null>(null);

  const updatePins = useCallback(() => {
    const pinnedComments = comments.filter((c) => c.css_selector && c.status === "open");

    const positions: PinPosition[] = [];

    for (const comment of pinnedComments) {
      const element = findElement(comment.css_selector!);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      const xPct = comment.pin_x_pct ?? 0.5;
      const yPct = comment.pin_y_pct ?? 0.5;

      positions.push({
        comment,
        top: rect.top + rect.height * yPct + window.scrollY,
        left: rect.left + rect.width * xPct + window.scrollX,
      });
    }

    setPins(positions);
  }, [comments]);

  useEffect(() => {
    updatePins();

    window.addEventListener("scroll", updatePins, true);
    window.addEventListener("resize", updatePins);

    const observer = new MutationObserver(updatePins);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener("scroll", updatePins, true);
      window.removeEventListener("resize", updatePins);
      observer.disconnect();
    };
  }, [updatePins]);

  // Close expanded card when clicking outside
  useEffect(() => {
    if (!expandedPinId) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest("[data-pin-card]") || target.closest("[data-pin-dot]")) return;
      setExpandedPinId(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedPinId(null);
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expandedPinId]);

  if (pins.length === 0) return null;

  return (
    <>
      {pins.map(({ comment, top, left }) => (
        <div key={comment.id} style={{ position: "absolute", top, left, zIndex: expandedPinId === comment.id ? 10000 : 9996 }}>
          {/* Pin dot */}
          <button
            data-live-comments
            data-pin-dot
            onClick={() => setExpandedPinId(expandedPinId === comment.id ? null : comment.id)}
            className="lc-absolute lc-z-[9996] lc-w-10 lc-h-10 lc-pb-0.5 lc--translate-x-1/2 lc--translate-y-1/2 lc-bg-primary-600 lc-text-white lc-rounded-full lc-text-sm lc-font-bold lc-shadow-lg lc-border-2 lc-border-white hover:lc-scale-110 lc-transition-transform lc-cursor-pointer"
            aria-label={`Comentário de ${comment.author_name}`}
          >
            {getInitials(comment.author_name)}
          </button>

          {/* Floating comment card */}
          {expandedPinId === comment.id && (
            <div data-live-comments data-pin-card className="lc-absolute lc-z-[9997] lc-left-4 lc--top-2 lc-w-72 lc-bg-white lc-rounded-lg lc-shadow-xl lc-border lc-border-gray-200 lc-animate-fade-in">
              <div className="lc-p-3">
                <div className="lc-flex lc-items-center lc-justify-between lc-gap-2">
                  <div className="lc-flex lc-items-center lc-gap-2 lc-min-w-0">
                    <div className="lc-w-6 lc-h-6 lc-rounded-full lc-bg-primary-100 lc-text-primary-700 lc-text-xs lc-font-medium lc-flex lc-items-center lc-justify-center lc-flex-shrink-0">{getInitials(comment.author_name)}</div>
                    <span className="lc-text-sm lc-font-medium lc-text-gray-900 lc-truncate">{comment.author_name}</span>
                    <span className="lc-text-xs lc-text-gray-400 lc-flex-shrink-0">{timeAgo(comment.created_at)}</span>
                  </div>
                  <button onClick={() => setExpandedPinId(null)} className="lc-text-gray-400 hover:lc-text-gray-600 lc-transition-colors lc-text-sm lc-leading-none lc-flex-shrink-0">
                    ✕
                  </button>
                </div>

                <p className="lc-mt-2 lc-text-sm lc-text-gray-700 lc-whitespace-pre-wrap lc-break-words">{comment.body}</p>

                <div className="lc-flex lc-items-center lc-justify-between lc-mt-2 lc-pt-2 lc-border-t lc-border-gray-100">
                  {isAdmin ? (
                    <div className="lc-flex lc-items-center lc-gap-2">
                      <button
                        onClick={() => {
                          onResolve(comment.id);
                          setExpandedPinId(null);
                        }}
                        className="lc-text-xs lc-text-gray-500 hover:lc-text-green-600 lc-transition-colors"
                      >
                        Resolver
                      </button>
                      <button
                        onClick={() => {
                          onDelete(comment.id);
                          setExpandedPinId(null);
                        }}
                        className="lc-text-xs lc-text-gray-500 hover:lc-text-red-600 lc-transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={() => {
                      setExpandedPinId(null);
                      onOpenPanel();
                    }}
                    className="lc-text-xs lc-text-primary-600 hover:lc-text-primary-800 lc-transition-colors"
                  >
                    Abrir comentários
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
