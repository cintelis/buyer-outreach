// Shared UI primitives.
// Single-line SVG icons (Lucide-style) — declared once, reused everywhere.

const Icon = ({ name, size = 14, stroke = 1.5, style }) => {
  const s = { width: size, height: size, ...style };
  const common = {
    viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round',
    style: s,
  };
  const paths = {
    home:        <><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/></>,
    mandates:    <><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M7 9h10M7 13h10M7 17h6"/></>,
    queue:       <><path d="M4 6h16M4 12h10M4 18h16"/><circle cx="20" cy="12" r="2"/></>,
    triage:      <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></>,
    nda:         <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 14l2 2 4-4"/></>,
    enrich:      <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    settings:    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    plus:        <><path d="M12 5v14M5 12h14"/></>,
    chevron:     <><path d="m9 18 6-6-6-6"/></>,
    chevronDown: <><path d="m6 9 6 6 6-6"/></>,
    chevronLeft: <><path d="m15 18-6-6 6-6"/></>,
    search:      <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    bell:        <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
    sparkles:    <><path d="M12 3v3M12 18v3M5 12H3M21 12h-2M6 6l1.5 1.5M16.5 16.5 18 18M6 18l1.5-1.5M16.5 7.5 18 6"/><circle cx="12" cy="12" r="3"/></>,
    spark:       <><path d="M12 2 14 8 20 10 14 12 12 18 10 12 4 10 10 8z"/></>,
    pen:         <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
    arrow:       <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
    arrowDown:   <><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></>,
    arrowUp:     <><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></>,
    reply:       <><path d="m9 17-5-5 5-5"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></>,
    send:        <><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></>,
    pause:       <><rect x="6" y="4" width="4" height="16" rx="0.5"/><rect x="14" y="4" width="4" height="16" rx="0.5"/></>,
    play:        <><path d="m7 4 13 8L7 20z"/></>,
    check:       <><path d="M20 6 9 17l-5-5"/></>,
    checkAll:    <><path d="M18 6 7 17l-5-5"/><path d="M22 10 13.5 18.5"/></>,
    x:           <><path d="M18 6 6 18M6 6l12 12"/></>,
    block:       <><circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/></>,
    alert:       <><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></>,
    info:        <><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></>,
    eye:         <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    upload:      <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></>,
    download:    <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></>,
    file:        <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></>,
    mail:        <><rect x="2" y="4" width="20" height="16" rx="1.5"/><path d="m2 6 10 7 10-7"/></>,
    user:        <><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></>,
    users:       <><circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1"/><path d="M16 4a4 4 0 0 1 0 8"/><path d="M22 21v-1a6 6 0 0 0-4-5.66"/></>,
    building:    <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h6"/></>,
    globe:       <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></>,
    flag:        <><path d="M4 21V4l8 3 8-3v10l-8 3-8-3z"/></>,
    clock:       <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    calendar:    <><rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
    sliders:     <><path d="M4 6h12M4 12h6M4 18h16"/><circle cx="19" cy="6" r="2"/><circle cx="13" cy="12" r="2"/><circle cx="9" cy="18" r="2"/></>,
    grid:        <><rect x="3" y="3" width="7" height="7" rx="0.5"/><rect x="14" y="3" width="7" height="7" rx="0.5"/><rect x="3" y="14" width="7" height="7" rx="0.5"/><rect x="14" y="14" width="7" height="7" rx="0.5"/></>,
    pin:         <><path d="M12 17v5"/><path d="M9 11V4l-2-2h10l-2 2v7l3 4H6z"/></>,
    dot:         <circle cx="12" cy="12" r="4"/>,
    docusign:    <><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M7 10h10M7 14h6"/><path d="m15 17 2 2 4-4"/></>,
    redline:     <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/><path d="M3 15 13 5" stroke="var(--neg)"/></>,
    wetink:      <><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></>,
    diff:        <><path d="M6 3v12"/><circle cx="6" cy="18" r="3"/><path d="M18 9a3 3 0 0 0-3 3v6"/><circle cx="18" cy="6" r="3"/></>,
    handoff:     <><path d="M17 8h4l-3-3M21 8l-3 3"/><path d="M3 16h14"/><path d="m7 21-4-5 4-5"/></>,
    onhold:      <><circle cx="12" cy="12" r="9"/><path d="M10 8v8M14 8v8"/></>,
    sun:         <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
    moon:        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>,
    menu:        <><path d="M3 6h18M3 12h18M3 18h18"/></>,
  };
  return <svg {...common}>{paths[name] || null}</svg>;
};

