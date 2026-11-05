import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { useCopy, useSite } from '../context/SiteContext';
import Reveal from './ui/Reveal';

const ALL = 'All Interiors';

export default function Gallery() {
  const copy = useCopy();
  const { data } = useSite();
  const items = useMemo(() => data?.gallery ?? [], [data]);
  const categories = useMemo(() => [ALL, ...(data?.galleryCategories ?? [])], [data]);
  const [active, setActive] = useState(ALL);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(
    () => (active === ALL ? items : items.filter((item) => item.category === active)),
    [items, active],
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null);
      if (event.key === 'ArrowRight') setLightbox((i) => (i === null ? i : (i + 1) % filtered.length));
      if (event.key === 'ArrowLeft') setLightbox((i) => (i === null ? i : (i - 1 + filtered.length) % filtered.length));
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, filtered.length]);

  const current = lightbox === null ? null : filtered[lightbox];

  return (
    <section id="gallery" className="bg-ivory px-5 py-20 sm:px-8 sm:py-24 md:py-32 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow mb-4">{copy('gallery_eyebrow', 'Selected frames')}</p>
            <h2 className="heading-lg font-display text-espresso">{copy('gallery_title', 'Gallery')}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-sm leading-relaxed text-espresso/60">{copy('gallery_intro')}</p>
          </Reveal>
        </div>

        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1 sm:mt-10" role="tablist" aria-label="Gallery categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={active === category}
              onClick={() => {
                setActive(category);
                setLightbox(null);
              }}
              className={`chip shrink-0 ${active === category ? 'chip-active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-sm text-espresso/50">No images in this category yet.</p>
        ) : (
          <div className="mt-8 grid auto-rows-[190px] grid-cols-2 gap-3 sm:auto-rows-[230px] sm:gap-4 md:grid-cols-4 lg:auto-rows-[260px]">
            {filtered.map((item, index) => {
              const tall = index % 5 === 0 || index % 7 === 3;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.55, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setLightbox(index)}
                  aria-label={`Open ${item.title}`}
                  className={`group relative overflow-hidden rounded-[1.25rem] text-left sm:rounded-[1.5rem] ${
                    tall ? 'row-span-2' : ''
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.05]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/10 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
                  <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2 translate-y-2 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                    <span>
                      <span className="block text-[0.55rem] uppercase tracking-[0.18em] text-gold">{item.category}</span>
                      <span className="mt-1 block font-display text-base leading-tight text-ivory sm:text-lg">{item.title}</span>
                    </span>
                    <Expand size={15} className="mb-1 shrink-0 text-ivory/80" aria-hidden />
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {current ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-espresso/95 p-4 backdrop-blur-sm sm:p-8"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close image"
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors hover:bg-ivory/10 sm:right-8 sm:top-8"
            >
              <X size={18} />
            </button>
            {filtered.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightbox((i) => (i === null ? i : (i - 1 + filtered.length) % filtered.length));
                  }}
                  className="absolute left-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors hover:bg-ivory/10 sm:left-6"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightbox((i) => (i === null ? i : (i + 1) % filtered.length));
                  }}
                  className="absolute right-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors hover:bg-ivory/10 sm:right-6"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <motion.figure
              key={current.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-h-full w-full max-w-5xl"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={current.image}
                alt={current.title}
                className="mx-auto max-h-[76vh] w-auto rounded-2xl object-contain"
              />
              <figcaption className="mt-4 text-center">
                <span className="block text-[0.58rem] uppercase tracking-[0.2em] text-gold">{current.category}</span>
                <span className="mt-1 block font-display text-xl text-ivory">{current.title}</span>
              </figcaption>
            </motion.figure>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
