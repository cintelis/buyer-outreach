// Email review queue — every outbound passes through here.
// HITL approval gate. Two-pane layout: queue list left, draft editor right.

const Queue = () => {
  const queue = window.VC.EMAIL_QUEUE;
  const [selectedId, setSelectedId] = React.useState(queue[0]?.id);
  const [statuses, setStatuses] = React.useState({}); // id -> 'approved' | 'edited' | 'held'
  const [mandate, setMandate] = React.useState('all');

  const visible = queue.filter(q => mandate === 'all' || q.mandate === mandate);
  const selected = queue.find(q => q.id === selectedId);
  const approvedCount = Object.values(statuses).filter(s => s === 'approved').length;

  const mark = (id, s) => setStatuses(prev => ({ ...prev, [id]: s }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '14px 24px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14,
      }}>
        <div>
          <div className="eyebrow">HITL Gate · Review every outbound</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>
            Review queue
            <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: 8, fontSize: 14 }}>
              {visible.length} drafts ready for your eyes
            </span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <select value={mandate} onChange={e => setMandate(e.target.value)} style={{
            background: 'var(--raised)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '5px 8px',
            color: 'var(--text)', fontSize: 12,
          }}>
            <option value="all">All mandates</option>
            {window.VC.MANDATES.filter(m => m.status === 'Active').map(m =>
              <option key={m.id} value={m.id}>{m.name}</option>
            )}
          </select>
          {approvedCount > 0 && (
            <Chip tone="pos" dot>{approvedCount} approved this session</Chip>
          )}
          <Btn size="sm" icon="checkAll" variant="primary">Approve all unflagged</Btn>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: list */}
        <div style={{
          width: 360, borderRight: '1px solid var(--border)',
          background: 'var(--surface)',
          overflow: 'auto',
        }}>
          {visible.map(q => (
            <QueueRow key={q.id}
              q={q}
              selected={selectedId === q.id}
              status={statuses[q.id]}
              onClick={() => setSelectedId(q.id)}
            />
          ))}
        </div>

        {/* Right: editor */}
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
          {selected && <DraftEditor q={selected} status={statuses[selectedId]} onMark={mark}/>}
        </div>
      </div>
    </div>
  );
};

const QueueRow = ({ q, selected, status, onClick }) => {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left',
      padding: '10px 14px',
      borderBottom: '1px solid var(--hairline)',
      background: selected ? 'var(--accent-bg-2)' : (status === 'approved' ? 'var(--pos-bg)' : status === 'held' ? 'var(--neg-bg)' : 'transparent'),
      borderLeft: selected ? '2px solid var(--accent)' : status === 'approved' ? '2px solid var(--pos)' : status === 'held' ? '2px solid var(--neg)' : '2px solid transparent',
      opacity: status ? 0.85 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Chip tone={q.step === 'E1' ? 'accent' : 'info'}>{q.step}</Chip>
        <Flag code={q.country}/>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· {q.mandateName.replace('Project ', '')}</span>
        {q.flagged && <Chip tone="warn">⚠ flagged</Chip>}
        {q.edited && <Chip tone="info">edited</Chip>}
        {status === 'approved' && <Chip tone="pos">✓ approved</Chip>}
        {status === 'held' && <Chip tone="neg">held</Chip>}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 2 }}>{q.contact}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginBottom: 4 }}>{q.buyer}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {q.subject}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10.5, color: 'var(--text-3)' }}>
        <span className="mono">Sends {q.sendAt}</span>
        <span>in {q.in}</span>
      </div>
    </button>
  );
};

