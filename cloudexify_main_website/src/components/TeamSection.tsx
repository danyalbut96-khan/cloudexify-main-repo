'use client';

import { teamMembers } from '@/data/team';
import TeamCard from '@/components/team/TeamCard';
import { useLang } from '@/lib/LanguageContext';

export default function TeamSection() {
  const { t } = useLang();

  return (
    <section id="team" className="team-section">
      <div className="container-section">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-tag">{t('team.label')}</div>
          <h2 className="section-title">{t('team.title')}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>
            {t('team.subtitle')}
          </p>
        </div>

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <TeamCard key={member.id} member={member} index={index} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <button
            className="btn-secondary"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            id="team-contact-cta"
          >
            {t('team.cta')}
          </button>
        </div>
      </div>
    </section>
  );
}
