'use client';

import Link from 'next/link';
import { useLang } from '@/lib/LanguageContext';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: 'Web Development' | 'AI Solutions' | 'Mobile Apps' | 'SaaS';
  date: string;
  readTime: number;
  image: string;
  slug: string;
}

const posts: BlogPost[] = [
  {
    id: '1',
    title: '10 Next.js Performance Tips You Need to Know',
    excerpt: 'Learn the essential techniques to optimize your Next.js applications for blazing-fast performance. From image optimization to code splitting and advanced caching strategies.',
    category: 'Web Development',
    date: 'Jan 15, 2026',
    readTime: 8,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    slug: '/blog/nextjs-performance-tips',
  },
  {
    id: '2',
    title: 'AI Integration in Web Applications: A Complete Guide',
    excerpt: 'Explore how to integrate AI capabilities into your web applications using Claude API, OpenAI, and modern frameworks. Build intelligent features that delight your users.',
    category: 'AI Solutions',
    date: 'Jan 10, 2026',
    readTime: 12,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80',
    slug: '/blog/ai-integration-guide',
  },
  {
    id: '3',
    title: 'Building Cross-Platform Mobile Apps with React Native',
    excerpt: 'Master the art of building native-quality mobile applications that work seamlessly on both iOS and Android. Learn best practices from our experienced team.',
    category: 'Mobile Apps',
    date: 'Jan 5, 2026',
    readTime: 10,
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    slug: '/blog/react-native-guide',
  },
  {
    id: '4',
    title: 'The Complete Guide to SaaS Architecture & Scaling',
    excerpt: 'Learn how to design and build SaaS platforms that scale gracefully. From database design to multi-tenancy implementation and enterprise features.',
    category: 'SaaS',
    date: 'Dec 28, 2025',
    readTime: 15,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    slug: '/blog/saas-architecture-guide',
  }
];

const categoryColors: Record<string, string> = {
  'Web Development': '#00ff88',
  'AI Solutions': '#00d4ff',
  'Mobile Apps': '#a78bfa',
  'SaaS': '#fb923c',
};

export default function BlogSection() {
  const { t } = useLang();

  return (
    <section id="insights" style={{ padding: '100px 0' }}>
      <div className="container-section">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-tag">{t('blog.label')}</div>
          <h2 className="section-title" style={{ marginBottom: 12 }}>{t('blog.title')}</h2>
        </div>

        {/* Blog Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={post.slug} 
              style={{ textDecoration: 'none', display: 'flex' }}
            >
              <article
                className="glass-card blog-card-wrapper"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  flex: 1,
                  padding: 0,
                  transition: 'all 0.3s ease',
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                {/* Image & Badge */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '62.5%', // 16:10 Aspect Ratio
                    overflow: 'hidden',
                  }}
                  className="blog-img-container"
                >
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    className="blog-img"
                  />
                  
                  {/* Category Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      background: `${categoryColors[post.category]}20`,
                      border: `1px solid ${categoryColors[post.category]}40`,
                      backdropFilter: 'blur(8px)',
                      color: categoryColors[post.category],
                      padding: '6px 14px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      zIndex: 2,
                    }}
                  >
                    {post.category}
                  </span>
                </div>
                
                {/* Content */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 
                    style={{ 
                      fontSize: 18, 
                      fontWeight: 700, 
                      color: 'var(--text-primary)', 
                      marginBottom: 12, 
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {post.title}
                  </h3>
                  
                  <p 
                    style={{ 
                      fontSize: 14, 
                      color: 'var(--text-secondary)', 
                      lineHeight: 1.6, 
                      flex: 1, 
                      marginBottom: 24,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {post.excerpt}
                  </p>
                  
                  {/* Meta Footer */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      fontSize: 12, 
                      color: 'var(--text-muted)',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: 16,
                      marginTop: 'auto',
                      marginBottom: 16,
                    }}
                  >
                    <span>{post.date}</span>
                    <span>{post.readTime} min read</span>
                  </div>

                  {/* CTA */}
                  <div
                    style={{
                      color: 'var(--accent-cyan)',
                      fontSize: 14,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                    className="blog-cta"
                  >
                    {t('blog.readarticle')}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link 
            href="/blog"
            style={{
              color: 'var(--accent-green)',
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
          >
            {t('blog.viewall')}
          </Link>
        </div>
      </div>

      <style>{`
        .blog-card-wrapper:hover .blog-img {
          transform: scale(1.05);
        }
        .blog-card-wrapper:hover .blog-arrow {
          transform: translateX(4px);
        }
      `}</style>
    </section>
  );
}
