'use client';

import { useLang } from '@/lib/LanguageContext';

const techCategories = [
  {
    labelKey: 'techstack.frontend',
    color: '#00d4ff',
    items: [
      { name: 'Next.js', icon: '▲', detail: 'React Framework' },
      { name: 'React', icon: '⚛️', detail: 'UI Library' },
      { name: 'React Native', icon: '📱', detail: 'Mobile Apps' },
      { name: 'Tailwind CSS', icon: '🎨', detail: 'Styling' },
      { name: 'TypeScript', icon: '📘', detail: 'Type Safety' },
    ],
  },
  {
    labelKey: 'techstack.backend',
    color: '#00ff88',
    items: [
      { name: 'Node.js', icon: '🟢', detail: 'Runtime' },
      { name: 'Python', icon: '🐍', detail: 'Backend / AI' },
      { name: 'PostgreSQL', icon: '🐘', detail: 'Database' },
      { name: 'GraphQL', icon: '🔮', detail: 'Query Language' },
      { name: 'Redis', icon: '🔴', detail: 'Caching' },
    ],
  },
  {
    labelKey: 'techstack.cloud',
    color: '#a855f7',
    items: [
      { name: 'Supabase', icon: '⚡', detail: 'BaaS' },
      { name: 'Vercel', icon: '▲', detail: 'Deployment' },
      { name: 'AWS', icon: '☁️', detail: 'Cloud' },
      { name: 'Docker', icon: '🐳', detail: 'Containers' },
      { name: 'GitHub CI/CD', icon: '🔄', detail: 'Automation' },
    ],
  },
  {
    labelKey: 'techstack.ai',
    color: '#f59e0b',
    items: [
      { name: 'Anthropic API', icon: '🤖', detail: 'Claude AI' },
      { name: 'OpenAI API', icon: '🧠', detail: 'GPT Models' },
      { name: 'TensorFlow', icon: '📊', detail: 'ML Framework' },
      { name: 'LangChain', icon: '🔗', detail: 'LLM Orchestration' },
      { name: 'Hugging Face', icon: '🤗', detail: 'Model Hub' },
    ],
  },
];

export default function TechStackSection() {
  const { t } = useLang();

  return (
    <section
      id="tech"
      style={{
        padding: '100px 0',
        background: 'linear-gradient(180deg, transparent, rgba(26,58,82,0.15) 50%, transparent)',
      }}
    >
      <div className="container-section">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-tag">{t('techstack.label')}</div>
          <h2 className="section-title">{t('techstack.title')}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>
            {t('techstack.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {techCategories.map((cat) => (
            <div key={cat.labelKey}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: cat.color,
                    boxShadow: `0 0 12px ${cat.color}`,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: cat.color,
                  }}
                >
                  {t(cat.labelKey)}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: `linear-gradient(90deg, ${cat.color}30, transparent)`,
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 12,
                }}
              >
                {cat.items.map((tech) => (
                  <div
                    key={tech.name}
                    className="tech-badge"
                    title={tech.detail}
                    role="listitem"
                    aria-label={`${tech.name}: ${tech.detail}`}
                  >
                    <span style={{ fontSize: 22 }}>{tech.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{tech.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{tech.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
