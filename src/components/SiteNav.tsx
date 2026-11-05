import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

export function Logo({ className = 'h-11 w-auto' }: { className?: string }) {
  return (
    <img
      src="/brand/kave-logo.png"
      alt="KAVÉ — Interior Design Studio"
      width={315}
      height={242}
      className={`${className} object-contain`}
      decoding="async"
    />
  );
}

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-soft ${
        scrolled || open
          ? 'border-b border-espresso/10 bg-ivory/92 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-5 py-3 sm:px-8 md:py-4 lg:px-12">
        <a href="#home" className="flex shrink-0 items-center gap-3" aria-label="KAVÉ home">
          <Logo className="h-10 w-auto sm:h-11 md:h-12" />
          <span className="hidden border-l border-espresso/15 pl-3 text-[0.6rem] font-medium uppercase leading-[1.5] tracking-[0.2em] text-espresso/55 lg:block">
            Interior
            <br />
            Design Studio
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-espresso/70 transition-colors duration-300 hover:bg-espresso/[0.05] hover:text-espresso"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href="#booking" className="btn-primary hidden !px-6 !py-3 sm:inline-flex">
            Book Consultation
            <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-espresso/15 text-espresso transition-colors hover:bg-espresso/[0.05] lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          id="mobile-nav"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-espresso/10 bg-ivory px-5 pb-8 pt-4 sm:px-8 lg:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-espresso/10 py-4 font-display text-2xl text-espresso"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {link.label}
                <ArrowUpRight size={16} className="text-gold" aria-hidden />
              </a>
            ))}
          </nav>
          <a
            href="#booking"
            onClick={() => setOpen(false)}
            className="btn-primary mt-6 w-full"
          >
            Book a Consultation
          </a>
          <Link
            to="/admin"
            className="mt-3 block text-center text-[0.66rem] uppercase tracking-[0.2em] text-espresso/40 hover:text-espresso"
          >
            Studio Admin
          </Link>
        </motion.div>
      )}
    </header>
  );
}
