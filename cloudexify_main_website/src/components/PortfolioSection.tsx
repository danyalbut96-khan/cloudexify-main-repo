'use client';

import { useState, useMemo, useCallback } from 'react';
import { portfolioProjects, categoryFilters } from '@/data/portfolio';
import type { PortfolioProject } from '@/data/portfolio';
import ProjectCard from '@/components/portfolio/ProjectCard';
import ProjectLightbox from '@/components/portfolio/ProjectLightbox';
import { useLang } from '@/lib/LanguageContext';

const filterTranslationKeys: Record<string, string> = {
  'All Projects': 'portfolio.filter.all',
  'SaaS / Web Apps': 'portfolio.filter.saas',
  'Business Websites': 'portfolio.filter.business',
  'Healthcare': 'portfolio.filter.healthcare',
  'Management Systems': 'portfolio.filter.management',
};

export default function PortfolioSection() {
  const { t } = useLang();
  const [activeFilter, setActiveFilter] = useState('All Projects');
  const [lightboxProject, setLightboxProject] = useState<PortfolioProject | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All Projects') return portfolioProjects;
    return portfolioProjects.filter((p) => p.categoryGroup === activeFilter);
  }, [activeFilter]);

  const currentLightboxIndex = useMemo(() => {
    if (!lightboxProject) return 0;
    return filteredProjects.findIndex((p) => p.id === lightboxProject.id);
  }, [lightboxProject, filteredProjects]);

  const openLightbox = useCallback((project: PortfolioProject) => {
    setLightboxProject(project);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setTimeout(() => setLightboxProject(null), 300);
  }, []);

  const nextProject = useCallback(() => {
    const nextIdx = (currentLightboxIndex + 1) % filteredProjects.length;
    setLightboxProject(filteredProjects[nextIdx]);
  }, [currentLightboxIndex, filteredProjects]);

  const prevProject = useCallback(() => {
    const prevIdx = (currentLightboxIndex - 1 + filteredProjects.length) % filteredProjects.length;
    setLightboxProject(filteredProjects[prevIdx]);
  }, [currentLightboxIndex, filteredProjects]);

  return (
    <>
      <section id="portfolio" className="portfolio-section">
        <div className="container-section">
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-tag">{t('portfolio.label')}</div>
            <h2 className="section-title">
              {t('portfolio.title')}
            </h2>
            <p
              className="section-subtitle"
              style={{ margin: '0 auto', textAlign: 'center' }}
            >
              {t('portfolio.subtitle.alt')}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="portfolio-filter-bar" role="tablist" aria-label="Filter projects by category">
            {categoryFilters.map((filter) => (
              <button
                key={filter}
                className={`portfolio-filter-tab ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
                role="tab"
                aria-selected={activeFilter === filter}
                aria-controls="portfolio-grid"
                id={`portfolio-filter-${filter.toLowerCase().replace(/[\s\/]+/g, '-')}`}
              >
                {t(filterTranslationKeys[filter] || filter)}
              </button>
            ))}
          </div>

          {/* Project Grid */}
          <div
            className="portfolio-grid"
            id="portfolio-grid"
            role="tabpanel"
            aria-labelledby={`portfolio-filter-${activeFilter.toLowerCase().replace(/[\s\/]+/g, '-')}`}
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onViewProject={openLightbox}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <button
              className="btn-secondary"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              id="portfolio-contact-cta"
            >
              {t('portfolio.cta')}
            </button>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <ProjectLightbox
        project={lightboxProject}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
        onNext={nextProject}
        onPrev={prevProject}
        currentIndex={currentLightboxIndex}
        totalCount={filteredProjects.length}
      />
    </>
  );
}
