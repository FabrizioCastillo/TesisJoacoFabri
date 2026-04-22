import React, { useEffect, useRef } from 'react';
import Navbar from './components/layout/Navbar';
import Particles from './components/layout/Particles';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Careers from './components/sections/Careers';
import './App.css';
import './animations.css';

function App() {
  const progressRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    const revealables = document.querySelectorAll(
      '.fade-in-up, .fade-in-down, .fade-in, .scale-in'
    );
    revealables.forEach((el) => observer.observe(el));

    let targetProgress = 0;
    let currentProgress = 0;
    let rafId = 0;

    const updateTarget = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = docHeight > 0 ? scrollTop / docHeight : 0;
    };

    const tick = () => {
      currentProgress += (targetProgress - currentProgress) * 0.12;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${currentProgress})`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', updateTarget, { passive: true });
    updateTarget();
    rafId = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateTarget);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <div className="scroll-progress-bar" ref={progressRef} />
      </div>
      <div className="grain-overlay" aria-hidden="true" />
      <Particles />
      <Navbar />
      <Hero />
      <About />
      <Careers />
    </>
  );
}

export default App;
