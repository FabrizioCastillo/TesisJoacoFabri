import React from 'react';
import { ArrowRight } from 'lucide-react';
import './Careers.css';

const Careers = () => {
  return (
    <section id="careers" className="careers">
      <div className="container">
        <div className="careers-content">
          <h2 className="fade-in-up">Trabajá con nosotros</h2>
          <p className="fade-in-up delay-1">
            Buscamos mentes brillantes que quieran desafiar los límites del código. 
            Si respirás tecnología, prepará tu CV.
          </p>
          
          <div className="cta-wrapper fade-in-up delay-2">
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=tesisn8n6@gmail.com&su=Postulación%20CV" 
              target="_blank"
              rel="noopener noreferrer"
              className="btn-mailto"
            >
              Contactanos por mail <ArrowRight size={20} />
            </a>
            <p className="subtext">
              Adjuntá tu CV o Portfolio en el correo que envíes a<br />
              <strong>tesisn8n6@gmail.com</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Careers;
