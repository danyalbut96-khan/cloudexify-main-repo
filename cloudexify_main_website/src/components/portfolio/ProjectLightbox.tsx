'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { PortfolioProject } from '@/data/portfolio';

interface ProjectLightboxProps {
  project: PortfolioProject | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalCount: number;
}

export default function ProjectLightbox({
  project,
  isOpen,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalCount,
}: ProjectLightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    },
    [isOpen, onClose, onNext, onPrev]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !project) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Image lightbox for ${project.title}`}
      id="portfolio-lightbox"
    >
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Navigation Arrows */}
        <button
          className="lightbox-nav lightbox-nav-prev"
          onClick={onPrev}
          aria-label="Previous project"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          className="lightbox-nav lightbox-nav-next"
          onClick={onNext}
          aria-label="Next project"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Image */}
        <div className="lightbox-image-wrapper">
          <Image
            src={project.image}
            alt={project.imageAlt}
            fill
            sizes="(max-width: 768px) 95vw, 80vw"
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        {/* Info Bar */}
        <div className="lightbox-info">
          <div className="lightbox-info-left">
            <h3 className="lightbox-title">{project.title}</h3>
            <span className="lightbox-counter">
              {currentIndex + 1} / {totalCount}
            </span>
          </div>
          <a
            href={project.liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="lightbox-live-link"
            aria-label={`Visit live site for ${project.title}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Visit Live Site
          </a>
        </div>
      </div>
    </div>
  );
}
