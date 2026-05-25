/**
 * Article display filter unit tests — admin category/author allow-lists for home and /articles.
 */
import { describe, it, expect } from 'vitest'

import {
  filterArticlesByDisplaySettings,
  filterArticleCategoriesForScope,
  resolveCategoryFilterForScope,
  type ArticleDisplaySettings,
} from './article-display-settings'

const baseSettings: ArticleDisplaySettings = {
  articlesPageCategoryIds: [],
  articlesPageAuthorIds: [],
  homeCategoryIds: [],
  homeAuthorIds: [],
  homeEnabled: true,
  homeLimit: 3,
}

const articles = [
  { id: '1', category: { id: 'cat-a' }, author_id: 'user-1' },
  { id: '2', category: { id: 'cat-b' }, author_id: 'user-2' },
  { id: '3', category: { id: 'cat-c' }, author_id: 'user-1' },
  { id: '4', category_id: 'cat-a', author_id: 'user-3' },
]

describe('filterArticlesByDisplaySettings', () => {
  it('returns all articles when no allow-lists are configured', () => {
    expect(filterArticlesByDisplaySettings(articles, baseSettings, 'articles')).toHaveLength(4)
  })

  it('skips category allow-list when no fetched article matches configured ids', () => {
    const settings: ArticleDisplaySettings = {
      ...baseSettings,
      articlesPageCategoryIds: ['cat-x'],
    }
    expect(filterArticlesByDisplaySettings(articles, settings, 'articles')).toHaveLength(4)
  })

  it('skips author allow-list when no fetched article matches configured ids', () => {
    const settings: ArticleDisplaySettings = {
      ...baseSettings,
      homeAuthorIds: ['user-missing'],
      homeCategoryIds: ['cat-a'],
    }
    expect(filterArticlesByDisplaySettings(articles, settings, 'home')).toHaveLength(2)
  })

  it('filters articles page by configured categories', () => {
    const settings: ArticleDisplaySettings = {
      ...baseSettings,
      articlesPageCategoryIds: ['cat-a'],
    }
    const result = filterArticlesByDisplaySettings(articles, settings, 'articles')
    expect(result.map((a) => a.id)).toEqual(['1', '4'])
  })

  it('filters home shelf by categories and applies home limit', () => {
    const settings: ArticleDisplaySettings = {
      ...baseSettings,
      homeCategoryIds: ['cat-a', 'cat-b'],
      homeLimit: 2,
    }
    const result = filterArticlesByDisplaySettings(articles, settings, 'home')
    expect(result.map((a) => a.id)).toEqual(['1', '2'])
  })

  it('filters by author allow-list', () => {
    const settings: ArticleDisplaySettings = {
      ...baseSettings,
      articlesPageAuthorIds: ['user-1'],
    }
    const result = filterArticlesByDisplaySettings(articles, settings, 'articles')
    expect(result.map((a) => a.id)).toEqual(['1', '3'])
  })
})

describe('filterArticleCategoriesForScope', () => {
  const categories = [
    { id: 'cat-a', name: 'A' },
    { id: 'cat-b', name: 'B' },
    { id: 'cat-c', name: 'C' },
  ]

  it('returns all categories when allow-list is empty', () => {
    expect(filterArticleCategoriesForScope(categories, baseSettings, 'articles')).toHaveLength(3)
  })

  it('restricts category pills to allow-list', () => {
    const settings: ArticleDisplaySettings = {
      ...baseSettings,
      articlesPageCategoryIds: ['cat-b', 'cat-x'],
    }
    const result = filterArticleCategoriesForScope(categories, settings, 'articles')
    expect(result).toEqual([{ id: 'cat-b', name: 'B' }])
  })
})

describe('resolveCategoryFilterForScope', () => {
  it('passes through category when allow-list is empty', () => {
    expect(resolveCategoryFilterForScope('cat-a', baseSettings, 'articles')).toBe('cat-a')
  })

  it('allows category in allow-list', () => {
    const settings: ArticleDisplaySettings = {
      ...baseSettings,
      articlesPageCategoryIds: ['cat-a', 'cat-b'],
    }
    expect(resolveCategoryFilterForScope('cat-b', settings, 'articles')).toBe('cat-b')
  })

  it('drops category not in allow-list', () => {
    const settings: ArticleDisplaySettings = {
      ...baseSettings,
      articlesPageCategoryIds: ['cat-a'],
    }
    expect(resolveCategoryFilterForScope('cat-c', settings, 'articles')).toBeUndefined()
  })
})
