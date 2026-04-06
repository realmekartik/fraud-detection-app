import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';

// ─── Fraud data ────────────────────────────────────────────────────────────────
const FRAUD_SCORES = {
  'Maharashtra': 89,
  'Delhi': 94,
  'Uttar Pradesh': 78,
  'Gujarat': 72,
  'Rajasthan': 65,
  'West Bengal': 71,
  'Tamil Nadu': 58,
  'Karnataka': 63,
  'Telangana': 55,
  'Madhya Pradesh': 69,
  'Bihar': 76,
  'Jharkhand': 70,
  'Punjab': 61,
  'Haryana': 67,
  'Odisha': 52,
};

// Seeded random for "other" states to stay consistent across renders
const seededRnd = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const FRAUD_TYPES = [
  'UPI Structuring',
  'Shell Company Network',
  'Mule Account Cluster',
  'Crypto Layering',
  'Identity Fraud',
];

const WANTED_ENTITIES = [
  'Apex Global Trading LLC',
  'Victor Reznov',
  'Starlight Logistics Inc',
  'Crimson Tech Pvt Ltd',
  'Orion Brokerage Partners',
];

const TOP5 = [
  { name: 'Delhi', score: 94, emoji: '🔴' },
  { name: 'Maharashtra', score: 89, emoji: '🔴' },
  { name: 'Uttar Pradesh', score: 78, emoji: '🟠' },
  { name: 'Bihar', score: 76, emoji: '🟠' },
  { name: 'West Bengal', score: 71, emoji: '🟡' },
];

const PULSE_CITIES = [
  { name: 'Mumbai', coords: [72.88, 19.07] },
  { name: 'Delhi', coords: [77.10, 28.70] },
  { name: 'Kolkata', coords: [88.36, 22.57] },
  { name: 'Ahmedabad', coords: [72.58, 23.03] },
  { name: 'Lucknow', coords: [80.95, 26.85] },
];

const FILTER_MULT = { all: 1.0, upi: 0.9, aml: 1.1 };

const GEOJSON_URL =
  'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson';

// ─── Color scale builder ───────────────────────────────────────────────────────
const buildColorScale = (multiplier = 1.0) =>
  d3
    .scaleSequential()
    .domain([0, 100])
    .interpolator(d3.interpolateRgb('#1e293b', '#dc2626'))
    .clamp(true);

