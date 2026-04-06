import React, { useState, useMemo, useEffect } from 'react';
import { Network, ShieldAlert, AlertTriangle, CheckCircle, Activity, Lock, Users, XCircle, FileKey } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Generate bank-specific 7-layer data
const generateBankGraph = (bankId) => {
  let nodes = [];
  let edges = [];

  const addEdge = (src, tgt, amount, type) => edges.push({ source: src, target: tgt, amount, type });

  const randomStatus = (isEnd) => {
    const roll = Math.random();
    if (isEnd) return roll > 0.5 ? 'blocked' : 'frozen';
    if (roll > 0.8) return 'suspect';
    if (roll > 0.9) return 'frozen';
    return 'safe';
  };

  const getRisk = (status) => {
    if (status === 'blocked') return 99;
    if (status === 'frozen') return Math.floor(Math.random() * 10) + 90;
    if (status === 'suspect') return Math.floor(Math.random() * 40) + 50;
    return Math.floor(Math.random() * 30) + 10;
  };

  if (bankId === 'hdfc') {
    // Linear / Funnel Pattern
    nodes = [
      { id: 'h0', layer: 0, name: 'Neha Gupta', type: 'Origin', status: 'suspect', risk: 85, amount: 200000 * 83, date: '1 Hr Ago', details: 'Unusual spike in transfers' },
      { id: 'h1', layer: 1, name: 'Arjun Mehta', type: 'Intermediary', status: 'safe', risk: 20, amount: 195000 * 83, date: '50 Min Ago', details: 'Known associate' },
      { id: 'h2', layer: 2, name: 'Proxy Account', type: 'Proxy', status: 'safe', risk: 35, amount: 190000 * 83, date: '45 Min Ago', details: 'Recent account creation' },
      { id: 'h3', layer: 3, name: 'Shell Entity One', type: 'Company', status: 'suspect', risk: 88, amount: 185000 * 83, date: '40 Min Ago', details: 'Matches typologies' },
      { id: 'h4', layer: 4, name: 'Crypto Desk', type: 'Exchange', status: 'frozen', risk: 92, amount: 180000 * 83, date: '30 Min Ago', details: 'Hold applied by compliance' },
      { id: 'h5', layer: 5, name: 'Mule Wallet', type: 'Wallet', status: 'suspect', risk: 90, amount: 175000 * 83, date: '20 Min Ago', details: 'P2P Mixing detected' },
      { id: 'h6', layer: 6, name: 'Offshore Cashout', type: 'Cashout', status: 'blocked', risk: 100, amount: 175000 * 83, date: '10 Min Ago', details: 'Action blocked securely' }
    ];
    for (let i = 0; i < 6; i++) addEdge(`h${i}`, `h${i+1}`, (180000 - (i*5000)) * 83, 'Wire Transfer');
    
  } else if (bankId === 'icici') {
    // Branching
    nodes = [
      { id: 'i0', layer: 0, name: 'Rohan Das', type: 'Origin', status: 'safe', risk: 40, amount: 800000 * 83, date: '2 Hrs Ago', details: 'Corporate disembursement' },
      { id: 'i1_1', layer: 1, name: 'Priya Singh', type: 'Mule', status: 'suspect', risk: 82, amount: 400000 * 83, date: '1 Hr Ago', details: 'Split transaction' },
      { id: 'i1_2', layer: 1, name: 'Vikas Sharma', type: 'Mule', status: 'suspect', risk: 80, amount: 400000 * 83, date: '1 Hr Ago', details: 'Split transaction' },
      { id: 'i2_1', layer: 2, name: 'Dummy Node A', type: 'Proxy', status: 'safe', risk: 30, amount: 200000 * 83, date: '50 Min Ago', details: 'Domestic' },
      { id: 'i2_2', layer: 2, name: 'Dummy Node B', type: 'Proxy', status: 'frozen', risk: 95, amount: 200000 * 83, date: '50 Min Ago', details: 'Domestic' },
      { id: 'i2_3', layer: 2, name: 'Dummy Node C', type: 'Proxy', status: 'safe', risk: 25, amount: 200000 * 83, date: '50 Min Ago', details: 'Domestic' },
      { id: 'i2_4', layer: 2, name: 'Dummy Node D', type: 'Proxy', status: 'safe', risk: 20, amount: 200000 * 83, date: '50 Min Ago', details: 'Domestic' },
      { id: 'i3_1', layer: 3, name: 'Central Mixer', type: 'Mixer', status: 'suspect', risk: 89, amount: 400000 * 83, date: '40 Min Ago', details: 'Consolidation point' },
      { id: 'i3_2', layer: 3, name: 'Secondary Mixer', type: 'Mixer', status: 'suspect', risk: 85, amount: 400000 * 83, date: '40 Min Ago', details: 'Consolidation point' },
      { id: 'i4_1', layer: 4, name: 'Forex Desk M', type: 'Forex', status: 'safe', risk: 45, amount: 800000 * 83, date: '30 Min Ago', details: 'International conversion' },
      { id: 'i5_1', layer: 5, name: 'Overseas Acc 1', type: 'Bank', status: 'suspect', risk: 75, amount: 400000 * 83, date: '20 Min Ago', details: 'High risk jurisdiction' },
      { id: 'i5_2', layer: 5, name: 'Overseas Acc 2', type: 'Bank', status: 'suspect', risk: 78, amount: 400000 * 83, date: '20 Min Ago', details: 'High risk jurisdiction' },
      { id: 'i6_1', layer: 6, name: 'Final Ultimate', type: 'Cashout', status: 'blocked', risk: 99, amount: 800000 * 83, date: 'Just Now', details: 'Intercepted before withdraw' }
    ];
    addEdge('i0', 'i1_1', 400000 * 83, 'Transfer'); addEdge('i0', 'i1_2', 400000 * 83, 'Transfer');
    addEdge('i1_1', 'i2_1', 200000 * 83, 'Split'); addEdge('i1_1', 'i2_2', 200000 * 83, 'Split');
    addEdge('i1_2', 'i2_3', 200000 * 83, 'Split'); addEdge('i1_2', 'i2_4', 200000 * 83, 'Split');
    addEdge('i2_1', 'i3_1', 200000 * 83, 'Consolidate'); addEdge('i2_2', 'i3_1', 200000 * 83, 'Consolidate');
    addEdge('i2_3', 'i3_2', 200000 * 83, 'Consolidate'); addEdge('i2_4', 'i3_2', 200000 * 83, 'Consolidate');
    addEdge('i3_1', 'i4_1', 400000 * 83, 'Forex Tx'); addEdge('i3_2', 'i4_1', 400000 * 83, 'Forex Tx');
    addEdge('i4_1', 'i5_1', 400000 * 83, 'Cross-Border'); addEdge('i4_1', 'i5_2', 400000 * 83, 'Cross-Border');
    addEdge('i5_1', 'i6_1', 400000 * 83, 'Cashout'); addEdge('i5_2', 'i6_1', 400000 * 83, 'Cashout');
    
  } else {
    // SBI / Default Circular
    nodes = [
      { id: 's0_1', layer: 0, name: 'Rahul Sharma', type: 'Origin', status: 'suspect', risk: 85, amount: 150000 * 83, date: 'Just Now', details: 'Unusual volume' },
      { id: 's0_2', layer: 0, name: 'Amit Verma', type: 'Origin', status: 'safe', risk: 30, amount: 50000 * 83, date: 'Just Now', details: 'Regular salary' },
      { id: 's1_1', layer: 1, name: 'Shell Entity A', type: 'Company', status: 'suspect', risk: 90, amount: 100000 * 83, date: '1 Hr Ago', details: 'No trading history' },
      { id: 's1_2', layer: 1, name: 'Local Business', type: 'Business', status: 'safe', risk: 15, amount: 100000 * 83, date: '2 Hrs Ago', details: 'Vendor payment' },
      { id: 's2_1', layer: 2, name: 'Crypto Converter', type: 'Exchange', status: 'suspect', risk: 82, amount: 200000 * 83, date: '3 Hrs Ago', details: 'Fast swap detected' },
      { id: 's3_1', layer: 3, name: 'Web Mixer', type: 'Mixer', status: 'frozen', risk: 98, amount: 200000 * 83, date: '4 Hrs Ago', details: 'Assets frozen by court' },
      { id: 's4_1', layer: 4, name: 'Proxy Offshore 1', type: 'Proxy', status: 'suspect', risk: 75, amount: 100000 * 83, date: '5 Hrs Ago', details: 'Funnel component' },
      { id: 's4_2', layer: 4, name: 'Proxy Offshore 2', type: 'Proxy', status: 'suspect', risk: 78, amount: 100000 * 83, date: '5 Hrs Ago', details: 'Funnel component' },
      { id: 's5_1', layer: 5, name: 'Dark Vault', type: 'Wallet', status: 'suspect', risk: 88, amount: 200000 * 83, date: '6 Hrs Ago', details: 'Consolidation' },
      { id: 's6_1', layer: 6, name: 'Terminal Cashout', type: 'Cashout', status: 'blocked', risk: 99, amount: 200000 * 83, date: '7 Hrs Ago', details: 'Blocked by firewall' }
    ];
    addEdge('s0_1', 's1_1', 100000 * 83, 'Transfer'); addEdge('s0_1', 's1_2', 50000 * 83, 'Transfer');
    addEdge('s0_2', 's1_2', 50000 * 83, 'Transfer');
    addEdge('s1_1', 's2_1', 100000 * 83, 'Crypto Buy'); addEdge('s1_2', 's2_1', 100000 * 83, 'Crypto Buy');
    addEdge('s2_1', 's3_1', 200000 * 83, 'Mixer Feed');
    addEdge('s3_1', 's4_1', 100000 * 83, 'Distribution'); addEdge('s3_1', 's4_2', 100000 * 83, 'Distribution');
    addEdge('s4_1', 's5_1', 100000 * 83, 'Re-combine'); addEdge('s4_2', 's5_1', 100000 * 83, 'Re-combine');
    addEdge('s5_1', 's6_1', 200000 * 83, 'Attempted Exit');
  }

  return { nodes, edges };
};

