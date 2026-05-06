"use client";
import React from 'react';
import { motion, MotionValue } from 'motion/react';
import { Search, Layers, PenTool, BarChart2, BookmarkPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlyoutPanelsProps {
  cardY: MotionValue<string>;
  cardOpacity: MotionValue<number>;
}

const PANELS = [
  { icon: Search, title: "Search Places", desc: "Find addresses, suburbs, and landmarks", color: "text-indigo-400" },
  { icon: Layers, title: "Switch Layers", desc: "Toggle transport, land use, facilities, risk", color: "text-rose-400" },
  { icon: PenTool, title: "Draw and Measure", desc: "Sketch polygons and measure distances", color: "text-emerald-400" },
  { icon: BarChart2, title: "Analyse Patterns", desc: "Run spatial queries on visible data", color: "text-amber-400" },
  { icon: BookmarkPlus, title: "Save Views", desc: "Store and share map states", color: "text-cyan-400" },
];

export const FlyoutPanels: React.FC<FlyoutPanelsProps> = ({ cardY, cardOpacity }) => {
  return (
    <div className="absolute inset-x-0 bottom-4 md:bottom-24 z-30 flex flex-col md:flex-row items-stretch justify-center gap-4 px-4 pointer-events-none perspective-1000">
      {PANELS.map((panel, i) => (
        <motion.div
          key={panel.title}
          style={{ y: cardY, opacity: cardOpacity }}
          className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-5 flex-1 max-w-sm shrink-0 pointer-events-auto group hover:-translate-y-2 transition-transform duration-300"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 * i, duration: 0.5 }}
        >
          <div className={cn("w-10 h-10 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-center mb-4 shadow-xl", panel.color)}>
            <panel.icon className="w-5 h-5" />
          </div>
          <h3 className="text-white font-bold tracking-tight mb-2 text-sm">{panel.title}</h3>
          <p className="text-white/70 text-xs leading-relaxed font-light">{panel.desc}</p>
        </motion.div>
      ))}
    </div>
  );
};
