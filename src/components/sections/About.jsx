import React from 'react';
import { Code2, MonitorPlay, Zap } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-header">
          <h2 className="fade-in-up">Sobre nosotros</h2>
          <p className="fade-in-up delay-1">
            En <strong>Deep interface</strong>, no escribimos código; forjamos la infraestructura del mañana. 
            Nos especializamos en experiencias digitales de elite que redefinen la forma 
            en la que las personas interactúan con la tecnología de punta.
          </p>
        </div>
        
        <div className="services-grid">
          <div className="service-card fade-in-up delay-2">
            <MonitorPlay size={32} className="service-icon" />
            <h3>Interfaces Inmersivas</h3>
            <p>Diseño de plataformas minimalistas y dark-mode native que priorizan la retención absoluta y la estética visual sin distracciones.</p>
          </div>
          
          <div className="service-card fade-in-up delay-2">
            <Code2 size={32} className="service-icon" />
            <h3>Sistemas Deep Core</h3>
            <p>Arquitecturas de alto impacto técnico. Pasamos de largo los templates genéricos y desarrollamos bases robustas y a medida para pioneros.</p>
          </div>

          <div className="service-card fade-in-up delay-3">
            <Zap size={32} className="service-icon" />
            <h3>Performance al Límite</h3>
            <p>Optimizamos cada kilobyte y cada frame. Construimos soluciones donde la velocidad extrema y la fluidez no son opcionales, son el estándar.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
