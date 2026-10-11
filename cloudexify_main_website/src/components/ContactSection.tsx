'use client';

import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { useLang } from '@/lib/LanguageContext';

// Initialize EmailJS once at module level
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!);

// ─── Form shape (keys = React state names) ──────────────────────────────
interface FormData {
  from_name: string;
  from_email: string;
  phone_number: string;
  project_type: string;
  project_description: string;
  budget_range: string;
  timeline: string;
}

interface FormErrors {
  from_name?: string;
  from_email?: string;
  project_type?: string;
  project_description?: string;
}

const INITIAL_FORM: FormData = {
  from_name: '',
  from_email: '',
  phone_number: '',
  project_type: '',
  project_description: '',
  budget_range: '',
  timeline: '',
};

// ─── Contact sidebar data ────────────────────────────────────────────────
const contactInfoKeys = [
  { icon: '📧', labelKey: 'contact.info.email', value: 'hello@cloudexify.site', href: 'mailto:hello@cloudexify.site' },
  { icon: '📞', labelKey: 'contact.info.phone', value: '+92 341 1949277', href: 'tel:+923411949277' },
  { icon: '📍', labelKey: 'contact.info.location', value: 'Islamabad, Pakistan', href: 'https://maps.google.com/?q=Islamabad,Pakistan' },
  { icon: '🕐', labelKey: 'contact.info.hours', valueKey: 'contact.info.hours.value', href: null },
];

