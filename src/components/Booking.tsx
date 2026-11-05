import { useMemo, useState } from 'react';
import { CalendarCheck, Check, Loader2 } from 'lucide-react';
import { ApiError, api } from '../lib/api';
import { useCopy, useSite } from '../context/SiteContext';
import type { Booking } from '../lib/types';
import Reveal from './ui/Reveal';

const PROPERTY_TYPES = ['Apartment', 'Villa / Independent House', 'Penthouse', 'Office', 'Retail / Commercial', 'Other'];
const TIMES = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'];

const today = () => new Date().toISOString().slice(0, 10);

type FormState = {
  name: string;
  email: string;
  mobile: string;
  date: string;
  time: string;
  service: string;
  property_type: string;
  message: string;
};

const EMPTY: FormState = {
  name: '',
  email: '',
  mobile: '',
  date: '',
  time: '',
  service: '',
  property_type: '',
  message: '',
};

export default function BookingSection() {
  const copy = useCopy();
  const { data } = useSite();
  const services = useMemo(() => data?.services ?? [], [data]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.mobile.replace(/\D/g, '').length < 7) next.mobile = 'Enter a reachable mobile number.';
    if (!form.date) next.date = 'Choose a preferred date.';
    else if (form.date < today()) next.date = 'Please choose today or a future date.';
    if (!form.time) next.time = 'Choose a preferred time.';
    if (!form.service) next.service = 'Select the service you need.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setStatus('sending');
    try {
      const result = await api.post<{ booking: Booking }>('/bookings', form);
      setConfirmed(result.booking);
      setStatus('done');
      setForm(EMPTY);
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields);
      setServerError(err instanceof Error ? err.message : 'We could not save your booking. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <section id="booking" className="relative bg-espresso px-5 py-20 text-ivory sm:px-8 sm:py-24 md:py-32 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal>
          <p className="eyebrow mb-4 text-gold">{copy('booking_eyebrow', 'Appointments')}</p>
          <h2 className="heading-lg font-display text-ivory">{copy('booking_title', 'Book a Consultation')}</h2>
          <p className="body-lg mt-6 max-w-md text-ivory/60">{copy('booking_intro')}</p>

          <dl className="mt-10 space-y-5 border-t border-ivory/15 pt-8 text-sm">
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-gold">Studio hours</dt>
              <dd className="mt-1 text-ivory/70">Monday – Saturday · 09:00 – 19:00</dd>
            </div>
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-gold">Where we meet</dt>
              <dd className="mt-1 text-ivory/70">
                In-studio, at your site, or over video — you choose in your confirmation reply.
              </dd>
            </div>
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-gold">What to bring</dt>
              <dd className="mt-1 text-ivory/70">
                Floor plans or rough measurements, inspiration references and your budget range.
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="rounded-[1.75rem] border border-ivory/15 bg-ivory/[0.04] p-5 backdrop-blur-sm sm:p-8 md:p-10">
            {status === 'done' && confirmed ? (
              <div className="flex h-full flex-col items-start justify-center py-6">
                <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold text-espresso">
                  <Check size={26} strokeWidth={2.5} aria-hidden />
                </span>
                <h3 className="font-display text-3xl text-ivory">Your consultation is requested</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ivory/65">
                  Thank you, {confirmed.name}. We have saved your request for{' '}
                  <span className="text-ivory">{confirmed.date}</span> at{' '}
                  <span className="text-ivory">{confirmed.time}</span> regarding{' '}
                  <span className="text-ivory">{confirmed.service}</span>. The studio replies within one business
                  day to confirm the slot.
                </p>
                <p className="mt-4 text-[0.62rem] uppercase tracking-[0.18em] text-ivory/35">
                  Reference KAV-{String(confirmed.id).padStart(4, '0')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setConfirmed(null);
                  }}
                  className="btn-light-outline mt-8"
                >
                  Book another appointment
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="mb-6 flex items-center gap-3">
                  <CalendarCheck size={18} className="text-gold" aria-hidden />
                  <p className="text-[0.62rem] uppercase tracking-[0.2em] text-ivory/60">
                    Tell us about your space
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label-dark" htmlFor="booking-name">
                      Customer name *
                    </label>
                    <input
                      id="booking-name"
                      className="field-dark"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-[#f0b9a4]">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="label-dark" htmlFor="booking-email">
                      Email address *
                    </label>
                    <input
                      id="booking-email"
                      type="email"
                      className="field-dark"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="you@email.com"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-[#f0b9a4]">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="label-dark" htmlFor="booking-mobile">
                      Mobile number *
                    </label>
                    <input
                      id="booking-mobile"
                      type="tel"
                      className="field-dark"
                      value={form.mobile}
                      onChange={(e) => set('mobile', e.target.value)}
                      placeholder="+00 00000 00000"
                      autoComplete="tel"
                      aria-invalid={Boolean(errors.mobile)}
                    />
                    {errors.mobile && <p className="mt-1.5 text-xs text-[#f0b9a4]">{errors.mobile}</p>}
                  </div>

                  <div>
                    <label className="label-dark" htmlFor="booking-date">
                      Preferred date *
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      min={today()}
                      className="field-dark [color-scheme:dark]"
                      value={form.date}
                      onChange={(e) => set('date', e.target.value)}
                      aria-invalid={Boolean(errors.date)}
                    />
                    {errors.date && <p className="mt-1.5 text-xs text-[#f0b9a4]">{errors.date}</p>}
                  </div>

                  <div>
                    <label className="label-dark" htmlFor="booking-time">
                      Preferred time *
                    </label>
                    <select
                      id="booking-time"
                      className="field-dark"
                      value={form.time}
                      onChange={(e) => set('time', e.target.value)}
                      aria-invalid={Boolean(errors.time)}
                    >
                      <option value="">Select a time</option>
                      {TIMES.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    {errors.time && <p className="mt-1.5 text-xs text-[#f0b9a4]">{errors.time}</p>}
                  </div>

                  <div>
                    <label className="label-dark" htmlFor="booking-service">
                      Service selection *
                    </label>
                    <select
                      id="booking-service"
                      className="field-dark"
                      value={form.service}
                      onChange={(e) => set('service', e.target.value)}
                      aria-invalid={Boolean(errors.service)}
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.title}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                    {errors.service && <p className="mt-1.5 text-xs text-[#f0b9a4]">{errors.service}</p>}
                  </div>

                  <div>
                    <label className="label-dark" htmlFor="booking-property">
                      Property type
                    </label>
                    <select
                      id="booking-property"
                      className="field-dark"
                      value={form.property_type}
                      onChange={(e) => set('property_type', e.target.value)}
                    >
                      <option value="">Select property type</option>
                      {PROPERTY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label-dark" htmlFor="booking-message">
                      Message
                    </label>
                    <textarea
                      id="booking-message"
                      rows={4}
                      className="field-dark resize-none"
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                      placeholder="Rooms involved, square footage, timeline, style direction…"
                    />
                  </div>
                </div>

                {serverError && (
                  <p role="alert" className="mt-4 rounded-xl border border-[#f0b9a4]/40 bg-[#f0b9a4]/10 px-4 py-3 text-xs text-[#f6cabb]">
                    {serverError}
                  </p>
                )}

                <button type="submit" disabled={status === 'sending'} className="btn-gold mt-6 w-full disabled:opacity-70">
                  {status === 'sending' ? (
                    <>
                      <Loader2 size={15} className="animate-spin" aria-hidden /> Saving…
                    </>
                  ) : (
                    'Request appointment'
                  )}
                </button>
                <p className="mt-3 text-center text-[0.62rem] uppercase tracking-[0.16em] text-ivory/30">
                  Required fields are marked *
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
