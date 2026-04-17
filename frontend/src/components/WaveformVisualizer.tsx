"use client";

import { useRef, useEffect } from "react";

interface WaveformVisualizerProps {
  audioData?: Float32Array | null;
  isLive?: boolean;
  color?: string;
  height?: number;
  className?: string;
}

export default function WaveformVisualizer({
  audioData,
  isLive = false,
  color = "#8b5cf6",
  height = 80,
  className = "",
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      if (!audioData || audioData.length === 0) {
        // Draw idle waveform
        ctx.beginPath();
        ctx.strokeStyle = `${color}33`;
        ctx.lineWidth = 1.5;
        const mid = h / 2;
        ctx.moveTo(0, mid);
        for (let x = 0; x < w; x++) {
          const y = mid + Math.sin(x * 0.03 + Date.now() * 0.001) * 3;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (isLive) animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const data = audioData;
      const step = Math.ceil(data.length / w);
      const mid = h / 2;
      const amp = mid * 0.85;

      // Draw filled waveform
      ctx.beginPath();
      ctx.moveTo(0, mid);
      for (let x = 0; x < w; x++) {
        const idx = Math.floor(x * step);
        let sum = 0;
        for (let j = 0; j < step && idx + j < data.length; j++) {
          sum += Math.abs(data[idx + j]);
        }
        const avg = sum / step;
        ctx.lineTo(x, mid - avg * amp);
      }
      for (let x = w - 1; x >= 0; x--) {
        const idx = Math.floor(x * step);
        let sum = 0;
        for (let j = 0; j < step && idx + j < data.length; j++) {
          sum += Math.abs(data[idx + j]);
        }
        const avg = sum / step;
        ctx.lineTo(x, mid + avg * amp);
      }
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, `${color}44`);
      gradient.addColorStop(0.5, `${color}88`);
      gradient.addColorStop(1, `${color}44`);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw center line
      ctx.beginPath();
      ctx.strokeStyle = `${color}cc`;
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, mid);
      for (let x = 0; x < w; x++) {
        const idx = Math.floor(x * step);
        let sum = 0;
        for (let j = 0; j < step && idx + j < data.length; j++) {
          sum += data[idx + j];
        }
        const avg = sum / step;
        ctx.lineTo(x, mid + avg * amp * 0.5);
      }
      ctx.stroke();

      if (isLive) animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioData, color, height, isLive]);

  return (
    <canvas
      ref={canvasRef}
      className={`waveform-canvas ${className}`}
      style={{ height: `${height}px` }}
    />
  );
}
