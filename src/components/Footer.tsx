import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { Logo } from './SiteNav';
import { useCopy } from '../context/SiteContext';

const NAV = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Booking', href: '#booking' },
];

export default function Footer() {
  const copy = useCopy();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink px-5 pb-8 pt-16 text-ivory sm:px-8 md:pt-24 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 border-b border-ivory/10 pb-12 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-14">
          <div>
            <a href="#home" aria-label="KAVÉ home" className="inline-block rounded-2xl bg-ivory/95 px-4 py-3">
              <Logo className="h-12 w-auto sm:h-14" />
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/55">
              {copy('footer_blurb', 'A studio for calm, considered interiors — residential, luxury and workplace projects delivered end to end.')}
            </p>
            <p className="mt-5 font-display text-lg text-gold">{copy('tagline', 'Spaces that feel like you.')}</p>
          </div>

          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.22em] text-ivory/35">Navigate</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-ivory/60 transition-colors hover:text-gold">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.22em] text-ivory/35">Studio</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${copy('contact_email', 'hello@placeholder.studio')}`} className="text-ivory/60 transition-colors hover:text-gold">
                  {copy('contact_email', 'hello@placeholder.studio')}
                </a>
              </li>
              <li className="text-ivory/60">{copy('contact_phone', '+00 00000 00000')}</li>
              <li className="max-w-[16rem] text-ivory/45">{copy('contact_address', 'Studio address — placeholder')}</li>
              <li className="pt-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.16em] text-ivory/40 transition-colors hover:text-gold"
                >
                  Studio admin <ArrowUpRight size={12} aria-hidden />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-6 text-[0.62rem] uppercase tracking-[0.16em] text-ivory/30 sm:flex-row sm:items-center">
          <p>© {year} KAVÉ Interior Design Studio. All rights reserved.</p>
          <a href="#home" className="inline-flex items-center gap-2 transition-colors hover:text-gold">
            Back to top <ArrowUp size={13} aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
