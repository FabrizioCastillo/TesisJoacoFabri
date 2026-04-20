import React from 'react';
import Navbar from './components/layout/Navbar';
import Particles from './components/layout/Particles';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Careers from './components/sections/Careers';
import './App.css';
import './animations.css';

function App() {
  return (
    <>
      <Particles />
      <Navbar />
      <Hero />
      <About />
      <Careers />
    </>
  );
}

export default App;