// ----- CHIP / STATE PILL -----
const Chip = ({ tone = 'neutral', dot, children, style, className = '' }) => (
  <span className={`chip ${tone} ${className}`} style={style}>
    {dot && <span className="dot" style={{ background: 'currentColor' }}/>}
    {children}
  </span>
);

const StateChip = ({ state, pulse }) => {
  const s = window.VC.STATES[state];
  if (!s) return null;
  return (
    <Chip tone={s.tone} dot>
      {s.label}
      {pulse && <span style={{
        width: 5, height: 5, borderRadius: '50%', background: 'var(--neg)',
        marginLeft: 2, boxShadow: '0 0 0 0 var(--neg)',
        animation: 'vc-pulse 1.6s infinite',
      }}/>}
    </Chip>
  );
};

// ----- AVATAR -----
const Avatar = ({ initials, size = 24, tone = 'accent', style }) => {
  const bg = {
    accent: 'var(--accent-bg-2)', brass: 'var(--brass-bg)',
    pos: 'var(--pos-bg)', warn: 'var(--warn-bg)', neg: 'var(--neg-bg)',
    info: 'var(--info-bg)', purple: 'var(--purple-bg)',
    neutral: 'var(--raised-2)',
  }[tone];
  const fg = {
    accent: 'var(--accent-strong)', brass: 'var(--brass)',
    pos: 'var(--pos)', warn: 'var(--warn)', neg: 'var(--neg)',
    info: 'var(--info)', purple: 'var(--purple)',
    neutral: 'var(--text-2)',
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      background: bg, color: fg,
      fontSize: size * 0.42, fontWeight: 600, letterSpacing: '0.02em',
      flexShrink: 0,
      border: '1px solid var(--border)',
      ...style,
    }}>
      {initials}
    </span>
  );
};

// ----- COUNTRY FLAG -----
const Flag = ({ code, size = 14 }) => {
  const c = window.VC.COUNTRIES[code] || '🏳️';
  return <span style={{ fontSize: size, lineHeight: 1, display: 'inline-block' }}>{c}</span>;
};

// ----- BUTTON -----
// Demo fallback: any Btn without an explicit onClick triggers a friendly
// "this would call the backend" notice instead of silently doing nothing.
// (window.__demoNotice is registered by App.)
const Btn = ({ variant = '', size = '', icon, iconRight, kbd, onClick, disabled, children, style, title }) => {
  const handleClick = onClick || ((e) => {
    e.stopPropagation();
    const label = typeof children === 'string' ? children : title;
    if (window.__demoNotice) window.__demoNotice(label);
  });
  return (
  <button
    className={`btn ${variant} ${size}`}
    onClick={handleClick}
    disabled={disabled}
    style={style}
    title={title}
  >
    {icon && <Icon name={icon} size={size === 'sm' ? 12 : 13}/>}
    {children}
    {iconRight && <Icon name={iconRight} size={size === 'sm' ? 12 : 13}/>}
    {kbd && <span className="kbd" style={{ marginLeft: 4 }}>{kbd}</span>}
  </button>
  );
};

