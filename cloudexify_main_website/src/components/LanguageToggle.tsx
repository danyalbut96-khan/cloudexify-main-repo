'use client';

import { useEffect, useRef, useState } from 'react';
import { useLang, isRtlLanguage } from '@/lib/LanguageContext';
import type { Language } from '@/lib/LanguageContext';

const LANGUAGES: {
  code: Language;
  flag: string;
  label: string;
  labelColor?: string;
}[] = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ur', flag: '🇵🇰', label: 'اردو', labelColor: '#1A73E8' },
  { code: 'hi', flag: '🇮🇳', label: 'हिंदी' },
  { code: 'bn', flag: '🇧🇩', label: 'বাংলা' },
  { code: 'ps', flag: '🇦🇫', label: 'پښتو' },
  { code: 'pa', flag: '🇵🇰', label: 'پنجابی', labelColor: '#34A853' },
  { code: 'fa', flag: '🇮🇷', label: 'فارسی' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
];

function getLabelColor(option: (typeof LANGUAGES)[number], selected: boolean) {
  if (selected) return '#1A73E8';
  return option.labelColor ?? 'white';
}

interface LanguageToggleProps {
  inline?: boolean;
}

export default function LanguageToggle({ inline = false }: LanguageToggleProps) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const isRtl = isRtlLanguage(lang);

  useEffect(() => {
    if (inline || !open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, inline]);

  const selectLanguage = (code: Language) => {
    setLang(code);
    setOpen(false);
  };

  if (inline) {
    return (
      <div role="listbox" aria-label="Select language" style={{ width: '100%' }}>
        {LANGUAGES.map((option) => {
          const selected = lang === option.code;
          const labelColor = getLabelColor(option, selected);
          return (
            <button
              key={option.code}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => selectLanguage(option.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                width: '100%',
                padding: '10px 16px',
                marginBottom: 4,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                color: labelColor,
                background: selected ? 'rgba(26,115,232,0.2)' : 'transparent',
                transition: 'background 0.2s',
                textAlign: isRtl ? 'right' : 'left',
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.background = 'rgba(26,115,232,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = selected
                  ? 'rgba(26,115,232,0.2)'
                  : 'transparent';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{option.flag}</span>
                <span style={{ color: labelColor }}>{option.label}</span>
              </span>
              {selected && (
                <span style={{ color: '#1A73E8', fontWeight: 700 }} aria-hidden>
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Change language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: open ? 'rgba(26,115,232,0.15)' : 'rgba(255,255,255,0.05)',
          color: 'white',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          backdropFilter: 'blur(10px)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget;
          btn.style.background = 'rgba(26,115,232,0.2)';
          btn.style.borderColor = '#1A73E8';
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget;
          if (open) return;
          btn.style.background = 'rgba(255,255,255,0.05)';
          btn.style.borderColor = 'rgba(255,255,255,0.2)';
        }}
      >
        <span style={{ fontSize: '16px' }}>{current.flag}</span>
        <span style={{ color: current.labelColor ?? 'white' }}>{current.label}</span>
        <span
          style={{
            fontSize: '10px',
            opacity: 0.7,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            ...(isRtl ? { left: 0, right: 'auto' } : { right: 0, left: 'auto' }),
            zIndex: 9999,
            minWidth: 160,
            maxWidth: 'calc(100vw - 24px)',
            padding: 8,
            borderRadius: 12,
            background: 'rgba(10,22,40,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {LANGUAGES.map((option) => {
            const selected = lang === option.code;
            const labelColor = getLabelColor(option, selected);
            return (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => selectLanguage(option.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: labelColor,
                  background: selected ? 'rgba(26,115,232,0.2)' : 'transparent',
                  transition: 'background 0.2s',
                  textAlign: isRtl ? 'right' : 'left',
                }}
                onMouseEnter={(e) => {
                  if (!selected) {
                    e.currentTarget.style.background = 'rgba(26,115,232,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = selected
                    ? 'rgba(26,115,232,0.2)'
                    : 'transparent';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{option.flag}</span>
                  <span style={{ color: labelColor }}>{option.label}</span>
                </span>
                {selected && (
                  <span style={{ color: '#1A73E8', fontWeight: 700 }} aria-hidden>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
