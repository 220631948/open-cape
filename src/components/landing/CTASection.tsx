import React from 'react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Link } from 'react-router';

export const CTASection = () => {
  return (
    <section className="py-40 px-6 relative z-10 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-16"
        >
          Start exploring the Western Cape spatially.
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Button asChild size="lg" className="w-full sm:w-auto px-10 py-6 text-xl rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400 border-0">
            <Link to="/app/map">
               Launch Map
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto px-10 py-6 text-xl rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition-transform hover:scale-105 text-white focus-visible:ring-2 focus-visible:ring-cyan-400">
            <Link to="/sources">
               View Demo Layers
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

