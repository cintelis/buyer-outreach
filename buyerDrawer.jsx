// Buyer drill-down: opens as a right-side drawer.
// Shows enrichment record, contact stack, sequence timeline per contact, NDA state, call notes.

const BuyerDrawer = ({ buyer, onClose, onTriage, onNDA, advanceBuyer }) => {
  if (!buyer) return null;
  const [tab, setTab] = React.useState('contacts');

  // For the hero buyer (Arborfield) we have real contacts; others get synthesized
  const isArbor = buyer.id === 'b-arborfield';
  const contacts = isArbor ? window.VC.ARBORFIELD_CONTACTS : synthContacts(buyer);

  return (
    <Drawer open={true} onClose={onClose} width={780}>
      {/* Header */}
      <div style={{
        padding: '14px 18px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'flex-start', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 4,
          background: 'var(--raised-2)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 14,
          color: 'var(--text-2)',
          flexShrink: 0,
        }}>
          {buyer.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em' }}>{buyer.name}</h2>
            <Flag code={buyer.country}/>
            <Chip tone={buyer.type === 'Strategic' ? 'accent' : 'purple'}>{buyer.type}</Chip>
            <StateChip state={buyer.state}/>
            {buyer.direct_nda && <Chip tone="brass">Direct NDA</Chip>}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {buyer.domain} · {buyer.revenue} · Project Aurora
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {buyer.state === 'replied' && <Btn size="sm" variant="primary" icon="triage" onClick={onTriage}>Triage reply</Btn>}
          {buyer.state === 'nda_signed_b' && <Btn size="sm" variant="primary" icon="check" onClick={onNDA}>Send to counter</Btn>}
          <Btn size="sm" icon="pause" title="On hold">Hold</Btn>
          <Btn variant="ghost" size="sm" icon="x" onClick={onClose}/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0,
        padding: '0 18px',
        borderBottom: '1px solid var(--border)',
      }}>
        {[
          ['contacts', 'Contacts & sequence', contacts.length],
          ['enrichment', 'Enrichment', null],
          ['nda', 'NDA', null],
          ['notes', 'Call notes', 3],
          ['audit', 'Audit trail', null],
        ].map(([id, label, count]) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '10px 0',
              marginRight: 18,
              fontSize: 12, fontWeight: 500,
              color: active ? 'var(--text)' : 'var(--text-2)',
              borderBottom: active ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              transition: 'color .12s ease',
            }}>
              {label}
              {count != null && <span className="mono" style={{ color: 'var(--text-3)', marginLeft: 4, fontSize: 11 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px' }}>
        {tab === 'contacts' && <ContactsTab contacts={contacts} buyer={buyer}/>}
        {tab === 'enrichment' && <EnrichmentTab buyer={buyer}/>}
        {tab === 'nda' && <NDATab buyer={buyer}/>}
        {tab === 'notes' && <NotesTab/>}
        {tab === 'audit' && <AuditTab/>}
      </div>
    </Drawer>
  );
};

// --- Contacts tab: rank list with sequence timeline ---
const ContactsTab = ({ contacts, buyer }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {contacts.map(c => <ContactRow key={c.rank || c.name} c={c}/>)}
      {contacts.length < 6 && (
        <button style={{
          padding: '12px',
          border: '1px dashed var(--border-strong)',
          borderRadius: 'var(--radius)',
          color: 'var(--text-3)',
          fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Icon name="plus" size={12}/> Discover {contacts.length === 5 ? 'agent-found' : 'additional'} contact at this buyer
        </button>
      )}
    </div>
  );
};

const ContactRow = ({ c }) => {
  const [open, setOpen] = React.useState(c.state === 'replied');
  const verifierBadge = {
    apollo:      { label: 'Apollo · verified', tone: 'pos' },
    neverbounce: { label: 'NeverBounce · valid', tone: 'pos' },
    hunter:      { label: 'Hunter · valid', tone: 'pos' },
    failed:      { label: 'No verified email', tone: 'neg' },
  }[c.verified];

  const sequenceStatusTone = {
    delivered: 'info', opened: 'accent', replied: 'pos',
    queued: 'neutral', scheduled: 'neutral', pending: 'neutral',
    cancelled: 'neutral', bounced: 'neg',
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      borderLeft: c.state === 'replied' ? '2px solid var(--pos)' : '1px solid var(--border)',
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', textAlign: 'left',
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          minWidth: 22, textAlign: 'center',
          color: 'var(--text-3)',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
        }}>
          #{c.rank}
        </div>
        <Avatar initials={c.avatar} size={28} tone={c.state === 'replied' ? 'pos' : 'neutral'}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</span>
            <span style={{ color: 'var(--text-3)', fontSize: 11.5 }}>· {c.title}</span>
            {c.tenure && <span style={{ color: 'var(--text-3)', fontSize: 10.5 }}>· {c.tenure}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
            {c.email || <span style={{ color: 'var(--neg)' }}>No verified email</span>}
            {c.emailConflict && <Chip tone="warn">Conflict</Chip>}
          </div>
        </div>
        <StateChip state={c.state}/>
        {verifierBadge && <Chip tone={verifierBadge.tone}>{verifierBadge.label}</Chip>}
        <Icon name={open ? 'chevronDown' : 'chevron'} size={12} style={{ color: 'var(--text-3)' }}/>
      </button>

      {open && c.sequence.length > 0 && (
        <div style={{
          padding: '12px 14px 14px',
          borderTop: '1px solid var(--hairline)',
          background: 'var(--raised)',
        }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Sequence cadence</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {c.sequence.map((s, i) => (
              <div key={i} style={{
                flex: 1,
                padding: '8px 10px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `2px solid var(--${sequenceStatusTone[s.status] || 'neutral'})`,
                opacity: ['pending', 'cancelled'].includes(s.status) ? 0.55 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
                  <span className="mono" style={{ fontWeight: 600, fontSize: 11 }}>{s.e}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-3)' }}>· Day {s.day}</span>
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
                  {s.status}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 3, lineHeight: 1.3 }}>
                  {s.meta || s.sent || '—'}
                </div>
              </div>
            ))}
          </div>

          {c.state === 'replied' && (
            <div style={{
              marginTop: 12, padding: '10px 12px',
              background: 'var(--pos-bg)',
              border: '1px solid var(--pos-line)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Icon name="reply" size={14} style={{ color: 'var(--pos)' }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>Positive reply detected — needs your triage</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)' }}>James asks for the Flyer + NDA. Eleanor (rank #2) named as their lead.</div>
              </div>
              <Btn size="sm" variant="primary">Triage now</Btn>
            </div>
          )}

          <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
            <Btn size="sm" icon="pen">Edit cadence</Btn>
            <Btn size="sm" icon="pause">Pause contact</Btn>
            {c.phone && <Btn size="sm" icon="user">{c.phone}</Btn>}
          </div>
        </div>
      )}

      {open && c.sequence.length === 0 && (
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--hairline)',
          background: 'var(--raised)',
          fontSize: 11.5, color: 'var(--text-2)',
        }}>
          No sequence — {c.verified === 'failed' ? 'awaiting verified email' : 'cascade not yet started'}.
          <Btn size="sm" style={{ marginLeft: 12 }}>Manual enrichment</Btn>
        </div>
      )}
    </div>
  );
};

