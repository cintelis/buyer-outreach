// Per-mandate dashboard — the buyer pipeline table + drill-down drawer.
// Dense Bloomberg-style table. Sortable. Auto-sorts Interested=Yes to top.

const Mandate = ({ mandateId, openBuyer, openTriage, openNDA, openIngest, openEnrichment, openDirectNda, advanceBuyer, buyerOverrides }) => {
  const m = window.VC.MANDATES.find(x => x.id === mandateId) || window.VC.MANDATES[0];
  // Hero mandate (aurora) uses the deep buyer list; others get synthetic
  const isAurora = m.id === 'aurora';
  const buyers = isAurora ? window.VC.AURORA_BUYERS : syntheticBuyers(m);

  const [filter, setFilter] = React.useState('all');
  const [stateFilter, setStateFilter] = React.useState(null);
  const [search, setSearch] = React.useState('');

  // Apply overrides
  const merged = buyers.map(b => {
    const o = buyerOverrides[b.id];
    return o ? { ...b, ...o } : b;
  });

  // Sort: interested_y first, then hot/replied, then by state priority
  const stateOrder = ['interested_y', 'meeting_req', 'ready', 'nda_signed_b', 'replied', 'flyer_sent', 'in_sequence', 'verified', 'enriched', 'identified', 'stalled', 'bounced', 'on_hold', 'opted_out'];
  const sorted = [...merged].sort((a, b) => {
    if (a.interested === true && b.interested !== true) return -1;
    if (b.interested === true && a.interested !== true) return 1;
    if (a.hot && !b.hot) return -1;
    if (b.hot && !a.hot) return 1;
    return stateOrder.indexOf(a.state) - stateOrder.indexOf(b.state);
  });

  const visible = sorted.filter(b => {
    if (filter === 'strategic' && b.type !== 'Strategic') return false;
    if (filter === 'financial' && b.type !== 'Financial') return false;
    if (stateFilter && b.state !== stateFilter) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Aggregate counts for filter chips
  const counts = {
    all: merged.length,
    replied: merged.filter(b => b.state === 'replied').length,
    in_sequence: merged.filter(b => b.state === 'in_sequence').length,
    flyer_sent: merged.filter(b => b.state === 'flyer_sent').length,
    nda_signed_b: merged.filter(b => b.state === 'nda_signed_b').length,
    ready: merged.filter(b => b.state === 'ready').length,
    interested_y: merged.filter(b => b.interested === true).length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Mandate header */}
      <div style={{
        padding: '14px 24px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', letterSpacing: '0.04em' }}>{m.code}</span>
              <Chip tone={m.status === 'Active' ? 'pos' : 'neutral'} dot>{m.status}</Chip>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Opened {m.opened}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}>{m.name}</h1>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{m.sector} · {m.rev} rev · {m.ebitda} EBITDA · Lead: {m.advisor}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn size="sm" icon="upload" onClick={openIngest}>Add buyers</Btn>
            <Btn size="sm" icon="sparkles" onClick={openEnrichment}>Enrichment</Btn>
            <Btn size="sm" icon="send" onClick={openDirectNda}>Direct NDA</Btn>
            <Btn size="sm" icon="download">Client report</Btn>
            <Btn size="sm" icon="settings"/>
          </div>
        </div>

        {/* Top metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, auto)', gap: 28, paddingTop: 6 }}>
          <Stat label="Buyers" value={m.buyers}/>
          <Stat label="Sent" value={m.sent}/>
          <Stat label="Reply rate" value={`${Math.round(m.response * 100)}%`} tone="pos"/>
          <Stat label="Bounces" value="1.4%" sub="bench &lt;2%"/>
          <Stat label="NDAs (buyer)" value={m.nda_signed} tone="brass"/>
          <Stat label="Counter-signed" value={m.countersigned} tone="brass"/>
          <Stat label="Meetings" value={m.meetings} tone="accent"/>
          <Stat label="Stalled" value={m.stalled} tone={m.stalled > 0 ? 'warn' : 'neutral'}/>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        fontSize: 12,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} count={counts.all}>All</FilterChip>
          <FilterChip active={filter === 'strategic'} onClick={() => setFilter('strategic')}>Strategic</FilterChip>
          <FilterChip active={filter === 'financial'} onClick={() => setFilter('financial')}>Financial</FilterChip>
        </div>

        <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }}/>

        <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          <FilterChip active={!stateFilter} onClick={() => setStateFilter(null)}>Any state</FilterChip>
          {counts.replied > 0 && <FilterChip active={stateFilter === 'replied'} onClick={() => setStateFilter('replied')} tone="warn" count={counts.replied}>Replied</FilterChip>}
          {counts.interested_y > 0 && <FilterChip active={stateFilter === 'interested_y'} onClick={() => setStateFilter('interested_y')} tone="pos" count={counts.interested_y}>Interested</FilterChip>}
          {counts.ready > 0 && <FilterChip active={stateFilter === 'ready'} onClick={() => setStateFilter('ready')} tone="pos" count={counts.ready}>Ready</FilterChip>}
          {counts.nda_signed_b > 0 && <FilterChip active={stateFilter === 'nda_signed_b'} onClick={() => setStateFilter('nda_signed_b')} tone="brass" count={counts.nda_signed_b}>NDA signed</FilterChip>}
          {counts.flyer_sent > 0 && <FilterChip active={stateFilter === 'flyer_sent'} onClick={() => setStateFilter('flyer_sent')} tone="info" count={counts.flyer_sent}>Flyer sent</FilterChip>}
          {counts.in_sequence > 0 && <FilterChip active={stateFilter === 'in_sequence'} onClick={() => setStateFilter('in_sequence')} tone="accent" count={counts.in_sequence}>In sequence</FilterChip>}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--raised)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '3px 8px',
            fontSize: 12, color: 'var(--text-2)',
          }}>
            <Icon name="search" size={12}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter buyers…"
              style={{ background: 'none', border: 0, outline: 0, color: 'var(--text)', width: 140, fontSize: 12 }}
            />
          </div>
          <Btn size="sm" icon="sliders">Columns</Btn>
        </div>
      </div>

      {/* The big table */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontSize: 12,
        }}>
          <thead style={{
            position: 'sticky', top: 0, zIndex: 1,
            background: 'var(--surface)',
          }}>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <Th style={{ width: 28, paddingLeft: 24 }}></Th>
              <Th>Buyer</Th>
              <Th style={{ width: 60 }}>HQ</Th>
              <Th style={{ width: 80 }}>Type</Th>
              <Th style={{ width: 110 }}>Size</Th>
              <Th style={{ width: 140 }}>Primary contact</Th>
              <Th style={{ width: 75 }}>Contacts</Th>
              <Th style={{ width: 150 }}>State</Th>
              <Th style={{ width: 60 }}>Cadence</Th>
              <Th>Last activity</Th>
              <Th style={{ width: 56 }}></Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((b, i) => (
              <BuyerRow key={b.id} b={b} idx={i}
                onClick={() => openBuyer(b)}
                onTriage={() => openTriage(b)}
                onNDA={() => openNDA(b)}
                advanceBuyer={advanceBuyer}
              />
            ))}
          </tbody>
        </table>

        {visible.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
            No buyers match these filters.
          </div>
        )}
      </div>

      {/* Footer/legend */}
      <div style={{
        padding: '8px 24px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', gap: 14,
        fontSize: 11, color: 'var(--text-3)',
      }}>
        <span><span className="mono">{visible.length}</span> of <span className="mono">{merged.length}</span> buyers</span>
        <span>·</span>
        <span>Sorted: Interested = Yes → Hot → Lifecycle stage</span>
        <span style={{ marginLeft: 'auto' }}>Auto-refreshing</span>
      </div>
    </div>
  );
};

