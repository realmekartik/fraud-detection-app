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
  AlertOctagon
} from 'lucide-react';
import './RedTeamSimulator.css';

/* ─── DATA ─────────────────────────────────────────── */

const TRANSACTION_DATA = Array.from({ length: 47 }, (_, i) => {
  const isFlagged = i >= 40;
  const amt = isFlagged
    ? Math.floor(Math.random() * 3000 + 45000)
    : Math.floor(Math.random() * 8000 + 9000);
  const hrs = Math.floor(Math.random() * 23);
  const mins = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  return {
    id: `TXN-RT-${String(i + 1).padStart(3, '0')}`,
    amount: amt,
    time: `${String(hrs).padStart(2, '0')}:${mins}`,
    account: `XXXX${Math.floor(1000 + Math.random() * 9000)}`,
    type: isFlagged ? 'flagged' : 'suspicious',
    label: isFlagged
      ? ['Rapid Layering', 'Threshold Split', 'Shell Transfer', 'Circular Flow', 'Smurfing', 'Velocity Spike', 'Mule Cascade'][i - 40]
      : `Micro-Structuring #${i + 1}`,
  };
});

const BANK_CASCADE = [
  { name: 'SBI', status: 'Node Frozen', color: '#005596' },
  { name: 'PNB', status: 'Freeze Propagated', color: '#A32020' },
  { name: 'HDFC', status: 'Network Locked', color: '#004C8F' },
];

const DETECTION_MSG = 'STRUCTURING PATTERN DETECTED...';

/* ─── PHASES ───────────────────────────────────────── */
const PHASE = {
  IDLE: 'idle',
  FEED: 'feed',
  DETECT: 'detect',
  CASCADE: 'cascade',
  SCORE: 'score',
};

/* ─── HELPERS ──────────────────────────────────────── */
const formatINR = (n) =>
  '₹' + n.toLocaleString('en-IN');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */

