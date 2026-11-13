'use client';

import { useLang, isRtlLanguage } from '@/lib/LanguageContext';

export default function AboutSection() {
  const { t, lang } = useLang();
  const isRtl = isRtlLanguage(lang);
  const isUrdu = lang === 'ur';

  const stats = [
    { value: '5', label: t('about.stat.projects'), icon: '↗' },
    { value: '3', label: t('about.stat.founders'), icon: '◎' },
    { value: '8', label: t('about.stat.languages'), icon: '文' },
  ];

  const values = [
    { titleKey: 'about.value1.title', descKey: 'about.value1.desc', en: 'We aim for understandable, maintainable work—not just a quick visual result. Quality includes clear structure, careful testing, and decisions that make future changes easier.', ur: 'ہم صرف جلدی سے خوبصورت نتیجہ بنانے کے بجائے قابلِ فہم اور برقرار رکھنے کے قابل کام کو اہمیت دیتے ہیں۔ معیار میں واضح ساخت، محتاط ٹیسٹنگ اور مستقبل کی تبدیلیوں کو آسان بنانے والے فیصلے شامل ہیں۔' },
    { titleKey: 'about.value2.title', descKey: 'about.value2.desc', en: 'We choose technology to solve the actual problem. New tools are useful when they improve the product, workflow, security, or long-term cost—not simply because they are new.', ur: 'ہم ٹیکنالوجی کا انتخاب اصل مسئلے کو حل کرنے کے لیے کرتے ہیں۔ نئی ٹیکنالوجی تب مفید ہے جب وہ پروڈکٹ، ورک فلو، سیکیورٹی یا طویل مدتی لاگت بہتر بنائے، صرف نئی ہونے کی وجہ سے نہیں۔' },
    { titleKey: 'about.value3.title', descKey: 'about.value3.desc', en: 'Clear communication is part of delivery. We make scope, trade-offs, progress, and open questions visible so decisions can be made with context.', ur: 'واضح رابطہ بھی ڈیلیوری کا حصہ ہے۔ ہم کام کا دائرۂ کار، ممکنہ سمجھوتے، پیش رفت اور زیرِ غور سوالات واضح رکھتے ہیں تاکہ فیصلے پوری معلومات کے ساتھ کیے جا سکیں۔' },
    { titleKey: 'about.value4.title', descKey: 'about.value4.desc', en: 'We consider how a product may evolve: more users, more data, new workflows, or new integrations. Architecture should fit today’s needs while leaving sensible room to grow.', ur: 'ہم یہ بھی دیکھتے ہیں کہ پروڈکٹ مستقبل میں کیسے بڑھے گی: زیادہ صارفین، ڈیٹا، نئے ورک فلو یا انٹیگریشنز۔ آرکیٹیکچر آج کی ضرورت پوری کرے اور مناسب انداز میں آگے بڑھنے کی گنجائش بھی رکھے۔' },
  ];

  return (
    <section id="about" className="cx-about-editorial" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container-section">
        <div className="cx-about-heading">
          <div className="section-tag">{t('about.label')}</div>
          <h2 className="section-title">{t('about.title')}</h2>
        </div>

        <div className="cx-about-overview">
          <div className="cx-about-copy">
            <p>{t('about.desc1')}</p>
            <p>{t('about.desc2')}</p>
            <p>{t('about.desc3')}</p>
            <div className="cx-about-tags">
              <span>{t('about.location')}</span>
              <span>{t('about.reach')}</span>
            </div>
          </div>
          <div className="cx-about-stats">
            {stats.map((stat) => (
              <div className="stat-card" key={stat.label}>
                <div className="cx-about-stat-icon">{stat.icon}</div>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cx-values-divider" />
        <div className="cx-values-layout">
          <div className="cx-values-intro">
            <span className="section-tag">{isUrdu ? 'ہمارے اصول' : 'HOW WE THINK'}</span>
            <h3>{t('about.values.title')}</h3>
            <p>{t('about.values.subtitle')}</p>
            <div className="cx-values-statement">{isUrdu ? 'اصول صرف الفاظ نہیں، روزمرہ کے فیصلوں میں نظر آنے چاہئیں۔' : 'Principles matter when they shape everyday decisions.'}</div>
          </div>
          <div className="cx-values-list">
            {values.map((value, index) => (
              <article className="cx-value-row" key={value.titleKey}>
                <span className="cx-value-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h4>{t(value.titleKey)}</h4>
                  <p>{isUrdu ? value.ur : value.en}</p>
                </div>
                <span className="cx-value-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
