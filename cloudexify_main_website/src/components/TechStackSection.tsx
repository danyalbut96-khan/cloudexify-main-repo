'use client';

import { useLang } from '@/lib/LanguageContext';

type TechItem = { name: string; icon: string; detail: string };
const techCategories: { labelKey: string; items: TechItem[] }[] = [
  {
    labelKey: 'techstack.frontend',
    items: [
      { name: 'Next.js', icon: 'nextdotjs', detail: 'React framework' },
      { name: 'React', icon: 'react', detail: 'UI library' },
      { name: 'React Native', icon: 'react', detail: 'Cross-platform mobile' },
      { name: 'Tailwind CSS', icon: 'tailwindcss', detail: 'Utility-first CSS' },
      { name: 'TypeScript', icon: 'typescript', detail: 'Typed JavaScript' },
    ],
  },
  {
    labelKey: 'techstack.backend',
    items: [
      { name: 'Node.js', icon: 'nodedotjs', detail: 'JavaScript runtime' },
      { name: 'Python', icon: 'python', detail: 'Backend & AI development' },
      { name: 'PostgreSQL', icon: 'postgresql', detail: 'Relational database' },
      { name: 'GraphQL', icon: 'graphql', detail: 'API query language' },
      { name: 'Redis', icon: 'redis', detail: 'In-memory data store' },
    ],
  },
  {
    labelKey: 'techstack.cloud',
    items: [
      { name: 'Supabase', icon: 'supabase', detail: 'Backend platform' },
      { name: 'Vercel', icon: 'vercel', detail: 'Web deployment platform' },
      { name: 'AWS', icon: 'amazonwebservices', detail: 'Cloud infrastructure' },
      { name: 'Docker', icon: 'docker', detail: 'Container platform' },
      { name: 'GitHub Actions', icon: 'githubactions', detail: 'CI/CD automation' },
    ],
  },
  {
    labelKey: 'techstack.ai',
    items: [
      { name: 'Anthropic', icon: 'anthropic', detail: 'Claude models & API' },
      { name: 'OpenAI', icon: 'openai', detail: 'AI models & API' },
      { name: 'TensorFlow', icon: 'tensorflow', detail: 'Machine learning' },
      { name: 'LangChain', icon: 'langchain', detail: 'LLM application framework' },
      { name: 'Hugging Face', icon: 'huggingface', detail: 'AI models & tooling' },
    ],
  },
];

export default function TechStackSection() {
  const { t } = useLang();

  return (
    <section id="tech" className="cx-tech-section">
      <div className="container-section">
        <header className="cx-section-heading">
          <span className="section-tag">{t('techstack.label')}</span>
          <h2 className="section-title">{t('techstack.title')}</h2>
          <p className="section-subtitle">{t('techstack.subtitle')}</p>
        </header>

        <div className="cx-tech-groups">
          {techCategories.map((category) => (
            <section className="cx-tech-group" key={category.labelKey} aria-label={t(category.labelKey)}>
              <div className="cx-tech-group-heading">
                <h3>{t(category.labelKey)}</h3>
                <span />
              </div>
              <div className="cx-tech-grid">
                {category.items.map((tech) => (
                  <div className="tech-badge cx-tech-card" key={tech.name} title={tech.detail}>
                    <span className="cx-tech-logo">
                      <img
                        src={`/brand-icons/${tech.icon}.svg`}
                        alt=""
                        width="28"
                        height="28"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="cx-tech-copy">
                      <strong>{tech.name}</strong>
                      <small>{tech.detail}</small>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
