'use client';

import { useLang } from '@/lib/LanguageContext';

const testimonials = [
  {
    id: 1,
    name: 'Ali Khan',
    title: 'Founder at TechStartup',
    quote: "Cloudexify transformed our business idea into a production-ready app in just 3 months. Their team's expertise in React Native was invaluable. Highly recommended!",
    rating: 5,
  },
  {
    id: 2,
    name: 'Fatima Ahmed',
    title: 'CEO at BusinessSoftware',
    quote: "Working with Cloudexify was a game-changer. They didn't just build our SaaS platform, they became partners in our growth. Excellent communication and results.",
    rating: 5,
  },
  {
    id: 3,
    name: 'Hassan Ali',
    title: 'CTO at InnovationCorp',
    quote: 'The AI integration they built into our system increased our efficiency by 40%. Professional, on-time, and exactly what we needed.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Amira Malik',
    title: 'Founder at EcommercePlatform',
    quote: 'From web development to deployment, Cloudexify handled everything with expertise and care. Best investment we made in 2024.',
    rating: 5,
  },
  {
    id: 5,
    name: 'Usman Raza',
    title: 'Product Manager at DigitalAgency',
    quote: 'Their full-stack approach meant we had one unified team throughout the project. No miscommunication, just results. 10/10!',
    rating: 5,
  },
  {
    id: 6,
    name: 'Nida Hassan',
    title: 'Director at EnterpriseCorp',
    quote: 'We needed a technical consultant, and they provided strategic guidance that saved us months of development time. Highly skilled professionals.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const { t } = useLang();

  return (
    <section id="testimonials" style={{ padding: '100px 0', background: 'var(--primary)' }}>
      <div className="container-section">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-tag">{t('testimonials.label')}</div>
          <h2 className="section-title">{t('testimonials.title')}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {testimonials.map((item) => (
            <article key={item.id} className="glass-card" style={{ padding: '28px 24px' }}>
              <div style={{ marginBottom: 14, color: '#fbbf24', fontSize: 16 }}>
                {'★'.repeat(item.rating)}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>
                &ldquo;{item.quote}&rdquo;
              </p>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{item.title}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
