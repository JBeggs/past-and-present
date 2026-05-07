import 'server-only'

const RAW = process.env.NEXT_PUBLIC_ARTICLE_AUTHOR_USER_ID?.trim()

/** Django `User.pk` for the store owner; only articles by this author are listed when set. */
export function getArticleAuthorUserId(): string | null {
  return RAW || null
}

export function articleListExtraParams(): Record<string, string> {
  const id = getArticleAuthorUserId()
  return id ? { author: id } : {}
}

/** Merge API query params with optional `author` filter for storefront article lists. */
export function mergeArticleListParams<
  T extends Record<string, string | number | boolean | undefined>,
>(params: T): T & Record<string, string> {
  return { ...params, ...articleListExtraParams() } as T & Record<string, string>
}

/** Resolve author id whether the API returns a bare PK or a nested `{ id }`. */
export function resolveArticleAuthorUserId(author: unknown): string | null {
  if (author == null) return null
  if (typeof author === 'number' || typeof author === 'string') return String(author)
  if (typeof author === 'object' && author !== null && 'id' in author) {
    const id = (author as { id: unknown }).id
    if (id != null) return String(id)
  }
  return null
}

/**
 * Whether this article may be shown on the storefront.
 * When `NEXT_PUBLIC_ARTICLE_AUTHOR_USER_ID` is unset, all articles still pass (legacy).
 */
export function isArticleAllowedForStorefront(article: { author?: unknown }): boolean {
  const required = getArticleAuthorUserId()
  if (!required) return true
  const aid = resolveArticleAuthorUserId(article.author)
  return aid !== null && aid === required
}
