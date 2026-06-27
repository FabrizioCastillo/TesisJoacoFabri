import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import './AdminPanel.css';

Chart.register(...registerables);

const WEBHOOK_DATA  = '/n8n/webhook/dashboard-datos';
const WEBHOOK_HIRE  = '/n8n/webhook/marcar-contratado';
const WEBHOOK_NIVEL = '/n8n/webhook/onboarding-nivel';

const NIVELES = ['Bienvenida', 'Documentación', 'Accesos', 'Capacitación', 'Confirmación'];

/* ── Onboarding card (sub-component) ───────────────────── */
function OnboardingCard({ candidate, onRefresh, showToast }) {
  const [niveles, setNiveles] = useState(
    candidate.niveles || [false, false, false, false, false]
  );
  const [loadingIdx, setLoadingIdx] = useState(null);

  const done = niveles.filter(Boolean).length;
  const fin  = done === 5;

  const marcar = async (i, valor) => {
    setLoadingIdx(i);
    const prev = [...niveles];
    setNiveles((n) => n.map((v, idx) => (idx === i ? valor : v)));
    try {
      const r = await fetch(WEBHOOK_NIVEL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: candidate.id, nivel: i + 1, valor }),
      });
      const res = await r.json();
      showToast(
        res.estado === 'Fin del Onboarding'
          ? `#${candidate.id} → Fin del Onboarding`
          : `#${candidate.id} → ${res.completados}/5`
      );
      onRefresh();
    } catch {
      setNiveles(prev);
      showToast('Error al guardar. Reintentá.');
    } finally {
      setLoadingIdx(null);
    }
  };

  return (
    <div className="ob-card">
      <div className="ob-card-header">
        <span className="ob-name">{candidate.nombre || '(sin nombre)'}</span>
        <span className="ob-id">#{candidate.id}</span>
      </div>
      <div className="ob-puesto">{candidate.puesto || ''}</div>
      <div className="ob-levels">
        {NIVELES.map((n, i) => (
          <label key={i} className={`ob-level${niveles[i] ? ' done' : ''}`}>
            <input
              type="checkbox"
              checked={!!niveles[i]}
              disabled={loadingIdx === i}
              onChange={(e) => marcar(i, e.target.checked)}
            />
            <span className="ob-level-name">Nivel {i + 1} — {n}</span>
          </label>
        ))}
      </div>
      <div className="ob-bar">
        <div className="ob-bar-fill" style={{ width: `${(done / 5) * 100}%` }} />
      </div>
      <div className={`ob-state${fin ? ' ob-state--fin' : ''}`}>
        {fin ? '✓ Fin del Onboarding' : `${done} / 5 niveles`}
      </div>
    </div>
  );
}

