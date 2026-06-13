import { useEffect, useRef, useState, useCallback } from 'react';
import './index.css';

/* ═══════════════════════════════════════════════════════════
   CYBORG X — Landing Page
   ═══════════════════════════════════════════════════════════ */

// ── Circuit Canvas Background ───────────────────────────────
function CircuitCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];
    let lines = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      particles = [];
      lines = [];
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.5,
          o: Math.random() * 0.5 + 0.1,
        });
      }
      // Circuit lines
      for (let i = 0; i < 12; i++) {
        const segs = [];
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        for (let j = 0; j < Math.floor(Math.random() * 4 + 2); j++) {
          const horiz = Math.random() > 0.5;
          const len = Math.random() * 200 + 50;
          segs.push({ x1: x, y1: y, x2: horiz ? x + len : x, y2: horiz ? y : y + len });
          x = segs[segs.length - 1].x2;
          y = segs[segs.length - 1].y2;
        }
        lines.push({ segs, opacity: Math.random() * 0.12 + 0.03 });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw circuit lines
      lines.forEach(l => {
        ctx.strokeStyle = `rgba(0, 240, 255, ${l.opacity})`;
        ctx.lineWidth = 1;
        l.segs.forEach(s => {
          ctx.beginPath();
          ctx.moveTo(s.x1, s.y1);
          ctx.lineTo(s.x2, s.y2);
          ctx.stroke();
        });
      });

      // Draw & connect particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${p.o})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} id="circuit-canvas" />;
}

// ── Scroll Reveal Hook ──────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

// ── Animated Counter ────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        let start = 0;
        const dur = 2000;
        const step = ts => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / dur, 1);
          setVal(Math.floor(p * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Typing Effect ───────────────────────────────────────────
function TypingText({ texts }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[idx];
    let timer;
    if (!deleting && displayed.length < current.length) {
      timer = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === current.length) {
      timer = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((idx + 1) % texts.length);
    }
    return () => clearTimeout(timer);
  }, [displayed, deleting, idx, texts]);

  return <span className="typing-text">{displayed}</span>;
}

// ── SVG Icons ───────────────────────────────────────────────
const Icons = {
  brain: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 2a7 7 0 0 0-5.6 11.2A5.5 5.5 0 0 0 5 18.5 3.5 3.5 0 0 0 8.5 22h7a3.5 3.5 0 0 0 3.5-3.5 5.5 5.5 0 0 0-1.4-5.3A7 7 0 0 0 12 2Z" />
      <path d="M12 2v20M8 6h8M7 10h10M8 14h8M9 18h6" strokeOpacity=".5" />
    </svg>
  ),
  eye: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M2.06 12a10.94 10.94 0 0 1 19.88 0 10.94 10.94 0 0 1-19.88 0Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  shield: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 2l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V6l7-4Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  cpu: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="8" y="8" width="8" height="8" rx="1" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
    </svg>
  ),
  zap: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  ),
  dna: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M2 2a12 12 0 0 0 20 0M2 22a12 12 0 0 1 20 0M7 7h10M7 17h10M12 2v20" />
    </svg>
  ),
  link: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66l1.5-1.5" />
    </svg>
  ),
  heart: (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  check: '✓',
  menu: null,
  x: null,
  github: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.2.6.1.82-.26.82-.57v-2.2c-3.34.71-4.04-1.42-4.04-1.42-.55-1.36-1.34-1.72-1.34-1.72-1.09-.73.08-.72.08-.72 1.21.08 1.85 1.22 1.85 1.22 1.07 1.81 2.81 1.29 3.5.98.1-.76.42-1.29.76-1.58-2.67-.3-5.47-1.3-5.47-5.8 0-1.28.47-2.33 1.23-3.15-.12-.3-.53-1.49.12-3.1 0 0 1-.32 3.3 1.2a11.5 11.5 0 0 1 6.02 0c2.28-1.52 3.29-1.2 3.29-1.2.66 1.61.25 2.8.12 3.1.77.82 1.23 1.87 1.23 3.15 0 4.52-2.81 5.5-5.49 5.79.43.37.82 1.1.82 2.22v3.29c0 .32.22.68.83.57A12.29 12.29 0 0 0 24 12.29C24 5.78 18.63.5 12 .5Z"/></svg>
  ),
  twitter: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  ),
  discord: (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M20.32 4.37A19.8 19.8 0 0 0 15.39 3c-.22.39-.47.92-.64 1.33a18.42 18.42 0 0 0-5.5 0A13.5 13.5 0 0 0 8.6 3a19.7 19.7 0 0 0-4.94 1.37C.53 9.1-.33 13.7.1 18.23A19.9 19.9 0 0 0 6.18 21c.48-.65.91-1.34 1.28-2.07-.7-.27-1.38-.59-2.02-.97.17-.12.34-.25.5-.38a14.18 14.18 0 0 0 12.12 0c.16.13.33.26.5.38-.65.38-1.32.7-2.03.97.37.73.8 1.42 1.28 2.07a19.85 19.85 0 0 0 6.08-2.77c.51-5.3-.87-9.87-3.57-13.86ZM8.01 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.2 0 2.18 1.09 2.16 2.42 0 1.34-.96 2.42-2.16 2.42Zm7.98 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.2 0 2.18 1.09 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Z"/></svg>
  ),
};

