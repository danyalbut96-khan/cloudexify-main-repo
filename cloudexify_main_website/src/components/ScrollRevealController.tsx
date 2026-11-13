'use client';

import { useEffect } from 'react';

const REVEAL_SELECTORS = [
  '.cx-home > section:not(.cx-hero)',
  '.inner-page > section',
  '.service-detail-page > section',
  '.cx-section-intro',
  '.service-card',
  '.service-directory-card',
  '.team-card',
  '.portfolio-card',
  '.campaign-card',
  '.tech-badge',
  '.faq-item',
  '.stat-card',
  '.principle-list article',
  '.blog-card',
  '.site-footer',
];

export default function ScrollRevealController() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    const observed = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(REVEAL_SELECTORS.join(',')).forEach((element, index) => {
        if (observed.has(element)) return;
        observed.add(element);
        element.classList.add('cx-reveal');
        element.setAttribute('data-reveal-direction', index % 2 === 0 ? 'left' : 'right');
        if (element.matches('.service-card,.service-directory-card,.team-card,.portfolio-card,.campaign-card,.tech-badge,.faq-item,.stat-card,.principle-list article,.blog-card')) {
          (element as HTMLElement).style.setProperty('--cx-reveal-delay', `${(index % 5) * 65}ms`);
        }
        observer.observe(element);
      });
    };

    scan();
    const mutationObserver = new MutationObserver(scan);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
}