const RedTeamSimulator = ({ onNavigate }) => {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [visibleTxns, setVisibleTxns] = useState([]);
  const [runningTotal, setRunningTotal] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [showCascade, setShowCascade] = useState(false);
  const [scoreValues, setScoreValues] = useState({ caught: 0, amount: 0, time: 0 });
  const [isResetting, setIsResetting] = useState(false);
  const [fadeClass, setFadeClass] = useState('rt-fade-in');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showPulseRing, setShowPulseRing] = useState(false);
  const [detectionDone, setDetectionDone] = useState(false);

  const feedRef = useRef(null);
  const abortRef = useRef(false);

  const FINAL_CAUGHT = 47;
  const FINAL_AMOUNT = TRANSACTION_DATA.reduce((s, t) => s + t.amount, 0);
  const FINAL_TIME = 2.4; // seconds (simulated)

  /* ── TRANSACTION FEED ────────────────────────────── */
  const runFeed = useCallback(async () => {
    setPhase(PHASE.FEED);
    setVisibleTxns([]);
    setRunningTotal(0);
    abortRef.current = false;

    let total = 0;
    for (let i = 0; i < TRANSACTION_DATA.length; i++) {
      if (abortRef.current) return;
      const tx = TRANSACTION_DATA[i];
      total += tx.amount;
      setVisibleTxns((prev) => [...prev, tx]);
      setRunningTotal(total);

      // Scroll to bottom
      if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
      }

      // Slow down last 7 for dramatic effect
      await sleep(i >= 40 ? 350 : 80);
    }

    // Trigger detection moment
    if (!abortRef.current) {
      triggerDetection(total);
    }
  }, []);

  /* ── DETECTION MOMENT ────────────────────────────── */
  const triggerDetection = useCallback(async (total) => {
    setPhase(PHASE.DETECT);

    // Flash
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 500);

    // Pulse ring
    setShowPulseRing(true);

    // Typewriter
    for (let i = 0; i <= DETECTION_MSG.length; i++) {
      if (abortRef.current) return;
      setTypewriterText(DETECTION_MSG.slice(0, i));
      await sleep(45);
    }

    setDetectionDone(true);

    // Wait a moment then cascade
    await sleep(1200);
    if (!abortRef.current) {
      setPhase(PHASE.CASCADE);
      setShowCascade(true);
      // After cascade anim finishes, show scorecard
      await sleep(2400);
      if (!abortRef.current) showScorecard();
    }
  }, []);

  /* ── SCORECARD COUNTERS ──────────────────────────── */
  const showScorecard = useCallback(() => {
    setPhase(PHASE.SCORE);
    // Animate counters
    const duration = 1500;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setScoreValues({
        caught: Math.round(FINAL_CAUGHT * eased),
        amount: Math.round(FINAL_AMOUNT * eased),
        time: parseFloat((FINAL_TIME * eased).toFixed(1)),
      });

      if (step >= steps) {
        clearInterval(timer);
        setScoreValues({ caught: FINAL_CAUGHT, amount: FINAL_AMOUNT, time: FINAL_TIME });
      }
    }, interval);
  }, []);

  /* ── RESET ───────────────────────────────────────── */
  const handleReset = useCallback(async () => {
    abortRef.current = true;
    setFadeClass('rt-fade-out');

    await sleep(400);
    setIsResetting(true);

    await sleep(1000);

    // Restore initial state
    setPhase(PHASE.IDLE);
    setVisibleTxns([]);
    setRunningTotal(0);
    setShowFlash(false);
    setTypewriterText('');
    setShowCascade(false);
    setScoreValues({ caught: 0, amount: 0, time: 0 });
    setShowPulseRing(false);
    setDetectionDone(false);
    setIsResetting(false);
    setFadeClass('rt-fade-in');
  }, []);

  /* ── COPY REPORT ─────────────────────────────────── */
  const handleCopyReport = useCallback(() => {
    const report = [
      '═══ CFI RED TEAM SIMULATION REPORT ═══',
      `Date: ${new Date().toLocaleString()}`,
      `Transactions Intercepted: ${FINAL_CAUGHT}`,
      `Total Amount Protected: ${formatINR(FINAL_AMOUNT)}`,
      `Detection Time: ${FINAL_TIME}s`,
      '',
      'Pattern: Structuring / Micro-Splits below ₹50,000 threshold',
      'Banks Affected: SBI → PNB → HDFC',
      'Action Taken: Chain Freeze Initiated across CFI Network',
      '',
      'Generated by CFI Network Red Team Simulator',
    ].join('\n');

    navigator.clipboard.writeText(report).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  }, []);

  /* ── PROGRESS ────────────────────────────────────── */
  const progress =
    phase === PHASE.IDLE
      ? 0
      : phase === PHASE.FEED
        ? Math.min((visibleTxns.length / TRANSACTION_DATA.length) * 60, 60)
        : phase === PHASE.DETECT
          ? 70
          : phase === PHASE.CASCADE
            ? 85
            : 100;

  /* ═════════════════════════════════════════════════════
     RENDER
     ═════════════════════════════════════════════════════ */

  return (
    <div className="rt-container" style={{ position: 'relative' }}>
      {/* Screen Flash */}
      {showFlash && <div className="rt-screen-flash" />}

      {/* Reset Overlay */}
      {isResetting && (
        <div className="rt-reset-overlay">
          <div className="rt-reset-spinner" />
          <p style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '14px', letterSpacing: '0.5px' }}>
            Resetting secure environment...
          </p>
        </div>
      )}

      {/* Copy Feedback */}
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
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Adversarial fraud scenario simulation — tests CFI Network detection pipeline
              </p>
            </div>

            {phase !== PHASE.IDLE && (
              <button className="rt-btn rt-btn-outline" onClick={handleReset} style={{ gap: '6px' }}>
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>

          {/* Progress */}
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
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: '1.6' }}>
                Simulates a structuring attack — 47 micro-transactions designed to evade ₹50,000 reporting thresholds.
                Tests real-time detection, chain freeze propagation, and compliance response.
              </p>
            </div>
            <button className="rt-start-btn" onClick={runFeed}>
              <Play size={20} /> Launch Simulation
            </button>
          </div>
        )}

        {/* ─── PHASE: FEED / DETECT ───────────────── */}
        {(phase === PHASE.FEED || phase === PHASE.DETECT) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            {/* Running Total */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div className="rt-running-total">
                <IndianRupee size={16} color="var(--accent-cyan)" />
                <span style={{ color: 'var(--accent-cyan)' }}>Total Intercepted:</span>
                <span style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>{formatINR(runningTotal)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div className="pulse" /> Live Feed — {visibleTxns.length} / {TRANSACTION_DATA.length} transactions
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
                    47 micro-splits detected below ₹50,000 threshold • Chain Freeze Initiated
                  </p>
                </div>
              </div>
            )}

            {/* Transaction Feed */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Transaction Feed
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
                      animationDelay: `${idx * 20}ms`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
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
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace', minWidth: '100px' }}>
                      {tx.id}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '50px' }}>
                      {tx.time}
                    </span>
                    <span style={{ fontSize: '12px', color: 'white', flex: 1 }}>
                      {tx.label}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {tx.account}
                    </span>
                    <span className={`rt-amount-badge ${tx.type}`}>
                      {formatINR(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── PHASE: CASCADE ─────────────────────── */}
        {phase === PHASE.CASCADE && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Alert stays */}
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

            {/* Bank Cascade */}
            <div className="glass-panel" style={{ padding: '28px', overflow: 'visible' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} color="var(--danger)" />
                Bank Cascade Freeze Sequence
              </div>

              <div className="rt-cascade-container">
                {BANK_CASCADE.map((bank, idx) => (
                  <React.Fragment key={bank.name}>
                    {/* Bank Card */}
                    <div className={`rt-bank-card card-${idx} frozen`}>
                      <div className="rt-bank-card-inner">
                        {/* Bank Logo placeholder */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px'
                        }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: bank.color, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontWeight: 800, fontSize: '12px', color: 'white', flexShrink: 0
                          }}>
                            {bank.name.slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '15px', color: 'white' }}>{bank.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>{bank.status}</div>
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={12} />
                          {new Date(Date.now() + idx * 600).toLocaleTimeString()}
                        </div>

                        {/* Lock icon animated */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <div className="rt-lock-icon" style={{ animationDelay: `${idx * 600 + 300}ms` }}>
                            <Lock size={20} color="var(--danger)" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connecting SVG Arrow */}
                    {idx < BANK_CASCADE.length - 1 && (
                      <svg width="60" height="40" viewBox="0 0 60 40" style={{ flexShrink: 0, overflow: 'visible' }}>
                        <line
                          className={`rt-cascade-line line-${idx}`}
                          x1="0" y1="20" x2="48" y2="20"
                          stroke="var(--danger)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        {/* Arrowhead */}
                        <polygon
                          points="48,14 58,20 48,26"
                          fill="var(--danger)"
                          opacity="0"
                          style={{
                            animation: `rtFadeIn 0.3s ease ${idx === 0 ? '1000ms' : '1600ms'} forwards`,
                          }}
                        />
                      </svg>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── PHASE: SCORECARD ───────────────────── */}
        {phase === PHASE.SCORE && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="rt-fade-in">
            {/* Success Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(52,199,89,0.08), rgba(0,240,255,0.05))',
              border: '1px solid rgba(52,199,89,0.25)',
              borderRadius: '14px', padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: '14px'
            }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'rgba(52,199,89,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <ShieldCheck size={22} color="var(--success)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '16px' }}>
                  Simulation Complete — Threat Neutralized
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  All 47 structuring transactions intercepted. Chain freeze executed across 3 bank nodes.
                </p>
              </div>
            </div>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div className="rt-metric-card card-cyan">
                <div className="rt-metric-label">Transactions Caught</div>
                <div className="rt-metric-value" style={{ color: 'var(--accent-cyan)' }}>
                  {scoreValues.caught}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  40 suspicious + 7 flagged
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
                  Sub-3s response benchmark
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="rt-btn rt-btn-primary" onClick={handleCopyReport}>
                <Copy size={15} /> Share Report
              </button>
              <button
                className="rt-btn rt-btn-outline"
                onClick={() => onNavigate && onNavigate('compliance')}
              >
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
