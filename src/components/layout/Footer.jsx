import React from 'react';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">DeepInterface</div>
        <div className="footer-meta">© {year} DeepInterface. Todos los derechos reservados.</div>
        <div className="footer-links">
          <a href="#about">Sobre nosotros</a>
          <a href="#careers">Trabaja con nosotros</a>
          <a href="mailto:tesisn8n6@gmail.com">Contacto</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
