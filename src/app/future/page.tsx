import Link from 'next/link'
import { serverNewsApi } from '@/lib/api-server'
import { Article } from '@/lib/types'
import { Calendar, User, ArrowRight, Rocket } from 'lucide-react'

async function getFutureArticles() {
  try {
    const data = await serverNewsApi.articles.list({
      status: 'published',
      category__slug: 'future',
    } as { status: string; category__slug: string })
    return Array.isArray(data) ? data : (data as any)?.results || []
  } catch (error) {
    console.error('Error fetching future articles:', error)
    return []
  }
}

export default async function FuturePage() {
  const articles = await getFutureArticles()

  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Page Header */}
      <section className="py-12 bg-gradient-to-r from-modern-primary to-modern-primary-dark text-white">
        <div className="container-wide">
          <h1 className="text-3xl md:text-4xl font-bold font-playfair mb-2">
            Future Plans
          </h1>
          <p className="text-lg text-blue-100">
            IoT development, projects to build, camera setups, home garden monitoring, and more
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
                    <div className="w-full h-48 bg-modern-primary/10 flex items-center justify-center">
                      <Rocket className="w-12 h-12 text-modern-primary/30" />
                    </div>
                  )}
                  <div className="p-5">
                    {article.category && (
                      <span className="tag tag-new mb-2">{article.category.name}</span>
                    )}
                    <h2 className="text-lg font-semibold text-text group-hover:text-modern-primary transition-colors line-clamp-2">
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
                    <div className="mt-4 flex items-center text-modern-primary font-medium text-sm">
                      Read More <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Rocket className="w-16 h-16 mx-auto mb-4 text-modern-primary/30" />
              <h2 className="text-xl font-semibold text-text mb-2">
                Future plans coming soon
              </h2>
              <p className="text-text-muted mb-6">
                We&apos;re planning IoT development, projects to build, camera setups, home garden monitoring, and more. Check back soon!
              </p>
              <Link href="/" className="btn btn-modern">
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
