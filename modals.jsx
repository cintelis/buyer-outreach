// Modal screens: Mandate setup, Buyer ingestion, Direct-NDA shortcut.

// ============ MANDATE SETUP (3-step form) ============
const SetupModal = ({ onClose, onCreated }) => {
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState('');
  const [sender, setSender] = React.useState('outreach@example.com');
  const [senderDisplay, setSenderDisplay] = React.useState('Alex Morgan');
  const [template, setTemplate] = React.useState('aurora-specialty-foods-v2');
  const [authoriser, setAuthoriser] = React.useState('Olivia Park');
  const [authEmail, setAuthEmail] = React.useState('olivia.park@auroraclient.co.nz');
  const [scheduler, setScheduler] = React.useState('bookings');
  const [meetingLen, setMeetingLen] = React.useState(30);
  const [compliance, setCompliance] = React.useState(true);
  const [hubspot, setHubspot] = React.useState(false);
  const [filesDone, setFilesDone] = React.useState({ flyer: false, ndaPdf: false, ndaWord: false });

  const valid = name.length > 2 && filesDone.flyer && filesDone.ndaPdf && filesDone.ndaWord;

  return (
    <Modal open={true} onClose={onClose} width={780}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'var(--accent-bg-2)',
          color: 'var(--accent-strong)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="plus" size={14}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>New mandate</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            Configuration only — deal strategy & buyer scope stay outside the platform
          </div>
        </div>
        <Btn variant="ghost" size="sm" icon="x" onClick={onClose}/>
      </div>

      {/* Stepper */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', gap: 0, fontSize: 12,
      }}>
        {[
          ['Identity', 'Mandate name, sender, signature'],
          ['Documents', 'Flyer, NDA, OneDrive folder'],
          ['Workflow', 'Authoriser, scheduler, integrations'],
        ].map((s, i) => {
          const active = step === i + 1;
          const done = step > i + 1;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <button onClick={() => done && setStep(i + 1)} style={{
                display: 'flex', alignItems: 'center', gap: 6, flex: 1,
                opacity: !active && !done ? 0.55 : 1,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: done ? 'var(--pos)' : active ? 'var(--accent)' : 'var(--raised-2)',
                  color: done || active ? 'white' : 'var(--text-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-mono)',
                  flexShrink: 0,
                }}>
                  {done ? <Icon name="check" size={11} stroke={2.5}/> : i + 1}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 500, color: active ? 'var(--text)' : 'var(--text-2)' }}>{s[0]}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{s[1]}</div>
                </div>
              </button>
              {i < 2 && <div style={{ width: 24, height: 1, background: 'var(--border)' }}/>}
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px', flex: 1, overflow: 'auto', minHeight: 360 }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Mandate name" hint="Doubles as project code in dashboards" required>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Project Aurora"
                style={inputStyle}/>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Sender mailbox" required>
                <input value={sender} onChange={e => setSender(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}/>
              </Field>
              <Field label="Sender display name" required>
                <input value={senderDisplay} onChange={e => setSenderDisplay(e.target.value)} style={inputStyle}/>
              </Field>
            </div>
            <Field label="Signature" hint="Rich-text — per-mandate override">
              <div style={{
                padding: 12, background: 'var(--raised)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6,
              }}>
                <div style={{ fontWeight: 500, color: 'var(--text)' }}>Alex Morgan</div>
                <div>Managing Director</div>
                <div className="mono" style={{ fontSize: 11 }}>alex@example.com · +64 27 555 0188</div>
                <div style={{ marginTop: 4, color: 'var(--text-3)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                  Strategic guidance, global reach.
                </div>
              </div>
            </Field>
            <Field label="Sequence template" hint="Selected from library; will be copied for per-mandate editing">
              <select value={template} onChange={e => setTemplate(e.target.value)} style={inputStyle}>
                <option value="aurora-specialty-foods-v2">Specialty Food · Strategic-led (v2)</option>
                <option value="industrial-distribution-v1">Industrial Distribution · Mixed (v1)</option>
                <option value="b2b-saas-v3">B2B SaaS · Financial-led (v3)</option>
                <option value="generic-v1">Generic · 4-touch cold (v1)</option>
              </select>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Information Flyer (PDF)" required>
              <FileSlot
                done={filesDone.flyer}
                onClick={() => setFilesDone(p => ({ ...p, flyer: !p.flyer }))}
                placeholder="Upload PDF or link OneDrive path"
                hint="Will be sent as tracked link in E2 after positive reply"
                filename="AUR_Information_Flyer_v3.pdf"
              />
            </Field>
            <Field label="NDA (signable PDF)" required>
              <FileSlot
                done={filesDone.ndaPdf}
                onClick={() => setFilesDone(p => ({ ...p, ndaPdf: !p.ndaPdf }))}
                placeholder="Generic NDA — buyer fills entity at signing"
                hint="Used for DocuSign electronic path"
                filename="AUR_NDA_Generic_v3.pdf"
              />
            </Field>
            <Field label="NDA (Word document — redline fallback)" required hint="Includes {{buyer_entity_name}} token for pre-fill mode">
              <FileSlot
                done={filesDone.ndaWord}
                onClick={() => setFilesDone(p => ({ ...p, ndaWord: !p.ndaWord }))}
                placeholder="Word doc for buyers who request modifications"
                filename="AUR_NDA_Editable_v3.docx"
              />
            </Field>
            <Field label="OneDrive source folder">
              <input defaultValue="/VC-Mandates/AUR-2026/Documents" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}/>
            </Field>
            <div style={{
              padding: '10px 14px',
              background: 'var(--info-bg)', border: '1px solid var(--info-line)',
              borderLeft: '2px solid var(--info)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 11.5, color: 'var(--text-2)',
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <Icon name="info" size={12} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 2 }}/>
              Documents may change mid-mandate. New versions apply only to contacts who haven't yet received that document.
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="NDA Authoriser" hint="Per-buyer override available later" required>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input value={authoriser} onChange={e => setAuthoriser(e.target.value)} placeholder="Full name" style={inputStyle}/>
                <input value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="Email" style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}/>
              </div>
            </Field>
            <Field label="Meeting scheduler" required>
              <div style={{ display: 'flex', gap: 8 }}>
                <SegmentChoice active={scheduler === 'bookings'} onClick={() => setScheduler('bookings')}>
                  <Icon name="calendar" size={12}/> Microsoft Bookings
                </SegmentChoice>
                <SegmentChoice active={scheduler === 'hubspot'} onClick={() => setScheduler('hubspot')}>
                  <Icon name="calendar" size={12}/> HubSpot Meetings
                </SegmentChoice>
              </div>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Default meeting length">
                <select value={meetingLen} onChange={e => setMeetingLen(+e.target.value)} style={inputStyle}>
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </Field>
              <Field label="HubSpot CRM logging">
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px',
                  background: 'var(--raised)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
                }}>
                  <Toggle on={hubspot} onClick={() => setHubspot(!hubspot)}/>
                  <span style={{ color: hubspot ? 'var(--text)' : 'var(--text-3)' }}>
                    {hubspot ? 'On — log all events to HubSpot' : 'Off (default until HubSpot stood up)'}
                  </span>
                </label>
              </Field>
            </div>
            <Field label="Compliance footer">
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px',
                background: 'var(--raised)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', fontSize: 12, cursor: 'pointer',
              }}>
                <Toggle on={compliance} onClick={() => setCompliance(!compliance)}/>
                <span>NZ UEM Act footer · sender ID + 1-line unsubscribe</span>
              </label>
            </Field>
            <Field label="Exclusion list (optional)">
              <FileSlot
                done={false}
                onClick={() => {}}
                placeholder="Upload XLSX of buyers to exclude"
                hint="Matched on company name (fuzzy) + domain (exact)"
              />
            </Field>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
          {step === 1 ? 'Step 1 of 3' : step === 2 ? 'Step 2 of 3' : 'Step 3 of 3'} ·
          {' '}Deal strategy and buyer scope stay outside this form (by design).
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {step > 1 && <Btn icon="chevronLeft" onClick={() => setStep(s => s - 1)}>Back</Btn>}
          {step < 3 && <Btn variant="primary" iconRight="chevron" onClick={() => setStep(s => s + 1)} disabled={step === 1 && name.length < 2}>Continue</Btn>}
          {step === 3 && <Btn variant="primary" icon="check" onClick={onCreated} disabled={!valid}>Create mandate</Btn>}
        </div>
      </div>
    </Modal>
  );
};

