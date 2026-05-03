import React from 'react';
import { motion } from 'motion/react';
import { 
  Bus, 
  Building2,
  Briefcase, 
  ShieldAlert,
  Droplets, 
  Map as MapIcon
} from 'lucide-react';

const USE_CASES = [
  { icon: Bus, label: "Transport" },
  { icon: Building2, label: "Public Facilities" },
  { icon: Briefcase, label: "Land Use" },
  { icon: ShieldAlert, label: "Environmental Risk" },
  { icon: Droplets, label: "Water Systems" },
  { icon: MapIcon, label: "Municipal Boundaries" },
];

export const SpatialStorySection = () => {
  return (
    <section className="py-32 px-6 relative z-10 bg-transparent pointer-events-none">
      <div className="max-w-7xl mx-auto flex flex-col items-center pointer-events-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-8 max-w-4xl"
        >
          From the City Bowl to the Cape Flats, from False Bay to the Winelands — explore local data in its geographic context.
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mt-8"
        >
          {USE_CASES.map((item) => (
            <div
              key={item.label}
              className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-colors backdrop-blur-md"
            >
              <item.icon className="w-5 h-5 text-cyan-400" strokeWidth={1.5} />
              <span className="text-sm font-semibold text-white/80 tracking-wide">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
