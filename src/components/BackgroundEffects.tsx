import React, { useEffect, useRef } from 'react';
import { EffectType } from '../types';

interface BackgroundEffectsProps {
  effect: EffectType;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ effect }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (effect === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Snow Simulation Setup
    interface Flake {
      x: number;
      y: number;
      r: number;
      d: number; // density / weight
      speedY: number;
      swing: number;
      swingSpeed: number;
      alpha: number;
    }

    const flakes: Flake[] = [];
    const flakeCount = Math.min(90, Math.floor(width / 15));
    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.8 + 1,
        d: Math.random() * flakeCount,
        speedY: Math.random() * 1.4 + 0.6,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.008,
        alpha: Math.random() * 0.5 + 0.35
      });
    }

    // Rain Simulation Setup
    interface Drop {
      x: number;
      y: number;
      len: number;
      speedY: number;
      slant: number;
      alpha: number;
      thickness: number;
    }

    interface Splash {
      x: number;
      y: number;
      r: number;
      maxR: number;
      alpha: number;
    }

    const drops: Drop[] = [];
    const splashes: Splash[] = [];
    const dropCount = Math.min(130, Math.floor(width / 10));

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * (width + 100) - 50,
        y: Math.random() * height,
        len: Math.random() * 16 + 10,
        speedY: Math.random() * 10 + 14,
        slant: -2.2,
        alpha: Math.random() * 0.35 + 0.25,
        thickness: Math.random() * 0.6 + 0.9
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (effect === 'snow') {
        angle += 0.01;
        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i];
          f.swing += f.swingSpeed;
          f.y += f.speedY;
          f.x += Math.sin(f.swing) * 0.8 + 0.2; // subtle wind drift

          // Wrap boundaries
          if (f.y > height) {
            f.y = -5;
            f.x = Math.random() * width;
          }
          if (f.x > width) {
            f.x = 0;
          } else if (f.x < 0) {
            f.x = width;
          }

          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, false);
          ctx.fillStyle = `rgba(240, 246, 255, ${f.alpha})`;
          ctx.shadowBlur = f.r > 2 ? 4 : 0;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      } else if (effect === 'rain') {
        ctx.strokeStyle = 'rgba(165, 220, 255, 0.45)';
        ctx.lineCap = 'round';

        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          ctx.lineWidth = d.thickness;
          ctx.strokeStyle = `rgba(186, 230, 253, ${d.alpha})`;

          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.slant, d.y + d.len);
          ctx.stroke();

          d.y += d.speedY;
          d.x += d.slant * 0.8;

          // Splash ripple on bottom hit
          if (d.y > height - 10) {
            if (Math.random() < 0.25 && splashes.length < 20) {
              splashes.push({
                x: d.x,
                y: height - Math.random() * 8,
                r: 1,
                maxR: Math.random() * 5 + 3,
                alpha: 0.6
              });
            }
            d.y = -d.len - Math.random() * 20;
            d.x = Math.random() * (width + 100) - 50;
          }
        }

        // Draw and update splashes
        for (let s = splashes.length - 1; s >= 0; s--) {
          const splash = splashes[s];
          ctx.beginPath();
          ctx.ellipse(splash.x, splash.y, splash.r * 1.8, splash.r * 0.6, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(186, 230, 253, ${splash.alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          splash.r += 0.5;
          splash.alpha -= 0.04;
          if (splash.alpha <= 0 || splash.r >= splash.maxR) {
            splashes.splice(s, 1);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effect]);

  if (effect === 'none') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 w-full h-full"
      style={{ opacity: 0.85 }}
    />
  );
};
