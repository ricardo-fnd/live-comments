/**
 * Generate a unique CSS selector for a DOM element.
 */
export function generateSelector(element: Element): string | null {
  // 1. ID-based selector
  if (element.id) {
    return `#${CSS.escape(element.id)}`
  }

  // 2. data-testid or data-lc
  const testId = element.getAttribute('data-testid')
  if (testId) {
    return `[data-testid="${CSS.escape(testId)}"]`
  }
  const lcId = element.getAttribute('data-lc')
  if (lcId) {
    return `[data-lc="${CSS.escape(lcId)}"]`
  }

  // 3. Build path using nth-of-type up to nearest ID ancestor or body
  const parts: string[] = []
  let current: Element | null = element

  while (current && current !== document.body && current !== document.documentElement) {
    if (current.id) {
      parts.unshift(`#${CSS.escape(current.id)}`)
      break
    }

    const tag = current.tagName.toLowerCase()
    const parent: Element | null = current.parentElement

    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c: Element) => c.tagName === current!.tagName
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        parts.unshift(`${tag}:nth-of-type(${index})`)
      } else {
        parts.unshift(tag)
      }
    } else {
      parts.unshift(tag)
    }

    current = parent
  }

  if (parts.length === 0) return null

  const selector = parts.join(' > ')

  // 4. Validate
  try {
    const matches = document.querySelectorAll(selector)
    if (matches.length === 1 && matches[0] === element) {
      return selector
    }
  } catch {
    return null
  }

  return selector
}

/**
 * Find element by CSS selector, returns null if not found or ambiguous.
 */
export function findElement(selector: string): Element | null {
  try {
    const matches = document.querySelectorAll(selector)
    if (matches.length === 1) return matches[0]
    // For ID selectors, querySelector is fine
    if (selector.startsWith('#')) return document.querySelector(selector)
    return null
  } catch {
    return null
  }
}

/**
 * Calculate click position as percentage within an element.
 */
export function getClickPosition(
  element: Element,
  clientX: number,
  clientY: number
): { xPct: number; yPct: number } {
  const rect = element.getBoundingClientRect()
  return {
    xPct: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
    yPct: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
  }
}