const Th = ({ children, style }) => (
  <th style={{
    fontWeight: 500, color: 'var(--text-3)',
    fontSize: 10.5, letterSpacing: '0.04em', textTransform: 'uppercase',
    padding: '8px 8px', whiteSpace: 'nowrap',
    ...style,
  }}>{children}</th>
);

const FilterChip = ({ active, onClick, tone, count, children }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    background: active ? (tone ? `var(--${tone}-bg)` : 'var(--accent-bg-2)') : 'transparent',
    color: active ? (tone ? `var(--${tone})` : 'var(--accent-strong)') : 'var(--text-2)',
    border: active
      ? `1px solid ${tone ? `var(--${tone}-line)` : 'var(--accent-line)'}`
      : '1px solid var(--border)',
    fontSize: 11.5,
    fontWeight: active ? 500 : 400,
  }}>
    {children}
    {count != null && <span className="mono" style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>}
  </button>
);

const BuyerRow = ({ b, idx, onClick, onTriage, onNDA, advanceBuyer }) => {
  const [hover, setHover] = React.useState(false);
  const stateInfo = window.VC.STATES[b.state];
  const hot = b.state === 'replied' || b.hot;

  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--raised)' : (idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)'),
        borderBottom: '1px solid var(--hairline)',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <td style={{ paddingLeft: 24, paddingRight: 0, width: 28 }}>
        {b.interested === true ? (
          <span title="Interested = Yes" style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: 'var(--pos)',
          }}/>
        ) : hot ? (
          <span title="Needs attention" style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: 'var(--neg)',
            animation: 'vc-pulse 1.6s infinite',
          }}/>
        ) : null}
      </td>
      <td style={{ padding: '8px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 3,
            background: 'var(--raised-2)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 600, color: 'var(--text-2)', flexShrink: 0,
            fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em',
          }}>
            {b.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {b.name}
              {b.direct_nda && <Chip tone="brass">Direct NDA</Chip>}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              {b.domain}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: '8px 8px' }}>
        <Flag code={b.country}/>
        <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--text-2)' }}>{b.country}</span>
      </td>
      <td style={{ padding: '8px 8px', color: 'var(--text-2)' }}>{b.type}</td>
      <td style={{ padding: '8px 8px' }} className="mono">
        <span style={{ color: 'var(--text-2)', fontSize: 11.5 }}>{b.revenue}</span>
      </td>
      <td style={{ padding: '8px 8px', color: 'var(--text-2)', fontSize: 11.5 }}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
          {b.primary}
        </div>
      </td>
      <td style={{ padding: '8px 8px' }} className="mono">
        <span style={{ fontSize: 11.5 }}>{b.contacts}</span>
        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>/6</span>
      </td>
      <td style={{ padding: '8px 8px' }}>
        <StateChip state={b.state} pulse={hot}/>
      </td>
      <td style={{ padding: '8px 8px' }}>
        <CadenceMini buyer={b}/>
      </td>
      <td style={{ padding: '8px 8px', color: 'var(--text-2)', fontSize: 11.5 }}>
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {b.last}
        </div>
      </td>
      <td style={{ padding: '8px 8px', textAlign: 'right', paddingRight: 16 }}>
        {hover && (
          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            {b.state === 'replied' && <Btn size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); onTriage(); }}>Triage</Btn>}
            {b.state === 'nda_signed_b' && <Btn size="sm" onClick={(e) => { e.stopPropagation(); onNDA(); }}>Counter</Btn>}
            {!['replied', 'nda_signed_b'].includes(b.state) && <Icon name="chevron" size={12} style={{ color: 'var(--text-3)' }}/>}
          </div>
        )}
        {!hover && <Icon name="chevron" size={12} style={{ color: 'var(--text-3)' }}/>}
      </td>
    </tr>
  );
};

