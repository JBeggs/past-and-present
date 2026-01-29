import { serverNewsApi } from '@/lib/api-server'
import { Clock, Sparkles, Heart, Leaf } from 'lucide-react'

async function getAboutContent() {
  try {
    // Try to fetch an "about" article from the CMS
    const articlesData = await serverNewsApi.articles.getBySlug('about')
    const articles = Array.isArray(articlesData) ? articlesData : (articlesData as any)?.results || []
    return articles[0] || null
  } catch (error) {
    console.error('Error fetching about content:', error)
    return null
  }
}

export default async function AboutPage() {
  const aboutArticle = await getAboutContent()

  return (
    <div className="min-h-screen bg-vintage-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-vintage-primary to-vintage-primary-dark text-white">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-6">
              Our Story
            </h1>
            <p className="text-xl text-green-100">
              Where the charm of yesterday meets the convenience of today
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container-narrow">
          {aboutArticle ? (
            <div className="article-content" dangerouslySetInnerHTML={{ __html: aboutArticle.content }} />
          ) : (
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-text-light leading-relaxed mb-8">
                Past and Present was born from a simple belief: beautiful things deserve a second life, 
                and quality should be accessible to everyone. We curate a unique collection of vintage 
                treasures alongside carefully selected modern pieces, creating a shopping experience 
                that celebrates both sustainability and style.
              </p>

              <h2 className="text-2xl font-bold font-playfair text-text mt-12 mb-6">What We Believe</h2>
              
              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="card-vintage p-6">
                  <div className="w-12 h-12 bg-vintage-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-vintage-primary" />
                  </div>
                  <h3 className="font-semibold text-text mb-2">Timeless Quality</h3>
                  <p className="text-text-muted text-sm">
                    Every vintage piece in our collection is hand-selected for its quality, 
                    character, and enduring appeal.
                  </p>
                </div>

                <div className="card-modern p-6">
                  <div className="w-12 h-12 bg-modern-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-modern-primary" />
                  </div>
                  <h3 className="font-semibold text-text mb-2">Modern Essentials</h3>
                  <p className="text-text-muted text-sm">
                    Our new products are chosen for their design, functionality, and 
                    ability to complement any style.
                  </p>
                </div>

                <div className="card p-6">
                  <div className="w-12 h-12 bg-vintage-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-vintage-accent" />
                  </div>
                  <h3 className="font-semibold text-text mb-2">Personal Touch</h3>
                  <p className="text-text-muted text-sm">
                    We believe shopping should be personal. Our team is always here to help 
                    you find exactly what you're looking for.
                  </p>
                </div>

                <div className="card p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-text mb-2">Sustainable Shopping</h3>
                  <p className="text-text-muted text-sm">
                    By giving pre-loved items a new home, we're reducing waste and 
                    promoting a more sustainable way to shop.
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold font-playfair text-text mt-12 mb-6">Our Promise</h2>
              
              <p className="text-text-light leading-relaxed mb-6">
                When you shop with Past and Present, you're not just buying a product – you're 
                becoming part of a community that values quality, sustainability, and the stories 
                that objects carry with them.
              </p>

              <p className="text-text-light leading-relaxed">
                Every item is carefully inspected, honestly described, and shipped with care. 
                We stand behind everything we sell and are committed to your complete satisfaction.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-modern-primary text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold font-playfair mb-4">
            Ready to Explore?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover our collection of vintage treasures and modern finds.
          </p>
          <a href="/products" className="btn btn-gold text-lg px-8 py-3">
            Shop Now
          </a>
        </div>
      </section>
    </div>
  )
}
