'use client';

import { useState } from 'react';
import { useLang, isRtlLanguage } from '@/lib/LanguageContext';

const faqKeys = [
  { q: 'faq.q1', a: 'faq.a1' },
  { q: 'faq.q2', a: 'faq.a2' },
  { q: 'faq.q3', a: 'faq.a3' },
  { q: 'faq.q4', a: 'faq.a4' },
  { q: 'faq.q5', a: 'faq.a5' },
  { q: 'faq.q6', a: 'faq.a6' },
  { q: 'faq.q7', a: 'faq.a7' },
];

export default function FAQSection() {
  const { t, lang } = useLang();
  const isRtl = isRtlLanguage(lang);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section
      id="faq"
      style={{
        padding: '100px 0',
        background: 'linear-gradient(180deg, transparent, rgba(26,58,82,0.1) 50%, transparent)',
      }}
    >
      <div className="container-section">
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-tag">{t('faq.label')}</div>
          <h2 className="section-title">{t('faq.title')}</h2>
        </div>

        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          {faqKeys.map((faq, i) => (
            <div key={faq.q} className={`faq-item${openIndex === i ? ' open' : ''}`} id={`faq-${i}`}>
              <button
                className="faq-question"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span style={{ paddingRight: isRtl ? 0 : 20, paddingLeft: isRtl ? 20 : 0, textAlign: isRtl ? 'right' : 'left', flex: 1 }}>
                  {t(faq.q)}
                </span>
                <span
                  style={{
                    color: openIndex === i ? '#00ff88' : '#00d4ff',
                    fontSize: 20,
                    fontWeight: 300,
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              <div
                id={`faq-answer-${i}`}
                className="faq-answer"
                role="region"
                aria-hidden={openIndex !== i}
                style={{ textAlign: isRtl ? 'right' : 'left' }}
              >
                {t(faq.a)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 15 }}>{t('faq.stillquestions')}</p>
          <a href="mailto:hello@cloudexify.site" className="btn-secondary" style={{ display: 'inline-flex' }}>
            {t('faq.emailus')}
          </a>
        </div>
      </div>
    </section>
  );
}
