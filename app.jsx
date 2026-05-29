// Root app — wires navigation, state, modals, and the demo flow.

// True viewport switch: below 768px we render the dedicated native mobile
// tree (<MobileApp/>), not a reflow of the desktop. Tablet (768–1024px) keeps
// the responsive desktop shell (off-canvas drawer).
function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint}px)`;
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return isMobile;
}

const App = () => {
  // ----- Tweaks -----
  // useTweaks returns [values, setTweak]; theme drives the data-theme attribute.
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "theme": "dark"
  }/*EDITMODE-END*/);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
  }, [tweaks.theme]);

  const toggleTheme = () => setTweak('theme', tweaks.theme === 'dark' ? 'light' : 'dark');

  const isMobile = useIsMobile(768);

  // ----- Navigation -----
  const [nav, setNav] = React.useState('overview');
  const [copilotOpen, setCopilotOpen] = React.useState(true);
  const [dismissedCopilot, setDismissedCopilot] = React.useState(new Set());
  // Sidebar drawer is off-canvas on tablet/phone; this controls it.
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  // ----- Modals & drawers -----
  const [setupOpen, setSetupOpen] = React.useState(false);
  const [ingestOpen, setIngestOpen] = React.useState(false);
  const [directNdaOpen, setDirectNdaOpen] = React.useState(false);
  const [triageOpen, setTriageOpen] = React.useState(false);
  const [buyerDrawerId, setBuyerDrawerId] = React.useState(null);

  // ----- Demo state: tracks the hero flow progression -----
  // buyerOverrides[id] = { state, last, interested, ... }
  const [buyerOverrides, setBuyerOverrides] = React.useState({});
  const [toasts, setToasts] = React.useState([]);

  const pushToast = (toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, ...toast }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  };

  // Friendly notice for actions that would hit a backend in production.
  // Registered globally so the shared <Btn> can call it when no handler is wired.
  const demoNotice = React.useCallback((label) => {
    setToasts(t => {
      const id = Math.random().toString(36).slice(2);
      setTimeout(() => setToasts(x => x.filter(y => y.id !== id)), 4500);
      return [...t, {
        id,
        title: 'Demo mode',
        sub: label
          ? `“${label}” would call the backend in production — nothing was sent or saved.`
          : 'Front-end demonstration — no backend is connected, so nothing was sent or saved.',
        tone: 'accent',
      }];
    });
  }, []);
  React.useEffect(() => { window.__demoNotice = demoNotice; }, [demoNotice]);

  // Aggregate badges (replies + queued drafts)
  const badges = React.useMemo(() => {
    const replies = window.VC.MANDATES.reduce((s, m) => s + m.pending_replies, 0);
    const drafts = window.VC.EMAIL_QUEUE.length;
    const nda = window.VC.NDA_RECORDS.filter(r => r.state === 'awaiting_counter' || r.state === 'legal_review').length;
    // Reduce reply count when we've handled Arborfield
    const handled = buyerOverrides['b-arborfield']?.state && buyerOverrides['b-arborfield'].state !== 'replied' ? 1 : 0;
    return {
      queue: drafts,
      triage: Math.max(0, replies - handled),
      nda,
    };
  }, [buyerOverrides]);

  // ----- Hero flow handlers -----
  const handleTriageConfirm = (config) => {
    setTriageOpen(false);
    // Transition Arborfield: replied -> flyer_sent (NDA pending)
    setBuyerOverrides(p => ({
      ...p,
      'b-arborfield': {
        state: 'flyer_sent',
        last: `Flyer + NDA sent ${config.ndaMode === 'prefill' ? '(pre-filled)' : '(blank)'} — just now`,
        interested: null,
      },
    }));
    pushToast({
      title: 'Reply classified · NDA sent',
      sub: `${config.ndaMode === 'prefill' ? 'Pre-filled' : 'Blank'} NDA dispatched to James Holloway · cascade cancelled`,
      tone: 'pos',
    });
    setNav('mandate-aurora');
  };

  // Progresses Arborfield through subsequent stages — exposed in Tweaks for demo
  const advanceArborfield = () => {
    const cur = buyerOverrides['b-arborfield']?.state;
    const next = {
      flyer_sent:   { state: 'nda_signed_b',  last: 'Buyer signed DocuSign · diff clean · 22 min ago', interested: null },
      nda_signed_b: { state: 'ready',         last: 'Authoriser countersigned · just now',             interested: null },
      ready:        { state: 'meeting_req',   last: 'Meeting request sent to Eleanor · scheduler link', interested: null },
      meeting_req:  { state: 'interested_y',  last: 'Meeting booked Tue 1 Jun 09:30 BST · 30 min',    interested: true },
    }[cur];
    if (!next) return;
    setBuyerOverrides(p => ({ ...p, 'b-arborfield': next }));
    const msgs = {
      flyer_sent:   { title: 'Buyer signed NDA', sub: 'Arborfield · Diff clean — auto-routed to Olivia Park', tone: 'pos' },
      nda_signed_b: { title: 'Counter-signature complete', sub: 'Arborfield is Ready', tone: 'pos' },
      ready:        { title: 'Meeting request sent', sub: 'Templated email with Bookings link', tone: 'pos' },
      meeting_req:  { title: 'Meeting booked', sub: 'Interested = Yes — sorted to top of pipeline', tone: 'pos' },
    };
    pushToast(msgs[cur]);
  };

  // Open buyer detail
  const openBuyer = (b) => setBuyerDrawerId(b.id);

  // Reset demo state
  const resetDemo = () => {
    setBuyerOverrides({});
    setNav('overview');
    setBuyerDrawerId(null);
    setTriageOpen(false);
    pushToast({ title: 'Demo reset', sub: 'Hero flow restored to initial state', tone: 'accent' });
  };

  // Co-pilot row click — routes to relevant screen
  const handleCopilotSelect = (href) => {
    if (href === '__close__') { setCopilotOpen(false); return; }
    if (href === 'triage') { setTriageOpen(true); return; }
    if (href === 'nda') { setNav('nda'); return; }
    if (href === 'enrichment') { setNav('enrichment'); return; }
    if (href === 'mandate') { setNav('mandate-aurora'); return; }
  };

  // ----- Breadcrumb -----
  let breadcrumb = ['Velocity Capital'];
  if (nav === 'overview') breadcrumb = ['Velocity Capital', 'Overview'];
  else if (nav === 'queue') breadcrumb = ['Velocity Capital', 'Review queue'];
  else if (nav === 'triage') breadcrumb = ['Velocity Capital', 'Reply triage'];
  else if (nav === 'nda') breadcrumb = ['Velocity Capital', 'NDA workflow'];
  else if (nav === 'enrichment') breadcrumb = ['Velocity Capital', 'Enrichment'];
  else if (nav === 'mandates') breadcrumb = ['Velocity Capital', 'Mandates'];
  else if (nav.startsWith('mandate-')) {
    const m = window.VC.MANDATES.find(x => x.id === nav.replace('mandate-', ''));
    breadcrumb = ['Velocity Capital', 'Mandates', m?.name || 'Mandate'];
  }

  // ----- Current screen -----
  let currentScreen = null;
  if (nav === 'overview') {
    currentScreen = <Overview goto={setNav}/>;
  } else if (nav === 'queue') {
    currentScreen = <Queue/>;
  } else if (nav === 'triage') {
    currentScreen = <div style={{ padding: '20px 24px' }}>
      <SectionHeader eyebrow="Reply triage queue" title="Inbound replies awaiting your decision" sub="Auto-classified by the agent; you confirm or override."/>
      <button onClick={() => setTriageOpen(true)} style={{
        width: '100%', textAlign: 'left',
        padding: 14,
        background: 'var(--surface)', border: '1px solid var(--accent-line)', borderLeft: '2px solid var(--accent)',
        borderRadius: 'var(--radius)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 5,
          background: 'var(--pos-bg)', color: 'var(--pos)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="reply" size={14}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>James Holloway · Arborfield Holdings · Project Aurora</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>RE: Strategic opportunity — premium specialty food manufacturing, NZ</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            Classified Positive Interest (94%) · 14 min ago
          </div>
        </div>
        <Btn variant="primary" iconRight="chevron" onClick={(e) => { e.stopPropagation(); setTriageOpen(true); }}>Triage</Btn>
      </button>
      <div style={{ padding: 20, color: 'var(--text-3)', fontSize: 12, textAlign: 'center', marginTop: 24 }}>
        No other replies awaiting triage.
      </div>
    </div>;
  } else if (nav === 'nda') {
    currentScreen = <NDA/>;
  } else if (nav === 'enrichment') {
    currentScreen = <Enrichment/>;
  } else if (nav === 'mandates') {
    currentScreen = <Overview goto={setNav}/>;
  } else if (nav.startsWith('mandate-')) {
    const mandateId = nav.replace('mandate-', '');
    currentScreen = (
      <Mandate
        mandateId={mandateId}
        buyerOverrides={buyerOverrides}
        openBuyer={openBuyer}
        openTriage={() => setTriageOpen(true)}
        openNDA={() => setNav('nda')}
        openIngest={() => setIngestOpen(true)}
        openEnrichment={() => setNav('enrichment')}
        openDirectNda={() => setDirectNdaOpen(true)}
        advanceBuyer={advanceArborfield}
      />
    );
  }

  // Find active buyer for drawer
  const activeBuyer = buyerDrawerId
    ? ({ ...window.VC.AURORA_BUYERS.find(b => b.id === buyerDrawerId), ...(buyerOverrides[buyerDrawerId] || {}) })
    : null;

  // Modals are shared between the desktop shell and the native mobile tree
  // (the mobile "More" tab opens the same setup / ingest / direct-NDA flows).
  const sharedModals = (
    <>
      {setupOpen && <SetupModal
        onClose={() => setSetupOpen(false)}
        onCreated={() => {
          setSetupOpen(false);
          pushToast({ title: 'Mandate created', sub: 'Ready for buyer ingestion', tone: 'pos' });
        }}
      />}
      {ingestOpen && <IngestModal
        onClose={() => setIngestOpen(false)}
        onImported={() => {
          setIngestOpen(false);
          pushToast({ title: '36 buyers imported', sub: 'Enrichment waterfall starting · 1 exclusion match blocked', tone: 'accent' });
        }}
      />}
      {directNdaOpen && <DirectNdaModal
        onClose={() => setDirectNdaOpen(false)}
        onSent={() => {
          setDirectNdaOpen(false);
          pushToast({ title: 'NDA dispatched · Direct path', sub: 'DocuSign envelope created · awaiting buyer signature', tone: 'brass' });
        }}
      />}
    </>
  );

  // Shared animation keyframes (used by both surfaces).
  const keyframes = (
    <style>{`
      @keyframes vc-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      @keyframes vc-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes vc-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes vc-bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-3px); } }
      @keyframes vc-sheet-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
      @keyframes vc-slide-in { from { transform: translateX(100%); opacity: 0.6; } to { transform: translateX(0); opacity: 1; } }
    `}</style>
  );

  // ----- Native mobile surface (≤768px) -----
  if (isMobile) {
    return (
      <div style={{ height: '100dvh', overflow: 'hidden' }}>
        <MobileApp
          buyerOverrides={buyerOverrides}
          advanceArborfield={advanceArborfield}
          pushToast={pushToast}
          onOpenSetup={() => setSetupOpen(true)}
          onOpenIngest={() => setIngestOpen(true)}
          onOpenDirectNda={() => setDirectNdaOpen(true)}
          onConfirmTriage={handleTriageConfirm}
          theme={tweaks.theme}
          onToggleTheme={toggleTheme}
        />
        {sharedModals}
        <ToastHost toasts={toasts}/>
        {keyframes}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Scrim — only intercepts taps when the mobile drawer is open. */}
      <div
        className={`scrim ${mobileNavOpen ? 'open' : ''}`}
        onClick={() => setMobileNavOpen(false)}
        aria-hidden={!mobileNavOpen}
      />

      <Sidebar
        nav={nav} setNav={setNav}
        badges={badges}
        onNewMandate={() => setSetupOpen(true)}
        onDirectNda={() => setDirectNdaOpen(true)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, overflow: 'hidden',
      }}>
        <Topbar
          breadcrumb={breadcrumb}
          copilotOpen={copilotOpen}
          onCopilotToggle={() => setCopilotOpen(o => !o)}
          theme={tweaks.theme}
          onThemeToggle={toggleTheme}
          onMobileMenu={() => setMobileNavOpen(true)}
        />
        <div style={{ flex: 1, overflow: 'auto' }}>
          {currentScreen}
        </div>
      </main>

      <Copilot
        open={copilotOpen}
        dismissed={dismissedCopilot}
        onSelect={handleCopilotSelect}
        onDismiss={id => setDismissedCopilot(s => new Set([...s, id]))}
      />

      {/* Modals (shared with the mobile surface) */}
      {sharedModals}

      {/* Triage as a full overlay */}
      {triageOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 100,
          overflow: 'auto',
        }}>
          <Triage onClose={() => setTriageOpen(false)} onConfirm={handleTriageConfirm}/>
        </div>
      )}

      {/* Buyer drawer */}
      {activeBuyer && (
        <BuyerDrawer
          buyer={activeBuyer}
          onClose={() => setBuyerDrawerId(null)}
          onTriage={() => { setBuyerDrawerId(null); setTriageOpen(true); }}
          onNDA={() => { setBuyerDrawerId(null); setNav('nda'); }}
          advanceBuyer={advanceArborfield}
        />
      )}

      <ToastHost toasts={toasts}/>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakRadio
            label="Mode"
            value={tweaks.theme}
            onChange={(v) => setTweak('theme', v)}
            options={[
              { value: 'dark',  label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />
        </TweakSection>
        <TweakSection label="Demo flow">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <TweakButton onClick={() => { setNav('overview'); resetDemo(); }}>↺ Reset hero flow</TweakButton>
            <TweakButton onClick={() => { setNav('mandate-aurora'); setTriageOpen(true); }}>▶ Open Arborfield triage</TweakButton>
            <TweakButton onClick={advanceArborfield} disabled={!buyerOverrides['b-arborfield']}>
              ▶▶ Advance buyer 1 step
            </TweakButton>
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 8, lineHeight: 1.4 }}>
            Demo path: <span className="mono">Replied → Flyer/NDA sent → NDA signed → Ready → Meeting requested → Interested</span>
          </div>
        </TweakSection>
        <TweakSection label="Surfaces">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <TweakButton onClick={() => setCopilotOpen(o => !o)}>{copilotOpen ? 'Hide' : 'Show'} co-pilot panel</TweakButton>
            <TweakButton onClick={() => setSetupOpen(true)}>+ New mandate setup</TweakButton>
            <TweakButton onClick={() => setIngestOpen(true)}>+ Buyer ingestion</TweakButton>
            <TweakButton onClick={() => setDirectNdaOpen(true)}>+ Direct-NDA shortcut</TweakButton>
          </div>
        </TweakSection>
      </TweaksPanel>

      {keyframes}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
