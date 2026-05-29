// NDA workflow screen — 3 signing paths, diff detection, countersign routing.

const NDA = () => {
  const records = window.VC.NDA_RECORDS;
  const [selectedId, setSelectedId] = React.useState(records.find(r => r.diff === 'material_change')?.id || records[0]?.id);
  const selected = records.find(r => r.id === selectedId);

  const stateCounts = {
    awaiting_counter: records.filter(r => r.state === 'awaiting_counter').length,
    legal_review:     records.filter(r => r.state === 'legal_review').length,
    countersigned:    records.filter(r => r.state === 'countersigned').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '14px 24px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow">3 signing paths · Electronic · Wet-ink · Word redline</div>
            <h1 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>NDA workflow</h1>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <Stat label="Awaiting counter-sign" value={stateCounts.awaiting_counter} tone="brass"/>
            <Stat label="In legal review" value={stateCounts.legal_review} tone="warn"/>
            <Stat label="Fully executed (30d)" value={stateCounts.countersigned + 5} tone="pos"/>
            <Stat label="Avg time-to-counter" value="2.4d" sub="bench &lt; 5d"/>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: NDA list */}
        <div style={{
          width: 380, borderRight: '1px solid var(--border)',
          background: 'var(--surface)',
          overflow: 'auto',
        }}>
          {['legal_review', 'awaiting_counter', 'countersigned'].map(state => {
            const items = records.filter(r => r.state === state);
            if (items.length === 0) return null;
            return (
              <div key={state}>
                <div style={{
                  padding: '10px 14px 6px',
                  fontSize: 10.5,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-3)',
                  fontWeight: 500,
                  background: 'var(--raised)',
                  borderBottom: '1px solid var(--hairline)',
                  position: 'sticky', top: 0, zIndex: 1,
                }}>
                  {state === 'legal_review' ? '⚠ Legal review required' :
                   state === 'awaiting_counter' ? 'Awaiting countersign' : 'Recently executed'}
                  <span style={{ marginLeft: 4 }}>· {items.length}</span>
                </div>
                {items.map(r => (
                  <NDARow key={r.id} r={r} selected={selectedId === r.id} onClick={() => setSelectedId(r.id)}/>
                ))}
              </div>
            );
          })}
        </div>

        {/* Right: detail */}
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
          {selected && <NDADetail r={selected}/>}
        </div>
      </div>
    </div>
  );
};

const NDARow = ({ r, selected, onClick }) => {
  const pathBadge = r.path === 'electronic' ? { icon: 'docusign', label: 'DocuSign', tone: 'info' }
                   : r.path === 'wetink'    ? { icon: 'wetink',  label: 'Wet-ink',  tone: 'brass' }
                   :                          { icon: 'redline', label: 'Word redline', tone: 'warn' };
  const days = r.daysOpen;
  const dayColor = days >= 14 ? 'var(--neg)' : days >= 7 ? 'var(--warn)' : 'var(--text-3)';

  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left',
      padding: '10px 14px',
      borderBottom: '1px solid var(--hairline)',
      background: selected ? 'var(--accent-bg-2)' : 'transparent',
      borderLeft: selected ? '2px solid var(--accent)' : '2px solid transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Chip tone={pathBadge.tone}>
          <Icon name={pathBadge.icon} size={10}/> {pathBadge.label}
        </Chip>
        {r.directNda && <Chip tone="brass">Direct NDA</Chip>}
        {r.diff === 'material_change' && <Chip tone="neg">Material change</Chip>}
        {r.diff === 'clean' && r.state === 'awaiting_counter' && <Chip tone="pos">Diff clean</Chip>}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{r.buyer}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.mandate}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11 }}>
        <span className="mono" style={{ color: 'var(--text-3)' }}>{r.envelopeId}</span>
        <span className="mono" style={{ color: dayColor }}>Day {r.daysOpen}</span>
      </div>
    </button>
  );
};

