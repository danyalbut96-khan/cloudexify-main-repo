'use client';

import { useLang, isRtlLanguage } from '@/lib/LanguageContext';

export default function AboutSection() {
  const { t, lang } = useLang();
  const isRtl = isRtlLanguage(lang);

  const stats = [
    { value: '6', labelKey: 'about.stat.projects', icon: '🚀' },
    { value: '4+', labelKey: 'about.stat.clients', icon: '😊' },
    { value: '1+', labelKey: 'about.stat.experience', icon: '📅' },
    { value: 'team', labelKey: 'about.stat.team', icon: '👥' },
  ];

  const values = [
    { icon: '⭐', titleKey: 'about.value1.title', descKey: 'about.value1.desc' },
    { icon: '🔬', titleKey: 'about.value2.title', descKey: 'about.value2.desc' },
    { icon: '🤝', titleKey: 'about.value3.title', descKey: 'about.value3.desc' },
    { icon: '📈', titleKey: 'about.value4.title', descKey: 'about.value4.desc' },
  ];

  return (
    <section
      id="about"
      style={{
        padding: '100px 0',
        background: 'linear-gradient(180deg, rgba(26,58,82,0.12) 0%, transparent 100%)',
      }}
    >
      <div className="container-section">
        <div style={{ textAlign: 'center', marginBottom: 70 }}>
          <div className="section-tag">{t('about.label')}</div>
          <h2 className="section-title">{t('about.title')}</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 64,
            alignItems: 'center',
            marginBottom: 80,
          }}
        >
          <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: 22 }}>
              {t('about.desc1')}
            </p>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: 22 }}>
              {t('about.desc2')}
            </p>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.85 }}>
              {t('about.desc3')}
            </p>

            <div
              style={{
                marginTop: 32,
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                flexDirection: isRtl ? 'row-reverse' : 'row',
              }}
            >
              <span
                style={{
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.25)',
                  color: '#00ff88',
                  padding: '8px 18px',
                  borderRadius: 50,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {t('about.location')}
              </span>
              <span
                style={{
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.25)',
                  color: '#00d4ff',
                  padding: '8px 18px',
                  borderRadius: 50,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {t('about.reach')}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {stats.map((s) => (
              <div key={s.labelKey} className="stat-card">
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div
                  style={{
                    fontSize: 34,
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #00ff88, #00d4ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-1px',
                    marginBottom: 6,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{t(s.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" style={{ marginBottom: 60 }} />

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {t('about.values.title')}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>{t('about.values.subtitle')}</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 20,
          }}
        >
          {values.map((v) => (
            <div key={v.titleKey} className="glass-card" style={{ padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{v.icon}</div>
              <h4 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                {t(v.titleKey)}
              </h4>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t(v.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
