import SiteNav from '../components/SiteNav';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import About from '../components/About';
import Services from '../components/Services';
import Projects from '../components/Projects';
import Pricing from '../components/Pricing';
import Gallery from '../components/Gallery';
import BookingSection from '../components/Booking';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-ivory">
      <SiteNav />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Projects />
        <Pricing />
        <Gallery />
        <BookingSection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
