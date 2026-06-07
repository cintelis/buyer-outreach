// Multi-mandate overview (home).
// Quick portfolio glance + per-mandate cards.

const Overview = ({ goto }) => {
  const mandates = window.VC.MANDATES;
  const active = mandates.filter(m => m.status === 'Active');
  const totalBuyers = mandates.reduce((s, m) => s + m.buyers, 0);
  const totalSent = mandates.reduce((s, m) => s + m.sent, 0);
  const totalNda = mandates.reduce((s, m) => s + m.nda_signed, 0);
  const totalCounter = mandates.reduce((s, m) => s + m.countersigned, 0);
  const totalMeetings = mandates.reduce((s, m) => s + m.meetings, 0);
  const totalReplies = mandates.reduce((s, m) => s + m.pending_replies, 0);
  const totalReview = mandates.reduce((s, m) => s + m.pending_review, 0);

  return (
    <div className="page">
      <SectionHeader
        eyebrow="Tuesday, 26 May 2026"
        title={<span>Good morning, Alex <span className="serif" style={{ fontStyle: 'italic', color: 'var(--text-2)', fontWeight: 400 }}>—</span> <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>here's where things stand.</span></span>}
        right={
          <>
            <Btn size="sm" icon="grid">All views</Btn>
            <Btn size="sm" icon="download">Export weekly</Btn>
          </>
        }
      />

      {/* Top KPI strip */}
      <div className="stats-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 0,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '14px 0',
        marginBottom: 24,
      }}>
        <div style={{ padding: '0 18px', borderRight: '1px solid var(--border)' }}>
          <Stat label="Active mandates" value={active.length} big sub={`${mandates.length - active.length} on hold or closed`}/>
        </div>
        <div style={{ padding: '0 18px', borderRight: '1px solid var(--border)' }}>
          <Stat label="Buyers in flight" value={totalBuyers} big sub={`across all active`}/>
        </div>
        <div style={{ padding: '0 18px', borderRight: '1px solid var(--border)' }}>
          <Stat label="Sends this week" value="187" big delta="+24%" sub="vs trailing 4-week"/>
        </div>
        <div style={{ padding: '0 18px', borderRight: '1px solid var(--border)' }}>
          <Stat label="Reply rate" value="22.4%" big tone="pos" sub="bench ~14% for cold M&A"/>
        </div>
        <div style={{ padding: '0 18px', borderRight: '1px solid var(--border)' }}>
          <Stat label="NDAs signed" value={`${totalNda} / ${totalCounter}`} big tone="brass" sub="buyer / fully countersigned"/>
        </div>
        <div style={{ padding: '0 18px', borderRight: '1px solid var(--border)' }}>
          <Stat label="Meetings booked" value={totalMeetings} big tone="accent" sub="across all mandates"/>
        </div>
        <div style={{ padding: '0 18px' }}>
          <Stat label="Needs you" value={totalReplies + totalReview} big tone="warn" sub={`${totalReplies} replies · ${totalReview} drafts`}/>
        </div>
      </div>

      {/* Mandate cards */}
      <SectionHeader
        title="Active mandates"
        sub={`${active.length} live processes`}
        right={
          <>
            <Btn size="sm" icon="sliders">Filter</Btn>
            <Btn size="sm" variant="primary" icon="plus">New mandate</Btn>
          </>
        }
      />

      <div className="mandate-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {active.map(m => <MandateCard key={m.id} m={m} goto={goto}/>)}
      </div>

      {/* On Hold / closed */}
      <div style={{ marginTop: 32 }}>
        <SectionHeader title="On hold" sub="Paused processes, resumable"/>
        <div className="mandate-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {mandates.filter(m => m.status !== 'Active').map(m => <MandateCard key={m.id} m={m} goto={goto}/>)}
        </div>
      </div>
    </div>
  );
};

