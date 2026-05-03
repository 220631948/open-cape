import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Link } from 'react-router';
import { Search, MapPin, LayoutDashboard } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 overflow-hidden pointer-events-none">
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center text-center pointer-events-auto mt-16 md:mt-0">
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 leading-[0.9]"
        >
          Explore Cape Town and the Western Cape <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-slate-500">
            through intelligent maps.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl lg:text-2xl text-white/80 mb-12 max-w-3xl leading-relaxed mx-auto"
        >
          Search places, switch on layers, analyse patterns, and turn local spatial data into clear decisions.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg"
        >
          <Button asChild size="lg" className="w-full sm:w-auto px-6 py-6 text-lg rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_40px_-10px_rgba(34,211,238,0.5)] font-semibold transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400">
            <Link to="/app/map">
              Launch Map
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto px-6 py-6 text-lg rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition-transform hover:scale-105 backdrop-blur-xl text-white focus-visible:ring-2 focus-visible:ring-cyan-400">
            <Link to="/sources">
              Explore Layers
            </Link>
          </Button>
        </motion.div>

        {/* Floating Mockups */}
        <div className="relative mt-20 w-full max-w-4xl h-48 md:h-64 pointer-events-none hidden sm:block">
          {/* Search bar mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute left-1/2 -translate-x-1/2 top-4 w-full max-w-lg bg-white/10 border border-white/10 backdrop-blur-xl rounded-full p-2 shadow-2xl flex items-center gap-3"
            aria-hidden="true"
          >
            <div className="bg-white/5 rounded-full p-3 text-white/60">
              <Search className="w-5 h-5" />
            </div>
            <div className="text-white/60 text-sm font-medium">Search address or place...</div>
          </motion.div>

          {/* Coordinate label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-8 left-12 bg-white/10 border border-white/10 text-[10px] text-white/80 rounded-full px-3 py-1 font-mono tracking-widest uppercase shadow-xl"
            aria-hidden="true"
          >
            33.9249° S, 18.4241° E
          </motion.div>

          {/* Layer Chips */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute top-12 right-12 flex flex-col gap-2"
            aria-hidden="true"
          >
            <div className="bg-white/10 border border-white/10 text-[10px] text-white/80 rounded-full px-3 py-1 uppercase tracking-widest shadow-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" /> Land Use
            </div>
            <div className="bg-white/10 border border-white/10 text-[10px] text-white/80 rounded-full px-3 py-1 uppercase tracking-widest shadow-xl flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400" /> Risk Layers
            </div>
          </motion.div>

          {/* Map Pin Label */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="absolute bottom-16 right-1/4 flex flex-col items-center"
            aria-hidden="true"
          >
            <div className="text-[10px] uppercase tracking-widest font-bold text-white bg-slate-900/80 px-2 py-1 rounded shadow-lg border border-white/10 mb-2">
              Cape Town
            </div>
            <MapPin className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          </motion.div>

          {/* Small floating insight card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="absolute top-24 left-1/4 bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-2xl w-48 text-left"
            aria-hidden="true"
          >
             <div className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold mb-2 flex items-center justify-between">
               <span>Demo</span>
               <LayoutDashboard className="w-3 h-3" />
             </div>
             <div className="text-2xl font-bold text-white mb-1">2,845</div>
             <div className="text-white/60 text-xs">Total facilities identified in current viewport</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