// --- Enrichment summary tab ---
const EnrichmentTab = ({ buyer }) => (
  <div>
    <SectionHeader eyebrow="Per-contact enrichment summary" title="Source attribution + conflicts" sub="All values retained — no winner selected."/>
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: 14, marginBottom: 14,
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, fontSize: 12 }}>
        <KV k="LinkedIn URL discovery" v="5 of 5 matched"/>
        <KV k="RocketReach" v="4 emails / 3 phones" tone="info"/>
        <KV k="Apollo" v="5 emails / 4 phones" tone="info"/>
        <KV k="Hunter" v="2 emails (gap-fill)" tone="info"/>
      </div>
      <hr className="rule" style={{ margin: '12px 0' }}/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, fontSize: 12 }}>
        <KV k="Conflicts retained" v="1 email · Eleanor" tone="warn"/>
        <KV k="Apollo verified" v="3 of 5" tone="pos"/>
        <KV k="NeverBounce verified" v="1 of 5"/>
        <KV k="Hunter verified" v="1 of 5"/>
      </div>
    </div>

    <SectionHeader eyebrow="Buyer-wide" title="Quality gates"/>
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: 14,
    }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Chip tone="pos" dot>Seniority floor OK</Chip>
        <Chip tone="pos" dot>No new-hires &lt; 3mo</Chip>
        <Chip tone="pos" dot>No job changes detected</Chip>
        <Chip tone="info" dot>Bounce rate 0% at this buyer</Chip>
      </div>
    </div>
  </div>
);

