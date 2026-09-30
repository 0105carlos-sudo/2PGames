import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import './Background.css';

/* Natural drifting particle field.
   Three depth layers ride slow layered sine currents with soft twinkle.
   Positions are pure functions of time (no integration), so the flow
   never clumps and wraps seamlessly at the edges. */

const LAYERS = [
  { n: 30, rMin: 0.6, rMax: 1.5, vx: 0.016, vy: -0.02, sway: 16, glow: 0.5 },
  { n: 22, rMin: 1.0, rMax: 2.3, vx: 0.03, vy: -0.038, sway: 26, glow: 0.7 },
  { n: 12, rMin: 1.7, rMax: 3.0, vx: 0.045, vy: -0.06, sway: 38, glow: 0.9 },
];
const MARGIN = 48;

export default function Background() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dark = theme === 'dark';

    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dots = [];
    LAYERS.forEach((L) => {
      for (let i = 0; i < L.n; i++) {
        dots.push({
          L,
          fx: Math.random(),
          fy: Math.random(),
          r: L.rMin + Math.random() * (L.rMax - L.rMin),
          seed: Math.random() * Math.PI * 2,
          seed2: Math.random() * Math.PI * 2,
          ws: 0.00012 + Math.random() * 0.0002,
          tw: 0.0004 + Math.random() * 0.0009,
          accent: Math.random() < 0.2,
        });
      }
    });

    const wrap = (v, s) => ((v % s) + s) % s;

    const draw = (t) => {
      const spanX = w + MARGIN * 2;
      const spanY = h + MARGIN * 2;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const x =
          wrap(
            d.fx * spanX + t * d.L.vx + Math.sin(t * d.ws + d.seed) * d.L.sway,
            spanX,
          ) - MARGIN;
        const y =
          wrap(
            d.fy * spanY + t * d.L.vy + Math.cos(t * d.ws * 1.3 + d.seed2) * d.L.sway * 0.7,
            spanY,
          ) - MARGIN;
        const tw = 0.55 + 0.45 * Math.sin(t * d.tw + d.seed2);
        const a = d.L.glow * tw;
        if (d.accent) {
          ctx.fillStyle = dark
            ? `rgba(41,151,255,${0.16 * a})`
            : `rgba(0,113,227,${0.1 * a})`;
          ctx.beginPath();
          ctx.arc(x, y, d.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = dark
            ? `rgba(140,200,255,${0.5 * a})`
            : `rgba(0,113,227,${0.32 * a})`;
        } else {
          ctx.fillStyle = dark
            ? `rgba(255,255,255,${0.14 * a})`
            : `rgba(25,25,35,${0.09 * a})`;
        }
        ctx.beginPath();
        ctx.arc(x, y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (reduced) {
      draw(2000);
      return () => window.removeEventListener('resize', resize);
    }

    const step = (t) => {
      raf = requestAnimationFrame(step);
      if (document.hidden) return;
      draw(t);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="bg-particles" aria-hidden="true" />;
}
