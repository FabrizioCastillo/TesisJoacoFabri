import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onAdminClick }) => {
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
          <button className="nav-admin-btn" onClick={onAdminClick} title="Panel de administración">
            <LayoutDashboard size={17} />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
