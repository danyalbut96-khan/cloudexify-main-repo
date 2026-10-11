'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/lib/LanguageContext';

export default function TopBanner() {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const dismissed = localStorage.getItem('banner_dismissed');
    if (dismissed) {
      const age = Date.now() - parseInt(dismissed);
      if (age < 1800000) return;
    }
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg,#0D47A1,#1A73E8,#0D47A1)',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontSize: '12px',
        color: 'white',
        fontWeight: 500,
        overflow: 'hidden',
      }}
    >
      <div className="hidden md:block text-center px-8">
        🌐{' '}
        <a
          href="https://client.cloudexify.site"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline hover:text-blue-200"
        >
          {t('banner.freewebsite')}
        </a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        🎓{' '}
        <a
          href="https://internship.cloudexify.site"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline hover:text-yellow-200"
        >
          {t('banner.internship')}
        </a>
        &nbsp;— {t('banner.apply')}
      </div>

      <div className="md:hidden overflow-hidden whitespace-nowrap w-full pr-10">
        <div
          style={{
            display: 'inline-block',
            animation: 'topBannerMarquee 20s linear infinite',
            paddingLeft: '100%',
          }}
        >
          {t('banner.text')}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setShow(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('banner_dismissed', Date.now().toString());
          }
        }}
        style={{
          position: 'absolute',
          right: '12px',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '18px',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        ×
      </button>

      <style jsx>{`
        @keyframes topBannerMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
