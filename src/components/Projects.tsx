import { useEffect, useRef, useState } from 'react';
import { useCopy, useSite } from '../context/SiteContext';
import Reveal from './ui/Reveal';
import { ArrowUpRight, ChevronDown, MapPin } from 'lucide-react';
import type { Project } from '../lib/types';

/** Sticky-stacking project cards with scale falloff, after the reference template. */
export default function Projects() {
  const copy = useCopy();
  const { data } = useSite();
  const [filter, setFilter] = useState('All');
  const [detail, setDetail] = useState<Project | null>(null);

  const all = data?.projects ?? [];
  const categories = data?.categories ?? ['All'];
  const projects = filter === 'All' ? all : all.filter((p) => p.category === filter);

  return (
    <section id="projects" className="relative -mt-8 rounded-t-[2rem] bg-espresso px-5 pb-20 pt-16 sm:-mt-10 sm:rounded-t-[2.5rem] sm:px-8 sm:pt-20 md:pt-24 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <p className="eyebrow mb-4 text-taupe">{copy('projects_eyebrow', 'Selected work')}</p>
            <h2 className="heading-lg font-display text-ivory">{copy('projects_title', 'Our Projects')}</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/55">{copy('projects_intro')}</p>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                aria-pressed={filter === category}
                className={`rounded-full border px-4 py-2 text-[0.62rem] font-medium uppercase tracking-[0.14em] transition-all duration-300 ${
                  filter === category
                    ? 'border-ivory bg-ivory text-espresso'
                    : 'border-ivory/25 text-ivory/65 hover:border-ivory/60 hover:text-ivory'
                }`}
              >
                {category}
              </button>
            ))}
          </Reveal>
        </div>

        <div className="mt-12 space-y-8 sm:mt-16">
          {projects.length === 0 && (
            <p className="rounded-2xl border border-ivory/15 p-8 text-center text-sm text-ivory/60">
              No projects published in this category yet.
            </p>
          )}
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={projects.length}
              onOpen={() => setDetail(project)}
            />
          ))}
        </div>
      </div>

      {detail && <ProjectDetail project={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}

function ProjectCard({
  project,
  index,
  total,
  onOpen,
}: {
  project: Project;
  index: number;
  total: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when card top hits sticky offset, 1 when it has scrolled a viewport above
        const value = Math.min(1, Math.max(0, (vh * 0.25 - rect.top) / (vh * 0.85)));
        setProgress(value);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = 1 - (1 - targetScale) * progress;

  return (
    <div className="sticky top-[5.5rem] md:top-24" style={{ zIndex: 10 + index }}>
      <div
        ref={ref}
        style={{ transform: `scale(${scale.toFixed(4)})`, transformOrigin: 'top center' }}
        className="will-change-transform"
      >
        <article className="overflow-hidden rounded-[1.75rem] border border-ivory/20 bg-[#282019] p-3 sm:rounded-[2.25rem] sm:p-5 md:p-6">
          <div className="flex flex-col gap-4 border-b border-ivory/12 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pb-5">
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="font-display text-4xl leading-none text-ivory/25 sm:text-5xl md:text-6xl">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-[0.56rem] uppercase tracking-[0.22em] text-gold">{project.category}</p>
                <h3 className="mt-1 font-display text-xl leading-snug text-ivory sm:text-2xl md:text-3xl">
                  {project.title}
                </h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.62rem] uppercase tracking-[0.12em] text-ivory/40">
                  {project.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={10} aria-hidden />
                      {project.location}
                    </span>
                  )}
                  {project.year && <span>{project.year}</span>}
                </p>
              </div>
            </div>
            <button type="button" onClick={onOpen} className="btn-light-outline shrink-0 !px-6 !py-3">
              View Project
              <ArrowUpRight size={13} aria-hidden />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] gap-2 sm:mt-4 sm:gap-3">
            <div className="flex flex-col gap-2 sm:gap-3">
              <img
                src={project.image1}
                alt={`${project.title} — detail 1`}
                className="h-[110px] w-full rounded-[1rem] object-cover sm:h-[150px] sm:rounded-[1.4rem] md:h-[190px] lg:h-[220px]"
                loading="lazy"
              />
              <img
                src={project.image2}
                alt={`${project.title} — detail 2`}
                className="h-[140px] w-full rounded-[1rem] object-cover sm:h-[190px] sm:rounded-[1.4rem] md:h-[240px] lg:h-[290px]"
                loading="lazy"
              />
            </div>
            <img
              src={project.image3}
              alt={`${project.title} — main view`}
              className="h-full min-h-[260px] w-full rounded-[1rem] object-cover sm:min-h-[360px] sm:rounded-[1.4rem]"
              loading="lazy"
            />
          </div>

          <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ivory/55 sm:mt-5">{project.description}</p>
        </article>
      </div>
    </div>
  );
}

function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-espresso/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onClick={onClose}
    >
      <div className="mx-auto my-6 w-[min(1080px,94vw)] sm:my-10" onClick={(e) => e.stopPropagation()}>
        <div className="overflow-hidden rounded-[1.75rem] bg-ivory sm:rounded-[2rem]">
          <div className="relative">
            <img src={project.image3} alt={project.title} className="h-[240px] w-full object-cover sm:h-[380px]" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close project"
              className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ivory/92 px-4 py-2 text-[0.6rem] uppercase tracking-[0.16em] text-espresso backdrop-blur"
            >
              Close <ChevronDown size={13} aria-hidden />
            </button>
          </div>
          <div className="p-5 sm:p-8">
            <p className="eyebrow mb-2">
              {project.category}
              {project.year ? ` · ${project.year}` : ''}
            </p>
            <h3 className="heading-md font-display text-espresso">{project.title}</h3>
            {project.location && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-espresso/45">
                <MapPin size={11} aria-hidden /> {project.location}
              </p>
            )}
            <p className="mt-5 text-sm leading-relaxed text-espresso/70">{project.description}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <img src={project.image1} alt="" className="h-40 w-full rounded-2xl object-cover sm:h-56" loading="lazy" />
              <img src={project.image2} alt="" className="h-40 w-full rounded-2xl object-cover sm:h-56" loading="lazy" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#booking" onClick={onClose} className="btn-primary">
                Start a similar project
              </a>
              <a href="#gallery" onClick={onClose} className="btn-outline">
                View gallery
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