const DraftEditor = ({ q, status, onMark }) => {
  const [editing, setEditing] = React.useState(false);
  const [subject, setSubject] = React.useState(q.subject);
  const [body, setBody] = React.useState(buildEmailBody(q));

  React.useEffect(() => {
    setSubject(q.subject);
    setBody(buildEmailBody(q));
    setEditing(false);
  }, [q.id]);

  return (
    <div style={{ padding: '16px 24px', maxWidth: 920 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div className="eyebrow">{q.template}</div>
          <div style={{ fontSize: 16, fontWeight: 500, marginTop: 2 }}>{q.contact} · {q.buyer}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>
            Scheduled for <span className="mono">{q.sendAt}</span> · {q.in} from now
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn size="sm" icon="clock">Reschedule</Btn>
          <Btn size="sm" icon="pause">Hold</Btn>
        </div>
      </div>

      {/* Flag panel */}
      {q.flagged && (
        <div style={{
          padding: '10px 14px', marginBottom: 12,
          background: 'var(--warn-bg)',
          border: '1px solid var(--warn-line)',
          borderLeft: '2px solid var(--warn)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="alert" size={14} style={{ color: 'var(--warn)' }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 12 }}>{q.flagReason}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Tenure under 3 months — agent suggests sending anyway, per spec §5.6.</div>
          </div>
          <Btn size="sm">Override flag</Btn>
        </div>
      )}

      {/* Email card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}>
        {/* From / To strip */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--hairline)',
          fontSize: 11.5, color: 'var(--text-2)',
          display: 'grid', gridTemplateColumns: '60px 1fr', gap: '4px 12px',
        }}>
          <span style={{ color: 'var(--text-3)' }}>From</span>
          <span className="mono" style={{ color: 'var(--text)' }}>Jeremy Pak &lt;outreach@velocitycapital.co.nz&gt;</span>
          <span style={{ color: 'var(--text-3)' }}>To</span>
          <span className="mono" style={{ color: 'var(--text)' }}>{recipientFor(q)}</span>
          <span style={{ color: 'var(--text-3)' }}>Subject</span>
          {editing ? (
            <input value={subject} onChange={e => setSubject(e.target.value)} style={{
              background: 'var(--raised)', border: '1px solid var(--accent-line)',
              borderRadius: 3, padding: '2px 6px', outline: 0,
              fontFamily: 'inherit', fontSize: 12, color: 'var(--text)',
            }}/>
          ) : (
            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{subject}</span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px' }}>
          {editing ? (
            <textarea value={body} onChange={e => setBody(e.target.value)} style={{
              width: '100%', minHeight: 280,
              background: 'var(--raised)', border: '1px solid var(--accent-line)',
              borderRadius: 'var(--radius-sm)', padding: 12,
              outline: 0, color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 12.5,
              lineHeight: 1.55, resize: 'vertical',
            }}/>
          ) : (
            <pre style={{
              margin: 0, fontFamily: 'var(--font-sans)', fontSize: 12.5,
              lineHeight: 1.6, color: 'var(--text)',
              whiteSpace: 'pre-wrap', wordWrap: 'break-word',
            }}>{body}</pre>
          )}
        </div>

        {/* Footer compliance */}
        <div style={{
          padding: '8px 16px',
          background: 'var(--raised)',
          borderTop: '1px solid var(--hairline)',
          fontSize: 10.5, color: 'var(--text-3)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>Compliance footer: ON · sender ID + 1-line unsubscribe</span>
          <span>NZ UEM Act 2007</span>
        </div>
      </div>

      {/* Merge field inspection */}
      <details style={{
        marginTop: 12,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 12,
      }}>
        <summary style={{
          padding: '8px 14px', cursor: 'pointer', userSelect: 'none',
          color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name="diff" size={11}/>
          <span>Merge field substitution · 8 fields filled · 0 fallbacks</span>
        </summary>
        <div style={{ padding: '0 14px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <MergeRow k="{first_name}" v={q.contact.split(' ')[0]}/>
          <MergeRow k="{last_name}" v={q.contact.split(' ').slice(1).join(' ')}/>
          <MergeRow k="{title}" v="Head of M&A"/>
          <MergeRow k="{buyer_company}" v={q.buyer}/>
          <MergeRow k="{buyer_country}" v={q.country}/>
          <MergeRow k="{mandate_name}" v={q.mandateName}/>
          <MergeRow k="{sender_first_name}" v="Jeremy"/>
          <MergeRow k="{sender_signature}" v="(rich-text, mandate-config)"/>
        </div>
      </details>

      {/* Action bar */}
      <div style={{
        position: 'sticky', bottom: 0, marginTop: 16,
        padding: '12px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to top, var(--bg), var(--bg) 70%, transparent)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {!editing && <Btn icon="pen" onClick={() => setEditing(true)}>Edit</Btn>}
          {editing && <Btn icon="check" variant="primary" onClick={() => setEditing(false)}>Save edits</Btn>}
          {editing && <Btn variant="ghost" onClick={() => { setSubject(q.subject); setBody(buildEmailBody(q)); setEditing(false); }}>Revert</Btn>}
          <Btn icon="eye">Preview as recipient</Btn>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn variant="danger" icon="pause" onClick={() => onMark(q.id, 'held')}>Hold</Btn>
          <Btn variant="primary" icon="check" onClick={() => onMark(q.id, 'approved')} kbd="⌘↵">
            Approve & queue
          </Btn>
        </div>
      </div>
    </div>
  );
};

const MergeRow = ({ k, v }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
    <span style={{ color: 'var(--accent-strong)' }}>{k}</span>
    <span style={{ color: 'var(--text-2)', textAlign: 'right' }}>{v}</span>
  </div>
);

// Template body builder — keeps the prototype self-contained but realistic
function buildEmailBody(q) {
  const [first] = q.contact.split(' ');
  if (q.step === 'E1') {
    return `${first} —

I lead M&A advisory at Velocity Capital, a boutique transaction firm based in NZ. We are running a confidential sell-side process for a profitable, growth-stage specialty foods business — high margins, multi-channel distribution, and a 7-year compounding revenue track record.

The vendor's profile sits squarely within ${q.buyer}'s stated acquisition criteria, and we believe an introductory conversation could be worthwhile.

If of interest, I'm happy to share an Information Flyer and an NDA. No tracked links, no attachments in this note — just a quick yes/no on whether the documentation would be welcome.

Best,
Jeremy Pak
Velocity Capital | velocitycapital.co.nz`;
  }
  if (q.step === 'E2') {
    return `${first} —

Following up on my note from earlier this week. The vendor is a profitable specialty foods business; revenue ~NZ$42m and EBITDA margins above 19%. The Information Flyer and NDA are ready for your team's review when you'd like to take a closer look.

Happy to send across, or to step through the strategic rationale in a 15-minute call.

Best,
Jeremy Pak
Velocity Capital`;
  }
  if (q.step === 'E3') {
    return `${first} —

Circling back with a sharper angle. We've had positive engagement from a handful of strategic peers, and ${q.buyer}'s footprint in this category is the reason I keep returning to you. Two things you may find useful:

  •  The vendor holds an unbroken 7-year track record of double-digit organic revenue growth
  •  Cross-border distribution into AU and the US is already in place — minimal integration lift

Worth fifteen minutes?

Best,
Jeremy Pak`;
  }
  return `${first} —

Final note from me on this opportunity — process is moving and I want to make sure ${q.buyer} has the chance to evaluate.

If now isn't the right time, no problem — happy to circle back on the next mandate. Either way, a brief reply would be appreciated so I can update our files.

Best,
Jeremy Pak`;
}

function recipientFor(q) {
  const [first, ...rest] = q.contact.split(' ');
  return `${first} ${rest.join(' ')} <${first[0].toLowerCase()}.${rest.join('').toLowerCase()}@${q.buyer.toLowerCase().replace(/[^a-z]/g, '')}.com>`;
}

Object.assign(window, { Queue });
