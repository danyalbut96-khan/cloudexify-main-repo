"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { APPLY_FORM_URL } from "@/lib/constants";

import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      setIsLoggedIn(false);
      router.push('/');
    } catch (err) {
      toast.error('Failed to log out');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check session on mount and when pathname changes
    fetch('/api/session')
      .then(r => r.json())
      .then(d => setIsLoggedIn(d.isLoggedIn))
      .catch(() => setIsLoggedIn(false));
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-brandDark/85 backdrop-blur-md border-b border-white/10 shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Back link + Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <a
              href="https://cloudexify.site"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline text-slate-400 hover:text-slate-300 transition-colors font-medium whitespace-nowrap"
              style={{ fontSize: "12px" }}
            >
              ← cloudexify.site
            </a>
            <a href="/#home" className="flex items-center">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-white">Cloud</span>
                <span className="text-[#1A73E8]">Exify</span>
              </span>
            </a>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="/#home"
              className="text-slate-300 hover:text-brandBlue transition-colors font-medium text-sm"
            >
              Home
            </a>
            <a
              href="/#why-us"
              className="text-slate-300 hover:text-brandBlue transition-colors font-medium text-sm"
            >
              About
            </a>
            <a
              href="/#details"
              className="text-slate-300 hover:text-brandBlue transition-colors font-medium text-sm"
            >
              Internship
            </a>
            <a
              href="/support"
              className="text-slate-300 hover:text-brandBlue transition-colors font-medium text-sm"
            >
              Support
            </a>
            <a
              href="/#footer"
              className="text-slate-300 hover:text-brandBlue transition-colors font-medium text-sm"
            >
              Contact
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all duration-200 shadow-lg shadow-green-600/20 hover:scale-105"
                >
                  Dashboard
                </a>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-semibold text-red-500 bg-red-500/10 hover:bg-red-600 hover:text-white border border-red-500/20 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all duration-200"
                >
                  Login
                </a>
                <a
                  href={APPLY_FORM_URL}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-brandBlue hover:bg-brandBlue-dark transition-all duration-200 shadow-lg shadow-brandBlue/20 hover:scale-105"
                >
                  Apply Now
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-brandDark border-b border-white/10 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-80 opacity-100 py-4" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 space-y-3">
          <a
            href="/#home"
            onClick={() => setIsOpen(false)}
            className="block text-slate-300 hover:text-brandBlue font-medium py-2 border-b border-white/5"
          >
            Home
          </a>
          <a
            href="/#why-us"
            onClick={() => setIsOpen(false)}
            className="block text-slate-300 hover:text-brandBlue font-medium py-2 border-b border-white/5"
          >
            About
          </a>
          <a
            href="/#details"
            onClick={() => setIsOpen(false)}
            className="block text-slate-300 hover:text-brandBlue font-medium py-2 border-b border-white/5"
          >
            Internship
          </a>
          <a
            href="/support"
            onClick={() => setIsOpen(false)}
            className="block text-slate-300 hover:text-brandBlue font-medium py-2 border-b border-white/5"
          >
            Support
          </a>
          <a
            href="/#footer"
            onClick={() => setIsOpen(false)}
            className="block text-slate-300 hover:text-brandBlue font-medium py-2 border-b border-white/5"
          >
            Contact
          </a>
          <div className="pt-2 space-y-3">
            {isLoggedIn ? (
              <>
                <a
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block text-center w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all shadow-md"
                >
                  Dashboard
                </a>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="block text-center w-full px-5 py-3 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 mt-3"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="block text-center w-full px-5 py-3 rounded-xl text-sm font-semibold text-white border border-slate-700 hover:bg-slate-800 transition-all"
                >
                  Login
                </a>
                <a
                  href={APPLY_FORM_URL}
                  className="block text-center w-full px-5 py-3 rounded-xl text-sm font-semibold text-white bg-brandBlue hover:bg-brandBlue-dark transition-all shadow-md"
                >
                  Apply Now
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
