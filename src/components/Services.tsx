import { useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCopy, useSite } from '../context/SiteContext';
import type { Service } from '../lib/types';
import Reveal from './ui/Reveal';

export default function Services() {
  const copy = useCopy();
  const { data } = useSite();
  const [active, setActive] = useState<Service | null>(null);
  const services = data?.services ?? [];

  return (
    <section id="services" className="bg-white px-5 py-20 sm:px-8 sm:py-24 md:py-32 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow mb-4">{copy('services_eyebrow', 'What we do')}</p>
            <h2 className="heading-lg font-display text-espresso">{copy('services_title', 'Our Services')}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-sm leading-relaxed text-espresso/60">
              {copy('services_intro')}
            </p>
          </Reveal>
        </div>

        {services.length === 0 ? (
          <p className="mt-14 text-sm text-espresso/50">Services are being prepared — please check back shortly.</p>
        ) : (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={Math.min(i * 0.05, 0.3)}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-espresso/10 bg-ivory/60">
                  <div className="relative overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-52 w-full object-cover transition-transform duration-[900ms] ease-soft group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-ivory/92 px-3 py-1.5 text-[0.55rem] font-medium uppercase tracking-[0.16em] text-espresso/70 backdrop-blur">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-xl leading-snug text-espresso">{service.title}</h3>
                    {service.bullet && (
                      <p className="mt-1 text-[0.6rem] uppercase tracking-[0.16em] text-gold">{service.bullet}</p>
                    )}
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-espresso/60">
                      {service.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActive(service)}
                      className="mt-5 inline-flex items-center gap-1.5 self-start text-[0.66rem] font-medium uppercase tracking-[0.16em] text-espresso transition-colors hover:text-gold"
                    >
                      Learn More
                      <ArrowUpRight size={13} aria-hidden />
                    </button>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-espresso/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
          >
            <motion.div
              className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-ivory sm:rounded-[2rem]"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img src={active.image} alt={active.title} className="h-56 w-full object-cover sm:h-64" />
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label="Close service details"
                  className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-espresso backdrop-blur transition-colors hover:bg-ivory"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 sm:p-8">
                <p className="eyebrow mb-2">Service</p>
                <h3 className="heading-md font-display text-espresso">{active.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-espresso/70">{active.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#booking" onClick={() => setActive(null)} className="btn-primary">
                    Book this service
                  </a>
                  <a href="#contact" onClick={() => setActive(null)} className="btn-outline">
                    Ask a question
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