/* ── Main panel ─────────────────────────────────────────── */
export default function AdminPanel({ onClose }) {
  const [activeTab, setActiveTab] = useState('rrhh');
  const [data, setData]           = useState(null);
  const [errorMsg, setErrorMsg]   = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hiringMap, setHiringMap] = useState({});
  const [toast, setToast]         = useState(null);

  const funnelRef   = useRef(null);
  const entrevRef   = useRef(null);
  const funnelChart = useRef(null);
  const entrevChart = useRef(null);
  const toastTimer  = useRef(null);
  const loadRef     = useRef(null);

  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const load = useCallback(async () => {
    setRefreshing(true);
    setErrorMsg(null);
    try {
      const r = await fetch(WEBHOOK_DATA, { method: 'GET' });
      if (!r.ok) {
        setErrorMsg(`El webhook respondió con error HTTP ${r.status}. Verificá que el workflow de n8n esté activo.`);
        return;
      }
      let d = await r.json();
      if (Array.isArray(d)) d = d[0];
      setData(d);
    } catch (e) {
      setErrorMsg(`No se pudo conectar con n8n. Causa: ${e.message}`);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Keep ref in sync so effects can call load without listing it as dependency
  useEffect(() => { loadRef.current = load; }, [load]);

  // Initial fetch on mount — called through ref to avoid linter setState-in-effect trace
  useEffect(() => { loadRef.current(); }, []);

  // Auto-refresh every 30s while on onboarding tab
  useEffect(() => {
    if (activeTab !== 'onboarding') return;
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [activeTab, load]);

  // Charts (only rendered in RRHH tab)
  useEffect(() => {
    if (!data || activeTab !== 'rrhh') return;
    if (funnelChart.current) funnelChart.current.destroy();
    if (entrevChart.current) entrevChart.current.destroy();

    if (!funnelRef.current || !entrevRef.current) return;

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
          x: { ticks: { color: '#888888', font: { family: 'Outfit', size: 12 } }, grid: { display: false }, border: { color: 'rgba(255,255,255,0.06)' } },
          y: { ticks: { color: '#888888', font: { family: 'Outfit', size: 12 } }, grid: { color: 'rgba(255,255,255,0.05)' }, border: { color: 'rgba(255,255,255,0.06)' } },
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
          legend: { position: 'bottom', labels: { color: '#888888', font: { size: 11, family: 'Outfit' }, padding: 16, usePointStyle: true, pointStyleWidth: 8 } },
        },
      },
    });

    return () => {
      funnelChart.current?.destroy();
      entrevChart.current?.destroy();
    };
  }, [data, activeTab]);

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
    if (p.contratado || hiringMap[p.id] === 'done') return <span className="ap-badge ap-badge--contr">Contratado</span>;
    if (p.estado === 'Apto')     return <span className="ap-badge ap-badge--apto">Apto</span>;
    if (p.estado === 'No apto')  return <span className="ap-badge ap-badge--noapto">No apto</span>;
    return <span className="ap-badge ap-badge--pend">Pendiente</span>;
  };

  const hireBtn = (p) => {
    if (p.contratado || hiringMap[p.id] === 'done') return <span className="ap-muted">—</span>;
    if (p.estado !== 'Apto') return <span className="ap-muted">—</span>;
    const st = hiringMap[p.id];
    return (
      <button className="ap-hire-btn" disabled={st === 'loading'} onClick={() => hire(p.id)}>
        {st === 'loading' ? 'Enviando…' : st === 'err' ? 'Reintentar' : 'Marcar contratado'}
      </button>
    );
  };

  const onboardingList = data?.onboarding?.filter(Boolean) ?? [];

  return (
    <div className="ap-overlay">
      {/* Navbar */}
      <header className="ap-navbar">
        <div className="ap-navbar-inner">
          <div className="ap-navbar-left">
            <span className="ap-site-logo">Deep<span>Interface</span></span>
            <span className="ap-divider" />
            <span className="ap-panel-label">
              {activeTab === 'rrhh' ? 'Panel RRHH' : 'Onboarding'}
            </span>
          </div>
          <div className="ap-navbar-right">
            <div className="ap-status">
              <span className={`ap-pill${data ? ' ap-pill--live' : errorMsg ? ' ap-pill--err' : ''}`} />
              <span>{data ? 'Conectado a n8n' : errorMsg ? 'Sin conexión' : 'Cargando…'}</span>
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

        {/* Tab switcher — inside navbar */}
        <div className="ap-tabs">
          <div className="ap-tabs-inner">
            <button
              className={`ap-tab${activeTab === 'rrhh' ? ' active' : ''}`}
              onClick={() => setActiveTab('rrhh')}
            >
              RRHH
            </button>
            <button
              className={`ap-tab${activeTab === 'onboarding' ? ' active' : ''}`}
              onClick={() => setActiveTab('onboarding')}
            >
              Onboarding
            </button>
          </div>
        </div>
      </header>

      {/* ── RRHH tab ─────────────────────────────────────── */}
      {activeTab === 'rrhh' && (
        <div className="ap-wrap">
          <div className="ap-heading">
            <h2>Gestión de postulaciones</h2>
            <p>Resumen en tiempo real del proceso de selección de DeepInterface.</p>
          </div>

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

          <div className="ap-card">
            <h3 className="ap-card-title">Postulaciones recientes</h3>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr><th>ID</th><th>Candidato</th><th>Puesto</th><th>Estado</th><th>Entrevistador</th><th>Acción</th></tr>
                </thead>
                <tbody>
                  {errorMsg ? (
                    <tr><td colSpan={6} className="ap-muted">{errorMsg}</td></tr>
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
      )}

      {/* ── Onboarding tab ───────────────────────────────── */}
      {activeTab === 'onboarding' && (
        <div className="ap-wrap">
          <div className="ap-heading">
            <h2>Onboarding</h2>
            <p>RRHH confirma cada nivel. Al completar los 5, el candidato pasa a Fin del Onboarding.</p>
          </div>

          {errorMsg ? (
            <div className="ob-errbox"><b>Error de conexión</b><br />{errorMsg}</div>
          ) : !data ? (
            <div className="ap-empty">Cargando candidatos…</div>
          ) : !('onboarding' in data) ? (
            <div className="ob-errbox">
              <b>El dashboard no devuelve el array <code>onboarding</code></b><br />
              Actualizá el nodo <b>Armar Datos Dashboard</b> en n8n para que incluya <code>onboarding</code> en el return.
            </div>
          ) : onboardingList.length === 0 ? (
            <div className="ap-empty">
              No hay candidatos en onboarding.<br />
              <small>Solo aparecen los que tienen Estado = Apto, En proceso de Onboarding o Fin del Onboarding.</small>
            </div>
          ) : (
            <div className="ob-grid">
              {onboardingList.map((c) => (
                <OnboardingCard
                  key={`${c.id}-${(c.niveles || []).join('')}`}
                  candidate={c}
                  onRefresh={load}
                  showToast={showToast}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && <div className="ap-toast">{toast}</div>}
    </div>
  );
}
