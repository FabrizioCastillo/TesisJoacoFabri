import React, { useEffect, useRef } from 'react';
import './Particles.css';

const Particles = () => {
  const particlesRef = useRef(null);
  const orbsRef = useRef(null);

  useEffect(() => {
    let targetY = 0;
    let currentY = 0;
    let rafId = 0;

    const handleScroll = () => {
      targetY = window.scrollY;
    };

    const tick = () => {
      currentY += (targetY - currentY) * 0.08;

      if (Math.abs(targetY - currentY) < 0.05) {
        currentY = targetY;
      }

      if (particlesRef.current) {
        particlesRef.current.style.transform = `translate3d(0, ${currentY * 0.25}px, 0)`;
      }
      if (orbsRef.current) {
        orbsRef.current.style.transform = `translate3d(0, ${currentY * 0.12}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div className="parallax-orbs" ref={orbsRef} />
      <div className="particles-container" ref={particlesRef}>
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 200}%`,
              animationDelay: `${i * 0.15}s`,
            }}
          ></div>
        ))}
      </div>
    </>
  );
};

export default Particles;
