// Native mobile experience — Buyer Outreach Platform.
//
// This is a DEDICATED mobile app tree (not a responsive reflow of the desktop).
// app.jsx swaps to <MobileApp/> below 768px. Patterns are modelled on
// Supabase's mobile site: an opaque iOS-style nav bar honouring the top safe
// area, a bottom tab bar honouring the bottom safe area, full-screen drill-down
// screens with a push/pop navigation stack and slide transitions, and bottom
// sheets with a grabber handle for in-context actions. Information model mirrors
// the desktop: Today / Inbox / Pipeline / More.

const MOBILE_TABS = [
  { id: 'today',    label: 'Today',    icon: 'home' },
  { id: 'inbox',    label: 'Inbox',    icon: 'mail',  badgeKey: 'inbox' },
  { id: 'pipeline', label: 'Pipeline', icon: 'mandates' },
  { id: 'more',     label: 'More',     icon: 'grid' },
];

// =============== MOBILE ROOT ===============
const MobileApp = ({
  buyerOverrides, advanceArborfield, pushToast,
  onOpenSetup, onOpenIngest, onOpenDirectNda,
  onConfirmTriage, theme, onToggleTheme,
}) => {
  const [tab, setTab] = React.useState('today');
  const [stack, setStack] = React.useState([]); // navigation stack: array of { kind, ... }
  const [sheet, setSheet] = React.useState(null); // active bottom sheet

  const push = (screen) => setStack(s => [...s, screen]);
  const pop = () => setStack(s => s.slice(0, -1));
  const popToRoot = () => setStack([]);

  // Switching tabs always returns to that tab's root.
  const goTab = (t) => { setStack([]); setTab(t); };

  // Badges
  const replyBadge = buyerOverrides['b-arborfield']?.state && buyerOverrides['b-arborfield'].state !== 'replied' ? 0 : 1;
  const queueBadge = window.VC.EMAIL_QUEUE.length;
  const ndaBadge = window.VC.NDA_RECORDS.filter(r => r.state !== 'countersigned').length;
  const inboxBadge = replyBadge + ndaBadge;

  const top = stack[stack.length - 1];
  let content;
  if (top) {
    if (top.kind === 'mandate') {
      content = <MMandate
        mandateId={top.id}
        buyerOverrides={buyerOverrides}
        onBack={pop}
        onBuyer={b => push({ kind: 'buyer', id: b.id })}
        onTriage={() => setSheet({ kind: 'triage' })}
      />;
    } else if (top.kind === 'buyer') {
      const b = { ...window.VC.AURORA_BUYERS.find(x => x.id === top.id), ...(buyerOverrides[top.id] || {}) };
      content = <MBuyer
        buyer={b}
        onBack={pop}
        onTriage={() => setSheet({ kind: 'triage' })}
        onAdvance={() => { advanceArborfield(); }}
      />;
    } else if (top.kind === 'nda') {
      content = <MNDA record={top.record} onBack={pop}/>;
    } else if (top.kind === 'queue') {
      content = <MQueueDetail email={top.email} onBack={pop} onApprove={() => { pushToast({ title: 'Approved & queued', sub: 'Draft moved to the send queue', tone: 'pos' }); pop(); }}/>;
    }
  } else {
    if (tab === 'today')    content = <MToday buyerOverrides={buyerOverrides} onTriage={() => setSheet({ kind: 'triage' })} onAdvance={advanceArborfield} onOpenMandate={id => push({ kind: 'mandate', id })} theme={theme} onToggleTheme={onToggleTheme}/>;
    if (tab === 'inbox')    content = <MInbox replyBadge={replyBadge} queueBadge={queueBadge} ndaBadge={ndaBadge} onTriage={() => setSheet({ kind: 'triage' })} onOpenQueue={email => push({ kind: 'queue', email })} onOpenNDA={record => push({ kind: 'nda', record })}/>;
    if (tab === 'pipeline') content = <MPipeline onOpenMandate={id => push({ kind: 'mandate', id })}/>;
    if (tab === 'more')     content = <MMore onNewMandate={onOpenSetup} onIngest={onOpenIngest} onDirectNda={onOpenDirectNda} theme={theme} onToggleTheme={onToggleTheme}/>;
  }

  // Slide pushed screens in from the right; fade tab switches.
  const animKey = top ? `stack-${stack.length}` : `tab-${tab}`;
  const anim = top ? 'vc-slide-in .24s cubic-bezier(.2,.7,.2,1)' : 'vc-fade .2s ease';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontSize: 14,
      position: 'relative',
    }}>
      <div key={animKey} style={{
        flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'column',
        animation: anim,
      }}>
        {content}
      </div>

      {/* Bottom tab nav — hidden while a screen is pushed onto the stack */}
      {!top && (
        <MobileTabBar tab={tab} setTab={goTab} badges={{ inbox: inboxBadge }}/>
      )}

      {/* Sheets */}
      {sheet?.kind === 'triage' && (
        <MTriageSheet
          onClose={() => setSheet(null)}
          onConfirm={(config) => {
            setSheet(null);
            popToRoot();
            setTab('pipeline');
            push({ kind: 'mandate', id: 'aurora' });
            onConfirmTriage(config);
          }}
        />
      )}
    </div>
  );
};

