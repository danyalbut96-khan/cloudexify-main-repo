'use client';

import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';

function IconGlobe({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconGraduationCap({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  );
}

function IconCheckCircle({ size = 18, color = '#34A853' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconStar({ size = 18, color = '#FBBC04' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1" aria-hidden style={{ flexShrink: 0 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconArrowRight({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconUsers({ size = 18, color = '#34A853' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconMapPin({ size = 18, color = '#1A73E8' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconZap({ size = 18, color = '#FBBC04' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function FeatureItem({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
      {icon}
      <div>
        <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 14 }}>{title}</div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function PulsingDot({ color }: { color: string }) {
  return <span className="campaigns-pulse-dot" style={{ background: color }} />;
}

export default function CampaignsSection() {
  const { t } = useLang();

  return (
    <section
      className="campaigns-section"
      style={{
        padding: '80px 0',
        background: 'linear-gradient(135deg, #060E18 0%, #0D1B2A 50%, #060E18 100%)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
      aria-labelledby="campaigns-heading"
    >
      <div className="campaigns-fade campaigns-fade--top" aria-hidden />
      <div className="campaigns-fade campaigns-fade--bottom" aria-hidden />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '10%',
          top: '30%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: '#1A73E8',
          filter: 'blur(80px)',
          opacity: 0.06,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: '10%',
          top: '40%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: '#FBBC04',
          filter: 'blur(80px)',
          opacity: 0.06,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <header style={{ textAlign: 'center', marginBottom: 56, padding: '0 24px' }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 3,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            {t('campaigns.label')}
          </div>
          <h2
            id="campaigns-heading"
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 900,
              margin: 0,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #90CAF9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('campaigns.title')}
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: 500,
              margin: '12px auto 0',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            {t('campaigns.subtitle')}
          </p>
        </header>

        <div
          className="campaigns-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 24,
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          <motion.article
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="campaign-card campaign-card--website"
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(26,115,232,0.3)',
              borderRadius: 24,
              padding: 40,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                pointerEvents: 'none',
                color: 'rgba(26,115,232,0.06)',
              }}
            >
              <IconGlobe size={160} color="rgba(26,115,232,0.06)" />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: 'rgba(26,115,232,0.15)',
                  border: '1px solid rgba(26,115,232,0.4)',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconGlobe size={26} color="#1A73E8" />
              </div>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(52,168,83,0.15)',
                  border: '1px solid #34A853',
                  color: '#34A853',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 20,
                  letterSpacing: 1,
                }}
              >
                <PulsingDot color="#34A853" />
                {t('campaigns.website.badge')}
              </span>
            </div>

            <h3 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', marginBottom: 8, position: 'relative' }}>
              {t('campaigns.website.title')}
            </h3>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.6,
                marginBottom: 28,
                position: 'relative',
              }}
            >
              {t('campaigns.website.subtitle')}
            </p>

            <div style={{ marginBottom: 32, position: 'relative' }}>
              <FeatureItem icon={<IconCheckCircle />} title={t('campaigns.website.f1')} subtitle={t('campaigns.website.f1.sub')} />
              <FeatureItem icon={<IconCheckCircle />} title={t('campaigns.website.f2')} subtitle={t('campaigns.website.f2.sub')} />
              <FeatureItem icon={<IconCheckCircle />} title={t('campaigns.website.f3')} subtitle={t('campaigns.website.f3.sub')} />
              <FeatureItem icon={<IconCheckCircle />} title={t('campaigns.website.f4')} subtitle={t('campaigns.website.f4.sub')} />
            </div>

            <div
              style={{
                background: 'rgba(26,115,232,0.08)',
                border: '1px solid rgba(26,115,232,0.2)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 28,
                position: 'relative',
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t('campaigns.website.price.label')}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#1A73E8' }}>1,500 PKR / year</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t('campaigns.website.price.suffix')}</div>
            </div>

            <a
              href="https://client.cloudexify.site"
              target="_blank"
              rel="noopener noreferrer"
              className="campaign-cta campaign-cta--blue"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: 16,
                background: 'linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%)',
                borderRadius: 14,
                color: 'white',
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(26,115,232,0.35)',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              {t('campaigns.website.cta')}
              <IconArrowRight size={18} color="white" />
            </a>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="campaign-card campaign-card--intern"
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(251,188,4,0.3)',
              borderRadius: 24,
              padding: 40,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
            }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                pointerEvents: 'none',
              }}
            >
              <IconGraduationCap size={160} color="rgba(251,188,4,0.06)" />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: 'rgba(251,188,4,0.12)',
                  border: '1px solid rgba(251,188,4,0.4)',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconGraduationCap size={26} color="#FBBC04" />
              </div>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(251,188,4,0.12)',
                  border: '1px solid #FBBC04',
                  color: '#FBBC04',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 20,
                  letterSpacing: 1,
                }}
              >
                <PulsingDot color="#FBBC04" />
                {t('campaigns.intern.badge')}
              </span>
            </div>

            <h3 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', marginBottom: 8, position: 'relative' }}>
              {t('campaigns.intern.title')}
            </h3>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.6,
                marginBottom: 28,
                position: 'relative',
              }}
            >
              {t('campaigns.intern.subtitle')}
            </p>

            <div style={{ marginBottom: 32, position: 'relative' }}>
              <FeatureItem icon={<IconStar />} title={t('campaigns.intern.f1')} subtitle={t('campaigns.intern.f1.sub')} />
              <FeatureItem icon={<IconStar />} title={t('campaigns.intern.f2')} subtitle={t('campaigns.intern.f2.sub')} />
              <FeatureItem icon={<IconStar />} title={t('campaigns.intern.f3')} subtitle={t('campaigns.intern.f3.sub')} />
              <FeatureItem icon={<IconStar />} title={t('campaigns.intern.f4')} subtitle={t('campaigns.intern.f4.sub')} />
            </div>

            <div
              style={{
                background: 'rgba(251,188,4,0.06)',
                border: '1px solid rgba(251,188,4,0.2)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 28,
                position: 'relative',
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{t('campaigns.intern.reward.title')}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#FBBC04', marginBottom: 4 }}>{t('campaigns.intern.reward1')}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(251,188,4,0.7)' }}>{t('campaigns.intern.reward2')}</div>
            </div>

            <a
              href="https://internship.cloudexify.site"
              target="_blank"
              rel="noopener noreferrer"
              className="campaign-cta campaign-cta--gold"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: 16,
                background: 'linear-gradient(135deg, #FBBC04 0%, #F57C00 100%)',
                borderRadius: 14,
                color: '#0D1B2A',
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 8px 32px rgba(251,188,4,0.25)',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              {t('campaigns.intern.cta')}
              <IconArrowRight size={18} color="#0D1B2A" />
            </a>
          </motion.article>
        </div>

        <div
          style={{
            maxWidth: 1100,
            margin: '32px auto 0',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 40,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconUsers />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{t('campaigns.trust1')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconMapPin />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{t('campaigns.trust2')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconZap />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{t('campaigns.trust3')}</span>
          </div>
        </div>
      </div>

      <style>{`
        .campaigns-fade {
          position: absolute;
          left: 0;
          right: 0;
          height: 60px;
          pointer-events: none;
          z-index: 2;
        }
        .campaigns-fade--top {
          top: 0;
          background: linear-gradient(to bottom, var(--primary) 0%, transparent 100%);
        }
        .campaigns-fade--bottom {
          bottom: 0;
          background: linear-gradient(to top, var(--primary) 0%, transparent 100%);
        }
        .campaigns-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          animation: campaignsPulse 1.5s ease-in-out infinite;
        }
        @keyframes campaignsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        @media (min-width: 768px) {
          .campaigns-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        .campaign-card--website:hover {
          border-color: #1A73E8 !important;
          background: rgba(26,115,232,0.05) !important;
          transform: translateY(-4px);
          box-shadow: 0 0 60px rgba(26,115,232,0.15);
        }
        .campaign-card--intern:hover {
          border-color: #FBBC04 !important;
          background: rgba(251,188,4,0.04) !important;
          transform: translateY(-4px);
          box-shadow: 0 0 60px rgba(251,188,4,0.1);
        }
        .campaign-cta--blue:hover {
          box-shadow: 0 8px 48px rgba(26,115,232,0.6) !important;
          transform: translateY(-1px);
        }
        .campaign-cta--gold:hover {
          box-shadow: 0 8px 48px rgba(251,188,4,0.5) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </section>
  );
}
