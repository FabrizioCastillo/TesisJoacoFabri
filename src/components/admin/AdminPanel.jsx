import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import './AdminPanel.css';

Chart.register(...registerables);

const WEBHOOK_DATA = '/n8n/webhook/dashboard-datos';
const WEBHOOK_HIRE = '/n8n/webhook/marcar-contratado';


export default function AdminPanel({ onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hiringMap, setHiringMap] = useState({});

  const funnelRef = useRef(null);
  const entrevRef = useRef(null);
  const funnelChart = useRef(null);
  const entrevChart = useRef(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(false);
    try {
      const r = await fetch(WEBHOOK_DATA, { method: 'GET' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      let d = await r.json();
      if (Array.isArray(d)) d = d[0];
      setData(d);
    } catch {
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!data) return;
    if (funnelChart.current) funnelChart.current.destroy();
    if (entrevChart.current) entrevChart.current.destroy();

    funnelChart.current = new Chart(funnelRef.current, {
      type: 'bar',
      data: {
        labels: ['Procesadas', 'Aptos', 'Contratados'],
        datasets: [{
          data: [data.total, data.aptos, data.contratados],
          backgroundColor: ['rgba(77,166,255,0.75)', 'rgba(47,209,128,0.75)', 'rgba(167,139,255,0.75)'],
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: '#888888', font: { family: 'Outfit', size: 12 } },
            grid: { display: false },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
          y: {
            ticks: { color: '#888888', font: { family: 'Outfit', size: 12 } },
            grid: { color: 'rgba(255,255,255,0.05)' },
            border: { color: 'rgba(255,255,255,0.06)' },
          },
        },
      },
    });

    const ed = data.entrevistadores || {};
    entrevChart.current = new Chart(entrevRef.current, {
      type: 'doughnut',
      data: {
        labels: Object.keys(ed),
        datasets: [{
          data: Object.values(ed),
          backgroundColor: ['rgba(77,166,255,0.8)', 'rgba(167,139,255,0.8)', 'rgba(47,209,128,0.8)', 'rgba(255,209,102,0.8)'],
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        cutout: '62%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#888888',
              font: { size: 11, family: 'Outfit' },
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 8,
            },
          },
        },
      },
    });

    return () => {
      funnelChart.current?.destroy();
      entrevChart.current?.destroy();
    };
  }, [data]);

  const hire = async (id) => {
    setHiringMap((prev) => ({ ...prev, [id]: 'loading' }));
    try {
      const r = await fetch(WEBHOOK_HIRE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      setHiringMap((prev) => ({ ...prev, [id]: 'done' }));
      setTimeout(load, 1200);
    } catch {
      setHiringMap((prev) => ({ ...prev, [id]: 'err' }));
    }
  };

  const stateBadge = (p) => {
    if (p.contratado || hiringMap[p.id] === 'done')
      return <span className="ap-badge ap-badge--contr">Contratado</span>;
    if (p.estado === 'Apto')
      return <span className="ap-badge ap-badge--apto">Apto</span>;
    if (p.estado === 'No apto')
      return <span className="ap-badge ap-badge--noapto">No apto</span>;
    return <span className="ap-badge ap-badge--pend">Pendiente</span>;
  };

  const hireBtn = (p) => {
    if (p.contratado || hiringMap[p.id] === 'done') return <span className="ap-muted">—</span>;
    if (p.estado !== 'Apto') return <span className="ap-muted">—</span>;
    const st = hiringMap[p.id];
    return (
      <button
        className="ap-hire-btn"
        disabled={st === 'loading'}
        onClick={() => hire(p.id)}
      >
        {st === 'loading' ? 'Enviando…' : st === 'err' ? 'Reintentar' : 'Marcar contratado'}
      </button>
    );
  };

  return (
    <div className="ap-overlay">
      {/* Navbar-style top bar */}
      <header className="ap-navbar">
        <div className="ap-navbar-inner">
          <div className="ap-navbar-left">
            <span className="ap-site-logo">Deep<span>Interface</span></span>
            <span className="ap-divider" />
            <span className="ap-panel-label">Panel RRHH</span>
          </div>
          <div className="ap-navbar-right">
            <div className="ap-status">
              <span className={`ap-pill${data ? ' ap-pill--live' : error ? ' ap-pill--err' : ''}`} />
              <span>{data ? 'Conectado a n8n' : error ? 'Sin conexión' : 'Cargando…'}</span>
            </div>
            <button className="ap-ghost-btn" onClick={load} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'ap-spin' : ''} />
              Actualizar
            </button>
            <button className="ap-close-btn" onClick={onClose} title="Volver al sitio">
              <X size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="ap-wrap">
        {/* Section heading */}
        <div className="ap-heading">
          <h2>Gestión de postulaciones</h2>
          <p>Resumen en tiempo real del proceso de selección de DeepInterface.</p>
        </div>

        {/* KPIs */}
        <div className="ap-kpis">
          {[
            { label: 'Postulaciones', value: data?.total, mod: '' },
            { label: 'Aptos', value: data?.aptos, mod: 'ok' },
            { label: 'No aptos', value: data?.noaptos, mod: '' },
            { label: 'Contratados', value: data?.contratados, mod: 'ac' },
            { label: 'Tiempo medio gestión', value: data?.tiempoMedio, mod: '' },
          ].map((k) => (
            <div key={k.label} className="ap-kpi">
              <div className="ap-kpi-label">{k.label}</div>
              <div className={`ap-kpi-value${k.mod ? ' ap-kpi-value--' + k.mod : ''}`}>
                {k.value ?? '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="ap-charts">
          <div className="ap-card">
            <h3 className="ap-card-title">Embudo de selección</h3>
            <canvas ref={funnelRef} />
          </div>
          <div className="ap-card">
            <h3 className="ap-card-title">Entrevistas por entrevistador</h3>
            <canvas ref={entrevRef} />
          </div>
        </div>

        {/* Table */}
        <div className="ap-card">
          <h3 className="ap-card-title">Postulaciones recientes</h3>
          <div className="ap-table-wrap">
            <table className="ap-table">
              <thead>
                <tr>
                  <th>ID</th><th>Candidato</th><th>Puesto</th>
                  <th>Estado</th><th>Entrevistador</th><th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {error ? (
                  <tr><td colSpan={6} className="ap-muted">No se pudo conectar con el servidor.</td></tr>
                ) : !data ? (
                  <tr><td colSpan={6} className="ap-muted">Cargando…</td></tr>
                ) : data.postulaciones?.length ? (
                  data.postulaciones.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.nombre}</td>
                      <td>{p.puesto}</td>
                      <td>{stateBadge(p)}</td>
                      <td>{p.entrevistador || '—'}</td>
                      <td>{hireBtn(p)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="ap-muted">Sin postulaciones.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
