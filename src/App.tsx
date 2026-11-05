import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { SiteProvider } from './context/SiteContext';
import Home from './pages/Home';
import Admin from './pages/Admin';

/** Keeps hash navigation working after a route change. */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <SiteProvider>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </SiteProvider>
  );
}
