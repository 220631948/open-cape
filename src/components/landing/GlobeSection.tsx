import { InteractiveGlobe } from "./InteractiveGlobe";
import { motion } from "motion/react";
import { Compass } from "lucide-react";

export const GlobeSection = () => {
  return (
    <section className="py-32 px-6 relative z-10 pointer-events-none">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 pointer-events-auto">
        <div className="flex-1 w-full max-w-xl mx-auto">
          <InteractiveGlobe />
        </div>
        
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] font-mono mb-6">
              <Compass className="w-3.5 h-3.5" />
              <span>Global Context</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 font-display">
              Navigate the <span className="text-slate-500">World.</span>
            </h2>
            
            <p className="text-xl text-slate-400 mb-8 leading-relaxed font-light">
              Explore our comprehensive coverage map, centered around our operational hub in the Western Cape. Interact with the globe to view real-time data nodes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
               <div className="flex items-center gap-3 bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <div className="text-left">
                   <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">Primary Node</div>
                   <div className="text-sm font-bold text-white">Cape Town HQ</div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
