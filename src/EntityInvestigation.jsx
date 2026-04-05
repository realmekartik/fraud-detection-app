import React, { useState, useMemo, useEffect } from 'react';
import { Network, ShieldAlert, AlertTriangle, CheckCircle, Activity, Lock, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock dataset for 7-layer flow
const initialNodes = [
  { id: 'n0', layer: 0, name: 'John Doe', type: 'Origin', status: 'suspect', risk: 95, amount: 150000, date: 'Just Now', details: 'Identified as mule origin' },
  { id: 'n1_1', layer: 1, name: 'Shell Corp A', type: 'Company', status: 'safe', risk: 20, amount: 50000, date: '1 Hr Ago', details: 'Registered 2 years ago' },
  { id: 'n1_2', layer: 1, name: 'Shell Corp B', type: 'Company', status: 'suspect', risk: 85, amount: 100000, date: '1 Hr Ago', details: 'Recently changed directors' },
  { id: 'n2_1', layer: 2, name: 'Offshore Trust', type: 'Trust', status: 'safe', risk: 40, amount: 25000, date: '3 Hrs Ago', details: 'Established in Cayman Islands' },
  { id: 'n2_2', layer: 2, name: 'Crypto Exchange X', type: 'Exchange', status: 'safe', risk: 30, amount: 75000, date: '4 Hrs Ago', details: 'Regulated exchange' },
  { id: 'n3_1', layer: 3, name: 'Wallet 1A9Q...', type: 'Wallet', status: 'suspect', risk: 90, amount: 70000, date: '5 Hrs Ago', details: 'Unverified KYC' },
  { id: 'n3_2', layer: 3, name: 'Local Bank Z', type: 'Bank', status: 'safe', risk: 10, amount: 5000, date: '6 Hrs Ago', details: 'Domestic transfer' },
  { id: 'n4_1', layer: 4, name: 'P2P Network Node', type: 'P2P', status: 'suspect', risk: 88, amount: 65000, date: '1 Day Ago', details: 'High velocity mixing' },
  { id: 'n5_1', layer: 5, name: 'Darknet Vendor', type: 'Vendor', status: 'frozen', risk: 100, amount: 60000, date: '2 Days Ago', details: 'Known illegal marketplace' },
  { id: 'n6_1', layer: 6, name: 'Final Destination', type: 'Cashout', status: 'suspect', risk: 99, amount: 55000, date: '3 Days Ago', details: 'Cashout attempt blocked' }
];

const initialEdges = [
  { source: 'n0', target: 'n1_1', amount: 50000, type: 'Wire Transfer' },
  { source: 'n0', target: 'n1_2', amount: 100000, type: 'Wire Transfer' },
  { source: 'n1_1', target: 'n2_1', amount: 25000, type: 'ACH' },
  { source: 'n1_2', target: 'n2_2', amount: 75000, type: 'Crypto Deposit' },
  { source: 'n2_2', target: 'n3_1', amount: 70000, type: 'Blockchain Tx' },
  { source: 'n2_2', target: 'n3_2', amount: 5000, type: 'Withdrawal' },
  { source: 'n3_1', target: 'n4_1', amount: 65000, type: 'P2P Mix' },
  { source: 'n4_1', target: 'n5_1', amount: 60000, type: 'Darknet Purchase' },
  { source: 'n5_1', target: 'n6_1', amount: 55000, type: 'Cashout Attempt' }
];

const EntityInvestigation = ({ addToast, setComplianceLogs, selectedBank }) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges] = useState(initialEdges);
  const [selectedEntityId, setSelectedEntityId] = useState('n0');
  const [focusedLayer, setFocusedLayer] = useState(null); // null means all visible
  const [hoveredEdge, setHoveredEdge] = useState(null);

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
    const statusMap = { 'safe': 'CLEARED', 'suspect': 'FLAGGED', 'frozen': 'BLOCKED' };
    const colorMap = { 'safe': 'success', 'suspect': 'medium', 'frozen': 'high' };
    const actionLabel = { 'safe': 'Marked Safe', 'suspect': 'Marked Suspect', 'frozen': 'Asset Freeze' };

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
    
    const statusMap = { 'safe': 'CLEARED', 'suspect': 'FLAGGED', 'frozen': 'BLOCKED' };
    const colorMap = { 'safe': 'success', 'suspect': 'medium', 'frozen': 'high' };

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
      glowClass = 'glow-frozen text-line-through text-danger';
      icon = <Lock size={16} color="var(--danger)" />;
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
        <div className={`node-name ${node.status === 'frozen' ? 'striken' : ''}`}>{node.name}</div>
        <div className="node-amount">${node.amount.toLocaleString()}</div>
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
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Active Flow Investigation: Global Node Graph</h2>
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
        
        <div className="graph-wrapper" ref={graphContainerRef} style={{ position: 'relative', flex: 1, overflowX: 'auto', overflowY: 'hidden', display: 'flex', alignItems: 'center', padding: '20px 0' }}>
          
          {/* SVG Overlay for Edges */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {edges.map((edge, i) => {
              const src = nodePositions[edge.source];
              const tgt = nodePositions[edge.target];
              if (!src || !tgt) return null;
              
              const isFaded = focusedLayer !== null && (nodes.find(n => n.id === edge.source).layer !== focusedLayer && nodes.find(n => n.id === edge.target).layer !== focusedLayer);
              const isHovered = hoveredEdge === i;
              
              const pathColor = edge.amount > 50000 ? 'var(--danger)' : 'var(--accent-cyan)';
              
              return (
                <g key={i}>
                  <path 
                    d={`M ${src.x} ${src.y} C ${src.x + 50} ${src.y}, ${tgt.x - 50} ${tgt.y}, ${tgt.x} ${tgt.y}`} 
                    stroke={pathColor} 
                    fill="transparent" 
                    strokeWidth={isHovered ? "4" : "2"} 
                    strokeDasharray={edge.amount > 50000 ? "" : "4,4"}
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
                    Layer {layerIndex}
                    <div className="layer-actions">
                      {focusedLayer === layerIndex && (
                        <>
                          <button onClick={() => handleLayerBulkAction(layerIndex, 'suspect')} title="Mark Layer Suspect"><AlertTriangle size={12}/></button>
                          <button onClick={() => handleLayerBulkAction(layerIndex, 'frozen')} title="Freeze Layer"><Lock size={12}/></button>
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
        </div>
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
                    <strong>${selectedEntity.amount.toLocaleString()}</strong>
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
                  style={{ justifyContent: 'center', fontWeight: 'bold' }}
                >
                  <Lock size={16} /> FREEZE ENTITY
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