// ─── Component ─────────────────────────────────────────────────────────────────
export default function IndiaFraudHeatmap() {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const zoomRef = useRef(null);
  const gRef = useRef(null); // main <g> inside SVG

  const [tooltip, setTooltip] = useState(null); // { x, y, state, score, idx }
  const [filter, setFilter] = useState('all');
  const [geoData, setGeoData] = useState(null);
  const [stateScoreMap, setStateScoreMap] = useState({});
  const [ready, setReady] = useState(false);
  const [highlightState, setHighlightState] = useState(null);

  // ── Build per-state score map (with seeded randoms for unknowns) ─────────────
  const buildScoreMap = useCallback(
    (mult) => {
      if (!geoData) return {};
      const rnd = seededRnd(42);
      const map = {};
      geoData.features.forEach((f, i) => {
        const name =
          f.properties.NAME_1 ||
          f.properties.ST_NM ||
          f.properties.name ||
          `State_${i}`;
        const base = FRAUD_SCORES[name] ?? Math.round(rnd() * 15 + 30);
        map[name] = Math.min(100, Math.round(base * mult));
      });
      return map;
    },
    [geoData]
  );

  // ── Load GeoJSON ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => {
        // The endpoint may return GeoJSON directly or TopoJSON
        let featureCollection;
        if (data.type === 'Topology') {
          const layerKey = Object.keys(data.objects)[0];
          featureCollection = feature(data, data.objects[layerKey]);
        } else {
          featureCollection = data;
        }
        setGeoData(featureCollection);
      })
      .catch(console.error);
  }, []);

  // ── Rebuild score map when filter or geoData changes ────────────────────────
  useEffect(() => {
    if (!geoData) return;
    setStateScoreMap(buildScoreMap(FILTER_MULT[filter]));
  }, [filter, geoData, buildScoreMap]);

  // ── Draw / update the map ────────────────────────────────────────────────────
  useEffect(() => {
    if (!geoData || !svgRef.current || Object.keys(stateScoreMap).length === 0)
      return;

    const wrapper = wrapperRef.current;
    const width = wrapper.clientWidth || 700;
    const height = wrapper.clientHeight || 520;

    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);

    // Clear & rebuild
    svg.selectAll('*').remove();

    // Defs — glow filter
    const defs = svg.append('defs');
    const glow = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    glow
      .append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');
    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Gradient for legend
    const lgr = defs
      .append('linearGradient')
      .attr('id', 'legendGrad')
      .attr('x1', '0%')
      .attr('x2', '100%');
    lgr.append('stop').attr('offset', '0%').attr('stop-color', '#1e293b');
    lgr.append('stop').attr('offset', '50%').attr('stop-color', '#d97706');
    lgr.append('stop').attr('offset', '100%').attr('stop-color', '#dc2626');

    // Projection
    const projection = d3
      .geoMercator()
      .fitSize([width - 20, height - 60], geoData);

    const pathGen = d3.geoPath().projection(projection);
    const colorScale = buildColorScale();

    // Main group
    const g = svg.append('g').attr('transform', 'translate(10, 10)');
    gRef.current = g.node();

    // Zoom behaviour
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on('zoom', (e) => g.attr('transform', e.transform));
    zoomRef.current = zoom;
    svg.call(zoom);

    // ── State paths ─────────────────────────────────────────────────────────────
    const paths = g
      .selectAll('path.state')
      .data(geoData.features)
      .join('path')
      .attr('class', 'state')
      .attr('d', pathGen)
      .attr('fill', '#0f172a')
      .attr('stroke', '#164e63')
      .attr('stroke-width', 0.8)
      .style('opacity', 0)
      .style('cursor', 'pointer');

    // Stagger fade-in
    paths
      .transition()
      .delay((_, i) => i * 20)
      .duration(400)
      .style('opacity', 1);

    // Color fill after 500ms
    paths
      .transition()
      .delay((_, i) => 500 + i * 20)
      .duration(800)
      .attr('fill', (d) => {
        const name =
          d.properties.NAME_1 ||
          d.properties.ST_NM ||
          d.properties.name ||
          '';
        const score = stateScoreMap[name] ?? 35;
        return colorScale(score);
      });

    // Hover interactions
    paths
      .on('mousemove', function (event, d) {
        const name =
          d.properties.NAME_1 ||
          d.properties.ST_NM ||
          d.properties.name ||
          'Unknown';
        const score = stateScoreMap[name] ?? 35;
        const idx = geoData.features.indexOf(d);
        const [mx, my] = d3.pointer(event, wrapper);
        setTooltip({ x: mx, y: my, name, score, idx });

        d3.select(this)
          .raise()
          .attr('stroke', '#00f0ff')
          .attr('stroke-width', 1.5)
          .attr('filter', 'url(#glow)');
      })
      .on('mouseleave', function () {
        setTooltip(null);
        d3.select(this)
          .attr('stroke', '#164e63')
          .attr('stroke-width', 0.8)
          .attr('filter', null);
      });

    // ── Pulse markers ──────────────────────────────────────────────────────────
    const markerG = g.append('g').attr('class', 'markers').style('opacity', 0);

    markerG
      .transition()
      .delay(1000)
      .duration(600)
      .style('opacity', 1);

    PULSE_CITIES.forEach((city, ci) => {
      const [cx, cy] = projection(city.coords);
      if (!cx || !cy) return;

      const mg = markerG
        .append('g')
        .attr('transform', `translate(${cx},${cy})`);

      // Two expanding rings
      [0, 1].forEach((ri) => {
        mg.append('circle')
          .attr('r', 4)
          .attr('fill', 'none')
          .attr('stroke', '#ef4444')
          .attr('stroke-width', 1.5)
          .attr('opacity', 1)
          .attr('class', `pulse-ring-${ci}-${ri}`)
          .call((sel) => animateRing(sel, ri));
      });

      // Center dot
      mg.append('circle')
        .attr('r', 4)
        .attr('fill', '#ef4444')
        .attr('filter', 'url(#glow)');

      // City label
      mg.append('text')
        .attr('x', 7)
        .attr('y', -6)
        .attr('fill', '#f8fafc')
        .attr('font-size', '9px')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-weight', '600')
        .text(city.name);
    });

    // ── Legend (bottom-left) ────────────────────────────────────────────────────
    const leg = svg.append('g').attr('transform', `translate(16, ${height - 90})`);

    leg
      .append('rect')
      .attr('width', 160)
      .attr('height', 12)
      .attr('rx', 4)
      .attr('fill', 'url(#legendGrad)')
      .attr('stroke', 'rgba(0,240,255,0.15)')
      .attr('stroke-width', 0.5);

    ['Low Risk', 'Medium', 'Critical'].forEach((lbl, i) => {
      leg
        .append('text')
        .attr('x', i * 68)
        .attr('y', 26)
        .attr('fill', '#94a3b8')
        .attr('font-size', '9px')
        .attr('font-family', 'Inter, sans-serif')
        .text(lbl);
    });

    const stats = [
      '847 Active Investigations',
      '₹2,847 Cr at Risk',
      '23 Inter-State Networks',
    ];
    stats.forEach((s, i) => {
      leg
        .append('text')
        .attr('x', 0)
        .attr('y', 44 + i * 14)
        .attr('fill', '#64748b')
        .attr('font-size', '9px')
        .attr('font-family', 'Inter, sans-serif')
        .text(`• ${s}`);
    });

    setReady(true);

    // Resize handler
    const onResize = () => {
      if (wrapper) {
        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;
        svg.attr('width', w).attr('height', h);
      }
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [geoData, stateScoreMap]);

  // ── Ring animation helper (JS-driven since CSS @keyframes can't target SVG radius easily) ──
  function animateRing(sel, delay) {
    const node = sel.node();
    if (!node) return;

    function pulse() {
      d3.select(node)
        .attr('r', 4)
        .attr('opacity', 1)
        .transition()
        .delay(delay * 1000)
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('r', 22)
        .attr('opacity', 0)
        .on('end', pulse);
    }
    pulse();
  }

  // ── Zoom to state (sidebar click) ────────────────────────────────────────────
  const zoomToState = (stateName) => {
    if (!geoData || !svgRef.current || !zoomRef.current) return;
    setHighlightState(stateName);

    const wrapper = wrapperRef.current;
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    const projection = d3
      .geoMercator()
      .fitSize([width - 20, height - 60], geoData);
    const pathGen = d3.geoPath().projection(projection);

    const feat = geoData.features.find(
      (f) =>
        (f.properties.NAME_1 ||
          f.properties.ST_NM ||
          f.properties.name) === stateName
    );
    if (!feat) return;

    const [[x0, y0], [x1, y1]] = pathGen.bounds(feat);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const cx = (x0 + x1) / 2 + 10;
    const cy = (y0 + y1) / 2 + 10;
    const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
    const tx = width / 2 - scale * cx;
    const ty = height / 2 - scale * cy;

    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(tx, ty).scale(scale)
      );
  };

  // ── Re-color paths when filter changes (without full redraw) ─────────────────
  useEffect(() => {
    if (!geoData || !svgRef.current || Object.keys(stateScoreMap).length === 0)
      return;
    const colorScale = buildColorScale();
    d3.select(svgRef.current)
      .selectAll('path.state')
      .transition()
      .duration(600)
      .attr('fill', (d) => {
        const name =
          d.properties.NAME_1 ||
          d.properties.ST_NM ||
          d.properties.name ||
          '';
        return colorScale(stateScoreMap[name] ?? 35);
      });
  }, [stateScoreMap]);

  // ── Score color helper ────────────────────────────────────────────────────────
  const scoreColor = (s) =>
    s >= 80 ? '#ef4444' : s >= 65 ? '#f97316' : '#eab308';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'transparent',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ── Page header ── */}
      <div style={{ marginBottom: '16px' }}>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: '700',
            background: 'linear-gradient(90deg, #00f0ff, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
          }}
        >
          National Fraud Intelligence Heatmap
        </h1>
        <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>
          District-level fraud signal aggregation across 28 states •{' '}
          <span style={{ color: '#22d3ee' }}>Live RBI data sync</span>
        </p>
      </div>

      {/* ── Filter controls ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'all', label: 'All Fraud' },
          { key: 'upi', label: 'UPI / Digital' },
          { key: 'aml', label: 'AML / Layering' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '7px 18px',
              borderRadius: '20px',
              border: `1px solid ${filter === key ? '#00f0ff' : 'rgba(255,255,255,0.1)'}`,
              background:
                filter === key
                  ? 'rgba(0,240,255,0.12)'
                  : 'rgba(255,255,255,0.04)',
              color: filter === key ? '#00f0ff' : '#94a3b8',
              fontWeight: filter === key ? '600' : '400',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* ── Map area ── */}
        <div
          ref={wrapperRef}
          style={{
            flex: 1,
            position: 'relative',
            background:
              'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(12,20,38,0.95) 100%)',
            border: '1px solid rgba(0,240,255,0.12)',
            borderRadius: '16px',
            overflow: 'hidden',
            minHeight: '460px',
          }}
        >
          {/* Loading shimmer */}
          {!ready && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid rgba(0,240,255,0.1)',
                  borderTop: '3px solid #00f0ff',
                  borderRadius: '50%',
                  animation: 'hm-spin 1s linear infinite',
                }}
              />
              <span style={{ color: '#64748b', fontSize: '13px' }}>
                Loading India GeoJSON…
              </span>
            </div>
          )}

          <svg
            ref={svgRef}
            style={{ display: 'block', width: '100%', height: '100%' }}
          />

          {/* ── Tooltip ── */}
          {tooltip && (
            <div
              style={{
                position: 'absolute',
                left: tooltip.x + 16,
                top: tooltip.y - 10,
                pointerEvents: 'none',
                background: 'rgba(15,23,42,0.97)',
                border: '1px solid rgba(0,240,255,0.3)',
                borderRadius: '12px',
                padding: '12px 14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                minWidth: '200px',
                maxWidth: '240px',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#f8fafc',
                  marginBottom: '8px',
                }}
              >
                {tooltip.name}
              </div>

              {/* Score bar */}
              <div style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#94a3b8',
                    marginBottom: '4px',
                  }}
                >
                  <span>Fraud Score</span>
                  <span style={{ color: scoreColor(tooltip.score), fontWeight: '700' }}>
                    {tooltip.score}/100
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    borderRadius: '3px',
                    background: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${tooltip.score}%`,
                      borderRadius: '3px',
                      background: scoreColor(tooltip.score),
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Active Cases</span>
                  <span style={{ color: '#f8fafc', fontWeight: '600' }}>
                    {tooltip.score * 23}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Top Fraud Type</span>
                  <span style={{ color: '#a855f7', fontWeight: '600', maxWidth: '100px', textAlign: 'right' }}>
                    {FRAUD_TYPES[tooltip.idx % 5]}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Most Wanted</span>
                  <span style={{ color: '#f97316', fontWeight: '600', maxWidth: '110px', textAlign: 'right', fontSize: '11px' }}>
                    {WANTED_ENTITIES[tooltip.idx % 5]}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Top 5 sidebar ── */}
        <div
          style={{
            width: '220px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(0,240,255,0.12)',
              borderRadius: '14px',
              padding: '14px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#64748b',
                marginBottom: '12px',
                fontWeight: '600',
              }}
            >
              🔥 Top Risk States
            </div>
            {TOP5.map((s, i) => (
              <div
                key={s.name}
                onClick={() => zoomToState(s.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 8px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background:
                    highlightState === s.name
                      ? 'rgba(0,240,255,0.08)'
                      : 'transparent',
                  border:
                    highlightState === s.name
                      ? '1px solid rgba(0,240,255,0.2)'
                      : '1px solid transparent',
                  transition: 'all 0.2s',
                  marginBottom: '4px',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    highlightState === s.name
                      ? 'rgba(0,240,255,0.08)'
                      : 'transparent')
                }
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#64748b',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#f8fafc',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {s.name}
                  </div>
                  <div style={{ fontSize: '11px', color: scoreColor(s.score) }}>
                    Score: {s.score}
                  </div>
                </div>
                <span style={{ fontSize: '14px' }}>{s.emoji}</span>
              </div>
            ))}
          </div>

          {/* Stats mini-panel */}
          <div
            style={{
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(0,240,255,0.12)',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {[
              { label: 'Active Investigations', value: '847', color: '#ef4444' },
              { label: '₹ at Risk', value: '₹2,847 Cr', color: '#f97316' },
              { label: 'Inter-State Networks', value: '23', color: '#a855f7' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyframes injected globally once */}
      <style>{`
        @keyframes hm-spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 700px) {
          .heatmap-layout { flex-direction: column !important; }
          .heatmap-sidebar { width: 100% !important; flex-direction: row !important; flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}
