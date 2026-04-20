import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <a href="/" className="logo">Deep<span>Interface</span></a>
        <div className="nav-links">
          <a href="#about" className="nav-link">Sobre nosotros</a>
          <a href="#careers" className="nav-btn">Trabajá con nosotros</a>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
