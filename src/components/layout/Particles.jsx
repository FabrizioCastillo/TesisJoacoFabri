import React from 'react';
import './Particles.css';

const Particles = () => {
  return (
    <div className="particles-container">
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
  );
};

export default Particles;