// ── Feature Data ────────────────────────────────────────────
const features = [
  { icon: Icons.brain, title: 'Neural Interface', desc: 'Direct brain-to-machine communication via sub-dermal neural mesh, enabling thought-speed data processing and cognitive enhancement beyond biological limits.' },
  { icon: Icons.eye, title: 'Optic Enhancement', desc: 'Multi-spectrum cybernetic vision with real-time HUD overlay, threat detection, thermal imaging, and zoom magnification up to 120x.' },
  { icon: Icons.shield, title: 'Bio-Shield Matrix', desc: 'Adaptive nano-armor that self-repairs and evolves against threats. Electromagnetic pulse protection and toxin neutralization built-in.' },
  { icon: Icons.cpu, title: 'Quantum Core', desc: 'Embedded quantum processing unit delivering 10 exaflops of computing power for real-time tactical analysis and predictive modeling.' },
  { icon: Icons.zap, title: 'Power Synthesis', desc: 'Self-sustaining fusion micro-reactor with kinetic energy recovery. 72 hours of peak operation on a single charge cycle.' },
  { icon: Icons.dna, title: 'Gene Sync Protocol', desc: 'Proprietary bio-integration technology that bonds cybernetic components at the DNA level, eliminating rejection and enabling organic growth.' },
];

const techCards = [
  { icon: Icons.cpu, title: 'Neuro-Adaptive AI', desc: 'Machine learning that adapts to your neural patterns, creating a symbiotic relationship between human intuition and machine precision.' },
  { icon: Icons.link, title: 'Mesh Network', desc: 'Peer-to-peer encrypted communication between augmented operatives. Zero-latency data sharing across global neural mesh.' },
  { icon: Icons.heart, title: 'Bio-Harmony Engine', desc: 'Continuous health monitoring with autonomous medical response. Nanotechnology repairs tissue damage in real-time.' },
  { icon: Icons.zap, title: 'Reflex Amplifier', desc: 'Sensory processing boosted 400%. React before threats materialize with predictive movement algorithms and muscular micro-actuators.' },
];

const testimonials = [
  { quote: 'The Neural Interface changed everything. I process data at speeds I never thought possible. It\'s like having a supercomputer inside my mind.', name: 'Dr. Elena Voss', role: 'Neuro-Scientist', initials: 'EV' },
  { quote: 'Bio-Shield Matrix saved my life twice in the field. The self-repair capability is nothing short of miraculous. Essential for any operative.', name: 'Commander Rex Holt', role: 'Spec Ops Lead', initials: 'RH' },
  { quote: 'Optic Enhancement gave me sight beyond anything I imagined. I can analyze molecular structures with my bare eyes. Revolutionary.', name: 'Dr. Aisha Khan', role: 'Augmentation Researcher', initials: 'AK' },
  { quote: 'Gene Sync Protocol — zero rejection, total integration. My augmentations feel like they were born with me. Absolute game changer.', name: 'Marcus Chen', role: 'First Gen Cyborg', initials: 'MC' },
  { quote: 'The Quantum Core processes battlefield data faster than any external system. Strategic dominance redefined through cybernetic superiority.', name: 'General Sato', role: 'Strategic Command', initials: 'GS' },
  { quote: 'Power Synthesis means I never worry about running out of energy. 72 hours non-stop with full augmentation output. Incredible.', name: 'Zara Okafor', role: 'Field Engineer', initials: 'ZO' },
];

