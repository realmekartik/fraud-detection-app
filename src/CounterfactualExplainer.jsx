import React, { useState, useEffect } from 'react';
import { 
  BarChart2, ShieldAlert, ArrowRight, TrendingUp, CheckCircle, 
  Settings2, Download, FileText, Loader2, Info 
} from 'lucide-react';

const CounterfactualExplainer = ({ entityName = "Apex Global Trading LLC", baseScore = 555 }) => {
  // Config state
  const [shellLinks, setShellLinks] = useState(4);
  const [crossBorderTxns, setCrossBorderTxns] = useState(23);
  const [ckycVerified, setCkycVerified] = useState(false);
  const [velocityNormal, setVelocityNormal] = useState(false);
  const [structuringFlags, setStructuringFlags] = useState(7);
  
  // Projection state
  const [projectedScore, setProjectedScore] = useState(baseScore);
  const [scoreColor, setScoreColor] = useState('var(--danger)');
  
  // Report Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    // Math Logic from specs
    let shellBonus = (4 - shellLinks) * 35;
    let velocityBonus = velocityNormal ? 60 : 0;
    let ckycBonus = ckycVerified ? 80 : 0;
    let structuringBonus = (7 - structuringFlags) * 15;
    let crossborderBonus = (23 - crossBorderTxns) * 3;
    
    let total = baseScore + shellBonus + velocityBonus + ckycBonus + structuringBonus + crossborderBonus;
    setProjectedScore(total);
    
    // Update colors
    if (total >= 800) setScoreColor('#10b981'); // prime (emerald-500)
    else if (total >= 700) setScoreColor('#f59e0b'); // amber-500
    else setScoreColor('#ef4444'); // red-500
  }, [shellLinks, crossBorderTxns, ckycVerified, velocityNormal, structuringFlags, baseScore]);

  // Derived Values
  const currentTier = "Tier 4 (Uninsurable)";
  const getProjectedTier = (score) => {
    if (score >= 800) return "Tier 1 (Prime)";
    if (score >= 700) return "Tier 2 (Standard)";
    if (score >= 600) return "Tier 3 (Sub-Prime)";
    return "Tier 4 (Uninsurable)";
  };

  const getHighestImpact = () => {
    const impacts = [
      { name: "resolving shell company links", val: (4 - shellLinks) * 35 },
      { name: "normalizing transaction velocity", val: velocityNormal ? 60 : 0 },
      { name: "fixing CKYC mismatch", val: ckycVerified ? 80 : 0 },
      { name: "eliminating structuring flags", val: (7 - structuringFlags) * 15 },
      { name: "reducing cross-border flow", val: (23 - crossBorderTxns) * 3 }
    ];
    // Find max impact non-zero
    const active = impacts.filter(i => i.val > 0).sort((a,b) => b.val - a.val);
    return active.length > 0 ? active[0].name : "no actions taken yet";
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setReportData(null);
    
    setTimeout(() => {
      setIsGenerating(false);
      setReportData({
        id: `CF-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleString('en-IN'),
        analyst: 'admin@sbi.co.in'
      });
    }, 1500);
  };

  const handleDownload = () => {
    setToastMsg("Report saved to Compliance Vault");
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="glass-panel" style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
      {/* Mini-toast for download */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '8px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <CheckCircle size={18} /> {toastMsg}
        </div>
      )}

      <div className="panel-header" style={{ marginBottom: '24px' }}>
        <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings2 size={20} color="var(--accent-cyan)" />
          Counterfactual Scenario Engine 
          <span style={{ fontSize: '10px', background: 'rgba(0,240,255,0.1)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(0,240,255,0.2)' }}>RBI EXPLAINABILITY MODE</span>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* LEFT COL: TABLE & SLIDERS */}
        <div>
          {/* Comparison Table */}
          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
              <div>Risk Factor</div>
              <div>Current State</div>
              <div>Counterfactual (If Changed To)</div>
            </div>
            {/* Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr', padding: '12px 16px', fontSize: '13px', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0)' }}>
              <div style={{ color: 'white' }}>Shell Company Links</div>
              <div style={{ color: '#ef4444' }}>4 links</div>
              <div style={{ color: '#10b981' }}>{shellLinks} links</div>
            </div>
            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr', padding: '12px 16px', fontSize: '13px', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ color: 'white' }}>Cross-border Txns (30d)</div>
              <div style={{ color: '#ef4444' }}>23</div>
              <div style={{ color: '#10b981' }}>{crossBorderTxns}</div>
            </div>
            {/* Row 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr', padding: '12px 16px', fontSize: '13px', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0)' }}>
              <div style={{ color: 'white' }}>CKYC Verification</div>
              <div style={{ color: '#ef4444' }}>Mismatch Found</div>
              <div style={{ color: '#10b981' }}>{ckycVerified ? 'Verified' : 'Mismatch Found'}</div>
            </div>
            {/* Row 4 */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr', padding: '12px 16px', fontSize: '13px', borderBottom: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ color: 'white' }}>Avg Transaction Velocity</div>
              <div style={{ color: '#ef4444' }}>146,471 txn/hr</div>
              <div style={{ color: '#10b981' }}>{velocityNormal ? 'Under 10,000 txn/hr' : '146,471 txn/hr'}</div>
            </div>
            {/* Row 5 */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 2fr', padding: '12px 16px', fontSize: '13px', background: 'rgba(255,255,255,0)' }}>
              <div style={{ color: 'white' }}>Structuring Flags (90d)</div>
              <div style={{ color: '#ef4444' }}>7 flags</div>
              <div style={{ color: '#10b981' }}>{structuringFlags} flags</div>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Interactive Modifiers</h3>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: 'white' }}>Resolve Shell Company Links</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{shellLinks} remaining</span>
              </div>
              <input type="range" min="0" max="4" step="1" value={shellLinks} onChange={(e) => setShellLinks(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: 'white' }}>Restrict Cross-border Txns</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{crossBorderTxns} txns</span>
              </div>
              <input type="range" min="0" max="23" step="1" value={crossBorderTxns} onChange={(e) => setCrossBorderTxns(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: 'white' }}>Clear Structuring Flags</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{structuringFlags} flags</span>
              </div>
              <input type="range" min="0" max="7" step="1" value={structuringFlags} onChange={(e) => setStructuringFlags(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }} />
            </div>

            {/* Toggles masquerading as binary sliders */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '13px', color: 'white', marginBottom: '10px' }}>Normalize Txn Velocity</div>
                <input type="range" min="0" max="1" step="1" value={velocityNormal ? 1 : 0} onChange={(e) => setVelocityNormal(e.target.value === '1')} style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }} />
                <div style={{ fontSize: '11px', color: velocityNormal ? '#10b981' : 'var(--text-secondary)', textAlign: 'center', marginTop: '4px' }}>{velocityNormal ? 'ON (<10k / hr)' : 'OFF'}</div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '13px', color: 'white', marginBottom: '10px' }}>Perform CKYC Verification</div>
                <input type="range" min="0" max="1" step="1" value={ckycVerified ? 1 : 0} onChange={(e) => setCkycVerified(e.target.value === '1')} style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }} />
                <div style={{ fontSize: '11px', color: ckycVerified ? '#10b981' : 'var(--text-secondary)', textAlign: 'center', marginTop: '4px' }}>{ckycVerified ? 'VERIFIED' : 'MISMATCH'}</div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COL: SCORES & EXPLANATION */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '32px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginBottom: '24px', flexShrink: 0 }}>
            <h3 style={{ fontSize: '15px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>Projected Score Improvement</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '56px', fontWeight: '800', color: '#ef4444', lineHeight: '1', fontFamily: 'monospace' }}>
                  {baseScore}
                </div>
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px', fontWeight: 'bold' }}>Current Score</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
                <ArrowRight size={32} />
                <span style={{ fontSize: '10px', marginTop: '4px', textTransform: 'uppercase' }}>If resolved</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '56px', fontWeight: '800', color: scoreColor, lineHeight: '1', fontFamily: 'monospace', textShadow: `0 0 15px ${scoreColor}40`, transition: 'color 0.4s ease' }}>
                  {projectedScore}
                </div>
                <div style={{ fontSize: '12px', color: scoreColor, marginTop: '8px', fontWeight: 'bold', transition: 'color 0.4s ease' }}>Projected</div>
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Credit Tier:</span>
              <span style={{ fontSize: '14px', color: '#ef4444', textDecoration: projectedScore > baseScore ? 'line-through' : 'none' }}>{currentTier}</span>
              {projectedScore > baseScore && (
                <>
                  <ArrowRight size={14} color="var(--text-secondary)" />
                  <span style={{ fontSize: '14px', color: scoreColor, fontWeight: 'bold' }}>{getProjectedTier(projectedScore)}</span>
                </>
              )}
            </div>
          </div>

          <div style={{ background: 'rgba(0, 240, 255, 0.05)', borderLeft: '4px solid var(--accent-cyan)', padding: '20px', borderRadius: '0 8px 8px 0', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '14px' }}>
              <Info size={16} /> Plain Language Rationale
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'white' }}>
              If {entityName} resolves their {shellLinks} remaining shell company connections and brings cross-border activity below {Math.max(5, crossBorderTxns+1)} transactions, their projected score improves by <strong style={{color: 'var(--accent-cyan)'}}>{projectedScore - baseScore}</strong> points to <strong style={{color: scoreColor}}>{projectedScore}</strong>, moving from <strong>{currentTier}</strong> to <strong style={{color: scoreColor}}>{getProjectedTier(projectedScore)}</strong>. The single highest-impact action is <strong style={{color: 'var(--accent-cyan)'}}>{getHighestImpact()}</strong>.
            </p>
          </div>

          <div style={{ marginTop: 'auto' }}>
            {!reportData ? (
              <button 
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '15px' }}
              >
                {isGenerating ? <Loader2 size={18} className="spin" style={{marginRight: '8px'}} /> : <FileText size={18} style={{marginRight: '8px'}} />}
                {isGenerating ? 'Analyzing Explanations...' : 'Generate Counterfactual Compliance Report'}
              </button>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Generated Mock Report</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>{reportData.id}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{reportData.date}</div>
                    <div style={{ fontSize: '11px', color: 'white' }}>Analyst: {reportData.analyst}</div>
                  </div>
                </div>
                
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
                  <strong>Summary:</strong> Computed counterfactual indicates that primary constraints on credit rating are entity linkages and non-KYC compliance. Remediation leads to Prime Tier transition (+{projectedScore - baseScore} pts).
                </div>
                
                <button onClick={handleDownload} className="btn" style={{ width: '100%', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <Download size={16} style={{marginRight: '8px'}} /> Download SEC/RBI PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterfactualExplainer;