const inputStyle = {
  width: '100%',
  background: 'var(--raised)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '6px 9px',
  color: 'var(--text)',
  fontSize: 12.5,
  outline: 0,
};

const Field = ({ label, hint, required, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontWeight: 500 }}>{label}</span>
      {required && <span style={{ color: 'var(--neg)', fontSize: 10 }}>required</span>}
      {hint && <span style={{ color: 'var(--text-3)', fontSize: 11 }}>· {hint}</span>}
    </div>
    {children}
  </label>
);

const SegmentChoice = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    flex: 1, padding: '8px 10px',
    background: active ? 'var(--accent-bg-2)' : 'var(--raised)',
    border: active ? '1px solid var(--accent-line)' : '1px solid var(--border)',
    color: active ? 'var(--accent-strong)' : 'var(--text)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12, fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  }}>{children}</button>
);

const Toggle = ({ on, onClick }) => (
  <button onClick={onClick} style={{
    width: 28, height: 16, borderRadius: 9,
    background: on ? 'var(--accent)' : 'var(--raised-2)',
    border: '1px solid var(--border)', position: 'relative',
    transition: 'background .15s ease',
    flexShrink: 0,
  }}>
    <span style={{
      position: 'absolute', top: 1, left: on ? 13 : 1,
      width: 12, height: 12, borderRadius: '50%',
      background: 'var(--surface)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      transition: 'left .15s ease',
    }}/>
  </button>
);

