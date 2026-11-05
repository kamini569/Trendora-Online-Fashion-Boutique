import { useEffect, useMemo, useRef, useState } from 'react';
import { useSite } from '../context/SiteContext';

const FALLBACK = [
  'photo-1616486338812-3dadae4b4ace',
  'photo-1600210492486-724fe5c67fb0',
  'photo-1618221195710-dd6b41faaea6',
  'photo-1600585154340-be6161a56a0c',
  'photo-1616594039964-ae9021a400a0',
  'photo-1556909212-d5b604d0c90d',
  'photo-1497366216548-37526070297c',
  'photo-1524758631624-e2822e304c36',
  'photo-1600607687920-4e2a09cf159d',
  'photo-1615529182904-14819c35db37',
  'photo-1615874959474-d609969a20ed',
  'photo-1600566753086-00f18fb6b3ea',
  'photo-1600566752355-35792bedcfea',
  'photo-1600607687939-ce8a6c25118c',
  'photo-1600573472550-8090b5e0745e',
  'photo-1616137466211-f939a420be84',
  'photo-1618219908412-a29a1bb7b86e',
  'photo-1600121848594-d8644e57abab',
  'photo-1615873968403-89e068629265',
  'photo-1617104678098-de229db51175',
  'photo-1600494603989-9650cf6ddd3d',
].map(
  (id) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`,
);

const TILE_SET_PX = 4740; // 11 tiles × (420 + 12 gap) at the desktop size

/**
 * Two counter-scrolling photo bands driven by page scroll position,
 * adapted from the reference template's marquee section.
 */
export default function Marquee() {
  const { data } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  const images = useMemo(() => {
    const pool = (data?.gallery ?? []).map((item) => item.image).filter(Boolean);
    const base = pool.length >= 11 ? pool : [...pool, ...FALLBACK];
    const filled: string[] = [];
    for (let i = 0; filled.length < 21; i += 1) filled.push(base[i % base.length]);
    return filled;
  }, [data]);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const sectionTop = el.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const shift = Math.round((offset % TILE_SET_PX) - 200);
  const rowOne = images.slice(0, 11);
  const rowTwo = images.slice(11, 21);

  const renderRow = (row: string[], direction: 1 | -1, rowKey: string) => (
    <div className="overflow-hidden" key={rowKey}>
      <div
        className="flex w-max gap-3"
        style={{
          transform:
            direction === 1
              ? `translate3d(calc(-33.3333% + ${shift}px), 0, 0)`
              : `translate3d(calc(-33.3333% - ${shift}px), 0, 0)`,
          willChange: 'transform',
        }}
      >
        {[...row, ...row, ...row].map((src, index) => (
          <figure
            key={`${rowKey}-${index}`}
            className="h-[180px] w-[260px] shrink-0 overflow-hidden rounded-2xl bg-espresso/10 sm:h-[220px] sm:w-[330px] md:h-[270px] md:w-[420px]"
          >
            <img
              src={src}
              alt="KAVÉ interior project reference"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </figure>
        ))}
      </div>
    </div>
  );

  return (
    <section
      ref={ref}
      aria-label="Interior photography archive"
      className="overflow-hidden bg-ivory pb-10 pt-16 sm:pt-20 md:pt-24"
    >
      <div className="mb-8 flex flex-col gap-3 px-5 sm:mb-10 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
        <p className="eyebrow">The moodboard</p>
        <p className="max-w-sm text-sm leading-relaxed text-espresso/55">
          Material studies, light tests and finished rooms — the visual language the studio works in.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {renderRow(rowOne, 1, 'row-one')}
        {renderRow(rowTwo, -1, 'row-two')}
      </div>
    </section>
  );
}
