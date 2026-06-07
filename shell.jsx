// App shell: Sidebar, Topbar, Co-pilot panel.
// Wired by app.jsx — receives nav state and dispatches changes via props.

const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',           icon: 'home' },
  { id: 'mandates',   label: 'Mandates',           icon: 'mandates' },
  { id: 'queue',      label: 'Review queue',       icon: 'queue', badge: 'queue' },
  { id: 'triage',     label: 'Reply triage',       icon: 'triage', badge: 'triage' },
  { id: 'enrichment', label: 'Enrichment',         icon: 'enrich' },
  { id: 'nda',        label: 'NDA workflow',       icon: 'nda', badge: 'nda' },
];

const Sidebar = ({ nav, setNav, badges, onNewMandate, onDirectNda, mobileOpen, onCloseMobile }) => {
  // Wrap setNav so opening a section from the drawer also closes it on mobile.
  const navigate = (id) => {
    setNav(id);
    if (onCloseMobile) onCloseMobile();
  };
  return (
    <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`} style={{
      width: 220,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      padding: '14px 10px 10px',
      gap: 14,
    }}>
      {/* Brand mark */}
      <button onClick={() => navigate('overview')} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
        padding: '4px 6px', cursor: 'pointer',
        textAlign: 'left',
      }}>
        {/* Brand wordmark: icon mark + "City Capital" (teal, matches --accent) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            className="brand-logo"
            src="assets/velocity-icon-dark.png"
            alt="City Capital"
            style={{ height: 26, width: 'auto', display: 'block' }}
          />
          <span style={{ fontSize: 19, fontWeight: 600, color: 'var(--accent)', letterSpacing: '-0.02em', lineHeight: 1, whiteSpace: 'nowrap' }}>
            City Capital
          </span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500, paddingLeft: 2 }}>
          Buyer Outreach
        </div>
      </button>

      <div style={{ display: 'flex', gap: 6 }}>
        <Btn variant="primary" size="sm" icon="plus" style={{ flex: 1 }} onClick={onNewMandate}>
          New mandate
        </Btn>
        <Btn size="sm" icon="send" title="Direct-NDA shortcut" onClick={onDirectNda}/>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {NAV_ITEMS.map(item => {
          const active = nav === item.id;
          const count = badges[item.badge];
          return (
            <button key={item.id} onClick={() => navigate(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              background: active ? 'var(--accent-bg-2)' : 'transparent',
              color: active ? 'var(--accent-strong)' : 'var(--text-2)',
              fontSize: 12.5,
              fontWeight: active ? 500 : 400,
              border: active ? '1px solid var(--accent-line)' : '1px solid transparent',
              transition: 'background .12s ease, color .12s ease',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--raised)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon name={item.icon} size={14}/>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {count > 0 && (
                <span className="mono" style={{
                  fontSize: 10,
                  padding: '1px 5px',
                  borderRadius: 8,
                  background: active ? 'var(--accent)' : 'var(--raised-2)',
                  color: active ? 'white' : 'var(--text-2)',
                  border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                  fontWeight: 500,
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="eyebrow" style={{ marginTop: 4, paddingLeft: 6 }}>Active mandates</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }}>
        {window.VC.MANDATES.filter(m => m.status === 'Active').map(m => {
          const active = nav === 'mandate-' + m.id;
          return (
            <button key={m.id} onClick={() => navigate('mandate-' + m.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 8px',
              borderRadius: 'var(--radius-sm)',
              background: active ? 'var(--accent-bg-2)' : 'transparent',
              color: active ? 'var(--accent-strong)' : 'var(--text)',
              fontSize: 12,
              border: active ? '1px solid var(--accent-line)' : '1px solid transparent',
              transition: 'background .12s ease',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--raised)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: `var(--${m.accent === 'neutral' ? 'text-3' : m.accent})`,
              }}/>
              <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
              {(m.pending_replies + m.pending_review) > 0 && (
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>
                  {m.pending_replies + m.pending_review}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User chip at bottom */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 6px', borderTop: '1px solid var(--border)',
        margin: '0 -10px -10px', paddingLeft: 12, paddingBottom: 14,
      }}>
        <Avatar initials="AM" size={26} tone="brass"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Alex Morgan</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>Lead advisor</div>
        </div>
        <Icon name="settings" size={13} style={{ color: 'var(--text-3)' }}/>
      </div>
    </aside>
  );
};

// ----- TOPBAR -----
const Topbar = ({ breadcrumb, right, onCopilotToggle, copilotOpen, theme, onThemeToggle, onMobileMenu }) => {
  return (
    <header className="app-topbar" style={{
      minHeight: 44,
      flexShrink: 0,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 16px',
      gap: 14,
    }}>
      {/* Hamburger — only visible ≤1024px via CSS .hamburger rules */}
      <button
        className="hamburger"
        onClick={onMobileMenu}
        aria-label="Open navigation menu"
      >
        <Icon name="menu" size={16}/>
      </button>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, flex: 1, minWidth: 0 }}>
        {breadcrumb.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Icon name="chevron" size={11} style={{ color: 'var(--text-3)' }}/>}
            <span style={{
              color: i === breadcrumb.length - 1 ? 'var(--text)' : 'var(--text-2)',
              fontWeight: i === breadcrumb.length - 1 ? 500 : 400,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>{b}</span>
          </React.Fragment>
        ))}
      </div>

      {/* Demo-mode badge — this is a front-end prototype with no backend */}
      <button
        onClick={() => window.__demoNotice && window.__demoNotice()}
        title="This is a front-end demonstration. No emails are sent, no documents are dispatched, and nothing is stored — every action is simulated."
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          flexShrink: 0,
          background: 'var(--brass-bg)',
          border: '1px solid var(--brass-line)',
          borderRadius: 999,
          padding: '3px 10px',
          color: 'var(--brass)',
          fontSize: 11,
          fontWeight: 500,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brass)', animation: 'vc-pulse 1.6s infinite' }}/>
        Demo · nothing is sent or stored
      </button>

      {/* Universal search — full at desktop, collapses to icon ≤1024px */}
      <div className="topbar-search-full" style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '4px 8px',
        minWidth: 220,
        color: 'var(--text-3)',
        fontSize: 12,
      }}>
        <Icon name="search" size={12}/>
        <span style={{ flex: 1 }}>Find buyer, contact, mandate…</span>
        <span className="kbd">⌘K</span>
      </div>
      <button
        className="topbar-search-icon"
        title="Search"
        style={{
          width: 32, height: 32, borderRadius: 'var(--radius-sm)',
          background: 'var(--raised)', border: '1px solid var(--border)',
          color: 'var(--text-2)',
          alignItems: 'center', justifyContent: 'center',
        }}>
        <Icon name="search" size={14}/>
      </button>

      {right}

      <Btn
        size="sm"
        icon={theme === 'light' ? 'moon' : 'sun'}
        onClick={onThemeToggle}
        title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      >
        {theme === 'light' ? 'Dark' : 'Light'}
      </Btn>

      <Btn size="sm" variant={copilotOpen ? '' : 'ghost'} icon="sparkles" onClick={onCopilotToggle}>
        Co-pilot
      </Btn>
    </header>
  );
};

// ----- CO-PILOT PANEL (right side, persistent) -----
const Copilot = ({ open, onSelect, dismissed, onDismiss }) => {
  if (!open) return null;
  const feed = window.VC.COPILOT_FEED.filter(f => !dismissed.has(f.id));
  return (
    <aside className="app-copilot" style={{
      width: 320,
      flexShrink: 0,
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5,
          background: 'linear-gradient(135deg, var(--accent), var(--brass))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
        }}>
          <Icon name="sparkles" size={12} stroke={2}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>Co-pilot</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>
            {feed.length} item{feed.length === 1 ? '' : 's'} need your attention
          </div>
        </div>
        <Btn variant="ghost" size="sm" icon="x" onClick={() => onSelect('__close__')} title="Hide co-pilot"/>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
        {feed.length === 0 && (
          <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>✓</div>
            All clear. Nothing needs your attention right now.
          </div>
        )}
        {feed.map(f => (
          <CopilotCard key={f.id} item={f} onSelect={onSelect} onDismiss={() => onDismiss(f.id)}/>
        ))}
      </div>

      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 11, color: 'var(--text-3)',
      }}>
        <Icon name="info" size={11}/>
        Recommendations only — every send still passes through you.
      </div>
    </aside>
  );
};

const CopilotCard = ({ item, onSelect, onDismiss }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--raised)' : 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: `2px solid var(--${item.tone})`,
        borderRadius: 'var(--radius-sm)',
        padding: '10px 12px',
        marginBottom: 6,
        position: 'relative',
        transition: 'background .12s ease',
        cursor: 'pointer',
      }}
      onClick={() => onSelect(item.href)}
    >
      {item.urgent && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          width: 6, height: 6, borderRadius: '50%', background: 'var(--neg)',
          boxShadow: '0 0 0 3px rgba(219,94,92,0.18)',
          animation: 'vc-pulse 1.6s infinite',
        }}/>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 4,
          background: `var(--${item.tone}-bg)`,
          color: `var(--${item.tone})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name={item.icon} size={12}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.35, marginBottom: 2 }}>{item.title}</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginBottom: 4 }}>{item.sub}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.45, marginBottom: 8 }}>{item.detail}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{item.timeAgo}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {hover && <Btn variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDismiss(); }}>Dismiss</Btn>}
              <Btn size="sm" variant="primary" iconRight="chevron" onClick={(e) => { e.stopPropagation(); onSelect(item.href); }}>{item.cta}</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Sidebar, Topbar, Copilot, NAV_ITEMS });
