import Link from 'next/link'
import { serverNewsApi } from '@/lib/api-server'
import { Article } from '@/lib/types'
import { Calendar, User, ArrowRight } from 'lucide-react'

async function getArticles() {
  try {
    const articlesData = await serverNewsApi.articles.list({ status: 'published' })
    return Array.isArray(articlesData) ? articlesData : (articlesData as any)?.results || []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <div className="min-h-screen bg-vintage-background">
      {/* Page Header */}
      <section className="py-12 bg-vintage-primary text-white">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-bold font-playfair mb-2">
            Stories & Inspiration
          </h1>
          <p className="text-lg text-green-100">
            Tips, guides, and behind-the-scenes from the world of vintage and modern treasures
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container-wide">
          {articles.length > 0 ? (
            <div className="article-grid">
              {articles.map((article: Article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="card group overflow-hidden">
                  {article.featured_media?.file_url ? (
                    <img
                      src={article.featured_media.file_url}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-vintage-primary/10 flex items-center justify-center">
                      <span className="text-4xl font-playfair text-vintage-primary/30">P&P</span>
                    </div>
                  )}
                  <div className="p-5">
                    {article.category && (
                      <span className="tag tag-vintage mb-2">{article.category.name}</span>
                    )}
                    <h2 className="text-lg font-semibold text-text group-hover:text-vintage-primary transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-sm text-text-muted mt-2 line-clamp-3">{article.excerpt}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between text-sm text-text-muted">
                      <div className="flex items-center gap-4">
                        {article.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(article.published_at).toLocaleDateString()}
                          </span>
                        )}
                        {article.author?.full_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {article.author.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-vintage-primary font-medium text-sm">
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-vintage-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-playfair text-vintage-primary">P&P</span>
              </div>
              <h2 className="text-xl font-semibold text-text mb-2">No articles yet</h2>
              <p className="text-text-muted mb-6">Check back soon for stories and inspiration!</p>
              <Link href="/" className="btn btn-primary">
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
