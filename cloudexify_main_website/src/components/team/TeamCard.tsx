'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import type { TeamMember } from '@/data/team';
import { useLang } from '@/lib/LanguageContext';

const roleKeys: Record<number, string> = {
  1: 'team.role.ceo',
  2: 'team.role.chairman',
  3: 'team.role.coo',
};

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

export default function TeamCard({ member, index }: TeamCardProps) {
  const { t } = useLang();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      className="team-card"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.12}s`,
      }}
      aria-label={`${member.name} — ${member.role}`}
      id={`team-card-${member.id}`}
    >
      {/* Avatar */}
      <div className="team-card-avatar-wrapper">
        <div
          className="team-card-avatar"
          style={{ borderColor: member.roleBadgeColor }}
        >
          {imgError ? (
            <div
              className="team-card-avatar-fallback"
              style={{ background: `${member.roleBadgeColor}25` }}
            >
              <span style={{ color: member.roleBadgeColor }}>{member.initials}</span>
            </div>
          ) : (
            <Image
              src={member.image}
              alt={member.imageAlt}
              fill
              sizes="200px"
              className="team-card-avatar-img"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        {/* Glow ring */}
        <div
          className="team-card-glow"
          style={{
            background: `radial-gradient(circle, ${member.roleBadgeColor}20 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Name */}
      <h3 className="team-card-name">{member.name}</h3>

      {/* Role Badge */}
      <div
        className="team-card-badge"
        style={{
          background: member.roleBadgeColor,
          color: '#0a0e1a',
        }}
      >
        {t(roleKeys[member.id] || 'team.role.ceo')}
      </div>

      {/* Contact Info */}
      <div className="team-card-contact">
        <a href={`mailto:${member.email}`} className="team-card-contact-item" aria-label={`Email ${member.name}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span>{member.email}</span>
        </a>
        <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="team-card-contact-item" aria-label={`Call ${member.name}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>{member.phone}</span>
        </a>
        <div className="team-card-contact-item" style={{ cursor: 'default' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>{t('team.location')}</span>
        </div>
      </div>

      {/* Bio */}
      <p className="team-card-bio">{member.bio}</p>

      {/* Skills */}
      <div className="team-card-skills">
        <span className="team-card-skills-label">{t('team.skills')}</span>
        <div className="team-card-skills-list">
          {member.skills.map((skill) => (
            <span
              key={skill}
              className="team-card-skill-tag"
              style={{
                borderColor: `${member.roleBadgeColor}40`,
                background: `${member.roleBadgeColor}10`,
                color: member.roleBadgeColor,
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Contact Buttons */}
      <div className="team-card-buttons">
        <a
          href={`mailto:${member.email}`}
          className="team-card-btn team-card-btn-email"
          aria-label={`Email ${member.name}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          {t('team.email')}
        </a>
        <a
          href={`tel:${member.phone.replace(/\s/g, '')}`}
          className="team-card-btn team-card-btn-call"
          aria-label={`Call ${member.name}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          {t('team.call')}
        </a>
        <a
          href={`https://wa.me/${member.phone.replace(/[\s+]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="team-card-btn team-card-btn-connect"
          aria-label={`WhatsApp ${member.name}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          {t('team.connect')}
        </a>
      </div>
    </article>
  );
}