const MandateCard = ({ m, goto }) => {
  const [hover, setHover] = React.useState(false);
  const responsePct = Math.round(m.response * 100);
  const onHold = m.status !== 'Active';
  return (
    <button
      onClick={() => goto('mandate-' + m.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 0,
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: hover ? 'var(--shadow-2)' : 'var(--shadow-1)',
        transition: 'box-shadow .15s ease, transform .15s ease, border-color .15s ease',
        borderColor: hover ? 'var(--border-strong)' : 'var(--border)',
        overflow: 'hidden',
        opacity: onHold ? 0.78 : 1,
      }}
    >
      {/* Top stripe */}
      <div style={{
        height: 3, background: `var(--${m.accent === 'neutral' ? 'border-strong' : m.accent})`,
      }}/>

      <div style={{ padding: '14px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.04em' }}>{m.code}</span>
              {onHold && <Chip tone="neutral">{m.status}</Chip>}
              {(m.pending_replies > 0 || m.nda_chase > 0) && !onHold && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 10.5, color: 'var(--neg)', fontWeight: 500,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%', background: 'var(--neg)',
                    animation: 'vc-pulse 1.6s infinite',
                  }}/>
                  {m.pending_replies > 0 && `${m.pending_replies} reply${m.pending_replies > 1 ? 'ies' : ''}`}
                  {m.pending_replies > 0 && m.nda_chase > 0 && ' · '}
                  {m.nda_chase > 0 && `${m.nda_chase} NDA stale`}
                </span>
              )}
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>{m.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 2 }}>
              {m.sector} · {m.rev} rev · {m.ebitda} EBITDA
            </div>
          </div>
          <Icon name="chevron" size={14} style={{ color: 'var(--text-3)' }}/>
        </div>

        {/* Pipeline visualization */}
        <PipelineBar m={m}/>

        {/* Metric strip */}
        <div className="mandate-metrics" style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 8, paddingTop: 12, marginTop: 10,
          borderTop: '1px solid var(--hairline)',
        }}>
          <MiniMetric label="Buyers" value={m.buyers}/>
          <MiniMetric label="Sent" value={m.sent}/>
          <MiniMetric label="Reply" value={`${responsePct}%`} tone={responsePct > 20 ? 'pos' : 'neutral'}/>
          <MiniMetric label="NDAs" value={`${m.nda_signed}/${m.countersigned}`} tone="brass"/>
          <div className="mandate-meet">
            <MiniMetric label="Meetings" value={m.meetings} tone={m.meetings > 0 ? 'accent' : 'neutral'}/>
          </div>
        </div>

        <div style={{
          marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--hairline)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 11, color: 'var(--text-3)',
        }}>
          <span>Lead: {m.advisor}</span>
          <span>Last activity {m.last_activity}</span>
        </div>
      </div>
    </button>
  );
};

const MiniMetric = ({ label, value, tone }) => (
  <div>
    <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.02em', marginBottom: 1 }}>{label}</div>
    <div className="mono" style={{
      fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.01em',
      color: tone === 'pos' ? 'var(--pos)' :
             tone === 'brass' ? 'var(--brass)' :
             tone === 'accent' ? 'var(--accent-strong)' :
             'var(--text)',
    }}>{value}</div>
  </div>
);

// Stacked pipeline bar — visual breakdown of buyer state distribution
const PipelineBar = ({ m }) => {
  // Synthesize a pipeline distribution from totals
  // identified -> sequence -> replied -> nda_buyer -> ready -> meeting -> interested
  const total = m.buyers;
  if (total === 0) return null;
  const segments = [
    { state: 'in_sequence',  count: m.inflight,                                tone: 'accent', label: 'In sequence' },
    { state: 'replied',      count: m.pending_replies,                         tone: 'warn',   label: 'Replies pending' },
    { state: 'flyer_sent',   count: Math.max(0, m.nda_signed - m.countersigned + 2), tone: 'info', label: 'Flyer / NDA sent' },
    { state: 'nda_signed_b', count: Math.max(0, m.nda_signed - m.countersigned), tone: 'brass', label: 'NDA — buyer signed' },
    { state: 'ready',        count: m.countersigned - m.meetings,              tone: 'pos',    label: 'Ready' },
    { state: 'meeting',      count: m.meetings,                                tone: 'pos',    label: 'Meetings' },
    { state: 'stalled',      count: m.stalled,                                 tone: 'warn',   label: 'Stalled' },
  ].filter(s => s.count > 0);

  const summed = segments.reduce((s, x) => s + x.count, 0);
  const remainder = total - summed;
  if (remainder > 0) segments.unshift({ state: 'identified', count: remainder, tone: 'neutral', label: 'Identified / enriching' });

  return (
    <div>
      <div style={{
        display: 'flex', height: 8, borderRadius: 2, overflow: 'hidden',
        background: 'var(--raised-2)', gap: 1.5,
      }}>
        {segments.map((s, i) => (
          <div key={i}
            title={`${s.label}: ${s.count}`}
            style={{
              width: `${(s.count / total) * 100}%`,
              background: `var(--${s.tone === 'neutral' ? 'border-strong' : s.tone})`,
              opacity: s.tone === 'neutral' ? 0.45 : 1,
            }}/>
        ))}
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '4px 12px',
        marginTop: 8, fontSize: 10.5, color: 'var(--text-3)',
      }}>
        {segments.slice(0, 5).map((s, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 6, height: 6, borderRadius: 1,
              background: `var(--${s.tone === 'neutral' ? 'border-strong' : s.tone})`,
              opacity: s.tone === 'neutral' ? 0.45 : 1,
            }}/>
            {s.label} <span className="mono" style={{ color: 'var(--text-2)' }}>{s.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { Overview });