// ─── Component ───────────────────────────────────────────────────────────
export default function ContactSection() {
  const { t } = useLang();
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  // ── Validation ──────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.from_name.trim()) errs.from_name = 'Full name is required.';

    if (!form.from_email.trim()) {
      errs.from_email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.from_email)) {
      errs.from_email = 'Please enter a valid email address.';
    }

    if (!form.project_type) errs.project_type = 'Please select a project type.';

    if (!form.project_description.trim() || form.project_description.length < 20) {
      errs.project_description =
        'Please provide at least 20 characters about your project.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit handler (sends admin + auto-reply emails) ────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    // Rate-limit: 3 second cooldown
    const now = Date.now();
    if (now - lastSubmitTime < 3000) {
      setMessage('❌ Please wait a moment before submitting again.');
      return;
    }

    if (!validate()) return;

    setLastSubmitTime(now);
    setLoading(true);

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
      const adminTemplateId = process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID!;
      const userTemplateId = process.env.NEXT_PUBLIC_EMAILJS_USER_TEMPLATE_ID!;

      // 1) Send admin notification email
      await emailjs.sendForm(serviceId, adminTemplateId, formRef.current!);

      // 2) Send auto-reply to the user
      await emailjs.sendForm(serviceId, userTemplateId, formRef.current!);

      // Success
      setMessage('✅ Inquiry sent successfully! Check your email for confirmation.');
      setForm(INITIAL_FORM);
      setSubmitted(true);
    } catch (error: unknown) {
      console.error('EmailJS Error:', error);
      // Extract the most useful message from the EmailJS error
      let detail = '';
      if (error && typeof error === 'object' && 'text' in error) {
        detail = (error as { text: string }).text;
      } else if (error instanceof Error) {
        detail = error.message;
      }
      setMessage(
        `❌ Failed to send inquiry. ${detail ? `(${detail})` : 'Please try again or contact us directly.'}`
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Field change handler ────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    // Clear top-level message when the user starts typing again
    if (message) setMessage('');
  };

  // ── Success state ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <section id="contact" style={{ padding: '100px 0' }}>
        <div className="container-section">
          <div
            style={{
              maxWidth: 520,
              margin: '0 auto',
              textAlign: 'center',
              background: 'rgba(0, 255, 136, 0.06)',
              border: '1px solid rgba(0, 255, 136, 0.25)',
              borderRadius: 24,
              padding: '60px 40px',
            }}
          >
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
              {t('contact.success.title')}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.75 }}>{t('contact.success.body')}</p>
            <button
              className="btn-primary"
              style={{ marginTop: 28 }}
              onClick={() => {
                setSubmitted(false);
                setForm(INITIAL_FORM);
                setMessage('');
              }}
            >
              {t('contact.success.another')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────
  return (
    <section id="contact" style={{ padding: '100px 0' }}>
      <div className="container-section">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-tag">{t('contact.label')}</div>
          <h2 className="section-title">{t('contact.title')}</h2>
          <p className="section-subtitle" style={{ margin: '0 auto', textAlign: 'center' }}>
            {t('contact.subtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 48,
            alignItems: 'start',
          }}
        >
          {/* ─── Contact Form ─────────────────────────────────────────── */}
          <div className="glass-card" style={{ padding: '40px 36px' }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 28 }}>
              {t('contact.form.title')}
            </h3>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              aria-label="Contact form"
            >
              {/* Full Name */}
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="from_name" className="form-label">
                  {t('contact.form.name')} <span style={{ color: '#00ff88' }}>*</span>
                </label>
                <input
                  id="from_name"
                  name="from_name"
                  type="text"
                  className="form-input"
                  placeholder={t('contact.placeholder.name')}
                  value={form.from_name}
                  onChange={handleChange}
                  aria-required="true"
                  aria-describedby={errors.from_name ? 'name-error' : undefined}
                />
                {errors.from_name && (
                  <p id="name-error" style={{ color: '#ff6b6b', fontSize: 12, marginTop: 6 }} role="alert">
                    {errors.from_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="from_email" className="form-label">
                  {t('contact.form.email')} <span style={{ color: '#00ff88' }}>*</span>
                </label>
                <input
                  id="from_email"
                  name="from_email"
                  type="email"
                  className="form-input"
                  placeholder={t('contact.placeholder.email')}
                  value={form.from_email}
                  onChange={handleChange}
                  aria-required="true"
                  aria-describedby={errors.from_email ? 'email-error' : undefined}
                />
                {errors.from_email && (
                  <p id="email-error" style={{ color: '#ff6b6b', fontSize: 12, marginTop: 6 }} role="alert">
                    {errors.from_email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="phone_number" className="form-label">
                  {t('contact.form.phone')}
                </label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  className="form-input"
                  placeholder={t('contact.placeholder.phone')}
                  value={form.phone_number}
                  onChange={handleChange}
                />
              </div>

              {/* Project Type */}
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="project_type" className="form-label">
                  {t('contact.form.projecttype')} <span style={{ color: '#00ff88' }}>*</span>
                </label>
                <select
                  id="project_type"
                  name="project_type"
                  className="form-input"
                  value={form.project_type}
                  onChange={handleChange}
                  aria-required="true"
                  aria-describedby={errors.project_type ? 'type-error' : undefined}
                >
                  <option value="">Select project type…</option>
                  <option value="Web Application">Web Application</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="SaaS Platform">SaaS Platform</option>
                  <option value="AI Solution">AI Solution</option>
                  <option value="Custom Software">Custom Software</option>
                  <option value="API Development">API Development</option>
                  <option value="Cloud & DevOps">Cloud &amp; DevOps</option>
                  <option value="Technical Consultation">Technical Consultation</option>
                  <option value="Other">Other</option>
                </select>
                {errors.project_type && (
                  <p id="type-error" style={{ color: '#ff6b6b', fontSize: 12, marginTop: 6 }} role="alert">
                    {errors.project_type}
                  </p>
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="project_description" className="form-label">
                  {t('contact.form.description')} <span style={{ color: '#00ff88' }}>*</span>
                </label>
                <textarea
                  id="project_description"
                  name="project_description"
                  className="form-input"
                  placeholder="Tell us about your project, goals, and requirements…"
                  rows={4}
                  value={form.project_description}
                  onChange={handleChange}
                  aria-required="true"
                  aria-describedby={errors.project_description ? 'desc-error' : undefined}
                  style={{ resize: 'vertical', minHeight: 100 }}
                />
                {errors.project_description && (
                  <p id="desc-error" style={{ color: '#ff6b6b', fontSize: 12, marginTop: 6 }} role="alert">
                    {errors.project_description}
                  </p>
                )}
              </div>

              {/* Budget + Timeline row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  marginBottom: 28,
                }}
              >
                <div>
                  <label htmlFor="budget_range" className="form-label">
                    {t('contact.form.budget')}
                  </label>
                  <select
                    id="budget_range"
                    name="budget_range"
                    className="form-input"
                    value={form.budget_range}
                    onChange={handleChange}
                  >
                    <option value="">Select budget…</option>
                    <option value="PKR 50,000 - 100,000">PKR 50,000 – 100,000</option>
                    <option value="PKR 100,000 - 250,000">PKR 100,000 – 250,000</option>
                    <option value="PKR 250,000 - 500,000">PKR 250,000 – 500,000</option>
                    <option value="PKR 500,000+">PKR 500,000+</option>
                    <option value="Under $500">Under $500</option>
                    <option value="$500 - $2,000">$500 – $2,000</option>
                    <option value="$2,000 - $5,000">$2,000 – $5,000</option>
                    <option value="$5,000 - $15,000">$5,000 – $15,000</option>
                    <option value="$15,000+">$15,000+</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="timeline" className="form-label">
                    {t('contact.form.timeline')}
                  </label>
                  <select
                    id="timeline"
                    name="timeline"
                    className="form-input"
                    value={form.timeline}
                    onChange={handleChange}
                  >
                    <option value="">Select timeline…</option>
                    <option value="ASAP (1-2 weeks)">ASAP (1–2 weeks)</option>
                    <option value="1-2 months">1–2 months</option>
                    <option value="2-3 months">2–3 months</option>
                    <option value="3+ months">3+ months</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  display: 'flex',
                  opacity: loading ? 0.65 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                disabled={loading}
                id="contact-submit"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Sending…
                  </>
                ) : (
                  t('contact.form.submit')
                )}
              </button>

              {/* Success / Error message */}
              {message && (
                <div
                  role="alert"
                  style={{
                    marginTop: 16,
                    padding: '14px 18px',
                    borderRadius: 12,
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    background: message.includes('✅')
                      ? 'rgba(0, 255, 136, 0.1)'
                      : 'rgba(255, 107, 107, 0.1)',
                    color: message.includes('✅') ? '#00ff88' : '#ff6b6b',
                    border: `1px solid ${
                      message.includes('✅')
                        ? 'rgba(0, 255, 136, 0.3)'
                        : 'rgba(255, 107, 107, 0.3)'
                    }`,
                  }}
                >
                  {message}
                </div>
              )}
            </form>
          </div>

          {/* ─── Contact info sidebar ─────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                {t('contact.info.title')}
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 28,
                }}
              >
                {t('contact.info.subtitle')}
              </p>
            </div>

            {contactInfoKeys.map((item) => (
              <div
                key={item.labelKey}
                className="glass-card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      marginBottom: 4,
                      fontWeight: 500,
                    }}
                  >
                    {t(item.labelKey)}
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      style={{
                        color: '#00d4ff',
                        fontSize: 15,
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={
                        item.href.startsWith('http') ? 'noopener noreferrer' : undefined
                      }
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 600 }}>
                      {item.valueKey ? t(item.valueKey) : item.value}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(0, 255, 136, 0.08), rgba(0, 212, 255, 0.08))',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                borderRadius: 16,
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                  marginBottom: 14,
                  lineHeight: 1.6,
                }}
              >
                Prefer to chat? Reach us on WhatsApp for quick answers.
              </p>
              <a
                href="https://wa.me/923411949277"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ display: 'inline-flex', fontSize: 14, padding: '11px 24px' }}
                id="whatsapp-cta"
              >
                {t('contact.whatsapp')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
