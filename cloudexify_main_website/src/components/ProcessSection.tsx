'use client';

import { useLang, isRtlLanguage } from '@/lib/LanguageContext';

const processSteps = [
  { titleKey:'process.step1.title', en:'We discuss the problem you want to solve, who will use the product, and what success should look like. We also review any existing material or system that affects the work.', ur:'ہم اس مسئلے، صارفین اور مطلوبہ نتیجے کو سمجھتے ہیں۔ موجودہ ویب سائٹ، سسٹم یا مواد بھی دیکھتے ہیں جو کام پر اثر انداز ہو سکتا ہے۔', output:'Project brief' },
  { titleKey:'process.step2.title', en:'We turn the discussion into a clear scope: features, user roles, integrations, constraints, priorities, and milestones. This is where assumptions and exclusions are made explicit.', ur:'ہم گفتگو کو واضح دائرۂ کار میں بدلتے ہیں: فیچرز، صارفین کے کردار، انٹیگریشنز، حدود، ترجیحات اور مراحل۔ اسی وقت غیر واضح باتوں اور شامل نہ ہونے والے کام کو بھی واضح کیا جاتا ہے۔', output:'Scope & milestones' },
  { titleKey:'process.step3.title', en:'We map the screens and user journeys before implementation. Wireframes show structure; visual designs establish hierarchy, components, and responsive behaviour for approval.', ur:'کوڈنگ سے پہلے ہم اسکرینز اور صارف کے راستے طے کرتے ہیں۔ وائر فریم ساخت دکھاتے ہیں، جبکہ ڈیزائن میں رنگ، ٹائپوگرافی، اجزاء اور موبائل لے آؤٹ واضح ہوتے ہیں۔', output:'Approved UI direction' },
  { titleKey:'process.step4.title', en:'The approved design becomes a working product. We implement the interface, backend rules, database, APIs, and integrations in planned increments, keeping changes reviewable.', ur:'منظور شدہ ڈیزائن کو قابلِ استعمال سافٹ ویئر میں تبدیل کیا جاتا ہے۔ ہم فرنٹ اینڈ، بیک اینڈ، ڈیٹا بیس، APIs اور انٹیگریشنز کو مرحلہ وار تیار کرتے ہیں تاکہ تبدیلیوں کا جائزہ لیا جا سکے۔', output:'Working software' },
  { titleKey:'process.step5.title', en:'We check the agreed flows, edge cases, responsive layouts, permissions, and performance. Issues found during testing are fixed before the release is approved.', ur:'ہم طے شدہ فیچرز، مختلف حالات، موبائل لے آؤٹ، اجازتوں اور کارکردگی کو چیک کرتے ہیں۔ ٹیسٹنگ میں ملنے والے مسائل ریلیز سے پہلے درست کیے جاتے ہیں۔', output:'QA findings & fixes' },
  { titleKey:'process.step6.title', en:'After the agreed acceptance checks, we prepare the production environment, configure the release, and verify the live application. Access and handover items follow the project agreement.', ur:'منظور شدہ جانچ کے بعد ہم پروڈکشن ماحول تیار، ریلیز کنفیگر اور لائیو ایپلیکیشن کی تصدیق کرتے ہیں۔ اکاؤنٹس اور ہینڈ اوور کی تفصیلات پروجیکٹ کے معاہدے کے مطابق ہوتی ہیں۔', output:'Production release' },
  { titleKey:'process.step7.title', en:'After launch, we can help with agreed fixes, updates, monitoring, or further improvements. Ongoing maintenance is scoped according to the selected support arrangement.', ur:'لانچ کے بعد طے شدہ اصلاحات، اپ ڈیٹس، مانیٹرنگ یا مزید بہتری میں مدد دی جا سکتی ہے۔ مسلسل مینٹیننس منتخب سپورٹ معاہدے کے مطابق طے ہوتی ہے۔', output:'Handover & next steps' },
];

export default function ProcessSection() {
  const { t, lang } = useLang();
  const isRtl = isRtlLanguage(lang);
  const isUrdu = lang === 'ur';

  return (
    <section id="process" className="cx-process-editorial" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container-section">
        <header className="cx-process-heading">
          <span className="section-tag">{t('process.label')}</span>
          <h2 className="section-title">{t('process.title')}</h2>
          <p className="section-subtitle">{t('process.subtitle')}</p>
        </header>

        <div className="cx-process-intro">
          <div className="cx-process-intro-mark">01—07</div>
          <p>{isUrdu ? 'ہر مرحلے کا مقصد واضح رکھیں، پیش رفت کا جائزہ لیں، اور اگلے مرحلے پر جانے سے پہلے ضروری منظوری حاصل کریں۔' : 'A transparent workflow keeps decisions visible. We review progress together and confirm the important checkpoints before moving forward.'}</p>
        </div>

        <div className="cx-process-timeline">
          {processSteps.map((step, index) => (
            <article className="cx-process-step" key={step.titleKey}>
              <div className="cx-process-step-index">{String(index + 1).padStart(2, '0')}</div>
              <div className="cx-process-step-content">
                <div className="cx-process-step-meta">{isUrdu ? 'مرحلہ ' + (index + 1) : 'PHASE ' + String(index + 1).padStart(2, '0')}</div>
                <h3>{t(step.titleKey)}</h3>
                <p>{isUrdu ? step.ur : step.en}</p>
                <div className="cx-process-output"><span>{isUrdu ? 'اہم نتیجہ' : 'TYPICAL OUTPUT'}</span><strong>{isUrdu ? ['پروجیکٹ بریف','دائرۂ کار اور مراحل','منظور شدہ ڈیزائن','قابلِ استعمال سافٹ ویئر','ٹیسٹنگ اور اصلاحات','پروڈکشن ریلیز','ہینڈ اوور اور اگلے اقدامات'][index] : step.output}</strong></div>
              </div>
            </article>
          ))}
        </div>
        <div className="cx-process-note">
          <span aria-hidden="true">↗</span>
          <p>{isUrdu ? 'پروجیکٹ کی نوعیت کے مطابق مراحل، منظوریوں اور ڈیلیوری کی ترتیب تبدیل ہو سکتی ہے۔ حتمی شیڈول کام کے دائرۂ کار میں طے کیا جاتا ہے۔' : 'The exact sequence and depth of each phase depend on the project. The agreed scope and proposal define the actual milestones and delivery plan.'}</p>
        </div>
      </div>
    </section>
  );
}
