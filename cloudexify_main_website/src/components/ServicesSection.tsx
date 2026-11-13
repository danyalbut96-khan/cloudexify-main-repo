'use client';

import Link from 'next/link';
import { useLang, isRtlLanguage } from '@/lib/LanguageContext';

const services = [
  { slug:'web-development',icon:'web',titleKey:'services.web.title',en:'A business website or web application is where people discover your offer, use your service, or complete a task online. We design the pages, connect the required functionality, and make the experience work across phones, tablets, and desktops.',ur:'بزنس ویب سائٹ یا ویب ایپلیکیشن وہ جگہ ہے جہاں لوگ آپ کی سروس دیکھتے، استعمال کرتے یا آن لائن کوئی کام مکمل کرتے ہیں۔ ہم اس کے صفحات، ضروری فیچرز اور موبائل سے ڈیسک ٹاپ تک مکمل تجربہ تیار کرتے ہیں۔',scope:['Business & landing pages','Portals and dashboards','Forms and integrations','Responsive UI and SEO foundations'] },
  { slug:'mobile-app-development',icon:'mobile',titleKey:'services.mobile.title',en:'A mobile app puts your product or service directly on a customer’s phone. We build apps for common journeys such as accounts, bookings, notifications, payments, and syncing data with your backend.',ur:'موبائل ایپ آپ کی سروس یا پروڈکٹ کو صارف کے فون تک پہنچاتی ہے۔ ہم اکاؤنٹ، بکنگ، نوٹیفکیشن، ادائیگی اور بیک اینڈ کے ساتھ ڈیٹا سنک کرنے جیسے فیچرز تیار کرتے ہیں۔',scope:['iOS and Android apps','Sign-in and user profiles','Push notifications','API and payment integrations'] },
  { slug:'ai-solutions',icon:'ai',titleKey:'services.ai.title',en:'AI solutions add capabilities such as answering questions, finding information, classifying content, or assisting repetitive work. We connect suitable models to your data and workflows, with evaluation and human review where needed.',ur:'AI سلوشنز سوالات کے جواب، معلومات تلاش کرنے، مواد کی درجہ بندی یا بار بار ہونے والے کاموں میں مدد دے سکتے ہیں۔ ہم مناسب AI ماڈلز کو آپ کے ڈیٹا اور ورک فلو سے جوڑتے ہیں، اور ضرورت کے مطابق جانچ اور انسانی نگرانی شامل کرتے ہیں۔',scope:['AI assistants and chatbots','Knowledge search and RAG','Workflow automation','Model and API integration'] },
  { slug:'saas-development',icon:'saas',titleKey:'services.saas.title',en:'SaaS means Software as a Service: customers sign in to use your software online, often through a subscription. We build the product foundation—accounts, workspaces, plans, billing connections, dashboards, and administration.',ur:'SaaS یعنی Software as a Service: صارف آن لائن سائن اِن کر کے آپ کا سافٹ ویئر استعمال کرتے ہیں، اکثر سبسکرپشن کے ذریعے۔ ہم اکاؤنٹس، ورک اسپیس، پلانز، بلنگ، ڈیش بورڈ اور ایڈمن سسٹم بناتے ہیں۔',scope:['User accounts and workspaces','Subscription-ready architecture','Dashboards and admin tools','Database and access controls'] },
  { slug:'full-stack-development',icon:'stack',titleKey:'services.fullstack.title',en:'Full-stack development covers the complete application. The frontend is what people see and interact with; the backend handles rules and operations; the database stores information. We connect these layers into one working product.',ur:'فل اسٹیک ڈویلپمنٹ میں پوری ایپلیکیشن شامل ہوتی ہے۔ فرنٹ اینڈ وہ حصہ ہے جو صارف دیکھتا ہے، بیک اینڈ قواعد اور کام سنبھالتا ہے، جبکہ ڈیٹا بیس معلومات محفوظ کرتا ہے۔ ہم ان سب کو ایک مکمل پروڈکٹ میں جوڑتے ہیں۔',scope:['Frontend and user experience','Backend business logic','Database and API design','Integration and deployment'] },
  { slug:'cloud-devops',icon:'cloud',titleKey:'services.cloud.title',en:'Cloud and DevOps cover where your software runs and how updates reach it. We help configure hosting, environments, automated build-and-deploy pipelines, monitoring, backups, and operational practices suited to the project.',ur:'کلاؤڈ اور DevOps یہ طے کرتے ہیں کہ آپ کا سافٹ ویئر کہاں چلتا ہے اور نئی اپ ڈیٹس اس تک کیسے پہنچتی ہیں۔ ہم ہوسٹنگ، ماحول، خودکار بلڈ و ڈیپلائمنٹ، مانیٹرنگ، بیک اپ اور آپریشنل طریقہ کار ترتیب دیتے ہیں۔',scope:['Cloud and server setup','CI/CD deployment pipelines','Monitoring and backups','Environment and release management'] },
  { slug:'api-development',icon:'api',titleKey:'services.api.title',en:'An API is a defined way for software systems to exchange information. We build endpoints and integrations so your website, mobile app, database, or third-party service can communicate reliably with the right access controls.',ur:'API سافٹ ویئر سسٹمز کے درمیان معلومات کے تبادلے کا طے شدہ طریقہ ہے۔ ہم ایسے endpoints اور integrations بناتے ہیں جن سے ویب سائٹ، موبائل ایپ، ڈیٹا بیس اور دوسری سروسز محفوظ انداز میں آپس میں رابطہ کر سکیں۔',scope:['REST and GraphQL APIs','Third-party integrations','Authentication and permissions','API documentation and testing'] },
  { slug:'technical-consultation',icon:'consult',titleKey:'services.consulting.title',en:'Technical consultation helps you make informed decisions before committing time and budget. We review your idea or existing system, identify practical options and risks, and recommend a clear next step.',ur:'ٹیکنیکل کنسلٹیشن آپ کو وقت اور بجٹ لگانے سے پہلے درست فیصلے کرنے میں مدد دیتی ہے۔ ہم آپ کے آئیڈیا یا موجودہ سسٹم کا جائزہ لیتے، ممکنہ راستے اور خطرات واضح کرتے اور اگلا عملی قدم تجویز کرتے ہیں۔',scope:['Architecture and stack review','Project scope and estimates','Codebase and technical audits','Roadmap and risk assessment'] },
] as const;