// =============== TAB BAR ===============
const MobileTabBar = ({ tab, setTab, badges }) => (
  <nav style={{
    flexShrink: 0,
    background: 'var(--surface)',
    borderTop: '1px solid var(--border)',
    paddingBottom: 'env(safe-area-inset-bottom, 8px)',
    paddingTop: 8,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
  }}>
    {MOBILE_TABS.map(t => {
      const active = tab === t.id;
      const badge = badges[t.badgeKey];
      return (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          padding: '6px 4px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          color: active ? 'var(--accent-strong)' : 'var(--text-3)',
          position: 'relative',
        }}>
          <div style={{ position: 'relative' }}>
            <Icon name={t.icon} size={20} stroke={active ? 2 : 1.6}/>
            {badge > 0 && (
              <span className="mono" style={{
                position: 'absolute', top: -4, right: -8,
                minWidth: 14, height: 14, padding: '0 3px', borderRadius: 8,
                background: 'var(--neg)', color: 'white',
                fontSize: 9, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--surface)',
              }}>{badge}</span>
            )}
          </div>
          <span style={{ fontSize: 10, fontWeight: active ? 600 : 500 }}>{t.label}</span>
        </button>
      );
    })}
  </nav>
);

// =============== TOP NAV BAR ===============
// iOS-style nav bar: pinned (flex-shrink:0), opaque surface, hairline border,
// honours the top safe-area inset. A faint blur reads as the Supabase header.
const MTopBar = ({ title, eyebrow, leading, trailing }) => (
  <div style={{
    flexShrink: 0,
    paddingTop: 'env(safe-area-inset-top, 8px)',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    position: 'relative', zIndex: 10,
  }}>
    <div style={{
      padding: '10px 14px 12px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      minHeight: 48,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
        {leading}
        <div style={{ minWidth: 0 }}>
          {eyebrow && <div className="eyebrow" style={{ marginBottom: 1 }}>{eyebrow}</div>}
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </div>
        </div>
      </div>
      {trailing && <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>{trailing}</div>}
    </div>
  </div>
);

const MIconBtn = ({ icon, onClick, tone, badge }) => (
  <button onClick={onClick} style={{
    width: 34, height: 34, borderRadius: 8,
    background: tone === 'accent' ? 'var(--accent-bg-2)' : 'var(--raised)',
    color: tone === 'accent' ? 'var(--accent-strong)' : 'var(--text-2)',
    border: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  }}>
    <Icon name={icon} size={16}/>
    {badge > 0 && (
      <span className="mono" style={{
        position: 'absolute', top: -3, right: -3,
        minWidth: 14, height: 14, padding: '0 3px', borderRadius: 8,
        background: 'var(--neg)', color: 'white',
        fontSize: 9, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid var(--surface)',
      }}>{badge}</span>
    )}
  </button>
);

// =============== TODAY (overview) ===============
const MToday = ({ buyerOverrides, onTriage, onAdvance, onOpenMandate, theme, onToggleTheme }) => {
  const handled = buyerOverrides['b-arborfield']?.state && buyerOverrides['b-arborfield'].state !== 'replied';
  return (
    <>
      <MTopBar
        title={
          <img
            className="brand-logo"
            src="assets/velocity-icon-dark.png"
            alt="Buyer Outreach Platform"
            style={{ height: 26, width: 'auto', display: 'block' }}
          />
        }
        trailing={<>
          <MIconBtn icon="search"/>
          <MIconBtn
            icon={theme === 'light' ? 'moon' : 'sun'}
            onClick={onToggleTheme}
            tone="accent"
          />
        </>}
      />

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 16px 24px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 3 }}>Tuesday, 26 May</div>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Good morning, Alex</div>
        </div>

        {/* Hero co-pilot card */}
        {!handled && (
          <button onClick={onTriage} style={{
            width: '100%', textAlign: 'left',
            background: 'var(--surface)',
            border: '1px solid var(--accent-line)',
            borderRadius: 12,
            padding: 14,
            marginBottom: 14,
            position: 'relative',
            boxShadow: '0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(79,168,159,0.10)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: 'linear-gradient(135deg, var(--accent), var(--brass))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
              }}>
                <Icon name="sparkles" size={12} stroke={2}/>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-strong)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Co-pilot · needs you
              </span>
              <span style={{
                marginLeft: 'auto',
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--neg)',
                animation: 'vc-pulse 1.6s infinite',
                boxShadow: '0 0 0 4px rgba(219,94,92,0.18)',
              }}/>
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.3, marginBottom: 6 }}>
              Positive reply from James Holloway
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
              Arborfield Holdings · Project Aurora
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.45, marginBottom: 12 }}>
              Classified <b style={{ color: 'var(--pos)' }}>Positive Interest</b> with 94% confidence — explicit ask for Flyer + NDA, names Eleanor as their lead.
            </div>
            <div style={{
              padding: '10px 12px',
              background: 'var(--accent-bg-2)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 13, fontWeight: 500,
              color: 'var(--accent-strong)',
            }}>
              <span>Triage and respond</span>
              <Icon name="chevron" size={14}/>
            </div>
          </button>
        )}

        {/* Top metrics */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Portfolio · today</div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 8, marginBottom: 16,
        }}>
          <MStatCard label="Sends this week" value="187" delta="+24%" tone="pos"/>
          <MStatCard label="Reply rate" value="22.4%" sub="bench ~14%" tone="pos"/>
          <MStatCard label="NDAs signed / counter" value="27 / 19" tone="brass"/>
          <MStatCard label="Meetings booked" value="11" sub="across 4 mandates" tone="accent"/>
        </div>

        {/* Active mandates list */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div className="eyebrow">Active mandates · 4</div>
          <span style={{ fontSize: 12, color: 'var(--accent-strong)', fontWeight: 500 }}>See all</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {window.VC.MANDATES.filter(m => m.status === 'Active').map(m =>
            <MMandateRow key={m.id} m={m} onClick={() => onOpenMandate(m.id)}/>
          )}
        </div>

        {/* Secondary co-pilot items */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Other recommendations · 5</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {window.VC.COPILOT_FEED.slice(1, 5).map(c => (
            <div key={c.id} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderLeft: `2px solid var(--${c.tone})`,
              borderRadius: 10,
              padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: `var(--${c.tone}-bg)`,
                color: `var(--${c.tone})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name={c.icon} size={14}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 1 }}>{c.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{c.sub}</div>
              </div>
              <Icon name="chevron" size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }}/>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const MStatCard = ({ label, value, sub, delta, tone }) => (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '12px 12px',
  }}>
    <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
    <div className="mono" style={{
      fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em',
      color: tone === 'pos' ? 'var(--pos)' :
             tone === 'brass' ? 'var(--brass)' :
             tone === 'accent' ? 'var(--accent-strong)' : 'var(--text)',
      lineHeight: 1.1,
    }}>
      {value}
      {delta && <span style={{ fontSize: 12, fontWeight: 500, marginLeft: 4, color: 'var(--pos)' }}>{delta}</span>}
    </div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{sub}</div>}
  </div>
);

const MMandateRow = ({ m, onClick }) => {
  const responsePct = Math.round(m.response * 100);
  const hot = m.pending_replies > 0 || m.nda_chase > 0;
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: 0,
      overflow: 'hidden',
    }}>
      <div style={{ height: 2, background: `var(--${m.accent === 'neutral' ? 'text-3' : m.accent})` }}/>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em' }}>{m.code}</span>
              {hot && <span style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--neg)',
                animation: 'vc-pulse 1.6s infinite',
              }}/>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>{m.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>{m.sector}</div>
          </div>
          <Icon name="chevron" size={14} style={{ color: 'var(--text-3)', marginTop: 4, flexShrink: 0 }}/>
        </div>

        {/* Pipeline bar */}
        <div style={{
          height: 6, borderRadius: 2, overflow: 'hidden',
          background: 'var(--raised-2)', display: 'flex', gap: 1.5, marginBottom: 8,
        }}>
          <div style={{ flex: m.inflight, background: 'var(--accent)' }}/>
          {m.pending_replies > 0 && <div style={{ flex: m.pending_replies * 2, background: 'var(--warn)' }}/>}
          <div style={{ flex: m.nda_signed - m.countersigned, background: 'var(--info)' }}/>
          <div style={{ flex: m.countersigned, background: 'var(--brass)' }}/>
          <div style={{ flex: m.meetings, background: 'var(--pos)' }}/>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4, fontSize: 11,
        }}>
          <div>
            <div style={{ color: 'var(--text-3)', fontSize: 10 }}>Buyers</div>
            <div className="mono" style={{ fontWeight: 500 }}>{m.buyers}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-3)', fontSize: 10 }}>Reply</div>
            <div className="mono" style={{ fontWeight: 500, color: 'var(--pos)' }}>{responsePct}%</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-3)', fontSize: 10 }}>NDAs</div>
            <div className="mono" style={{ fontWeight: 500, color: 'var(--brass)' }}>{m.nda_signed}/{m.countersigned}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-3)', fontSize: 10 }}>Meet</div>
            <div className="mono" style={{ fontWeight: 500, color: 'var(--accent-strong)' }}>{m.meetings}</div>
          </div>
        </div>
      </div>
    </button>
  );
};

// =============== INBOX (replies + queue + NDA) ===============
const MInbox = ({ replyBadge, queueBadge, ndaBadge, onTriage, onOpenQueue, onOpenNDA }) => {
  const [sub, setSub] = React.useState('replies');
  return (
    <>
      <MTopBar
        title="Inbox"
        eyebrow="HITL checkpoints"
        trailing={<MIconBtn icon="search"/>}
      />
      <div style={{
        flexShrink: 0,
        display: 'flex', gap: 4, padding: '8px 12px',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      }}>
        {[
          ['replies', 'Replies', replyBadge, 'warn'],
          ['queue',   'Drafts',  queueBadge, 'accent'],
          ['nda',     'NDA',     ndaBadge,   'brass'],
        ].map(([id, label, badge, tone]) => {
          const active = sub === id;
          return (
            <button key={id} onClick={() => setSub(id)} style={{
              flex: 1, padding: '8px 8px',
              background: active ? `var(--${tone}-bg)` : 'var(--raised)',
              border: active ? `1px solid var(--${tone}-line)` : '1px solid var(--border)',
              borderRadius: 7,
              fontSize: 12.5, fontWeight: 500,
              color: active ? `var(--${tone})` : 'var(--text-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              {label}
              {badge > 0 && (
                <span className="mono" style={{ fontSize: 10, opacity: 0.8 }}>{badge}</span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 16px 24px' }}>
        {sub === 'replies' && replyBadge > 0 && (
          <button onClick={onTriage} style={{
            width: '100%', textAlign: 'left',
            background: 'var(--surface)',
            border: '1px solid var(--pos-line)',
            borderLeft: '3px solid var(--pos)',
            borderRadius: 10,
            padding: 14,
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Chip tone="pos">Positive Interest · 94%</Chip>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>14 min ago</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>James Holloway</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>MD · Arborfield Holdings · Project Aurora</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.4, marginBottom: 10 }}>
              "…very interested in receiving the Information Flyer and an NDA…"
            </div>
            <div style={{
              padding: '10px 10px', borderRadius: 8,
              background: 'var(--accent)',
              color: 'white',
              fontSize: 13, fontWeight: 500,
              textAlign: 'center',
            }}>
              Triage reply →
            </div>
          </button>
        )}
        {sub === 'replies' && replyBadge === 0 && (
          <EmptyState icon="check" title="Inbox zero" sub="No replies awaiting triage. The agent is watching."/>
        )}

        {sub === 'queue' && window.VC.EMAIL_QUEUE.map(q => (
          <button key={q.id} onClick={() => onOpenQueue(q)} style={{
            width: '100%', textAlign: 'left',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Chip tone={q.step === 'E1' ? 'accent' : 'info'}>{q.step}</Chip>
              <Flag code={q.country}/>
              <span style={{ fontSize: 11, color: 'var(--text-3)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {q.mandateName.replace('Project ', '')}
              </span>
              {q.flagged && <Chip tone="warn">⚠</Chip>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{q.contact}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 8 }}>{q.buyer}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 6 }}>
              {q.subject}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
              <span className="mono">{q.sendAt}</span>
              <span>Sends in {q.in}</span>
            </div>
          </button>
        ))}

        {sub === 'nda' && window.VC.NDA_RECORDS.filter(r => r.state !== 'countersigned').map(r => (
          <button key={r.id} onClick={() => onOpenNDA(r)} style={{
            width: '100%', textAlign: 'left',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderLeft: r.diff === 'material_change' ? '3px solid var(--neg)' : '3px solid var(--brass)',
            borderRadius: 10,
            padding: 12,
            marginBottom: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Chip tone={r.path === 'electronic' ? 'info' : r.path === 'wetink' ? 'brass' : 'warn'}>
                {r.path === 'electronic' ? 'DocuSign' : r.path === 'wetink' ? 'Wet-ink' : 'Redline'}
              </Chip>
              {r.diff === 'material_change' && <Chip tone="neg">Material change</Chip>}
              {r.diff === 'clean' && r.state === 'awaiting_counter' && <Chip tone="pos">Diff clean</Chip>}
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>Day {r.daysOpen}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{r.buyer}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{r.mandate} · {r.envelopeId}</div>
          </button>
        ))}
      </div>
    </>
  );
};

const EmptyState = ({ icon, title, sub }) => (
  <div style={{
    padding: 60, textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      background: 'var(--pos-bg)', color: 'var(--pos)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 4,
    }}>
      <Icon name={icon} size={22} stroke={2}/>
    </div>
    <div style={{ fontSize: 15, fontWeight: 500 }}>{title}</div>
    <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{sub}</div>
  </div>
);

// =============== PIPELINE (mandate list) ===============
const MPipeline = ({ onOpenMandate }) => (
  <>
    <MTopBar
      title="Pipeline"
      eyebrow="5 mandates · 159 buyers"
      trailing={<MIconBtn icon="plus"/>}
    />
    <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 16px 24px' }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Active · 4</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {window.VC.MANDATES.filter(m => m.status === 'Active').map(m =>
          <MMandateRow key={m.id} m={m} onClick={() => onOpenMandate(m.id)}/>
        )}
      </div>
      <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>On hold · 1</div>
      {window.VC.MANDATES.filter(m => m.status !== 'Active').map(m =>
        <MMandateRow key={m.id} m={m} onClick={() => onOpenMandate(m.id)}/>
      )}
    </div>
  </>
);

// =============== MANDATE DETAIL ===============
const MMandate = ({ mandateId, buyerOverrides, onBack, onBuyer, onTriage }) => {
  const m = window.VC.MANDATES.find(x => x.id === mandateId);
  const isAurora = m.id === 'aurora';
  const buyersRaw = isAurora ? window.VC.AURORA_BUYERS : window.VC.AURORA_BUYERS.slice(0, 6);
  const merged = buyersRaw.map(b => ({ ...b, ...(buyerOverrides[b.id] || {}) }));
  const [filter, setFilter] = React.useState('all');

  const stateOrder = ['interested_y', 'meeting_req', 'ready', 'nda_signed_b', 'replied', 'flyer_sent', 'in_sequence', 'verified', 'enriched', 'identified', 'stalled', 'bounced', 'on_hold', 'opted_out'];
  const sorted = [...merged].sort((a, b) => {
    if (a.interested === true && b.interested !== true) return -1;
    if (b.interested === true && a.interested !== true) return 1;
    if (a.state === 'replied' && b.state !== 'replied') return -1;
    if (b.state === 'replied' && a.state !== 'replied') return 1;
    return stateOrder.indexOf(a.state) - stateOrder.indexOf(b.state);
  });

  const filtered = filter === 'all' ? sorted :
                   filter === 'hot' ? sorted.filter(b => b.state === 'replied' || b.state === 'nda_signed_b' || b.interested === true) :
                   filter === 'sequence' ? sorted.filter(b => b.state === 'in_sequence' || b.state === 'flyer_sent') :
                   sorted;

  return (
    <>
      <MTopBar
        eyebrow={m.code}
        title={m.name}
        leading={<MIconBtn icon="chevronLeft" onClick={onBack}/>}
        trailing={<><MIconBtn icon="upload"/><MIconBtn icon="settings"/></>}
      />

      <div style={{
        flexShrink: 0,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '12px 16px',
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 10 }}>
          {m.sector} · {m.rev} rev · {m.ebitda} EBITDA
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <MMiniStat label="Buyers" value={m.buyers}/>
          <MMiniStat label="Reply" value={`${Math.round(m.response * 100)}%`} tone="pos"/>
          <MMiniStat label="NDAs" value={`${m.nda_signed}/${m.countersigned}`} tone="brass"/>
          <MMiniStat label="Meet" value={m.meetings} tone="accent"/>
        </div>
      </div>

      <div style={{
        flexShrink: 0,
        display: 'flex', gap: 6, padding: '8px 12px', overflowX: 'auto',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      }}>
        {[
          ['all', 'All', merged.length],
          ['hot', 'Needs you', merged.filter(b => b.state === 'replied' || b.state === 'nda_signed_b' || b.interested === true).length],
          ['sequence', 'In sequence', merged.filter(b => b.state === 'in_sequence' || b.state === 'flyer_sent').length],
        ].map(([k, l, c]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: '6px 12px',
            background: filter === k ? 'var(--accent-bg-2)' : 'var(--raised)',
            border: filter === k ? '1px solid var(--accent-line)' : '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 12, fontWeight: 500,
            color: filter === k ? 'var(--accent-strong)' : 'var(--text-2)',
            whiteSpace: 'nowrap',
            display: 'flex', gap: 4, alignItems: 'center',
          }}>
            {l}
            <span className="mono" style={{ fontSize: 10, opacity: 0.7 }}>{c}</span>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 16px 24px' }}>
        {filtered.map(b => <MBuyerRow key={b.id} b={b} onClick={() => onBuyer(b)}/>)}
      </div>
    </>
  );
};

const MMiniStat = ({ label, value, tone }) => (
  <div>
    <div style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
    <div className="mono" style={{
      fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em',
      color: tone === 'pos' ? 'var(--pos)' :
             tone === 'brass' ? 'var(--brass)' :
             tone === 'accent' ? 'var(--accent-strong)' : 'var(--text)',
    }}>{value}</div>
  </div>
);

const MBuyerRow = ({ b, onClick }) => {
  const hot = b.state === 'replied';
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderLeft: hot ? '3px solid var(--neg)' : b.interested ? '3px solid var(--pos)' : '1px solid var(--border)',
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 5,
          background: 'var(--raised-2)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, color: 'var(--text-2)',
          fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}>
          {b.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</span>
            <Flag code={b.country} size={11}/>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>
            {b.type} · {b.revenue}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <StateChip state={b.state} pulse={hot}/>
            {b.direct_nda && <Chip tone="brass">Direct NDA</Chip>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.35 }}>
            {b.last}
          </div>
        </div>
        <Icon name="chevron" size={13} style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 4 }}/>
      </div>
    </button>
  );
};

// =============== BUYER DETAIL ===============
const MBuyer = ({ buyer, onBack, onTriage, onAdvance }) => {
  const [tab, setTab] = React.useState('contacts');
  const isArbor = buyer.id === 'b-arborfield';
  const contacts = isArbor ? window.VC.ARBORFIELD_CONTACTS : [];

  return (
    <>
      <MTopBar
        eyebrow={buyer.type + ' · ' + buyer.country}
        title={buyer.name}
        leading={<MIconBtn icon="chevronLeft" onClick={onBack}/>}
        trailing={<MIconBtn icon="pause"/>}
      />

      <div style={{
        flexShrink: 0,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '12px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <StateChip state={buyer.state}/>
          {buyer.direct_nda && <Chip tone="brass">Direct NDA</Chip>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>{buyer.last}</div>

        {(buyer.state === 'replied') && (
          <button onClick={onTriage} style={{
            width: '100%', padding: 13, borderRadius: 9,
            background: 'var(--accent)', color: 'white',
            fontWeight: 500, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginBottom: 6,
          }}>
            <Icon name="reply" size={14}/>
            Triage reply
          </button>
        )}
        {['flyer_sent', 'nda_signed_b', 'ready', 'meeting_req'].includes(buyer.state) && (
          <button onClick={onAdvance} style={{
            width: '100%', padding: 13, borderRadius: 9,
            background: 'var(--accent)', color: 'white',
            fontWeight: 500, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon name="arrow" size={13}/>
            Advance to next stage (demo)
          </button>
        )}
      </div>

      <div style={{
        flexShrink: 0,
        display: 'flex', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        {[
          ['contacts', 'Contacts'],
          ['enrichment', 'Enrich.'],
          ['nda', 'NDA'],
          ['audit', 'Audit'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '12px 4px',
            fontSize: 12, fontWeight: 500,
            color: tab === id ? 'var(--text)' : 'var(--text-2)',
            borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -1,
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 16px 24px' }}>
        {tab === 'contacts' && contacts.length > 0 && contacts.map(c => <MContactCard key={c.rank} c={c}/>)}
        {tab === 'contacts' && contacts.length === 0 && (
          <div style={{ padding: 20, fontSize: 12.5, color: 'var(--text-2)', textAlign: 'center' }}>
            {buyer.contacts} contact{buyer.contacts > 1 ? 's' : ''} · {buyer.primary}
          </div>
        )}
        {tab === 'enrichment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SmallStat k="LinkedIn URL discovery" v="5/5"/>
            <SmallStat k="RocketReach" v="4 emails · 3 phones"/>
            <SmallStat k="Apollo" v="5 emails · 4 phones"/>
            <SmallStat k="Hunter (gap-fill)" v="2 emails"/>
            <SmallStat k="Conflicts retained" v="1 email · Eleanor" tone="warn"/>
          </div>
        )}
        {tab === 'nda' && (
          <EmptyState icon="nda" title="No NDA on file yet" sub="Unlocks after positive reply"/>
        )}
        {tab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['24 May 11:32', 'Inbound reply', 'Classified Positive Interest 94%'],
              ['19 May 09:11', 'E3 dispatched · James Holloway', 'Edited by Alex'],
              ['17 May 09:02', 'E2 dispatched · Eleanor', 'Approved 16 May 17:22'],
              ['13 May 14:10', 'Persona ranking confirmed', '5 contacts ranked'],
            ].map(([t, e, b], i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 8, padding: 10,
              }}>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginBottom: 2 }}>{t}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{e}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{b}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const MContactCard = ({ c }) => (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderLeft: c.state === 'replied' ? '3px solid var(--pos)' : '1px solid var(--border)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
      <Avatar initials={c.avatar} size={34} tone={c.state === 'replied' ? 'pos' : 'neutral'}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>#{c.rank}</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{c.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 2, wordBreak: 'break-all' }}>
          {c.email || 'No verified email'}
        </div>
      </div>
      <StateChip state={c.state} pulse={c.state === 'replied'}/>
    </div>
    {c.sequence.length > 0 && (
      <div style={{ display: 'flex', gap: 4 }}>
        {c.sequence.map((s, i) => {
          const tone = s.status === 'replied' ? 'pos' :
                       s.status === 'opened' ? 'accent' :
                       s.status === 'delivered' ? 'info' :
                       'neutral';
          return (
            <div key={i} style={{
              flex: 1, padding: '6px 4px',
              background: tone === 'neutral' ? 'var(--raised)' : `var(--${tone}-bg)`,
              border: `1px solid ${tone === 'neutral' ? 'var(--border)' : `var(--${tone}-line)`}`,
              borderRadius: 5,
              textAlign: 'center',
              opacity: s.status === 'pending' || s.status === 'cancelled' ? 0.4 : 1,
            }}>
              <div className="mono" style={{ fontSize: 10, fontWeight: 600, color: tone === 'neutral' ? 'var(--text-2)' : `var(--${tone})` }}>
                {s.e}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {s.status.slice(0, 6)}
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const SmallStat = ({ k, v, tone }) => (
  <div style={{
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '10px 12px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  }}>
    <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{k}</span>
    <span className="mono" style={{
      fontSize: 12.5, fontWeight: 500,
      color: tone === 'warn' ? 'var(--warn)' : tone === 'pos' ? 'var(--pos)' : 'var(--text)',
    }}>{v}</span>
  </div>
);

// =============== NDA detail ===============
const MNDA = ({ record, onBack }) => (
  <>
    <MTopBar
      eyebrow={record.mandate}
      title={record.buyer}
      leading={<MIconBtn icon="chevronLeft" onClick={onBack}/>}
    />
    <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 16px 24px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <Chip tone={record.path === 'electronic' ? 'info' : record.path === 'wetink' ? 'brass' : 'warn'}>
          {record.path === 'electronic' ? 'DocuSign' : record.path === 'wetink' ? 'Wet-ink' : 'Word redline'}
        </Chip>
        <Chip tone={record.diff === 'clean' ? 'pos' : 'neg'}>
          {record.diff === 'clean' ? 'Diff clean' : 'Material change'}
        </Chip>
        <Chip tone="neutral">Day {record.daysOpen}</Chip>
      </div>

      <div className="eyebrow" style={{ marginBottom: 10 }}>Envelope status</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
        {[
          { label: 'NDA dispatched', done: true, icon: 'send', time: '20 May 11:04' },
          { label: record.path === 'electronic' ? 'Buyer signed in DocuSign' : record.path === 'wetink' ? 'Wet-ink PDF uploaded' : 'Buyer returned redlined Word', done: true, icon: record.path === 'electronic' ? 'docusign' : record.path === 'wetink' ? 'wetink' : 'redline', time: '21 May 09:38' },
          { label: 'Diff vs original template', done: true, icon: 'diff', time: '21 May 09:39', alert: record.diff === 'material_change' },
          record.diff === 'material_change'
            ? { label: 'Legal review', done: false, current: true, icon: 'handoff', time: 'Awaiting' }
            : { label: 'Authoriser countersign', done: record.state === 'countersigned', current: record.state === 'awaiting_counter', icon: 'handoff', time: record.state === 'countersigned' ? record.counterAt : 'Awaiting · Day ' + record.daysOpen },
        ].map((step, i, arr) => (
          <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            <div style={{ width: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: step.alert ? 'var(--neg-bg)' : step.done ? 'var(--pos-bg)' : step.current ? 'var(--brass-bg)' : 'var(--raised-2)',
                color: step.alert ? 'var(--neg)' : step.done ? 'var(--pos)' : step.current ? 'var(--brass)' : 'var(--text-3)',
                border: `1.5px solid ${step.alert ? 'var(--neg-line)' : step.done ? 'var(--pos-line)' : step.current ? 'var(--brass-line)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: step.current ? 'vc-pulse 1.6s infinite' : 'none',
              }}>
                <Icon name={step.icon} size={12}/>
              </div>
              {i < arr.length - 1 && <div style={{ flex: 1, width: 1, background: 'var(--border)', minHeight: 32 }}/>}
            </div>
            <div style={{ flex: 1, paddingBottom: 14, paddingTop: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: step.alert ? 'var(--neg)' : step.current ? 'var(--brass)' : 'var(--text)' }}>
                {step.label}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{step.time}</div>
            </div>
          </div>
        ))}
      </div>

      {record.state === 'awaiting_counter' && record.diff === 'clean' && (
        <button onClick={() => window.__demoNotice && window.__demoNotice('Send DocuSign reminder')} style={{
          width: '100%', padding: 14, borderRadius: 9,
          background: 'var(--accent)', color: 'white',
          fontWeight: 500, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Icon name="bell" size={14}/>
          Send DocuSign reminder to {record.authoriser}
        </button>
      )}
      {record.diff === 'material_change' && (
        <button onClick={() => window.__demoNotice && window.__demoNotice('Hand off to legal review')} style={{
          width: '100%', padding: 14, borderRadius: 9,
          background: 'var(--neg)', color: 'white',
          fontWeight: 500, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Icon name="handoff" size={14}/>
          Hand off to legal review
        </button>
      )}
    </div>
  </>
);

// =============== QUEUE detail ===============
const MQueueDetail = ({ email, onBack, onApprove }) => {
  const body = `${email.contact.split(' ')[0]} —

Following up on my note from earlier this week. The vendor is a profitable specialty foods business; revenue ~NZ$42m and EBITDA margins above 19%. The Information Flyer and NDA are ready for your team's review when you'd like to take a closer look.

Happy to send across, or to step through the strategic rationale in a 15-minute call.

Best,
Alex Morgan`;

  return (
    <>
      <MTopBar
        eyebrow={email.step + ' · ' + email.mandateName.replace('Project ', '')}
        title={email.contact}
        leading={<MIconBtn icon="chevronLeft" onClick={onBack}/>}
        trailing={<MIconBtn icon="pen"/>}
      />
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{
          padding: '14px 16px',
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          fontSize: 12,
        }}>
          <div style={{ marginBottom: 6, color: 'var(--text-3)' }}>To</div>
          <div className="mono" style={{ marginBottom: 8, wordBreak: 'break-all' }}>{email.contact.split(' ').join('.').toLowerCase()}@{email.buyer.toLowerCase().replace(/[^a-z]/g, '')}.com</div>
          <div style={{ marginBottom: 6, color: 'var(--text-3)' }}>Subject</div>
          <div style={{ fontWeight: 500 }}>{email.subject}</div>
        </div>
        {email.flagged && (
          <div style={{
            margin: '12px 16px',
            padding: '10px 12px',
            background: 'var(--warn-bg)',
            border: '1px solid var(--warn-line)',
            borderLeft: '3px solid var(--warn)',
            borderRadius: 8,
            fontSize: 12, color: 'var(--text-2)',
          }}>
            <b>{email.flagReason}</b>
            <div style={{ marginTop: 4 }}>Agent suggests sending anyway, per spec §5.6.</div>
          </div>
        )}
        <div style={{
          padding: '16px 18px',
          fontSize: 13, lineHeight: 1.55, color: 'var(--text)',
          whiteSpace: 'pre-wrap',
          fontFamily: 'var(--font-sans)',
        }}>
          {body}
        </div>
        <div style={{
          padding: '10px 16px', background: 'var(--raised)',
          fontSize: 10.5, color: 'var(--text-3)',
          borderTop: '1px solid var(--border)',
        }}>
          Compliance footer ON · NZ UEM Act 2007
        </div>
      </div>
      <div style={{
        flexShrink: 0, padding: '12px 16px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8,
      }}>
        <button onClick={onBack} style={{
          flex: 1, padding: 14, borderRadius: 9,
          background: 'var(--raised)', border: '1px solid var(--border)',
          fontWeight: 500, fontSize: 13, color: 'var(--text-2)',
        }}>Hold</button>
        <button onClick={onApprove} style={{
          flex: 2, padding: 14, borderRadius: 9,
          background: 'var(--accent)', color: 'white',
          fontWeight: 500, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Icon name="check" size={14} stroke={2.5}/>
          Approve & queue
        </button>
      </div>
    </>
  );
};

// =============== TRIAGE (bottom sheet) ===============
const MTriageSheet = ({ onClose, onConfirm }) => {
  const reply = window.VC.HERO_REPLY;
  const [bucket, setBucket] = React.useState(reply.classification.bucket);
  const [sendNda, setSendNda] = React.useState(true);
  const [ndaMode, setNdaMode] = React.useState('prefill');

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'vc-fade .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)',
        borderTopLeftRadius: 18, borderTopRightRadius: 18,
        maxHeight: '92%',
        display: 'flex', flexDirection: 'column',
        animation: 'vc-sheet-up .26s cubic-bezier(.2,.7,.2,1)',
        boxShadow: '0 -8px 30px rgba(0,0,0,0.4)',
      }}>
        {/* Grabber handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border-strong)' }}/>
        </div>

        <div style={{
          padding: '8px 16px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        }}>
          <div>
            <div className="eyebrow">Reply triage</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>James Holloway</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Arborfield · Project Aurora · 14 min ago</div>
          </div>
          <button onClick={onClose} style={{ padding: 8, color: 'var(--text-3)' }}>
            <Icon name="x" size={16}/>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 16px' }}>
          <div style={{
            background: 'var(--raised)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--pos)',
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 12.5, lineHeight: 1.5,
            color: 'var(--text-2)',
            marginBottom: 14,
          }}>
            "…very interested in receiving the Information Flyer and an NDA at your earliest convenience.
            <b style={{ color: 'var(--text)' }}> Eleanor Whitmore (our Head of M&A, copied) will lead from our side</b>.
            Please send the documentation through and we can confirm a 30-minute introductory call within the next ten days."
          </div>

          <div style={{
            padding: '10px 12px',
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent-line)',
            borderLeft: '3px solid var(--accent)',
            borderRadius: 8,
            fontSize: 12.5,
            color: 'var(--text-2)',
            marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Icon name="sparkles" size={13} style={{ color: 'var(--accent)', flexShrink: 0 }}/>
            <span>Co-pilot · <b style={{ color: 'var(--pos)' }}>Positive Interest</b> · 94% confidence</span>
          </div>

          <div className="eyebrow" style={{ marginBottom: 8 }}>Classification</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
            {window.VC.REPLY_BUCKETS.map(b => {
              const active = bucket === b.id;
              const isPrimary = b.id === reply.classification.bucket;
              return (
                <button key={b.id} onClick={() => setBucket(b.id)} style={{
                  padding: '10px 12px',
                  borderRadius: 8, textAlign: 'left',
                  background: active ? `var(--${b.tone}-bg)` : 'var(--raised)',
                  border: active ? `1.5px solid var(--${b.tone}-line)` : '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: active ? `5px solid var(--${b.tone})` : '1.5px solid var(--border-strong)',
                    background: 'var(--bg)',
                    flexShrink: 0,
                  }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: active ? `var(--${b.tone})` : 'var(--text)' }}>{b.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.desc}</div>
                  </div>
                  {isPrimary && <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.04em' }}>REC</span>}
                </button>
              );
            })}
          </div>

          <div style={{
            padding: '12px',
            background: 'var(--surface)',
            border: '1px solid var(--brass-line)',
            borderLeft: '3px solid var(--brass)',
            borderRadius: 10,
            marginBottom: 12,
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <input type="checkbox" checked={sendNda} onChange={e => setSendNda(e.target.checked)} style={{ width: 18, height: 18 }}/>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Send Flyer + NDA now</span>
            </label>
            <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginLeft: 28, marginBottom: 10 }}>
              James explicitly asked. Email queues with tracked links.
            </div>
            {sendNda && (
              <div style={{ marginLeft: 28, display: 'flex', gap: 6 }}>
                <button onClick={() => setNdaMode('blank')} style={{
                  flex: 1, padding: '9px 6px', borderRadius: 7,
                  background: ndaMode === 'blank' ? 'var(--brass-bg)' : 'var(--raised)',
                  border: ndaMode === 'blank' ? '1.5px solid var(--brass-line)' : '1px solid var(--border)',
                  fontSize: 12, fontWeight: 500,
                  color: ndaMode === 'blank' ? 'var(--brass)' : 'var(--text-2)',
                }}>
                  Blank
                </button>
                <button onClick={() => setNdaMode('prefill')} style={{
                  flex: 1, padding: '9px 6px', borderRadius: 7,
                  background: ndaMode === 'prefill' ? 'var(--brass-bg)' : 'var(--raised)',
                  border: ndaMode === 'prefill' ? '1.5px solid var(--brass-line)' : '1px solid var(--border)',
                  fontSize: 12, fontWeight: 500,
                  color: ndaMode === 'prefill' ? 'var(--brass)' : 'var(--text-2)',
                }}>
                  Pre-fill entity
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{
          flexShrink: 0, padding: '12px 16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
        }}>
          <button onClick={() => onConfirm({ bucket, sendNda, ndaMode, resumeMode: 'cadence' })} style={{
            width: '100%', padding: 15, borderRadius: 10,
            background: 'var(--accent)', color: 'white',
            fontWeight: 500, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon name="check" size={14} stroke={2.5}/>
            Confirm & send NDA
          </button>
        </div>
      </div>
    </div>
  );
};

// =============== MORE ===============
const MMore = ({ onNewMandate, onIngest, onDirectNda, theme, onToggleTheme }) => (
  <>
    <MTopBar title="More" eyebrow="Workspace"/>
    <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '14px 16px 24px' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: 12, marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Avatar initials="AM" size={42} tone="brass"/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Alex Morgan</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Lead advisor</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>alex@example.com</div>
        </div>
        <Icon name="chevron" size={13} style={{ color: 'var(--text-3)' }}/>
      </div>

      <div className="eyebrow" style={{ marginBottom: 8 }}>Create</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
        <MoreRow icon="plus" label="New mandate" sub="Setup form · ~10 min" onClick={onNewMandate}/>
        <MoreRow icon="upload" label="Import buyers" sub="comparables.ai XLSX · fuzzy join" onClick={onIngest}/>
        <MoreRow icon="send" label="Direct-NDA shortcut" sub="Skip the 4-touch · known buyer" onClick={onDirectNda} tone="brass"/>
      </div>

      <div className="eyebrow" style={{ marginBottom: 8 }}>Appearance</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
        <MoreRow
          icon={theme === 'light' ? 'moon' : 'sun'}
          label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          sub={`Currently ${theme === 'light' ? 'light' : 'dark'}`}
          onClick={onToggleTheme}
        />
      </div>

      <div className="eyebrow" style={{ marginBottom: 8 }}>Integrations</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
        <MoreRow icon="docusign" label="DocuSign" sub="Connected · 23 envelopes / 30d" status="ok"/>
        <MoreRow icon="mail" label="Apollo · sending mailbox" sub="outreach@example.com" status="ok"/>
        <MoreRow icon="file" label="OneDrive" sub="/VC-Mandates · 4 active folders" status="ok"/>
        <MoreRow icon="calendar" label="Microsoft Bookings" sub="Connected · 30-min default"/>
        <MoreRow icon="users" label="HubSpot CRM" sub="Toggle off · awaiting stand-up" status="off"/>
      </div>

      <div className="eyebrow" style={{ marginBottom: 8 }}>Workspace</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
        <MoreRow icon="users" label="Team & permissions" sub="1 admin · multi-user ready"/>
        <MoreRow icon="file" label="Audit trail" sub="7-yr retention · 5 layers"/>
        <MoreRow icon="settings" label="Settings"/>
      </div>

      <div style={{
        marginTop: 16, padding: 12,
        background: 'var(--raised)', border: '1px solid var(--border)',
        borderRadius: 8,
        fontSize: 11, color: 'var(--text-3)',
        lineHeight: 1.4,
      }}>
        Buyer Outreach Platform — front-end demonstration.<br/>
        No backend connected; every action is simulated.
      </div>
    </div>
  </>
);

const MoreRow = ({ icon, label, sub, tone, status, onClick }) => (
  <button onClick={onClick || (() => window.__demoNotice && window.__demoNotice(label))} style={{
    width: '100%', textAlign: 'left',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 9, padding: '11px 12px',
    display: 'flex', alignItems: 'center', gap: 12,
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 7,
      background: tone === 'brass' ? 'var(--brass-bg)' : 'var(--raised)',
      color: tone === 'brass' ? 'var(--brass)' : 'var(--text-2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={icon} size={15}/>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{sub}</div>}
    </div>
    {status === 'ok' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--pos)' }}/>}
    {status === 'off' && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-3)' }}/>}
    {!status && <Icon name="chevron" size={13} style={{ color: 'var(--text-3)' }}/>}
  </button>
);

Object.assign(window, { MobileApp });
