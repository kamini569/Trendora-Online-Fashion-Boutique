import { useCopy } from '../context/SiteContext';
import Reveal from './ui/Reveal';
import { ArrowUpRight } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export default function About() {
  const copy = useCopy();
  const { data } = useSite();

  const pillars = [
    { title: copy('about_pillar_1_title', 'Philosophy'), text: copy('about_pillar_1_text') },
    { title: copy('about_pillar_2_title', 'Creativity'), text: copy('about_pillar_2_text') },
    { title: copy('about_pillar_3_title', 'Quality'), text: copy('about_pillar_3_text') },
    { title: copy('about_pillar_4_title', 'Detail'), text: copy('about_pillar_4_text') },
  ];

  return (
    <section id="about" className="relative bg-ivory px-5 py-20 sm:px-8 sm:py-24 md:py-32 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:items-center lg:gap-20">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.75rem]">
              <img
                src={copy('about_image')}
                alt="KAVÉ studio interior with layered natural materials"
                className="h-[380px] w-full object-cover sm:h-[520px] lg:h-[600px]"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-8 -right-2 hidden w-[42%] overflow-hidden rounded-[1.5rem] border-[6px] border-ivory shadow-xl sm:block lg:-right-8">
              <img
                src={copy('about_image_small')}
                alt="Detail of textured wall and warm timber joinery"
                className="h-[180px] w-full object-cover lg:h-[220px]"
                loading="lazy"
              />
            </div>
            <div className="absolute left-5 top-5 rounded-full bg-ivory/92 px-4 py-2 text-[0.58rem] uppercase tracking-[0.2em] text-espresso/70 backdrop-blur">
              {copy('about_eyebrow', 'The Studio')}
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="eyebrow mb-4">{copy('about_eyebrow', 'The Studio')}</p>
              <h2 className="heading-lg font-display text-espresso">
                {copy('about_title', 'Interiors with intent.')}
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="body-lg mt-6 text-espresso/70">{copy('about_paragraph')}</p>
            </Reveal>

            <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {pillars.map((pillar, i) => (
                <Reveal key={pillar.title} delay={0.1 + i * 0.07}>
                  <div className="border-t border-espresso/12 pt-4">
                    <h3 className="flex items-center gap-2 font-display text-lg text-espresso">
                      <span className="text-[0.6rem] font-sans font-medium tracking-[0.16em] text-gold">
                        0{i + 1}
                      </span>
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-espresso/60">{pillar.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a href="#services" className="btn-outline group">
                  Our Services
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </a>
                <a
                  href="#booking"
                  className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-espresso/55 underline decoration-gold/60 decoration-1 underline-offset-8 transition-colors hover:text-espresso"
                >
                  Book a consultation
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.26}>
              <p className="mt-8 text-[0.7rem] uppercase tracking-[0.16em] text-espresso/35">
                {data?.projects.length ?? 0} published projects · {data?.services.length ?? 0} services
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
