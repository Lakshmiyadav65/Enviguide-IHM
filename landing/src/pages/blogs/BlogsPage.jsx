import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../../components/Nav.jsx'
import Footer from '../../components/Footer.jsx'
import SocialBanner from '../../components/SocialBanner.jsx'
import ChatWidget from '../../components/chat/ChatWidget.jsx'
import Reveal from '../../components/Reveal.jsx'
import { usePage } from '../../hooks/usePage.js'
import { BLOG_POSTS } from '../../data/blogData.js'
import '../../styles/blogs.css'

const CATEGORIES = [
  'All Topics',
  'Compliance Checklist',
  'Supplier Workflows',
  'Technical Procurement',
  'Regulatory Analysis',
]

export default function BlogsPage() {
  usePage({
    title: 'Maritime Insights & IHM Compliance Blog | MARICOMX',
    description:
      'Read practical IHM Part I checklists, supplier MD/SDoC guidance, Hong Kong Convention regulatory updates, and purchase order screening workflows from MARICOMX.',
  })

  const [activeCategory, setActiveCategory] = useState('All Topics')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        activeCategory === 'All Topics' || post.category === activeCategory
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  const featuredPost = BLOG_POSTS[0]

  return (
    <>
      <Nav activeLink="blogs" />
      <main className="blogs-page-view">
        {/* Hero Section */}
        <section className="blogs-hero">
          <div className="container">
            <Reveal className="blogs-hero-content center">
              <div className="badge blogs-staging-badge">
                <span className="badge-dot"></span>
                Editorial Preview · Pre-Publication Staging
              </div>
              <h1 className="blogs-hero-title">
                Maritime Insights &amp; IHM Compliance Blog
              </h1>
              <p className="blogs-hero-desc">
                Authoritative guides, practical IHM Part I maintenance checklists, and regulatory analyses
                curated by MARICOMX technical maritime specialists.
              </p>

              {/* Pre-publication Notice */}
              <div className="blogs-staging-alert">
                <div className="bsa-icon">📋</div>
                <div className="bsa-text">
                  <strong>Staged for Editorial Review:</strong> These initial foundational articles are prepared for
                  upcoming SEO launch. Browse the complete drafts below or suggest topics for our maritime compliance team.
                </div>
              </div>
            </Reveal>

            {/* Search and Category Filters */}
            <div className="blogs-filter-bar">
              <div className="blogs-search-wrap">
                <input
                  type="text"
                  placeholder="Search articles, keywords (e.g. SDoC, HKC, Gaskets)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="blogs-search-input"
                  aria-label="Search blog posts"
                />
              </div>

              <div className="blogs-categories-list">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`blog-cat-btn${activeCategory === cat ? ' active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post Banner (if on All Topics & no search query) */}
        {activeCategory === 'All Topics' && !searchQuery && (
          <section className="blogs-featured-section">
            <div className="container">
              <div className="featured-card-wrapper">
                <div className="featured-card-badge">⭐ Featured Editorial Guide</div>
                <div className="featured-card">
                  <div className="featured-card-body">
                    <div className="blog-meta-top">
                      <span className={`blog-category-chip ${featuredPost.categoryColor}`}>
                        {featuredPost.category}
                      </span>
                      <span className="blog-read-time">{featuredPost.readTime}</span>
                      <span className="blog-status-chip">{featuredPost.status}</span>
                    </div>

                    <h2 className="featured-card-title">
                      <Link to={`/blogs/${featuredPost.slug}`}>{featuredPost.title}</Link>
                    </h2>

                    <p className="featured-card-excerpt">{featuredPost.excerpt}</p>

                    <div className="featured-card-footer">
                      <div className="author-block">
                        <strong>{featuredPost.author.name}</strong>
                        <span>{featuredPost.author.role}</span>
                      </div>
                      <Link to={`/blogs/${featuredPost.slug}`} className="btn-primary">
                        Read Full Draft Article →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Articles Grid */}
        <section className="blogs-grid-section">
          <div className="container">
            <div className="section-header">
              <div className="eyebrow">Curated Knowledge Base</div>
              <h2>Articles &amp; Compliance Resources ({filteredPosts.length})</h2>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="blogs-empty-state center">
                <p>No articles found matching &ldquo;{searchQuery}&rdquo;.</p>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setActiveCategory('All Topics')
                    setSearchQuery('')
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="blogs-grid">
                {filteredPosts.map((post) => (
                  <Reveal className="blog-post-card" key={post.id} variant="fade">
                    <div className="blog-card-inner">
                      <div className="blog-meta-top">
                        <span className={`blog-category-chip ${post.categoryColor}`}>
                          {post.category}
                        </span>
                        <span className="blog-read-time">{post.readTime}</span>
                      </div>

                      <h3 className="blog-card-title">
                        <Link to={`/blogs/${post.slug}`}>{post.title}</Link>
                      </h3>

                      <p className="blog-card-excerpt">{post.excerpt}</p>

                      <div className="blog-tags-row">
                        {post.keywords.slice(0, 3).map((kw) => (
                          <span key={kw} className="blog-keyword-tag">
                            #{kw.replace(/\s+/g, '')}
                          </span>
                        ))}
                      </div>

                      <div className="blog-card-footer">
                        <div className="blog-card-author">
                          <span className="bca-name">{post.author.name}</span>
                          <span className="bca-date">{post.date}</span>
                        </div>
                        <Link to={`/blogs/${post.slug}`} className="blog-read-link">
                          Read Article →
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Connect & Social Banner */}
        <SocialBanner />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
