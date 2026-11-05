import { Check, ArrowUpRight } from 'lucide-react';
import { useCopy, useSite } from '../context/SiteContext';
import Reveal from './ui/Reveal';

export default function Pricing() {
  const copy = useCopy();
  const { data } = useSite();
  const packages = data?.pricing ?? [];

  return (
    <section id="pricing" className="bg-white px-5 py-20 sm:px-8 sm:py-24 md:py-32 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="eyebrow mb-4">{copy('pricing_eyebrow', 'Engagements')}</p>
            <h2 className="heading-lg font-display text-espresso">{copy('pricing_title', 'Pricing Packages')}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-sm leading-relaxed text-espresso/60">{copy('pricing_intro')}</p>
          </Reveal>
        </div>

        {packages.length === 0 ? (
          <p className="mt-14 text-sm text-espresso/50">Packages are being prepared — please check back shortly.</p>
        ) : (
          <div className="mt-12 grid gap-5 md:mt-16 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={Math.min(i * 0.08, 0.24)} className="h-full">
                <article
                  className={`relative flex h-full flex-col rounded-[1.75rem] border p-6 transition-all duration-500 ease-soft sm:p-8 ${
                    pkg.highlight
                      ? 'border-espresso bg-espresso text-ivory shadow-[0_30px_70px_-40px_rgba(48,40,32,0.9)]'
                      : 'border-espresso/15 bg-ivory/60 hover:border-espresso/35'
                  }`}
                >
                  {pkg.highlight ? (
                    <span className="absolute right-6 top-6 rounded-full bg-gold px-3 py-1 text-[0.55rem] font-medium uppercase tracking-[0.18em] text-espresso">
                      Studio favourite
                    </span>
                  ) : null}

                  <p
                    className={`text-[0.6rem] font-medium uppercase tracking-[0.22em] ${
                      pkg.highlight ? 'text-gold' : 'text-taupe'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-snug sm:text-[1.7rem]">{pkg.name}</h3>
                  <p className={`mt-4 font-display text-3xl ${pkg.highlight ? 'text-ivory' : 'text-espresso'}`}>
                    {pkg.price_label}
                  </p>
                  {pkg.price_note ? (
                    <p
                      className={`mt-1 text-[0.68rem] uppercase tracking-[0.14em] ${
                        pkg.highlight ? 'text-ivory/50' : 'text-espresso/45'
                      }`}
                    >
                      {pkg.price_note}
                    </p>
                  ) : null}
                  <p
                    className={`mt-4 text-sm leading-relaxed ${
                      pkg.highlight ? 'text-ivory/65' : 'text-espresso/60'
                    }`}
                  >
                    {pkg.description}
                  </p>

                  <ul className="mt-6 flex-1 space-y-3 border-t pt-6 text-sm"
                      style={{ borderColor: pkg.highlight ? 'rgba(248,245,239,0.18)' : 'rgba(48,40,32,0.12)' }}>
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check
                          size={15}
                          strokeWidth={2}
                          className={pkg.highlight ? 'mt-0.5 shrink-0 text-gold' : 'mt-0.5 shrink-0 text-gold'}
                          aria-hidden
                        />
                        <span className={pkg.highlight ? 'text-ivory/75' : 'text-espresso/70'}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#booking"
                    className={`mt-8 inline-flex items-center justify-between gap-2 rounded-full px-5 py-3.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] transition-all duration-300 ${
                      pkg.highlight
                        ? 'bg-gold text-espresso hover:bg-[#c3a771]'
                        : 'border border-espresso/25 text-espresso hover:border-espresso/60 hover:bg-espresso/[0.04]'
                    }`}
                  >
                    Get Started
                    <ArrowUpRight size={14} aria-hidden />
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <p className="mt-8 text-[0.68rem] uppercase tracking-[0.16em] text-espresso/35">
          Indicative investment only — final quotes are scoped to your floor plan.
        </p>
      </div>
    </section>
  );
}
