// Enrichment screen — Clay HITL gate + persona ranking + waterfall visualization.

const Enrichment = () => {
  const [tab, setTab] = React.useState('clay');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        padding: '14px 24px 0',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow">Waterfall · RocketReach → Apollo → Hunter → Clay (HITL)</div>
            <h1 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>Enrichment</h1>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn size="sm" icon="download">Provenance export</Btn>
            <Btn size="sm" icon="sliders">Vendor config</Btn>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 0, marginTop: 14 }}>
          {[
            ['clay',    'Clay HITL gate',     1, 'warn'],
            ['persona', 'Persona ranking',    1, 'warn'],
            ['job',     'Job-change alerts',  1, 'warn'],
            ['vendors', 'Vendor performance', null, 'neutral'],
          ].map(([id, label, count, tone]) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: '10px 14px',
                marginRight: 4,
                fontSize: 12.5, fontWeight: 500,
                color: active ? 'var(--text)' : 'var(--text-2)',
                borderBottom: active ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {label}
                {count && <Chip tone={tone}>{count}</Chip>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {tab === 'clay' && <ClayGate/>}
        {tab === 'persona' && <PersonaRanking/>}
        {tab === 'job' && <JobChange/>}
        {tab === 'vendors' && <VendorPerformance/>}
      </div>
    </div>
  );
};

const ClayGate = () => {
  const g = window.VC.ENRICHMENT_GATE;
  const [skip, setSkip] = React.useState(null);

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1080 }}>
      <SectionHeader
        eyebrow="Project Aurora · HITL checkpoint"
        title={<span>Clay enrichment gate <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>— {g.unverifiedBuyers.length} buyers with gaps</span></span>}
        sub="Clay is premium and credit-billable. Apollo + Hunter got you to 73% coverage. Decide whether to top up."
      />

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 20,
        marginBottom: 16,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 24,
        }}>
          {/* Current coverage */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Current coverage</div>
            <CoverageRing pct={73} label="of 142 contacts" tone="warn"/>
            <div style={{ marginTop: 14, fontSize: 11.5 }}>
              {[
                ['RocketReach', g.before.rocketreach.coverage, 'auto'],
                ['Apollo', g.before.apollo.coverage, 'auto'],
                ['Hunter', g.before.hunter.coverage, 'auto'],
              ].map(([n, c, mode]) => (
                <div key={n} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 0',
                }}>
                  <span style={{ color: 'var(--text-2)' }}>{n}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Chip tone="pos">{mode}</Chip>
                    <span className="mono" style={{ fontSize: 11.5 }}>{Math.round(c * 100)}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* If Clay */}
          <div style={{ paddingLeft: 24, borderLeft: '1px solid var(--border)' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>If Clay runs</div>
            <CoverageRing pct={94} label="of 142 contacts" tone="pos"/>
            <div style={{ marginTop: 14, fontSize: 11.5 }}>
              <Row k="Additional emails" v={`+${g.clayProjection.additionalEmails}`} tone="pos"/>
              <Row k="Additional phones" v={`+${g.clayProjection.additionalPhones}`} tone="pos"/>
              <Row k="Buyers unlocked" v={g.clayProjection.buyersUnlocked} tone="pos"/>
              <Row k="Coverage delta" v="+21pp" tone="pos"/>
            </div>
          </div>

          {/* Cost */}
          <div style={{ paddingLeft: 24, borderLeft: '1px solid var(--border)' }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>Projected cost</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 32, fontWeight: 500,
              color: 'var(--brass)',
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}>{g.clayProjection.estimatedCost}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 14 }}>
              ≈ {g.clayProjection.estimatedCredits} credits · NZ$0.20/credit · billed monthly
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-2)' }}>
              Trailing 30-day Clay spend:<br/>
              <span className="mono" style={{ fontSize: 14, color: 'var(--text)' }}>NZ$284</span>
              <span style={{ marginLeft: 8, color: 'var(--pos)' }}>+12% retention vs no-Clay buyers</span>
            </div>
          </div>
        </div>

        <hr className="rule" style={{ margin: '20px 0' }}/>

        <div className="eyebrow" style={{ marginBottom: 8 }}>Buyers that would benefit</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {g.unverifiedBuyers.map((b, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px',
              background: 'var(--raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
            }}>
              <Icon name="building" size={11} style={{ color: 'var(--text-3)' }}/>
              <span style={{ flex: 1 }}>{b.name}</span>
              <span style={{ color: 'var(--text-3)', fontSize: 11 }}>
                <span className="mono">{b.missing}</span>/{b.contacts} unverified
              </span>
              <Btn size="sm" variant="ghost" onClick={() => setSkip(b.name)}>Skip just this</Btn>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn icon="x">Skip Clay for this mandate</Btn>
        <Btn variant="primary" icon="check" icon-right="arrow">Use Clay · approve NZ$33</Btn>
      </div>
    </div>
  );
};

