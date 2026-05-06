import React from 'react';
import { motion } from 'motion/react';
import { 
  Map, 
  Search, 
  ShieldAlert, 
  TrendingUp, 
  Save, 
  LayoutDashboard 
} from 'lucide-react';

const FEATURES = [
  {
    icon: Map,
    title: "Interactive WebGL Maps",
    desc: "Navigate Cape Town's spatial layers smoothly with 3D terrain and dynamic vector tile rendering",
  },
  {
    icon: Search,
    title: "AI OSINT Verification",
    desc: "Automated verification of locations and metadata utilizing AI-driven spatial validation",
  },
  {
    icon: LayoutDashboard,
    title: "Tenant Workspaces",
    desc: "Secure, isolated environments for organisations with fine-grained RBAC and custom data",
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    desc: "Understand spatial patterns and trends with charting and temporal analysis tools",
  },
  {
    icon: ShieldAlert,
    title: "Bit-Level Encryption",
    desc: "Impersonation controls, custom tokens, and Zero-Trust architecture integrated throughout",
  },
  {
    icon: Save,
    title: "State Management",
    desc: "Seamlessly save drawing layers, custom geometries, annotations, and layer preferences",
  }
];

export const FeatureCards = () => {
  return (
    <section className="py-32 px-6 relative z-10 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div className="mb-20 text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 font-display">
            The power of <span className="text-slate-500">Cape Town's data.</span>
          </h2>
          <p className="text-lg text-slate-400 font-light">
            A comprehensive suite of spatial tools designed for speed, accuracy, and professional spatial intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white/5 border border-white/10 p-10 rounded-2xl backdrop-blur-sm group transition-all hover:bg-white/10 hover:shadow-2xl shadow-xl focus-within:ring-2 focus-within:ring-cyan-400"
              tabIndex={0}
            >
              <div className="text-cyan-400 mb-6 group-hover:text-cyan-300 transition-colors">
                <feature.icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-white/80 leading-relaxed font-light text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