const architecture: Record<(typeof services)[number]['icon'], string[]> = {
  web:['Interface','Content & forms','Business logic','Data layer'],
  mobile:['Mobile screens','App services','Secure APIs','Cloud data'],
  ai:['User request','AI orchestration','Knowledge & tools','Reviewed output'],
  saas:['Customer workspace','Plans & access','Core application','Shared platform'],
  stack:['Frontend','Backend','Database','Infrastructure'],
  cloud:['Source control','Build pipeline','Hosting runtime','Monitoring'],
  api:['Client app','API gateway','Validation & logic','Connected services'],
  consult:['Current state','Requirements','Options & trade-offs','Action roadmap'],
};

function ServiceGlyph({ name }: { name: (typeof services)[number]['icon'] }) {
  const common = { fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const };
  const paths: Record<(typeof services)[number]['icon'], React.ReactNode> = {
    web:<><rect x="3" y="4" width="18" height="15" rx="2.5"/><path d="M3 8h18M8 22h8M12 19v3M8 12l-2 2 2 2M16 12l2 2-2 2M13.5 11.5l-3 5"/></>,
    mobile:<><rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M10 5.5h4M11 18.5h2"/><circle cx="12" cy="15" r=".6" fill="currentColor" stroke="none"/></>,
    ai:<><path d="M12 3a4 4 0 0 0-7.2 2.4A4.5 4.5 0 0 0 4 14a4 4 0 0 0 4 6h4z"/><path d="M12 3a4 4 0 0 1 7.2 2.4A4.5 4.5 0 0 1 20 14a4 4 0 0 1-4 6h-4zM8 9h.01M16 9h.01M8 15h.01M16 15h.01M12 7v10"/></>,
    saas:<><path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8.5 4.8 4.8 0 0 0 7 18Z"/><path d="m10 14 2-2 2 2M12 12v5"/></>,
    stack:<><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    cloud:<><path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 8.5 4.8 4.8 0 0 0 7 18Z"/><path d="M12 11v7m-3-3 3 3 3-3"/></>,
    api:<><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6"/></>,
    consult:<><path d="M9 18h6M10 22h4M8.5 14.5A7 7 0 1 1 15.5 14.5c-.9.7-1.3 1.5-1.5 2.5h-4c-.2-1-.6-1.8-1.5-2.5Z"/><path d="M12 6v4m-2-2h4"/></>,
  };
  return <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" {...common}>{paths[name]}</svg>;
}

