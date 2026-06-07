// Reply triage — the hero screen.
// Inbound reply + 6-bucket classification + recommended next action.
// On confirm: queues NDA send, returns sequence cascade decisions.

const Triage = ({ onConfirm, onClose, contextBuyerId }) => {
  const reply = window.VC.HERO_REPLY;
  const [bucket, setBucket] = React.useState(reply.classification.bucket);
  const [resumeMode, setResumeMode] = React.useState('cadence'); // now / cadence / custom
  const [keepCascade, setKeepCascade] = React.useState(false); // cancel downstream cascade by default
  const [sendNda, setSendNda] = React.useState(true);
  const [ndaMode, setNdaMode] = React.useState('prefill'); // blank / prefill
  const [entityName, setEntityName] = React.useState('Arborfield Holdings Limited');

  const selectedBucket = window.VC.REPLY_BUCKETS.find(b => b.id === bucket);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div className="eyebrow">Reply triage · {reply.thread}</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}>
            New reply from <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>James Holloway, MD at Arborfield Holdings</span>
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            Sequence auto-paused for James · 4 downstream cascade recipients awaiting your decision · 14 min since received
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn size="sm" icon="x" onClick={onClose}>Close</Btn>
          <Btn size="sm" icon="reply">Forward to colleague</Btn>
        </div>
      </div>

      <div className="col-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {/* LEFT: the reply */}
        <div>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--hairline)',
              fontSize: 11.5, color: 'var(--text-2)',
              display: 'grid', gridTemplateColumns: '60px 1fr', gap: '4px 12px',
            }}>
              <span style={{ color: 'var(--text-3)' }}>From</span>
              <span className="mono">{reply.from}</span>
              <span style={{ color: 'var(--text-3)' }}>To</span>
              <span className="mono">{reply.to}</span>
              <span style={{ color: 'var(--text-3)' }}>Subject</span>
              <span style={{ fontWeight: 500, color: 'var(--text)' }}>{reply.subject}</span>
              <span style={{ color: 'var(--text-3)' }}>Received</span>
              <span className="mono">{reply.received}</span>
            </div>
            <div style={{
              padding: '18px 20px',
              fontSize: 13, lineHeight: 1.6, color: 'var(--text)',
            }}>
              <HighlightedBody body={reply.body} signals={reply.classification.signals}/>
            </div>
          </div>

          {/* Thread context */}
          <details style={{
            marginTop: 10,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
          }}>
            <summary style={{
              padding: '8px 14px', cursor: 'pointer', userSelect: 'none',
              color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="mail" size={11}/>
              Thread context · 3 prior sends · last open by James 2 days ago
            </summary>
            <div style={{ padding: '6px 14px 12px' }}>
              {[
                { e: 'E3', when: '19 May 09:11 NZST', preview: 'Circling back with a sharper angle…' },
                { e: 'E2', when: '17 May 09:08 NZST', preview: 'Following up on my note…' },
                { e: 'E1', when: '14 May 09:00 NZST', preview: 'I lead M&A advisory at our firm…' },
              ].map(s => (
                <div key={s.e} style={{
                  padding: '6px 0', borderBottom: '1px solid var(--hairline)',
                  display: 'grid', gridTemplateColumns: '36px 110px 1fr',
                  gap: 10, fontSize: 11.5, color: 'var(--text-2)', alignItems: 'center',
                }}>
                  <Chip tone="accent">{s.e}</Chip>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.when}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.preview}</span>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* RIGHT: classification + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Co-pilot recommendation block */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--accent-line)',
            borderLeft: '2px solid var(--accent)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 5,
                background: 'linear-gradient(135deg, var(--accent), var(--brass))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
              }}>
                <Icon name="sparkles" size={11} stroke={2}/>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>Co-pilot classification</div>
              <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent-strong)' }}>
                {Math.round(reply.classification.confidence * 100)}% confidence
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              {window.VC.REPLY_BUCKETS.map(b => {
                const active = bucket === b.id;
                const isPrimary = b.id === reply.classification.bucket;
                return (
                  <button key={b.id} onClick={() => setBucket(b.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: active ? `var(--${b.tone}-bg)` : 'transparent',
                    border: active ? `1px solid var(--${b.tone}-line)` : '1px solid transparent',
                    textAlign: 'left',
                  }}>
                    <span style={{
                      width: 12, height: 12, borderRadius: '50%',
                      border: active ? `4px solid var(--${b.tone})` : '1px solid var(--border-strong)',
                      background: 'var(--bg)',
                      flexShrink: 0,
                    }}/>
                    <span style={{
                      fontSize: 12, fontWeight: active ? 500 : 400,
                      color: active ? `var(--${b.tone})` : 'var(--text)',
                    }}>{b.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· {b.desc}</span>
                    {isPrimary && (
                      <span className="mono" style={{
                        marginLeft: 'auto', fontSize: 10, color: 'var(--text-3)',
                      }}>recommended</span>
                    )}
                  </button>
                );
              })}
            </div>

            <hr className="rule"/>

            <div style={{ marginTop: 10 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Why co-pilot picked this</div>
              {reply.classification.signals.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11.5, color: 'var(--text-2)', marginBottom: 3 }}>
                  <Icon name="check" size={10} style={{ color: 'var(--pos)', marginTop: 2, flexShrink: 0 }}/>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sequence handling */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 8 }}>
              Sequence handling
            </div>

            <div style={{ marginBottom: 12 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Return James to sequence?</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  ['now', 'Send next now', 'Day 7 E3 was last sent. Skip ahead.'],
                  ['cadence', 'Resume on cadence', 'Wait until normal next-touch'],
                  ['custom', 'Custom date', 'Pick a date in calendar'],
                ].map(([k, l, d]) => (
                  <button key={k} onClick={() => setResumeMode(k)} style={{
                    flex: 1, padding: '6px 8px', textAlign: 'left',
                    background: resumeMode === k ? 'var(--accent-bg-2)' : 'var(--raised)',
                    border: resumeMode === k ? '1px solid var(--accent-line)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <div style={{ fontSize: 11.5, fontWeight: 500, color: resumeMode === k ? 'var(--accent-strong)' : 'var(--text)' }}>{l}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{d}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Downstream cascade at Arborfield</div>
              <div style={{
                padding: '8px 10px',
                background: 'var(--raised)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11.5,
                marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-2)' }}>4 cascade recipients currently sequencing</span>
                  <Chip tone="accent">Auto-cancel queued sends</Chip>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  Eleanor (E2), Rohan (E1), Priya (queued), Catherine (no email)
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={keepCascade} onChange={e => setKeepCascade(e.target.checked)}/>
                Override — keep cascade running anyway
              </label>
              {!keepCascade && (
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 22, marginTop: 2 }}>
                  <span style={{ color: 'var(--pos)' }}>✓</span> Cascade cancelled (recommended — primary engaged)
                </div>
              )}
            </div>
          </div>

          {/* NDA send block */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--brass-line)',
            borderLeft: '2px solid var(--brass)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <input type="checkbox" checked={sendNda} onChange={e => setSendNda(e.target.checked)}/>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Send Flyer + NDA now</span>
              <Chip tone="brass">Recommended</Chip>
            </label>
            <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginLeft: 24, marginBottom: 10 }}>
              James explicitly asked for both. Reply email will queue with tracked links to the Flyer PDF and NDA PDF.
            </div>

            {sendNda && (
              <div style={{ marginLeft: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 6 }}>NDA send mode</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  <button onClick={() => setNdaMode('blank')} style={{
                    flex: 1, padding: '6px 8px',
                    background: ndaMode === 'blank' ? 'var(--brass-bg)' : 'var(--raised)',
                    border: ndaMode === 'blank' ? '1px solid var(--brass-line)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 11.5, fontWeight: 500,
                    color: ndaMode === 'blank' ? 'var(--brass)' : 'var(--text)',
                    textAlign: 'left',
                  }}>
                    Blank — buyer fills entity at signing
                  </button>
                  <button onClick={() => setNdaMode('prefill')} style={{
                    flex: 1, padding: '6px 8px',
                    background: ndaMode === 'prefill' ? 'var(--brass-bg)' : 'var(--raised)',
                    border: ndaMode === 'prefill' ? '1px solid var(--brass-line)' : '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 11.5, fontWeight: 500,
                    color: ndaMode === 'prefill' ? 'var(--brass)' : 'var(--text)',
                    textAlign: 'left',
                  }}>
                    Pre-fill — substitute {`{{buyer_entity_name}}`}
                  </button>
                </div>
                {ndaMode === 'prefill' && (
                  <div style={{
                    padding: '6px 8px',
                    background: 'var(--raised)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <div className="eyebrow" style={{ marginBottom: 3 }}>Buyer legal entity</div>
                    <input value={entityName} onChange={e => setEntityName(e.target.value)} style={{
                      width: '100%', background: 'none', border: 0, outline: 0,
                      fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-mono)',
                    }}/>
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                  Authoriser on file: <span style={{ color: 'var(--text-2)' }}>Olivia Park</span>
                  <button style={{ color: 'var(--accent-strong)', marginLeft: 8, fontSize: 11 }}>Override per-buyer</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom confirm bar */}
      <div style={{
        marginTop: 18,
        padding: '14px 18px',
        background: 'var(--surface)',
        border: '1px solid var(--accent-line)',
        borderRadius: 'var(--radius)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
          <Icon name="check" size={14} style={{ color: 'var(--accent)' }}/>
          <div>
            <div style={{ fontWeight: 500 }}>On confirm:</div>
            <div style={{ color: 'var(--text-2)' }}>
              Classify <b>{selectedBucket?.label}</b> ·
              Resume cadence <b>{resumeMode === 'now' ? 'next send now' : resumeMode === 'cadence' ? 'on original schedule' : 'custom date'}</b> ·
              {keepCascade ? ' Keep cascade running' : ' Cancel 4 downstream sends'} ·
              {sendNda ? ` Send Flyer + NDA (${ndaMode === 'blank' ? 'blank' : 'pre-filled'})` : ' No NDA send'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="check" onClick={() => onConfirm({ bucket, sendNda, resumeMode, ndaMode, entityName })} kbd="⌘↵">
            Confirm and send
          </Btn>
        </div>
      </div>
    </div>
  );
};

// Body with highlighted signal phrases
const HighlightedBody = ({ body, signals }) => {
  // Highlight specific phrases inline (heuristic)
  const highlights = [
    { match: 'very interested in receiving the Information Flyer and an NDA', label: 'Positive Interest' },
    { match: 'Eleanor Whitmore (our Head of M&A, copied) will lead from our side', label: 'Names internal lead' },
    { match: 'confirm a 30-minute introductory call within the next ten days', label: 'Proposes meeting' },
  ];
  let parts = [body];
  highlights.forEach(({ match, label }) => {
    const next = [];
    parts.forEach(p => {
      if (typeof p === 'string' && p.includes(match)) {
        const [a, b] = p.split(match);
        next.push(a);
        next.push(<HighlightSpan key={match} label={label}>{match}</HighlightSpan>);
        next.push(b);
      } else {
        next.push(p);
      }
    });
    parts = next;
  });
  return <span style={{ whiteSpace: 'pre-wrap' }}>{parts}</span>;
};

const HighlightSpan = ({ children, label }) => (
  <span style={{
    background: 'var(--pos-bg)',
    borderBottom: '1px solid var(--pos-line)',
    padding: '0 2px',
    position: 'relative',
    cursor: 'help',
  }} title={label}>{children}</span>
);

Object.assign(window, { Triage });
