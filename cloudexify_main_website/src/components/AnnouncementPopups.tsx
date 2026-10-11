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
  const [showIntern, setShowIntern] = useState(false);
  const [websiteClosed, setWebsiteClosed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = window.innerWidth < 768;
    const websiteDelay = isMobile ? 4000 : 2000;

    const websiteTimer = setTimeout(() => {
      if (!isDismissed('popup_website_closed')) {
        setShowWebsite(true);
      }
    }, websiteDelay);

    let internTimer: ReturnType<typeof setTimeout> | undefined;
    if (!isMobile) {
      internTimer = setTimeout(() => {
        if (!isDismissed('popup_intern_closed')) {
          setShowIntern(true);
        }
      }, 4000);
    }

    return () => {
      clearTimeout(websiteTimer);
      if (internTimer) clearTimeout(internTimer);
    };
  }, []);

  useEffect(() => {
    if (!websiteClosed) return;
    if (typeof window === 'undefined' || window.innerWidth >= 768) return;
    if (isDismissed('popup_intern_closed')) return;

    const timer = setTimeout(() => {
      setShowIntern(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [websiteClosed]);

  const closeWebsite = () => {
    setShowWebsite(false);
    setWebsiteClosed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('popup_website_closed', Date.now().toString());
    }
  };

  const closeIntern = () => {
    setShowIntern(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('popup_intern_closed', Date.now().toString());
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
    background: 'rgba(10,22,40,0.97)',
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
                    color: 'rgba(255,255,255,0.4)',
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
                    color: 'white',
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
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {t(key)}
                  </span>
                ))}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.35)',
                  fontStyle: 'italic',
                  marginBottom: 14,
                }}
              >
                {t('popup.website.note')}
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
                  color: 'white',
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

      <AnimatePresence>
        {showIntern && (
          <motion.div
            className="announcement-popup announcement-popup--intern"
            variants={popupVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            style={{
              ...popupBaseStyle,
              right: 24,
              zIndex: 9998,
              border: '1px solid #FBBC04',
              boxShadow:
                '0 0 0 1px rgba(251,188,4,0.2),' +
                '0 20px 60px rgba(0,0,0,0.5),' +
                '0 0 40px rgba(251,188,4,0.1)',
            }}
          >
            <div
              style={{
                height: 3,
                background: 'linear-gradient(90deg,#FBBC04,#FF6B35)',
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
                    color: '#FBBC04',
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  {t('popup.intern.label')}
                </span>
                <button
                  type="button"
                  onClick={closeIntern}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
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
                    color: 'white',
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {t('popup.intern.title')}
                </div>
                <div
                  style={{
                    color: 'white',
                    fontSize: 17,
                    fontWeight: 800,
                  }}
                >
                  {t('popup.intern.subtitle')}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  marginBottom: 8,
                }}
              >
                {['popup.intern.f1', 'popup.intern.f2', 'popup.intern.f3'].map((key) => (
                  <span
                    key={key}
                    style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.65)',
                    }}
                  >
                    {t(key)}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#FF6B35',
                    display: 'inline-block',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: '#FBBC04',
                  }}
                >
                  {t('popup.intern.closing')}
                </span>
              </div>
              <a
                href="https://internship.cloudexify.site"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '11px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg,#FBBC04,#F57C00)',
                  borderRadius: 10,
                  color: '#0D1B2A',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(251,188,4,0.3)',
                }}
              >
                {t('popup.intern.cta')}
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
          .announcement-popup--intern {
            left: 12px !important;
          }
        }
      `}</style>
    </>
  );
}