// ── Main App ────────────────────────────────────────────────
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <CircuitCanvas />

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <a href="#" className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            CYBORG<span> X</span>
          </a>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#features" onClick={() => scrollTo('features')}>Features</a></li>
            <li><a href="#about" onClick={() => scrollTo('about')}>About</a></li>
            <li><a href="#technology" onClick={() => scrollTo('technology')}>Technology</a></li>
            <li><a href="#contact" onClick={() => scrollTo('contact')}>Contact</a></li>
            <li><a href="#contact" className="nav-cta" onClick={() => scrollTo('contact')}>Get Access</a></li>
          </ul>
          <button className={`mobile-toggle ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero-bg-gradient" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="pulse-dot" />
              System Online — v4.2.0
            </div>
            <h1>
              THE NEXT<br />
              <span className="gradient-text">EVOLUTION</span><br />
              <span className="glow-text glitch-text" data-text="IS HERE">IS HERE</span>
            </h1>
            <p className="hero-description">
              Transcend biological limitations. CYBORG X delivers military-grade cybernetic augmentation
              with seamless neural integration, quantum processing, and self-sustaining power systems.
            </p>
            <div style={{ marginBottom: 20 }}>
              <TypingText texts={[
                '> Initializing neural handshake...',
                '> Bio-signature verified.',
                '> Augmentation modules: ONLINE',
                '> Welcome, Operator.',
              ]} />
            </div>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => scrollTo('contact')}>
                Begin Augmentation {Icons.arrow}
              </button>
              <button className="btn btn-outline" onClick={() => scrollTo('features')}>
                Explore Systems
              </button>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-image-glow" />
            <div className="hero-image-ring" />
            <img src="/cyborg_hero.png" alt="CYBORG X — Advanced Cybernetic Augmentation" />
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-mouse" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────── */}
      <section className="stats-bar">
        <div className="container">
          <div className="stat-item">
            <div className="stat-number"><AnimatedNumber target={2847} suffix="+" /></div>
            <div className="stat-label">Active Operatives</div>
          </div>
          <div className="stat-item">
            <div className="stat-number"><AnimatedNumber target={99} suffix="%" /></div>
            <div className="stat-label">Integration Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number"><AnimatedNumber target={147} /></div>
            <div className="stat-label">Countries Deployed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number"><AnimatedNumber target={10} suffix="x" /></div>
            <div className="stat-label">Exaflop Processing</div>
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────── */}
      <section className="section features" id="features">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">// Augmentation Systems</span>
            <h2 className="section-title">Engineered Beyond<br /><span style={{ color: 'var(--cyan-primary)' }}>Human Limits</span></h2>
            <p className="section-subtitle">
              Six core augmentation modules designed for seamless biological integration.
              Each system pushes the boundary of what's possible.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className={`feature-card hud-corners reveal reveal-delay-${i % 3 + 1}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Showcase / About ───────────────────────────── */}
      <section className="section showcase" id="about">
        <div className="container">
          <div className="showcase-grid">
            <div className="showcase-image reveal">
              <img src="/cyborg_eye.png" alt="Cybernetic Optic Enhancement" />
              <div className="showcase-image-overlay" />
              <div className="showcase-image-border" />
            </div>
            <div className="showcase-content reveal reveal-delay-2">
              <span className="section-label">// About Cyborg X</span>
              <h2>Where Biology Meets <span className="highlight">Machine Perfection</span></h2>
              <p>
                CYBORG X represents a decade of classified research in bio-mechanical fusion.
                Our augmentations don't just enhance — they evolve with you, creating a
                symbiotic bond between flesh and circuitry that redefines human potential.
              </p>
              <ul className="showcase-features">
                <li><span className="check-icon">{Icons.check}</span> Zero-rejection bio-integration</li>
                <li><span className="check-icon">{Icons.check}</span> Self-evolving neural pathways</li>
                <li><span className="check-icon">{Icons.check}</span> Military-grade encryption</li>
                <li><span className="check-icon">{Icons.check}</span> Autonomous medical response</li>
                <li><span className="check-icon">{Icons.check}</span> Lifetime system upgrades</li>
              </ul>
              <button className="btn btn-primary" onClick={() => scrollTo('technology')}>
                Learn More {Icons.arrow}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Showcase 2 (Reversed) ──────────────────────── */}
      <section className="section showcase">
        <div className="container">
          <div className="showcase-grid" style={{ direction: 'rtl' }}>
            <div className="showcase-image reveal" style={{ direction: 'ltr' }}>
              <img src="/cyborg_arm.png" alt="Cybernetic Arm Enhancement" />
              <div className="showcase-image-overlay" />
              <div className="showcase-image-border" />
            </div>
            <div className="showcase-content reveal reveal-delay-2" style={{ direction: 'ltr' }}>
              <span className="section-label">// Precision Engineering</span>
              <h2>Strength Forged in <span className="highlight">Titanium & Code</span></h2>
              <p>
                Every servo, every actuator, every neural receptor is handcrafted from
                aerospace-grade materials. Our prosthetic augmentations deliver 12x the
                strength of organic muscle with sub-millimeter precision and haptic feedback
                indistinguishable from natural sensation.
              </p>
              <ul className="showcase-features">
                <li><span className="check-icon">{Icons.check}</span> Haptic sensory feedback</li>
                <li><span className="check-icon">{Icons.check}</span> 12x organic strength ratio</li>
                <li><span className="check-icon">{Icons.check}</span> Self-calibrating servos</li>
                <li><span className="check-icon">{Icons.check}</span> Modular upgrade slots</li>
              </ul>
              <button className="btn btn-outline" onClick={() => scrollTo('contact')}>
                Request Demo {Icons.arrow}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Technology Section ─────────────────────────── */}
      <section className="section tech-section" id="technology">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">// Core Technology</span>
            <h2 className="section-title">Powered by the<br /><span style={{ color: 'var(--purple-accent)' }}>Impossible</span></h2>
            <p className="section-subtitle">
              Breakthrough technologies that make CYBORG X the most advanced augmentation
              platform ever created.
            </p>
          </div>
          <div className="tech-grid">
            {techCards.map((t, i) => (
              <div key={i} className={`tech-card reveal reveal-delay-${i % 4 + 1}`}>
                <div className="tech-card-icon">{t.icon}</div>
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────── */}
      <section className="section testimonials" id="testimonials">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">// Field Reports</span>
            <h2 className="section-title">From Those Who<br /><span style={{ color: 'var(--cyan-primary)' }}>Transcended</span></h2>
          </div>
        </div>
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div className="testimonials-track">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="testimonial-card">
                <p className="testimonial-quote">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────── */}
      <section className="section cta-section" id="contact">
        <div className="container">
          <div className="cta-box reveal">
            <span className="section-label">// Begin Your Evolution</span>
            <h2>Ready to Become<br /><span style={{ color: 'var(--cyan-primary)' }}>More Than Human?</span></h2>
            <p>
              Join the elite ranks of augmented operatives.
              Your transformation starts with a single decision.
            </p>
            <div className="cta-actions">
              <button className="btn btn-primary">
                Apply for Augmentation {Icons.arrow}
              </button>
              <button className="btn btn-outline">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="nav-logo">CYBORG<span> X</span></a>
              <p>Redefining the boundaries of human capability through advanced cybernetic augmentation technology.</p>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features">Augmentations</a></li>
                <li><a href="#technology">Technology</a></li>
                <li><a href="#">Research</a></li>
                <li><a href="#">Documentation</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
                <li><a href="#">Partners</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 CYBORG X INDUSTRIES. ALL RIGHTS RESERVED.</p>
            <div className="footer-socials">
              <a href="#" aria-label="GitHub">{Icons.github}</a>
              <a href="#" aria-label="Twitter / X">{Icons.twitter}</a>
              <a href="#" aria-label="Discord">{Icons.discord}</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