// 4-segment cadence indicator — E1 / E2 / E3 / E4
const CadenceMini = ({ buyer }) => {
  // Decide segment states based on buyer state
  let segs = ['empty', 'empty', 'empty', 'empty'];
  const map = {
    identified: ['empty', 'empty', 'empty', 'empty'],
    enriched:   ['empty', 'empty', 'empty', 'empty'],
    verified:   ['queued', 'empty', 'empty', 'empty'],
    in_sequence:['done', 'queued', 'empty', 'empty'],
    replied:    ['done', 'done', 'replied', 'cancelled'],
    flyer_sent: ['done', 'done', 'replied', 'empty'],
    nda_signed_b: ['done', 'done', 'done', 'empty'],
    ready:      ['done', 'done', 'done', 'done'],
    meeting_req:['done', 'done', 'done', 'done'],
    interested_y:['done', 'done', 'done', 'done'],
    stalled:    ['done', 'done', 'replied', 'empty'],
    bounced:    ['bounced', 'empty', 'empty', 'empty'],
    opted_out:  ['done', 'opted', 'empty', 'empty'],
  };
  segs = map[buyer.state] || segs;

  return (
    <div style={{ display: 'flex', gap: 2 }} title="E1 / E2 / E3 / E4">
      {segs.map((s, i) => (
        <div key={i} style={{
          width: 11, height: 5, borderRadius: 1,
          background:
            s === 'done' ? 'var(--accent)' :
            s === 'queued' ? 'var(--accent-bg-2)' :
            s === 'replied' ? 'var(--pos)' :
            s === 'cancelled' ? 'var(--raised-2)' :
            s === 'bounced' ? 'var(--neg)' :
            s === 'opted' ? 'var(--neg)' :
            'var(--raised-2)',
          opacity: s === 'cancelled' ? 0.4 : 1,
          border: s === 'queued' ? '1px dashed var(--accent-line)' : 'none',
        }}/>
      ))}
    </div>
  );
};

// Generate plausible filler buyers for non-aurora mandates
function syntheticBuyers(m) {
  const names = [
    ['Eastman Industrial', 'US', 'Strategic', 'US$3.8B'],
    ['Greypoint Acquisitions', 'GB', 'Financial', '£950M AUM'],
    ['Endeavour Industrial Group', 'AU', 'Strategic', 'A$1.2B'],
    ['Pacific Northern Trade', 'CA', 'Strategic', 'C$760M'],
    ['Tasman Distribution Co', 'NZ', 'Strategic', 'NZ$220M'],
    ['Cardinal Logistics Partners', 'US', 'Financial', 'US$2.4B AUM'],
    ['Sentinel Logistics Tech', 'SG', 'Strategic', 'S$640M'],
    ['Westcourt Capital', 'GB', 'Financial', '£420M AUM'],
    ['Riverstone Industrial', 'US', 'Strategic', 'US$1.1B'],
    ['Pinnacle Acquisitions', 'AU', 'Financial', 'A$880M AUM'],
  ];
  const states = ['in_sequence', 'in_sequence', 'in_sequence', 'flyer_sent', 'replied', 'nda_signed_b', 'ready', 'interested_y', 'verified', 'enriched'];
  return names.slice(0, Math.min(10, m.buyers)).map((n, i) => ({
    id: `${m.id}-syn-${i}`,
    name: n[0], country: n[1], type: n[2], revenue: n[3],
    domain: n[0].toLowerCase().replace(/[^a-z]/g, '') + '.com',
    state: states[i % states.length],
    interested: states[i % states.length] === 'interested_y' ? true : null,
    last: 'Last activity 2 days ago',
    primary: 'Auto-ranked primary',
    contacts: 4 + (i % 3),
    nda_path: null,
    direct_nda: false,
  }));
}

Object.assign(window, { Mandate });
