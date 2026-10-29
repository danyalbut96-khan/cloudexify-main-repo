'use client';

import { useEffect, useRef } from 'react';
import { useLang, isRtlLanguage } from '@/lib/LanguageContext';

export default function HeroSection() {
  const { t, lang } = useLang();
  const isRtl = isRtlLanguage(lang);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const text = t('hero.typewriter');
    const el = titleRef.current;
    if (!el) return;
    el.textContent = '';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        el.textContent = text.slice(0, i + 1);
        i++;
        setTimeout(type, 40);
      }
    };
    const timer = setTimeout(type, 800);
    return () => clearTimeout(timer);
  }, [lang, t]);

  const handleScrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="home"
      className="hero-gradient grid-pattern"
      style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 100 }}
      aria-label="Hero section"
    >
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: isRtl ? 'auto' : '5%',
          left: isRtl ? '5%' : 'auto',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 420,
          height: 420,
          pointerEvents: 'none',
        }}
        className="hidden-on-mobile"
      >
        <div
          className="animate-spin-slow"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px dashed rgba(0, 212, 255, 0.2)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 60,
            borderRadius: '50%',
            border: '1px solid rgba(0, 255, 136, 0.15)',
            animation: 'spin-slow 14s linear infinite reverse',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 92,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, rgba(0, 255, 136, 0.1) 50%, transparent 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '2px solid rgba(0, 212, 255, 0.25)',
            boxShadow: '0 0 35px rgba(0, 212, 255, 0.3)',
          }}
        >
          <img
            src="/logo.jpg"
            alt="Cloudexify Center Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'none',
            }}
          />
        </div>
        {[
          { name: 'React', emoji: '⚛️', color: '#61dafb' },
          { name: 'Next.js', emoji: '▲', color: '#ffffff' },
          { name: 'TypeScript', emoji: 'TS', color: '#3178c6' },
          { name: 'Python', emoji: '🐍', color: '#3776ab' },
          { name: 'AWS', emoji: '☁️', color: '#ff9900' },
          { name: 'Node.js', emoji: '🟢', color: '#339933' },
        ].map((tech, i) => {
          const angle = i * 60;
          const rad = (angle * Math.PI) / 180;
          const r = 180;
          const x = 210 + r * Math.cos(rad);
          const y = 210 + r * Math.sin(rad);
          return (
            <div
              key={tech.name}
              title={tech.name}
              style={{
                position: 'absolute',
                left: x - 18,
                top: y - 18,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(10, 20, 40, 0.95)',
                border: `1.5px solid ${tech.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                boxShadow: `0 0 10px ${tech.color}40`,
                fontWeight: 'bold',
                color: tech.color,
              }}
            >
              {tech.emoji}
            </div>
          );
        })}
      </div>

      <div className="container-section" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
        <div style={{ maxWidth: 680, textAlign: isRtl ? 'right' : 'left' }}>
          <div className="animate-fade-up" style={{ marginBottom: 24 }}>
            <span className="section-tag">{t('hero.badge')}</span>
          </div>

          <h1
            className="animate-fade-up delay-100"
            style={{
              fontSize: 'clamp(38px, 6vw, 72px)',
              fontWeight: 900,
              lineHeight: 1.08,
              marginBottom: 20,
              letterSpacing: '-1.5px',
            }}
          >
            {t('hero.welcome')}{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Cloudexify
            </span>
          </h1>

          <h2
            ref={titleRef}
            className="animate-fade-up delay-200"
            style={{
              fontSize: 'clamp(20px, 3vw, 32px)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 24,
              minHeight: '1.3em',
              letterSpacing: '-0.3px',
            }}
            aria-label={t('hero.typewriter')}
          />

          <p
            className="animate-fade-up delay-300"
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              marginBottom: 40,
              maxWidth: 540,
            }}
          >
            {t('hero.subtitle')}
          </p>

          <div
            className="animate-fade-up delay-400"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 56,
              flexDirection: isRtl ? 'row-reverse' : 'row',
            }}
          >
            <button className="btn-primary" onClick={() => handleScrollTo('contact')} id="hero-cta-primary">
              {t('hero.cta.primary')}
            </button>
            <button className="btn-secondary" onClick={() => handleScrollTo('portfolio')} id="hero-cta-secondary">
              {t('hero.cta.secondary')}
            </button>
          </div>

          <div
            className="animate-fade-up delay-500"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 28,
              flexDirection: isRtl ? 'row-reverse' : 'row',
            }}
          >
            {[
              { icon: '✅', label: t('hero.stat1') },
              { icon: '🌍', label: t('hero.stat2') },
              { icon: '⚡', label: t('hero.stat3') },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                  flexDirection: isRtl ? 'row-reverse' : 'row',
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          opacity: 0.5,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
          {t('hero.scroll')}
        </span>
        <div
          style={{
            width: 22,
            height: 36,
            border: '1.5px solid rgba(0, 212, 255, 0.4)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: 4,
          }}
        >
          <div
            style={{
              width: 4,
              height: 8,
              borderRadius: 2,
              background: '#00d4ff',
              animation: 'float-orb 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .hidden-on-mobile { display: none !important; } }
      `}</style>
    </section>
  );
}