const KV = ({ k, v, tone }) => (
  <div>
    <div className="eyebrow" style={{ marginBottom: 2 }}>{k}</div>
    <div style={{
      fontSize: 12.5, color: tone === 'pos' ? 'var(--pos)' :
                        tone === 'warn' ? 'var(--warn)' :
                        tone === 'info' ? 'var(--accent-strong)' : 'var(--text)',
      fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums',
    }}>{v}</div>
  </div>
);

// --- NDA tab ---
const NDATab = ({ buyer }) => (
  <div>
    {buyer.state === 'nda_signed_b' || buyer.state === 'ready' ? (
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        padding: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div className="eyebrow">DocuSign envelope</div>
            <div className="mono" style={{ fontSize: 13 }}>DS-8849-C71</div>
          </div>
          <Chip tone="pos" dot>Diff clean — no material changes</Chip>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 12, fontSize: 12 }}>
          <TimelineDot tone="accent" icon="send"/>
          <div>
            <div style={{ fontWeight: 500 }}>NDA dispatched · pre-filled "Northbrook Industries Inc."</div>
            <div style={{ color: 'var(--text-3)', fontSize: 11 }}>20 May 11:04 EDT · sent by Jeremy Pak</div>
          </div>
          <TimelineDot tone="info" icon="eye"/>
          <div>
            <div style={{ fontWeight: 500 }}>Opened by Maria Lopes</div>
            <div style={{ color: 'var(--text-3)', fontSize: 11 }}>20 May 14:22 EDT · IP US-NY-Manhattan</div>
          </div>
          <TimelineDot tone="brass" icon="pen"/>
          <div>
            <div style={{ fontWeight: 500 }}>Wet-ink signed PDF uploaded</div>
            <div style={{ color: 'var(--text-3)', fontSize: 11 }}>21 May 09:38 NZST · diff OCR-scanned — 0 changes</div>
          </div>
          <TimelineDot tone="brass" icon="handoff" pulse/>
          <div>
            <div style={{ fontWeight: 500 }}>Routed to authoriser Olivia Park</div>
            <div style={{ color: 'var(--text-3)', fontSize: 11 }}>21 May 09:40 NZST · awaiting countersign — Day 4</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              <Btn size="sm" variant="primary" icon="bell">Send reminder</Btn>
              <Btn size="sm" icon="user">Override authoriser</Btn>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div style={{
        padding: 40, textAlign: 'center',
        background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)',
        color: 'var(--text-2)', fontSize: 12,
      }}>
        <Icon name="nda" size={28} style={{ color: 'var(--text-3)', marginBottom: 8 }}/>
        <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>No NDA on file yet</div>
        <div>NDA send unlocks after a positive reply.</div>
      </div>
    )}
  </div>
);

