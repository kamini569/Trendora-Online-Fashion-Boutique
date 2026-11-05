import { useState } from 'react';
import { Check, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Send, Loader2, Facebook } from 'lucide-react';
import { ApiError, api } from '../lib/api';
import { useCopy, useSite } from '../context/SiteContext';
import Reveal from './ui/Reveal';

type Form = { name: string; email: string; mobile: string; message: string };
const EMPTY: Form = { name: '', email: '', mobile: '', message: '' };

export default function Contact() {
  const copy = useCopy();
  const { data } = useSite();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const email = copy('contact_email', 'hello@placeholder.studio');
  const phone = copy('contact_phone', '+00 00000 00000');
  const address = copy('contact_address', 'Studio address — placeholder, to be updated by the studio');
  const whatsapp = copy('contact_whatsapp', '');
  const mapQuery = copy('contact_map_query', '');
  const socials = [
    { key: 'contact_instagram', label: 'Instagram', Icon: Instagram, fallback: '#' },
    { key: 'contact_facebook', label: 'Facebook', Icon: Facebook, fallback: '#' },
    { key: 'contact_linkedin', label: 'LinkedIn', Icon: Linkedin, fallback: '#' },
  ];
  const services = data?.services ?? [];

  const set = (key: keyof Form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.mobile && form.mobile.replace(/\D/g, '').length < 7) next.mobile = 'Enter a valid phone number or leave blank.';
    if (form.message.trim().length < 10) next.message = 'Please add a few words about your project.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus('sending');
    try {
      await api.post('/contacts', form);
      setForm(EMPTY);
      setStatus('done');
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields);
      setServerError(err instanceof Error ? err.message : 'Message could not be sent.');
      setStatus('idle');
    }
  };

  return (
    <section id="contact" className="relative bg-ivory px-5 py-20 sm:px-8 sm:py-24 md:py-32 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="max-w-2xl">
          <p className="eyebrow mb-4">{copy('contact_eyebrow', 'Say hello')}</p>
          <h2 className="heading-lg font-display text-espresso">{copy('contact_title', 'Contact Us')}</h2>
          <p className="body-lg mt-5 text-espresso/60">{copy('contact_intro')}</p>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14">
          <Reveal>
            <form onSubmit={submit} noValidate className="rounded-[1.75rem] border border-espresso/12 bg-white p-5 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="contact-name">
                    Name *
                  </label>
                  <input
                    id="contact-name"
                    className="field"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-[#a5502f]">{errors.name}</p>}
                </div>
                <div>
                  <label className="label" htmlFor="contact-email">
                    Email *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className="field"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="you@email.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-[#a5502f]">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="contact-mobile">
                    Phone
                  </label>
                  <input
                    id="contact-mobile"
                    type="tel"
                    className="field"
                    value={form.mobile}
                    onChange={(e) => set('mobile', e.target.value)}
                    placeholder="Optional"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.mobile)}
                  />
                  {errors.mobile && <p className="mt-1.5 text-xs text-[#a5502f]">{errors.mobile}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="contact-message">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    className="field resize-none"
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    placeholder={`Tell us about your space${services.length ? ` — e.g. ${services[0].title}` : ''}`}
                    aria-invalid={Boolean(errors.message)}
                  />
                  {errors.message && <p className="mt-1.5 text-xs text-[#a5502f]">{errors.message}</p>}
                </div>
              </div>

              {serverError && (
                <p role="alert" className="mt-4 rounded-xl border border-[#a5502f]/30 bg-[#a5502f]/[0.06] px-4 py-3 text-xs text-[#8c4527]">
                  {serverError}
                </p>
              )}

              {status === 'done' ? (
                <div role="status" className="mt-5 flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-espresso">
                  <Check size={16} className="text-gold" aria-hidden />
                  Thank you — your enquiry has reached the studio. We reply within one business day.
                </div>
              ) : null}

              <button type="submit" disabled={status === 'sending'} className="btn-primary mt-5 w-full disabled:opacity-70">
                {status === 'sending' ? (
                  <>
                    <Loader2 size={15} className="animate-spin" aria-hidden /> Sending…
                  </>
                ) : (
                  <>
                    Send enquiry <Send size={14} aria-hidden />
                  </>
                )}
              </button>
            </form>
          </Reveal>

          <Reveal delay={0.1} className="space-y-4">
            <div className="rounded-[1.5rem] border border-espresso/12 bg-white p-6 sm:p-7">
              <h3 className="font-display text-2xl text-espresso">Studio details</h3>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                  <span>
                    <span className="block text-[0.58rem] uppercase tracking-[0.18em] text-espresso/40">Email</span>
                    <a href={`mailto:${email}`} className="text-espresso/80 transition-colors hover:text-gold">
                      {email}
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                  <span>
                    <span className="block text-[0.58rem] uppercase tracking-[0.18em] text-espresso/40">Phone</span>
                    <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-espresso/80 transition-colors hover:text-gold">
                      {phone}
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden />
                  <span>
                    <span className="block text-[0.58rem] uppercase tracking-[0.18em] text-espresso/40">Studio</span>
                    <span className="text-espresso/80">{address}</span>
                  </span>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <a
                  href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : '#contact'}
                  target={whatsapp ? '_blank' : undefined}
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-white transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle size={14} aria-hidden /> WhatsApp
                </a>
                {socials.map(({ key, label, Icon, fallback }) => {
                  const href = copy(key, fallback);
                  return (
                    <a
                      key={key}
                      href={href || '#'}
                      target={href && href !== '#' ? '_blank' : undefined}
                      rel="noreferrer noopener"
                      aria-label={label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-espresso/15 text-espresso/60 transition-colors hover:border-espresso/40 hover:text-espresso"
                    >
                      <Icon size={15} aria-hidden />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-espresso/12 bg-white">
              <iframe
                title="KAVÉ studio location map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery || 'interior design studio')}&z=13&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[260px] w-full border-0 sm:h-[300px]"
              />
              <p className="border-t border-espresso/10 px-5 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-espresso/40">
                Map shows a placeholder studio location until the exact address is published.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
