import Link from 'next/link'

export default function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-vintage-background flex items-center justify-center py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-playfair text-text mb-4">Article Not Found</h1>
        <p className="text-text-muted mb-8">
          Sorry, we couldn't find the article you're looking for.
        </p>
        <Link href="/articles" className="btn btn-primary">
          Browse All Articles
        </Link>
      </div>
    </div>
  )
}