const TimelineDot = ({ tone, icon, pulse }) => (
  <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
    <div style={{
      width: 22, height: 22, borderRadius: '50%',
      background: `var(--${tone}-bg)`,
      color: `var(--${tone})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `1px solid var(--${tone}-line)`,
      zIndex: 1,
      animation: pulse ? 'vc-pulse 1.6s infinite' : 'none',
    }}>
      <Icon name={icon} size={10}/>
    </div>
  </div>
);

// --- Notes tab ---
const NotesTab = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {[
      { author: 'Jeremy Pak', when: '23 May 2026 · 15:42', body: 'Spoke with James briefly at the IPF dinner. He flagged genuine interest, said to expect a reply early this week. Mentioned Eleanor would actually run it.' },
      { author: 'Jeremy Pak', when: '19 May 2026 · 09:08', body: 'Outbound E3 looked good — tightened the angle on the cross-border buyer base. Eleanor opened E2, no reply yet.' },
      { author: 'Jeremy Pak', when: '14 May 2026 · 11:20', body: 'Initial outreach approved. James + Eleanor + Rohan look like the right cascade. Catherine has no verified email — will park.' },
    ].map((n, i) => (
      <div key={i} style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '10px 12px', fontSize: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: 500 }}>{n.author}</span>
          <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{n.when}</span>
        </div>
        <div style={{ color: 'var(--text-2)', lineHeight: 1.5 }}>{n.body}</div>
      </div>
    ))}
    <textarea placeholder="Add a call note…" style={{
      width: '100%', minHeight: 70, padding: 10,
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      resize: 'vertical', outline: 0, fontFamily: 'var(--font-sans)', fontSize: 12,
    }}/>
  </div>
);

// --- Audit tab ---
const AuditTab = () => {
  const events = [
    { t: '24 May · 11:32', evt: 'Inbound reply received', src: 'Apollo IMAP', body: 'From: j.holloway@arborfield.co.uk · classified Positive Interest 94%' },
    { t: '19 May · 09:11', evt: 'E3 dispatched · James Holloway', src: 'Apollo send', body: 'Template AUR-E3-v2, edited by Jeremy Pak (3 inline edits)' },
    { t: '17 May · 09:02', evt: 'E2 dispatched · Eleanor Whitmore', src: 'Apollo send', body: 'Template AUR-E2-v2, advisor-approved at 16 May 17:22 NZST' },
    { t: '16 May · 09:00', evt: 'E1 dispatched · Rohan Mehta', src: 'Apollo send', body: 'Cadence offset T+2 from Eleanor' },
    { t: '14 May · 09:00', evt: 'E1 dispatched · James Holloway, Eleanor Whitmore', src: 'Apollo send', body: 'Persona rank confirmed by Jeremy Pak at 13 May 14:10 NZST' },
    { t: '13 May · 14:10', evt: 'Persona ranking confirmed', src: 'HITL', body: 'Agent suggested 1: James, 2: Eleanor, 3: Rohan, 4: Priya, 5: Catherine' },
    { t: '13 May · 13:55', evt: 'Enrichment waterfall complete', src: 'Agent', body: 'RocketReach + Apollo + Hunter; 4 of 5 contacts verified, Catherine flagged' },
    { t: '13 May · 13:42', evt: 'Buyer ingested', src: 'Import', body: 'Source: comparables.ai · joined 5 contacts on entity name (fuzzy)' },
  ];
  return (
    <div>
      <SectionHeader eyebrow="Buyer-level audit · retained 7 years" sub="Showing 8 of 47 events for Arborfield Holdings" right={<Btn size="sm" icon="download">Export full</Btn>}/>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', overflow: 'hidden',
      }}>
        {events.map((e, i) => (
          <div key={i} style={{
            padding: '9px 14px',
            borderBottom: i < events.length - 1 ? '1px solid var(--hairline)' : 'none',
            display: 'grid', gridTemplateColumns: '110px 1fr 90px',
            gap: 12, fontSize: 12,
          }}>
            <span className="mono" style={{ color: 'var(--text-3)', fontSize: 11 }}>{e.t}</span>
            <div>
              <div style={{ fontWeight: 500 }}>{e.evt}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 1 }}>{e.body}</div>
            </div>
            <Chip tone="neutral">{e.src}</Chip>
          </div>
        ))}
      </div>
    </div>
  );
};

// Synthesize contacts for non-aurora buyers (lighter, since drill-down is most relevant on hero)
function synthContacts(buyer) {
  const generic = [
    { rank: 1, source: 'seed', name: 'Primary contact', title: 'CEO / MD',          avatar: 'P1', verified: 'apollo', state: 'in_sequence', sequence: [
      { e:'E1', day: 0, sent:'14 May 09:00', status:'opened', meta:'Opened 2×' },
      { e:'E2', day: 3, sent:'17 May 09:00', status:'delivered', meta:'No open' },
      { e:'E3', day: 7, sent: null, status:'queued', meta:'Queues 21 May' },
      { e:'E4', day: 14, sent: null, status:'queued', meta:'Queues 28 May' },
    ]},
    { rank: 2, source: 'seed', name: 'Secondary contact', title: 'Corp Dev / M&A', avatar: 'S2', verified: 'hunter', state: 'in_sequence', sequence: [
      { e:'E1', day: 0, sent:'16 May 09:00', status:'delivered', meta:'' },
      { e:'E2', day: 3, sent: null, status:'queued', meta:'Queues 19 May' },
      { e:'E3', day: 7, sent: null, status:'pending', meta:'' },
      { e:'E4', day: 14, sent: null, status:'pending', meta:'' },
    ]},
    { rank: 3, source: 'seed', name: 'Tertiary contact', title: 'CFO',              avatar: 'T3', verified: 'apollo', state: 'verified', sequence: [] },
  ];
  return generic.slice(0, Math.min(buyer.contacts, 3));
}

Object.assign(window, { BuyerDrawer });