// ----- METRIC CARD-LIKE COMPACT STAT -----
const Stat = ({ label, value, sub, tone, delta, big }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <div className="eyebrow">{label}</div>
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: big ? 22 : 16,
      fontWeight: 500,
      color: tone === 'accent' ? 'var(--accent-strong)'
           : tone === 'pos' ? 'var(--pos)'
           : tone === 'warn' ? 'var(--warn)'
           : tone === 'brass' ? 'var(--brass)'
           : 'var(--text)',
      lineHeight: 1.1,
      letterSpacing: '-0.01em',
      fontVariantNumeric: 'tabular-nums',
    }}>
      {value}
      {delta && <span style={{
        marginLeft: 6, fontSize: 11,
        color: delta.startsWith('+') ? 'var(--pos)' : 'var(--neg)',
        fontWeight: 500,
      }}>{delta}</span>}
    </div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</div>}
  </div>
);

// ----- SECTION HEADER (eyebrow-style) -----
const SectionHeader = ({ eyebrow, title, sub, right }) => (
  <div className="page-head" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
    <div>
      {eyebrow && <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>}
      {title && <div className="h1" style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>{title}</div>}
      {sub && <div style={{ color: 'var(--text-2)', fontSize: 12, marginTop: 2 }}>{sub}</div>}
    </div>
    {right && <div className="cta-row" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{right}</div>}
  </div>
);

// ----- SPARK BAR (mini bar series) -----
const SparkBar = ({ data, width = 60, height = 18, color = 'var(--accent)' }) => {
  const max = Math.max(...data, 1);
  const bw = (width - (data.length - 1) * 1) / data.length;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const h = Math.max(1, (v / max) * height);
        return (
          <rect key={i}
            x={i * (bw + 1)} y={height - h}
            width={bw} height={h}
            fill={color}
            opacity={0.5 + (v / max) * 0.5}
          />
        );
      })}
    </svg>
  );
};

// ----- MODAL / OVERLAY -----
const Modal = ({ open, onClose, children, width = 720, padded = false }) => {
  if (!open) return null;
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(2px)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40,
      animation: 'vc-fade .15s ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} className="modal-inner" style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        width, maxWidth: '100%', maxHeight: '90vh',
        boxShadow: 'var(--shadow-pop)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        padding: padded ? 24 : 0,
      }}>
        {children}
      </div>
    </div>
  );
};

// ----- DRAWER (right-side slide-out) -----
const Drawer = ({ open, onClose, children, width = 720 }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        zIndex: 150,
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity .18s ease',
      }}/>
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width, maxWidth: '94vw',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        zIndex: 151,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .22s cubic-bezier(.2,.7,.2,1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-pop)',
      }}>
        {open && children}
      </div>
    </>
  );
};

// ----- TOAST -----
const ToastHost = ({ toasts }) => (
  <div style={{
    position: 'fixed', bottom: 20, right: 20, zIndex: 300,
    display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none',
  }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-strong)',
        borderLeft: `3px solid ${t.tone === 'pos' ? 'var(--pos)' : t.tone === 'neg' ? 'var(--neg)' : 'var(--accent)'}`,
        padding: '10px 14px', borderRadius: 'var(--radius)',
        minWidth: 280, maxWidth: 420,
        boxShadow: 'var(--shadow-2)',
        animation: 'vc-toast-in .2s ease',
        pointerEvents: 'auto',
      }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{t.title}</div>
        {t.sub && <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2 }}>{t.sub}</div>}
      </div>
    ))}
  </div>
);

// ----- LOADING DOTS -----
const LoadingDots = () => (
  <span style={{ display: 'inline-flex', gap: 3 }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 4, height: 4, borderRadius: '50%', background: 'var(--text-3)',
        animation: `vc-bounce 1.2s ${i * 0.15}s infinite`,
      }}/>
    ))}
  </span>
);

// Expose to other Babel files
Object.assign(window, { Icon, Chip, StateChip, Avatar, Flag, Btn, Stat, SectionHeader, SparkBar, Modal, Drawer, ToastHost, LoadingDots });
