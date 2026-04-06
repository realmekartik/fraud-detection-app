import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldAlert,
  Lock,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  RotateCcw,
  Play,
  Zap,
  Clock,
  IndianRupee,
  ShieldCheck,
  AlertOctagon,
  Radio,
  MapPin,
  Landmark,
  Info,
  X
} from 'lucide-react';
import './RedTeamSimulator.css';

/* ─── CONSTANTS ────────────────────────────────────── */
const WS_URL = window.location.protocol === 'https:'
  ? `wss://${window.location.host}/ws`
  : `ws://${window.location.host}/ws`;

const DETECTION_MSG = 'STRUCTURING PATTERN DETECTED...';

const PHASE = {
  IDLE: 'idle',
  FEED: 'feed',
  DETECT: 'detect',
  CASCADE: 'cascade',
  SCORE: 'score',
};

const formatINR = (n) => '₹' + n.toLocaleString('en-IN');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
const RedTeamSimulator = ({ onNavigate }) => {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [visibleTxns, setVisibleTxns] = useState([]);
  const [runningTotal, setRunningTotal] = useState(0);
  const [totalExpected, setTotalExpected] = useState(47);
  const [showFlash, setShowFlash] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [showCascade, setShowCascade] = useState(false);
  const [cascadeBanks, setCascadeBanks] = useState([]);
  const [scoreValues, setScoreValues] = useState({ caught: 0, amount: 0, time: 0 });
  const [isResetting, setIsResetting] = useState(false);
  const [fadeClass, setFadeClass] = useState('rt-fade-in');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showPulseRing, setShowPulseRing] = useState(false);
  const [detectionDone, setDetectionDone] = useState(false);
  const [detectionData, setDetectionData] = useState(null);

  // Live alerts
  const [liveAlerts, setLiveAlerts] = useState([]);

  // Connection status
  const [wsConnected, setWsConnected] = useState(false);

  const feedRef = useRef(null);
  const wsRef = useRef(null);
  const abortRef = useRef(false);
  const simStartTime = useRef(null);
  const allTxnsRef = useRef([]);

  /* ── WEBSOCKET CONNECTION ────────────────────────── */
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        console.log('[RedTeam] WebSocket connected');
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        handleWSMessage(msg);
      };

      ws.onclose = () => {
        setWsConnected(false);
        console.log('[RedTeam] WebSocket disconnected');
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  /* ── WS MESSAGE ROUTER ──────────────────────────── */
  const handleWSMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'rt_started':
        setTotalExpected(msg.data.total);
        simStartTime.current = Date.now();
        break;

      case 'rt_transaction': {
        const tx = msg.data;
        allTxnsRef.current = [...allTxnsRef.current, tx];
        setVisibleTxns(prev => [...prev, tx]);
        setRunningTotal(prev => prev + tx.amount);
        break;
      }

      case 'rt_alert': {
        const alert = msg.data;
        setLiveAlerts(prev => [alert, ...prev].slice(0, 15));
        break;
      }

      case 'rt_detected':
        setDetectionData(msg.data);
        triggerDetectionUI(msg.data);
        break;

      case 'rt_cascade':
        setCascadeBanks(msg.data.banks);
        triggerCascadeUI();
        break;

      default:
        break;
    }
  }, []);

  /* ── AUTO-SCROLL FEED ───────────────────────────── */
  useEffect(() => {
    if (feedRef.current && phase === PHASE.FEED) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [visibleTxns, phase]);

  /* ── LAUNCH SIMULATION ──────────────────────────── */
  const runFeed = useCallback(() => {
    setPhase(PHASE.FEED);
    setVisibleTxns([]);
    setRunningTotal(0);
    setLiveAlerts([]);
    allTxnsRef.current = [];
    abortRef.current = false;

    // Try server-driven simulation first
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'start_redteam' }));
    } else {
      // Fallback: run client-side simulation
      runClientFallback();
    }
  }, []);

  /* ── CLIENT-SIDE FALLBACK (no server) ───────────── */
  const runClientFallback = useCallback(async () => {
    simStartTime.current = Date.now();
    const TOTAL = 47;

    const NAMES = [
      'Rajesh Sharma', 'Priya Patel', 'Amit Kumar', 'Sunita Devi', 'Vikram Singh',
      'Anita Reddy', 'Manoj Tiwari', 'Kavita Nair', 'Deepak Verma', 'Neha Gupta',
      'Suresh Menon', 'Pooja Joshi', 'Rakesh Yadav', 'Meena Iyer', 'Arun Mishra',
      'Divya Saxena', 'Sanjay Pillai', 'Ritu Agarwal', 'Kiran Bhat', 'Geeta Deshmukh',
      'Harish Chauhan', 'Swati Kulkarni', 'Nitin Sinha', 'Lata Pawar', 'Ashok Hegde',
      'Rekha Rao', 'Vijay Choudhary', 'Usha Pandey', 'Ramesh Naik', 'Anjali Kapoor',
      'Mohan Das', 'Sarita Bhatt', 'Pramod Jha', 'Shweta Banerjee', 'Gopal Krishnan',
      'Nirmala Shukla', 'Tushar Patil', 'Sangita Mane', 'Dinesh Thakur', 'Asha Nambiar',
      'Sunil Gowda', 'Padma Rajan', 'Rohit Malhotra', 'Kamla Tripathi', 'Ajay Deshpande',
      'Bhavna Mehta', 'Satish Kamath'
    ];
    const BANKS = ['SBI', 'PNB', 'HDFC', 'BOB', 'CNRB', 'UBIN', 'IOB', 'BOI'];
    const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur'];
    const LABELS_S = [
      'Micro-Structuring below PAN threshold', 'Cash deposit just under ₹50K limit',
      'Split transfer — same beneficiary', 'Round-trip fund bounce via NEFT',
      'Dormant A/C sudden high-value credit', 'Multiple RTGS within 30 mins',
      'UPI collect request chain detected', 'Salary A/C — atypical outflow pattern',
    ];
    const LABELS_F = [
      'CONFIRMED: Rapid Layering via shell UPI', 'CONFIRMED: Threshold Split — evading STR',
      'CONFIRMED: Shell A/C Transfer — mule chain', 'CONFIRMED: Circular fund flow — SBI→PNB→HDFC',
      'CONFIRMED: Smurfing network — 7 accounts', 'CONFIRMED: Velocity spike — ₹4.8L in 90s',
      'CONFIRMED: Mule cascade — 3-hop structure',
    ];
    const FALLBACK_ALERTS = [
      { level: 'warning', msg: 'Velocity anomaly — 12 txns from same IP in 45s' },
      { level: 'critical', msg: 'UAPA watchlist proximity match — Apex Global Trading LLC' },
      { level: 'warning', msg: 'Structuring signature match: repeated ₹49,900 deposits' },
      { level: 'info', msg: 'CTR threshold monitor — cumulative deposits nearing ₹10L' },
      { level: 'critical', msg: 'Cross-bank micro-layering: SBI → PNB → HDFC under 3 min' },
      { level: 'warning', msg: 'Dormant account (14 months) received ₹2.4L RTGS' },
    ];

    let total = 0;
    let alertIdx = 0;

    for (let i = 0; i < TOTAL; i++) {
      if (abortRef.current) return;
      const isFlagged = i >= 40;
      const name = NAMES[i % NAMES.length];
      const bank = BANKS[Math.floor(Math.random() * BANKS.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const amt = isFlagged
        ? Math.floor(Math.random() * 8000 + 45000)
        : Math.floor(Math.random() * 15000 + 9800);
      const now = new Date();

      const tx = {
        id: `TXN-RT-${String(i + 1).padStart(3, '0')}`,
        amount: amt,
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        timestamp: now.toISOString(),
        account: `XXXX${Math.floor(1000 + Math.random() * 9000)}`,
        sender: name,
        city: city,
        bank: bank,
        bankName: bank,
        ifsc: `${bank}0${Math.floor(10000 + Math.random() * 90000)}`,
        upi: name.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 99) + '@oksbi',
        type: isFlagged ? 'flagged' : 'suspicious',
        label: isFlagged ? LABELS_F[i - 40] : LABELS_S[i % LABELS_S.length],
        riskScore: isFlagged ? Math.floor(Math.random() * 10 + 90) : Math.floor(Math.random() * 25 + 55),
      };

      total += amt;
      allTxnsRef.current = [...allTxnsRef.current, tx];
      setVisibleTxns(prev => [...prev, tx]);
      setRunningTotal(total);

      // Send periodic live alerts
      if (i > 0 && i % 6 === 0 && alertIdx < FALLBACK_ALERTS.length) {
        const a = FALLBACK_ALERTS[alertIdx];
        setLiveAlerts(prev => [{
          id: `ALERT-${Date.now()}-${alertIdx}`,
          level: a.level,
          message: a.msg,
          timestamp: now.toISOString(),
          source: 'CFI-GNN Engine',
        }, ...prev].slice(0, 15));
        alertIdx++;
      }

      await sleep(isFlagged ? 350 : 80);
    }

    if (!abortRef.current) {
      const dData = {
        message: 'STRUCTURING PATTERN DETECTED',
        pattern: 'Micro-splits below ₹50,000 reporting threshold',
        confidence: 98.7,
        model: 'CFI-GNN-v3.2',
        txCount: TOTAL,
      };
      setDetectionData(dData);
      triggerDetectionUI(dData);

      await sleep(1500);
      if (!abortRef.current) {
        setCascadeBanks([
          { name: 'SBI', status: 'Node Frozen', frozenAt: new Date().toISOString(), accountsFrozen: 3 },
          { name: 'PNB', status: 'Freeze Propagated', frozenAt: new Date(Date.now() + 600).toISOString(), accountsFrozen: 2 },
          { name: 'HDFC', status: 'Network Locked', frozenAt: new Date(Date.now() + 1200).toISOString(), accountsFrozen: 4 },
        ]);
        triggerCascadeUI();
      }
    }
  }, []);

  /* ── DETECTION UI ────────────────────────────────── */
  const triggerDetectionUI = useCallback(async (data) => {
    setPhase(PHASE.DETECT);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 500);
    setShowPulseRing(true);

    const fullMsg = (data?.message || DETECTION_MSG) + '...';
    for (let i = 0; i <= fullMsg.length; i++) {
      if (abortRef.current) return;
      setTypewriterText(fullMsg.slice(0, i));
      await sleep(40);
    }
    setDetectionDone(true);
  }, []);

  /* ── CASCADE UI ──────────────────────────────────── */
  const triggerCascadeUI = useCallback(async () => {
    setPhase(PHASE.CASCADE);
    setShowCascade(true);
    await sleep(2400);
    if (!abortRef.current) showScorecard();
  }, []);

  /* ── SCORECARD COUNTERS ──────────────────────────── */
  const showScorecard = useCallback(() => {
    setPhase(PHASE.SCORE);
    const finalCaught = allTxnsRef.current.length;
    const finalAmount = allTxnsRef.current.reduce((s, t) => s + t.amount, 0);
    const elapsed = simStartTime.current ? ((Date.now() - simStartTime.current) / 1000) : 2.4;
    const finalTime = parseFloat(elapsed.toFixed(1));

    const duration = 1500;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setScoreValues({
        caught: Math.round(finalCaught * eased),
        amount: Math.round(finalAmount * eased),
        time: parseFloat((finalTime * eased).toFixed(1)),
      });
      if (step >= steps) {
        clearInterval(timer);
        setScoreValues({ caught: finalCaught, amount: finalAmount, time: finalTime });
      }
    }, interval);
  }, []);

  /* ── RESET ───────────────────────────────────────── */
  const handleReset = useCallback(async () => {
    abortRef.current = true;

    // Tell server to stop
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop_redteam' }));
    }

    setFadeClass('rt-fade-out');
    await sleep(400);
    setIsResetting(true);
    await sleep(1000);

    setPhase(PHASE.IDLE);
    setVisibleTxns([]);
    setRunningTotal(0);
    setShowFlash(false);
    setTypewriterText('');
    setShowCascade(false);
    setCascadeBanks([]);
    setScoreValues({ caught: 0, amount: 0, time: 0 });
    setShowPulseRing(false);
    setDetectionDone(false);
    setDetectionData(null);
    setLiveAlerts([]);
    allTxnsRef.current = [];
    setIsResetting(false);
    setFadeClass('rt-fade-in');
  }, []);

  /* ── COPY REPORT ─────────────────────────────────── */
  const handleCopyReport = useCallback(() => {
    const finalCaught = allTxnsRef.current.length;
    const finalAmount = allTxnsRef.current.reduce((s, t) => s + t.amount, 0);
    const report = [
      '═══ CFI RED TEAM SIMULATION REPORT ═══',
      `Date: ${new Date().toLocaleString()}`,
      `Transactions Intercepted: ${finalCaught}`,
      `Total Amount Protected: ${formatINR(finalAmount)}`,
      `Detection Time: ${scoreValues.time}s`,
      `Model: ${detectionData?.model || 'CFI-GNN-v3.2'}`,
      `Confidence: ${detectionData?.confidence || 98.7}%`,
      '',
      `Pattern: ${detectionData?.pattern || 'Structuring / Micro-Splits below ₹50,000 threshold'}`,
      `Banks Affected: ${(cascadeBanks.length ? cascadeBanks.map(b => b.name).join(' → ') : 'SBI → PNB → HDFC')}`,
      'Action Taken: Chain Freeze Initiated across CFI Network',
      '',
      `Live Alerts Generated: ${liveAlerts.length}`,
      '',
      'Generated by CFI Network Red Team Simulator',
    ].join('\n');

    navigator.clipboard.writeText(report).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  }, [scoreValues, detectionData, cascadeBanks, liveAlerts]);

  /* ── DISMISS ALERT ───────────────────────────────── */
  const dismissAlert = useCallback((id) => {
    setLiveAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  /* ── PROGRESS BAR ────────────────────────────────── */
  const progress =
    phase === PHASE.IDLE ? 0
    : phase === PHASE.FEED ? Math.min((visibleTxns.length / totalExpected) * 60, 60)
    : phase === PHASE.DETECT ? 70
    : phase === PHASE.CASCADE ? 85
    : 100;

  /* ── BANK COLORS ─────────────────────────────────── */
  const bankColorMap = {
    SBI: '#005596', PNB: '#A32020', HDFC: '#004C8F', BOB: '#F15A22',
    CNRB: '#005EB8', UBIN: '#D52B1E', IOB: '#005A9C', BOI: '#005A9C',
  };

  const cascadeData = cascadeBanks.length
    ? cascadeBanks
    : [
        { name: 'SBI', status: 'Node Frozen' },
        { name: 'PNB', status: 'Freeze Propagated' },
        { name: 'HDFC', status: 'Network Locked' },
      ];

  /* ═════════════════════════════════════════════════════
     RENDER
     ═════════════════════════════════════════════════════ */
  return (
    <div className="rt-container" style={{ position: 'relative' }}>
      {showFlash && <div className="rt-screen-flash" />}

      {isResetting && (
        <div className="rt-reset-overlay">
          <div className="rt-reset-spinner" />
          <p style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.5px' }}>
            Resetting secure environment...
          </p>
        </div>
      )}

      {copyFeedback && (
        <div className="rt-copy-feedback">
          <CheckCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          Report copied to clipboard
        </div>
      )}

      <div className={fadeClass} key={phase === PHASE.IDLE ? 'idle-key' : 'active-key'}>
        {/* ─── HEADER ─────────────────────────────── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="rt-header-glow">
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={22} color="var(--danger)" />
                Red Team Simulator
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Adversarial fraud scenario simulation — tests CFI Network detection pipeline
                {wsConnected && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '10px', color: 'var(--success)',
                    background: 'rgba(52,199,89,0.1)', padding: '2px 8px', borderRadius: '10px',
                    border: '1px solid rgba(52,199,89,0.2)',
                  }}>
                    <Radio size={10} /> LIVE
                  </span>
                )}
              </p>
            </div>

            {phase !== PHASE.IDLE && (
              <button className="rt-btn rt-btn-outline" onClick={handleReset} style={{ gap: '6px' }}>
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>

          {phase !== PHASE.IDLE && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="rt-progress-track" style={{ flex: 1 }}>
                <div className="rt-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, minWidth: '36px' }}>
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>

        {/* ─── PHASE: IDLE ────────────────────────── */}
        {phase === PHASE.IDLE && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '28px' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,59,48,0.1), rgba(157,78,221,0.1))',
              border: '2px solid rgba(255,59,48,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={40} color="var(--danger)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                Adversarial Simulation Ready
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: '1.6' }}>
                Simulates a structuring attack — 47 real-time micro-transactions streamed from the CFI server
                with Indian banking metadata (UPI IDs, IFSC codes, geo-location).
                Tests real-time detection, chain freeze propagation, and compliance response.
              </p>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px' }}>
                <span style={{ color: wsConnected ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Radio size={12} /> {wsConnected ? 'Server Connected — Live Stream Ready' : 'Server Offline — Client Simulation Mode'}
                </span>
              </div>
            </div>
            <button className="rt-start-btn" onClick={runFeed}>
              <Play size={20} /> Launch Simulation
            </button>
          </div>
        )}

        {/* ─── PHASE: FEED / DETECT ───────────────── */}
        {(phase === PHASE.FEED || phase === PHASE.DETECT) && (
          <div style={{ display: 'grid', gridTemplateColumns: liveAlerts.length > 0 ? '1fr 320px' : '1fr', gap: '20px' }}>
            {/* LEFT COLUMN — Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Running Total */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div className="rt-running-total">
                  <IndianRupee size={16} color="var(--accent-cyan)" />
                  <span style={{ color: 'var(--accent-cyan)' }}>Total Intercepted:</span>
                  <span style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>{formatINR(runningTotal)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div className="pulse" /> Live Feed — {visibleTxns.length} / {totalExpected} transactions
                </div>
              </div>

              {/* Detection Alert */}
              {phase === PHASE.DETECT && (
                <div className={`rt-alert-banner ${showPulseRing ? 'rt-pulse-ring' : ''}`}>
                  <div className="rt-alert-icon">
                    <AlertOctagon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '15px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} /> ALERT — Pattern Anomaly
                    </div>
                    <div className={detectionDone ? '' : 'rt-typewriter-cursor'} style={{ color: 'white', fontWeight: 600, fontSize: '14px', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {typewriterText}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                      {detectionData
                        ? `${detectionData.txCount} micro-splits • Model: ${detectionData.model} • Confidence: ${detectionData.confidence}%`
                        : '47 micro-splits detected below ₹50,000 threshold • Chain Freeze Initiated'}
                    </p>
                  </div>
                </div>
              )}

              {/* Transaction Feed */}
              <div className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Live Transaction Feed
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {visibleTxns.filter(t => t.type === 'flagged').length} flagged
                  </span>
                </div>

                <div className="rt-feed-container" ref={feedRef}>
                  {visibleTxns.map((tx, idx) => (
                    <div
                      key={tx.id}
                      className="rt-tx-row"
                      style={{
                        animationDelay: `${Math.min(idx * 10, 200)}ms`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: tx.type === 'flagged'
                          ? 'rgba(255, 59, 48, 0.06)'
                          : 'rgba(255, 204, 0, 0.03)',
                        borderLeft: tx.type === 'flagged'
                          ? '3px solid var(--danger)'
                          : '3px solid rgba(255, 204, 0, 0.4)',
                      }}
                    >
                      <div className={`rt-status-dot ${tx.type}`} />

                      {/* ID & Time */}
                      <div style={{ minWidth: '80px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {tx.id}
                        </span>
                        <span style={{ fontSize: '9px', color: 'rgba(148,163,184,0.6)' }}>
                          {tx.time}
                        </span>
                      </div>

                      {/* Sender + Metadata */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', color: 'white', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {tx.sender || tx.label}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px', flexWrap: 'wrap' }}>
                          {tx.bank && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <Landmark size={8} /> {tx.bank}
                            </span>
                          )}
                          {tx.city && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <MapPin size={8} /> {tx.city}
                            </span>
                          )}
                          {tx.ifsc && (
                            <span style={{ fontFamily: 'monospace', fontSize: '8px', opacity: 0.7 }}>
                              {tx.ifsc}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Risk Score */}
                      {tx.riskScore && (
                        <div style={{
                          fontSize: '10px', fontWeight: 700, minWidth: '28px', textAlign: 'center',
                          color: tx.riskScore >= 90 ? 'var(--danger)' : tx.riskScore >= 70 ? 'var(--warning)' : 'var(--text-secondary)',
                        }}>
                          {tx.riskScore}
                        </div>
                      )}

                      {/* Label (truncated) */}
                      <span style={{
                        fontSize: '10px', color: tx.type === 'flagged' ? 'rgba(248,113,113,0.9)' : 'rgba(251,191,36,0.8)',
                        maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {tx.label}
                      </span>

                      {/* Amount Badge */}
                      <span className={`rt-amount-badge ${tx.type}`}>
                        {formatINR(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Live Alerts */}
            {liveAlerts.length > 0 && (
              <div className="glass-panel" style={{ padding: '14px', height: 'fit-content', maxHeight: '540px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, color: 'var(--danger)',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <AlertTriangle size={14} /> Live Alerts
                    <span style={{
                      background: 'rgba(255,59,48,0.2)', borderRadius: '10px',
                      padding: '1px 6px', fontSize: '10px', fontWeight: 700,
                    }}>
                      {liveAlerts.length}
                    </span>
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '480px' }}>
                  {liveAlerts.map((alert) => (
                    <div key={alert.id} className="rt-tx-row" style={{
                      animationDelay: '0ms',
                      padding: '10px',
                      borderRadius: '8px',
                      background: alert.level === 'critical'
                        ? 'rgba(255,59,48,0.08)'
                        : alert.level === 'warning'
                          ? 'rgba(255,204,0,0.05)'
                          : 'rgba(0,240,255,0.04)',
                      borderLeft: `3px solid ${alert.level === 'critical' ? 'var(--danger)' : alert.level === 'warning' ? 'var(--warning)' : 'var(--accent-cyan)'}`,
                      position: 'relative',
                    }}>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        style={{
                          position: 'absolute', top: '4px', right: '4px',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          color: 'var(--text-secondary)', padding: '2px',
                        }}
                      >
                        <X size={10} />
                      </button>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, marginTop: '2px',
                          background: alert.level === 'critical'
                            ? 'rgba(255,59,48,0.15)'
                            : alert.level === 'warning'
                              ? 'rgba(255,204,0,0.12)'
                              : 'rgba(0,240,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {alert.level === 'critical' ? <AlertOctagon size={12} color="var(--danger)" />
                           : alert.level === 'warning' ? <AlertTriangle size={12} color="var(--warning)" />
                           : <Info size={12} color="var(--accent-cyan)" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px',
                            color: alert.level === 'critical' ? 'var(--danger)' : alert.level === 'warning' ? 'var(--warning)' : 'var(--accent-cyan)',
                          }}>
                            {alert.level} — {alert.source || 'CFI Engine'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'white', lineHeight: '1.4' }}>
                            {alert.message}
                          </div>
                          <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                            {new Date(alert.timestamp).toLocaleTimeString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── PHASE: CASCADE ─────────────────────── */}
        {phase === PHASE.CASCADE && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="rt-alert-banner rt-pulse-ring">
              <div className="rt-alert-icon">
                <AlertOctagon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '15px', marginBottom: '4px' }}>
                  CHAIN FREEZE INITIATED
                </div>
                <p style={{ fontSize: '13px', color: 'white' }}>
                  Propagating freeze order across CFI inter-bank network nodes...
                </p>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '28px', overflow: 'visible' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} color="var(--danger)" />
                Bank Cascade Freeze Sequence
              </div>

              <div className="rt-cascade-container">
                {cascadeData.map((bank, idx) => (
                  <React.Fragment key={bank.name}>
                    <div className={`rt-bank-card card-${idx} frozen`}>
                      <div className="rt-bank-card-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: bankColorMap[bank.name] || '#005596',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '12px', color: 'white', flexShrink: 0,
                          }}>
                            {bank.name.slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>{bank.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>{bank.status}</div>
                          </div>
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={12} />
                          {bank.frozenAt ? new Date(bank.frozenAt).toLocaleTimeString() : new Date(Date.now() + idx * 600).toLocaleTimeString()}
                        </div>

                        {bank.accountsFrozen && (
                          <div style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: 600 }}>
                            {bank.accountsFrozen} accounts frozen
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <div className="rt-lock-icon" style={{ animationDelay: `${idx * 600 + 300}ms` }}>
                            <Lock size={20} color="var(--danger)" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {idx < cascadeData.length - 1 && (
                      <svg width="60" height="40" viewBox="0 0 60 40" style={{ flexShrink: 0, overflow: 'visible' }}>
                        <line
                          className={`rt-cascade-line line-${idx}`}
                          x1="0" y1="20" x2="48" y2="20"
                          stroke="var(--danger)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <polygon
                          points="48,14 58,20 48,26"
                          fill="var(--danger)"
                          opacity="0"
                          style={{ animation: `rtFadeIn 0.3s ease ${idx === 0 ? '1000ms' : '1600ms'} forwards` }}
                        />
                      </svg>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Show alerts summary if any */}
            {liveAlerts.length > 0 && (
              <div className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} color="var(--warning)" />
                  {liveAlerts.length} alerts generated during simulation
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.2)' }}>
                    {liveAlerts.filter(a => a.level === 'critical').length} Critical
                  </span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,204,0,0.1)', color: 'var(--warning)', border: '1px solid rgba(255,204,0,0.2)' }}>
                    {liveAlerts.filter(a => a.level === 'warning').length} Warnings
                  </span>
                  <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(0,240,255,0.08)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,240,255,0.2)' }}>
                    {liveAlerts.filter(a => a.level === 'info').length} Info
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── PHASE: SCORECARD ───────────────────── */}
        {phase === PHASE.SCORE && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="rt-fade-in">
            <div style={{
              background: 'linear-gradient(135deg, rgba(52,199,89,0.08), rgba(0,240,255,0.05))',
              border: '1px solid rgba(52,199,89,0.25)',
              borderRadius: '14px', padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'rgba(52,199,89,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ShieldCheck size={22} color="var(--success)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '16px' }}>
                  Simulation Complete — Threat Neutralized
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  All {allTxnsRef.current.length} structuring transactions intercepted. Chain freeze executed across {cascadeData.length} bank nodes.
                  {liveAlerts.length > 0 && ` ${liveAlerts.length} live alerts generated.`}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div className="rt-metric-card card-cyan">
                <div className="rt-metric-label">Transactions Caught</div>
                <div className="rt-metric-value" style={{ color: 'var(--accent-cyan)' }}>
                  {scoreValues.caught}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {allTxnsRef.current.filter(t => t.type === 'suspicious').length} suspicious + {allTxnsRef.current.filter(t => t.type === 'flagged').length} flagged
                </div>
              </div>

              <div className="rt-metric-card card-green">
                <div className="rt-metric-label">Amount Protected</div>
                <div className="rt-metric-value" style={{ color: 'var(--success)' }}>
                  {formatINR(scoreValues.amount)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Structuring micro-splits blocked
                </div>
              </div>

              <div className="rt-metric-card card-amber">
                <div className="rt-metric-label">Time to Detection</div>
                <div className="rt-metric-value" style={{ color: '#f59e0b' }}>
                  {scoreValues.time}<span style={{ fontSize: '18px', fontWeight: 500, marginLeft: '4px' }}>s</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {detectionData?.model || 'CFI-GNN-v3.2'} — {detectionData?.confidence || 98.7}% confidence
                </div>
              </div>
            </div>

            {/* Alert Summary */}
            {liveAlerts.length > 0 && (
              <div className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={14} color="var(--warning)" />
                  Alert Summary ({liveAlerts.length} total)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {liveAlerts.slice(0, 6).map(alert => (
                    <div key={alert.id} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '6px 10px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.02)',
                      fontSize: '11px',
                    }}>
                      <div className={`rt-status-dot ${alert.level === 'critical' ? 'flagged' : 'suspicious'}`} />
                      <span style={{ color: 'white', flex: 1 }}>{alert.message}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '9px', fontFamily: 'monospace' }}>
                        {alert.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="rt-btn rt-btn-primary" onClick={handleCopyReport}>
                <Copy size={15} /> Share Report
              </button>
              <button className="rt-btn rt-btn-outline" onClick={() => onNavigate && onNavigate('compliance')}>
                <ExternalLink size={15} /> View in Compliance Vault
              </button>
              <button className="rt-btn rt-btn-danger" onClick={handleReset}>
                <RotateCcw size={15} /> Run Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedTeamSimulator;