const CoverageRing = ({ pct, label, tone }) => {
  const r = 32, cx = 40, cy = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const c = tone === 'pos' ? 'var(--pos)' : tone === 'warn' ? 'var(--warn)' : 'var(--accent)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg width="80" height="80">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--raised-2)" strokeWidth={6}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}/>
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="20" fontWeight="500"
          fill="var(--text)" fontFamily="var(--font-mono)">
          {pct}%
        </text>
      </svg>
      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</div>
    </div>
  );
};

const Row = ({ k, v, tone }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
    <span style={{ color: 'var(--text-2)' }}>{k}</span>
    <span className="mono" style={{
      color: tone === 'pos' ? 'var(--pos)' : tone === 'warn' ? 'var(--warn)' : 'var(--text)',
      fontSize: 11.5,
    }}>{v}</span>
  </div>
);

// --- Persona ranking HITL ---
const PersonaRanking = () => {
  const g = window.VC.PERSONA_GATE_BUYER;
  const [ranks, setRanks] = React.useState(
    Object.fromEntries(g.contacts.map(c => [c.id, c.agentRank]))
  );

  const setRank = (id, r) => setRanks(prev => ({ ...prev, [id]: r }));
  const sorted = [...g.contacts].sort((a, b) => ranks[a.id] - ranks[b.id]);

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1080 }}>
      <SectionHeader
        eyebrow="Persona waterfall · HITL · Project Aurora"
        title={<span>Confirm persona ranking for <b>{g.name}</b></span>}
        sub={`Country: ${g.country} → waterfall: Corp Dev / M&A → CEO → CFO → COO → MD → Owner → BU Head (rest-of-world)`}
        right={
          <>
            <Btn size="sm" icon="arrowDown">Revert to agent default</Btn>
            <Btn size="sm" variant="primary" icon="check">Confirm ranks · start enrichment</Btn>
          </>
        }
      />

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 1fr 120px 100px 60px',
          padding: '8px 14px',
          fontSize: 10.5, color: 'var(--text-3)',
          textTransform: 'uppercase', letterSpacing: '0.04em',
          background: 'var(--raised)',
          borderBottom: '1px solid var(--border)',
          fontWeight: 500,
        }}>
          <span>Rank</span>
          <span>Contact</span>
          <span>Title</span>
          <span>Waterfall score</span>
          <span>Agent rec</span>
          <span></span>
        </div>
        {sorted.map((c, i) => (
          <div key={c.id} style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 1fr 120px 100px 60px',
            padding: '10px 14px',
            borderBottom: '1px solid var(--hairline)',
            alignItems: 'center',
            fontSize: 12.5,
            background: i === 0 ? 'var(--accent-bg)' : 'transparent',
          }}>
            <select value={ranks[c.id]} onChange={e => setRank(c.id, +e.target.value)} style={{
              background: 'var(--raised)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '3px 5px',
              color: 'var(--text)', fontSize: 12, width: 50,
            }}>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>#{n}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar initials={c.name.split(' ').map(w => w[0]).join('')} size={22}/>
              <span style={{ fontWeight: 500 }}>{c.name}</span>
            </div>
            <span style={{ color: 'var(--text-2)' }}>{c.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                flex: 1, height: 4, background: 'var(--raised-2)', borderRadius: 1,
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${c.score * 100}%`,
                  background: c.score >= 0.9 ? 'var(--pos)' : c.score >= 0.75 ? 'var(--accent)' : 'var(--warn)',
                  borderRadius: 1,
                }}/>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>
                {c.score.toFixed(2)}
              </span>
            </div>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
              #{c.agentRank}
              {c.agentRank !== ranks[c.id] && <span style={{ color: 'var(--warn)' }}> · changed</span>}
            </span>
            <Icon name="dot" size={6} style={{ color: 'var(--text-3)', justifySelf: 'center' }}/>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 12,
        padding: '10px 14px',
        background: 'var(--info-bg)',
        border: '1px solid var(--info-line)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 12, color: 'var(--text-2)',
        display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <Icon name="info" size={13} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 1 }}/>
        <span>
          Once you confirm, the agent runs the enrichment waterfall on all 5 contacts and queues email verification.
          Rank 1 starts E1 on Day 0; ranks 2–5 cascade at +2-day offsets per the spec.
        </span>
      </div>
    </div>
  );
};

// --- Job change HITL ---
const JobChange = () => (
  <div style={{ padding: '20px 24px', maxWidth: 880 }}>
    <SectionHeader
      eyebrow="HITL · Job-change detection"
      title="Tom Sweeney has moved companies"
      sub="LinkedIn confirms move on 5 May. Pick one — Bedford Provisions outreach paused until you decide."
    />

    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: 20,
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <Avatar initials="TS" size={48} tone="warn"/>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Tom Sweeney</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ textDecoration: 'line-through', color: 'var(--text-3)' }}>VP Corp Dev · Bedford Provisions Inc.</span>
            <Icon name="arrow" size={11}/>
            <b>SVP Corp Dev · Loblaw Companies Limited</b>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            Moved 5 May · 21 days ago · spotted by LinkedIn re-scan
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <ActionCard
          icon="users"
          title="Replace at Bedford"
          desc="Find a new primary contact at Bedford using the persona waterfall. Tom drops to historical."
          tone="info"
        />
        <ActionCard
          icon="arrow"
          title="Follow Tom to Loblaw"
          desc="Add Loblaw as a new buyer in Project Aurora; Tom becomes their primary. Bedford goes to historical."
          tone="accent"
          recommended
        />
        <ActionCard
          icon="x"
          title="Drop Tom"
          desc="Mark Tom as moved, no replacement. Bedford continues with rank #2 as new primary."
          tone="neutral"
        />
      </div>
    </div>
  </div>
);

const ActionCard = ({ icon, title, desc, tone, recommended }) => (
  <button
    onClick={() => window.__demoNotice && window.__demoNotice(title)}
    style={{
    textAlign: 'left',
    padding: 14,
    background: 'var(--raised)',
    border: `1px solid var(--${tone}-line)`,
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'background .12s ease',
  }}
    onMouseEnter={e => e.currentTarget.style.background = `var(--${tone}-bg)`}
    onMouseLeave={e => e.currentTarget.style.background = 'var(--raised)'}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <Icon name={icon} size={14} style={{ color: `var(--${tone})` }}/>
      <span style={{ fontWeight: 500, fontSize: 12.5 }}>{title}</span>
      {recommended && <Chip tone="pos">Co-pilot rec</Chip>}
    </div>
    <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.45 }}>{desc}</div>
  </button>
);

const VendorPerformance = () => (
  <div style={{ padding: '20px 24px', maxWidth: 1080 }}>
    <SectionHeader title="Vendor performance · trailing 30 days" sub="Cost per verified email per vendor, plus coverage delivered."/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {[
        { name: 'RocketReach', cov: 62, cost: 'NZ$0.18', delta: '+2pp' },
        { name: 'Apollo',      cov: 71, cost: 'NZ$0.12', delta: '+5pp' },
        { name: 'Hunter',      cov: 73, cost: 'NZ$0.21', delta: '+2pp' },
        { name: 'Clay',        cov: 94, cost: 'NZ$0.20', delta: '+21pp' },
      ].map(v => (
        <div key={v.name} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 14,
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{v.name}</div>
          <Stat label="Coverage" value={`${v.cov}%`} delta={v.delta} tone="pos"/>
          <hr className="rule" style={{ margin: '10px 0' }}/>
          <Stat label="Cost / verified email" value={v.cost}/>
        </div>
      ))}
    </div>
  </div>
);

Object.assign(window, { Enrichment });