const NDADetail = ({ r }) => {
  const isRedline = r.path === 'redline';
  const isWetInk = r.path === 'wetink';
  const isCleanReady = r.diff === 'clean' && r.state === 'awaiting_counter';

  return (
    <div style={{ padding: '18px 24px', maxWidth: 920 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div className="eyebrow">{r.mandate}</div>
          <h2 style={{ margin: '2px 0 4px', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>{r.buyer}</h2>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text-2)' }}>
            <Chip tone={isRedline ? 'warn' : isWetInk ? 'brass' : 'info'}>
              <Icon name={isRedline ? 'redline' : isWetInk ? 'wetink' : 'docusign'} size={11}/>
              {isRedline ? 'Word redline path' : isWetInk ? 'Wet-ink path' : 'Electronic (DocuSign) path'}
            </Chip>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.envelopeId}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {isCleanReady && <Btn size="sm" variant="primary" icon="bell">Send DocuSign reminder</Btn>}
          {isRedline && <Btn size="sm" variant="primary" icon="handoff">Hand off to legal</Btn>}
          <Btn size="sm" icon="download">Download PDF</Btn>
          <Btn size="sm" icon="user">Override authoriser</Btn>
        </div>
      </div>

      {/* Path visualization */}
      <NDAPathDiagram path={r.path} state={r.state}/>

      {/* Diff result */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: r.diff === 'clean' ? '2px solid var(--pos)' : '2px solid var(--neg)',
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        marginTop: 14,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="diff" size={14} style={{ color: r.diff === 'clean' ? 'var(--pos)' : 'var(--neg)' }}/>
            <span style={{ fontWeight: 500, fontSize: 13 }}>
              Diff vs. original template
            </span>
            <Chip tone={r.diff === 'clean' ? 'pos' : 'neg'}>
              {r.diff === 'clean' ? '0 material changes — auto-routes to authoriser' : '2 material changes — legal review required'}
            </Chip>
          </div>
          <Btn size="sm" icon="eye">Open full diff</Btn>
        </div>

        {r.diff === 'material_change' && (
          <div style={{ marginTop: 10 }}>
            <DiffPreview/>
          </div>
        )}

        {r.diff === 'clean' && (
          <div style={{
            padding: '10px 12px',
            background: 'var(--pos-bg)',
            border: '1px solid var(--pos-line)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 11.5, color: 'var(--text-2)',
            fontFamily: 'var(--font-mono)',
          }}>
            $ diff template_v3.pdf returned.pdf<br/>
            <span style={{ color: 'var(--pos)' }}>→ identical content (entity-fill token unchanged)</span><br/>
            <span style={{ color: 'var(--text-3)' }}># OCR pass: 3,847 tokens · 0 deltas outside whitelist · hash verified</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <NDATimeline r={r}/>
    </div>
  );
};

const NDAPathDiagram = ({ path, state }) => {
  const isElec = path === 'electronic';
  const isWet = path === 'wetink';
  const isRed = path === 'redline';

  const counterDone = state === 'countersigned';
  const inCounter = state === 'awaiting_counter';
  const inLegal = state === 'legal_review';

  const steps = [
    { label: 'NDA sent', icon: 'send', done: true },
    isElec ? { label: 'Buyer signs in DocuSign', icon: 'docusign', done: true } :
    isWet  ? { label: 'Buyer wet-ink signs · PDF uploaded', icon: 'wetink', done: true } :
             { label: 'Buyer returns redlined Word', icon: 'redline', done: true },
    { label: 'Diff vs template', icon: 'diff', done: true, alert: isRed },
    isRed ? { label: 'Legal review', icon: 'handoff', done: false, current: inLegal } :
            { label: 'Route to authoriser', icon: 'handoff', done: counterDone, current: inCounter },
    { label: 'Countersigned · buyer Ready', icon: 'check', done: counterDone, current: false },
  ];

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 0,
    }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: s.alert ? 'var(--neg-bg)' :
                         s.done ? 'var(--pos-bg)' :
                         s.current ? 'var(--brass-bg)' : 'var(--raised-2)',
              color: s.alert ? 'var(--neg)' :
                     s.done ? 'var(--pos)' :
                     s.current ? 'var(--brass)' : 'var(--text-3)',
              border: `1px solid ${s.alert ? 'var(--neg-line)' :
                                   s.done ? 'var(--pos-line)' :
                                   s.current ? 'var(--brass-line)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: s.current ? 'vc-pulse 1.6s infinite' : 'none',
            }}>
              <Icon name={s.icon} size={12}/>
            </div>
            <div style={{
              fontSize: 10.5, textAlign: 'center', maxWidth: 110,
              color: s.alert ? 'var(--neg)' :
                     s.done ? 'var(--text)' :
                     s.current ? 'var(--brass)' : 'var(--text-3)',
              fontWeight: s.current || s.alert ? 500 : 400,
              lineHeight: 1.3,
            }}>{s.label}</div>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 0.3, height: 1,
              background: steps[i + 1].done ? 'var(--pos)' : steps[i + 1].current ? 'var(--brass)' : 'var(--border)',
              marginTop: -16,
            }}/>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Side-by-side diff preview (for Word redline material change)
const DiffPreview = () => (
  <div style={{
    background: 'var(--raised)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    fontFamily: 'var(--font-mono)', fontSize: 11.5,
  }}>
    <div style={{
      display: 'grid', gridTemplateColumns: '36px 1fr 1fr',
      borderBottom: '1px solid var(--border)',
      fontSize: 10.5,
      color: 'var(--text-3)',
      textTransform: 'uppercase', letterSpacing: '0.04em',
      background: 'var(--surface)',
    }}>
      <span style={{ padding: '5px 8px' }}>§</span>
      <span style={{ padding: '5px 8px', borderLeft: '1px solid var(--border)' }}>Template (original)</span>
      <span style={{ padding: '5px 8px', borderLeft: '1px solid var(--border)' }}>Returned (Greypoint redline)</span>
    </div>
    {[
      { sec: '4.2', orig: 'This Agreement shall remain in effect for a period of twenty-four (24) months from the Effective Date.', mod: 'This Agreement shall remain in effect for a period of eighteen (18) months from the Effective Date.' },
      { sec: '7.1', orig: 'Confidential Information shall not include information that becomes publicly available through no breach of this Agreement.', mod: 'Confidential Information shall not include information that becomes publicly available, or that the Receiving Party can demonstrate was independently developed.' },
    ].map((row, i) => (
      <div key={i} style={{
        display: 'grid', gridTemplateColumns: '36px 1fr 1fr',
        borderBottom: i < 1 ? '1px solid var(--border)' : 'none',
      }}>
        <span style={{ padding: '8px', color: 'var(--text-3)' }}>{row.sec}</span>
        <div style={{ padding: '8px', borderLeft: '1px solid var(--border)', background: 'var(--neg-bg)', color: 'var(--text-2)' }}>
          <span style={{ background: 'rgba(219,94,92,0.25)' }}>{row.orig}</span>
        </div>
        <div style={{ padding: '8px', borderLeft: '1px solid var(--border)', background: 'var(--pos-bg)', color: 'var(--text-2)' }}>
          <span style={{ background: 'rgba(79,181,133,0.20)' }}>{row.mod}</span>
        </div>
      </div>
    ))}
  </div>
);

const NDATimeline = ({ r }) => (
  <div style={{ marginTop: 14 }}>
    <SectionHeader eyebrow="Envelope history" title="Activity"/>
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 14,
      display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px 14px', fontSize: 12,
    }}>
      <span className="mono" style={{ color: 'var(--text-3)' }}>20 May 11:04</span>
      <span><b>NDA dispatched</b> · pre-filled "{r.buyer}" · sent by Jeremy Pak</span>
      <span className="mono" style={{ color: 'var(--text-3)' }}>20 May 14:22</span>
      <span>Opened by recipient · IP geolocated to {r.buyer.includes('Northbrook') ? 'Toronto, CA' : 'London, GB'}</span>
      {r.path === 'wetink' && <>
        <span className="mono" style={{ color: 'var(--text-3)' }}>21 May 09:38</span>
        <span><b>Wet-ink PDF uploaded by Jeremy</b> · OCR diff vs template — 0 deltas</span>
      </>}
      {r.path === 'electronic' && <>
        <span className="mono" style={{ color: 'var(--text-3)' }}>{r.buyerSignedAt || '21 May 16:42'}</span>
        <span><b>Buyer signature captured</b> · DocuSign cert · diff clean</span>
      </>}
      {r.path === 'redline' && <>
        <span className="mono" style={{ color: 'var(--text-3)' }}>22 May 11:08</span>
        <span><b>Buyer returned redlined Word</b> · agent diff found 2 material changes</span>
        <span className="mono" style={{ color: 'var(--text-3)' }}>22 May 11:09</span>
        <span style={{ color: 'var(--neg)' }}><b>⚠ Legal review hand-off</b> · sequence paused for buyer</span>
      </>}
      {r.state === 'awaiting_counter' && <>
        <span className="mono" style={{ color: 'var(--text-3)' }}>21 May 09:40</span>
        <span>Routed to authoriser <b>{r.authoriser}</b></span>
        <span className="mono" style={{ color: 'var(--warn)' }}>Day {r.daysOpen}</span>
        <span style={{ color: 'var(--warn)' }}>Awaiting countersign · reminder eligible</span>
      </>}
      {r.state === 'countersigned' && <>
        <span className="mono" style={{ color: 'var(--text-3)' }}>{r.counterAt}</span>
        <span><b>Authoriser countersigned</b> · buyer auto-transitioned to <Chip tone="pos">Ready</Chip></span>
      </>}
    </div>
  </div>
);

Object.assign(window, { NDA });
