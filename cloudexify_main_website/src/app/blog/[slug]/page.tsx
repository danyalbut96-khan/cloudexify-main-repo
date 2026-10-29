import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { t } from '@/locales/t';

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  // Generate a mock title from the slug
  const title = resolvedParams.slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <main>
      <Navbar />
      <section style={{ padding: '160px 0 80px', minHeight: '80vh' }}>
        <div className="container-section" style={{ maxWidth: 800 }}>
          <div style={{ marginBottom: 24, fontSize: 14 }}>
            <Link href="/" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>{t('blog.home')}</Link>
            <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--text-secondary)' }}>{t('blog.blog')}</span>
          </div>
          
          <h1 className="section-title" style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: 24 }}>
            {title || 'Blog Article'}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48, color: 'var(--text-muted)', fontSize: 14 }}>
            <span>{t('blog.date')}</span>
            <span>•</span>
            <span>{t('blog.author')}</span>
          </div>

          <div style={{ 
            color: 'var(--text-secondary)', 
            fontSize: 16, 
            lineHeight: 1.8, 
            background: 'var(--bg-card)', 
            padding: 32, 
            borderRadius: 16,
            border: '1px solid var(--border-subtle)'
          }}>
            <p style={{ marginBottom: 24 }}>
              {t('blog.para1')}
            </p>
            <p style={{ marginBottom: 24 }}>
              {t('blog.para2')}
            </p>
            <div style={{ marginTop: 40 }}>
              <Link href="/" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                {t('blog.backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
