import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width, height;
    
    // Config
    const particleCount = 120;
    const particles = [];
    const maxDistanceBase = 120;
    const mouseRadius = 150;
    
    let isSuspiciousMode = false;
    
    const mouse = {
      x: null,
      y: null
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.baseRadius = Math.random() * 2 + 1;
        this.radius = this.baseRadius;
        // Default Neon Blue/Green variations
        this.defaultColor = Math.random() > 0.5 ? [0, 240, 255] : [0, 255, 128];
        this.currentColor = [...this.defaultColor];
      }

      update() {
        // Handle Suspicious Mode Dynamics
        const speedMultiplier = isSuspiciousMode ? 2.5 : 1.0;
        const targetColor = isSuspiciousMode ? [255, 50, 50] : this.defaultColor;

        // Transition Colors Smoothly
        for (let i = 0; i < 3; i++) {
          this.currentColor[i] += (targetColor[i] - this.currentColor[i]) * 0.05;
        }

        this.x += this.vx * speedMultiplier;
        this.y += this.vy * speedMultiplier;

        // Edge bounce
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distSq = dx * dx + dy * dy;
          
          if (distSq < mouseRadius * mouseRadius) {
            // Push away slightly or jiggle to make it feel alive
            const force = (mouseRadius - Math.sqrt(distSq)) / mouseRadius;
            this.x -= dx * force * 0.03;
            this.y -= dy * force * 0.03;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const [r, g, b] = this.currentColor;
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fill();
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
      }
    }

    const init = () => {
      resize();
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const maxDistSquare = isSuspiciousMode ? 220 * 220 : maxDistanceBase * maxDistanceBase;

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistSquare) {
            const distance = Math.sqrt(distSq);
            const opacity = 1 - (distance / (isSuspiciousMode ? 220 : maxDistanceBase));
            const [r, g, b] = particles[i].currentColor;
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Draw lines to mouse
      if (mouse.x != null && mouse.y != null) {
        for (let i = 0; i < particles.length; i++) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSquare) {
            const distance = Math.sqrt(distSq);
            const opacity = 1 - (distance / (isSuspiciousMode ? 220 : maxDistanceBase));
            const [r, g, b] = particles[i].currentColor;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.8})`;
            ctx.lineWidth = 1.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      // Check if hovering over a suspicious element
      const target = e.target;
      if (target && target.closest) {
        const suspiciousEl = target.closest('[data-suspicious="true"]');
        isSuspiciousMode = !!suspiciousEl;
      }
    };
    
    const handleMouseOut = () => {
      mouse.x = null;
      mouse.y = null;
      isSuspiciousMode = false;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'transparent' 
      }}
    />
  );
};

export default ParticleBackground;
