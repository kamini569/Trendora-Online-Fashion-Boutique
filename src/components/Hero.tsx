import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useCopy, useSite } from '../context/SiteContext';
import { Logo } from './SiteNav';

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function Hero() {
  const copy = useCopy();
  const { data } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '12%']);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.35]);

  const heroImage =
    copy('hero_image') ||
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=80';
  const projectCount = data?.projects.length ?? 0;

  const stats = [
    { value: copy('hero_stat_1_value', '12'), label: copy('hero_stat_1_label', 'Years of studio practice') },
    { value: copy('hero_stat_2_value', '180+'), label: copy('hero_stat_2_label', 'Spaces delivered') },
    { value: copy('hero_stat_3_value', '9'), label: copy('hero_stat_3_label', 'Design awards') },
  ];

  return (
    <section
      id="home"
      ref={ref}
      className="relative overflow-hidden bg-ivory px-5 pb-14 pt-28 sm:px-8 sm:pt-32 md:pb-20 md:pt-36 lg:px-12"
    >
      {/* soft ambient warmth, no heavy gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-taupe/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-1/4 h-[360px] w-[360px] rounded-full bg-gold/15 blur-[130px]"
      />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-16">
        <div className="max-w-2xl">
          <motion.div {...rise(0.05)} className="mb-7 flex items-center gap-4">
            <Logo className="h-16 w-auto sm:h-20" />
            <span className="h-10 w-px bg-espresso/15" aria-hidden />
            <span className="text-[0.62rem] font-medium uppercase leading-relaxed tracking-[0.24em] text-espresso/55">
              Interior Design
              <br />
              Studio
            </span>
          </motion.div>

          <motion.p {...rise(0.12)} className="eyebrow mb-5 flex items-center gap-2">
            <Sparkles size={13} className="text-gold" aria-hidden />
            {copy('tagline', 'Spaces that feel like you.')}
          </motion.p>

          <motion.h1
            {...rise(0.18)}
            className="heading-xl font-display text-espresso"
            style={{ fontWeight: 500 }}
          >
            {copy('hero_heading', 'Designing Spaces.')}
            <span className="mt-1 block italic text-gold">
              {copy('hero_heading_accent', 'Creating Experiences.')}
            </span>
          </motion.h1>

          <motion.p {...rise(0.3)} className="body-lg mt-7 max-w-xl text-espresso/70">
            {copy(
              'hero_intro',
              'KAVÉ is an interior design studio shaping calm, considered interiors for people who care how a room feels — not just how it looks.',
            )}
          </motion.p>

          <motion.div {...rise(0.4)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#projects" className="btn-primary group">
              Explore Our Projects
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </a>
            <a href="#booking" className="btn-outline">
              Book a Consultation
            </a>
          </motion.div>

          <motion.dl
            {...rise(0.5)}
            className="mt-11 grid max-w-lg grid-cols-3 gap-4 border-t border-espresso/10 pt-7"
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-2xl text-espresso sm:text-3xl">{stat.value}</span>
                  <span className="mt-1 block text-[0.6rem] uppercase leading-snug tracking-[0.14em] text-espresso/45">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
          style={{ opacity: fade }}
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-taupe/20 sm:rounded-[2.75rem]">
            <motion.img
              src={heroImage}
              alt="Warm, sunlit living room interior designed by KAVÉ"
              className="h-[380px] w-full object-cover sm:h-[480px] lg:h-[620px]"
              style={{ y: imageY }}
              loading="eager"
              fetchPriority="high"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/35 via-transparent to-transparent"
            />
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-ivory/92 px-4 py-3 backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:px-5 sm:py-4">
              <div>
                <p className="text-[0.58rem] uppercase tracking-[0.2em] text-espresso/45">Featured residence</p>
                <p className="mt-1 font-display text-base text-espresso sm:text-lg">
                  {data?.projects[0]?.title ?? 'The Ivy Residence'}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-espresso/15 px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.16em] text-espresso/60">
                {projectCount > 0 ? `${projectCount} projects` : 'Portfolio'}
              </span>
            </div>
          </div>

          <div className="absolute -left-3 top-6 hidden rotate-[-90deg] text-[0.58rem] uppercase tracking-[0.3em] text-espresso/40 lg:block">
            Est. Studio — KAVÉ
          </div>
        </motion.div>
      </div>

      <a
        href="#about"
        className="mx-auto mt-12 hidden w-fit items-center gap-2 text-[0.6rem] uppercase tracking-[0.24em] text-espresso/40 transition-colors hover:text-espresso lg:flex"
      >
        <ArrowDown size={13} aria-hidden />
        Scroll to explore
      </a>
    </section>
  );
}
