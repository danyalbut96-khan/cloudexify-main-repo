'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';

const DISMISS_MS = 1800000;

function isDismissed(key: string): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(key);
  if (!stored) return false;
  const ts = parseInt(stored, 10);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < DISMISS_MS;
}

export default function AnnouncementPopups() {
  const { t } = useLang();
  const [showWebsite, setShowWebsite] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth < 768;
    const websiteDelay = isMobile ? 4000 : 2000;

    const websiteTimer = setTimeout(() => {
      if (!isDismissed('popup_website_closed')) {
        setShowWebsite(true);
      }
    }, websiteDelay);

    return () => {
      clearTimeout(websiteTimer);
    };
  }, []);

  const closeWebsite = () => {
    setShowWebsite(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('popup_website_closed', Date.now().toString());
    }
  };

  const popupVariants = {
    initial: { opacity: 0, y: 80, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 80, scale: 0.95 },
  };

  const transition = {
    duration: 0.4,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  const popupBaseStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 24,
    width: 300,
    background: '#FFFFFF',
    borderRadius: 16,
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
  };

  return (
    <>
      <AnimatePresence>
        {showWebsite && (
          <motion.div
            className="announcement-popup announcement-popup--website"
            variants={popupVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            style={{
              ...popupBaseStyle,
              left: 24,
              zIndex: 9999,
              border: '1px solid #1A73E8',
              boxShadow:
                '0 0 0 1px rgba(26,115,232,0.2),' +
                '0 20px 60px rgba(0,0,0,0.5),' +
                '0 0 40px rgba(26,115,232,0.15)',
            }}
          >
            <div
              style={{
                height: 3,
                background: 'linear-gradient(90deg,#1A73E8,#34A853)',
              }}
            />
            <div style={{ padding: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: '#1A73E8',
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  {t('popup.website.label')}
                </span>
                <button
                  type="button"
                  onClick={closeWebsite}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#66758A',
                    fontSize: 18,
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    color: 'var(--cx-ink)',
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {t('popup.website.title')}
                </div>
                <div
                  style={{
                    color: '#1A73E8',
                    fontSize: 20,
                    fontWeight: 900,
                    textShadow: '0 0 20px rgba(26,115,232,0.5)',
                  }}
                >
                  {t('popup.website.subtitle')}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                {['popup.website.f1', 'popup.website.f2', 'popup.website.f3'].map((key) => (
                  <span
                    key={key}
                    style={{
                      fontSize: 11,
                      color: '#53647B',
                    }}
                  >
                    {t(key)}
                  </span>
                ))}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#66758A',
                  fontStyle: 'italic',
                  marginBottom: 14,
                }}
              >
                {t('popup.website.note')}
              </div>
              <div className="popup-hosting-price" aria-label={t('popup.website.price') + ' — ' + t('popup.website.term')}>
                <strong>PKR 349</strong><span>/ month</span>
                <small>{t('popup.website.price')}</small>
                <small>{t('popup.website.term')}</small>
              </div>
              <a
                href="https://client.cloudexify.site"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '11px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg,#1A73E8,#0D47A1)',
                  borderRadius: 10,
                  color: 'var(--cx-ink)',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(26,115,232,0.4)',
                }}
              >
                {t('popup.website.cta')}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <style>{`
        @media (max-width: 639px) {
          .announcement-popup {
            left: 12px !important;
            right: 12px !important;
            bottom: 16px !important;
            width: auto !important;
            max-width: 100% !important;
          }
          .announcement-popup--website {
            right: 12px !important;
          }
        }
      `}</style>
    </>
  );
}
