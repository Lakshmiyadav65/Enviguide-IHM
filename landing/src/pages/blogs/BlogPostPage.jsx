import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import Nav from '../../components/Nav.jsx'
import Footer from '../../components/Footer.jsx'
import SocialBanner from '../../components/SocialBanner.jsx'
import ChatWidget from '../../components/chat/ChatWidget.jsx'
import { FacebookIcon, LinkedInIcon, WhatsAppIcon } from '../../components/Icons.jsx'
import { usePage } from '../../hooks/usePage.js'
import { BLOG_POSTS } from '../../data/blogData.js'
import '../../styles/blogs.css'

export default function BlogPostPage() {
  const { slug } = useParams()
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  const [copied, setCopied] = useState(false)

  usePage({
    title: post ? `${post.title} | MARICOMX Blog` : 'Article Not Found | MARICOMX',
    description: post ? post.excerpt : 'MARICOMX Maritime compliance and IHM insights.',
  })

  if (!post) {
    return <Navigate to="/blogs" replace />
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://www.maricomx.com/blogs/${post.slug}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 2)

  return (
    <>
      <Nav activeLink="blogs" />
      <main className="blog-post-view">
        <article className="blog-post-article">
          {/* Post Header */}
          <header className="blog-post-header">
            <div className="container">
              <div className="blog-post-breadcrumbs">
                <Link to="/blogs" className="back-link">
                  ← Back to All Articles
                </Link>
                <span className="crumb-separator">/</span>
                <span className="crumb-current">{post.category}</span>
              </div>

              <div className="blog-post-badges">
                <span className={`blog-category-chip ${post.categoryColor}`}>
                  {post.category}
                </span>
                <span className="blog-status-chip">
                  🔒 {post.status}
                </span>
                <span className="blog-read-time">{post.readTime}</span>
              </div>

              <h1 className="blog-post-title">{post.title}</h1>
              <p className="blog-post-subtitle">{post.subtitle}</p>

              <div className="blog-post-author-bar">
                <div className="author-meta">
                  <div className="author-avatar-badge">⚓</div>
                  <div>
                    <div className="author-name">{post.author.name}</div>
                    <div className="author-role">{post.author.role}</div>
                  </div>
                </div>
                <div className="post-date-wrap">
                  <span className="post-date">{post.date}</span>
                </div>
              </div>

              {/* Draft / Editorial Notice */}
              <div className="blog-draft-notice">
                <span>📝 <strong>Editorial Staging Mode:</strong> This comprehensive draft is in internal review prior to formal public indexation. Content is verified against IMO MEPC.269(68) and EU SRR 1257/2013 standards.</span>
              </div>
            </div>
          </header>

          {/* Article Main Body */}
          <div className="container blog-post-layout">
            <div className="blog-post-content">
              {/* Key Takeaways Box */}
              {post.keyTakeaways && (
                <div className="key-takeaways-card">
                  <div className="kt-header">
                    <span className="kt-icon">💡</span>
                    <h3>Executive Summary &amp; Key Takeaways</h3>
                  </div>
                  <ul className="kt-list">
                    {post.keyTakeaways.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Article Content Sections */}
              {post.sections.map((section, idx) => (
                <section className="article-section" key={idx}>
                  <h2>{section.heading}</h2>
                  {section.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.split('**').map((chunk, cIdx) =>
                        cIdx % 2 === 1 ? <strong key={cIdx}>{chunk}</strong> : chunk
                      )}
                    </p>
                  ))}

                  {section.checklist && (
                    <div className="article-checklist-card">
                      <div className="ac-title">Key Verification Points:</div>
                      <ul className="ac-items">
                        {section.checklist.map((item, cIdx) => (
                          <li key={cIdx}>
                            <span className="ac-check">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              ))}

              {/* Post Footer & Social Share */}
              <div className="blog-share-bar">
                <div className="share-label">Share This Guide:</div>
                <div className="share-buttons">
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn share-linkedin"
                    aria-label="Share on LinkedIn"
                  >
                    <LinkedInIcon size={16} />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn share-facebook"
                    aria-label="Share on Facebook"
                  >
                    <FacebookIcon size={16} />
                    <span>Facebook</span>
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - ${currentUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn share-whatsapp"
                    aria-label="Share on WhatsApp"
                  >
                    <WhatsAppIcon size={16} />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="share-btn share-copy"
                    aria-label="Copy article link"
                  >
                    {copied ? '✓ Link Copied!' : '🔗 Copy Link'}
                  </button>
                </div>
              </div>

              {/* In-article Demo CTA */}
              <div className="article-demo-cta">
                <div className="ad-cta-content">
                  <div className="eyebrow">Digital IHM Solution</div>
                  <h3>Ready to automate your fleet&apos;s IHM Part I records?</h3>
                  <p>
                    See how OceanLedger by MARICOMX handles purchase order line-item screening,
                    supplier MD/SDoC collection, and class survey exports in one unified platform.
                  </p>
                  <div className="ad-cta-actions">
                    <Link to="/book-demo" className="btn-primary">
                      Book a Fleet Demo →
                    </Link>
                    <Link to="/#features" className="btn-ghost">
                      Explore Platform Features
                    </Link>
                  </div>
                </div>
              </div>

              {/* Keywords Tag Cloud */}
              <div className="article-keywords-block">
                <span className="ak-label">Target Search Topics:</span>
                <div className="ak-list">
                  {post.keywords.map((kw) => (
                    <span key={kw} className="ak-tag">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar / Related Posts */}
            <aside className="blog-post-sidebar">
              <div className="sidebar-sticky-card">
                <h4>About MARICOMX</h4>
                <p>
                  MARICOMX provides maritime compliance software designed to keep commercial fleets audit-ready
                  under IMO Hong Kong Convention and EU Ship Recycling Regulation standards.
                </p>
                <div className="sidebar-links">
                  <Link to="/book-demo" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Request Fleet Demo
                  </Link>
                </div>

                <div className="sidebar-divider"></div>

                <h4>Related Articles</h4>
                <div className="sidebar-related-list">
                  {relatedPosts.map((rel) => (
                    <div className="rel-card" key={rel.id}>
                      <span className="rel-cat">{rel.category}</span>
                      <h5>
                        <Link to={`/blogs/${rel.slug}`}>{rel.title}</Link>
                      </h5>
                      <span className="rel-time">{rel.readTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </article>

        {/* Global Social Banner */}
        <SocialBanner />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