const FileSlot = ({ done, onClick, placeholder, hint, filename }) => (
  <button onClick={onClick} style={{
    padding: '10px 12px',
    background: done ? 'var(--pos-bg)' : 'var(--raised)',
    border: done ? '1px solid var(--pos-line)' : '1px dashed var(--border-strong)',
    borderRadius: 'var(--radius-sm)',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 10,
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: 4,
      background: done ? 'var(--pos)' : 'var(--raised-2)',
      color: done ? 'white' : 'var(--text-3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={done ? 'check' : 'upload'} size={14}/>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: done ? 'var(--pos)' : 'var(--text)' }}>
        {done ? filename : placeholder}
      </div>
      {hint && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{hint}</div>}
    </div>
    {!done && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>click to attach</span>}
  </button>
);

// ============ BUYER INGEST ============
const IngestModal = ({ onClose, onImported }) => {
  const f = window.VC.INGEST_FILE;
  const [step, setStep] = React.useState('review'); // upload / review / done

  return (
    <Modal open={true} onClose={onClose} width={920}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'var(--info-bg)', color: 'var(--info)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="upload" size={14}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Add buyers to Project Aurora</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            comparables.ai · Companies + Contacts join · exclusion cross-reference
          </div>
        </div>
        <Btn variant="ghost" size="sm" icon="x" onClick={onClose}/>
      </div>

      <div style={{ padding: '14px 20px', flex: 1, overflow: 'auto', minHeight: 420 }}>
        {/* File summary */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 14,
        }}>
          <FileBlock title="Companies XLSX" filename={f.filename.replace('list', 'companies')} rows={`${f.rows} rows`} status="parsed"/>
          <FileBlock title="Contacts XLSX" filename={f.filename.replace('list', 'contacts')} rows={`${f.contactsTotal} rows`} status="joined"/>
          <FileBlock title="Exclusion XLSX" filename="VC_global_exclusion_v8.xlsx" rows="48 rows" status="checked"/>
        </div>

        {/* Aggregate result */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 14, marginBottom: 14,
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14,
        }}>
          <Stat label="New buyers" value={f.newBuyers} tone="pos"/>
          <Stat label="Duplicates" value={f.duplicates} tone="warn"/>
          <Stat label="Exclusion match" value={f.excluded} tone="neg"/>
          <Stat label="Contacts joined" value={`${f.contactsMatched}/${f.contactsTotal}`}/>
          <Stat label="Orphan contacts" value={f.contactsOrphan} tone="warn"/>
        </div>

        {/* Preview table */}
        <SectionHeader eyebrow="Preview · first 10 rows" title="Cross-reference results"/>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--raised)', borderBottom: '1px solid var(--border)' }}>
                <Th>Company</Th>
                <Th style={{ width: 44 }}>HQ</Th>
                <Th>Domain</Th>
                <Th style={{ width: 80 }}>Contacts</Th>
                <Th style={{ width: 240 }}>Flag</Th>
              </tr>
            </thead>
            <tbody>
              {f.preview.map((b, i) => {
                const flag = b.flag === 'exclusion'    ? { tone: 'neg',  msg: '⚠ Matches exclusion list' } :
                             b.flag === 'cross_mandate' ? { tone: 'warn', msg: 'Already in Project Kingfisher' } :
                             b.flag === 'prior_optout'  ? { tone: 'warn', msg: 'Previously opted out in Cascade' } : null;
                return (
                  <tr key={i} style={{
                    borderBottom: i < f.preview.length - 1 ? '1px solid var(--hairline)' : 'none',
                    background: flag?.tone === 'neg' ? 'var(--neg-bg)' : 'transparent',
                  }}>
                    <td style={{ padding: '7px 8px', fontWeight: 500 }}>{b.co}</td>
                    <td style={{ padding: '7px 8px' }}><Flag code={b.country}/></td>
                    <td style={{ padding: '7px 8px', fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{b.domain}</td>
                    <td style={{ padding: '7px 8px' }} className="mono">{b.contacts}<span style={{ color: 'var(--text-3)' }}>/5</span></td>
                    <td style={{ padding: '7px 8px' }}>
                      {flag ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Chip tone={flag.tone}>{flag.msg}</Chip>
                          {flag.tone !== 'neg' && <button style={{ fontSize: 11, color: 'var(--accent-strong)' }}>Proceed</button>}
                          {flag.tone === 'neg' && <button style={{ fontSize: 11, color: 'var(--neg)' }}>Override (audit logged)</button>}
                        </span>
                      ) : (
                        <Chip tone="pos">Ready to enrich</Chip>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="info" size={11}/>
          Append-only after kickoff. Existing buyers can be On-Hold or Opted-Out, not deleted.
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="check" onClick={onImported}>
            Import 36 buyers · start enrichment
          </Btn>
        </div>
      </div>
    </Modal>
  );
};

const FileBlock = ({ title, filename, rows, status }) => (
  <div style={{
    flex: 1, padding: '10px 12px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center', gap: 10,
  }}>
    <div style={{
      width: 28, height: 28, borderRadius: 4,
      background: 'var(--pos-bg)', color: 'var(--pos)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name="file" size={13}/>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="eyebrow" style={{ marginBottom: 1 }}>{title}</div>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{filename}</div>
      <div style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{rows} · {status}</div>
    </div>
  </div>
);

// ============ DIRECT-NDA SHORTCUT ============
const DirectNdaModal = ({ onClose, onSent }) => {
  const [bindToMandate, setBindToMandate] = React.useState(true);
  const [mandate, setMandate] = React.useState('aurora');
  const [contactName, setContactName] = React.useState('Oliver Hartley');
  const [email, setEmail] = React.useState('o.hartley@fairwind.co.uk');
  const [buyerEntity, setBuyerEntity] = React.useState('Fairwind Acquisitions Limited');
  const [ndaMode, setNdaMode] = React.useState('prefill');

  const valid = contactName.length > 2 && email.includes('@');

  return (
    <Modal open={true} onClose={onClose} width={620}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'var(--brass-bg)', color: 'var(--brass)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="send" size={14}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Direct-NDA shortcut</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            Skip the 4-touch sequence — for buyers you already have a relationship with
          </div>
        </div>
        <Btn variant="ghost" size="sm" icon="x" onClick={onClose}/>
      </div>

      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Bind to mandate?">
          <div style={{ display: 'flex', gap: 8 }}>
            <SegmentChoice active={bindToMandate} onClick={() => setBindToMandate(true)}>
              <Icon name="pin" size={11}/> Yes — link to mandate
            </SegmentChoice>
            <SegmentChoice active={!bindToMandate} onClick={() => setBindToMandate(false)}>
              <Icon name="globe" size={11}/> Standalone (off-mandate)
            </SegmentChoice>
          </div>
          {bindToMandate && (
            <select value={mandate} onChange={e => setMandate(e.target.value)} style={{ ...inputStyle, marginTop: 8 }}>
              {window.VC.MANDATES.filter(m => m.status === 'Active').map(m =>
                <option key={m.id} value={m.id}>{m.name}</option>
              )}
            </select>
          )}
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Contact name" required>
            <input value={contactName} onChange={e => setContactName(e.target.value)} style={inputStyle}/>
          </Field>
          <Field label="Verified email" required hint="Will run through verification waterfall before send">
            <input value={email} onChange={e => setEmail(e.target.value)} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}/>
          </Field>
        </div>

        <Field label="Buyer entity name (optional)" hint="Pre-fills NDA token if provided">
          <input value={buyerEntity} onChange={e => setBuyerEntity(e.target.value)} style={inputStyle}/>
        </Field>

        <Field label="NDA send mode">
          <div style={{ display: 'flex', gap: 8 }}>
            <SegmentChoice active={ndaMode === 'blank'} onClick={() => setNdaMode('blank')}>Blank</SegmentChoice>
            <SegmentChoice active={ndaMode === 'prefill'} onClick={() => setNdaMode('prefill')}>Pre-filled</SegmentChoice>
          </div>
        </Field>

        <div style={{
          padding: '10px 12px',
          background: 'var(--brass-bg)', border: '1px solid var(--brass-line)',
          borderLeft: '2px solid var(--brass)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 11.5, color: 'var(--text-2)',
          display: 'flex', gap: 8, alignItems: 'flex-start',
        }}>
          <Icon name="info" size={12} style={{ color: 'var(--brass)', flexShrink: 0, marginTop: 1 }}/>
          Buyer appears in {bindToMandate ? 'the mandate dashboard with a' : 'a standalone view tagged'} Direct NDA marker. Full NDA workflow applies — three paths, diff detection, countersign routing, stale alerts.
        </div>
      </div>

      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'flex-end', gap: 6,
      }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" icon="send" disabled={!valid} onClick={onSent}>
          Send NDA · {ndaMode === 'prefill' ? 'pre-filled' : 'blank'}
        </Btn>
      </div>
    </Modal>
  );
};

Object.assign(window, { SetupModal, IngestModal, DirectNdaModal });
