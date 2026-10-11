'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import type { PortfolioProject } from '@/data/portfolio';
import { useLang } from '@/lib/LanguageContext';

interface ProjectCardProps {
  project: PortfolioProject;
  index: number;
  onViewProject: (project: PortfolioProject) => void;
}

export default function ProjectCard({ project, index, onViewProject }: ProjectCardProps) {
  const { t } = useLang();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const displayTitle = t(`portfolio.p${project.id}.title`);
  const displayDesc = t(`portfolio.p${project.id}.desc`);

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

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      className="portfolio-card"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`,
      }}
      aria-label={displayTitle}
      id={`portfolio-card-${project.slug}`}
    >
      {/* Image Container */}
      <div
        className="portfolio-card-image-wrapper"
        onClick={() => onViewProject(project)}
        role="button"
        tabIndex={0}
        aria-label={`View full screenshot of ${project.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewProject(project);
          }
        }}
      >
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="portfolio-card-image"
          loading="lazy"
        />
        {/* Hover Overlay */}
        <div className="portfolio-card-overlay">
          <div className="portfolio-card-overlay-content">
            <span className="portfolio-card-zoom-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.5px' }}>View Screenshot</span>
          </div>
        </div>
        {/* Status Badge */}
        <span className="portfolio-card-status">
          <span className="portfolio-card-status-dot" />
          {t('portfolio.status.live')}
        </span>
        {/* Category Badge */}
        <span className="portfolio-card-category">{project.category}</span>
      </div>

      {/* Content */}
      <div className="portfolio-card-content">
        {/* Title */}
        <h3 className="portfolio-card-title">{displayTitle}</h3>

        {/* Tech Stack */}
        <div className="portfolio-card-tech-stack">
          {project.techStack.map((tech) => (
            <span key={tech} className="portfolio-card-tech-tag">
              {tech}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="portfolio-card-description">{displayDesc}</p>

        {/* Buttons */}
        <div className="portfolio-card-actions">
          <button
            className="portfolio-btn-view"
            onClick={() => onViewProject(project)}
            aria-label={`View full screenshot of ${project.title}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {t('portfolio.viewproject')}
          </button>
          <a
            href={project.liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-btn-live"
            aria-label={`Visit live site for ${displayTitle}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {t('portfolio.livelink')}
          </a>
        </div>
      </div>
    </article>
  );
}
