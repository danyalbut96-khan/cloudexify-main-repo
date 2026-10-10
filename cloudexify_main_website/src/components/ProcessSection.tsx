'use client';

import { useLang, isRtlLanguage } from '@/lib/LanguageContext';

const processSteps = [
  { icon: '🎯', titleKey: 'process.step1.title', descKey: 'process.step1.desc', duration: '1-2 weeks' },
  { icon: '🏗️', titleKey: 'process.step2.title', descKey: 'process.step2.desc', duration: '1-2 weeks' },
  { icon: '🎨', titleKey: 'process.step3.title', descKey: 'process.step3.desc', duration: '2-3 weeks' },
  { icon: '💻', titleKey: 'process.step4.title', descKey: 'process.step4.desc', duration: '4-12 weeks' },
  { icon: '✅', titleKey: 'process.step5.title', descKey: 'process.step5.desc', duration: '1-2 weeks' },
  { icon: '🚀', titleKey: 'process.step6.title', descKey: 'process.step6.desc', duration: '1 week' },
  { icon: '🛠️', titleKey: 'process.step7.title', descKey: 'process.step7.desc', duration: 'Ongoing' },
];

export default function ProcessSection() {
  const { t, lang } = useLang();
  const isRtl = isRtlLanguage(lang);

  return (
    <section id="process" style={{ padding: '100px 0' }}>
      <div className="container-section">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-tag">{t('process.label')}</div>
          <h2 className="section-title">{t('process.title')}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>
            {t('process.subtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800, margin: '0 auto' }}>
          {processSteps.map((step, idx) => (
            <div
              key={step.titleKey}
              className="glass-card"
              style={{
                display: 'flex',
                gap: 20,
                padding: '20px',
                alignItems: 'flex-start',
                position: 'relative',
                flexDirection: isRtl ? 'row-reverse' : 'row',
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  flexShrink: 0,
                  marginTop: 4,
                }}
              >
                {step.icon}
              </div>
              <div style={{ flex: 1, textAlign: isRtl ? 'right' : 'left' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 8,
                    flexWrap: 'wrap',
                    flexDirection: isRtl ? 'row-reverse' : 'row',
                  }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {lang === 'ur'
                      ? `مرحلہ ${idx + 1}: `
                      : lang === 'ps'
                        ? `ګام ${idx + 1}: `
                        : lang === 'pa'
                          ? `مرحلہ ${idx + 1}: `
                          : lang === 'fa'
                            ? `مرحله ${idx + 1}: `
                            : lang === 'ar'
                              ? `الخطوة ${idx + 1}: `
                              : `Step ${idx + 1}: `}
                    {t(step.titleKey)}
                  </h3>
                  <span
                    style={{
                      fontSize: 12,
                      background: 'rgba(0, 255, 136, 0.1)',
                      color: 'var(--accent-green)',
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontWeight: 600,
                    }}
                  >
                    ⏱ {step.duration}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 15, lineHeight: 1.6 }}>
                  {t(step.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