const EntityInvestigation = ({ addToast, setComplianceLogs, selectedBank }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [focusedLayer, setFocusedLayer] = useState(null); // null means all visible
  const [hoveredEdge, setHoveredEdge] = useState(null);

  // Dynamic Data Load
  useEffect(() => {
    const { nodes: n, edges: e } = generateBankGraph(selectedBank?.id);
    setNodes(n);
    setEdges(e);
    if (n.length > 0) setSelectedEntityId(n[0].id);
    setFocusedLayer(null);
  }, [selectedBank?.id]);

  const selectedEntity = useMemo(() => nodes.find(n => n.id === selectedEntityId), [nodes, selectedEntityId]);

  // Group nodes by layer
  const layers = useMemo(() => {
    const l = Array.from({ length: 7 }, () => []);
    nodes.forEach(node => {
      if (node.layer >= 0 && node.layer <= 6) {
        l[node.layer].push(node);
      }
    });
    return l;
  }, [nodes]);

  const handleAction = (nodeId, action) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, status: action } : n));
    
    // Log to compliance
    const statusMap = { 'safe': 'CLEARED', 'suspect': 'FLAGGED', 'frozen': 'FROZEN', 'blocked': 'BLOCKED' };
    const colorMap = { 'safe': 'success', 'suspect': 'medium', 'frozen': 'high', 'blocked': 'danger' };
    const actionLabel = { 'safe': 'Marked Safe', 'suspect': 'Marked Suspect', 'frozen': 'Asset Freeze', 'blocked': 'Entity Blocked' };

    setComplianceLogs(prev => [{
      id: `ACT-${Math.floor(1000 + Math.random() * 9000)}`,
      type: `Manual Intervention (${actionLabel[action]})`,
      entity: node.name,
      author: `admin@${selectedBank?.id || 'sys'}.co.in`,
      time: 'Just Now',
      status: statusMap[action],
      statusColor: colorMap[action]
    }, ...prev]);

    addToast(`Entity ${node.name} marked as ${action.toUpperCase()}`, action === 'frozen' ? 'error' : action === 'safe' ? 'success' : 'warning');
  };

  const handleLayerBulkAction = (layerIndex, action) => {
    const layerNodes = layers[layerIndex];
    if (layerNodes.length === 0) return;

    setNodes(prev => prev.map(n => n.layer === layerIndex ? { ...n, status: action } : n));
    
    const statusMap = { 'safe': 'CLEARED', 'suspect': 'FLAGGED', 'frozen': 'FROZEN', 'blocked': 'BLOCKED' };
    const colorMap = { 'safe': 'success', 'suspect': 'medium', 'frozen': 'high', 'blocked': 'danger' };

    setComplianceLogs(prev => [{
      id: `BLK-${Math.floor(1000 + Math.random() * 9000)}`,
      type: `Bulk Layer Action (${action.toUpperCase()})`,
      entity: `Layer ${layerIndex} (All Entities)`,
      author: `admin@${selectedBank?.id || 'sys'}.co.in`,
      time: 'Just Now',
      status: statusMap[action],
      statusColor: colorMap[action]
    }, ...prev]);

    addToast(`Layer ${layerIndex} bulk action: ${action.toUpperCase()} applied to ${layerNodes.length} entities.`, action === 'frozen' ? 'error' : 'warning');
  };

  const handleChainFreeze = (startNodeId) => {
    const downstreamNodeIds = new Set([startNodeId]);
    let queue = [startNodeId];
    
    while (queue.length > 0) {
      const current = queue.shift();
      edges.forEach(edge => {
        if (edge.source === current && !downstreamNodeIds.has(edge.target)) {
          downstreamNodeIds.add(edge.target);
          queue.push(edge.target);
        }
      });
    }

    setNodes(prev => prev.map(n => downstreamNodeIds.has(n.id) ? { ...n, status: 'frozen' } : n));
    
    setComplianceLogs(prev => [{
      id: `C-FRZ-${Math.floor(1000 + Math.random() * 9000)}`,
      type: `Cascading Freeze Initiated (PMLA)`,
      entity: `${startNodeId} -> Node Chain`,
      author: `admin@${selectedBank?.id || 'sys'}.co.in`,
      time: 'Just Now',
      status: 'CHAIN FROZEN',
      statusColor: 'danger'
    }, ...prev]);

    addToast(`Chain Freezed Initiated: ${downstreamNodeIds.size} entities locked down the flow.`, 'error');
  };

  const handleSAR = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    setComplianceLogs(prev => [{
      id: `STR-${Math.floor(10000 + Math.random() * 90000)}`,
      type: `Suspicious Transaction Report`,
      entity: node.name,
      author: `admin@${selectedBank?.id || 'sys'}.co.in`,
      time: 'Just Now',
      status: 'FILED',
      statusColor: 'high'
    }, ...prev]);
    addToast(`STR filed with FIU-IND for ${node.name}. Compliance DB updated.`, 'success');
  };

  // Node Render
  const renderNode = (node) => {
    const isSelected = selectedEntityId === node.id;
    const isFaded = focusedLayer !== null && focusedLayer !== node.layer;

    let borderClass = '';
    let glowClass = '';
    let icon = <Users size={16} />;

    if (node.status === 'safe') {
      borderClass = 'border-safe';
      glowClass = 'glow-safe';
      icon = <CheckCircle size={16} color="var(--success)" />;
    } else if (node.status === 'suspect') {
      borderClass = 'border-suspect';
      glowClass = 'glow-suspect';
      icon = <AlertTriangle size={16} color="var(--warning)" />;
    } else if (node.status === 'frozen') {
      borderClass = 'border-frozen';
      glowClass = 'glow-frozen text-line-through text-warning';
      icon = <Lock size={16} color="var(--warning)" />;
    } else if (node.status === 'blocked') {
      borderClass = 'border-blocked';
      glowClass = 'glow-blocked text-line-through text-danger';
      icon = <XCircle size={16} color="var(--danger)" />;
    }

    return (
      <motion.div 
        key={node.id}
        id={`node-${node.id}`}
        className={`entity-node ${borderClass} ${isSelected ? 'selected ' + glowClass : ''}`}
        style={{ opacity: isFaded ? 0.3 : 1, transition: 'all 0.3s' }}
        onClick={() => setSelectedEntityId(node.id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="node-header">
          {icon}
          <span className="node-type">{node.type}</span>
        </div>
        <div className={`node-name ${node.status === 'blocked' ? 'striken-danger' : node.status === 'frozen' ? 'striken' : ''}`}>{node.name}</div>
        <div className="node-amount">₹{node.amount.toLocaleString('en-IN')}</div>
        <div className="node-risk-bar">
          <div className="node-risk-fill" style={{ width: `${node.risk}%`, background: node.risk > 80 ? 'var(--danger)' : node.risk > 40 ? 'var(--warning)' : 'var(--success)' }}></div>
        </div>
      </motion.div>
    );
  };

  // Rendering SVG lines is somewhat tricky exactly without full measurement mappings.
  // We'll use a simplified flexbox model and fake the SVG paths by relying on relative container mapping or fixed alignments.
  // For a purely responsive approach in standard DOM, a canvas overlay with getBoundingClientRect updates is optimal.
  // We'll implement a static-like connection visualizer via specific CSS grids and pseudo element connectors, or an overlay SVG.
  
  const [nodePositions, setNodePositions] = useState({});
  const graphContainerRef = React.useRef(null);

  useEffect(() => {
    const updatePositions = () => {
      if (!graphContainerRef.current) return;
      const rects = {};
      const containerRect = graphContainerRef.current.getBoundingClientRect();
      
      nodes.forEach(node => {
        const el = document.getElementById(`node-${node.id}`);
        if (el) {
          const elRect = el.getBoundingClientRect();
          rects[node.id] = {
            x: elRect.left - containerRect.left + elRect.width / 2,
            y: elRect.top - containerRect.top + elRect.height / 2
          };
        }
      });
      setNodePositions(rects);
    };

    // Give react time to render DOM
    setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [nodes, focusedLayer]);

  return (
    <div className="investigation-container dashboard-grid">
      {/* Top Header Controls */}
      <div className="glass-panel" data-suspicious={selectedEntity?.risk > 80 ? 'true' : 'false'} style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Viewing Network: {selectedBank?.name || 'Global'} - 7 Layer Investigation</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Filter by Layer:</span>
            <button className={`layer-btn ${focusedLayer === null ? 'active' : ''}`} onClick={() => setFocusedLayer(null)}>All</button>
            {layers.map((l, idx) => (
              l.length > 0 && <button key={idx} className={`layer-btn ${focusedLayer === idx ? 'active' : ''}`} onClick={() => setFocusedLayer(idx)}>Layer {idx}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" style={{ background: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)' }} onClick={() => addToast('Graph state snapshotted.', 'success')}>Export Snapshot</button>
        </div>
      </div>

      {/* Main 7-Layer Graph Window */}
      <div className="glass-panel" style={{ gridColumn: 'span 8', minHeight: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="panel-header" style={{ marginBottom: '0' }}>
          <div className="panel-title"><Network size={18} color="var(--accent-purple)" /> Interactive 7-Layer Flow Path</div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedBank?.id || 'default'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="graph-wrapper" 
            ref={graphContainerRef} 
            style={{ position: 'relative', flex: 1, overflowX: 'auto', overflowY: 'hidden', display: 'flex', alignItems: 'center', padding: '20px 0' }}
          >
            
            {/* SVG Overlay for Edges */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              {edges.map((edge, i) => {
                const src = nodePositions[edge.source];
                const tgt = nodePositions[edge.target];
                if (!src || !tgt) return null;
                
                const isFaded = focusedLayer !== null && (nodes.find(n => n.id === edge.source)?.layer !== focusedLayer && nodes.find(n => n.id === edge.target)?.layer !== focusedLayer);
                const isHovered = hoveredEdge === i;
                
                const pathColor = edge.amount > 100000 ? 'var(--danger)' : 'var(--accent-cyan)';
                
                return (
                  <g key={`${selectedBank?.id}-edge-${i}`}>
                    <path 
                      d={`M ${src.x} ${src.y} C ${src.x + 50} ${src.y}, ${tgt.x - 50} ${tgt.y}, ${tgt.x} ${tgt.y}`} 
                      stroke={pathColor} 
                      fill="transparent" 
                      strokeWidth={isHovered ? "4" : "2"} 
                      strokeDasharray={edge.amount > 100000 ? "" : "4,4"}
                      opacity={isFaded ? 0.1 : isHovered ? 1 : 0.6}
                      style={{ transition: 'all 0.3s' }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* HTML Nodes overlaying SVG */}
            <div className="flow-layers" style={{ display: 'flex', gap: '60px', padding: '0 40px', position: 'relative', zIndex: 2, alignItems: 'center' }}>
              {layers.map((layerNodes, layerIndex) => {
                if (layerNodes.length === 0) return null;
                return (
                  <div key={layerIndex} className="layer-col">
                    <div className="layer-heading">
                      Layer {layerIndex + 1}
                      <div className="layer-actions">
                        {focusedLayer === layerIndex && (
                          <>
                            <button onClick={() => handleLayerBulkAction(layerIndex, 'suspect')} title="Mark Layer Suspect"><AlertTriangle size={12}/></button>
                            <button onClick={() => handleLayerBulkAction(layerIndex, 'blocked')} title="Block Layer"><XCircle size={12}/></button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="layer-nodes">
                      {layerNodes.map(node => renderNode(node))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Investigation Details Panel */}
      <div className="glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="panel-title"><Activity size={18} color="var(--accent-cyan)" /> Selected Entity Status</div>
        
        {selectedEntity ? (
          <AnimatePresence mode="popLayout">
            <motion.div 
              key={selectedEntity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="entity-detail-view"
            >
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBotton: '12px' }}>
                  <h3 style={{ fontSize: '18px', margin: 0 }}>{selectedEntity.name}</h3>
                  <span className={`badge ${
                      selectedEntity.status === 'blocked' ? 'badge-high' : 
                      selectedEntity.status === 'frozen' ? 'badge-high' : 
                      selectedEntity.status === 'suspect' ? 'badge-medium' : 'badge-low'
                    }`}>
                    {selectedEntity.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="info-grid">
                  <div className="info-item">
                    <span>Entity ID / Type</span>
                    <strong>{selectedEntity.id} • {selectedEntity.type}</strong>
                  </div>
                  <div className="info-item">
                    <span>Risk Score</span>
                    <strong style={{ color: selectedEntity.risk > 80 ? 'var(--danger)' : 'var(--warning)' }}>{selectedEntity.risk}/100</strong>
                  </div>
                  <div className="info-item">
                    <span>Flow Extracted</span>
                    <strong>₹{selectedEntity.amount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="info-item">
                    <span>Velocity Score</span>
                    <strong>{selectedEntity.risk > 80 ? 'High' : 'Normal'} ({(selectedEntity.amount / Math.max(1, selectedEntity.risk)).toFixed(0)} txn/hr)</strong>
                  </div>
                  <div className="info-item">
                    <span>CKYC Validation</span>
                    <strong style={{ color: selectedEntity.risk > 80 ? 'var(--warning)' : 'var(--success)' }}>{selectedEntity.risk > 80 ? 'Mismatch found' : 'Verified'}</strong>
                  </div>
                  <div className="info-item">
                    <span>Last Activity</span>
                    <strong>{selectedEntity.date}</strong>
                  </div>
                </div>

                <div className="detail-box">
                  <strong>Analyst Context:</strong> {selectedEntity.details}
                </div>
              </div>

              <div className="action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Intervention Controls</div>
                
                <button 
                  onClick={() => handleChainFreeze(selectedEntity.id)} 
                  className="btn"
                  style={{ justifyContent: 'center', background: 'var(--danger)', color: 'white', fontWeight: 'bold' }}
                >
                  <Lock size={16} /> INITIATE CHAIN FREEZE
                </button>

                <button 
                  onClick={() => handleSAR(selectedEntity.id)} 
                  className="btn"
                  style={{ justifyContent: 'center', background: 'var(--warning)', color: 'black', fontWeight: 'bold' }}
                >
                  <FileKey size={16} /> FILE STR/SAR
                </button>

                <button 
                  onClick={() => handleAction(selectedEntity.id, 'safe')} 
                  className={`btn ${selectedEntity.status === 'safe' ? 'btn-active-safe' : 'btn-outline-safe'}`}
                  style={{ justifyContent: 'center' }}
                >
                  <CheckCircle size={16} /> Mark as Safe
                </button>
                <button 
                  onClick={() => handleAction(selectedEntity.id, 'suspect')} 
                  className={`btn ${selectedEntity.status === 'suspect' ? 'btn-active-suspect' : 'btn-outline-suspect'}`}
                  style={{ justifyContent: 'center' }}
                >
                  <AlertTriangle size={16} /> Flag as Suspect
                </button>
                <button 
                  onClick={() => handleAction(selectedEntity.id, 'frozen')} 
                  className={`btn ${selectedEntity.status === 'frozen' ? 'btn-active-frozen' : 'btn-outline-frozen'}`}
                  style={{ justifyContent: 'center' }}
                >
                  <Lock size={16} /> FREEZE (HOLD)
                </button>
                <button 
                  onClick={() => handleAction(selectedEntity.id, 'blocked')} 
                  className={`btn ${selectedEntity.status === 'blocked' ? 'btn-active-blocked' : 'btn-outline-blocked'}`}
                  style={{ justifyContent: 'center', fontWeight: 'bold', background: selectedEntity.status === 'blocked' ? 'var(--danger)' : 'rgba(255, 59, 48, 0.1)', color: selectedEntity.status === 'blocked' ? 'white' : 'var(--danger)', border: '1px solid var(--danger)' }}
                >
                  <XCircle size={16} /> BLOCK ENTITY
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Select an entity from the graph to inspect.
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityInvestigation;
