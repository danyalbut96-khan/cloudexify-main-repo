"use client";

import { Mail, ArrowUp, Heart } from "lucide-react";

export default function Footer() {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="footer" className="bg-brandDark-darker border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center md:items-start text-center md:text-left">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start">
            <a
              href="https://cloudexify.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brandBlue to-[#34A853] bg-clip-text text-transparent mb-3 hover:opacity-80 transition-opacity"
            >
              Cloudexify
            </a>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              Building the future, remotely. Providing cutting-edge web development and AI solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <div className="flex flex-col space-y-2 text-sm text-slate-400">
              <a href="/" className="hover:text-brandBlue transition-colors font-medium">
                Home
              </a>
              <a href="/#why-us" className="hover:text-brandBlue transition-colors font-medium">
                About
              </a>
              <a href="/#details" className="hover:text-brandBlue transition-colors font-medium">
                Internship
              </a>
              <a href="/support" className="hover:text-brandBlue transition-colors font-medium">
                Support & Ticket System
              </a>
            </div>
          </div>

          {/* Contact & Socials */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Get in Touch
            </h4>
            <div className="space-y-3 flex flex-col items-center md:items-start">
              <a
                href="mailto:contact@cloudexify.site"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-brandBlue transition-colors font-medium"
              >
                <Mail className="w-4 h-4 text-brandBlue" />
                contact@cloudexify.site
              </a>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <a
                  href="https://www.linkedin.com/company/cloudexify/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-slate-400 hover:text-brandBlue transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@CloudExify"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-slate-400 hover:text-brandBlue transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/cloudexify_official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-slate-400 hover:text-brandBlue transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://web.facebook.com/cloudexifyofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-slate-400 hover:text-brandBlue transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/923411949277"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="text-slate-400 hover:text-brandBlue transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </a>
              </div>
              <a
                href="https://cloudexify.site"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-brandBlue transition-colors font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-brandBlue"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
                cloudexify.site
              </a>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
            <p className="text-slate-500 text-xs sm:text-sm">
              © 2026 Cloudexify. All rights reserved.
            </p>
            {/* Made with heart credit */}
            <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5">
              Made with{" "}
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />{" "}
              by{" "}
              <a
                href="https://cloudexify.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brandBlue hover:text-sky-400 font-semibold transition-colors"
              >
                Cloudexify
              </a>
            </p>
          </div>

          {/* Back to top button */}
          <button
            onClick={handleScrollTop}
            className="p-3 rounded-full bg-white/5 hover:bg-brandBlue border border-white/10 hover:border-brandBlue text-slate-400 hover:text-white transition-all duration-300 shadow-md group"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}
