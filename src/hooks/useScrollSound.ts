import { useRef } from 'react';
import { useScroll, useMotionValueEvent } from 'motion/react';

export const useScrollSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const { scrollY } = useScroll();

  const playTick = (frequency = 800, volume = 0.05, duration = 0.02) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors during scroll
    }
  };

  const lastScrollY = useRef(0);
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = Math.abs(latest - lastScrollY.current);
    if (delta > 50) { // Play sound every 50px of scroll
      playTick(600, 0.03, 0.015);
      lastScrollY.current = latest;
    }
  });

  return { playTick };
};
