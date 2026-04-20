import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="fade-in-up">
          Creamos el futuro <br />
          <span className="text-gradient">línea por línea.</span>
        </h1>
        <p className="fade-in-up delay-1">
          Soluciones de software de elite para empresas que buscan liderar su industria. Minimalismo, performance e impacto garantizado.
        </p>
        <div className="hero-actions fade-in-up delay-2">
          <a href="#careers" className="btn-primary">Sumate al equipo</a>
        </div>
      </div>
      <div className="hero-glow"></div>
    </section>
  );
};

export default Hero;