export default function ServicesSection() {
  const { t, lang } = useLang();
  const isRtl = isRtlLanguage(lang);
  const isUrdu = lang === 'ur';

  return (
    <section id="services" className="cx-services-section cx-services-editorial" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container-section">
        <header className="cx-section-heading">
          <span className="section-tag">{t('services.label')}</span>
          <h2 className="section-title">{t('services.title')}</h2>
          <p className="section-subtitle">{t('services.subtitle')}</p>
        </header>
        <div className="cx-service-list">
          {services.map((service, index) => (
            <article key={service.slug} className={'cx-service-row ' + (index % 2 === 1 ? 'is-reversed' : '')}>
              <div className="cx-service-copy">
                <div className="cx-service-kicker">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>{isUrdu ? 'ہماری سروسز' : 'CLOUDEXIFY / SERVICES'}</span>
                </div>
                <div className="cx-service-heading-line">
                  <span className="cx-service-icon"><ServiceGlyph name={service.icon}/></span>
                  <h3>{t(service.titleKey)}</h3>
                </div>
                <p className="cx-service-description">{isUrdu ? service.ur : service.en}</p>
                <div className="cx-service-scope-label">{isUrdu ? 'اس سروس میں کیا شامل ہے' : 'WHAT THIS CAN INCLUDE'}</div>
                <ul className="cx-service-scope">{service.scope.map((item) => <li key={item}>{item}</li>)}</ul>
                <Link href={'/services/' + service.slug} className="cx-service-detail-link">
                  {isUrdu ? 'مکمل تفصیلات دیکھیں' : 'Explore service details'} <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <div className="cx-service-visual" aria-label={t(service.titleKey) + ' architecture overview'}>
                <div className="cx-service-visual-top"><span><i/><i/><i/></span><small>{'CLOUDEXIFY / ' + String(index + 1).padStart(2,'0')}</small></div>
                <div className="cx-service-visual-content">
                  <div className="cx-service-visual-caption">{isUrdu ? 'سسٹم کا خاکہ' : 'A SIMPLE SYSTEM VIEW'}</div>
                  <div className="cx-service-visual-title">{t(service.titleKey)}</div>
                  <div className="cx-architecture-stack">
                    {architecture[service.icon].map((layer, layerIndex) => (
                      <div className="cx-architecture-layer" key={layer}>
                        <span className="cx-architecture-index">{'0' + (layerIndex + 1)}</span>
                        <span>{layer}</span><span className="cx-architecture-dot"/>
                      </div>
                    ))}
                  </div>
                  <div className="cx-service-visual-foot">
                    <span>{isUrdu ? 'منصوبہ بندی' : 'PLAN'}</span><b>→</b><span>{isUrdu ? 'تعمیر' : 'BUILD'}</span><b>→</b><span>{isUrdu ? 'ٹیسٹ' : 'TEST'}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
