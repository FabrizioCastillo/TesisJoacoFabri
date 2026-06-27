import React, { useState, useRef } from 'react';
import './Careers.css';

const WEBHOOK_URL = 'https://TU-INSTANCIA-N8N/webhook/postulacion';

const Careers = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [puesto, setPuesto] = useState('Programador Junior');
  const [picked, setPicked] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState(null); // null | 'loading' | 'ok' | 'err'
  const [msgText, setMsgText] = useState('');
  const fileRef = useRef(null);

  const setFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setStatus('err');
      setMsgText('El archivo debe ser un PDF.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setStatus('err');
      setMsgText('El PDF no puede superar los 10 MB.');
      return;
    }
    setPicked(f);
    setStatus(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!nombre.trim() || !email.trim()) {
      setStatus('err');
      setMsgText('Completá nombre y correo.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus('err');
      setMsgText('El correo no es válido.');
      return;
    }
    if (!picked) {
      setStatus('err');
      setMsgText('Adjuntá tu CV en PDF.');
      return;
    }

    setStatus('loading');
    try {
      const fd = new FormData();
      fd.append('nombre', nombre.trim());
      fd.append('email', email.trim());
      fd.append('puesto', puesto);
      fd.append('cv', picked, picked.name);
      const r = await fetch(WEBHOOK_URL, { method: 'POST', body: fd });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      setStatus('ok');
      setMsgText('¡Postulación recibida! Te vamos a contactar por correo en breve.');
      setNombre('');
      setEmail('');
      setPuesto('Programador Junior');
      setPicked(null);
    } catch {
      setStatus('err');
      setMsgText('No pudimos enviar tu postulación. Probá de nuevo en unos minutos.');
    }
  };

  return (
    <section id="careers" className="careers">
      <div className="careers-container">
        <div className="careers-heading fade-in-up">
          <h2>Trabajá con nosotros</h2>
          <p>
            Buscamos mentes brillantes que quieran desafiar los límites del código.
            Envianos tu CV y nuestro sistema lo procesa automáticamente.
          </p>
        </div>

        <div className="careers-grid fade-in-up delay-1">
          {/* Info card */}
          <div className="c-card c-card--info">
            <h3>¿Cómo funciona?</h3>
            <p className="c-card__sub">
              Sin formularios extra ni esperas largas. Tu CV habla por vos.
            </p>
            <ul className="c-points">
              <li>
                <span className="c-dot" />
                <span>Respuesta automática en menos de 5 minutos.</span>
              </li>
              <li>
                <span className="c-dot" />
                <span>Tu CV se analiza con inteligencia artificial.</span>
              </li>
              <li>
                <span className="c-dot" />
                <span>Si avanzás, coordinamos la entrevista de forma automática.</span>
              </li>
            </ul>
            <div className="c-legal">
              Tus datos se tratan conforme a la Ley N.º&nbsp;25.326.
            </div>
          </div>

          {/* Form card */}
          <div className="c-card c-card--form">
            <div className="c-field">
              <label htmlFor="c-nombre">Nombre y apellido</label>
              <input
                id="c-nombre"
                type="text"
                placeholder="Ej. Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="c-field">
              <label htmlFor="c-email">Correo electrónico</label>
              <input
                id="c-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="c-field">
              <label htmlFor="c-puesto">Puesto al que postulás</label>
              <select
                id="c-puesto"
                value={puesto}
                onChange={(e) => setPuesto(e.target.value)}
              >
                <option>Programador Junior</option>
                <option>Programador Semi Senior</option>
                <option>Programador Senior</option>
                <option>Otro</option>
              </select>
            </div>

            <div className="c-field">
              <label>Currículum (PDF)</label>
              <div
                className={`c-drop${dragging ? ' c-drop--drag' : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
                onDrop={onDrop}
              >
                {picked ? (
                  <span className="c-drop__name">✓ {picked.name}</span>
                ) : (
                  <span>Arrastrá tu PDF acá o <strong>hacé clic para elegirlo</strong></span>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <button
              className="c-btn"
              onClick={handleSubmit}
              disabled={status === 'loading' || status === 'ok'}
            >
              {status === 'loading' && <span className="c-spinner" />}
              {status === 'ok' ? 'Enviado ✓' : status === 'loading' ? 'Enviando...' : 'Enviar postulación'}
            </button>

            {(status === 'ok' || status === 'err') && (
              <div className={`c-msg c-msg--${status}`}>{msgText}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Careers;
